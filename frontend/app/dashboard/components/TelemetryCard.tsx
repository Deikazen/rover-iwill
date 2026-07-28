"use client";

import React from "react";
import { Gauge, Compass } from "lucide-react";

interface TelemetryCardProps {
  speed: number;
  steeringAngle: number;
  ping: number;
}

export default function TelemetryCard({ speed, steeringAngle, ping }: TelemetryCardProps) {
  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-black/30">
      <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase mb-2 block">
        TELEMETRI
      </span>

      <div className="flex flex-col justify-between h-full gap-2">
        {/* Speedometer Metric */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-slate-800 text-amber-400">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                KECEPATAN
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white tracking-tight">{speed}</span>
              <span className="text-[10px] font-bold text-slate-400 ml-1">km/h</span>
            </div>
          </div>

          {/* Area Wave Chart graphic */}
          <div className="h-8 w-full mt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 40">
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,35 Q 40,25 80,30 T 160,20 T 240,28 T 300,22 L 300,40 L 0,40 Z"
                fill="url(#speedGrad)"
              />
              <path
                d="M 0,35 Q 40,25 80,30 T 160,20 T 240,28 T 300,22"
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Angle / Steering Metric */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-slate-800 text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SUDUT
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white tracking-tight">{steeringAngle}°</span>
              <span className="text-[10px] font-bold text-slate-400 ml-1">deg</span>
            </div>
          </div>

          {/* Area Wave Chart graphic */}
          <div className="h-8 w-full mt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 40">
              <defs>
                <linearGradient id="angleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,20 Q 50,32 100,25 T 200,30 T 300,26 L 300,40 L 0,40 Z"
                fill="url(#angleGrad)"
              />
              <path
                d="M 0,20 Q 50,32 100,25 T 200,30 T 300,26"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Signal Status Bar */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5">
          <div className="flex justify-between items-center text-[10px] font-bold mb-1">
            <span className="text-slate-400 uppercase tracking-wider">SIGNAL RX/TX</span>
            <span className="text-emerald-400 font-extrabold">STABIL</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-1.5 p-0.5">
            <div className="h-full bg-amber-400 rounded-full shadow-[0_0_8px_#facc15] w-[88%]"></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>LAT: {ping}ms</span>
            <span>LOSS: 0.02%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
