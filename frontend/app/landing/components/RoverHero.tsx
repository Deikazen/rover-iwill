import React from 'react';

interface RoverHeroProps {
  totalRovers: number;
}

export default function RoverHero({ totalRovers }: RoverHeroProps) {
  return (
    <section className="relative pt-12 pb-8 px-6 max-w-7xl mx-auto text-center sm:text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="px-3 py-1 text-xs font-semibold tracking-widest text-[#F97316] uppercase bg-orange-500/10 rounded-full border border-orange-500/20 inline-block font-mono">
            Database Ekspedisi Ares
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-50">
            Jelajahi Robotik <br className="hidden sm:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F97316] via-orange-400 to-[#E0533C]">
              Planet Merah
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Selamat datang di portal telemetri tak berawak. Pantau, tambahkan, dan analisis data misi armada penjelajah Mars milik umat manusia secara real-time dari orbit.
          </p>
        </div>
        
        {/* Quick Metrics */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider block">ARMADA TERDAFTAR</span>
            <span className="text-3xl font-bold font-mono tracking-tight text-white block mt-1">{totalRovers} Units</span>
          </div>
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider block">STATUS DATA</span>
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-500 block mt-1">ONLINE</span>
          </div>
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md col-span-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider block">APLIKASI UTAMA</span>
              <span className="text-sm font-semibold text-zinc-300 block mt-0.5">Next.js App Router v16</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
