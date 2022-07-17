import esbuild from 'esbuild';
import * as fs from 'fs';

const args = process.argv.slice(2);
const isWatchMode = args.includes('watch');

const uiBuild = esbuild.build({
  entryPoints: ['./src/ui/index.tsx'],
  bundle: true,
  outfile: 'dist/ui/index.js',
  target: 'es2016',
  minify: true,
  watch: isWatchMode,
});
const serverBuild = esbuild.build({
  entryPoints: ['./src/server/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
  external: ['body-parser', 'express'],
  target: 'es6',
  minify: true,
  watch: isWatchMode,
});

Promise.all([uiBuild, serverBuild]).then(() => {
  fs.copyFileSync('./src/ui/index.html', './dist/ui/index.html');
  console.log(
    isWatchMode
      ? 'Stubsy server and UI will re-bundle on changes'
      : 'Stubsy bundled successfully 🎉'
  );
});
