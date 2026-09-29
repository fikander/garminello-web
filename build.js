'use strict';

// Builds the client bundle, stylesheets and static assets into ./public.
// Usage: node build.js [--watch] [--debug]

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const less = require('less');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const args = process.argv.slice(2);
const WATCH = args.includes('--watch');
const DEBUG = args.includes('--debug') || !!process.env.DEBUG;

const JS_OUT = 'public/javascripts';
const CSS_OUT = 'public/stylesheets';

// `import Trello from 'trello'` resolves to the global loaded from Trello's client.js
const trelloGlobal = {
  name: 'trello-global',
  setup(build) {
    build.onResolve({ filter: /^trello$/ }, () => ({ path: 'trello', namespace: 'trello-global' }));
    build.onLoad({ filter: /.*/, namespace: 'trello-global' }, () => ({
      contents: 'module.exports = window.Trello;',
      loader: 'js'
    }));
  }
};

const jsOptions = minify => ({
  entryPoints: ['src/client/index.js'],
  bundle: true,
  target: ['es2017'],
  sourcemap: DEBUG ? 'linked' : false,
  minify,
  outfile: path.join(JS_OUT, minify ? 'garminello.min.js' : 'garminello.js'),
  plugins: [trelloGlobal],
  logLevel: 'info'
});

async function buildJs() {
  if (WATCH) {
    const ctx = await esbuild.context(jsOptions(false));
    await ctx.watch();
    return;
  }
  await Promise.all([esbuild.build(jsOptions(false)), esbuild.build(jsOptions(true))]);
}

async function buildCss() {
  const file = 'src/client/less/index.less';
  const source = fs.readFileSync(file, 'utf8');
  const compiled = await less.render(source, { filename: file });
  const prefixed = await postcss([autoprefixer]).process(compiled.css, { from: undefined });
  fs.mkdirSync(CSS_OUT, { recursive: true });
  fs.writeFileSync(path.join(CSS_OUT, 'garminello.css'), prefixed.css);
  const min = await esbuild.transform(prefixed.css, { loader: 'css', minify: true });
  fs.writeFileSync(path.join(CSS_OUT, 'garminello.min.css'), min.code);
  console.log('built ' + CSS_OUT + '/garminello.css');
}

function copyAssets() {
  fs.cpSync('src/client/static', 'public', { recursive: true });
}

async function main() {
  fs.rmSync('public', { recursive: true, force: true });
  fs.mkdirSync(JS_OUT, { recursive: true });
  copyAssets();
  await buildCss();
  await buildJs();
  if (WATCH) {
    fs.watch('src/client/less', () => buildCss().catch(console.error));
    console.log('watching for changes...');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
