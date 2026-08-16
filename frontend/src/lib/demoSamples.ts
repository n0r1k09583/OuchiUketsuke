export const DEMO_ADMIN_PIN = "1234";

export type DemoSample = {
  visitCode: string;
  visitorName: string;
  visitorOrg: string;
  purpose: string;
  startTime: string;
  endTime: string;
  day: "today" | "tomorrow";
  hint: string;
};

export const DEMO_SAMPLES: DemoSample[] = [
  {
    visitCode: "4821",
    visitorName: "田中 美咲",
    visitorOrg: "",
    purpose: "ご宿泊チェックイン",
    startTime: "10:00",
    endTime: "10:30",
    day: "today",
    hint: "ホテルの到着 → チェックアウト",
  },
  {
    visitCode: "7390",
    visitorName: "佐藤 健",
    visitorOrg: "佐藤商事",
    purpose: "商談",
    startTime: "11:30",
    endTime: "12:30",
    day: "today",
    hint: "会社来客の到着 → 帰宅",
  },
  {
    visitCode: "1564",
    visitorName: "鈴木 花子",
    visitorOrg: "花デザイン",
    purpose: "施設見学",
    startTime: "14:00",
    endTime: "15:00",
    day: "today",
    hint: "見学の到着 → 帰宅",
  },
  {
    visitCode: "8203",
    visitorName: "高橋 一郎",
    visitorOrg: "",
    purpose: "採用面接",
    startTime: "16:00",
    endTime: "17:00",
    day: "today",
    hint: "面接の到着 → 帰宅",
  },
  {
    visitCode: "9012",
    visitorName: "林 さくら",
    visitorOrg: "桜トラベル",
    purpose: "団体予約の確認",
    startTime: "09:30",
    endTime: "10:00",
    day: "tomorrow",
    hint: "翌日分。スケジュールで日付を進めて確認",
  },
];
