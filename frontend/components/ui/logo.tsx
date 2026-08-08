import Link from "next/link";
import { IoIosRadio } from "react-icons/io";

export default function Logo() {
  return (
    <div className="flex h-12 w-12 items-center bg-yellow-300 justify-center rounded-sm font-black ">
      {/* Mengubah ukuran ikon menjadi 32px */}
      <IoIosRadio size={32} />
    </div>
  );
}
