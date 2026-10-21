const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });
for (const [source, destination, allowed] of [
  ['assets', 'assets', /\.(webp|css|js)$/],
  ['tools/preview/fonts', 'preview-fonts', /\.(ttf|txt)$/],
  ['tools/demo/client', 'demo', /\.(js|css)$/]
]) {
  const target = path.join(output, destination);
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(path.join(root, source))) {
    if (allowed.test(name)) fs.copyFileSync(path.join(root, source, name), path.join(target, name));
  }
}
const { compile, render } = require('./renderer.cjs');
compile();
fs.writeFileSync(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
// Render representative pages during the build so invalid Liquid fails deployment.
(async () => {
  const routes=['/', '/collections/all', '/products/preview-0', '/search?q=linen', '/cart', '/pages/our-story', '/collections', '/pages/explore', '/pages/faq', '/collections/features', '/collections/tops', '/collections/dresses', '/collections/denim', '/collections/sweaters-knitwear', '/collections/swimwear'];
  for (const url of routes) {
    const html = await render(url);
    if (!html.includes('MainContent') || /Liquid error:/.test(html)) throw new Error('Invalid rendered page: ' + url);
  }
  console.log('Aloir Apparel demo built: static assets, compiled Liquid and '+routes.length+' route smoke checks.');
})().catch(error => { console.error(error); process.exitCode = 1; });
