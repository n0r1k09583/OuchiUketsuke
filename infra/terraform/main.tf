# おうち受付 — インフラ定義（学校提出用・無料枠）
#
# 先生へ: AWS を無料枠の範囲で学校提出用に扱うための定義です。
# 一般公開はしません。月額課金を避けるため、常時稼働リソースは作らないでください。
#
# 禁止: terraform apply で EC2/RDS/NAT を残すこと。
# 誤って apply したら直後に terraform destroy -auto-approve

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# リージョンは無料枠で扱いやすい東京。
# 実リソースは定義しない（学校提出はローカル起動、AWS は方針と Skill のみ残す）。
provider "aws" {
  region = "ap-northeast-1"
}

# タグだけ学校提出用と分かるように残す（リソース本体は作らない）。
locals {
  school_tags = {
    Project    = "OuchiUketsuke"
    Purpose    = "school-assignment"
    Visibility = "not-public"
    Billing    = "free-tier-only-no-always-on"
  }
}
