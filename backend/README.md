# バックエンド（API）

Express のプロジェクトです。来客予定・到着通知・通話の API と SQLite（`.db`）保存だけを持ちます。画面は持ちません。

- 場所: `backend/`
- 起動: `npm install` → `npm run dev`
- URL: http://localhost:8080
- ヘルスチェック: http://localhost:8080/api/health
- データ: `backend/data/ouchi-uketsuke.db`（Git に含めない。先生確認用にデスクトップへコピー可）

フロントエンドは隣の `frontend/` です。修正するときは、API はここ、画面は `frontend/` と分けてください。
