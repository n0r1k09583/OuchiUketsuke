# おうち受付（OuchiUketsuke）

ホテルや会社の来客受付を、自宅から担当できるアプリです。入口の受付画面でお客様が到着を知らせると、管理者の画面に通知が届きます。ご用件があれば、ビデオ通話とチャットで直接話せます。

スクールの課題として開発しています。提出用リポジトリの構成は、学校の例（[RecipeManager](https://github.com/marinnk/RecipeManager)）に合わせ、**フロントエンドとバックエンドを分けています**。

## 学校の先生へ

- 本アプリは **学校提出用** です。**一般公開はしていません**（本番 URL はありません）。
- AWS は **無料枠の範囲** で扱い、月額費用がかからないよう **常時稼働サーバーは残していません**。
- 先生向けの説明: [docs/aws-for-teacher.md](docs/aws-for-teacher.md)
- 動作確認は下の「セットアップ」（http://localhost:3000 ）でお願いします。

## 公開URL

**なし（未公開）。** 課金を避けるため AWS 実サーバーは残していません。アプリはローカルで起動して確認します。

## 構成（フロント / バック）

```
おうち受付
├── フロントエンド（Next.js） … 画面だけ。src/app の受付・管理者・通話
└── バックエンド（Express）   … API とデータ保存。backend/
        ↑
   ブラウザの /api/* は Next.js がバックエンド（:8080）へ転送する
```

| レイヤー | 役割 | 場所 | ポート |
|----------|------|------|--------|
| フロントエンド | 受付画面・管理者画面・通話UI | `src/app` など | 3000 |
| バックエンド | 予定・到着・通知・通話API、JSON保存 | `backend/` | 8080 |

## 使い方

ブラウザを2つ開く（または PC とスマホ）と、受付と管理者の流れを確認できます。

- 受付: http://localhost:3000/reception
- 管理者: http://localhost:3000/admin （初期PIN `1234`）
- サンプル受付番号: `4821` / `7390` / `1564` / `8203`

## 技術スタック

| レイヤー | 採用技術 |
|----------|----------|
| フロントエンド | Next.js + TypeScript + React |
| バックエンド | Node.js + Express + TypeScript |
| 保存 | JSONファイル（`backend/data/store.json`） |
| 通話 | WebRTC（ブラウザ同士。合図だけバックエンドが仲介） |
| インフラ | AWSは無料枠の定義のみ。**実リソースは作らない／作ったら即削除** |

## ドキュメント

- [要件定義書](docs/requirements.md) — 何を作るか・なぜ作るか
- [基本設計書](docs/basic-design.md) — どう作るか（フロント／バック、画面、データ、API）
- [提出用PDF](docs/要件定義書.pdf) — 学校提出用の要件定義書
- [学校の先生へ（AWS）](docs/aws-for-teacher.md) — 無料枠・未公開・ローカル評価

## セットアップ

### 前提

- Node.js 20 以上
- npm

### 手順

```sh
npm install
npm install --prefix backend
npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8080/api/health

### Lint

```sh
npm run lint
```

## AWS について（課金しない）

この課題では **お金がかからないこと** を最優先にします。

1. AWS CLI は入れられる
2. アカウントの認証情報がない／課金が怖い場合は、**実リソースを作らない**
3. もし無料枠で EC2 などを作った場合は、確認が終わったら **すぐに削除（terraform destroy）** する

詳細は [infra/terraform/README.md](infra/terraform/README.md) を参照。
