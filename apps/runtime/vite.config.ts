import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import packageJson from './package.json';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 7436,
	},
	define: {
		__NSM__VERSION__: JSON.stringify(packageJson.version),
	},
});
