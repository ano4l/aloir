const { render, products, previewCart } = require('./renderer.cjs');
const { pages } = require('./catalogue.cjs');

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const line of value.slice(0, 25)) {
    const variantId = Number(line.variant_id ?? line.id);
    const product = products.find(p => p.variants.some(v => v.id === variantId));
    const variant = product?.variants.find(v => v.id === variantId);
    const quantity = Number(line.quantity);
    if (!variant?.available || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || result.some(item => item.variant_id === variantId)) continue;
    result.push({key:'preview-'+variantId, variant_id:variantId, quantity, product, variant, image:product.featured_image, url:product.url, url_to_remove:'/cart', properties:[], final_line_price:variant.price*quantity, original_line_price:variant.price*quantity, line_level_discount_allocations:[]});
  }
  return result;
}
async function bodyData(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = []; let length = 0;
  if(req.body) chunks.push(Buffer.from(req.body));
  else for await (const chunk of req) { length += chunk.length; if (length > 8192) throw new Error('Request too large'); chunks.push(chunk); }
  const raw = Buffer.concat(chunks);
  if(raw.length>8192)throw new Error('Request too large');
  const contentType=req.headers['content-type']||'';
  if(contentType.includes('multipart/form-data'))return Object.fromEntries(await new Request('http://demo.local',{method:'POST',headers:{'content-type':contentType},body:raw}).formData());
  return contentType.includes('application/json') ? JSON.parse(raw.toString() || '{}') : Object.fromEntries(new URLSearchParams(raw.toString()));
}
async function handler(req, res) {
  const url = new URL(req.url, 'http://demo.local');
  const pathname = url.pathname;
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    let cart = normalizeCart(JSON.parse(String(req.headers['x-demo-cart'] || '[]').slice(0, 8192)));
    const json = value => {res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));};
    if (pathname === '/cart.js' && req.method === 'GET') return json(previewCart(cart));
    if (['/cart/add.js','/cart/change.js'].includes(pathname) && req.method === 'POST') {
      const data = await bodyData(req);
      if(pathname === '/cart/add.js') {
        const variantId = Number(data.id), quantity = Number(data.quantity || 1);
        const existing = cart.find(item => item.variant_id === variantId);
        const updated = normalizeCart([{variant_id:variantId, quantity:quantity+(existing?.quantity || 0)}]);
        if (!Number.isInteger(quantity) || quantity < 1 || !updated.length) {res.statusCode=422;return json({description:'This sample option is unavailable, or the maximum of 20 has been reached.'});}
        cart=cart.filter(item => item.variant_id !== variantId).concat(updated);
      } else {
        const item=cart.find(item => item.key === data.id), quantity=Number(data.quantity);
        if(!item || !Number.isInteger(quantity) || quantity<0 || quantity>20){res.statusCode=422;return json({description:'Choose a quantity between 0 and 20.'});}
        item.quantity=quantity;
        cart=normalizeCart(cart);
      }
      // Full authoritative demo cart lets the browser persist only validated IDs/quantities.
      return json(previewCart(cart));
    }
    if(req.method !== 'GET' && req.method !== 'HEAD') {
      if(pathname==='/cart') {res.statusCode=303;res.setHeader('Location','/checkout');return res.end();}
      res.statusCode=405;return json({description:'This preview does not accept submissions.'});
    }
    const productHandle=pathname.match(/^\/products\/(preview-\d+)$/)?.[1];
    const allowed = pathname==='/' || pathname==='/cart' || pathname==='/search' || pathname==='/search/suggest' || pathname==='/recommendations/products' || pathname==='/collections' || /^\/collections\/(all|features|tops|dresses|denim|sweaters-knitwear|shoes-bags-accessories|swimwear|luxe|home|soft-structure|everyday-ease|after-hours|seasonal-edit|new-arrivals)$/.test(pathname) || products.some(product=>product.handle===productHandle) || pages[pathname];
    if(!allowed) res.statusCode=404;
    res.setHeader('Content-Type',url.searchParams.has('sections')?'application/json; charset=utf-8':'text/html; charset=utf-8');
    const html=await render(allowed?url.pathname+url.search:'/404',cart);
    return res.end(req.method === 'HEAD' ? undefined : html);
  } catch(error) {
    console.error('Demo request failed:',error.message);
    res.statusCode=400;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.end(JSON.stringify({description:'Unable to display this preview. Refresh and try again.'}));
  }
}
module.exports=handler;
module.exports.normalizeCart=normalizeCart;
