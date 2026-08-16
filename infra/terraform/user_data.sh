#!/bin/bash
# おうち受付 EC2 の初期化。アプリの本番公開はしない。
# 評価はローカルの npm run dev が正。ここは課題用の起動確認用。

set -euo pipefail
dnf update -y
dnf install -y git
# Node.js 20（Amazon Linux 2023）
dnf install -y nodejs

cat >/etc/motd <<'EOF'
ouchi-uketsuke (school assignment)
Do not leave this instance running.
Evaluate with: npm run dev on your PC (localhost:3000)
EOF
