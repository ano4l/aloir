// Demo presentation renderer. Shopify remains the commerce runtime.
const fs = require('fs'), path = require('path'), http = require('http');
const { Liquid } = require('liquidjs');
const { pages } = require('./catalogue.cjs');
const root = path.resolve(__dirname, '../..');
const compiled = path.join(__dirname, 'compiled');
function compile() {
 fs.mkdirSync(compiled, { recursive: true });
 for(const file of fs.readdirSync(path.join(root,'snippets'))) fs.writeFileSync(path.join(compiled,file),source(fs.readFileSync(path.join(root,'snippets',file),'utf8')));
}
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
const names=['The linen camisole','The relaxed blazer','The satin shirt','The tailored trouser','The soft waistcoat'];
products.forEach((product,index)=>{
 product.title=names[index];
 product.featured_image.alt=names[index]+' — illustrative fashion image';
 product.description='<p>A study in '+['simple lines and easy layering','soft structure and relaxed proportions','fluid texture and an open neckline','clean lines and a relaxed silhouette','texture and considered layering'][index]+'. Explore a different way to build your everyday wardrobe.</p><p>Sample piece for the Eloir preview. Images, prices and measurements are illustrative; this item cannot be purchased.</p>';
 product.metafields.custom.size_chart.value.note='Demonstration measurements. Not verified product specifications.';
});
const edits=[
 {handle:'soft-structure',title:'Soft structure',description:'<p>Tailoring with room to move.</p>',indexes:[1,3,4],photo:1},
 {handle:'everyday-ease',title:'Everyday ease',description:'<p>Light layers. A little breathing room.</p>',indexes:[0,2,4],photo:0},
 {handle:'after-hours',title:'After hours',description:'<p>Fluid textures for a different kind of evening.</p>',indexes:[0,2],photo:2},
 {handle:'seasonal-edit',title:'The seasonal edit',description:'<p>Familiar favourites, seen differently.</p>',indexes:[0,1,3],photo:2},
 {handle:'new-arrivals',title:'New perspectives',description:'<p>A fresh point of view on getting dressed.</p>',indexes:[4,2,1],photo:4}
].map(edit=>({...edit,url:'/collections/'+edit.handle,products:edit.indexes.map(i=>products[i]),products_count:edit.indexes.length,featured_image:products[edit.photo].featured_image}));
function previewCart(previewCartItems=[]){return {items:previewCartItems,item_count:previewCartItems.reduce((n,item)=>n+item.quantity,0),total_price:previewCartItems.reduce((n,item)=>n+item.final_line_price,0),currency:{iso_code:'USD'},cart_level_discount_applications:[]};}
const collection={ title:'The collection', url:'/collections/all', description:'<p>Considered silhouettes. Quiet confidence.</p>', products, products_count:products.length, filters:[], sort_options:[{value:'manual',name:'Featured'},{value:'price-ascending',name:'Price, low to high'}],default_sort_by:'manual' };
function baseContext(url, cartItems=[]) {
 const settings=JSON.parse(fs.readFileSync(path.join(root,'config/settings_data.json'))).current;
 settings.font_heading={family:'Cormorant Garamond', fallback_families:'serif'}; settings.font_body={family:'Assistant',fallback_families:'sans-serif'};
 const parsedURL=new URL(url,'http://localhost');
 const activeEdit=edits.find(edit=>parsedURL.pathname===edit.url);
 const collectionProducts=activeEdit?.products||products;
 const pageData=pages[parsedURL.pathname];
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
 const filteredCollection=sorted(filterProducts(collectionProducts));
 const localCollection={...collection,...activeEdit,products:filteredCollection,products_count:filteredCollection.length,all_products_count:collectionProducts.length,filters:filtersFor(collectionProducts),sort_by:parsedURL.searchParams.get('sort_by')||'manual'};
 const matching=sorted(filterProducts(searched));
 const searchResult={performed:!!query,terms:query,url:'/search',types:['product'],results:matching.map(piece=>({...piece,object_type:'product'})),results_count:matching.length,filters:filtersFor(searched),sort_by:parsedURL.searchParams.get('sort_by')||'relevance',default_sort_by:'relevance',sort_options:[{value:'relevance',name:'Relevance'},{value:'price-ascending',name:'Price, low to high'},{value:'price-descending',name:'Price, high to low'}]};
 return { settings, collections:edits.slice(0,3), shop:{name:'Eloir',money_format:'${{amount}}',customer_accounts_enabled:false,enabled_payment_types:[],shipping_policy:{url:'/policies/shipping-policy',body:'Preview shipping policy'},refund_policy:{url:'/policies/refund-policy',body:'Preview refund policy'},privacy_policy:{url:'/policies/privacy-policy'},terms_of_service:{url:'/policies/terms-of-service'}}, routes:{root_url:'/',cart_url:'/cart',cart_add_url:'/cart/add',search_url:'/search',account_url:'/account',collections_url:'/collections',all_products_collection_url:'/collections/all'},
 request:{locale:{iso_code:'en'},design_mode:false,page_type:parsedURL.pathname.startsWith('/products')?'product':parsedURL.pathname.startsWith('/search')?'search':'index'},cart:previewCart(cartItems),form:{},localization:{available_countries:[],available_languages:[]},page_title:pageData?.[0]||activeEdit?.title||'Eloir — A considered wardrobe',current_page:1,canonical_url:url,collection:localCollection,product, paginate:{pages:1},search:searchResult,predictive_search:{performed:parsedURL.pathname==='/search/suggest',resources:{products:searched}},page:{title:pageData?.[0]||'Our story',content:pageData?.[1]||'<p>Considered pieces for the modern woman.</p>'} };
}
async function section(type, id, data, context, fixtures) {
 const raw=fs.readFileSync(path.join(root,'sections',type+'.liquid'),'utf8');
 const schema=JSON.parse(raw.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
 const settings={...defaults(schema),...data.settings};
 if(type==='featured-collection')settings.limit=4;
 if (typeof settings.menu === 'string') settings.menu={links:[{title:'Shop',url:'/collections/all',links:edits.slice(0,3).map(edit=>({title:edit.title,url:edit.url}))},{title:'New arrivals',url:'/collections/new-arrivals'},{title:'Our story',url:'/pages/our-story'}]};
 if(type==='category-grid') Object.values(data.blocks||{}).forEach((block,index)=>{block.settings={...block.settings,collection:edits[index]};});
 if(type==='featured-collection')data.blocks=Object.fromEntries(edits.slice(0,3).map((edit,index)=>['demo-'+index,{type:'tab',settings:{label:edit.title,collection:edit}}]));
 if(type==='editorial-story')settings.link='/pages/our-story';
 if(type==='footer'){
  const blocks=Object.values(data.blocks||{});
  const care=blocks.find(block=>block.settings.heading==='Customer care');
  if(care)care.settings.text='<ul role="list"><li><a href="/pages/contact">Contact us</a></li><li><a href="/pages/size-guide">Size guide</a></li><li><a href="/policies/shipping-policy">Delivery</a></li><li><a href="/policies/refund-policy">Returns</a></li></ul>';
  const about=blocks.find(block=>block.settings.heading==='About');
  if(about)about.settings.text='<ul role="list"><li><a href="/pages/our-story">Our story</a></li><li><a href="/policies/privacy-policy">Privacy</a></li><li><a href="/policies/terms-of-service">Terms</a></li></ul>';
 }
 if(type==='featured-collection' && fixtures) settings.collection=collection;
 if(type==='seasonal-edit' && fixtures){
  settings.collection=edits[3];
  if(context.canonical_url.includes('offer=1'))Object.assign(settings,{enable_offer:true,discount_code:'PREVIEW 15',offer_text:'Illustrative seasonal offer — preview only',terms:'<p>Local fixture; no live discount is created or redeemed.</p>'});
 }
 if(type==='main-product' && fixtures)settings.size_guide={title:'Find your fit',url:'/pages/size-guide',content:'<p>Illustrative size-guide fixture. Actual measurements must come from the imported product.</p>'};
 return engine.parseAndRender(source(raw),{...context,section:{id,settings,blocks:Object.entries(data.blocks || {}).map(([bid,b]) => ({id:bid,...b})),shopify_attributes:''}});
}
async function group(name,context,fixtures) {
 const data=JSON.parse(fs.readFileSync(path.join(root,'sections',name+'.json'),'utf8'));
 let html=''; for(const id of data.order) html+=await section(data.sections[id].type,id,data.sections[id],context,fixtures); return html;
}
async function render(url, cartItems=[]) {
 const fixtures=!url.includes('empty=1'), context=baseContext(url, cartItems);
 const parsedURL=new URL(url,'http://localhost');
 context.routes.product_recommendations_url='/recommendations/products';
 if(parsedURL.pathname==='/recommendations/products'){
  const related=products.filter(product=>String(product.id)!==parsedURL.searchParams.get('product_id')).slice(0,4);
  context.recommendations={performed:true,products:related,products_count:related.length};
 }
 const requestedSection=parsedURL.searchParams.get('section_id');
 if(requestedSection&&/^[a-z0-9-]+$/.test(requestedSection)){
  const sectionType=requestedSection==='s1'?'related-products':requestedSection;
  if(!fs.existsSync(path.join(root,'sections',sectionType+'.liquid')))return '';
  return section(sectionType,requestedSection,{settings:{}},context,fixtures);
 }
 if(parsedURL.searchParams.has('sections')){
  const result={};for(const type of parsedURL.searchParams.get('sections').split(','))if(/^[a-z0-9-]+$/.test(type)&&fs.existsSync(path.join(root,'sections',type+'.liquid')))result[type]=await section(type,type,{settings:{}},context,fixtures);
  return JSON.stringify(result);
 }
 const template=url.startsWith('/products')?'product':parsedURL.pathname==='/collections'?'list-collections':url.startsWith('/collections/')?'collection':url.startsWith('/cart')?'cart':url.startsWith('/pages')||url.startsWith('/policies')||url.startsWith('/checkout')?'page':url.startsWith('/search')?'search':url==='/404'?'404':'index';
 const data=JSON.parse(fs.readFileSync(path.join(root,'templates',template+'.json'),'utf8'));
 let body=''; for(const id of data.order) body+=await section(data.sections[id].type,id,data.sections[id],context,fixtures);
 let layout=source(fs.readFileSync(path.join(root,'layout/theme.liquid'),'utf8'));
 layout=layout.replace(/{% sections 'header-group' %}/g,await group('header-group',context,fixtures)).replace(/{% sections 'footer-group' %}/g,await group('footer-group',context,fixtures));
 const html=await engine.parseAndRender(layout,{...context,content_for_layout:body});
 return html.replace('</head>', '<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/demo/demo.css"><script src="/demo/demo.js"></script></head>').replace('<body>', '<body><div class="demo-notice">Eloir preview <span>Sample collection · no payments or orders</span></div>');
}

module.exports={compile,render,products,previewCart};
