---
name: ouchi-uketsuke-aws
description: >-
  おうち受付の学校提出向け AWS 無料枠ルール。月額課金禁止、実サーバー常時稼働禁止。
  AWS・Terraform・デプロイ・課金の話が出たら必ず使う。
---

# おうち受付 — AWS 無料枠（学校提出）

このプロジェクトは **学校提出用**。AWS の月額費用は出さない。

GitHub のソースは先生確認のため public。**アプリを AWS 上で常時公開しない。**

## 絶対ルール

1. **アプリの本番公開をしない**  
   本番ドメイン、アプリストア、Vercel 本番、常時動く受付画面は作らない。
2. **AWS を作りっぱなしにしない**  
   EC2 / RDS / NAT Gateway / ALB / CloudFront を常時稼働で残さない。
3. **有料になりやすいものは使わない**  
   NAT Gateway、ロードバランサー、有料 RDS、固定の大きいインスタンスは禁止。
4. **先生向けには「無料枠で学校提出」と分かる文書と Terraform を残す**  
   実サーバーを常時残すことと、VPC / SG / EC2 の定義を残すことは別。定義は `infra/terraform/` に置く。
5. **認証キーを Git に書かない**  
   `.aws/credentials`、アクセスキーはコミットしない。

## エージェントがやってよいこと

- `docs/aws-for-teacher.md` と README の「学校の先生へ」を最新に保つ
- 無料枠の構成を `infra/terraform/` に **定義として** 残す（VPC / SG / EC2。apply して作りっぱなしにしない）
- 評価用は `npm run dev`（フロント 3000 / バック 8080）

## エージェントがやってはいけないこと

- `terraform apply` で課金リソースを作る
- AWS アカウントを有料運用にする
- 受付アプリをインターネットに常時公開する

誤ってリソースを作った場合は、確認後すぐに `terraform destroy` し、請求が $0 に近いことを案内する。

詳細は [reference.md](reference.md)。
