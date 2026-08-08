import Link from "next/link";
import Logo from "./logo";

export default function Navbar() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Container Glassmorphism */}
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/40 px-4 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150 transition-all">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                href="/signin"
                className="btn-sm rounded-xl bg-white/60 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 hover:shadow"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="btn-sm rounded-xl bg-gray-900/90 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-900"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
