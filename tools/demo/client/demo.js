/* This adapter is loaded only in the Vercel demo, never in the Shopify theme. */
(() => {
  const key='eloir-demo-cart-v1';
  let memory=[];
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return memory;}};
  const save=items=>{memory=items.map(item=>({variant_id:item.variant_id,quantity:item.quantity}));try{localStorage.setItem(key,JSON.stringify(memory));}catch{/* Private mode retains this page's bag in memory. */}};
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,options={})=>{
    const url=new URL(typeof input==='string'?input:input.url,location.origin);
    if(url.origin!==location.origin)return originalFetch(input,options);
    const headers=new Headers(input instanceof Request?input.headers:options.headers);
    headers.set('X-Demo-Cart',JSON.stringify(read()));
    const response=await originalFetch(input,{...options,headers});
    if(response.ok&&/\/cart\/(add|change)\.js$/.test(url.pathname)){
      const data=await response.clone().json();save(data.items||[]);
    }
    return response;
  };
  async function syncBag(){
    try{
      const [sections,cart]=await Promise.all([fetch('/?sections=cart-drawer-content,main-cart').then(r=>r.json()),fetch('/cart.js').then(r=>r.json())]);
      const parser=new DOMParser();
      for(const [name,selector] of [['cart-drawer-content','#CartDrawer [data-cart-drawer-content]'],['main-cart','[data-cart-page-content]']]){
        const current=document.querySelector(selector),fresh=parser.parseFromString(sections[name]||'','text/html').querySelector(name==='main-cart'?'[data-cart-page-content]':'[data-cart-drawer-content]');
        if(current&&fresh)current.innerHTML=fresh.innerHTML;
      }
      document.querySelectorAll('[data-cart-count]').forEach(node=>node.textContent=cart.item_count);
    }catch{/* Native page remains usable if a refresh fails. */}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    syncBag();
    document.addEventListener('submit',event=>{
      if(event.target.matches('[data-preview-form]:not([data-product-form])')){
        event.preventDefault();
        let feedback=event.target.querySelector('.demo-feedback');
        if(!feedback){feedback=document.createElement('p');feedback.className='demo-feedback';feedback.setAttribute('role','status');event.target.append(feedback);}
        feedback.textContent='Thanks for exploring Eloir. Subscriptions are not collected in this preview.';
      }
      if(event.target.matches('form[action="/cart"]')&&event.submitter?.name==='checkout'){
        event.preventDefault();location.assign('/checkout');
      }
    });
  });
  window.addEventListener('storage',event=>{if(event.key===key)syncBag();});
})();
