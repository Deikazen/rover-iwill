import { LogItem } from "./types";

export function formatCurrentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const initialMissionLogs: LogItem[] = [
  { time: "15:42:12", text: "Kamera depan terhubung", color: "text-amber-400" },
  { time: "15:42:25", text: "Kemudi ke kiri", color: "text-amber-400" },
  { time: "15:42:14", text: "Kamera belakang terhubung", color: "text-amber-400" },
  { time: "15:42:27", text: "Kemudi ke kanan", color: "text-amber-400" },
  { time: "15:42:16", text: "Sinyal GPS stabil", color: "text-amber-400" },
  { time: "15:42:30", text: "Misi dimulai", color: "text-amber-400" },
  { time: "15:42:18", text: "Scanner LIDAR siap", color: "text-amber-400" },
  { time: "15:42:35", text: "Mendeteksi halangan 3m", color: "text-amber-400" }
];
