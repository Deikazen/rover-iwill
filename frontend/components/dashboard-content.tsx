"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PageIllustration from "@/components/page-illustration";

const RASPBERRY_PI_IP = "192.168.137.120"; // Ubah sesuai IP Pi Anda
const VIDEO_STREAM_URL = `http://${RASPBERRY_PI_IP}:5000/video1`;
const VIDEO_STREAM_URL2 = `http://${RASPBERRY_PI_IP}:5000/video2`;

export default function DashboardContent() {
  // State for system status and telemetry
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [driveMode, setDriveMode] = useState<"2WD" | "4WD">("4WD");
  const [gasLevel, setGasLevel] = useState<number>(65);
  const [remLevel, setRemLevel] = useState<number>(0);
  const [koplingLevel, setKoplingLevel] = useState<number>(0);
  const [steeringAngle, setSteeringAngle] = useState<number>(-8);
  const [speed, setSpeed] = useState<number>(12.4);
  const [ping, setPing] = useState<number>(23);
  const [fps, setFps] = useState<number>(30);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(24.2);
  const [cpuTemp, setCpuTemp] = useState<number>(42);
  const [currentTime, setCurrentTime] = useState<string>("15:42:18");

  // ESP32 Rover Backend Connection State
  const [backendUrl, setBackendUrl] = useState<string>("http://127.0.0.1:8000");
  const [esp32Ip, setEsp32Ip] = useState<string>("192.168.1.132");
  const [esp32Port, setEsp32Port] = useState<number>(81);
  const [isEspConnected, setIsEspConnected] = useState<boolean>(false);
  const [isEspConnecting, setIsEspConnecting] = useState<boolean>(false);
  const [espAction, setEspAction] = useState<string>("STOP");
  const [espTargetSpeed, setEspTargetSpeed] = useState<number>(0);
  const [espSpeedBts, setEspSpeedBts] = useState<number>(150);
  const [espRpm, setEspRpm] = useState<number>(0);
  const [espError, setEspError] = useState<string | null>(null);
  const [keyboardEnabled, setKeyboardEnabled] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Interactive Modals & Toasts
  const [isResynced, setIsResynced] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // Radar Animation sweep angle
  const [radarAngle, setRadarAngle] = useState<number>(45);

  // Logs list
  const [logs, setLogs] = useState([
    { time: "15:42:12", message: "Kamera depan terhubung", type: "info" },
    { time: "15:42:14", message: "Kamera belakang terhubung", type: "info" },
    { time: "15:42:16", message: "Sinyal GPS stabil", type: "success" },
    { time: "15:42:18", message: "Scanner LIDAR siap", type: "success" },
    { time: "15:42:25", message: "Kemudi ke kiri", type: "action" },
    { time: "15:42:27", message: "Kemudi ke kanan", type: "action" },
    { time: "15:42:30", message: "Misi dimulai", type: "highlight" },
    { time: "15:42:35", message: "Mendeteksi halangan 3m", type: "warning" },
  ]);

  // Connect to Backend WebSocket for Real-time ESP32 Control and Telemetry
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const connectBackendWs = () => {
      try {
        const wsUrl = backendUrl.replace(/^http/, "ws") + "/rover/ws";
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("Connected to Rover Backend WebSocket");
          ws?.send(JSON.stringify({ action: "get_status" }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "status" && msg.data) {
              const d = msg.data;
              setIsEspConnected(Boolean(d.connected));
              setIsEspConnecting(Boolean(d.connecting));
              if (d.current_action) setEspAction(d.current_action);
              if (typeof d.target_speed === "number")
                setEspTargetSpeed(d.target_speed);
              if (typeof d.speed_bts === "number") setEspSpeedBts(d.speed_bts);
              if (typeof d.rpm === "number") setEspRpm(d.rpm);
              if (d.ip) setEsp32Ip(d.ip);
              if (d.port) setEsp32Port(d.port);
              if (d.error) setEspError(d.error);
              else setEspError(null);
            }
          } catch (err) {
            console.error("Error parsing backend ws msg", err);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connectBackendWs, 3000);
          }
        };

        ws.onerror = (err) => {
          console.warn("Rover Backend WS error", err);
        };
      } catch (e) {
        console.error("Failed to initialize Rover Backend WS", e);
        if (isMounted) {
          reconnectTimeout = setTimeout(connectBackendWs, 3000);
        }
      }
    };

    connectBackendWs();

    // Periodic status poll as fallback
    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/rover/status`);
        if (res.ok) {
          const d = await res.json();
          setIsEspConnected(Boolean(d.connected));
          setIsEspConnecting(Boolean(d.connecting));
          if (d.current_action) setEspAction(d.current_action);
          if (typeof d.target_speed === "number")
            setEspTargetSpeed(d.target_speed);
          if (typeof d.speed_bts === "number") setEspSpeedBts(d.speed_bts);
          if (typeof d.rpm === "number") setEspRpm(d.rpm);
        }
      } catch {
        // Backend not currently reachable
      }
    }, 2500);

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(statusInterval);
      if (ws) ws.close();
    };
  }, [backendUrl]);

  // Command dispatcher function to Backend
  const sendRoverCommand = async (cmd: string, label?: string) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "command", command: cmd }));
      } else {
        await fetch(`${backendUrl}/rover/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd }),
        });
      }

      setLogs((prev) => [
        {
          time: timeStr,
          message: `ESP32 CMD: ${cmd} (${label || cmd})`,
          type: "action",
        },
        ...prev.slice(0, 30),
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        {
          time: timeStr,
          message: `Gagal kirim CMD ${cmd}: ${e?.message || "Error"}`,
          type: "warning",
        },
        ...prev.slice(0, 30),
      ]);
    }
  };

  // Connect to ESP32 via Backend
  const handleConnectEsp32 = async () => {
    setIsEspConnecting(true);
    setEspError(null);
    const timeStr = new Date().toTimeString().split(" ")[0];
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ action: "connect", ip: esp32Ip, port: esp32Port }),
        );
      } else {
        const res = await fetch(`${backendUrl}/rover/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: esp32Ip, port: esp32Port }),
        });
        const data = await res.json();
        if (!data.success) {
          setEspError(data.message || "Gagal terhubung");
        }
      }
      setLogs((prev) => [
        {
          time: timeStr,
          message: `Menghubungkan ke ESP32 (${esp32Ip}:${esp32Port})...`,
          type: "info",
        },
        ...prev.slice(0, 30),
      ]);
    } catch (err: any) {
      setEspError(err?.message || "Gagal menghubungkan ke backend");
      setIsEspConnecting(false);
    }
  };

  // Disconnect from ESP32 via Backend
  const handleDisconnectEsp32 = async () => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "disconnect" }));
      } else {
        await fetch(`${backendUrl}/rover/disconnect`, { method: "POST" });
      }
      setIsEspConnected(false);
      setEspAction("STOP");
      setLogs((prev) => [
        {
          time: timeStr,
          message: `Terputus dari ESP32`,
          type: "warning",
        },
        ...prev.slice(0, 30),
      ]);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Emergency Stop Handler
  const handleEmergencyStop = () => {
    sendRoverCommand("x", "EMERGENCY STOP");
    setRemLevel(100);
    setGasLevel(0);
    setEspAction("STOP");
    setEspTargetSpeed(0);
    setTimeout(() => setRemLevel(0), 1200);
  };

  // Steer Handlers with ESP32 commands
  const handleSteerWithCommand = (delta: number) => {
    handleSteer(delta);
    if (delta < 0) {
      sendRoverCommand("L", "PULSE KIRI");
    } else if (delta > 0) {
      sendRoverCommand("R", "PULSE KANAN");
    }
  };

  const handleSteerResetWithCommand = () => {
    setSteeringAngle(0);
    sendRoverCommand("c", "KEMUDI PUSAT (LURUS)");
    const timeStr = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      {
        time: timeStr,
        message: `Kemudi di-reset ke 0° (tengah)`,
        type: "action",
      },
      ...prev,
    ]);
  };

  // Keyboard Drive Controller Hook
  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (e.repeat) return;

      switch (key) {
        case "w":
        case "arrowup":
          e.preventDefault();
          setActiveKey("W");
          sendRoverCommand("w", "MAJU");
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          setActiveKey("S");
          sendRoverCommand("s", "MUNDUR");
          break;
        case "a":
        case "arrowleft":
          e.preventDefault();
          setActiveKey("A");
          sendRoverCommand("a", "KIRI");
          handleSteer(-5);
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          setActiveKey("D");
          sendRoverCommand("d", "KANAN");
          handleSteer(5);
          break;
        case "c":
          e.preventDefault();
          setActiveKey("C");
          handleSteerResetWithCommand();
          break;
        case "q":
          e.preventDefault();
          setActiveKey("Q");
          sendRoverCommand("L", "PULSE KIRI");
          handleSteer(-5);
          break;
        case "e":
          e.preventDefault();
          setActiveKey("E");
          sendRoverCommand("R", "PULSE KANAN");
          handleSteer(5);
          break;
        case "x":
        case " ":
          e.preventDefault();
          setActiveKey("X");
          handleEmergencyStop();
          break;
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyboardEnabled, backendUrl]);

  // Live real-time clock & telemetry simulation effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setCurrentTime(timeStr);

      // Radar continuous rotation
      setRadarAngle((prev) => (prev + 4) % 360);

      // Subtle fluctuation in ping & telemetry for realism
      if (!isTerminated) {
        setPing(20 + Math.floor(Math.random() * 7));
        setFps(29 + Math.floor(Math.random() * 3));
        setSpeed((prev) =>
          parseFloat(
            (12 + (gasLevel / 100) * 8 + (Math.random() * 0.4 - 0.2)).toFixed(
              1,
            ),
          ),
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTerminated, gasLevel]);

  // Resync trigger action
  const handleResync = () => {
    setIsResynced(true);
    const timeStr = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [
      {
        time: timeStr,
        message: "Kanal telemetri berhasil di-resinkronisasi",
        type: "success",
      },
      ...prev,
    ]);
    setTimeout(() => setIsResynced(false), 2500);
  };

  // Steer adjustment
  const handleSteer = (delta: number) => {
    const newAngle = Math.min(45, Math.max(-45, steeringAngle + delta));
    setSteeringAngle(newAngle);
    const timeStr = new Date().toTimeString().split(" ")[0];
    const direction = delta < 0 ? "kiri" : delta > 0 ? "kanan" : "tengah";
    setLogs((prev) => [
      {
        time: timeStr,
        message: `Kemudi diatur ke ${newAngle}° (${direction})`,
        type: "action",
      },
      ...prev,
    ]);
  };

  // Pedal change
  const handleGasChange = (val: number) => {
    setGasLevel(val);
    setSpeed(parseFloat((val * 0.22).toFixed(1)));
    const btsSpeed = Math.round((val / 100) * 150);
    setEspSpeedBts(btsSpeed);
    sendRoverCommand(`v${btsSpeed}`, `KECEPATAN ${btsSpeed} PWM`);
  };

  // Sensort Status Items
  const sensorList = [
    {
      id: "cam_front",
      name: "KAMERA DEPAN",
      status: isTerminated ? "OFFLINE" : "OK",
      ok: !isTerminated,
      icon: "📹",
    },
    {
      id: "cam_rear",
      name: "KAMERA BELAKANG",
      status: isTerminated ? "OFFLINE" : "OK",
      ok: !isTerminated,
      icon: "🎥",
    },
    {
      id: "lidar",
      name: "LIDAR",
      status: isTerminated ? "OFFLINE" : "OK",
      ok: !isTerminated,
      icon: "📡",
    },
    {
      id: "gps",
      name: "GPS",
      status: isTerminated ? "OFFLINE" : "OK",
      ok: !isTerminated,
      icon: "📍",
    },
    {
      id: "esp32",
      name: "ESP32 CORE",
      status: isTerminated ? "ERROR" : isEspConnected ? "CONNECTED" : "OFFLINE",
      ok: !isTerminated && isEspConnected,
      icon: "🔳",
    },
    {
      id: "motor",
      name: "MOTOR DRIVER (BTS7960)",
      status: isTerminated ? "OFFLINE" : isEspConnected ? "ACTIVE" : "STANDBY",
      ok: !isTerminated && isEspConnected,
      icon: "⚡",
    },
  ];

  // Dark/Light Theme class helper
  const isDark = themeMode === "dark";
  const cardBgClass = isDark
    ? "bg-slate-900/90 border-slate-800 text-white shadow-xl shadow-black/20"
    : "bg-white/80 border-gray-200/80 text-gray-900 shadow-xs backdrop-blur-md";

  const textSubClass = isDark ? "text-slate-400" : "text-gray-500";
  const innerCardClass = isDark
    ? "bg-slate-950/80 border-slate-800/80"
    : "bg-gray-50/80 border-gray-200/60";

  return (
    <section
      className={`relative min-h-screen overflow-hidden pt-24 pb-16 transition-colors duration-300 md:pt-28 md:pb-24 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}
    >
      <PageIllustration />

      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6">
        {/* ========================================================================= */}
        {/* HEADER TELEMETRY BAR */}
        {/* ========================================================================= */}
        <div
          className={`mb-6 rounded-2xl border p-4 backdrop-blur-md transition-all ${cardBgClass}`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo & Connection Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5"></div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  isTerminated || !isEspConnected
                    ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isTerminated || !isEspConnected
                      ? "bg-red-500"
                      : "bg-emerald-500 animate-pulse"
                  }`}
                ></span>
                <span className="font-mono uppercase">
                  {isTerminated
                    ? "TERMINATED"
                    : isEspConnected
                      ? "CONNECTED"
                      : "DISCONNECTED"}
                </span>
              </div>
            </div>

            {/* Metrics Pills: IP, PING, FPS, TIME */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 shadow-2xs">
                <span className={textSubClass}>IP ESP32</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {esp32Ip}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 shadow-2xs">
                <span className={textSubClass}>PING</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {ping} ms
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 shadow-2xs">
                <span className={textSubClass}>FPS</span>
                <span className="font-bold text-amber-500">{fps}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 shadow-2xs">
                <span className={textSubClass}>TIME</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {currentTime}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Resync Button */}
              <button
                type="button"
                onClick={handleResync}
                disabled={isResynced}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer shadow-xs"
              >
                <svg
                  className={`h-3.5 w-3.5 ${isResynced ? "animate-spin text-amber-500" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isResynced ? "RESYNCING..." : "RESYNC CHANNEL"}</span>
              </button>

              {/* Terminate Button */}
              <button
                type="button"
                onClick={() => setShowTerminateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all cursor-pointer uppercase tracking-wider"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                <span>{isTerminated ? "RESTART" : "TERMINATE"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resync Toast Notification */}
        {isResynced && (
          <div className="mb-6 rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between animate-fade-in font-mono">
            <span>
              ⚡ Telemetry channel resynchronized with rover unit (0 dropouts
              detected).
            </span>
            <span className="font-bold">OK</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROW 1: KAMERA DEPAN | SCAN LIDAR (2D) | KAMERA BELAKANG */}
        {/* ========================================================================= */}
        <div className="mb-6 grid gap-5 md:grid-cols-3">
          {/* 1. KAMERA DEPAN */}
          <div
            className={`flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                <span>KAMERA DEPAN</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={VIDEO_STREAM_URL}
                alt="Live Camera Feed Stream"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback jika API belum hidup / disconnected
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/camera_front.jpg";
                }}
              />

              {/* HUD Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    CAM_01 [FRONT]
                  </span>
                  <span className="bg-black/60 backdrop-blur-xs text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    ● 1080P @ 30 FPS
                  </span>
                </div>

                {/* Reticle Target Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-60">
                  <div className="w-12 h-12 border border-emerald-400/80 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  </div>
                  <div className="absolute w-16 h-px bg-emerald-400/50"></div>
                  <div className="absolute h-16 w-px bg-emerald-400/50"></div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="bg-black/60 backdrop-blur-xs text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    PITCH: +2.4° | ROLL: -1.2°
                  </span>
                  <span className="bg-black/60 backdrop-blur-xs text-white/80 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    WIDE ANGLE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SCAN LIDAR (2D) */}
          <div
            className={`flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                <span>SCAN LIDAR (2D)</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                AKTIF
              </span>
            </div>

            {/* Radar Circle Visualizer */}
            <div
              className={`relative aspect-video w-full flex items-center justify-center overflow-hidden p-2 ${innerCardClass}`}
            >
              <div className="relative h-44 w-44 rounded-full border border-emerald-500/30 bg-slate-950 flex items-center justify-center shadow-inner shadow-emerald-500/10">
                {/* Concentric rings */}
                <div className="absolute h-36 w-36 rounded-full border border-dashed border-emerald-500/20"></div>
                <div className="absolute h-28 w-28 rounded-full border border-emerald-500/20"></div>
                <div className="absolute h-20 w-20 rounded-full border border-dashed border-emerald-500/20"></div>
                <div className="absolute h-12 w-12 rounded-full border border-emerald-500/25"></div>

                {/* Crosshair Axes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-emerald-500/20"></div>
                  <div className="h-full w-px bg-emerald-500/20"></div>
                </div>

                {/* Radial Distance Labels */}
                <span className="absolute top-1 text-[9px] font-mono text-emerald-500/80 font-bold">
                  N
                </span>
                <span className="absolute bottom-1 text-[9px] font-mono text-emerald-500/80 font-bold">
                  S
                </span>
                <span className="absolute left-1 text-[9px] font-mono text-emerald-500/80 font-bold">
                  W
                </span>
                <span className="absolute right-1 text-[9px] font-mono text-emerald-500/80 font-bold">
                  E
                </span>

                <span className="absolute top-7 right-3 text-[7px] font-mono text-slate-500">
                  5 m
                </span>
                <span className="absolute top-11 right-5 text-[7px] font-mono text-slate-500">
                  4 m
                </span>
                <span className="absolute top-14 right-7 text-[7px] font-mono text-slate-500">
                  3 m
                </span>
                <span className="absolute top-16 right-9 text-[7px] font-mono text-slate-500">
                  2 m
                </span>
                <span className="absolute top-18 right-11 text-[7px] font-mono text-slate-500">
                  1 m
                </span>

                {/* Center Rover Icon */}
                <div className="z-10 flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 text-[10px] font-bold text-slate-950 shadow-xs">
                  ((•))
                </div>

                {/* Rotating Scanner Sweep Line */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `rotate(${radarAngle}deg)` }}
                >
                  <div className="h-1/2 w-px bg-linear-to-t from-emerald-400 to-transparent origin-bottom self-start"></div>
                </div>

                {/* Obstacle Blips (Red, Yellow, Green dots) */}
                <div className="absolute top-8 right-10 h-2 w-2 rounded-full bg-red-500 shadow-xs shadow-red-500 animate-pulse"></div>
                <div className="absolute top-12 left-10 h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                <div className="absolute bottom-10 right-12 h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                <div className="absolute bottom-14 left-8 h-2 w-2 rounded-full bg-red-500 shadow-xs shadow-red-500"></div>
                <div className="absolute top-16 right-16 h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                <div className="absolute bottom-6 right-8 h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>
          </div>

          {/* 3. KAMERA BELAKANG */}
          <div
            className={`flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                <span>KAMERA BELAKANG</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={VIDEO_STREAM_URL2}
                alt="Live Camera Feed Stream"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback jika API belum hidup / disconnected
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/camera_front.jpg";
                }}
              />

              {/* HUD Parking Guideline Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    CAM_02 [REAR]
                  </span>
                  <span className="bg-black/60 backdrop-blur-xs text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    ● 1080P REVERSE
                  </span>
                </div>

                {/* Trajectory Guide Lines */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-20 opacity-40">
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <polygon
                      points="10,48 25,10 75,10 90,48"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <polygon
                      points="15,48 28,18 72,18 85,48"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="20,48 32,26 68,26 80,48"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-end">
                  <span className="bg-black/60 backdrop-blur-xs text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    REAR PROXIMITY: CLEAR
                  </span>
                  <span className="bg-black/60 backdrop-blur-xs text-white/80 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                    AUTO SENSOR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: KONTROL KENDALI | TELEMETRI | NAVIGASI GPS */}
        {/* ========================================================================= */}
        <div className="mb-6 grid gap-5 md:grid-cols-3">
          {/* 1. KONTROL KENDALI */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div>
              {/* Header Title and Connection Indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                    KONTROL KENDALI
                  </h2>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    ESP32
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                      isEspConnected
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isEspConnecting
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-500 animate-pulse"
                          : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isEspConnected
                          ? "bg-emerald-500 animate-pulse"
                          : isEspConnecting
                            ? "bg-amber-400"
                            : "bg-red-500"
                      }`}
                    ></span>
                    {isEspConnected
                      ? "TERHUBUNG"
                      : isEspConnecting
                        ? "MENGHUBUNGKAN..."
                        : "TERPUTUS"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    title="Pengaturan IP ESP32 & Backend"
                    className="p-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 transition-colors text-xs cursor-pointer"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              {/* IP Configuration Bar */}
              {showConfig && (
                <div className={`mb-3 rounded-xl border p-3 ${innerCardClass}`}>
                  <div className="text-[10px] font-bold font-mono uppercase mb-2 text-amber-500 flex justify-between items-center">
                    <span>KONFIGURASI BACKEND & ESP32</span>
                    <span className="text-slate-400 text-[9px] lowercase font-normal">
                      ws port: 81
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-1">
                        IP ESP32
                      </label>
                      <input
                        type="text"
                        value={esp32Ip}
                        onChange={(e) => setEsp32Ip(e.target.value)}
                        placeholder="192.168.1.132"
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-400 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-1">
                        BACKEND URL
                      </label>
                      <input
                        type="text"
                        value={backendUrl}
                        onChange={(e) => setBackendUrl(e.target.value)}
                        placeholder="http://127.0.0.1:8000"
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEspConnected ? (
                      <button
                        type="button"
                        onClick={handleConnectEsp32}
                        disabled={isEspConnecting}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isEspConnecting
                          ? "Menghubungkan..."
                          : "Hubungkan ke ESP32"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDisconnectEsp32}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Putuskan Koneksi
                      </button>
                    )}
                  </div>
                  {espError && (
                    <p className="mt-2 text-[10px] font-mono text-red-400">
                      ⚠️ {espError}
                    </p>
                  )}
                </div>
              )}

              {/* Status Telemetry Strip */}
              <div
                className={`mb-3 grid grid-cols-3 gap-2 rounded-xl border p-2 text-center font-mono ${innerCardClass}`}
              >
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase">
                    AKSI
                  </span>
                  <span
                    className={`text-[11px] font-black ${
                      espAction === "MAJU"
                        ? "text-emerald-400"
                        : espAction === "MUNDUR"
                          ? "text-amber-400"
                          : espAction.includes("KIRI") ||
                              espAction.includes("KANAN")
                            ? "text-blue-400"
                            : "text-red-400"
                    }`}
                  >
                    {espAction}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase">
                    BTS PWM
                  </span>
                  <span className="text-[11px] font-black text-amber-400">
                    {espTargetSpeed > 0 ? espTargetSpeed : espSpeedBts}{" "}
                    <span className="text-[8px] font-normal text-slate-400">
                      /150
                    </span>
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase">
                    RPM LIVE
                  </span>
                  <span className="text-[11px] font-black text-cyan-400">
                    {espRpm}{" "}
                    <span className="text-[8px] font-normal text-slate-400">
                      RPM
                    </span>
                  </span>
                </div>
              </div>

              {/* D-PAD / DIRECTIONAL DRIVE CONTROLLER */}
              <div className={`mb-3 rounded-xl border p-3 ${innerCardClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase font-mono ${textSubClass}`}
                  >
                    KEMUDI GERAK & ARAH
                  </span>
                  <button
                    type="button"
                    onClick={() => setKeyboardEnabled(!keyboardEnabled)}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                      keyboardEnabled
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-gray-200 dark:bg-slate-800 text-slate-500"
                    }`}
                    title="Aktifkan kontrol keyboard: W, A, S, D, Q, E, C, X, Spasi"
                  >
                    ⌨️ KEYBOARD: {keyboardEnabled ? "AKTIF" : "NONAKTIF"}
                  </button>
                </div>

                {/* D-Pad Buttons */}
                <div className="flex flex-col items-center gap-1.5 py-1">
                  {/* Forward (W) */}
                  <button
                    type="button"
                    onClick={() => sendRoverCommand("w", "MAJU")}
                    className={`w-28 py-2 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                      activeKey === "W" || espAction === "MAJU"
                        ? "bg-emerald-500 text-slate-950 scale-95 shadow-emerald-500/30"
                        : "bg-emerald-600/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    ▲ MAJU{" "}
                    <span className="text-[9px] opacity-75 font-normal">
                      (W)
                    </span>
                  </button>

                  {/* Middle row: KIRI (A), STOP (X), KANAN (D) */}
                  <div className="flex items-center gap-2">
                    {/* KIRI (A) */}
                    <button
                      type="button"
                      onClick={() => {
                        sendRoverCommand("a", "KIRI");
                        handleSteer(-5);
                      }}
                      className={`w-20 py-2 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                        activeKey === "A" || espAction.includes("KIRI")
                          ? "bg-blue-500 text-slate-950 scale-95"
                          : "bg-blue-600/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      ◀ KIRI{" "}
                      <span className="text-[9px] opacity-75 font-normal">
                        (A)
                      </span>
                    </button>

                    {/* STOP (X) */}
                    <button
                      type="button"
                      onClick={handleEmergencyStop}
                      className={`w-22 py-2.5 rounded-xl font-mono text-xs font-black flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                        activeKey === "X" || espAction === "STOP"
                          ? "bg-red-500 text-white scale-95 shadow-red-500/40"
                          : "bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40"
                      }`}
                    >
                      <span>🛑 STOP</span>
                      <span className="text-[8px] opacity-75 font-normal">
                        (X / Spasi)
                      </span>
                    </button>

                    {/* KANAN (D) */}
                    <button
                      type="button"
                      onClick={() => {
                        sendRoverCommand("d", "KANAN");
                        handleSteer(5);
                      }}
                      className={`w-20 py-2 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                        activeKey === "D" || espAction.includes("KANAN")
                          ? "bg-blue-500 text-slate-950 scale-95"
                          : "bg-blue-600/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      KANAN ▶{" "}
                      <span className="text-[9px] opacity-75 font-normal">
                        (D)
                      </span>
                    </button>
                  </div>

                  {/* Backward (S) */}
                  <button
                    type="button"
                    onClick={() => sendRoverCommand("s", "MUNDUR")}
                    className={`w-28 py-2 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                      activeKey === "S" || espAction === "MUNDUR"
                        ? "bg-amber-500 text-slate-950 scale-95 shadow-amber-500/30"
                        : "bg-amber-600/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    ▼ MUNDUR{" "}
                    <span className="text-[9px] opacity-75 font-normal">
                      (S)
                    </span>
                  </button>

                  {/* Steering helpers */}
                  <div className="flex gap-1.5 mt-2 w-full justify-center text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        sendRoverCommand("L", "PULSE KIRI");
                        handleSteer(-5);
                      }}
                      className={`flex-1 py-1 px-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-blue-500/20 text-blue-300 font-semibold transition-all cursor-pointer ${
                        activeKey === "Q" ? "bg-blue-500 text-slate-950" : ""
                      }`}
                      title="Pulse belok kiri 85ms burst (L)"
                    >
                      ↶ PULSE L (Q)
                    </button>
                    <button
                      type="button"
                      onClick={handleSteerResetWithCommand}
                      className={`flex-1 py-1 px-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-yellow-400/20 text-yellow-300 font-semibold transition-all cursor-pointer ${
                        activeKey === "C" ? "bg-yellow-400 text-slate-950" : ""
                      }`}
                      title="Kemudi lurus ke tengah (c)"
                    >
                      ◎ LURUS (C)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sendRoverCommand("R", "PULSE KANAN");
                        handleSteer(5);
                      }}
                      className={`flex-1 py-1 px-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-blue-500/20 text-blue-300 font-semibold transition-all cursor-pointer ${
                        activeKey === "E" ? "bg-blue-500 text-slate-950" : ""
                      }`}
                      title="Pulse belok kanan 85ms burst (R)"
                    >
                      PULSE R (E) ↷
                    </button>
                  </div>
                </div>
              </div>

              {/* Pedals & Steering Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Pedal Section */}
                <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                  <span
                    className={`block text-[10px] font-bold uppercase font-mono mb-2 text-center ${textSubClass}`}
                  >
                    PEDAL & GAS BTS
                  </span>

                  <div className="flex justify-around items-end h-28">
                    {/* Kopling */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-4 rounded-full bg-gray-200 dark:bg-slate-800 h-20 overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300 rounded-full"
                          style={{ height: `${koplingLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono font-semibold">
                        KOPLING
                      </span>
                      <span className="text-[9px] font-mono font-bold text-blue-500">
                        {koplingLevel}%
                      </span>
                    </div>

                    {/* Rem (Clickable) */}
                    <button
                      type="button"
                      onClick={handleEmergencyStop}
                      title="Tekan REM untuk berhenti darurat"
                      className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="relative w-4 rounded-full bg-gray-200 dark:bg-slate-800 h-20 overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full bg-red-500 transition-all duration-300 rounded-full"
                          style={{ height: `${remLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-red-400">
                        REM
                      </span>
                      <span className="text-[9px] font-mono font-bold text-red-500">
                        {remLevel}%
                      </span>
                    </button>

                    {/* Gas */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-4 rounded-full bg-gray-200 dark:bg-slate-800 h-20 overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full bg-yellow-400 transition-all duration-300 rounded-full"
                          style={{ height: `${gasLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono font-semibold">
                        GAS
                      </span>
                      <span className="text-[9px] font-mono font-bold text-amber-500">
                        {gasLevel}%
                      </span>
                    </div>
                  </div>

                  {/* Interactive Gas Slider mapped to PWM 0-150 */}
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gasLevel}
                      onChange={(e) => handleGasChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-0.5">
                      <span>0% (0 PWM)</span>
                      <span>100% (150 PWM)</span>
                    </div>
                  </div>
                </div>

                {/* Steering Wheel Gauge */}
                <div
                  className={`flex flex-col items-center justify-between rounded-xl border p-3 ${innerCardClass}`}
                >
                  <span
                    className={`block text-[10px] font-bold uppercase font-mono text-center ${textSubClass}`}
                  >
                    SETIR KEMUDI
                  </span>

                  <div className="relative my-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/40 bg-slate-950 shadow-inner">
                    {/* Rotating Indicator Needle */}
                    <div
                      className="absolute h-full w-full flex items-center justify-center transition-transform duration-300"
                      style={{ transform: `rotate(${steeringAngle}deg)` }}
                    >
                      <div className="h-8 w-1 rounded-full bg-amber-400 shadow-xs shadow-amber-400"></div>
                    </div>
                    {/* Center Display */}
                    <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-black text-amber-400">
                      {steeringAngle}°
                    </div>
                  </div>

                  <div className="flex gap-1 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => handleSteerWithCommand(-5)}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Belok kiri 5°"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={handleSteerResetWithCommand}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Kembalikan lurus ke tengah"
                    >
                      RESET
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSteerWithCommand(5)}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Belok kanan 5°"
                    >
                      ▶
                    </button>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    SUDUT: {steeringAngle}°
                  </span>
                </div>
              </div>

              {/* Mode Berkendara & Drivetrain */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Mode Select */}
                <div className={`rounded-xl border p-2.5 ${innerCardClass}`}>
                  <span
                    className={`block text-[10px] font-bold uppercase font-mono mb-2 ${textSubClass}`}
                  >
                    MODE BERKENDARA
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDriveMode("2WD")}
                      className={`flex-1 rounded-lg py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        driveMode === "2WD"
                          ? "bg-yellow-400 text-slate-950 shadow-xs"
                          : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-yellow-400/20 hover:text-yellow-600"
                      }`}
                    >
                      2WD (RWD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriveMode("4WD")}
                      className={`flex-1 rounded-lg py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        driveMode === "4WD"
                          ? "bg-yellow-400 text-slate-950 shadow-xs"
                          : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-yellow-400/20 hover:text-yellow-600"
                      }`}
                    >
                      4WD (4x4)
                    </button>
                  </div>
                </div>

                {/* Status Penggerak */}
                <div className={`rounded-xl border p-2.5 ${innerCardClass}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase font-mono ${textSubClass}`}
                    >
                      PENGGERAK
                    </span>
                    <span className="rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold font-mono px-1.5 py-0.5">
                      {driveMode} AKTIF
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
                      FL
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
                      FR
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
                      RL
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
                      RR
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Full Emergency Brake Button */}
            <button
              type="button"
              onClick={handleEmergencyStop}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <span>🚨</span>
              <span>EMERGENCY STOP (X / SPASI)</span>
            </button>
          </div>

          {/* 2. TELEMETRI */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider font-mono">
              TELEMETRI
            </h2>

            <div className="space-y-4">
              {/* Kecepatan */}
              <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      ⏱
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${textSubClass}`}
                    >
                      KECEPATAN
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-amber-500">
                      {speed}
                    </span>
                    <span className="ml-1 text-xs font-mono text-slate-400">
                      km/h
                    </span>
                  </div>
                </div>
                {/* Speed Sparkline area graph */}
                <div className="mt-2 h-8 w-full">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 25"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,20 Q15,10 30,18 T60,8 T90,15 L100,12 L100,25 L0,25 Z"
                      className="fill-amber-500/20"
                    />
                    <path
                      d="M0,20 Q15,10 30,18 T60,8 T90,15 L100,12"
                      fill="none"
                      className="stroke-amber-400"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* RPM Motor (ESP32 Live Broadcast Telemetry) */}
              <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      ⚙️
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${textSubClass}`}
                    >
                      RPM MOTOR (ESP32)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-cyan-400">
                      {espRpm}
                    </span>
                    <span className="ml-1 text-xs font-mono text-slate-400">
                      RPM
                    </span>
                  </div>
                </div>
                {/* Visual indicator bar */}
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (espRpm / 3000) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Sudut / Angle */}
              <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      🧭
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${textSubClass}`}
                    >
                      SUDUT
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-blue-500">
                      {steeringAngle}°
                    </span>
                    <span className="ml-1 text-xs font-mono text-slate-400">
                      deg
                    </span>
                  </div>
                </div>
                {/* Angle Sparkline area graph */}
                <div className="mt-2 h-8 w-full">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 25"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,15 Q20,22 40,12 T80,18 L100,14 L100,25 L0,25 Z"
                      className="fill-blue-500/20"
                    />
                    <path
                      d="M0,15 Q20,22 40,12 T80,18 L100,14"
                      fill="none"
                      className="stroke-blue-400"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Signal RX/TX */}
              <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold font-mono ${textSubClass}`}
                  >
                    SIGNAL RX/TX
                  </span>
                  <span
                    className={`rounded border text-[10px] font-bold font-mono px-2 py-0.5 ${
                      isEspConnected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    }`}
                  >
                    {isEspConnected ? "STABIL (ESP32 ON)" : "STANDBY"}
                  </span>
                </div>

                {/* Level indicator bar */}
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isEspConnected
                        ? "w-[96%] bg-emerald-400"
                        : "w-[40%] bg-amber-400"
                    }`}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>LAT: {isEspConnected ? "8ms" : "--"}</span>
                  <span>LOSS: {isEspConnected ? "0.01%" : "--"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. NAVIGASI GPS */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                NAVIGASI GPS
              </h2>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                FIX 3D (12 SATS)
              </span>
            </div>

            {/* GPS Map Image Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-950">
              <Image
                src="/images/gps_map.jpg"
                alt="GPS Satellite Map View"
                fill
                className="object-cover"
              />

              {/* Map controls overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                <button className="h-6 w-6 rounded bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold flex items-center justify-center border border-white/20 hover:bg-slate-800 cursor-pointer">
                  +
                </button>
                <button className="h-6 w-6 rounded bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold flex items-center justify-center border border-white/20 hover:bg-slate-800 cursor-pointer">
                  -
                </button>
                <button className="h-6 w-6 rounded bg-slate-900/80 backdrop-blur-xs text-white text-xs flex items-center justify-center border border-white/20 hover:bg-slate-800 cursor-pointer">
                  🧭
                </button>
              </div>

              {/* Rover Pin Marker */}
              <div className="absolute top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-8 w-8 rounded-full bg-amber-500/40 animate-ping"></span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg shadow-amber-500/50">
                    P
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom GPS Coordinates */}
            <div
              className={`mt-3 grid grid-cols-2 gap-2 rounded-xl border p-2.5 text-[10px] font-mono ${innerCardClass}`}
            >
              <div>
                <span className={`block ${textSubClass}`}>LATITUDO</span>
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  -6.9141234
                </span>
              </div>
              <div>
                <span className={`block ${textSubClass}`}>LONGITUDO</span>
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  107.6094321
                </span>
              </div>
              <div>
                <span className={`block ${textSubClass}`}>ARAH</span>
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  128°
                </span>
              </div>
              <div>
                <span className={`block ${textSubClass}`}>KEC. GPS</span>
                <span className="font-bold text-amber-500">{speed} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: STATUS SENSOR | LOG MISI */}
        {/* ========================================================================= */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* STATUS SENSOR (5 Cols) */}
          <div
            className={`lg:col-span-5 flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider font-mono">
              STATUS SENSOR
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {sensorList.map((sensor) => (
                <button
                  key={sensor.id}
                  type="button"
                  onClick={() => setSelectedSensor(sensor.name)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-amber-500/50 cursor-pointer ${innerCardClass}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200/80 dark:bg-slate-800 text-base">
                    {sensor.icon}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold font-mono leading-tight">
                      {sensor.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${sensor.ok ? "bg-emerald-500" : "bg-red-500"}`}
                      ></span>
                      <span
                        className={`text-[10px] font-mono font-bold ${sensor.ok ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedSensor && (
              <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>
                  Diagnostic check requested for {selectedSensor}... Status
                  nominal.
                </span>
                <button
                  onClick={() => setSelectedSensor(null)}
                  className="font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* LOG MISI (7 Cols) */}
          <div
            className={`lg:col-span-7 flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all ${cardBgClass}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
                LOG MISI
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                REAL-TIME TELEMETRY STREAM
              </span>
            </div>

            {/* Mission Log Box */}
            <div
              className={`h-48 overflow-y-auto rounded-xl border p-3 font-mono text-xs space-y-2 scrollbar-thin ${innerCardClass}`}
            >
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-1.5"
                >
                  <span className="font-bold text-amber-500 shrink-0">
                    {log.time}
                  </span>
                  <span
                    className={`truncate ${
                      log.type === "warning"
                        ? "text-red-500 dark:text-red-400"
                        : log.type === "highlight"
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : log.type === "success"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isDark
                              ? "text-slate-300"
                              : "text-gray-700"
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SYSTEM FOOTER BAR */}
        {/* ========================================================================= */}
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-xs font-mono backdrop-blur-md transition-all ${cardBgClass}`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold">SISTEM NORMAL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-500">🔒</span>
                <span className={textSubClass}>DATA TERENKRIPSI</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div>
                <span className={textSubClass}>TEGANGAN BATERAI: </span>
                <span className="font-bold text-amber-500">
                  {batteryVoltage}V
                </span>
              </div>
              <div>
                <span className={textSubClass}>SUHU CPU: </span>
                <span className="font-bold text-emerald-500">{cpuTemp}°C</span>
              </div>
              <div className="font-bold text-gray-900 dark:text-white">
                V2.4.1-STABLE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Terminate Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl ${cardBgClass}`}
          >
            <h3 className="text-base font-bold font-mono text-red-500 flex items-center gap-2">
              ⚠️ KONFIRMASI TERMINASI MISI
            </h3>
            <p className="mt-2 text-xs font-mono text-gray-600 dark:text-slate-300">
              Apakah Anda yakin ingin{" "}
              {isTerminated ? "menghubungkan ulang" : "memutuskan koneksi"}{" "}
              telemetri unit Rover?
            </p>
            <div className="mt-6 flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="rounded-xl border border-gray-300 dark:border-slate-700 px-4 py-2 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={() => {
                  setIsTerminated(!isTerminated);
                  setShowTerminateModal(false);
                  const timeStr = new Date().toTimeString().split(" ")[0];
                  setLogs((prev) => [
                    {
                      time: timeStr,
                      message: !isTerminated
                        ? "Misi diterminasikan oleh operator"
                        : "Koneksi rover dipulihkan",
                      type: "warning",
                    },
                    ...prev,
                  ]);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 cursor-pointer"
              >
                {isTerminated ? "PULIHKAN KONEKSI" : "YA, TERMINASIKAN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
