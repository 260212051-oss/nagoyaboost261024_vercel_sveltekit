import { drawOmikuji } from '#lib/server/omikuji';
import { listRecords, saveRecord } from '#lib/server/omikuji-store';
import { isRedisConfigured } from '#lib/server/redis';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const history = await listRecords(locals.userId, 5);
	return {
		lastDrawnAt: history[0]?.drawnAt ?? null,
		totalDraws: history.length,
		storageReady: isRedisConfigured()
	};
};

export const actions: Actions = {
	/** おみくじを引く。抽選も保存もサーバー側で完結させる。 */
	draw: async ({ locals }) => {
		const result = drawOmikuji();
		const { record, persisted } = await saveRecord(locals.userId, result);

		return { result, record, persisted };
	}
};
