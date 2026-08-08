import Link from "next/link";
import { IoIosRadio } from "react-icons/io";

export default function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-950 font-black shadow-xs">
      <IoIosRadio size={24} />
    </div>
  );
}
