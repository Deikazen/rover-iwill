"use client";

import React from "react";

export default function LidarScanCard() {
  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-black/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
          SCAN LIDAR (2D)
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          AKTIF
        </span>
      </div>

      {/* Lidar Radar Canvas Container */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-[#0d121c] rounded-lg border border-slate-800/70 p-2 overflow-hidden">
        <div className="relative w-52 h-52 flex items-center justify-center">
          {/* Concentric distance rings */}
          <div className="absolute w-52 h-52 rounded-full border border-slate-700/40 flex items-center justify-center">
            <span className="absolute top-1 right-3 text-[9px] text-slate-500 font-mono">5 m</span>
          </div>
          <div className="absolute w-40 h-40 rounded-full border border-slate-700/50 flex items-center justify-center">
            <span className="absolute top-1 right-3 text-[9px] text-slate-500 font-mono">4 m</span>
          </div>
          <div className="absolute w-28 h-28 rounded-full border border-slate-700/60 flex items-center justify-center">
            <span className="absolute top-1 right-2 text-[9px] text-slate-500 font-mono">3 m</span>
          </div>
          <div className="absolute w-16 h-16 rounded-full border border-slate-700/70 flex items-center justify-center">
            <span className="absolute top-1 right-1 text-[9px] text-slate-500 font-mono">2 m</span>
          </div>
          <div className="absolute w-8 h-8 rounded-full border border-slate-700/80 flex items-center justify-center">
            <span className="absolute -top-3 right-0 text-[8px] text-slate-500 font-mono">1 m</span>
          </div>

          {/* Crosshair lines */}
          <div className="absolute w-full h-[1px] bg-slate-700/40"></div>
          <div className="absolute h-full w-[1px] bg-slate-700/40"></div>

          {/* Cardinal directions */}
          <span className="absolute top-0 text-[10px] font-bold text-slate-400">N</span>
          <span className="absolute right-0 text-[10px] font-bold text-slate-400">E</span>
          <span className="absolute bottom-0 text-[10px] font-bold text-slate-400">S</span>
          <span className="absolute left-0 text-[10px] font-bold text-slate-400">W</span>

          {/* Center Rover Icon */}
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center z-10 shadow-[0_0_8px_rgba(234,179,8,0.8)]">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute w-full h-full animate-radar-sweep pointer-events-none">
            <div className="w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/30 via-emerald-400/10 to-transparent rounded-tl-full origin-bottom-right"></div>
            <div className="absolute top-0 right-1/2 w-1/2 h-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
          </div>

          {/* Simulated Lidar Obstacle Dots */}
          <div className="absolute top-8 left-16 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></div>
          <div className="absolute top-14 right-12 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></div>
          <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></div>

          <div className="absolute top-10 right-20 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] animate-pulse"></div>
          <div className="absolute bottom-16 right-16 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#facc15]"></div>

          <div className="absolute top-20 left-24 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping"></div>
          <div className="absolute top-20 left-24 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
        </div>
      </div>
    </div>
  );
}
