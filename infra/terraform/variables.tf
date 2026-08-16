variable "aws_region" {
  description = "東京リージョン（無料枠で扱いやすい）"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名の接頭辞"
  type        = string
  default     = "ouchi-uketsuke"
}

variable "instance_type" {
  description = "無料枠の t3.micro"
  type        = string
  default     = "t3.micro"
}

variable "my_ip" {
  description = "SSH と画面確認を許可する自分のグローバルIP（CIDRなし。例: 203.0.113.1）"
  type        = string
}

variable "ssh_public_key" {
  description = "EC2 に登録する SSH 公開鍵の中身（terraform.tfvars で渡す。Git に実鍵を書かない）"
  type        = string
}
