from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.rover_service import rover_service

rover_router = APIRouter()

class ConnectRequest(BaseModel):
    ip: str = Field(default="192.168.1.132", description="IP address of ESP32 WebSocket Server")
    port: int = Field(default=81, description="Port of ESP32 WebSocket Server")

class CommandRequest(BaseModel):
    command: str = Field(..., description="Raw command string e.g. 'w', 's', 'a', 'd', 'x', 'c', 'L', 'R', 'F100', 'B80'")

class DriveRequest(BaseModel):
    direction: str = Field(default="F", description="'F' for forward or 'B' for backward")
    speed: int = Field(default=100, ge=0, le=150, description="Speed BTS (0-150)")
    steer: Optional[str] = Field(default=None, description="Optional steering: 'a' for left, 'd' for right")

class SpeedRequest(BaseModel):
    speed: int = Field(default=150, ge=0, le=150, description="Speed PWM BTS (0-150)")

@rover_router.get("/status")
def get_rover_status():
    """Mengambil status koneksi dan telemetri ESP32 saat ini"""
    return rover_service.get_status()

@rover_router.post("/connect")
async def connect_rover(payload: ConnectRequest):
    """Menghubungkan backend ke WebSocket Server ESP32"""
    result = await rover_service.connect(ip=payload.ip, port=payload.port)
    return result

@rover_router.post("/disconnect")
async def disconnect_rover():
    """Memutuskan koneksi dari ESP32"""
    result = await rover_service.disconnect()
    return result

@rover_router.post("/command")
async def send_command(payload: CommandRequest):
    """Mengirim perintah karakter/string ke ESP32"""
    result = await rover_service.send_command(payload.command)
    return result

@rover_router.post("/drive")
async def drive_rover(payload: DriveRequest):
    """
    Mengemudikan rover dengan kecepatan dan opsi belok (F/B + speed + a/d)
    Contoh: F100a (Maju speed 100 belok kiri)
    """
    direction = payload.direction.upper()
    if direction not in ("F", "B"):
        raise HTTPException(status_code=400, detail="Direction must be 'F' or 'B'")
    
    cmd = f"{direction}{payload.speed}"
    if payload.steer in ("a", "d"):
        cmd += payload.steer
        
    result = await rover_service.send_command(cmd)
    return result

@rover_router.post("/speed")
async def set_speed(payload: SpeedRequest):
    """Mengatur speed BTS default (v<val>)"""
    cmd = f"v{payload.speed}"
    result = await rover_service.send_command(cmd)
    return result

@rover_router.post("/emergency-stop")
async def emergency_stop():
    """Menghentikan seluruh motor rover secara instan (x)"""
    result = await rover_service.send_command("x")
    return result

@rover_router.websocket("/ws")
async def rover_websocket_endpoint(websocket: WebSocket):
    """
    Kanal WebSocket real-time antara Frontend Dashboard dan Backend.
    Menerima perintah langsung dari frontend dan menyiarkan status/RPM ESP32 secara real-time.
    """
    await websocket.accept()
    await rover_service.register_client(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if not data:
                continue
            # Data bisa berupa raw command string ("w", "x") atau JSON string
            if data.startswith("{") and data.endswith("}"):
                import json
                try:
                    payload = json.loads(data)
                    action = payload.get("action")
                    if action == "connect":
                        ip = payload.get("ip")
                        port = payload.get("port", 81)
                        await rover_service.connect(ip=ip, port=port)
                    elif action == "disconnect":
                        await rover_service.disconnect()
                    elif action == "command":
                        cmd = payload.get("command", "")
                        if cmd:
                            await rover_service.send_command(cmd)
                    elif action == "get_status":
                        await websocket.send_json({"type": "status", "data": rover_service.get_status()})
                except Exception:
                    pass
            else:
                # Raw command e.g. "w", "s", "a", "d", "x", "c", "L", "R"
                await rover_service.send_command(data.strip())
    except WebSocketDisconnect:
        rover_service.unregister_client(websocket)
    except Exception:
        rover_service.unregister_client(websocket)
