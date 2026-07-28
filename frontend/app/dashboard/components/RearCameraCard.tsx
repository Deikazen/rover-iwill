"use client";

import React from "react";

export default function RearCameraCard() {
  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-black/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
          KAMERA BELAKANG
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE
        </span>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video border border-slate-800/70">
        <img
          src="/kamera_belakang.jpg"
          alt="Kamera Belakang Stream"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Camera Overlay HUD */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
            <span className="bg-black/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
              REC ● 1080P
            </span>
            <span className="text-slate-300">CAM-02 [REAR]</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-300">
            <span>REAR SENSOR: OK</span>
            <span>MIRROR MODE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
