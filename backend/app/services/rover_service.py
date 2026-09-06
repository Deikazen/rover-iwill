import asyncio
import time
import logging
from typing import Optional, Set, Dict, Any
import websockets
from websockets.exceptions import ConnectionClosed

logger = logging.getLogger("rover_service")
logger.setLevel(logging.INFO)

class RoverService:
    def __init__(self):
        self.ip: str = "192.168.1.132"
        self.port: int = 81
        self.ws = None
        self.connected: bool = False
        self.connecting: bool = False
        self.error: Optional[str] = None
        
        # Rover state mirroring ESP32
        self.current_action: str = "STOP"
        self.speed_bts: int = 150       # Default max PWM BTS
        self.target_speed: int = 0
        self.driving_forward: bool = True
        self.rpm: int = 0
        
        self.last_msg_sent_time: float = 0.0
        self.last_telemetry_time: float = 0.0
        
        # Async tasks
        self._receive_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        
        # Connected web clients (Frontend WebSockets)
        self._client_websockets: Set[Any] = set()

    def get_status(self) -> Dict[str, Any]:
        telemetry_age = (
            round(time.time() - self.last_telemetry_time, 2)
            if self.last_telemetry_time > 0
            else None
        )
        return {
            "connected": self.connected,
            "connecting": self.connecting,
            "ip": self.ip,
            "port": self.port,
            "current_action": self.current_action,
            "speed_bts": self.speed_bts,
            "target_speed": self.target_speed,
            "driving_forward": self.driving_forward,
            "rpm": self.rpm,
            "telemetry_age_seconds": telemetry_age,
            "error": self.error,
            "max_pwm": 150,
            "min_pwm": 80,
            "failsafe_timeout_ms": 2000,
        }

    async def register_client(self, websocket):
        self._client_websockets.add(websocket)
        # Send current status immediately
        try:
            await websocket.send_json({"type": "status", "data": self.get_status()})
        except Exception:
            pass

    def unregister_client(self, websocket):
        self._client_websockets.discard(websocket)

    async def broadcast_status(self):
        if not self._client_websockets:
            return
        status_data = {"type": "status", "data": self.get_status()}
        disconnected_clients = set()
        for ws in self._client_websockets:
            try:
                await ws.send_json(status_data)
            except Exception:
                disconnected_clients.add(ws)
        self._client_websockets.difference_update(disconnected_clients)

    async def connect(self, ip: Optional[str] = None, port: Optional[int] = None) -> Dict[str, Any]:
        if ip:
            self.ip = ip
        if port:
            self.port = port
            
        if self.connected and self.ws:
            # Already connected to the same address
            return {"success": True, "message": f"Already connected to ws://{self.ip}:{self.port}", "status": self.get_status()}

        await self.disconnect()
        
        self.connecting = True
        self.error = None
        await self.broadcast_status()
        
        uri = f"ws://{self.ip}:{self.port}"
        logger.info(f"Connecting to ESP32 at {uri}...")
        
        try:
            # Connect with a 3-second handshake timeout
            self.ws = await websockets.connect(
                uri,
                open_timeout=3.0,
                ping_interval=None,
                ping_timeout=None
            )
            self.connected = True
            self.connecting = False
            self.error = None
            self.last_msg_sent_time = time.time()
            
            # Start background tasks
            self._receive_task = asyncio.create_task(self._receive_loop())
            self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
            
            # Send initial stop command to align states
            await self.send_command("x")
            
            await self.broadcast_status()
            logger.info(f"Connected successfully to ESP32 at {uri}")
            return {"success": True, "message": f"Terhubung ke ESP32 di {uri}", "status": self.get_status()}
            
        except Exception as e:
            self.connected = False
            self.connecting = False
            self.error = str(e)
            await self.broadcast_status()
            logger.error(f"Failed to connect to ESP32: {e}")
            return {"success": False, "message": f"Gagal terhubung ke ESP32 ({uri}): {str(e)}", "status": self.get_status()}

    async def disconnect(self) -> Dict[str, Any]:
        if self.ws:
            try:
                # Stop motor before closing
                await self.ws.send("x")
            except Exception:
                pass
                
            try:
                await self.ws.close()
            except Exception:
                pass
                
        self.ws = None
        self.connected = False
        self.connecting = False
        self.current_action = "STOP"
        self.target_speed = 0
        
        if self._receive_task and not self._receive_task.done():
            self._receive_task.cancel()
        if self._heartbeat_task and not self._heartbeat_task.done():
            self._heartbeat_task.cancel()
            
        self._receive_task = None
        self._heartbeat_task = None
        
        await self.broadcast_status()
        return {"success": True, "message": "Terputus dari ESP32", "status": self.get_status()}

    async def send_command(self, cmd: str) -> Dict[str, Any]:
        if not self.connected or not self.ws:
            return {"success": False, "message": "ESP32 belum terhubung", "status": self.get_status()}
            
        try:
            await self.ws.send(cmd)
            self.last_msg_sent_time = time.time()
            
            # Update state based on command matching Arduino logic
            char_cmd = cmd[0] if len(cmd) > 0 else ''
            
            if char_cmd in ('F', 'B'):
                steer_pos = -1
                if 'a' in cmd[1:]:
                    steer_pos = cmd.find('a')
                elif 'd' in cmd[1:]:
                    steer_pos = cmd.find('d')
                    
                steer_index = steer_pos if steer_pos > 0 else len(cmd)
                val_str = cmd[1:steer_index]
                val = int(val_str) if val_str.isdigit() else self.speed_bts
                
                self.target_speed = min(val, 150)
                self.driving_forward = (char_cmd == 'F')
                self.current_action = "MAJU" if self.driving_forward else "MUNDUR"
                if steer_pos > 0:
                    steer_char = cmd[steer_pos]
                    self.current_action += " & " + ("KIRI" if steer_char == 'a' else "KANAN")
            elif char_cmd == 'v':
                val_str = cmd[1:]
                if val_str.isdigit():
                    val = int(val_str)
                    if 0 <= val <= 255:
                        self.speed_bts = min(val, 150)
            elif char_cmd == 'w':
                self.driving_forward = True
                self.target_speed = min(self.speed_bts, 150)
                self.current_action = "MAJU"
            elif char_cmd == 's':
                self.driving_forward = False
                self.target_speed = min(self.speed_bts, 150)
                self.current_action = "MUNDUR"
            elif char_cmd == 'a':
                self.current_action = "KIRI"
            elif char_cmd == 'd':
                self.current_action = "KANAN"
            elif char_cmd == 'L':
                self.current_action = "PULSE KIRI"
            elif char_cmd == 'R':
                self.current_action = "PULSE KANAN"
            elif char_cmd == 'c':
                self.current_action = "LURUS (CENTER)"
            elif char_cmd == 'x':
                self.target_speed = 0
                self.current_action = "STOP"
            elif char_cmd == 'h':
                # Heartbeat command, don't change action
                pass

            await self.broadcast_status()
            return {"success": True, "command": cmd, "status": self.get_status()}
            
        except ConnectionClosed:
            self.connected = False
            self.error = "Koneksi ke ESP32 terputus"
            await self.broadcast_status()
            return {"success": False, "message": "Koneksi ke ESP32 terputus", "status": self.get_status()}
        except Exception as e:
            self.error = str(e)
            await self.broadcast_status()
            return {"success": False, "message": f"Gagal mengirim perintah: {str(e)}", "status": self.get_status()}

    async def _receive_loop(self):
        try:
            while self.connected and self.ws:
                msg = await self.ws.recv()
                if isinstance(msg, bytes):
                    msg = msg.decode('utf-8', errors='ignore')
                    
                if msg.startswith('r'):
                    # RPM broadcast from ESP32 e.g. "r1600"
                    rpm_str = msg[1:].strip()
                    if rpm_str.lstrip('-').isdigit():
                        self.rpm = int(rpm_str)
                        self.last_telemetry_time = time.time()
                        await self.broadcast_status()
                else:
                    logger.info(f"Received message from ESP32: {msg}")
        except asyncio.CancelledError:
            pass
        except ConnectionClosed:
            logger.warning("ESP32 WebSocket connection closed")
            self.connected = False
            self.error = "ESP32 disconnected"
            await self.broadcast_status()
        except Exception as e:
            logger.error(f"Error in receive loop: {e}")
            self.connected = False
            self.error = str(e)
            await self.broadcast_status()

    async def _heartbeat_loop(self):
        """
        Sends heartbeat 'h' every 800ms to keep ESP32 failsafe alive.
        ESP32 has FAILSAFE_TIMEOUT = 2000ms.
        """
        try:
            while self.connected and self.ws:
                await asyncio.sleep(0.8)
                now = time.time()
                # If no command has been sent in the last 700ms, send 'h'
                if now - self.last_msg_sent_time >= 0.7:
                    try:
                        await self.ws.send('h')
                        self.last_msg_sent_time = now
                    except Exception:
                        break
        except asyncio.CancelledError:
            pass

rover_service = RoverService()
