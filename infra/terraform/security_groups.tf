# docs/basic-design.md「8. AWS構成」に対応。
# 自分の IP だけ通す。0.0.0.0/0 では開けない（本番公開しないため）。
# 3000 = Next.js、8080 = Express。同一EC2上ならブラウザは 3000 だけで足りるが、確認用に両方置く。

resource "aws_security_group" "ec2" {
  name        = "${local.name}-ec2-sg"
  description = "SSH and app ports from my IP only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description = "Next.js frontend from my IP"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description = "Express backend from my IP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name}-ec2-sg"
  }
}
