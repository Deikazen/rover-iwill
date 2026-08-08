import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-4 text-center">
      <h1 className="text-6xl font-black text-yellow-400">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-slate-400">
        Maaf, halaman yang Anda cari tidak dapat ditemukan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-yellow-300 transition-all shadow-xs"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
