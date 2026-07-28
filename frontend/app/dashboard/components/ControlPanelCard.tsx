"use client";

import React from "react";

interface ControlPanelCardProps {
  clutchLevel: number;
  brakeLevel: number;
  gasLevel: number;
  steeringAngle: number;
  isDriveMode4WD: boolean;
  setIsDriveMode4WD: (val: boolean) => void;
}

export default function ControlPanelCard({
  clutchLevel,
  brakeLevel,
  gasLevel,
  steeringAngle,
  isDriveMode4WD,
  setIsDriveMode4WD
}: ControlPanelCardProps) {
  return (
    <div className="lg:col-span-4 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-black/30">
      <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase mb-3 block">
        KONTROL KENDALI
      </span>

      <div className="grid grid-cols-3 gap-2 h-full items-center">
        {/* Sub 1: PEDAL */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 flex flex-col items-center justify-between h-full">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            PEDAL
          </span>

          <div className="flex items-end justify-center gap-2 h-28 w-full px-1">
            {/* Kopling Bar */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-slate-800 rounded-md h-full relative overflow-hidden flex items-end">
                <div
                  className="w-full bg-amber-500 transition-all duration-300"
                  style={{ height: `${clutchLevel}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">KOPLING</span>
              <span className="text-[9px] font-bold text-white">{clutchLevel}%</span>
            </div>

            {/* Rem Bar */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-slate-800 rounded-md h-full relative overflow-hidden flex items-end">
                <div
                  className="w-full bg-amber-500 transition-all duration-300"
                  style={{ height: `${brakeLevel}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">REM</span>
              <span className="text-[9px] font-bold text-white">{brakeLevel}%</span>
            </div>

            {/* Gas Bar */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-slate-800 rounded-md h-full relative overflow-hidden flex items-end">
                <div
                  className="w-full bg-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.5)] transition-all duration-300"
                  style={{ height: `${gasLevel}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">GAS</span>
              <span className="text-[9px] font-bold text-amber-400">{gasLevel}%</span>
            </div>
          </div>
        </div>

        {/* Sub 2: SETIR KEMUDI */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 flex flex-col items-center justify-between h-full">
          <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase mb-1">
            SETIR KEMUDI
          </span>

          {/* Circular Gauge Dial */}
          <div className="relative w-24 h-24 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#eab308"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="transparent"
              />
            </svg>

            {/* Steering Needle Indicator Line */}
            <div
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${steeringAngle}deg)` }}
            >
              <div className="w-[3px] h-10 bg-amber-400 rounded-full shadow-[0_0_10px_#eab308] -translate-y-5"></div>
            </div>

            {/* Center Badge Value */}
            <div className="absolute w-11 h-11 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
              <span className="text-xs font-black text-white">{steeringAngle}°</span>
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
            SUDUT KEMUDI <span className="text-amber-400">{steeringAngle}°</span>
          </div>
        </div>

        {/* Sub 3: MODE BERKENDARA & STATUS PENGGERAK */}
        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-2.5 flex flex-col items-center justify-between h-full text-center">
          <div className="w-full">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
              MODE BERKENDARA
            </span>
            <div className="flex gap-1 justify-center mb-2">
              <button
                onClick={() => setIsDriveMode4WD(false)}
                className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                  !isDriveMode4WD
                    ? "bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                2WD (RWD)
              </button>
              <button
                onClick={() => setIsDriveMode4WD(true)}
                className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                  isDriveMode4WD
                    ? "bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(234,179,8,0.5)] border border-amber-400"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                4WD (4x4)
              </button>
            </div>
          </div>

          <div className="w-full pt-1 border-t border-slate-800/80">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              STATUS PENGGERAK
            </span>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-black tracking-wider uppercase mb-2">
              {isDriveMode4WD ? "4WD AKTIF" : "2WD AKTIF"}
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-300 font-mono">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FL
              </div>
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FR
              </div>
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> RL
              </div>
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> RR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
