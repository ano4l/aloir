// Local visual fixture only. Shopify remains the authoritative runtime.
const fs = require('fs'), path = require('path'), http = require('http');
const { Liquid } = require('liquidjs');
const root = path.resolve(__dirname, '../..');
const compiled = path.join(__dirname, '.render');
fs.mkdirSync(compiled, { recursive: true });
function source(text) {
  return text.replace(/{% schema %}[\s\S]*?{% endschema %}/g, '')
    // LiquidJS isolates `render` locals from global Shopify-like fixture data;
    // use its parent-scoped include only in this local-only presentation adapter.
    .replace(/{% render ('[^']+'[^%]*)%}/g, '{% include $1 %}')
    .replace(/{% style %}/g, '<style>').replace(/{% endstyle %}/g, '</style>')
    .replace(/{% form\b([^%]*)%}/g, (_, args) => args.includes("'product'") ? '<form data-preview-form data-product-form class="product-form">' : '<form data-preview-form>')
    .replace(/{% endform %}/g, '</form>')
    .replace(/{% paginate\b[^%]*%}/g, '').replace(/{% endpaginate %}/g, '');
}
const engine = new Liquid({ root: compiled, extname: '.liquid', strictFilters: false });
engine.registerFilter('asset_url', value => '/assets/' + value);
engine.registerFilter('stylesheet_tag', value => `<link rel="stylesheet" href="${value}">`);
engine.registerFilter('font_face', value => value?.family === 'Cormorant Garamond' ? '@font-face{font-family:"Cormorant Garamond";font-style:normal;font-weight:300 700;font-display:swap;src:url(/preview-fonts/cormorant.ttf) format("truetype")}' : '@font-face{font-family:"Assistant";font-style:normal;font-weight:200 800;font-display:swap;src:url(/preview-fonts/assistant.ttf) format("truetype")}');
engine.registerFilter('json', value => JSON.stringify(value));
engine.registerFilter('money', value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(value || 0)/100));
engine.registerFilter('image_url', value => value?.src || value || '');
engine.registerFilter('image_tag', (value, ...args) => {
  const attrs = Object.fromEntries(args.filter(Array.isArray));
  return `<img src="${value}" width="1024" height="1536" alt="${attrs.alt || 'Illustrative preview image'}" class="${attrs.class || ''}" loading="${attrs.loading || 'lazy'}">`;
});
engine.registerFilter('payment_button', () => '');
engine.registerFilter('structured_data', () => '{}');
engine.registerFilter('placeholder_svg_tag', () => '<div class="placeholder-image" aria-label="Image placeholder"></div>');
engine.registerFilter('default_errors', () => 'Preview: submissions require Shopify.');
engine.registerFilter('metafield_tag', field => field?.value || '');
function defaults(schema) { return Object.fromEntries((schema.settings || []).filter(s => s.default !== undefined).map(s => [s.id, s.default])); }
const image = (name) => ({ src:`/assets/${name}.webp`, alt:'Illustrative preview image', width:1024, height:1536 });
const products = ['hero-1','hero-2','hero-3','story','detail'].map((name, i) => ({
  id:i+1, title:['Linen blouse','Tailored jacket','Satin shirt','The tailored trouser','Linen detail'][i] + ' · preview', handle:`preview-${i}`, url:`/products/preview-${i}`, price:9800+i*1200,
  available:true, has_only_default_variant:false, featured_image:image(name), images:[image(name)], vendor:'Eloir', description:'<p>Illustrative fixture. Replace with published Shopify merchandise.</p>',
  options:['Size','Colour'],options_with_values:[{name:'Size',values:['Small','Medium'],selected_value:'Small'},{name:'Colour',values:['Ivory'],selected_value:'Ivory'}],
  selected_or_first_available_variant:{id:i+1, title:'Small / Ivory', price:9800+i*1200,available:true}, variants:[{id:i+1,title:'Small / Ivory',options:['Small','Ivory'],price:9800+i*1200,available:true},{id:20+i,title:'Medium / Ivory',options:['Medium','Ivory'],price:10800+i*1200,available:false}], media:[{...image(name),id:i+1,media_type:'image',preview_image:image(name)}]
}));
products.forEach((product,index)=>{
 product.variants[0].compare_at_price=index===0?12000:null;
 product.selected_or_first_available_variant=product.variants[0];
 product.compare_at_price=product.variants[0].compare_at_price;
 product.metafields={custom:{size_chart:{value:{unit:'cm',measurement_type:'garment',columns:['Bust','Waist','Length'],rows:[{size:'Small',values:[88,70,60]},{size:'Medium',values:[92,74,62]}],note:'Illustrative measurements for local testing only.'}},delivery_summary:{value:'Preview only: delivery information must be verified for your destination.'},returns_summary:{value:'Preview only: review the merchant return policy before ordering.'}}};
});
products[0].metafields.custom.complete_the_look={value:[products[1],products[3]]};
let previewCartItems=[];
function previewCart(){return {items:previewCartItems,item_count:previewCartItems.reduce((n,item)=>n+item.quantity,0),total_price:previewCartItems.reduce((n,item)=>n+item.final_line_price,0),currency:{iso_code:'USD'},cart_level_discount_applications:[]};}
const collection={ title:'The collection', url:'/collections/all', description:'<p>Considered silhouettes. Quiet confidence.</p>', products, products_count:products.length, filters:[], sort_options:[{value:'manual',name:'Featured'},{value:'price-ascending',name:'Price, low to high'}],default_sort_by:'manual' };
function baseContext(url) {
 const settings=JSON.parse(fs.readFileSync(path.join(root,'config/settings_data.json'))).current;
 settings.font_heading={family:'Cormorant Garamond', fallback_families:'serif'}; settings.font_body={family:'Assistant',fallback_families:'sans-serif'};
 const parsedURL=new URL(url,'http://localhost');
 const productIndex=Number(parsedURL.pathname.match(/preview-(\d+)/)?.[1]||0);
 const product={...products[productIndex]||products[0]};
 if(parsedURL.searchParams.has('no-data'))product.metafields={custom:{}};
 if(parsedURL.searchParams.has('invalid-chart'))product.metafields={custom:{...product.metafields.custom,size_chart:{value:{unit:'unknown',columns:[],rows:[]}}}};
 if(parsedURL.searchParams.has('chart-range'))product.metafields={custom:{...product.metafields.custom,size_chart:{value:{unit:'cm',measurement_type:'garment',columns:['Bust','Waist'],rows:[{size:'Small',values:[88,'70–74']}],note:'Local range-conversion fixture only.'}}}};
 if(parsedURL.searchParams.has('look-edge'))product.metafields={custom:{...product.metafields.custom,complete_the_look:{value:[product,{...products[1],available:false},products[3]]}}};
 const selected=product.variants.find(variant=>String(variant.id)===parsedURL.searchParams.get('variant'))||product.variants[0];
 product.selected_or_first_available_variant=selected;
 product.options_with_values=product.options_with_values.map((option,index)=>({...option,selected_value:selected.options[index]}));
 const query=parsedURL.searchParams.get('q')||'';
 const searched=products.filter(piece=>piece.title.toLowerCase().includes(query.toLowerCase()));
 const filterParams=['filter.v.option.size','filter.v.availability'];
 const filterProducts=(items,excluded)=>items.filter(piece=>{
  const sizes=excluded===filterParams[0]?[]:parsedURL.searchParams.getAll(filterParams[0]);
  const inStock=excluded!==filterParams[1]&&parsedURL.searchParams.get(filterParams[1])==='1';
  return piece.variants.some(variant=>(!sizes.length||sizes.includes(variant.options[0]))&&(!inStock||variant.available));
 });
 const removeURL=(param,value)=>{const clean=new URL(parsedURL);const values=clean.searchParams.getAll(param).filter(item=>item!==value);clean.searchParams.delete(param);values.forEach(item=>clean.searchParams.append(param,item));return clean.pathname+clean.search;};
 const filtersFor=items=>[
  {type:'list',label:'Size',values:['Small','Medium'].map(value=>({label:value,value,param_name:filterParams[0],count:filterProducts(items,filterParams[0]).filter(piece=>piece.variants.some(v=>v.options[0]===value&&(!parsedURL.searchParams.get(filterParams[1])||v.available))).length,active:parsedURL.searchParams.getAll(filterParams[0]).includes(value)})),active_values:parsedURL.searchParams.getAll(filterParams[0]).map(value=>({label:value,url_to_remove:removeURL(filterParams[0],value)}))},
  {type:'boolean',label:'Availability',values:[{label:'In stock',value:'1',param_name:filterParams[1],count:filterProducts(items,filterParams[1]).filter(piece=>piece.variants.some(variant=>variant.available&&(!parsedURL.searchParams.getAll(filterParams[0]).length||parsedURL.searchParams.getAll(filterParams[0]).includes(variant.options[0])))).length,active:parsedURL.searchParams.get(filterParams[1])==='1'}],active_values:parsedURL.searchParams.get(filterParams[1])==='1'?[{label:'In stock',url_to_remove:removeURL(filterParams[1],'1')}]:[]}
 ];
 const sorted=items=>parsedURL.searchParams.get('sort_by')==='price-ascending'?[...items].sort((a,b)=>a.price-b.price):parsedURL.searchParams.get('sort_by')==='price-descending'?[...items].sort((a,b)=>b.price-a.price):items;
 const filteredCollection=sorted(filterProducts(products));
 const localCollection={...collection,products:filteredCollection,products_count:filteredCollection.length,all_products_count:products.length,filters:filtersFor(products),sort_by:parsedURL.searchParams.get('sort_by')||'manual'};
 const matching=sorted(filterProducts(searched));
 const searchResult={performed:!!query,terms:query,url:'/search',types:['product'],results:matching.map(piece=>({...piece,object_type:'product'})),results_count:matching.length,filters:filtersFor(searched),sort_by:parsedURL.searchParams.get('sort_by')||'relevance',default_sort_by:'relevance',sort_options:[{value:'relevance',name:'Relevance'},{value:'price-ascending',name:'Price, low to high'},{value:'price-descending',name:'Price, high to low'}]};
 return { settings, shop:{name:'Eloir',money_format:'${{amount}}',customer_accounts_enabled:true,enabled_payment_types:[],shipping_policy:{url:'/policies/shipping-policy',body:'Preview shipping policy'},refund_policy:{url:'/policies/refund-policy',body:'Preview refund policy'}}, routes:{root_url:'/',cart_url:'/cart',cart_add_url:'/cart/add',search_url:'/search',account_url:'/account',collections_url:'/collections',all_products_collection_url:'/collections/all'},
 request:{locale:{iso_code:'en'},design_mode:false,page_type:parsedURL.pathname.startsWith('/products')?'product':parsedURL.pathname.startsWith('/search')?'search':'index'},cart:previewCart(),form:{},localization:{available_countries:[],available_languages:[]},page_title:'Eloir',current_page:1,canonical_url:'http://127.0.0.1:9293'+url,collection:localCollection,product, paginate:{pages:1},search:searchResult,predictive_search:{performed:parsedURL.pathname==='/search/suggest',resources:{products:searched}},page:{title:'Our story',content:'<p>Considered pieces for the modern woman.</p>'} };
}
async function section(type, id, data, context, fixtures) {
 const raw=fs.readFileSync(path.join(root,'sections',type+'.liquid'),'utf8');
 const schema=JSON.parse(raw.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
 const settings={...defaults(schema),...data.settings};
 if (typeof settings.menu === 'string') settings.menu={links:[{title:'Shop',url:'/collections/all'},{title:'New arrivals',url:'/collections/all'},{title:'Collections',url:'/collections'}]};
 if(type==='featured-collection' && fixtures) settings.collection=collection;
 if(type==='seasonal-edit' && fixtures){
  settings.collection=collection;
  if(context.canonical_url.includes('offer=1'))Object.assign(settings,{enable_offer:true,discount_code:'PREVIEW 15',offer_text:'Illustrative seasonal offer — preview only',terms:'<p>Local fixture; no live discount is created or redeemed.</p>'});
 }
 if(type==='main-product' && fixtures)settings.size_guide={title:'Find your fit',url:'/pages/size-guide',content:'<p>Illustrative size-guide fixture. Actual measurements must come from the imported product.</p>'};
 return engine.parseAndRender(source(raw),{...context,section:{id,settings,blocks:Object.entries(data.blocks || {}).map(([bid,b]) => ({id:bid,...b})),shopify_attributes:''}});
}
async function group(name,context,fixtures) {
 const data=JSON.parse(fs.readFileSync(path.join(root,'sections',name+'.json'),'utf8'));
 let html=''; for(const id of data.order) html+=await section(data.sections[id].type,id,data.sections[id],context,fixtures); return html;
}
async function render(url) {
 for(const file of fs.readdirSync(path.join(root,'snippets'))) fs.writeFileSync(path.join(compiled,file),source(fs.readFileSync(path.join(root,'snippets',file),'utf8')));
 const fixtures=!url.includes('empty=1'), context=baseContext(url);
 const parsedURL=new URL(url,'http://localhost');
 const requestedSection=parsedURL.searchParams.get('section_id');
 if(requestedSection&&/^[a-z0-9-]+$/.test(requestedSection))return section(requestedSection,requestedSection,{settings:{}},context,fixtures);
 if(parsedURL.searchParams.has('sections')){
  const result={};for(const type of parsedURL.searchParams.get('sections').split(','))if(/^[a-z0-9-]+$/.test(type)&&fs.existsSync(path.join(root,'sections',type+'.liquid')))result[type]=await section(type,type,{settings:{}},context,fixtures);
  return JSON.stringify(result);
 }
 const template=url.startsWith('/products')?'product':url.startsWith('/collections/all')?'collection':url.startsWith('/cart')?'cart':url.startsWith('/pages')?'page':url.startsWith('/search')?'search':'index';
 const data=JSON.parse(fs.readFileSync(path.join(root,'templates',template+'.json'),'utf8'));
 let body=''; for(const id of data.order) body+=await section(data.sections[id].type,id,data.sections[id],context,fixtures);
 let layout=source(fs.readFileSync(path.join(root,'layout/theme.liquid'),'utf8'));
 layout=layout.replace(/{% sections 'header-group' %}/g,await group('header-group',context,fixtures)).replace(/{% sections 'footer-group' %}/g,await group('footer-group',context,fixtures));
 const html=await engine.parseAndRender(layout,{...context,content_for_layout:body});
 return html.replace('<body>','<body><div style="background:#292723;color:white;padding:8px;text-align:center;font:11px Arial">LOCAL VISUAL PREVIEW — illustrative products; commerce requires Shopify</div>');
}
http.createServer(async(req,res)=>{try{
 if(req.url.startsWith('/preview-fonts/')){
  const name=path.basename(req.url);
  if(!['assistant.ttf','cormorant.ttf'].includes(name))throw Error('Invalid font');
  res.setHeader('Content-Type','font/ttf');res.end(fs.readFileSync(path.join(__dirname,'fonts',name)));return;
 }
 if(req.url==='/__preview/reset'){previewCartItems=[];res.setHeader('Content-Type','application/json');res.end('{}');return;}
 if(req.url==='/cart.js'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(previewCart()));return;}
 if(req.method==='POST'&&['/cart/add.js','/cart/change.js'].includes(req.url)){
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);
  const data=req.headers['content-type']?.includes('application/json')?JSON.parse(body.toString()):Object.fromEntries(await new Request('http://localhost',{method:'POST',headers:{'content-type':req.headers['content-type']},body}).formData());
  res.setHeader('Content-Type','application/json');
  if(req.url==='/cart/add.js'){
   const product=products.find(p=>p.variants.some(v=>String(v.id)===String(data.id))),variant=product?.variants.find(v=>String(v.id)===String(data.id));
   if(!variant?.available){res.statusCode=422;res.end(JSON.stringify({description:'This preview option is sold out.'}));return;}
   const quantity=Number(data.quantity||1);if(!Number.isInteger(quantity)||quantity<1)throw Error('Invalid preview quantity');
   let item=previewCartItems.find(item=>String(item.variant_id)===String(variant.id));
   if(item){item.quantity+=quantity;item.final_line_price=item.original_line_price=variant.price*item.quantity;}
   else{item={key:'preview-'+variant.id,variant_id:variant.id,quantity,product,variant,image:product.featured_image,url:product.url,url_to_remove:'/cart',properties:[],final_line_price:variant.price*quantity,original_line_price:variant.price*quantity,line_level_discount_allocations:[]};previewCartItems.push(item);}
   res.end(JSON.stringify(item));return;
  }
  const item=previewCartItems.find(item=>item.key===data.id),quantity=Number(data.quantity);
  if(!item||!Number.isInteger(quantity)||quantity<0){res.statusCode=422;res.end(JSON.stringify({description:'Invalid preview bag update.'}));return;}
  item.quantity=quantity;item.final_line_price=item.original_line_price=item.variant.price*quantity;previewCartItems=previewCartItems.filter(item=>item.quantity>0);res.end(JSON.stringify(previewCart()));return;
 }
 if(req.url.startsWith('/assets/')){const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(path.join(root,'assets')+path.sep))throw Error('Invalid path');res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.webp')?'image/webp':'image/png');res.end(fs.readFileSync(file));return;}
 res.setHeader('Content-Type',req.url.includes('sections=')?'application/json':'text/html; charset=utf-8');res.end(await render(req.url));
}catch(e){res.statusCode=500;res.end(e.stack);}}).listen(9293,'127.0.0.1',()=>console.log('Visual fixture: http://127.0.0.1:9293 (Shopify runtime not simulated)'));
