"use client";

import React from "react";
import { LogItem } from "../types";

interface MissionLogCardProps {
  logs: LogItem[];
}

export default function MissionLogCard({ logs }: MissionLogCardProps) {
  return (
    <div className="lg:col-span-8 bg-[#111622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-black/30">
      <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase mb-2 block">
        LOG MISI
      </span>

      <div className="bg-[#0b0f19] border border-slate-800/60 rounded-lg p-3 h-32 overflow-y-auto font-mono text-[11px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">{log.time}</span>
              <span className="text-slate-200">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
