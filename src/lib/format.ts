const TOKYO = "Asia/Tokyo";

export function todayISO(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TOKYO }).format(date);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDateJa(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(y, m - 1, d).getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}

export function formatTime(hhmm: string): string {
  return hhmm;
}

export function formatDateTimeJa(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TOKYO,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function nowHM(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TOKYO,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function randomVisitCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: "予約",
    arrived: "到着",
    "in-call": "通話中",
    completed: "対応済",
    cancelled: "取消",
    "no-show": "不来館",
    ringing: "着信中",
    active: "通話中",
    ended: "終了",
  };
  return map[status] ?? status;
}
