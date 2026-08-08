"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Container Glassmorphism */}
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/40 px-4 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150 transition-all">
          {/* Site branding */}
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-sm font-semibold tracking-tight text-gray-900 hidden sm:inline-block">
              Rover
            </span>
          </div>

          {/* Nav links */}
          <ul className="flex items-center justify-end gap-2.5">
            <li>
              <Link
                href="/"
                className={`btn-sm rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white/60 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className={`btn-sm rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                  pathname?.startsWith("/dashboard")
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white/60 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90"
                }`}
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

