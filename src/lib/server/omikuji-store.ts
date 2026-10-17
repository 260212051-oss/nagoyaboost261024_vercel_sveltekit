import { OMIKUJI_HISTORY_LIMIT } from '$app/env/private';
import { getRedis } from './redis';
import type { OmikujiRecord, OmikujiResult } from '#lib/types';

const HISTORY_LIMIT = OMIKUJI_HISTORY_LIMIT;

/** ユーザーごとの履歴キー。将来ユーザー認証を入れてもキー設計は変えずに済む。 */
const historyKey = (userId: string) => `omikuji:history:${userId}`;

/**
 * Redis 未確保のあいだの代替。
 * プロセスメモリなので Vercel の関数インスタンスが変われば消える（＝本番では要 Redis）。
 */
const memoryStore = new Map<string, OmikujiRecord[]>();

function createRecord(userId: string, result: OmikujiResult): OmikujiRecord {
	return {
		id: crypto.randomUUID(),
		userId,
		rank: result.rank,
		message: result.message,
		luckyColor: result.lucky.color,
		luckyItem: result.lucky.item,
		luckyNumber: result.lucky.number,
		drawnAt: new Date().toISOString()
	};
}

/**
 * おみくじ記録を保存する。
 * 保存に失敗してもおみくじ自体は成立させたいので、例外は投げずに false を返す。
 */
export async function saveRecord(
	userId: string,
	result: OmikujiResult
): Promise<{ record: OmikujiRecord; persisted: boolean }> {
	const record = createRecord(userId, result);
	const redis = getRedis();

	if (!redis) {
		const list = memoryStore.get(userId) ?? [];
		list.unshift(record);
		memoryStore.set(userId, list.slice(0, HISTORY_LIMIT));
		return { record, persisted: false };
	}

	try {
		const key = historyKey(userId);
		// 新しい順に取り出したいので LPUSH + LTRIM で上限件数を維持する
		await redis.lpush(key, JSON.stringify(record));
		await redis.ltrim(key, 0, HISTORY_LIMIT - 1);
		return { record, persisted: true };
	} catch (error) {
		console.error('[omikuji] Redis への保存に失敗しました', error);
		return { record, persisted: false };
	}
}

/** 新しい順におみくじ記録を取得する。 */
export async function listRecords(userId: string, limit = HISTORY_LIMIT): Promise<OmikujiRecord[]> {
	const redis = getRedis();

	if (!redis) {
		return (memoryStore.get(userId) ?? []).slice(0, limit);
	}

	try {
		const raw = await redis.lrange<string | OmikujiRecord>(historyKey(userId), 0, limit - 1);
		// @upstash/redis は JSON らしき文字列を自動でパースして返すことがあるため両対応
		return raw
			.map((item) => (typeof item === 'string' ? safeParse(item) : item))
			.filter((item): item is OmikujiRecord => item !== null);
	} catch (error) {
		console.error('[omikuji] Redis からの取得に失敗しました', error);
		return [];
	}
}

function safeParse(value: string): OmikujiRecord | null {
	try {
		return JSON.parse(value) as OmikujiRecord;
	} catch {
		return null;
	}
}
