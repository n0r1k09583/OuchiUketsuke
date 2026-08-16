# Terraform apply の証明（学校提出・無料枠）

先生が GitHub で、インフラ定義と apply の手順を確認するための資料です。  
**アプリの本番公開はしていません。** apply で作った資源は確認後に destroy し、常時稼働サーバーは残していません（月額課金なし）。

提出リポジトリ: https://github.com/n0r1k09583/OuchiUketsuke  
Terraform フォルダ: https://github.com/n0r1k09583/OuchiUketsuke/tree/main/infra/terraform

## 1. 何を証明するか

学校課題として、AWS をコード（Terraform）で扱えることを示します。

| 段階 | コマンド | 先生が見るもの |
|------|----------|----------------|
| 初期化 | `terraform init` | プロバイダ（AWS）を入れる |
| 確認 | `terraform plan` | apply すると作られる資源の一覧 |
| 作成 | `terraform apply` | VPC・セキュリティグループ・EC2 を実際に作る |
| 削除 | `terraform destroy` | 課金が残らないよう、確認後に消す |

評価用の受付画面はローカル（http://localhost:3000）です。AWS 上に常時公開しません。

## 2. apply すると作られるもの（無料枠の範囲）

定義の本体は `infra/terraform/` です。`main.tf` だけでなく、課題で求められる resource をファイル分けしています。

| ファイル | apply で作る資源 |
|----------|------------------|
| [network.tf](../infra/terraform/network.tf) | VPC `10.0.0.0/16`、Internet Gateway、公開サブネット `10.0.1.0/24`、ルートテーブル |
| [security_groups.tf](../infra/terraform/security_groups.tf) | セキュリティグループ（SSH / 3000 / 8080 を自分の IP のみ） |
| [ec2.tf](../infra/terraform/ec2.tf) | キーペア、t3.micro（Amazon Linux 2023）。Elastic IP なし |
| [main.tf](../infra/terraform/main.tf) | リージョン `ap-northeast-1`、提出用タグ |
| [outputs.tf](../infra/terraform/outputs.tf) | apply 後に出る VPC ID・SG・EC2・パブリック IP |

入れていないもの（高くなりやすい／本アプリに不要）:

- NAT Gateway
- Application Load Balancer
- RDS（保存は SQLite の `.db`）
- CloudFront
- Elastic IP の常時確保

## 3. apply と destroy の手順

```powershell
cd infra/terraform
copy terraform.tfvars.example terraform.tfvars
# terraform.tfvars の my_ip と ssh_public_key を自分の値に書き換える
terraform init
terraform plan
terraform apply
# コンソールまたは outputs で VPC / SG / EC2 を確認したら
terraform destroy -auto-approve
```

`terraform apply` のあとに EC2 を残すと、無料枠を超えた場合に月額課金が出ます。本課題では **apply は証明のための確認**、終わったら **必ず destroy** です。

## 4. システム本体との関係

| 見るもの | 場所 |
|----------|------|
| 受付・管理者の画面 | `frontend/`（ローカル :3000） |
| API と SQLite | `backend/`（ローカル :8080） |
| 要件定義書 | [docs/要件定義書.html](./要件定義書.html) |
| データベースファイル | [docs/ouchi-uketsuke.db](./ouchi-uketsuke.db) |
| AWS の説明 | [docs/aws-for-teacher.md](./aws-for-teacher.md) |

フロントとバックは別フォルダです。Terraform はインフラの定義であり、評価時のデータの正は SQLite です。
