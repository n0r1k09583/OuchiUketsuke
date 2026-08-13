---
name: ouchi-uketsuke-school
description: >-
  おうち受付の学校提出ワークフロー。Skill保存、ファイル保管、git commit、
  GitHub push。要件定義書、画面画像、バックエンド詳細、AWS無料枠の話で使う。
---

# おうち受付 — 学校提出（Skill・ファイル・push）

ユーザーが「スキルして」「コマンドプッシュして」「ファイルに保管して」「ファイルに上書き保存」と言ったら、次を行う。

## 絶対ルール

- アプリは **お問い合わせアプリ**（受付の人が使いやすい）。
- 前回スタック（Vite / Java Spring Boot Gradle / PostgreSQL）は使わない。
- 証明資料は `docs/tech-selection.md`。
- GitHub は学校提出のため **public**（先生が URL を開いて確認できる）。
- アプリ本体の本番 URL（常時動く受付画面）は作らない。AWS 常時稼働は残さない。
- `store.json` は Git に含めない。force push しない。git config は変えない。

## 提出URL

- https://github.com/n0r1k09583/OuchiUketsuke
- 資料入口: https://github.com/n0r1k09583/OuchiUketsuke/blob/main/docs/README.md

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

## コマンド（push）

```powershell
git add -A
git status
git commit -m "学校提出用: おうち受付のソースと要件定義を保管"
git push -u origin HEAD
```

remote が無い初回だけ `gh repo create OuchiUketsuke --public --source=. --remote=origin --push`。

想定アカウント: `n0r1k09583`。提出用リポジトリは public。AWS の本番公開はしない。
