import { build } from 'esbuild';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
await mkdir('public/assets', { recursive: true });
const localModules = { name: 'local-modules', setup(b) {
  b.onResolve({ filter: /.*/ }, args => {
    const path = args.path === 'three' ? resolve('node_modules/three/build/three.module.js')
      : args.path.startsWith('three/addons/') ? resolve('node_modules/three/examples/jsm', args.path.slice(13))
      : resolve(args.importer ? dirname(args.importer) : process.cwd(), args.path);
    return { path, namespace: 'local' };
  });
  b.onLoad({ filter: /.*/, namespace: 'local' }, async args => ({ contents: await readFile(args.path, 'utf8'), loader: 'js' }));
} };
await build({ absWorkingDir: process.cwd(), tsconfigRaw: {}, plugins: [localModules], entryPoints: [resolve('src/showroom.js')], bundle: true, minify: true, format: 'esm', target: 'es2020', outfile: 'public/assets/showroom.js', legalComments: 'eof' });
const html = (await readFile('src/showroom.html', 'utf8')).replace('./showroom.js', './assets/showroom.js');
await writeFile('public/showroom.html', html);
await writeFile('public/index.html', html);
await writeFile('public/.nojekyll', '');
await copyFile('node_modules/three/LICENSE', 'public/THREE-LICENSE.txt');
console.log('Built standalone showroom in public/');
