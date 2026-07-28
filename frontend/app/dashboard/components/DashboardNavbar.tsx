"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Power,
  RotateCcw,
  Home,
  LayoutDashboard,
  MapPin,
  Video,
  Sliders,
  Settings,
  HelpCircle
} from "lucide-react";

interface DashboardNavbarProps {
  timeStr: string;
  ping: number;
  fps: number;
  isConnected: boolean;
  isTerminated: boolean;
  onTerminate: () => void;
  onResync: () => void;
}

export default function DashboardNavbar({
  timeStr,
  ping,
  fps,
  isConnected,
  isTerminated,
  onTerminate,
  onResync
}: DashboardNavbarProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDummyNotice, setShowDummyNotice] = useState<string | null>(null);

  const navItems = [
    { id: "home", label: "Home", href: "/landing", icon: Home, isReal: true },
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, isReal: true },
    { id: "misi", label: "Misi & Waypoint", href: "#", icon: MapPin, isReal: false },
    { id: "arsip", label: "Arsip Kamera", href: "#", icon: Video, isReal: false },
    { id: "kalibrasi", label: "Kalibrasi Sensor", href: "#", icon: Sliders, isReal: false },
    { id: "settings", label: "Pengaturan Rover", href: "#", icon: Settings, isReal: false }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (!item.isReal) {
      setShowDummyNotice(item.label);
      setTimeout(() => setShowDummyNotice(null), 3000);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <header className="bg-[#111622] border border-slate-800/80 rounded-xl px-4 py-2.5 mb-3 flex flex-col lg:flex-row items-center justify-between shadow-lg shadow-black/40 gap-3">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-widest text-white leading-none flex items-center gap-2">
              R.O.V.E.R
            </h1>
            <span className="text-[9px] tracking-widest text-slate-400 font-semibold uppercase block mt-0.5">
              PRO TELEMETRY
            </span>
          </div>

          {/* Connection Status Badge */}
          <div className="ml-3 pl-3 border-l border-slate-800 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase hidden sm:inline">
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </div>

        {/* System Clock (Mobile view) */}
        <div className="lg:hidden flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-white font-mono text-xs font-bold">
          <span className="text-amber-400">🕒</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isReal) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap cursor-pointer relative group"
            >
              <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              <span>{item.label}</span>
              <span className="text-[8px] bg-slate-800 text-slate-500 px-1 rounded uppercase">
                SOON
              </span>
            </button>
          );
        })}
      </nav>

      {/* System Metrics & Actions */}
      <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
        {/* System Stats (IP, Ping, FPS, Time) */}
        <div className="hidden xl:flex items-center gap-5 text-xs text-slate-400 font-medium">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block tracking-wider">
              IP ADDRESS
            </span>
            <span className="text-white font-bold text-[11px]">192.168.1.132</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block tracking-wider">
              PING
            </span>
            <span className="text-emerald-400 font-bold text-[11px]">{ping} ms</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block tracking-wider">
              FPS
            </span>
            <span className="text-white font-bold text-[11px]">{fps}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-white font-mono text-xs font-bold">
            <span className="text-amber-400">🕒</span>
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTerminate}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all duration-200 shadow-md ${
              isTerminated
                ? "bg-red-700 text-white animate-pulse shadow-red-900/50"
                : "bg-red-600 hover:bg-red-500 text-white shadow-red-950/40 active:scale-95"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isTerminated ? "TERMINATING..." : "TERMINATE"}</span>
          </button>

          <button
            onClick={onResync}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold tracking-wider text-white flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">RESYNC</span>
          </button>
        </div>
      </div>

      {/* Toast Notification for Dummy Menu click */}
      {showDummyNotice && (
        <div className="absolute top-16 right-4 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-amber-300 animate-fade-in flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span>Halaman "{showDummyNotice}" sedang dalam pengembangan!</span>
        </div>
      )}
    </header>
  );
}
