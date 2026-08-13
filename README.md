# おうち受付（お問い合わせアプリ）

ホテルや会社の **受付の人** が使いやすいよう考えた、スクール課題の **お問い合わせアプリ** です。お客様は入口の画面から用件を伝え、受付担当は自宅から予定を見て、到着に気づき、ビデオまたはチャットで直接応対できます。

前回課題（React + TypeScript + **Vite** + Tailwind、**Java + Spring Boot + Gradle + PostgreSQL**）とは **異なる技術スタック** を使っています。AI を補助にしつつ、選定と構築は自分で行い、特定技術に依存しない応用力を示す作品です。

証明資料: [docs/tech-selection.md](docs/tech-selection.md)

## 学校の先生へ

- **お問い合わせアプリ**（受付担当が主役）です。
- 前回の Vite / Spring / PostgreSQL は使っていません（Next.js + Express + JSON + WebRTC）。
- **一般公開していません。** 本番 URL はありません。
- AWS は無料枠の方針のみ。常時稼働サーバーは残していません（月額課金なし）。
- 先生向け: [docs/aws-for-teacher.md](docs/aws-for-teacher.md) ／ [技術選定書](docs/tech-selection.md)
- 動作確認: http://localhost:3000 （管理者 PIN `1234`）

## 公開URL

**なし（未公開・学校提出用）。**

## 構成（フロント / バック）

```
おうち受付
├── フロントエンド（Next.js） … 画面。受付・管理者・通話
└── バックエンド（Express）   … お問い合わせ・予定・通知の API
```

| レイヤー | 役割 | 場所 | ポート |
|----------|------|------|--------|
| フロントエンド | 受付・管理者・通話 UI | `src/app` | 3000 |
| バックエンド | API と JSON 保存 | `backend/` | 8080 |

## 使い方

- 受付（お客様）: http://localhost:3000/reception
- 管理者（受付の人）: http://localhost:3000/admin
- スケジュール: http://localhost:3000/admin/schedule

## 試す番号

管理者の暗証番号は **1234**。ブラウザを2つ開き、一方を受付・他方を管理者にする。

| 番号 | お名前 | 用件 | 時刻 | 試し方 |
|------|--------|------|------|--------|
| **4821** | 田中 美咲 | ご宿泊チェックイン | 本日 10:00 | 到着 → チェックアウト |
| **7390** | 佐藤 健（佐藤商事） | 商談 | 本日 11:30 | 到着 → 帰宅 |
| **1564** | 鈴木 花子（花デザイン） | 施設見学 | 本日 14:00 | 到着 → 帰宅 |
| **8203** | 高橋 一郎 | 採用面接 | 本日 16:00 | 到着 → 帰宅 |
| **9012** | 林 さくら（桜トラベル） | 団体予約の確認 | 翌日 09:30 | スケジュールで翌日を開く |

流れ: 受付「ご予約の方」→ 番号入力 → 到着を知らせる → 管理者に通知。同じ番号で「チェックアウト／お帰り」すると帰宅通知が出る。

## 技術スタック（前回と違う）

| レイヤー | 本課題 | 前回（使わない） |
|----------|--------|------------------|
| フロント | Next.js + TypeScript | Vite + React + TypeScript |
| バック | Node.js + Express | Java + Spring Boot + Gradle |
| 保存 | JSON ファイル | PostgreSQL |
| 問い合わせ通話 | WebRTC | — |

## ドキュメント

- [技術選定書・学習の証明](docs/tech-selection.md) — 先生への証明
- [要件定義書](docs/requirements.md)
- [基本設計書](docs/basic-design.md)
- [提出用HTML](docs/要件定義書.html)
- [学校の先生へ（AWS）](docs/aws-for-teacher.md)

## セットアップ

```sh
npm install
npm install --prefix backend
npm run dev
```

- フロント: http://localhost:3000
- バック: http://localhost:8080/api/health
