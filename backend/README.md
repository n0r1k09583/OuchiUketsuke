# バックエンド（API）

来客予定・到着通知・通話の API です。画面は持ちません。

- 起動: `npm install` → `npm run dev`
- URL: http://localhost:8080
- ヘルスチェック: http://localhost:8080/api/health
- データ: `backend/data/store.json`（Git に含めない）

フロントエンド（Next.js :3000）は `/api/*` をこのサーバーへ転送します。
