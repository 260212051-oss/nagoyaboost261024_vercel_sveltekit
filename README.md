# おみくじアプリ

SvelteKit (Svelte 5) 製のおみくじアプリ。Vercel に SSR でデプロイする前提の構成です。

## 構成

| パス | 役割 |
| --- | --- |
| `/` | おみくじを引くページ。form action `?/draw` でサーバー抽選 → 記録保存 |
| `/history` | おみくじ記録の一覧ページ |

- 抽選ロジックは [omikuji.ts](src/lib/server/omikuji.ts)（サーバー専用、重み付き抽選）
- 記録の保存・取得は [omikuji-store.ts](src/lib/server/omikuji-store.ts)
- ユーザー識別は [hooks.server.ts](src/hooks.server.ts) で Cookie による匿名 ID を発行

## SSR について

- アダプタは [vite.config.js](vite.config.js) で `adapter-auto` を指定。Vercel にデプロイすると自動的に `adapter-vercel` が解決され、Serverless Function 上で SSR します。
  - ランタイムの固定（`nodejs22.x` 指定など）やローカルでの `.vercel/output` 生成が必要になったら `@sveltejs/adapter-vercel` に差し替えてください。
  - ローカルの `npm run build` では環境を検出できず `Could not detect a supported production environment` と出ますが、`adapter-auto` の仕様どおりで異常ではありません。
- [+layout.server.ts](src/routes/+layout.server.ts) で `ssr = true` / `prerender = false` を明示。
- 抽選も保存も `+page.server.ts` の form action 内で完結するため、クライアント JS が無効でも動作します。

## Redis（Upstash）について

**まだ Redis を確保していない状態でもそのまま動きます。**
環境変数が未設定の場合は自動的にインメモリ保存へフォールバックし、
`/history` にその旨のバナーを表示します（Serverless ではインスタンスをまたぐと消えます）。

用意ができたら以下を設定するだけで永続化に切り替わります。

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Vercel Marketplace から Upstash を連携すると `KV_REST_API_*` が自動注入されます。
Upstash コンソールから直接コピーする場合は `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` でも可。

> **注意**: SvelteKit 3 では環境変数を [src/env.ts](src/env.ts) で明示的に宣言しないとアプリから読めません。
> 変数を増やすときは `.env` だけでなく `src/env.ts` の `defineEnvVars` にも追加してください。
> 読み出しは `$app/env/private` から（`$env/dynamic/private` は非推奨）。

### キー設計

- キー: `omikuji:history:<userId>`（Redis List）
- 書き込み: `LPUSH` → `LTRIM 0 (LIMIT-1)` で新しい順に最大 `OMIKUJI_HISTORY_LIMIT` 件（既定 50）
- 読み出し: `LRANGE 0 LIMIT-1`
- REST ベースの `@upstash/redis` を使用しているため、Serverless / Edge どちらでも接続を持ち越さずに済みます。

## 開発

```bash
npm install
npm run dev
```

## デプロイ

```bash
npm i -g vercel
vercel
```

Framework Preset は自動で SvelteKit が選択されます。環境変数は Vercel の Project Settings に登録してください。
