<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'おみくじ' },
		{ href: '/history', label: 'おみくじ記録' }
	];

	const logoUrl = '【https://umkgyblodtdnqocc.public.blob.vercel-storage.com/omikuji_image/omikuji_image.png】';
</script>

<div class="shell">
	<header>
		<a class="brand" href="/">
			<img src={logoUrl} alt="おみくじ" width="1254" height="1254" />
		</a>
		<nav>
			{#each nav as item (item.href)}
				<a href={item.href} aria-current={page.url.pathname === item.href ? 'page' : undefined}>
					{item.label}
				</a>
			{/each}
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>SvelteKit + Vercel / SSR</footer>
</div>

<style>
	.shell {
		max-width: 42rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--line);
	}

	.brand {
		display: inline-flex;
		text-decoration: none;
		color: var(--fg);
	}

	.brand img {
		display: block;
		width: auto;
		height: 2.75rem;
	}

	nav {
		display: flex;
		gap: 0.5rem;
	}

	nav a {
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		text-decoration: none;
		color: var(--muted);
		font-size: 0.9rem;
	}

	nav a[aria-current='page'] {
		background: var(--accent);
		color: #fff;
	}

	main {
		flex: 1;
		padding-top: 1.5rem;
	}

	footer {
		padding-top: 2rem;
		font-size: 0.75rem;
		color: var(--muted);
		text-align: center;
	}
</style>
