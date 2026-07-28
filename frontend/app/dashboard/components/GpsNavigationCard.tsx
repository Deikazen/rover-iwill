"use client";

import React from "react";
import { Plus, Minus, Navigation } from "lucide-react";

interface GpsNavigationCardProps {
  speed: number;
}

export default function GpsNavigationCard({ speed }: GpsNavigationCardProps) {
  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-black/30">
      <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase mb-2 block">
        NAVIGASI GPS
      </span>

      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video border border-slate-800/70 mb-2">
        <img
          src="/gps_map.jpg"
          alt="GPS Satellite Map"
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Map UI Control buttons */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <button className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-800 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-800 cursor-pointer">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="w-6 h-6 rounded bg-slate-900/90 border border-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-800 mt-1 cursor-pointer">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Rover Marker on Map */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-60"></span>
          <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center font-black text-[10px] text-slate-950 shadow-[0_0_12px_#eab308]">
            P
          </div>
        </div>
      </div>

      {/* GPS Coordinates Bar */}
      <div className="grid grid-cols-4 gap-1 text-center bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2">
        <div>
          <span className="text-[8px] font-bold text-slate-500 block uppercase">LATITUDO</span>
          <span className="text-[10px] font-mono font-bold text-white">-6.9141234</span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-slate-500 block uppercase">LONGITUDO</span>
          <span className="text-[10px] font-mono font-bold text-white">107.6094321</span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-slate-500 block uppercase">ARAH</span>
          <span className="text-[10px] font-mono font-bold text-white">128°</span>
        </div>
        <div>
          <span className="text-[8px] font-bold text-slate-500 block uppercase">KEC. GPS</span>
          <span className="text-[10px] font-mono font-bold text-white">{speed} km/h</span>
        </div>
      </div>
    </div>
  );
}
