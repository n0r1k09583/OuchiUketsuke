# AWS 無料枠（学校提出）— 詳細

## 先生に見せる事実

- 本アプリはスクール課題「おうち受付」。社会一般には未公開。
- AWS CLI を導入し、無料枠の範囲で VPC・セキュリティグループ・EC2 を Terraform に定義した。
- 月額課金を避けるため、常時稼働の AWS サーバーは残していない。
- 動作確認はローカル（フロントエンド :3000、バックエンド :8080）。

## 無料枠で使ってよい（定義のみ）

| 項目 | 方針 |
|------|------|
| リージョン | ap-northeast-1（東京） |
| 計算 | t3.micro（`ec2.tf`）。一度確認したら destroy |
| 保存 | RDS は使わない。JSON ファイル |
| ネットワーク | VPC + 公開サブネット + IGW（`network.tf`）。NAT Gateway なし |
| 防御 | セキュリティグループは自分の IP のみ（`security_groups.tf`） |

## 禁止（高い・怖い）

- NAT Gateway
- Application Load Balancer
- RDS の常時稼働
- 作りっぱなしの EC2
- 独自ドメインの本番公開

## 評価のしかた

```sh
npm install --prefix frontend
npm install --prefix backend
npm run dev --prefix frontend
npm run dev --prefix backend
```

- 受付 http://localhost:3000/reception
- 管理者 http://localhost:3000/admin （PIN `1234`）
- スケジュール http://localhost:3000/admin/schedule
