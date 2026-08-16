# おうち受付 — バックエンド詳細

学校提出用。実装の正は `backend/src/server.ts` です。

関連: [基本設計書](./basic-design.md) ／ [提出資料の入口](./README.md)

## 1. 役割

フロントエンド（`frontend/` の Next.js :3000）は画面だけを持ちます。予定・通知・通話の合図・設定の読み書きは、すべてバックエンド（`backend/` の Express :8080）が行います。フォルダもプロジェクトも分けています。

```
ブラウザ  →  frontend/  Next.js :3000（画面）
                └── /api/* を転送 →  backend/  Express :8080
                                              └── backend/data/store.json
```

- 起動: `cd backend` → `npm install` → `npm run dev`
- 生存確認: `GET http://localhost:8080/api/health`
- フロントの転送先: `frontend/next.config.ts` の `BACKEND_URL`（既定 `http://localhost:8080`）

## 2. ファイル構成

```
backend/
  src/
    server.ts    API（Express）
    store.ts     JSON の読み書き、サンプル予定の初期化
    types.ts     型
    format.ts    日付・番号・氏名の正規化
  data/
    store.json   実行時データ（Git に含めない）
  package.json
```

前回課題の Java + Spring Boot + Gradle + PostgreSQL は使っていません。

## 3. 保存するデータ

`store.json` は次の4つです。

| キー | 内容 |
|------|------|
| settings | 施設名、ホテル／会社、PIN、あいさつ |
| appointments | 来客予定（氏名、日時、受付番号、到着／退出時刻、状態） |
| calls | 通話（着信、チャット、WebRTC の合図） |
| notifications | 到着・帰宅・着信の通知 |

### 来客予定の状態

`scheduled` → `arrived` →（任意で `in-call`）→ `departed`

ほかに `completed`（対応済）、`cancelled`、`no-show`。

ホテルでは `departed` を「チェックアウト」、会社では「帰宅」と表示します。

## 4. API一覧

失敗時は HTTP ステータスと `{ "error": "日本語メッセージ" }` を返します。

| メソッド | パス | 内容 |
|----------|------|------|
| GET | `/api/health` | 起動確認 `{ ok: true, service: "ouchi-uketsuke-backend" }` |
| GET | `/api/snapshot` | 設定・予定・通話・通知をまとめて返す |
| POST | `/api/auth` | 管理者 PIN 照合 |
| PATCH | `/api/settings` | 施設設定の更新 |
| POST | `/api/appointments` | 予定の登録（番号が空なら4桁を発行） |
| PATCH | `/api/appointments/:id` | 予定の更新。状態を `departed` にすると帰宅通知 |
| DELETE | `/api/appointments/:id` | 予定の削除 |
| POST | `/api/checkin` | 氏名または4桁番号で到着申告 |
| POST | `/api/checkout` | 氏名・番号または予定IDでチェックアウト／帰宅 |
| POST | `/api/calls` | 通話の作成（既存の着信があれば再利用） |
| GET | `/api/calls/:id` | 通話の取得 |
| PATCH | `/api/calls/:id` | 状態更新（応答・終了） |
| POST | `/api/calls/:id/messages` | チャット送信 |
| GET / POST | `/api/calls/:id/signal` | WebRTC の offer / answer / ICE |
| PATCH | `/api/notifications/:id` | 既読にする |

## 5. リクエスト例

### 管理者ログイン

```http
POST /api/auth
Content-Type: application/json

{ "pin": "1234" }
```

成功: `{ "ok": true, "facilityName": "グランドホテル桜" }`  
失敗: `401` `{ "ok": false, "error": "暗証番号が違います" }`

### 到着

```http
POST /api/checkin
{ "query": "4821" }
```

当日の予定と照合し、初めてなら状態を `arrived` にし、到着通知を作ります。

### チェックアウト／帰宅

```http
POST /api/checkout
{ "query": "4821" }
```

管理者画面から行う場合:

```http
POST /api/checkout
{ "appointmentId": "apt_xxx" }
```

状態を `departed` にし、`departedAt` を記録し、帰宅通知を作ります。通話中なら通話を終了します。前日到着の滞在も番号・氏名で照合できます。

### 予定の登録

```http
POST /api/appointments
{
  "visitorName": "田中 美咲",
  "date": "2026-08-13",
  "startTime": "10:00",
  "endTime": "10:30",
  "purpose": "ご宿泊チェックイン",
  "hostName": "フロント"
}
```

### お問い合わせ通話

```http
POST /api/calls
{
  "visitorName": "山田 太郎",
  "reason": "inquiry",
  "startedBy": "visitor"
}
```

予約がなくても、その場で予定レコードを作り、管理者へ着信通知を出します。

## 6. フロントとの分担

| 処理 | どこが行うか |
|------|----------------|
| ボタン・一覧の表示 | フロント（Next.js） |
| 予定の保存・照合 | バックエンド |
| 到着／帰宅の通知 | バックエンドが書き、フロントが数秒ごとに snapshot を読む |
| ビデオ映像 | 端末同士（WebRTC）。合図だけバックエンド |
| チャット本文 | バックエンドの `calls[].messages` |

フロント（`frontend/`）に API Route は置きません。データはバックエンドだけが書きます。

## 7. 初期サンプル（試す番号）

初回起動時に `store.ts` が当日／翌日の予定を入れます。

| 番号 | 氏名 | 用件 |
|------|------|------|
| 4821 | 田中 美咲 | ご宿泊チェックイン |
| 7390 | 佐藤 健 | 商談 |
| 1564 | 鈴木 花子 | 施設見学 |
| 8203 | 高橋 一郎 | 採用面接 |
| 9012 | 林 さくら | 翌日・団体予約の確認 |

管理者 PIN の初期値は `1234` です。
