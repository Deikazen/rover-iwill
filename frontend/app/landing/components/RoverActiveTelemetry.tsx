import React from 'react';
import { RoverItem } from '../types';
import { getRoverStats } from '../utils';

interface RoverActiveTelemetryProps {
  selectedItem: RoverItem | null;
  onEdit: (item: RoverItem) => void;
  onDelete: (id: number) => void;
}

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
];

export default function RoverActiveTelemetry({ selectedItem, onEdit, onDelete }: RoverActiveTelemetryProps) {
  if (!selectedItem) {
    return (
      <div className="max-w-7xl mx-auto px-6 mb-16 py-12 border border-dashed border-zinc-800 rounded-3xl text-center">
        <p className="text-zinc-500 font-mono">Belum ada rover yang terdaftar dalam database misi.</p>
      </div>
    );
  }

  const selectedStats = getRoverStats(selectedItem);

  return (
    <section className="px-6 max-w-7xl mx-auto mb-16">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#111116] to-[#08080a] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F97316]/5 pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Image side */}
          <div className="lg:col-span-5 h-[300px] lg:h-[480px] relative bg-zinc-950 overflow-hidden">
            {selectedItem.image_url ? (
              <img 
                src={selectedItem.image_url} 
                alt={selectedItem.judul}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMAGE_PRESETS[0];
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-mono">IMAGE NOT AVAILABLE</span>
              </div>
            )}
            
            {/* Active Focus Overlay Badge */}
            <div className="absolute top-6 left-6 px-3 py-1.5 rounded-md backdrop-blur-md bg-black/60 border border-white/10 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
              <span className="text-zinc-200 uppercase tracking-widest font-semibold">TAMPILAN AKTIF</span>
            </div>

            {/* Status Badge */}
            <div className="absolute bottom-6 left-6 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedStats.status === 'active' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : selectedStats.status === 'retired' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {selectedStats.status === 'active' ? 'Aktif' : selectedStats.status === 'retired' ? 'Purna Tugas' : 'Putus Kontak'}
              </span>
            </div>
          </div>

          {/* Specs and Details Side */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">{selectedItem.judul}</h3>
                  <p className="text-lg text-[#F97316] font-medium">{selectedItem.sub_judul || 'Misi Eksplorasi'}</p>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(selectedItem)}
                    className="p-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer"
                    title="Edit Data Rover"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onDelete(selectedItem.id)}
                    className="p-2.5 rounded-lg border border-red-500/10 bg-red-500/[0.03] text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] hover:border-red-500/20 transition-all cursor-pointer"
                    title="Hapus Data Rover"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-zinc-400 leading-relaxed font-light text-base pt-2">
                {selectedItem.deskripsi || 'Tidak ada deskripsi telemetri yang terdokumentasi untuk unit rover ini.'}
              </p>
            </div>

            {/* Telemetry Stats Table */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Tanggal Peluncuran</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block">{selectedStats.launchDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Tanggal Pendaratan</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block">{selectedStats.landingDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Lokasi Pendaratan</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block">{selectedStats.landingSite}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Bobot Unit</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block">{selectedStats.weight}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Jarak Tempuh</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block text-cyan-400 font-mono">{selectedStats.distTraveled}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Sumber Tenaga</span>
                <span className="text-sm font-semibold text-zinc-200 mt-1 block">{selectedStats.powerSource}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-4 border-t border-white/5">
              <span>REG ID: {selectedItem.id}</span>
              <span>TERDAFTAR: {new Date(selectedItem.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
