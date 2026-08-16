output "vpc_id" {
  description = "作成した VPC"
  value       = aws_vpc.main.id
}

output "ec2_security_group_id" {
  description = "EC2 のセキュリティグループ"
  value       = aws_security_group.ec2.id
}

output "ec2_instance_id" {
  description = "EC2 インスタンス"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "EC2 のパブリックIP（再起動で変わる。SSH 用）"
  value       = aws_instance.app.public_ip
}
