import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20">
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path
          d="M6.343 17.657a8 8 0 0 1 0-11.314M17.657 6.343a8 8 0 0 1 0 11.314"
          strokeLinecap="round"
        />
        <path
          d="M3.515 20.485a12 12 0 0 1 0-16.97M20.485 3.515a12 12 0 0 1 0 16.97"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
