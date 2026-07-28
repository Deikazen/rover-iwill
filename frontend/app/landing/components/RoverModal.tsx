import React, { useState, useEffect, useRef } from 'react';
import { RoverItem } from '../types';
import { IMAGE_PRESETS } from '../utils';

interface RoverModalProps {
  isOpen: boolean;
  type: 'create' | 'edit';
  item: RoverItem | null;
  onClose: () => void;
  onSubmit: (payload: {
    judul: string;
    sub_judul: string | null;
    deskripsi: string | null;
    image_url: string | null;
    status: string | null;
    launch_date: string | null;
    landing_date: string | null;
    landing_site: string | null;
    weight: string | null;
    dist_traveled: string | null;
    power_source: string | null;
  }) => Promise<void>;
  triggerStatus: (message: string, type: 'success' | 'error') => void;
}

export default function RoverModal({
  isOpen,
  type,
  item,
  onClose,
  onSubmit,
  triggerStatus,
}: RoverModalProps) {
  const [formJudul, setFormJudul] = useState('');
  const [formSubJudul, setFormSubJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Dynamic telemetry form states
  const [formStatus, setFormStatus] = useState('active');
  const [formLaunchDate, setFormLaunchDate] = useState('');
  const [formLandingDate, setFormLandingDate] = useState('');
  const [formLandingSite, setFormLandingSite] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formDistTraveled, setFormDistTraveled] = useState('');
  const [formPowerSource, setFormPowerSource] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize form states with open and edit items
  useEffect(() => {
    if (isOpen) {
      if (type === 'edit' && item) {
        setFormJudul(item.judul);
        setFormSubJudul(item.sub_judul || '');
        setFormDeskripsi(item.deskripsi || '');
        setFormImageUrl(item.image_url || '');
        setFormStatus(item.status || 'active');
        setFormLaunchDate(item.launch_date || '');
        setFormLandingDate(item.landing_date || '');
        setFormLandingSite(item.landing_site || '');
        setFormWeight(item.weight || '');
        setFormDistTraveled(item.dist_traveled || '');
        setFormPowerSource(item.power_source || '');
      } else {
        setFormJudul('');
        setFormSubJudul('');
        setFormDeskripsi('');
        setFormImageUrl(IMAGE_PRESETS[Math.floor(Math.random() * IMAGE_PRESETS.length)]);
        setFormStatus('active');
        setFormLaunchDate('');
        setFormLandingDate('');
        setFormLandingSite('');
        setFormWeight('');
        setFormDistTraveled('');
        setFormPowerSource('');
      }
    }
  }, [isOpen, type, item]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul.trim()) {
      triggerStatus('Judul Rover tidak boleh kosong!', 'error');
      return;
    }

    await onSubmit({
      judul: formJudul,
      sub_judul: formSubJudul || null,
      deskripsi: formDeskripsi || null,
      image_url: formImageUrl || null,
      status: formStatus || 'active',
      launch_date: formLaunchDate || null,
      landing_date: formLandingDate || null,
      landing_site: formLandingSite || null,
      weight: formWeight || null,
      dist_traveled: formDistTraveled || null,
      power_source: formPowerSource || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass Overlay backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#030305]/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden animate-zoom-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E0533C] via-[#F97316] to-[#06B6D4]" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {type === 'create' ? 'Input Telemetri Rover Baru' : 'Perbarui Telemetri Rover'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              {type === 'create' ? 'Inisialisasi sistem pendaratan rover baru' : `Mengedit data unit #${item?.id}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
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

          {/* Telemetry Specs Grid */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F97316] font-mono">
              Spesifikasi Telemetri (Database)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status Select */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Status Misi
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all cursor-pointer"
                >
                  <option value="active">Aktif</option>
                  <option value="retired">Purna Tugas</option>
                  <option value="lost">Putus Kontak</option>
                </select>
              </div>

              {/* Launch Date */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Tanggal Peluncuran
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: 30 Juli 2020"
                  value={formLaunchDate}
                  onChange={(e) => setFormLaunchDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>

              {/* Landing Date */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Tanggal Pendaratan
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: 18 Februari 2021"
                  value={formLandingDate}
                  onChange={(e) => setFormLandingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>

              {/* Landing Site */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Lokasi Pendaratan
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: Kawah Jezero"
                  value={formLandingSite}
                  onChange={(e) => setFormLandingSite(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Bobot Unit
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: 1.025 kg"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>

              {/* Distance Traveled */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Jarak Tempuh
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: 29.1 km"
                  value={formDistTraveled}
                  onChange={(e) => setFormDistTraveled(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>

              {/* Power Source */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Sumber Tenaga
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: MMRTG (Nuklir)"
                  value={formPowerSource}
                  onChange={(e) => setFormPowerSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-100 text-xs focus:outline-none focus:border-[#F97316]/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-white/5 hover:bg-white/5 text-sm font-semibold text-zinc-300 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#E0533C] to-[#F97316] text-white hover:brightness-110 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] cursor-pointer"
            >
              {type === 'create' ? 'Inisialisasi Peluncuran' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
