"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PageIllustration from "@/components/page-illustration";

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
      status: isTerminated ? "ERROR" : "OK",
      ok: !isTerminated,
      icon: "🔳",
    },
    {
      id: "motor",
      name: "MOTOR DRIVER",
      status: isTerminated ? "OFFLINE" : "OK",
      ok: !isTerminated,
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
                  isTerminated
                    ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isTerminated ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"}`}
                ></span>
                <span className="font-mono uppercase">
                  {isTerminated ? "DISCONNECTED" : "CONNECTED"}
                </span>
              </div>
            </div>

            {/* Metrics Pills: IP, PING, FPS, TIME */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 shadow-2xs">
                <span className={textSubClass}>IP ADDRESS</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  192.168.1.132
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
              <Image
                src="/images/camera_front.jpg"
                alt="Kamera Depan Feed"
                fill
                className="object-cover transition-opacity duration-300"
                priority
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
              <Image
                src="/images/camera_rear.jpg"
                alt="Kamera Belakang Feed"
                fill
                className="object-cover transition-opacity duration-300"
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
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider font-mono">
              KONTROL KENDALI
            </h2>

            <div className="grid gap-4">
              {/* Pedals & Steering Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Pedal Section */}
                <div className={`rounded-xl border p-3 ${innerCardClass}`}>
                  <span
                    className={`block text-[10px] font-bold uppercase font-mono mb-2 text-center ${textSubClass}`}
                  >
                    PEDAL
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

                    {/* Rem */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-4 rounded-full bg-gray-200 dark:bg-slate-800 h-20 overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full bg-red-500 transition-all duration-300 rounded-full"
                          style={{ height: `${remLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono font-semibold">
                        REM
                      </span>
                      <span className="text-[9px] font-mono font-bold text-red-500">
                        {remLevel}%
                      </span>
                    </div>

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

                  {/* Interactive Gas Slider */}
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gasLevel}
                      onChange={(e) => handleGasChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
                    />
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
                      onClick={() => handleSteer(-5)}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setSteeringAngle(0)}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
                    >
                      RESET
                    </button>
                    <button
                      onClick={() => handleSteer(5)}
                      className="rounded bg-gray-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-yellow-400 hover:text-slate-950 transition-colors cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3">
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
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold font-mono px-2 py-0.5">
                    STABIL
                  </span>
                </div>

                {/* Level indicator bar */}
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-[94%] bg-yellow-400 rounded-full"></div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>LAT: 8ms</span>
                  <span>LOSS: 0.02%</span>
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
