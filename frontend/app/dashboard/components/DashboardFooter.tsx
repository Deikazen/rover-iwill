"use client";

import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="bg-[#111622] border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 gap-3">
      {/* System Status Indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-200 uppercase">SISTEM NORMAL</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-200 uppercase">DATA TERENKRIPSI</span>
        </div>
      </div>

      {/* Hardware Status & Firmware Version */}
      <div className="flex items-center gap-6">
        <div>
          <span className="text-slate-500 uppercase mr-1">TEGANGAN BATERAI:</span>
          <span className="text-white font-mono">24.2V</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase mr-1">SUHU CPU:</span>
          <span className="text-white font-mono">42°C</span>
        </div>
        <div>
          <span className="text-amber-400 font-extrabold font-mono">V2.4.1-STABLE</span>
        </div>
      </div>
    </footer>
  );
}
