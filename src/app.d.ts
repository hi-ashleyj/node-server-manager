// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	type EventMap<T> = {[eventName in keyof T]: any[]};
	type DefaultEventMap = {[eventName: string | symbol]: any[]};

	const __NSM__VERSION__: string;
}

export {};