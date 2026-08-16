import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { Appointment, AppNotification, CallRecord, Snapshot, StoreData } from "./types";
import { newId, todayISO } from "./format";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "ouchi-uketsuke.db");
const LEGACY_JSON = path.join(DATA_DIR, "store.json");

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    facility_name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    admin_pin TEXT NOT NULL,
    greeting TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    visitor_name TEXT NOT NULL,
    visitor_org TEXT,
    host_name TEXT,
    purpose TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    visit_code TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    arrived_at TEXT,
    departed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calls (
    id TEXT PRIMARY KEY,
    appointment_id TEXT,
    visitor_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    started_at TEXT,
    ended_at TEXT,
    offer_json TEXT,
    answer_json TEXT,
    ice_from_visitor_json TEXT,
    ice_from_admin_json TEXT
  );

  CREATE TABLE IF NOT EXISTS call_messages (
    id TEXT PRIMARY KEY,
    call_id TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    appointment_id TEXT,
    call_id TEXT,
    visitor_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0
  );
`;

const DEMO_DATES: Record<string, "today" | "tomorrow"> = {
  "4821": "today",
  "7390": "today",
  "1564": "today",
  "8203": "today",
  "9012": "tomorrow",
};

function tomorrowISO(): string {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function alignDemoDates(store: StoreData): boolean {
  const today = todayISO();
  const tomorrow = tomorrowISO();
  let changed = false;
  for (const apt of store.appointments) {
    const day = DEMO_DATES[apt.visitCode];
    if (!day) continue;
    const target = day === "today" ? today : tomorrow;
    if (apt.date === target) continue;
    const leftover = apt.date < today && apt.status !== "departed";
    if (apt.status !== "scheduled" && !leftover) continue;
    apt.date = target;
    if (leftover) {
      apt.status = "scheduled";
      apt.arrivedAt = null;
      apt.departedAt = null;
    }
    changed = true;
  }
  return changed;
}

function seedAppointments(): Appointment[] {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const tomorrow = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

  const base = (partial: Omit<Appointment, "id" | "createdAt" | "arrivedAt" | "departedAt">): Appointment => ({
    ...partial,
    id: newId("apt"),
    arrivedAt: null,
    departedAt: null,
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
      visitCode: "9012",
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

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function openDb(): DatabaseSync {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(SCHEMA);
  return db;
}

function loadStore(db: DatabaseSync): StoreData | null {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as
    | {
        facility_name: string;
        facility_type: "hotel" | "office";
        admin_pin: string;
        greeting: string;
      }
    | undefined;
  if (!settings) return null;

  const appointments = (
    db.prepare("SELECT * FROM appointments ORDER BY date, start_time").all() as Record<string, unknown>[]
  ).map((row) => ({
    id: String(row.id),
    visitorName: String(row.visitor_name),
    visitorOrg: String(row.visitor_org ?? ""),
    hostName: String(row.host_name ?? ""),
    purpose: String(row.purpose ?? ""),
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: String(row.end_time ?? ""),
    visitCode: String(row.visit_code),
    status: row.status as Appointment["status"],
    notes: String(row.notes ?? ""),
    arrivedAt: (row.arrived_at as string | null) ?? null,
    departedAt: (row.departed_at as string | null) ?? null,
    createdAt: String(row.created_at),
  }));

  const messageRows = db.prepare("SELECT * FROM call_messages ORDER BY at").all() as Record<string, unknown>[];
  const messagesByCall = new Map<string, CallRecord["messages"]>();
  for (const row of messageRows) {
    const callId = String(row.call_id);
    const list = messagesByCall.get(callId) ?? [];
    list.push({
      id: String(row.id),
      role: row.role as "admin" | "visitor",
      text: String(row.text),
      at: String(row.at),
    });
    messagesByCall.set(callId, list);
  }

  const calls = (db.prepare("SELECT * FROM calls ORDER BY created_at DESC").all() as Record<string, unknown>[]).map(
    (row) =>
      ({
        id: String(row.id),
        appointmentId: (row.appointment_id as string | null) ?? null,
        visitorName: String(row.visitor_name),
        reason: row.reason as CallRecord["reason"],
        status: row.status as CallRecord["status"],
        createdAt: String(row.created_at),
        startedAt: (row.started_at as string | null) ?? null,
        endedAt: (row.ended_at as string | null) ?? null,
        messages: messagesByCall.get(String(row.id)) ?? [],
        signal: {
          offer: parseJson(row.offer_json as string | null, null),
          answer: parseJson(row.answer_json as string | null, null),
          iceFromVisitor: parseJson(row.ice_from_visitor_json as string | null, []),
          iceFromAdmin: parseJson(row.ice_from_admin_json as string | null, []),
        },
      }) satisfies CallRecord,
  );

  const notifications = (
    db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all() as Record<string, unknown>[]
  ).map((row) => ({
    id: String(row.id),
    type: row.type as AppNotification["type"],
    appointmentId: (row.appointment_id as string | null) ?? null,
    callId: (row.call_id as string | null) ?? null,
    visitorName: String(row.visitor_name),
    message: String(row.message),
    createdAt: String(row.created_at),
    read: Number(row.read) === 1,
  }));

  return {
    settings: {
      facilityName: settings.facility_name,
      facilityType: settings.facility_type,
      adminPin: settings.admin_pin,
      greeting: settings.greeting,
    },
    appointments,
    calls,
    notifications,
  };
}

function saveStore(db: DatabaseSync, store: StoreData): void {
  db.exec("BEGIN");
  db.exec("DELETE FROM call_messages");
  db.exec("DELETE FROM notifications");
  db.exec("DELETE FROM calls");
  db.exec("DELETE FROM appointments");
  db.exec("DELETE FROM settings");

  db.prepare(
    `INSERT INTO settings (id, facility_name, facility_type, admin_pin, greeting)
     VALUES (1, ?, ?, ?, ?)`,
  ).run(store.settings.facilityName, store.settings.facilityType, store.settings.adminPin, store.settings.greeting);

  const insertApt = db.prepare(
    `INSERT INTO appointments (
      id, visitor_name, visitor_org, host_name, purpose, date, start_time, end_time,
      visit_code, status, notes, arrived_at, departed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const a of store.appointments) {
    insertApt.run(
      a.id,
      a.visitorName,
      a.visitorOrg,
      a.hostName,
      a.purpose,
      a.date,
      a.startTime,
      a.endTime,
      a.visitCode,
      a.status,
      a.notes,
      a.arrivedAt,
      a.departedAt,
      a.createdAt,
    );
  }

  const insertCall = db.prepare(
    `INSERT INTO calls (
      id, appointment_id, visitor_name, reason, status, created_at, started_at, ended_at,
      offer_json, answer_json, ice_from_visitor_json, ice_from_admin_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertMsg = db.prepare(
    `INSERT INTO call_messages (id, call_id, role, text, at) VALUES (?, ?, ?, ?, ?)`,
  );
  for (const c of store.calls) {
    insertCall.run(
      c.id,
      c.appointmentId,
      c.visitorName,
      c.reason,
      c.status,
      c.createdAt,
      c.startedAt,
      c.endedAt,
      JSON.stringify(c.signal.offer),
      JSON.stringify(c.signal.answer),
      JSON.stringify(c.signal.iceFromVisitor),
      JSON.stringify(c.signal.iceFromAdmin),
    );
    for (const m of c.messages) {
      insertMsg.run(m.id, c.id, m.role, m.text, m.at);
    }
  }

  const insertNtf = db.prepare(
    `INSERT INTO notifications (
      id, type, appointment_id, call_id, visitor_name, message, created_at, read
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const n of store.notifications) {
    insertNtf.run(
      n.id,
      n.type,
      n.appointmentId,
      n.callId,
      n.visitorName,
      n.message,
      n.createdAt,
      n.read ? 1 : 0,
    );
  }
  db.exec("COMMIT");
}

function readStore(): StoreData {
  const db = openDb();
  try {
    const existing = loadStore(db);
    if (existing) {
      if (alignDemoDates(existing)) saveStore(db, existing);
      return existing;
    }

    let initial = defaultStore();
    if (existsSync(LEGACY_JSON)) {
      try {
        const parsed = JSON.parse(readFileSync(LEGACY_JSON, "utf8")) as StoreData;
        if (parsed.settings && Array.isArray(parsed.appointments)) {
          parsed.calls ??= [];
          parsed.notifications ??= [];
          initial = parsed;
        }
      } catch {
        /* seed を使う */
      }
    }
    alignDemoDates(initial);
    saveStore(db, initial);
    return initial;
  } finally {
    db.close();
  }
}

function writeStore(store: StoreData): void {
  const db = openDb();
  try {
    saveStore(db, store);
  } finally {
    db.close();
  }
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

export function dbFilePath(): string {
  return DB_PATH;
}
