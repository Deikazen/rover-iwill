"use client";

import React from "react";
import { Camera, Video, Activity, Navigation, Cpu, Zap } from "lucide-react";

export default function SensorStatusCard() {
  const sensors = [
    { name: "KAMERA DEPAN", icon: Camera },
    { name: "KAMERA BELAKANG", icon: Video },
    { name: "LIDAR", icon: Activity },
    { name: "GPS", icon: Navigation },
    { name: "ESP32 CORE", icon: Cpu },
    { name: "MOTOR DRIVER", icon: Zap },
  ];

  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-black/30">
      <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase mb-2 block">
        STATUS SENSOR
      </span>

      <div className="grid grid-cols-2 gap-2">
        {sensors.map((sensor, idx) => {
          const Icon = sensor.icon;
          return (
            <div
              key={idx}
              className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {sensor.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> OK
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
