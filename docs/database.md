# 提出用データベース（SQLite）

先生確認用のデータベースファイルです。アプリ本体は AWS に常時公開していません（無料枠・月額課金なし）。評価はローカル起動です。

## ファイル

実行すると `backend/data/ouchi-uketsuke.db` が作られます（Git には含めません）。

```sh
npm install --prefix backend
npm run dev --prefix backend
```

DB Browser for SQLite などで、その `.db` を開けます。

## ホテルと会社

設定テーブル `settings.facility_type` で切り替えます。

| 値 | 用途 | 退出の表示 |
|----|------|------------|
| `hotel` | ホテル | チェックアウト |
| `office` | 会社 | 帰宅 |

アプリの「設定」画面でも同じ切り替えができます。受付機と管理者画面は同じ DB を見るので、来客の到着はスケジュールと本日の受付に反映されます。

## 主な表

| 表 | 内容 |
|----|------|
| settings | 施設名・ホテル／会社・PIN |
| appointments | 来客予定・到着・退出 |
| calls | 通話 |
| call_messages | チャット |
| notifications | 到着・帰宅・着信の通知 |

試す番号: 4821 田中／7390 佐藤／1564 鈴木／8203 高橋／翌日 9012 林。管理者 PIN は `1234`。
