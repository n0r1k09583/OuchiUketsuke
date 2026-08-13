import cors from "cors";
import express, { type Request, type Response } from "express";
import { newId, normalizeName, nowHM, randomVisitCode, todayISO } from "./format";
import { emptySignal, getSnapshot, pushNotification, withStore } from "./store";
import type {
  Appointment,
  AppointmentStatus,
  CallRecord,
  CallRole,
  CallStatus,
  FacilityType,
} from "./types";

const PORT = Number(process.env.PORT ?? 8080);
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ouchi-uketsuke-backend" });
});

app.get("/api/snapshot", (_req, res) => {
  res.json(getSnapshot());
});

app.post("/api/auth", (req: Request, res: Response) => {
  const pin = String(req.body?.pin ?? "").trim();
  const { settings } = getSnapshot();
  if (pin !== settings.adminPin) {
    res.status(401).json({ ok: false, error: "暗証番号が違います" });
    return;
  }
  res.json({ ok: true, facilityName: settings.facilityName });
});

app.patch("/api/settings", async (req: Request, res: Response) => {
  const body = req.body as {
    facilityName?: string;
    facilityType?: FacilityType;
    adminPin?: string;
    greeting?: string;
  };
  const settings = await withStore((store) => {
    if (typeof body.facilityName === "string" && body.facilityName.trim()) {
      store.settings.facilityName = body.facilityName.trim();
    }
    if (body.facilityType === "hotel" || body.facilityType === "office") {
      store.settings.facilityType = body.facilityType;
    }
    if (typeof body.adminPin === "string" && /^\d{4}$/.test(body.adminPin)) {
      store.settings.adminPin = body.adminPin;
    }
    if (typeof body.greeting === "string") {
      store.settings.greeting = body.greeting.trim();
    }
    return store.settings;
  });
  res.json(settings);
});

app.post("/api/appointments", async (req: Request, res: Response) => {
  const body = req.body as Partial<Appointment>;
  if (!body.visitorName?.trim() || !body.date || !body.startTime) {
    res.status(400).json({ error: "お名前・日付・開始時刻は必須です" });
    return;
  }
  const appointment = await withStore((store) => {
    const item: Appointment = {
      id: newId("apt"),
      visitorName: body.visitorName!.trim(),
      visitorOrg: body.visitorOrg?.trim() ?? "",
      hostName: body.hostName?.trim() ?? "",
      purpose: body.purpose?.trim() || "来訪",
      date: body.date!,
      startTime: body.startTime!,
      endTime: body.endTime || "",
      visitCode: body.visitCode?.trim() || randomVisitCode(),
      status: "scheduled",
      notes: body.notes?.trim() ?? "",
      arrivedAt: null,
      createdAt: new Date().toISOString(),
    };
    store.appointments.push(item);
    return item;
  });
  res.json(appointment);
});

const STATUSES: AppointmentStatus[] = [
  "scheduled",
  "arrived",
  "in-call",
  "completed",
  "cancelled",
  "no-show",
];

app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as Partial<Appointment>;
  const updated = await withStore((store) => {
    const item = store.appointments.find((a) => a.id === id);
    if (!item) return null;
    if (typeof body.visitorName === "string") item.visitorName = body.visitorName.trim();
    if (typeof body.visitorOrg === "string") item.visitorOrg = body.visitorOrg.trim();
    if (typeof body.hostName === "string") item.hostName = body.hostName.trim();
    if (typeof body.purpose === "string") item.purpose = body.purpose.trim();
    if (typeof body.date === "string") item.date = body.date;
    if (typeof body.startTime === "string") item.startTime = body.startTime;
    if (typeof body.endTime === "string") item.endTime = body.endTime;
    if (typeof body.visitCode === "string") item.visitCode = body.visitCode.trim();
    if (typeof body.notes === "string") item.notes = body.notes.trim();
    if (body.status && STATUSES.includes(body.status)) item.status = body.status;
    return item;
  });
  if (!updated) {
    res.status(404).json({ error: "予約が見つかりません" });
    return;
  }
  res.json(updated);
});

app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = await withStore((store) => {
    const before = store.appointments.length;
    store.appointments = store.appointments.filter((a) => a.id !== id);
    return store.appointments.length < before;
  });
  if (!ok) {
    res.status(404).json({ error: "予約が見つかりません" });
    return;
  }
  res.json({ ok: true });
});

app.post("/api/checkin", async (req: Request, res: Response) => {
  const query = String(req.body?.query ?? "").trim();
  if (!query) {
    res.status(400).json({ error: "お名前または受付番号を入力してください" });
    return;
  }
  const today = todayISO();
  const digits = query.replace(/\D/g, "");
  const nameKey = normalizeName(query);
  const result = await withStore((store) => {
    const todays = store.appointments.filter(
      (a) => a.date === today && a.status !== "cancelled",
    );
    let match: Appointment | undefined;
    if (digits.length === 4) match = todays.find((a) => a.visitCode === digits);
    if (!match) {
      const named = todays.filter((a) => {
        const n = normalizeName(a.visitorName);
        return n === nameKey || n.includes(nameKey) || nameKey.includes(n);
      });
      match =
        named.find((a) => a.status === "scheduled" || a.status === "arrived") ?? named[0];
    }
    if (!match || (match.status !== "scheduled" && match.status !== "arrived" && match.status !== "in-call")) {
      return { error: "本日のご予約が見つかりませんでした" as const, appointment: null };
    }
    if (match.status === "scheduled") {
      match.status = "arrived";
      match.arrivedAt = new Date().toISOString();
      pushNotification(store, {
        type: "arrival",
        appointmentId: match.id,
        callId: null,
        visitorName: match.visitorName,
        message: `${match.visitorName} 様が受付に到着されました（${match.purpose}）`,
      });
    }
    return { error: null, appointment: match };
  });
  if (result.error) {
    res.status(404).json({ error: result.error });
    return;
  }
  res.json({ appointment: result.appointment });
});

app.post("/api/calls", async (req: Request, res: Response) => {
  const body = req.body as {
    appointmentId?: string | null;
    visitorName?: string;
    reason?: "arrival" | "inquiry";
    startedBy?: "admin" | "visitor";
  };
  const visitorName = body.visitorName?.trim();
  if (!visitorName) {
    res.status(400).json({ error: "お名前が必要です" });
    return;
  }
  const call = await withStore((store) => {
    const existing = store.calls.find(
      (c) =>
        (c.status === "ringing" || c.status === "active") &&
        ((body.appointmentId && c.appointmentId === body.appointmentId) ||
          (!body.appointmentId && c.visitorName === visitorName && c.reason === "inquiry")),
    );
    if (existing) return existing;

    let appointmentId = body.appointmentId ?? null;
    if (!appointmentId && (body.reason ?? "inquiry") === "inquiry") {
      const walkIn: Appointment = {
        id: newId("apt"),
        visitorName,
        visitorOrg: "",
        hostName: "受付",
        purpose: "お問い合わせ",
        date: todayISO(),
        startTime: nowHM(),
        endTime: "",
        visitCode: randomVisitCode(),
        status: "in-call",
        notes: "予約なしの来訪",
        arrivedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      store.appointments.push(walkIn);
      appointmentId = walkIn.id;
    }

    const item: CallRecord = {
      id: newId("call"),
      appointmentId,
      visitorName,
      reason: body.reason ?? "inquiry",
      status: "ringing",
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      messages: [],
      signal: emptySignal(),
    };
    store.calls.unshift(item);
    if (appointmentId) {
      const apt = store.appointments.find((a) => a.id === appointmentId);
      if (apt) {
        if (apt.status === "scheduled") {
          apt.status = "arrived";
          apt.arrivedAt = apt.arrivedAt ?? new Date().toISOString();
        }
        apt.status = "in-call";
      }
    }
    const fromAdmin = body.startedBy === "admin";
    pushNotification(store, {
      type: "call",
      appointmentId: item.appointmentId,
      callId: item.id,
      visitorName,
      message: fromAdmin
        ? `${visitorName} 様へ通話を発信しました`
        : `${visitorName} 様が受付とお話を希望しています`,
    });
    return item;
  });
  res.json(call);
});

app.get("/api/calls/:id", (req: Request, res: Response) => {
  const call = getSnapshot().calls.find((c) => c.id === req.params.id) ?? null;
  if (!call) {
    res.status(404).json({ error: "通話が見つかりません" });
    return;
  }
  res.json(call);
});

app.patch("/api/calls/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as { status?: CallStatus; resetSignal?: boolean };
  const updated = await withStore((store) => {
    const call = store.calls.find((c) => c.id === id);
    if (!call) return null;
    if (body.status === "active" && call.status === "ringing") {
      call.status = "active";
      call.startedAt = new Date().toISOString();
    }
    if (body.status === "ended") {
      call.status = "ended";
      call.endedAt = new Date().toISOString();
      if (call.appointmentId) {
        const apt = store.appointments.find((a) => a.id === call.appointmentId);
        if (apt && apt.status === "in-call") apt.status = "arrived";
      }
    }
    if (body.resetSignal) call.signal = emptySignal();
    return call;
  });
  if (!updated) {
    res.status(404).json({ error: "通話が見つかりません" });
    return;
  }
  res.json(updated);
});

app.post("/api/calls/:id/messages", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as { role?: CallRole; text?: string };
  if (!body.role || !body.text?.trim()) {
    res.status(400).json({ error: "メッセージが空です" });
    return;
  }
  const message = await withStore((store) => {
    const call = store.calls.find((c) => c.id === id);
    if (!call) return null;
    const item = {
      id: newId("msg"),
      role: body.role!,
      text: body.text!.trim(),
      at: new Date().toISOString(),
    };
    call.messages.push(item);
    if (call.status === "ringing") {
      call.status = "active";
      call.startedAt = call.startedAt ?? new Date().toISOString();
    }
    return item;
  });
  if (!message) {
    res.status(404).json({ error: "通話が見つかりません" });
    return;
  }
  res.json(message);
});

app.get("/api/calls/:id/signal", (req: Request, res: Response) => {
  const signal = getSnapshot().calls.find((c) => c.id === req.params.id)?.signal ?? null;
  if (!signal) {
    res.status(404).json({ error: "通話が見つかりません" });
    return;
  }
  res.json(signal);
});

app.post("/api/calls/:id/signal", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as {
    role?: CallRole;
    type?: "offer" | "answer" | "ice";
    payload?: CallRecord["signal"]["offer"] | CallRecord["signal"]["iceFromVisitor"][number];
  };
  const signal = await withStore((store) => {
    const call = store.calls.find((c) => c.id === id);
    if (!call) return null;
    if (body.type === "offer") {
      call.signal.offer = body.payload as CallRecord["signal"]["offer"];
      call.signal.answer = null;
      call.signal.iceFromVisitor = [];
      call.signal.iceFromAdmin = [];
    }
    if (body.type === "answer") {
      call.signal.answer = body.payload as CallRecord["signal"]["answer"];
    }
    if (body.type === "ice" && body.role && body.payload) {
      const ice = body.payload as CallRecord["signal"]["iceFromVisitor"][number];
      if (body.role === "visitor") call.signal.iceFromVisitor.push(ice);
      else call.signal.iceFromAdmin.push(ice);
    }
    return call.signal;
  });
  if (!signal) {
    res.status(404).json({ error: "通話が見つかりません" });
    return;
  }
  res.json(signal);
});

app.patch("/api/notifications/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as { read?: boolean };
  const updated = await withStore((store) => {
    const item = store.notifications.find((n) => n.id === id);
    if (!item) return null;
    if (typeof body.read === "boolean") item.read = body.read;
    return item;
  });
  if (!updated) {
    res.status(404).json({ error: "通知が見つかりません" });
    return;
  }
  res.json(updated);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`backend listening on http://localhost:${PORT}`);
});
