export type FacilityType = "hotel" | "office";

export type AppointmentStatus =
  | "scheduled"
  | "arrived"
  | "in-call"
  | "completed"
  | "cancelled"
  | "no-show";

export type CallStatus = "ringing" | "active" | "ended";

export type CallRole = "admin" | "visitor";

export type Settings = {
  facilityName: string;
  facilityType: FacilityType;
  adminPin: string;
  greeting: string;
};

export type Appointment = {
  id: string;
  visitorName: string;
  visitorOrg: string;
  hostName: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  visitCode: string;
  status: AppointmentStatus;
  notes: string;
  arrivedAt: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: CallRole;
  text: string;
  at: string;
};

export type IceCandidate = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type SessionDescription = {
  type?: "offer" | "answer" | "pranswer" | "rollback";
  sdp?: string;
};

export type CallRecord = {
  id: string;
  appointmentId: string | null;
  visitorName: string;
  reason: "arrival" | "inquiry";
  status: CallStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  messages: ChatMessage[];
  signal: {
    offer: SessionDescription | null;
    answer: SessionDescription | null;
    iceFromVisitor: IceCandidate[];
    iceFromAdmin: IceCandidate[];
  };
};

export type AppNotification = {
  id: string;
  type: "arrival" | "call";
  appointmentId: string | null;
  callId: string | null;
  visitorName: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type StoreData = {
  settings: Settings;
  appointments: Appointment[];
  calls: CallRecord[];
  notifications: AppNotification[];
};

export type Snapshot = StoreData;
