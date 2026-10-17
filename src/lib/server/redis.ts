import { Redis } from '@upstash/redis';
import {
	KV_REST_API_TOKEN,
	KV_REST_API_URL,
	UPSTASH_REDIS_REST_TOKEN,
	UPSTASH_REDIS_REST_URL
} from '$app/env/private';

/**
 * Upstash Redis のクライアント。
 *
 * まだ Redis を確保できていないため、環境変数が無い場合は `null` を返し、
 * 呼び出し側（omikuji-store）がインメモリ実装にフォールバックする。
 * Upstash を用意したら .env / Vercel の環境変数を埋めるだけで切り替わる。
 */
let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
	if (cached !== undefined) return cached;

	// Vercel Marketplace 経由だと KV_*、Upstash コンソール直だと UPSTASH_* になる
	const url = KV_REST_API_URL || UPSTASH_REDIS_REST_URL;
	const token = KV_REST_API_TOKEN || UPSTASH_REDIS_REST_TOKEN;

	if (!url || !token) {
		cached = null;
		return cached;
	}

	cached = new Redis({ url, token });
	return cached;
}

export function isRedisConfigured(): boolean {
	return getRedis() !== null;
}
