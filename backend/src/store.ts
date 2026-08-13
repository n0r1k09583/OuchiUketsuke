import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { Appointment, AppNotification, CallRecord, Snapshot, StoreData } from "./types";
import { newId, randomVisitCode, todayISO } from "./format";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function seedAppointments(): Appointment[] {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const tomorrow = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

  const base = (partial: Omit<Appointment, "id" | "createdAt" | "arrivedAt">): Appointment => ({
    ...partial,
    id: newId("apt"),
    arrivedAt: null,
    createdAt: new Date().toISOString(),
  });

  return [
    base({
      visitorName: "田中 美咲",
      visitorOrg: "",
      hostName: "フロント",
      purpose: "ご宿泊チェックイン",
      date: today,
      startTime: "10:00",
      endTime: "10:30",
      visitCode: "4821",
      status: "scheduled",
      notes: "禁煙・ツイン希望",
    }),
    base({
      visitorName: "佐藤 健",
      visitorOrg: "佐藤商事",
      hostName: "山田 部長",
      purpose: "商談",
      date: today,
      startTime: "11:30",
      endTime: "12:30",
      visitCode: "7390",
      status: "scheduled",
      notes: "会議室A",
    }),
    base({
      visitorName: "鈴木 花子",
      visitorOrg: "花デザイン",
      hostName: "企画課 伊藤",
      purpose: "施設見学",
      date: today,
      startTime: "14:00",
      endTime: "15:00",
      visitCode: "1564",
      status: "scheduled",
      notes: "",
    }),
    base({
      visitorName: "高橋 一郎",
      visitorOrg: "",
      hostName: "人事課",
      purpose: "採用面接",
      date: today,
      startTime: "16:00",
      endTime: "17:00",
      visitCode: "8203",
      status: "scheduled",
      notes: "オンライン面接の予備来訪",
    }),
    base({
      visitorName: "林 さくら",
      visitorOrg: "桜トラベル",
      hostName: "フロント",
      purpose: "団体予約の確認",
      date: tomorrow,
      startTime: "09:30",
      endTime: "10:00",
      visitCode: randomVisitCode(),
      status: "scheduled",
      notes: "",
    }),
  ];
}

function defaultStore(): StoreData {
  return {
    settings: {
      facilityName: "グランドホテル桜",
      facilityType: "hotel",
      adminPin: "1234",
      greeting:
        "本日はお越しいただきありがとうございます。お名前、または4桁の受付番号をお知らせください。",
    },
    appointments: seedAppointments(),
    calls: [],
    notifications: [],
  };
}

function ensureStoreFile(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORE_PATH)) {
    writeFileSync(STORE_PATH, JSON.stringify(defaultStore(), null, 2), "utf8");
  }
}

function readStore(): StoreData {
  ensureStoreFile();
  try {
    const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8")) as StoreData;
    if (!parsed.settings || !Array.isArray(parsed.appointments)) return defaultStore();
    parsed.calls ??= [];
    parsed.notifications ??= [];
    return parsed;
  } catch {
    const fresh = defaultStore();
    writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }
}

function writeStore(store: StoreData): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

let queue: Promise<unknown> = Promise.resolve();

export function withStore<T>(fn: (store: StoreData) => T): Promise<T> {
  const run = queue.then(() => {
    const store = readStore();
    const result = fn(store);
    writeStore(store);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function getSnapshot(): Snapshot {
  return readStore();
}

export function emptySignal(): CallRecord["signal"] {
  return { offer: null, answer: null, iceFromVisitor: [], iceFromAdmin: [] };
}

export function pushNotification(
  store: StoreData,
  note: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppNotification {
  const item: AppNotification = {
    ...note,
    id: newId("ntf"),
    createdAt: new Date().toISOString(),
    read: false,
  };
  store.notifications.unshift(item);
  store.notifications = store.notifications.slice(0, 80);
  return item;
}
