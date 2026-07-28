import React from 'react';
import { RoverItem } from '../types';
import { getRoverStats } from '../utils';

interface RoverCardProps {
  item: RoverItem;
  isSelected: boolean;
  onClick: () => void;
}

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
];

export default function RoverCard({ item, isSelected, onClick }: RoverCardProps) {
  const stats = getRoverStats(item);

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
        isSelected 
          ? 'border-[#F97316] bg-zinc-900/50 shadow-[0_10px_30px_rgba(249,115,22,0.1)]' 
          : 'border-white/5 bg-[#0b0b0e]/80 hover:bg-zinc-900/30 hover:border-white/15 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Card Header Image */}
        <div className="h-44 w-full relative bg-zinc-950 overflow-hidden">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.judul} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = IMAGE_PRESETS[0];
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
              <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[10px] font-mono">NO IMAGE</span>
            </div>
          )}
          
          {/* Active indicator dot inside card */}
          {stats.status === 'active' && (
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          )}
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-lg text-white group-hover:text-[#F97316] transition-colors leading-tight line-clamp-1">
              {item.judul}
            </h4>
            <span className="text-[10px] font-mono text-zinc-500 shrink-0">#{item.id}</span>
          </div>
          
          <p className="text-xs text-[#F97316]/90 font-medium font-mono line-clamp-1">
            {item.sub_judul || 'Misi Mars'}
          </p>
          
          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
            {item.deskripsi || 'Tidak ada deskripsi.'}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-[#050508]/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            stats.status === 'active' 
              ? 'bg-emerald-500' 
              : stats.status === 'retired' 
              ? 'bg-blue-400' 
              : 'bg-rose-500'
          }`} />
          <span className="capitalize">{stats.status === 'active' ? 'Aktif' : stats.status === 'retired' ? 'Selesai' : 'Putus'}</span>
        </div>
        <span>{stats.distTraveled}</span>
      </div>

    </div>
  );
}
