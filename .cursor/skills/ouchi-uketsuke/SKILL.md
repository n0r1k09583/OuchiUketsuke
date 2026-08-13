---
name: ouchi-uketsuke
description: >-
  おうち受付（お問い合わせアプリ）の実装ルール。ホテル・会社の受付担当向け。
  管理者スケジュール画面、受付キオスク、到着／帰宅（チェックアウト）通知、ビデオ/チャット、
  Next.js フロントと Express バック、JSON保存。
  Use when editing ScheduleBoard, AdminDashboard, ReceptionKiosk, DemoGuide,
  CallRoom, backend API, or when the user mentions スケジュール / 受付 / お問い合わせ /
  おうち受付 / チェックアウト / 帰宅 / 試す番号.
---

# おうち受付 Skill

ユーザー確認済み（2026-08-13）: **管理者のスケジュール画面は現状のまま維持する（素晴らしい、と確認済み）。**
到着・帰宅の状態表示はスケジュールへ載せるが、日付移動・追加・編集・削除の操作感は崩さない。

## 作品の位置づけ

- **お問い合わせアプリ**。ホテルや会社の受付の人が使いやすいことが第一。
- 前回課題（React+TypeScript+Vite+Tailwind、Java+Spring Boot+Gradle+PostgreSQL）とは **別スタック**。
- 本課題: Next.js（画面）+ Express（API）+ JSON + WebRTC。Vite / Spring / PostgreSQL は入れない。
- 一般公開しない。AWS 常時稼働サーバーは残さない。

## アーキテクチャ

- フロント: Next.js `src/app` ポート 3000。`/api/*` は `BACKEND_URL`（既定 `http://localhost:8080`）へ rewrites。
- バック: `backend/src/server.ts` ポート 8080。保存は `backend/data/store.json`（Git に含めない）。
- フロントに API Route を戻さない。データはバックエンドだけが書く。
- 起動: `npm install` / `npm install --prefix backend` / `npm run dev`

## 到着と帰宅（チェックアウト）

- 状態 `departed`。ホテルは「チェックアウト」、会社は「帰宅」。設定の `facilityType` でラベルを分ける。
- 受付キオスク: 「ご予約の方」で到着、「チェックアウト／お帰り」で退出。`POST /api/checkin` と `POST /api/checkout`。
- 管理者「本日の受付」: 到着通知と帰宅通知（音あり）。滞在中は「チェックアウトにする／帰宅にする」。
- スケジュール: 状態ピルと「到着 HH:mm ／ チェックアウト（帰宅）HH:mm」を表示する。CRUD の見た目は変えない。
- 前日到着でまだ退出していない来客は、本日の受付にも出す（ホテルの泊まり）。
- 予定フィールド: `arrivedAt` / `departedAt`。通知 type: `arrival` | `departure` | `call`。

## 管理者スケジュール（確認済み・崩さない）

- URL: http://localhost:3000/admin/schedule
- 実装: `src/app/admin/schedule/page.tsx` → `src/components/ScheduleBoard.tsx`
- PIN: `1234`（`AdminShell`）
- できること: 日付移動、追加、時刻順一覧、編集、削除、受付番号表示
- 「本日の受付」(`/admin`) は到着・帰宅・着信。「予定の CRUD」はスケジュール画面に置く。混ぜない。

フォーム項目は `AppointmentForm`: お客様名（必須）、会社、担当者、用件、日付、開始・終了、受付番号（空なら自動）、メモ。

## 主な画面

| 画面 | パス |
|------|------|
| トップ（試す番号一覧） | `/` （`DemoGuide`） |
| 受付キオスク | `/reception` |
| 本日の受付 | `/admin` |
| スケジュール | `/admin/schedule` |
| 設定 | `/admin/settings` |
| 通話 | `/call/[id]?role=admin\|visitor` |

## 試す番号（管理者 PIN `1234`）

定数は `src/lib/demoSamples.ts`。シードは `backend/src/store.ts`。トップに表、受付ホーム下部にも当日番号を出す。

| 番号 | お名前 | 用件 | いつ | 試し方 |
|------|--------|------|------|--------|
| 4821 | 田中 美咲 | ご宿泊チェックイン | 本日 10:00 | 到着 → チェックアウト |
| 7390 | 佐藤 健 | 商談 | 本日 11:30 | 到着 → 帰宅 |
| 1564 | 鈴木 花子 | 施設見学 | 本日 14:00 | 到着 → 帰宅 |
| 8203 | 高橋 一郎 | 採用面接 | 本日 16:00 | 到着 → 帰宅 |
| 9012 | 林 さくら | 団体予約の確認 | 翌日 09:30 | スケジュールで翌日を開く |

流れ: ブラウザ2つ（受付と管理者）→ 受付「ご予約の方」→ 番号 → 到着を知らせる → 管理者に通知 → 同じ番号で「チェックアウト／お帰り」。

## 改修時

- スケジュール画面のレイアウト・操作感を勝手に大きく変えない。
- 受付の大きなボタン、管理者の一覧＋通知、という役割分担を維持する。
- 試す番号を変えるときは `demoSamples.ts` と `store.ts` のシードを揃える。
