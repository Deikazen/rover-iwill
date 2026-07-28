'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RoverItem } from './types';
import { getRoverStats } from './utils';

// Sub-component imports
import RoverHeader from './components/RoverHeader';
import RoverHero from './components/RoverHero';
import RoverActiveTelemetry from './components/RoverActiveTelemetry';
import RoverCatalog from './components/RoverCatalog';
import RoverModal from './components/RoverModal';

interface LandingClientProps {
  initialItems: RoverItem[];
}

export default function LandingClient({ initialItems }: LandingClientProps) {
  const [items, setItems] = useState<RoverItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<RoverItem | null>(initialItems[0] || null);
  const [isBackendConnected, setIsBackendConnected] = useState(initialItems.length > 0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'retired' | 'lost'>('all');

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');

  // Status message toast
  const [actionStatus, setActionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const API_URL = 'http://127.0.0.1:8000/items';

  // Fallback client-side fetch if server-side render was unable to retrieve database data
  const fetchItems = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data: RoverItem[] = await response.json();
        setItems(data);
        setIsBackendConnected(true);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      }
    } catch (err) {
      console.warn('Client-side database fetch fallback failed:', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    if (initialItems.length === 0) {
      fetchItems();
    }
  }, [initialItems]);

  // Filter items based on search and status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const stats = getRoverStats(item);
      const matchesStatus = statusFilter === 'all' || stats.status === statusFilter;
      const matchesSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sub_judul?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.deskripsi?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [items, searchQuery, statusFilter]);

  const triggerStatus = (message: string, type: 'success' | 'error') => {
    setActionStatus({ message, type });
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleOpenModal = (type: 'create' | 'edit') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Submit Handler passed to Modal
  const handleModalSubmit = async (payload: {
    judul: string;
    sub_judul: string | null;
    deskripsi: string | null;
    image_url: string | null;
  }) => {
    if (modalType === 'create') {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Gagal menyimpan ke database backend');
        const newItem = await response.json();
        setItems((prev) => [newItem, ...prev]);
        setSelectedItem(newItem);
        setIsBackendConnected(true);
        triggerStatus('Rover berhasil diluncurkan ke database!', 'success');
      } catch (err: any) {
        triggerStatus(`Error: ${err.message}`, 'error');
      }
    } else if (modalType === 'edit' && selectedItem !== null) {
      try {
        const response = await fetch(`${API_URL}/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Gagal memperbarui data di database backend');
        const updatedItem = await response.json();
        setItems((prev) => prev.map((it) => (it.id === selectedItem.id ? updatedItem : it)));
        setSelectedItem(updatedItem);
        setIsBackendConnected(true);
        triggerStatus('Spesifikasi Rover berhasil diperbarui!', 'success');
      } catch (err: any) {
        triggerStatus(`Error: ${err.message}`, 'error');
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data rover ini dari database misi?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Gagal menghapus data di database backend');
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (selectedItem?.id === id) {
        const remaining = items.filter((it) => it.id !== id);
        setSelectedItem(remaining.length > 0 ? remaining[0] : null);
      }
      setIsBackendConnected(true);
      triggerStatus('Rover telah dihapus dari database misi.', 'success');
    } catch (err: any) {
      triggerStatus(`Gagal menghapus: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-zinc-100 font-sans selection:bg-[#F97316] selection:text-white relative overflow-hidden">
      
      {/* Cosmic background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-700/10 blur-[120px] pointer-events-none" />
      
      {/* Stars Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
        style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }}
      />

      {/* Action Notification Alert Toast */}
      {actionStatus && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl animate-fade-in shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-zinc-800 bg-[#0c0c10]/90">
          <div className={`w-3 h-3 rounded-full ${actionStatus.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
          <span className="text-sm font-medium tracking-wide">{actionStatus.message}</span>
        </div>
      )}

      {/* HEADER Component */}
      <RoverHeader 
        isBackendConnected={isBackendConnected} 
        onLaunchClick={() => handleOpenModal('create')} 
      />

      {/* HERO Component */}
      <RoverHero totalRovers={items.length} />

      {/* SELECTED ROVER TELEMETRY Component */}
      <RoverActiveTelemetry 
        selectedItem={selectedItem} 
        onEdit={() => handleOpenModal('edit')} 
        onDelete={handleDelete} 
      />

      {/* CATALOG GRID Component */}
      <RoverCatalog 
        filteredItems={filteredItems}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* CRUD MODAL Component */}
      <RoverModal 
        isOpen={isModalOpen}
        type={modalType}
        item={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        triggerStatus={triggerStatus}
      />

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#020204] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-500 font-mono text-sm border border-white/5">
              🚀
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-300 font-mono tracking-wider">MARS MISSION COMMAND</p>
              <p className="text-xs text-zinc-500 font-mono">Dibuat menggunakan Next.js & FastAPI backend</p>
            </div>
          </div>
          <div className="flex gap-6 text-xs font-mono text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer">TELEMETRY DOCS</span>
            <span className="hover:text-zinc-300 cursor-pointer">SENSORS API</span>
            <span className="hover:text-zinc-300 cursor-pointer">© 2026 ROVER CONTROL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
