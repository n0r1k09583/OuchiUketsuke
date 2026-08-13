const TOKYO = "Asia/Tokyo";

export function todayISO(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TOKYO }).format(date);
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
