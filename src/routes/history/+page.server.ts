import { listRecords } from '#lib/server/omikuji-store';
import { isRedisConfigured } from '#lib/server/redis';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const records = await listRecords(locals.userId);

	return {
		records,
		storageReady: isRedisConfigured()
	};
};
