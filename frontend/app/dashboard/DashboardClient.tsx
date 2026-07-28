"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { LogItem } from "./types";
import { formatCurrentTime, initialMissionLogs } from "./utils";
import DashboardNavbar from "./components/DashboardNavbar";
import FrontCameraCard from "./components/FrontCameraCard";
import LidarScanCard from "./components/LidarScanCard";
import RearCameraCard from "./components/RearCameraCard";
import ControlPanelCard from "./components/ControlPanelCard";
import TelemetryCard from "./components/TelemetryCard";
import GpsNavigationCard from "./components/GpsNavigationCard";
import SensorStatusCard from "./components/SensorStatusCard";
import MissionLogCard from "./components/MissionLogCard";
import DashboardFooter from "./components/DashboardFooter";

export default function DashboardClient() {
  // Real-time telemetry & control state
  const [timeStr, setTimeStr] = useState("15:42:18");
  const [isDriveMode4WD, setIsDriveMode4WD] = useState(true);
  const [gasLevel] = useState(65);
  const [brakeLevel] = useState(0);
  const [clutchLevel] = useState(0);
  const [steeringAngle] = useState(-8);
  const [speed, setSpeed] = useState(12.4);
  const [ping, setPing] = useState(23);
  const [fps, setFps] = useState(30);
  const [isConnected] = useState(true);
  const [isTerminated, setIsTerminated] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>(initialMissionLogs);

  // Live updates interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatCurrentTime());

      // Realistic minor telemetry micro-fluctuations
      setSpeed((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setPing((prev) => Math.max(18, Math.min(32, prev + Math.floor(Math.random() * 3 - 1))));
      setFps((prev) => Math.max(28, Math.min(32, prev + Math.floor(Math.random() * 3 - 1))));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResync = () => {
    setPing(18);
    setFps(30);
    const time = formatCurrentTime();
    setLogs((prev) => [
      ...prev,
      { time, text: "Channel telemetry di-resync", color: "text-emerald-400" }
    ]);
  };

  const handleTerminate = () => {
    setIsTerminated((prev) => !prev);
    const time = formatCurrentTime();
    setLogs((prev) => [
      ...prev,
      {
        time,
        text: !isTerminated ? "EMERGENCY TERMINATE DIPICU" : "Sistem dipulihkan ke normal",
        color: !isTerminated ? "text-red-400" : "text-emerald-400"
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-3 lg:p-4 font-sans select-none flex flex-col justify-between antialiased">
      {/* Navbar with navigation links */}
      <DashboardNavbar
        timeStr={timeStr}
        ping={ping}
        fps={fps}
        isConnected={isConnected}
        isTerminated={isTerminated}
        onTerminate={handleTerminate}
        onResync={handleResync}
      />

      {/* Emergency Overlay Warning Banner if Terminated */}
      {isTerminated && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-2 rounded-xl mb-3 flex items-center justify-between text-xs font-bold tracking-wider animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>MODUL KENDALI DARURAT AKTIF - MESIN TERHENTI</span>
          </div>
          <button onClick={handleTerminate} className="underline text-white hover:text-red-300 cursor-pointer">
            PULIHKAN
          </button>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3 flex-1">
        {/* Row 1: Front Cam, Lidar Scan, Rear Cam */}
        <FrontCameraCard fps={fps} />
        <LidarScanCard />
        <RearCameraCard />

        {/* Row 2: Control Panel, Telemetry, GPS Nav */}
        <ControlPanelCard
          clutchLevel={clutchLevel}
          brakeLevel={brakeLevel}
          gasLevel={gasLevel}
          steeringAngle={steeringAngle}
          isDriveMode4WD={isDriveMode4WD}
          setIsDriveMode4WD={setIsDriveMode4WD}
        />
        <TelemetryCard speed={speed} steeringAngle={steeringAngle} ping={ping} />
        <GpsNavigationCard speed={speed} />

        {/* Row 3: Sensor Status, Mission Log */}
        <SensorStatusCard />
        <MissionLogCard logs={logs} />
      </div>

      {/* Footer Status Bar */}
      <DashboardFooter />
    </div>
  );
}
