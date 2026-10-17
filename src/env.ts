import { defineEnvVars } from '@sveltejs/kit/env';

/** 未設定を許容する（値がなければ undefined のまま通す）。 */
const optional = (value: string | undefined) => value;

/**
 * SvelteKit 3 から環境変数は明示的な宣言が必須。
 * ここに書いたものだけが `$app/env/private` / `$app/env/public` から読める。
 */
export const variables = defineEnvVars({
	// Vercel Marketplace 経由だと KV_*、Upstash コンソール直だと UPSTASH_*
	KV_REST_API_URL: {
		schema: optional,
		description: 'Upstash Redis の REST エンドポイント（Vercel 連携時に自動注入）'
	},
	KV_REST_API_TOKEN: {
		schema: optional,
		description: 'Upstash Redis の REST トークン（Vercel 連携時に自動注入）'
	},
	UPSTASH_REDIS_REST_URL: {
		schema: optional,
		description: 'Upstash コンソールから直接コピーする場合の REST エンドポイント'
	},
	UPSTASH_REDIS_REST_TOKEN: {
		schema: optional,
		description: 'Upstash コンソールから直接コピーする場合の REST トークン'
	},
	OMIKUJI_HISTORY_LIMIT: {
		schema: (value) => {
			if (value === undefined || value === '') return 50;
			const limit = Number(value);
			if (!Number.isInteger(limit) || limit <= 0) {
				throw new Error('OMIKUJI_HISTORY_LIMIT must be a positive integer');
			}
			return limit;
		},
		description: '1 ユーザーあたりに保持するおみくじ記録の上限（既定 50）'
	}
});
