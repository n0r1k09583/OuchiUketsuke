# 学校の先生へ — AWS と提出の見方

本アプリ「おうち受付」はスクール課題の **お問い合わせアプリ** です。ホテルや会社の受付の人が使いやすいよう作っています。  
**アプリの本番公開はしていません。** インターネット上で動く受付画面はありません。ソースと提出資料は GitHub で閲覧できます。

提出用 GitHub: https://github.com/n0r1k09583/OuchiUketsuke

前回課題（Vite / Java Spring Boot Gradle / PostgreSQL）とは **違う技術**（Next.js / Express / JSON / WebRTC）です。選定の証明は [tech-selection.md](./tech-selection.md) を見てください。

## AWS を使ったこと（無料枠・学校提出用）

学校の例（RecipeManager）に合わせ、次を実施・記録しています。

| 項目 | 内容 |
|------|------|
| 目的 | 学校提出用に、AWS を無料枠の範囲で扱う |
| AWS CLI | 課題作業のためダウンロード・導入した |
| Terraform | `infra/terraform/` に VPC・セキュリティグループ・EC2 を定義した |
| 常時稼働サーバー | **残していない**（確認後は destroy。月額費用を出さないため） |
| 一般公開 | ソースは GitHub で閲覧可。AWS の常時稼働アプリは残していない |

Terraform の本体は次です。`main.tf` だけでなく、課題で求められている resource も含めています。

GitHub: https://github.com/n0r1k09583/OuchiUketsuke/tree/main/infra/terraform

| ファイル | 定義 |
|----------|------|
| `network.tf` | VPC、Internet Gateway、公開サブネット |
| `security_groups.tf` | SSH とアプリポートを自分の IP だけ許可 |
| `ec2.tf` | 無料枠の t3.micro |

NAT Gateway・ロードバランサー・RDS・CloudFront は使いません（高くなりやすい／本アプリは JSON 保存）。  
確認が終わったクラウド資源は残しません。

## 先生が動作を見るとき（こちらを使ってください）

課金なしで、この PC（または提出されたソース）で起動します。

```sh
cd ouchi-uketsuke
npm install
npm install --prefix backend
npm run dev
```

| 画面 | URL |
|------|-----|
| トップ | http://localhost:3000 |
| 受付（来客） | http://localhost:3000/reception |
| 管理者（自宅） | http://localhost:3000/admin |
| スケジュール管理 | http://localhost:3000/admin/schedule |

管理者の初期暗証番号は `1234` です。

## フロントエンドとバックエンド

| | 役割 | 場所 |
|---|------|------|
| フロントエンド | 画面 | Next.js（ポート 3000） |
| バックエンド | API・データ | Express（ポート 8080） |

ブラウザの `/api/*` はフロントからバックエンドへ転送されます。

## なぜ本番 URL がないか

AWS を常時つけておくと月額費用がかかります。本課題ではそれを避け、**学校提出用の構成説明＋ローカル起動** にしています。
