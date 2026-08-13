---
name: ouchi-uketsuke-school
description: >-
  おうち受付の学校提出ワークフロー。Skill保存、ファイル保管、git commit、
  非公開リポジトリへの push。要件定義書、AWS無料枠、一般公開禁止の話で使う。
---

# おうち受付 — 学校提出（Skill・ファイル・非公開push）

ユーザーが「スキルして」「コマンドプッシュして」「ファイルに保管して」「ファイルに上書き保存」と言ったら、次を行う。

## 絶対ルール

- アプリは **お問い合わせアプリ**（受付の人が使いやすい）。一般公開しない。
- 前回スタック（Vite / Java Spring Boot Gradle / PostgreSQL）は使わない。
- 証明資料は `docs/tech-selection.md`。
- GitHub は **private** のみ。AWS 常時稼働は残さない。
- `store.json` は Git に含めない。force push しない。git config は変えない。

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
gh repo create OuchiUketsuke --private --source=. --remote=origin --push --description "学校提出用 おうち受付（非公開）"
```

すでに remote がある場合は `git push -u origin HEAD`。

想定アカウント: `n0r1k09583`。リポジトリは private。公開（`--public`）にしない。
