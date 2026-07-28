import React from 'react';
import { RoverItem } from '../types';
import RoverCard from './RoverCard';

interface RoverCatalogProps {
  filteredItems: RoverItem[];
  selectedItem: RoverItem | null;
  onSelectItem: (item: RoverItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'active' | 'retired' | 'lost';
  setStatusFilter: (filter: 'all' | 'active' | 'retired' | 'lost') => void;
}

export default function RoverCatalog({
  filteredItems,
  selectedItem,
  onSelectItem,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: RoverCatalogProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 space-y-8">
      
      {/* Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center p-4 rounded-2xl border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <svg className="w-5 h-5 text-zinc-500 absolute left-4.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Cari rover berdasarkan spesifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-950/80 border border-white/5 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/50 transition-all font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Semua Armada' },
            { id: 'active', label: 'Aktif' },
            { id: 'retired', label: 'Purna Tugas' },
            { id: 'lost', label: 'Putus Kontak' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                statusFilter === tab.id 
                  ? 'bg-[#F97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                  : 'bg-zinc-950 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-zinc-950/20">
          <svg className="w-12 h-12 text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-zinc-400">Tidak ada rover yang cocok dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <RoverCard 
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
