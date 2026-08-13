# AWS（無料枠・学校提出用）

**目的:** 学校の先生に「AWS を無料枠で学校提出用に扱った」と分かってもらう。  
**禁止:** 月額課金、作りっぱなし、一般公開。

詳細は [docs/aws-for-teacher.md](../../docs/aws-for-teacher.md) を先に読んでください。

## 残しているもの（無料・提出用）

- このフォルダの Terraform 定義（見本）
- Cursor Skill（`.cursor/skills/ouchi-uketsuke-aws/`）
- 先生向け説明文書

## 残していないもの（高い・怖い）

- 常時稼働の EC2 / RDS / NAT Gateway / ロードバランサー
- 誰でも開ける本番 URL

## やってはいけないこと

- NAT Gateway、ロードバランサー、有料 RDS を作らない
- 作りっぱなしにしない
- アプリをこの世の社会に公開しない

## 評価用の起動（課金なし）

```powershell
cd ouchi-uketsuke
npm install
npm install --prefix backend
npm run dev
```

## 誤って apply した場合（すぐ消す）

```powershell
cd infra/terraform
terraform destroy -auto-approve
```
