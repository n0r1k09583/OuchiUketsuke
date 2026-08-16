# AWS（無料枠・学校提出用）

**目的:** 学校の課題として、Terraform で VPC・セキュリティグループ・EC2 を定義する。  
**禁止:** 月額課金、作りっぱなし、一般公開。`terraform apply` したあとは必ず `destroy` する。

詳細は [docs/aws-for-teacher.md](../../docs/aws-for-teacher.md) を先に読んでください。

ファイルの分け方は学校の例（RecipeManager）に合わせています（`network.tf` / `security_groups.tf` / `ec2.tf`）。  
RDS・CloudFront・NAT Gateway は、本アプリでは使いません（保存は JSON、評価はローカル、月額課金を出さないため）。

## このフォルダのファイル

| ファイル | 内容 |
|----------|------|
| `main.tf` | プロバイダ（東京）と提出用タグ |
| `variables.tf` | リージョン、自分のIP、SSH公開鍵 |
| `network.tf` | VPC、Internet Gateway、公開サブネット |
| `security_groups.tf` | SSH / 3000 / 8080 を自分のIPだけ許可 |
| `ec2.tf` | t3.micro（Amazon Linux 2023） |
| `outputs.tf` | VPC ID、SG、EC2、パブリックIP |
| `terraform.tfvars.example` | 変数の見本（実ファイルは Git に入れない） |
| `user_data.sh` | EC2 初回の Node 導入 |

## 入れていないもの（高い・今回のアプリに不要）

- NAT Gateway、ロードバランサー、CloudFront
- RDS（保存は JSON ファイル）
- Elastic IP（作りっぱなしになりやすい）

## 評価用の起動（課金なし）

アプリの確認はローカルです。

```powershell
cd ouchi-uketsuke
npm install
npm install --prefix backend
npm run dev
```

## apply する場合（確認したらすぐ消す）

```powershell
cd infra/terraform
copy terraform.tfvars.example terraform.tfvars
# terraform.tfvars の my_ip と ssh_public_key を自分の値に書き換える
terraform init
terraform plan
terraform apply
# 確認が終わったら
terraform destroy -auto-approve
```
