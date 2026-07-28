import React from 'react';

interface RoverHeaderProps {
  isBackendConnected: boolean;
  onLaunchClick: () => void;
}

export default function RoverHeader({ isBackendConnected, onLaunchClick }: RoverHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#030305]/60 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-tr from-[#E0533C] to-[#F97316] flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 to-zinc-400">
              MARS EXPLORER
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest leading-none">MISSION CONTROL</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Telemetry Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-zinc-400">
              {isBackendConnected ? 'TELEMETRY SECURE (DATABASE)' : 'SANDBOX MODE (OFFLINE)'}
            </span>
          </div>

          <button 
            onClick={onLaunchClick}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#E0533C] to-[#F97316] text-sm font-semibold tracking-wide text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Luncurkan Rover</span>
          </button>
        </div>
      </div>
    </header>
  );
}
