import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
//import { fileURLToPath } from 'url';
import handlebars from 'vite-plugin-handlebars';
//import { sync } from "glob";

//const __dirname = dirname( fileURLToPath(import.meta.url))

export default defineConfig({
    root: 'src',
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern', // or "modern-compiler"
                silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
            }
        }
    },
    resolve: {
        alias: {
            //'@components': resolve(__dirname, 'src/js/components'),
            // https://lenguajejs.com/javascript/modulos/alias-import/
            '@': new URL('./src', import.meta.url).pathname,
            '@components': new URL('./src/js/components', import.meta.url).pathname,
            '@modules': new URL('./src/js/modules', import.meta.url).pathname,
        },
    },
    plugins: [
        handlebars({
            //partialDirectory: resolve(__dirname, 'src', 'partials'),
            partialDirectory: resolve(new URL('.', import.meta.url).pathname, 'src', 'partials'),
        }),
    ],
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
            //input: sync("./src/**/*.html".replace(/\\/g, "/")),
                main: resolve(new URL('.', import.meta.url).pathname, 'src', 'index.html'),
                dashboard: resolve(new URL('.', import.meta.url).pathname, 'src', 'dashboard.html'),
            },
        },
    }
});