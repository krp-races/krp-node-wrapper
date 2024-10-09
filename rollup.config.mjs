// rollup.config.mjs
import typescript from '@rollup/plugin-typescript'
import { globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

export default {
    input: Object.fromEntries(
        globSync('src/**/*.ts').map(file => [
            path.relative(
                'src',
                file.slice(0, file.length - path.extname(file).length)
            ),
            fileURLToPath(new URL(file, import.meta.url))
        ])
    ),
    external: [],
    output: [
        {
            dir: 'dist',
            format: 'cjs',
            exports: 'named',
            strict: false
        },
        {
            dir: 'dist',
            format: 'es',
            entryFileNames: '[name].mjs',
            exports: 'named',
            strict: false
        }
    ],
    plugins: [
        typescript()
    ]
}