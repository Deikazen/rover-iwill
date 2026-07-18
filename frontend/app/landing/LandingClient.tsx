'use client';

import React, { useState, useMemo, useRef } from 'react';

interface RoverItem {
  id: number;
  judul: string;
  sub_judul: string | null;
  deskripsi: string | null;
  image_url: string | null;
  created_at: string;
}

interface RoverStats {
  status: 'active' | 'retired' | 'lost';
  launchDate: string;
  landingDate: string;
  landingSite: string;
  weight: string;
  distTraveled: string;
  powerSource: string;
}

interface LandingClientProps {
  initialItems: RoverItem[];
}

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
];

export default function LandingClient({ initialItems }: LandingClientProps) {
  const [items, setItems] = useState<RoverItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<RoverItem | null>(initialItems[0] || null);
  const [isBackendConnected, setIsBackendConnected] = useState(initialItems.length > 0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'retired' | 'lost'>('all');

  // Form states (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formJudul, setFormJudul] = useState('');
  const [formSubJudul, setFormSubJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Upload state & tabs
  const [isUploading, setIsUploading] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerStatus('File harus berupa gambar (image/*)!', 'error');
      return;
    }

    setIsUploading(true);
    triggerStatus('Mengunggah gambar ke Supabase Storage...', 'success');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/items/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload gagal: HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.image_url) {
        setFormImageUrl(data.image_url);
        triggerStatus('Gambar berhasil diunggah ke storage!', 'success');
      } else {
        throw new Error('Response tidak berisi image_url');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      triggerStatus(`Gagal mengunggah gambar: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Status message
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

  React.useEffect(() => {
    if (initialItems.length === 0) {
      fetchItems();
    }
  }, [initialItems]);

  const getRoverStats = (title: string): RoverStats => {
    const t = title.toLowerCase();
    if (t.includes('perseverance')) {
      return {
        status: 'active',
        launchDate: '30 Juli 2020',
        landingDate: '18 Februari 2021',
        landingSite: 'Kawah Jezero',
        weight: '1.025 kg',
        distTraveled: '29.1 km',
        powerSource: 'MMRTG (Nuklir)'
      };
    }
    if (t.includes('curiosity')) {
      return {
        status: 'active',
        launchDate: '26 November 2011',
        landingDate: '6 Agustus 2012',
        landingSite: 'Kawah Gale',
        weight: '899 kg',
        distTraveled: '32.4 km',
        powerSource: 'MMRTG (Nuklir)'
      };
    }
    if (t.includes('opportunity')) {
      return {
        status: 'lost',
        launchDate: '8 Juli 2003',
        landingDate: '25 Januari 2004',
        landingSite: 'Meridiani Planum',
        weight: '185 kg',
        distTraveled: '45.16 km',
        powerSource: 'Panel Surya'
      };
    }
    if (t.includes('spirit')) {
      return {
        status: 'lost',
        launchDate: '10 Juni 2003',
        landingDate: '4 Januari 2004',
        landingSite: 'Kawah Gusev',
        weight: '185 kg',
        distTraveled: '7.73 km',
        powerSource: 'Panel Surya'
      };
    }
    if (t.includes('sojourner')) {
      return {
        status: 'retired',
        launchDate: '4 Desember 1996',
        landingDate: '4 Juli 1997',
        landingSite: 'Ares Vallis',
        weight: '11.5 kg',
        distTraveled: '100+ meter',
        powerSource: 'Panel Surya & Baterai'
      };
    }
    return {
      status: 'active',
      launchDate: '30 September 2026',
      landingDate: '14 Maret 2027',
      landingSite: 'Acidalia Planitia',
      weight: '450 kg',
      distTraveled: '0.0 km',
      powerSource: 'Panel Surya'
    };
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const stats = getRoverStats(item.judul);
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

  const openModal = (type: 'create' | 'edit', item?: RoverItem) => {
    setModalType(type);
    if (type === 'edit' && item) {
      setEditingId(item.id);
      setFormJudul(item.judul);
      setFormSubJudul(item.sub_judul || '');
      setFormDeskripsi(item.deskripsi || '');
      setFormImageUrl(item.image_url || '');
    } else {
      setEditingId(null);
      setFormJudul('');
      setFormSubJudul('');
      setFormDeskripsi('');
      setFormImageUrl(IMAGE_PRESETS[Math.floor(Math.random() * IMAGE_PRESETS.length)]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul.trim()) {
      triggerStatus('Judul Rover tidak boleh kosong!', 'error');
      return;
    }

    const payload = {
      judul: formJudul,
      sub_judul: formSubJudul || null,
      deskripsi: formDeskripsi || null,
      image_url: formImageUrl || null,
    };

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
        triggerStatus('Rover berhasil diluncurkan ke database!', 'success');
      } catch (err: any) {
        triggerStatus(`Error: ${err.message}`, 'error');
      }
    } else if (modalType === 'edit' && editingId !== null) {
      try {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Gagal memperbarui data di database backend');
        const updatedItem = await response.json();
        setItems((prev) => prev.map((it) => (it.id === editingId ? updatedItem : it)));
        if (selectedItem?.id === editingId) setSelectedItem(updatedItem);
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
      triggerStatus('Rover telah dihapus dari database misi.', 'success');
    } catch (err: any) {
      triggerStatus(`Gagal menghapus: ${err.message}`, 'error');
    }
  };

  const selectedStats = selectedItem ? getRoverStats(selectedItem.judul) : null;

  return (
    <div className="min-h-screen bg-[#030305] text-zinc-100 font-sans selection:bg-[#F97316] selection:text-white relative overflow-hidden">
      
      {/* Stars and Nebula background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-700/10 blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern */}
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

      {/* HEADER */}
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-400">
                TELEMETRY CONNECTED (DATABASE)
              </span>
            </div>

            <button 
              onClick={() => openModal('create')}
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

      {/* HERO SECTION */}
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
              <span className="text-3xl font-bold font-mono tracking-tight text-white block mt-1">{items.length} Units</span>
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

      {/* FOCUS AREA: SELECTED ROVER TELEMETRY */}
      {selectedItem ? (
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
                {selectedStats && (
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
                )}
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
                        onClick={() => openModal('edit', selectedItem)}
                        className="p-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer"
                        title="Edit Data Rover"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedItem.id)}
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
                {selectedStats && (
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
                )}

                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-4 border-t border-white/5">
                  <span>REG ID: {selectedItem.id}</span>
                  <span>TERDAFTAR: {new Date(selectedItem.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mb-16 py-12 border border-dashed border-zinc-800 rounded-3xl text-center">
          <p className="text-zinc-500 font-mono">Belum ada rover yang terdaftar dalam database misi.</p>
        </div>
      )}

      {/* CATALOG SECTION: SEARCH, FILTER, GRID */}
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
            {filteredItems.map((item) => {
              const stats = getRoverStats(item.judul);
              const isSelected = selectedItem?.id === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
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
            })}
          </div>
        )}
      </section>

      {/* DETAILED MODAL: LAUNCH/EDIT ROVER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Glass Overlay backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-[#030305]/80 backdrop-blur-md transition-opacity" 
          />

          {/* Modal Content Card */}
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden animate-zoom-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E0533C] via-[#F97316] to-[#06B6D4]" />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {modalType === 'create' ? 'Input Telemetri Rover Baru' : 'Perbarui Telemetri Rover'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  {modalType === 'create' ? 'Inisialisasi sistem pendaratan rover baru' : `Mengedit data unit #${editingId}`}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Form Input: Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Nama Rover <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Rover Perseverance"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-sm focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/50 transition-all"
                />
              </div>

              {/* Form Input: Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Sub-judul / Nama Misi
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: Misi Mars 2020 NASA"
                  value={formSubJudul}
                  onChange={(e) => setFormSubJudul(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-sm focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/50 transition-all"
                />
              </div>

              {/* Form Input: Image Source Selector & Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Gambar Telemetri
                  </label>
                  {/* Tabs */}
                  <div className="flex gap-1.5 p-0.5 rounded-lg bg-zinc-950 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-3 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                        imageTab === 'upload'
                          ? 'bg-zinc-800 text-white border border-white/5'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-3 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                        imageTab === 'url'
                          ? 'bg-zinc-800 text-white border border-white/5'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Tautan URL
                    </button>
                  </div>
                </div>

                {imageTab === 'upload' ? (
                  /* File Picker Tab */
                  <div className="space-y-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-[#F97316]/50 bg-zinc-950 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-zinc-900/20 group relative overflow-hidden min-h-[140px]"
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin h-8 w-8 text-[#F97316]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-xs text-zinc-400 font-mono">Mengunggah ke Storage...</span>
                        </div>
                      ) : formImageUrl ? (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <div className="h-16 w-24 rounded border border-white/10 overflow-hidden bg-zinc-900">
                            <img src={formImageUrl} className="h-full w-full object-cover" alt="Preview" />
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            File Gambar Siap
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono underline hover:text-zinc-300">Ganti file...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#F97316] group-hover:scale-110 transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-300 font-medium">Klik untuk memilih file gambar</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Mendukung JPEG, PNG, WEBP (maks. 5MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* URL & Presets Tab */
                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder="Masukkan url gambar (https://...)"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-sm focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono"
                    />
                    
                    {/* Image Presets Selector */}
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block mb-1.5">Preset gambar kosmik:</span>
                      <div className="flex gap-2">
                        {IMAGE_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormImageUrl(preset)}
                            className={`h-10 w-14 rounded overflow-hidden border cursor-pointer transition-all ${
                              formImageUrl === preset ? 'border-[#F97316] ring-1 ring-[#F97316]' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <img src={preset} className="h-full w-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                  Deskripsi / Spesifikasi Misi
                </label>
                <textarea 
                  rows={4}
                  placeholder="Tuliskan spesifikasi teknologi, instrumentasi sains, dan ringkasan pencapaian misi rover..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-sm focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/50 transition-all resize-none"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/5 hover:bg-white/5 text-sm font-semibold text-zinc-300 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#E0533C] to-[#F97316] text-white hover:brightness-110 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] cursor-pointer"
                >
                  {modalType === 'create' ? 'Inisialisasi Peluncuran' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
