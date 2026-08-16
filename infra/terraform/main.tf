# おうち受付 — Terraform（学校提出・無料枠）
#
# 課題として VPC / セキュリティグループ / EC2 を定義する。
# 学校の例（RecipeManager）と同じく、ファイルを分けている。
#   network.tf          … VPC、Internet Gateway、公開サブネット
#   security_groups.tf  … EC2 用セキュリティグループ
#   ec2.tf              … t3.micro
#
# 常時稼働では残さない。確認が終わったら terraform destroy する。
# 入れないもの: NAT Gateway / ALB / RDS / CloudFront
# （NAT・LB は課金しやすい。データは JSON なので RDS は使わない。本番 URL は作らない）

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.school_tags
  }
}

locals {
  name = var.project_name
  school_tags = {
    Project    = "OuchiUketsuke"
    Purpose    = "school-assignment"
    Visibility = "not-public"
    Billing    = "free-tier-only-no-always-on"
  }
}
