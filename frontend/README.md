# フロントエンド（画面）

Next.js のプロジェクトです。受付キオスク・管理者画面・通話 UI だけを持ちます。API とデータの保存は持ちません。

- 場所: `frontend/`
- 起動: `npm install` → `npm run dev`
- URL: http://localhost:3000
- `/api/*` は `BACKEND_URL`（既定 `http://localhost:8080`）へ転送します

バックエンドは隣の `backend/` です。修正するときは、画面はここ、API は `backend/` と分けてください。
