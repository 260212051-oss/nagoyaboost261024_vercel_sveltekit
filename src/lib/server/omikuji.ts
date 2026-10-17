import type { FortuneRank, OmikujiResult } from '#lib/types';

interface FortuneDef {
	rank: FortuneRank;
	weight: number;
	messages: string[];
}

const FORTUNES: FortuneDef[] = [
	{
		rank: '大吉',
		weight: 6,
		messages: [
			'待ち人来る。迷わず進めば道はひらける。',
			'思い立ったが吉日。今日の一歩が大きな実りに。',
			'努力が実を結ぶ時。周りの人への感謝を忘れずに。'
		]
	},
	{
		rank: '中吉',
		weight: 14,
		messages: [
			'焦らずとも良し。積み重ねが力になる。',
			'人との縁が運を運ぶ。連絡を取ってみるとよい。',
			'小さな幸運が続く一日。丁寧に過ごすべし。'
		]
	},
	{
		rank: '小吉',
		weight: 18,
		messages: [
			'控えめに動けば災いなし。まずは足元を固めよ。',
			'ささやかな喜びあり。見逃さぬように。',
			'新しい習慣を始めるのに良い時。'
		]
	},
	{
		rank: '吉',
		weight: 24,
		messages: [
			'平穏こそ幸い。いつも通りが一番の吉。',
			'準備を怠らなければ、望みは叶う。',
			'言葉を選べば、人間関係は円満に。'
		]
	},
	{
		rank: '末吉',
		weight: 20,
		messages: [
			'今は種まきの時。実りは後からついてくる。',
			'遅れても悲観するな。時が味方する。',
			'一度立ち止まって考えるとよい。'
		]
	},
	{
		rank: '凶',
		weight: 12,
		messages: [
			'油断大敵。確認を一手間かけるべし。',
			'無理は禁物。休むことも前進のうち。',
			'言い争いを避ければ、災いは去る。'
		]
	},
	{
		rank: '大凶',
		weight: 6,
		messages: [
			'底を打てば、あとは上がるのみ。',
			'今日は守りに徹せよ。明日は変わる。',
			'凶は転じて吉となる。結んで帰るべし。'
		]
	}
];

const LUCKY_COLORS = ['赤', '青', '白', '黒', '黄', '緑', '紫', '金', '桜色', '藍'];
const LUCKY_ITEMS = [
	'手帳',
	'万年筆',
	'ハンカチ',
	'お茶',
	'イヤホン',
	'観葉植物',
	'鏡',
	'和菓子',
	'マグカップ',
	'傘'
];

function pick<T>(list: readonly T[]): T {
	return list[Math.floor(Math.random() * list.length)];
}

/** 重み付き抽選。サーバー側でのみ実行する（SSR） */
export function drawOmikuji(): OmikujiResult {
	const total = FORTUNES.reduce((sum, f) => sum + f.weight, 0);
	let threshold = Math.random() * total;

	let selected = FORTUNES[FORTUNES.length - 1];
	for (const fortune of FORTUNES) {
		threshold -= fortune.weight;
		if (threshold < 0) {
			selected = fortune;
			break;
		}
	}

	return {
		rank: selected.rank,
		message: pick(selected.messages),
		lucky: {
			color: pick(LUCKY_COLORS),
			item: pick(LUCKY_ITEMS),
			number: Math.floor(Math.random() * 99) + 1
		}
	};
}
