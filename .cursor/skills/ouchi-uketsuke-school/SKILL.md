---
name: ouchi-uketsuke-school
description: >-
  おうち受付の学校提出ワークフロー。Skill保存、ファイル保管、git commit、
  GitHub push。要件定義書、画面画像、バックエンド詳細、添付zip、提出URLの話で使う。
---

# おうち受付 — 学校提出（Skill・ファイル・push）

ユーザーが「スキルして」「コマンドプッシュして」「ファイルに保管して」「ファイルに上書き保存」と言ったら、次を行う。

## 絶対ルール

- アプリは **お問い合わせアプリ**（受付の人が使いやすい）。
- 前回スタック（Vite / Java Spring Boot Gradle / PostgreSQL）は使わない。
- 証明資料は `docs/tech-selection.md`。
- GitHub は学校提出のため **public**（先生が URL を開いて確認できる）。
- アプリ本体の本番 URL（常時動く受付画面）は作らない。AWS 常時稼働は残さない。
- `store.json` と実行時の `backend/data/*.db` は Git に含めない。先生確認用の `docs/ouchi-uketsuke.db` は提出スナップショットとして含める。force push しない。git config は変えない。

## 提出フォームに入れる URL（これ以外はエラーになる）

学校の提出欄は **リポジトリ URL** か **プルリクエスト URL** だけ受け付ける。`/blob/` や `docs/README` の長い URL は入れない。

- リポジトリ: https://github.com/n0r1k09583/OuchiUketsuke
- プルリクエスト: https://github.com/n0r1k09583/OuchiUketsuke/pull/1

リポジトリ URL でエラーになるときは PR URL を使う。

## デスクトップ提出ファイル（上書きしてよい）

| 場所 | 内容 |
|------|------|
| `~/Desktop/おうち受付_添付用/おうち受付_提出資料.zip` | 要件定義書・画面画像・バックエンド詳細（フォームに添付） |
| `~/Desktop/おうち受付_添付用/おうち受付_ソース.zip` | ソース（フォームに添付、各50MB以下） |
| `~/Desktop/おうち受付_学校提出/` | HTML・画像を直接開く用 |

## ファイルに保管する場所（上書き）

プロジェクト内を正とし、ユーザー側 Skill も同じ内容で上書きする。

| 内容 | プロジェクト | ユーザー側 |
|------|----------------|------------|
| アプリ本体Skill | `.cursor/skills/ouchi-uketsuke/SKILL.md` | `~/.cursor/skills/ouchi-uketsuke/SKILL.md` |
| 本Skill | `.cursor/skills/ouchi-uketsuke-school/SKILL.md` | `~/.cursor/skills/ouchi-uketsuke-school/SKILL.md` |
| AWS Skill | `.cursor/skills/ouchi-uketsuke-aws/SKILL.md` | `~/.cursor/skills/ouchi-uketsuke-aws/SKILL.md` |
| 要件定義書（提出用HTML） | `docs/要件定義書.html` | — |
| 提出資料の入口 | `docs/README.md` | — |
| フロント画面画像 | `docs/images/` | — |
| バックエンド詳細 | `docs/backend.md` | — |
| 要件定義書（Markdown） | `docs/requirements.md` | — |
| 基本設計書 | `docs/basic-design.md` | — |
| 技術選定書 | `docs/tech-selection.md` | — |
| DB説明 | `docs/database.md` | — |
| 提出用DB | `docs/ouchi-uketsuke.db` | — |
| Terraform apply の証明 | `docs/terraform-proof.md` | — |

## コマンド（push）

```powershell
git add -A
git status
git commit -m "学校提出用: おうち受付のソースと要件定義を保管"
git push -u origin HEAD
```

想定アカウント: `n0r1k09583`。提出用リポジトリは public。AWS の本番公開はしない。

## 再開用（ここまでの確定）

途中から続けるときは、この状態を正とする。Skill を上書きしたうえで、未コミットがあれば上のコマンドで push する。

- 先生が見るのは GitHub `main`。作業ブランチは `school-submission`。push 後は `main` にも載せる（フォームはリポジトリ URL）。
- フロント `frontend/`、バック `backend/`。実行時保存は SQLite `backend/data/ouchi-uketsuke.db`（Git に入れない）。先生確認用は `docs/ouchi-uketsuke.db`。
- Terraform は `infra/terraform/` に VPC / SG / EC2。証明は `docs/terraform-proof.md`（apply したら destroy。常時稼働は残さない）。
- 先生のまとめ入口: `docs/README.md`。DB URL: https://github.com/n0r1k09583/OuchiUketsuke/raw/main/docs/ouchi-uketsuke.db
- ホテル／会社は `facilityType`。試す番号の日付は `alignDemoDates`。
- スケジュール画面は確認済みのため大きく変えない。

