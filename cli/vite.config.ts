import { defineConfig } from "vite";
import packageJSON from "./package.json" with { type: "json" };

declare global {
    const __PKG_NAME__: string;
    const __PKG_VERSION__: string;
}

export default defineConfig({
    define: {
        "__PKG_NAME__": JSON.stringify(packageJSON.name),
        "__PKG_VERSION__": JSON.stringify(packageJSON.version),
    },
    build: {
        lib: {
            entry: "src/index.ts",
            fileName: "bin",
            name: packageJSON.name,
            formats: [ "es" ]
        },
        minify: true,
        sourcemap: true,
        target: "esnext",
        rollupOptions: {
            external: (dep) => dep.startsWith("node:") || dep === "extract-zip",
        }
    },
})