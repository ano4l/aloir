const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const {compile,render}=require('./renderer.cjs');
const handler=require('./handler.cjs');
let server,origin;
before(async()=>{compile();server=http.createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;});
after(()=>new Promise(resolve=>server.close(resolve)));
test('stateless cart is isolated and rejects unavailable or manipulated prices',async()=>{
 const headers={'Content-Type':'application/json'};
 const added=await fetch(origin+'/cart/add.js',{method:'POST',headers,body:JSON.stringify({id:1,quantity:2,price:1})}).then(r=>r.json());
 assert.equal(added.total_price,19600);
 const fresh=await fetch(origin+'/cart.js').then(r=>r.json());assert.equal(fresh.item_count,0);
 const restored=await fetch(origin+'/cart.js',{headers:{'X-Demo-Cart':JSON.stringify([{variant_id:1,quantity:2,price:1}])}}).then(r=>r.json());assert.equal(restored.total_price,19600);
 const unavailable=await fetch(origin+'/cart/add.js',{method:'POST',headers,body:JSON.stringify({id:20,quantity:1})});assert.equal(unavailable.status,422);
 const excessive=await fetch(origin+'/cart/add.js',{method:'POST',headers,body:JSON.stringify({id:1,quantity:100})});assert.equal(excessive.status,422);
});
test('browser multipart add-to-bag and quantity removal work',async()=>{
 const form=new FormData();form.set('id','2');form.set('quantity','1');
 const response=await fetch(origin+'/cart/add.js',{method:'POST',body:form});assert.equal(response.status,200);
 const cart=await response.json();assert.equal(cart.item_count,1);
 const removed=await fetch(origin+'/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Cart':JSON.stringify(cart.items.map(item=>({variant_id:item.variant_id,quantity:item.quantity})))},body:JSON.stringify({id:'preview-2',quantity:0})}).then(r=>r.json());assert.equal(removed.item_count,0);
});
test('deep links, missing pages and checkout have honest behavior',async()=>{
 for(const route of ['/collections','/collections/soft-structure','/products/preview-0','/pages/our-story','/policies/privacy-policy','/checkout']){
  const response=await fetch(origin+route);assert.equal(response.status,200,route);
  const html=await response.text();assert.match(html,/Sample collection/);assert.doesNotMatch(html,/Liquid error:/);
 }
 for(const route of ['/missing','/products/preview-99','/collections/missing'])assert.equal((await fetch(origin+route)).status,404);
 const checkout=await fetch(origin+'/checkout').then(r=>r.text());assert.match(checkout,/no payment is taken/i);
 const subscribe=await fetch(origin+'/',{method:'POST'});assert.equal(subscribe.status,405);
});
test('search filters, quick shop and cart sections render actual selected data',async()=>{
 const filtered=await render('/search?q=linen&filter.v.option.size=Small');assert.match(filtered,/The linen camisole/);assert.doesNotMatch(filtered,/<h3[^>]*>[^<]*The relaxed blazer/);
 const section=await render('/products/preview-1?section_id=quick-shop');assert.match(section,/The relaxed blazer/);
 const related=await render('/recommendations/products?section_id=s1&product_id=1');assert.match(related,/The relaxed blazer/);assert.doesNotMatch(related,/The linen camisole/);
 const cart=handler.normalizeCart([{variant_id:1,quantity:2}]);
 const sections=JSON.parse(await render('/?sections=cart-drawer-content,main-cart',cart));assert.match(sections['main-cart'],/\$196\.00/);
});
test('Vercel configuration bundles Liquid sources and demo never modifies theme packaging',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json'));assert.equal(config.outputDirectory,'public');assert.match(config.functions['api/index.js'].includeFiles,/sections/);
 assert.match(fs.readFileSync('tools/package-theme.ps1','utf8'),/layout\/theme.liquid/);
});
test('collection-led navigation exposes Explore, featured merchandise, categories and FAQ',async()=>{
 const home=await render('/');
 assert.match(home,/Aloir Apparel/);
 assert.match(home,/href="\/pages\/explore"/);
 assert.match(home,/href="\/collections\/features"/);
 assert.match(home,/href="\/collections"/);
 assert.equal((home.match(/data-collection-panel /g)||[]).length,8);
 assert.match(home,/Featured<\/h3><span>3 pieces/);
 const directory=await render('/collections');
 for(const name of ['Tops','Dresses','Denim','Sweaters &amp; Knitwear','Swimwear','Luxe','Home','Shoes, Bags &amp; Accessories'])assert.ok(directory.includes(name),name);
 assert.doesNotMatch(directory,/>Home page</);
 for(const route of ['/pages/explore','/pages/faq','/collections/features','/collections/swimwear'])assert.equal((await fetch(origin+route)).status,200,route);
 const faq=await render('/pages/faq');assert.match(faq,/Shopping &amp; fit|Shopping & fit/);assert.match(faq,/<details>/);
 const empty=await render('/collections/swimwear');assert.doesNotMatch(empty,/<article class="product-card">/);
});
