import {join} from 'path';
import type {Config} from 'tailwindcss';
import {theme} from './theme';
// @ts-ignore
import { default as forms } from "@tailwindcss/forms";

// 1. Import the Skeleton plugin
import {skeleton} from '@skeletonlabs/tw-plugin';

const config = {
  // 2. Opt for dark mode to be handled via the class method
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,runtime,ts,svelte}',
    // 3. Append the path to the Skeleton package
    join(require.resolve(
            '@skeletonlabs/skeleton'),
        '../**/*.{html,js,runtime,ts}'
    )
  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    forms,
    // 4. Append the Skeleton plugin (after other plugins)
    skeleton({
      themes: {
        custom: [theme],
      },
    })
  ]
} satisfies Config;

export default config;