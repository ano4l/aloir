/* Eloir storefront. Native forms remain functional when JavaScript is unavailable. */
(() => {
  'use strict';
  const config = window.Eloir || {root:'/',currency:'USD',locale:'en'};
  const root = config.root.endsWith('/') ? config.root : config.root + '/';
  const route = path => root + path;
  const money = cents => new Intl.NumberFormat(config.locale,{style:'currency',currency:config.currency || 'USD'}).format(cents / 100);
  const status = message => { const node = document.querySelector('[data-global-status]'); if (node) node.textContent = message; };
  const parse = html => new DOMParser().parseFromString(html,'text/html');
  let cartBusy = false;
  const motionBehavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  const closeDialog = dialog => { if (dialog?.open) dialog.close(); };
  const openDialog = (dialog,opener=document.activeElement) => {
    if (!dialog || dialog.open) return;
    const source=opener?.closest?.('dialog');
    dialog._opener=source?._opener||opener;
    document.querySelectorAll('dialog[open]').forEach(item=>{item._transitioning=true;closeDialog(item);});
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.querySelector('input:not([type=hidden]),button,a')?.focus();
  };
  document.addEventListener('close', event => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
    const dialog=event.target;
    if(!dialog._transitioning&&dialog._opener?.isConnected&&!document.querySelector('dialog[open]'))dialog._opener.focus({preventScroll:true});
    dialog._transitioning=false;
  },true);
  document.addEventListener('click', event => {
    const opener=event.target.closest('[data-open-dialog]');
    if(opener)openDialog(document.getElementById(opener.dataset.openDialog),opener);
    const closer=event.target.closest('[data-close-dialog]');
    if(closer)closeDialog(closer.closest('dialog'));
    if(event.target.tagName==='DIALOG'){
      const rect=event.target.getBoundingClientRect();
      if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(event.target);
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')document.querySelectorAll('.nav-dropdown[open],.filter[open]').forEach(item=>item.removeAttribute('open'));
  });
  document.addEventListener('click',event=>{
    document.querySelectorAll('.nav-dropdown[open],.filter[open]').forEach(item=>{if(!item.contains(event.target))item.removeAttribute('open');});
  });
  async function request(path,options={}){
    const response=await fetch(route(path),{...options,headers:{Accept:'application/json',...(options.headers||{})}});
    let data;
    try{data=await response.json();}catch{throw new Error('We could not connect to your bag. Please try again.');}
    if(!response.ok)throw new Error(data.description||data.message||'Your bag could not be updated. Please try again.');
    return data;
  }
  async function refreshCart(open=false){
    const response=await fetch(route('?sections=cart-drawer-content,main-cart'),{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Your bag was updated, but could not be displayed. Open your bag to review it.');
    const sections=await response.json();
    const drawerHTML=sections['cart-drawer-content'];
    if(!drawerHTML)throw new Error('Your bag was updated. Please open the bag page to review it.');
    const fresh=parse(drawerHTML).querySelector('[data-cart-drawer-content]');
    const current=document.querySelector('#CartDrawer [data-cart-drawer-content]');
    if(fresh&&current)current.innerHTML=fresh.innerHTML;
    const page=document.querySelector('[data-cart-page-content]');
    if(page&&sections['main-cart']){
      const pageFresh=parse(sections['main-cart']).querySelector('[data-cart-page-content]');
      if(pageFresh)page.innerHTML=pageFresh.innerHTML;
    }
    const cart=await request('cart.js');
    document.querySelectorAll('[data-cart-count]').forEach(node=>{node.textContent=cart.item_count;});
    if(open)openDialog(document.getElementById('CartDrawer'));
    status('Shopping bag updated. '+cart.item_count+' items.');
  }
  document.addEventListener('click',async event=>{
    const opener=event.target.closest('[data-open-cart]');
    if(!opener)return;
    event.preventDefault();
    openDialog(document.getElementById('CartDrawer'),opener);
    try{await refreshCart();}catch(error){const node=document.querySelector('#CartDrawer [data-cart-error]');if(node)node.textContent=error.message;else status(error.message);}
  });
  document.addEventListener('submit',async event=>{
    const form=event.target.closest('[data-product-form]');
    if(!form)return;
    event.preventDefault();
    const button=form.querySelector('[type=submit]');
    if(!button||button.disabled)return;
    const message=form.querySelector('.form-message');
    const original=button.textContent;
    button.disabled=true;button.textContent='Adding…';form.setAttribute('aria-busy','true');
    const stickyButton=form.closest('[data-product-section]')?.querySelector('[data-sticky-add]');
    if(stickyButton){stickyButton.disabled=true;stickyButton.textContent='Adding…';}
    if(message){message.textContent='';message.classList.remove('error');}
    let added=false;
    try{
      await request('cart/add.js',{method:'POST',body:new FormData(form)});
      added=true;
      await refreshCart(true);
      if(message)message.textContent='Added to your bag.';
    }catch(error){
      const feedback=added?'Your piece was added. Open your bag to review it; the bag preview could not refresh.':error.message;
      if(message){message.textContent=feedback;message.classList.add('error');if(added){const link=document.createElement('a');link.href=route('cart');link.textContent=' View bag';message.append(link);}}
      status(feedback);
    }
    finally{
      const section=form.closest('[data-product-section]');
      if(section){
        const selector=section.querySelector('[data-variant-select]');
        let variants=[];try{variants=JSON.parse(section.querySelector('[data-variants]')?.textContent||'[]');}catch{}
        const variant=variants.find(item=>String(item.id)===selector?.value);
        const options=[...section.querySelectorAll('[data-product-option]')].map(input=>input.value);
        const matches=variant&&(!options.length||variant.options?.every((value,index)=>value===options[index]));
        button.disabled=!matches||!variant.available;
        button.textContent=!matches?'Unavailable combination':variant.available?'Add to bag':'Sold out';
        if(stickyButton){stickyButton.disabled=button.disabled;stickyButton.textContent=!matches?'Unavailable':variant.available?'Add to bag':'Sold out';}
      }else{button.disabled=false;button.textContent=original;}
      form.removeAttribute('aria-busy');
    }
  });
  async function changeCart(key,quantity,trigger){
    if(cartBusy)return;
    cartBusy=true;
    const form=trigger.closest('.cart-form');
    const focusId=trigger.id;
    const cartScope=trigger.closest('[data-cart-page-content],[data-cart-drawer-content]');
    const scopeSelector=cartScope?.matches('[data-cart-page-content]')?'[data-cart-page-content]':'#CartDrawer [data-cart-drawer-content]';
    const step=trigger.dataset.cartStep;
    form?.setAttribute('aria-busy','true');
    const delayed=setTimeout(()=>{form?.classList.add('cart-working');status('Updating your bag…');},180);
    const errorNode=form?.querySelector('[data-cart-error]');
    if(errorNode)errorNode.textContent='';
    try{
      const result=await request('cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity})});
      await refreshCart();
      const scope=document.querySelector(scopeSelector);
      const controls=[...scope.querySelectorAll('[data-key]')];
      const equivalent=focusId?document.getElementById(focusId):controls.find(node=>node.dataset.key===key&&(step?node.dataset.cartStep===step:node.matches('[data-cart-remove]')));
      (equivalent||scope.querySelector('.cart-quantity button,.cart-summary button,.empty-state a'))?.focus({preventScroll:true});
      const adjusted=result.items?.find(item=>item.key===key);if(adjusted&&adjusted.quantity!==quantity)status('Shopify adjusted this item to '+adjusted.quantity+' available.');
    }catch(error){
      // Shopify may adjust inventory even when it reports an error. Read back its cart.
      try{await refreshCart();}catch{}
      const scope=document.querySelector(scopeSelector);const liveError=scope?.querySelector('[data-cart-error]')||errorNode;
      if(liveError)liveError.textContent=error.message;
      status(error.message);
      const equivalent=[...(scope?.querySelectorAll('[data-key]')||[])].find(node=>node.dataset.key===key&&node.matches('[data-cart-quantity]'));
      (equivalent||scope?.querySelector('.cart-summary button,.empty-state a')||trigger)?.focus({preventScroll:true});
    }
    finally{clearTimeout(delayed);cartBusy=false;form?.removeAttribute('aria-busy');form?.classList.remove('cart-working');}
  }
  document.addEventListener('click',event=>{
    const remove=event.target.closest('[data-cart-remove]');
    if(remove){event.preventDefault();changeCart(remove.dataset.key,0,remove);return;}
    const step=event.target.closest('[data-cart-step]');
    if(step){const input=step.closest('.cart-quantity').querySelector('input');changeCart(step.dataset.key,Math.max(0,Number(input.value)+Number(step.dataset.cartStep)),step);}
  });
  document.addEventListener('change',event=>{
    const input=event.target.closest('[data-cart-quantity]');
    if(input){const value=Number(input.value);if(Number.isInteger(value)&&value>=0)changeCart(input.dataset.key,value,input);}
  });
  function initProducts(scope=document){
    scope.querySelectorAll('[data-product-section]').forEach(section=>{
      if(section.dataset.initialized)return;
      section.dataset.initialized='true';
      const selector=section.querySelector('[data-variant-select]');
      const variants=JSON.parse(section.querySelector('[data-variants]')?.textContent||'[]');
      selector?.addEventListener('change',()=>{
        const variant=variants.find(item=>String(item.id)===selector.value);
        if(!variant)return;
        const price=section.querySelector('[data-variant-price]');
        if(price){price.textContent=money(variant.price);if(variant.compare_at_price>variant.price){const compare=document.createElement('s');compare.textContent=money(variant.compare_at_price);price.append(' ',compare);}}
        const button=section.querySelector('[data-add-button]');
        button.disabled=!variant.available;button.textContent=variant.available?'Add to bag':'Sold out';
        const dynamic=section.querySelector('[data-dynamic-checkout]');if(dynamic)dynamic.hidden=!variant.available;
        if(!section.closest('.quick-shop-content')){const url=new URL(location.href);url.searchParams.set('variant',variant.id);history.replaceState({},'',url);}
        const summary=section.querySelector('[data-selection-summary]');
        if(summary)summary.textContent=(variant.title==='Default Title'?'':variant.title+' · ')+(variant.available?'Available':'Sold out');
        const stickyPrice=section.querySelector('[data-sticky-price]');if(stickyPrice)stickyPrice.textContent=money(variant.price);
        const stickySelection=section.querySelector('[data-sticky-selection]');if(stickySelection)stickySelection.textContent=variant.title==='Default Title'?'':variant.title;
        const saving=section.querySelector('[data-variant-saving]');if(saving)saving.textContent=variant.compare_at_price>variant.price?'Save '+money(variant.compare_at_price-variant.price):'';
        const stickyButton=section.querySelector('[data-sticky-add]');if(stickyButton){stickyButton.disabled=!variant.available;stickyButton.textContent=variant.available?'Add to bag':'Sold out';}
        const mediaId=variant.featured_media?.id||variant.featured_image?.id;
        const media=mediaId&&section.querySelector('[data-media-id="'+mediaId+'"]');
        if(media){media.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'start'});}
        status(variant.available?'Selected '+variant.title:'Selected option is sold out.');
      });
      const optionGroups=section.querySelector('[data-option-groups]');
      if(optionGroups&&selector){
        optionGroups.hidden=false;section.querySelector('[data-native-variant]').hidden=true;
        const options=[...optionGroups.querySelectorAll('[data-product-option]')];
        options.forEach(option=>option.addEventListener('change',()=>{
          const choice=options.map(input=>input.value);
          const variant=variants.find(item=>item.options?.every((value,index)=>value===choice[index]));
          const message=section.querySelector('.form-message');
          if(variant){selector.value=variant.id;if(message)message.textContent='';selector.dispatchEvent(new Event('change',{bubbles:true}));}
          else{const button=section.querySelector('[data-add-button]');button.disabled=true;button.textContent='Unavailable combination';const sticky=section.querySelector('[data-sticky-add]');if(sticky){sticky.disabled=true;sticky.textContent='Unavailable';}const stickySelection=section.querySelector('[data-sticky-selection]');if(stickySelection)stickySelection.textContent=choice.join(' / ');const summary=section.querySelector('[data-selection-summary]');if(summary)summary.textContent='This combination is unavailable.';const dynamic=section.querySelector('[data-dynamic-checkout]');if(dynamic)dynamic.hidden=true;if(message)message.textContent='This combination is not available. Please choose another option.';}
          updateSizeRadios();
        }));
        const sizeSelect=options.find(input=>/^(size|taille|talla|gr[oö]sse|tamanho)$/i.test(input.labels?.[0]?.textContent.trim()||''));
        let sizeRadios=[];
        if(sizeSelect&&sizeSelect.options.length<=12){
          const fieldset=document.createElement('fieldset');fieldset.className='size-options';const legend=document.createElement('legend');legend.textContent=sizeSelect.labels[0].textContent;fieldset.append(legend);
          [...sizeSelect.options].forEach((option,index)=>{const label=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name='eloir-size-'+selector.id;radio.value=option.value;radio.checked=option.selected;radio.id='SizeRadio-'+selector.id+'-'+index;const span=document.createElement('span');span.textContent=option.textContent;label.append(radio,span);fieldset.append(label);sizeRadios.push(radio);radio.addEventListener('change',()=>{sizeSelect.value=radio.value;sizeSelect.dispatchEvent(new Event('change',{bubbles:true}));});});
          sizeSelect.before(fieldset);sizeSelect.hidden=true;sizeSelect.labels[0].hidden=true;
        }
        function updateSizeRadios(){sizeRadios.forEach(radio=>{const choices=options.map(input=>input===sizeSelect?radio.value:input.value);radio.disabled=!variants.some(variant=>variant.available&&variant.options?.every((value,index)=>value===choices[index]));radio.checked=sizeSelect.value===radio.value;radio.parentElement.classList.toggle('unavailable',radio.disabled);});}
        updateSizeRadios();
      }
      section.querySelectorAll('[data-gallery-target]').forEach(link=>link.addEventListener('click',event=>{
        const media=section.querySelector('[data-media-id="'+link.dataset.galleryTarget+'"]');
        if(media){event.preventDefault();media.scrollIntoView({behavior:motionBehavior(),block:'nearest',inline:'start'});}
      }));
      const gallery=section.querySelector('[data-gallery]');
      if(gallery&&'IntersectionObserver' in window){
        const media=[...gallery.querySelectorAll('[data-media-id]')];
        const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          const index=media.indexOf(entry.target);const progress=section.querySelector('[data-gallery-progress]');if(progress)progress.textContent=(index+1)+' / '+media.length;
          section.querySelectorAll('[data-gallery-target]').forEach(link=>{if(link.dataset.galleryTarget===entry.target.dataset.mediaId)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
        }),{root:matchMedia('(max-width: 749px)').matches?gallery:null,threshold:.5});
        media.forEach(item=>observer.observe(item));
        section._galleryObserver=observer;
      }
      const sticky=section.querySelector('[data-mobile-buy]');
      const primaryButton=section.querySelector('[data-add-button]');
      if(sticky&&primaryButton&&'IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting;},{threshold:.1});observer.observe(primaryButton);section._buyObserver=observer;
        section.querySelector('[data-sticky-add]')?.addEventListener('click',()=>{if(primaryButton.disabled)return;primaryButton.closest('form').requestSubmit(primaryButton);});
      }
    });
  }
  document.addEventListener('click',event=>{
    const guide=event.target.closest('[data-size-guide-dialog]');if(guide){const dialog=document.getElementById(guide.dataset.sizeGuideDialog);if(dialog){event.preventDefault();openDialog(dialog);}}
    const link=event.target.closest('[data-zoom-image]');if(!link)return;event.preventDefault();
    let dialog=document.getElementById('ImageZoom');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='ImageZoom';dialog.className='zoom-dialog';dialog.setAttribute('aria-label','Product image zoom');const button=document.createElement('button');button.type='button';button.textContent='Close';button.dataset.closeDialog='';const image=document.createElement('img');dialog.append(button,image);document.body.append(dialog);}
    const image=dialog.querySelector('img');image.src=link.href;image.alt=link.querySelector('img')?.alt||'Product detail';openDialog(dialog);
  });
  const wishlistKey='eloir-wishlist-v1';
  let saved=[];
  try{const entries=JSON.parse(localStorage.getItem(wishlistKey)||'[]');if(Array.isArray(entries))saved=entries.filter(item=>item&&typeof item.handle==='string'&&typeof item.title==='string'&&typeof item.url==='string').slice(0,100);}catch{}
  function storeSaved(){try{localStorage.setItem(wishlistKey,JSON.stringify(saved));}catch{status('Saved pieces are available for this visit. Browser storage is unavailable.');}}
  function syncSaved(){document.querySelectorAll('[data-save-product]').forEach(button=>{const selected=saved.some(item=>item.handle===button.dataset.handle);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',(selected?'Unsave ':'Save ')+button.dataset.title);});}
  function renderSaved(){
    const container=document.querySelector('[data-wishlist-items]');if(!container)return;container.replaceChildren();
    if(!saved.length){const empty=document.createElement('div');empty.className='empty-state';const h=document.createElement('h2');h.textContent='Keep what inspires you.';const p=document.createElement('p');p.textContent='Save a piece with the heart icon and return to it here. Saved pieces stay in this browser.';empty.append(h,p);container.append(empty);return;}
    saved.forEach(item=>{
      const article=document.createElement('article');article.className='wishlist-item';
      const link=document.createElement('a');let validURL;try{validURL=new URL(item.url,location.origin);if(validURL.origin!==location.origin)return;}catch{return;}link.href=validURL.href;
      if(item.image){try{const imageURL=new URL(item.image,location.origin);if(['https:','http:'].includes(imageURL.protocol)){const image=document.createElement('img');image.src=imageURL.href;image.alt=item.title;image.loading='lazy';image.width=75;image.height=100;link.append(image);}}catch{}}
      const content=document.createElement('div');const heading=document.createElement('h3');const title=document.createElement('a');title.href=validURL.href;title.textContent=item.title;heading.append(title);
      const remove=document.createElement('button');remove.type='button';remove.textContent='Remove from saved pieces';remove.addEventListener('click',()=>{saved=saved.filter(entry=>entry.handle!==item.handle);storeSaved();syncSaved();renderSaved();});
      content.append(heading,remove);article.append(link,content);container.append(article);
    });
  }
  document.addEventListener('click',event=>{
    const save=event.target.closest('[data-save-product]');
    if(save){const index=saved.findIndex(item=>item.handle===save.dataset.handle);if(index<0){saved.push({handle:save.dataset.handle,title:save.dataset.title,url:save.dataset.url,image:save.dataset.image});status('Piece saved.');}else{saved.splice(index,1);status('Piece removed from saved pieces.');}storeSaved();syncSaved();}
    if(event.target.closest('[data-open-wishlist]')){renderSaved();openDialog(document.getElementById('WishlistDialog'));}
  });
  async function initRecommendations(scope=document){
    const items=scope.querySelectorAll('[data-recommendations]');
    for(const item of items){if(item.dataset.loaded)continue;item.dataset.loaded='true';try{const response=await fetch(item.dataset.url);if(!response.ok)continue;const html=parse(await response.text()).querySelector('[data-recommendations]');if(html&&html.innerHTML.trim()){item.innerHTML=html.innerHTML;syncSaved();}}catch{/* Recommendations are an enhancement. */}}
  }
  function initAddresses(scope=document){
    scope.querySelectorAll('[data-address-country]').forEach(country=>{
      if(country.dataset.initialized)return;country.dataset.initialized='true';
      if(country.dataset.default)country.value=country.dataset.default;
      const province=document.getElementById(country.dataset.provinceId);if(!province)return;
      const update=()=>{let provinces=[];try{provinces=JSON.parse(country.selectedOptions[0]?.dataset.provinces||'[]');}catch{}province.replaceChildren();if(!provinces.length){const empty=document.createElement('option');empty.value='';empty.textContent='Not applicable';province.append(empty);}else provinces.forEach(item=>{const option=document.createElement('option');option.value=item[0];option.textContent=item[1];province.append(option);});if(province.dataset.default)province.value=province.dataset.default;};
      country.addEventListener('change',()=>{province.dataset.default='';update();});update();
    });
  }
  document.addEventListener('submit',event=>{if(event.target.matches('[data-delete-address]')&&!window.confirm('Delete this address?'))event.preventDefault();});
  initProducts();syncSaved();initRecommendations();initAddresses();
  let quickRequest=0;
  document.addEventListener('click',async event=>{
    const trigger=event.target.closest('[data-quick-shop]');if(!trigger)return;
    const dialog=document.getElementById('QuickShopDialog');if(!dialog)return;
    event.preventDefault();const current=++quickRequest;
    const container=dialog.querySelector('[data-quick-shop-content]');container.replaceChildren();
    const loading=document.createElement('p');loading.className='quick-shop-loading';loading.setAttribute('role','status');loading.textContent='Preparing a closer look…';container.append(loading);dialog.setAttribute('aria-busy','true');openDialog(dialog,trigger);
    try{
      const url=new URL(trigger.dataset.quickShop,location.origin);if(url.origin!==location.origin)throw new Error('Unable to open this piece.');url.searchParams.set('section_id','quick-shop');
      const response=await fetch(url.href);if(!response.ok)throw new Error('This piece could not be loaded.');
      const fresh=parse(await response.text()).querySelector('.quick-shop-content');if(!fresh)throw new Error('This piece could not be loaded.');
      if(current!==quickRequest)return;container.replaceChildren(fresh);initProducts(container);container.querySelector('select,button,a')?.focus();
    }catch(error){
      if(current!==quickRequest)return;
      container.replaceChildren();const message=document.createElement('p');message.setAttribute('role','alert');message.textContent=error.message+' You can still view the full product page.';const link=document.createElement('a');link.className='button';link.href=trigger.href;link.textContent='View product';container.append(message,link);
    }finally{if(current===quickRequest)dialog.removeAttribute('aria-busy');}
  });
  document.getElementById('QuickShopDialog')?.addEventListener('close',()=>{quickRequest++;});
  let predictiveTimer,predictiveAbort,predictiveRequest=0;
  document.addEventListener('input',event=>{
    const input=event.target.closest('[data-predictive-search]');if(!input)return;
    const results=document.querySelector('[data-predictive-results]');if(!results)return;
    clearTimeout(predictiveTimer);predictiveAbort?.abort();
    const current=++predictiveRequest;
    document.querySelector('[data-clear-search]').hidden=!input.value;
    const query=input.value.trim();
    if(query.length<2){results.replaceChildren();input.setAttribute('aria-expanded','false');return;}
    results.replaceChildren();const loading=document.createElement('p');loading.className='small-text';loading.textContent='Finding pieces…';results.append(loading);input.setAttribute('aria-expanded','true');
    predictiveTimer=setTimeout(async()=>{
      predictiveAbort=new AbortController();
      try{
        const url=new URL(route('search/suggest'),location.origin);url.searchParams.set('q',query);url.searchParams.set('resources[type]','product');url.searchParams.set('resources[limit]','5');url.searchParams.set('section_id','predictive-search');
        const response=await fetch(url.href,{signal:predictiveAbort.signal});if(!response.ok)throw new Error('Suggestions unavailable');
        const fresh=parse(await response.text()).querySelector('[data-predictive-content]');if(input.value.trim()!==query||current!==predictiveRequest)return;
        results.replaceChildren();if(fresh)results.append(fresh);else{const message=document.createElement('p');message.className='small-text';message.textContent='Press Search to see all matching pieces.';results.append(message);}input.setAttribute('aria-expanded','true');
      }catch(error){if(error.name==='AbortError'||current!==predictiveRequest)return;results.replaceChildren();const message=document.createElement('p');message.className='small-text';message.textContent='Suggestions are unavailable. Press Search to browse results.';results.append(message);input.setAttribute('aria-expanded','true');}
    },220);
  });
  document.addEventListener('click',event=>{if(event.target.closest('[data-clear-search]')){const input=document.querySelector('[data-predictive-search]');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}});
  document.addEventListener('keydown',event=>{
    const input=document.querySelector('[data-predictive-search]');const results=document.querySelector('[data-predictive-results]');if(!input||!results)return;
    const links=[...results.querySelectorAll('a')];const index=links.indexOf(document.activeElement);
    if(event.key==='ArrowDown'&&(event.target===input||index>=0)&&links.length){event.preventDefault();links[Math.min(index+1,links.length-1)].focus();}
    if(event.key==='ArrowUp'&&index>=0){event.preventDefault();if(index===0)input.focus();else links[index-1].focus();}
  });
  document.getElementById('SearchDialog')?.addEventListener('close',()=>{clearTimeout(predictiveTimer);predictiveAbort?.abort();predictiveRequest++;document.querySelector('[data-predictive-search]')?.setAttribute('aria-expanded','false');document.querySelector('[data-predictive-results]')?.replaceChildren();});
  function initMeasurements(scope=document){
    scope.querySelectorAll('[data-product-measurements]').forEach(container=>{
      if(container.dataset.initialized)return;
      let chart;try{chart=JSON.parse(container.querySelector('[data-size-chart-json]').textContent);}catch{container.hidden=true;return;}
      const valid=chart&&['cm','in'].includes(chart.unit)&&['garment','body'].includes(chart.measurement_type)&&Array.isArray(chart.columns)&&chart.columns.length>0&&chart.columns.every(value=>typeof value==='string'&&value.trim())&&Array.isArray(chart.rows)&&chart.rows.length>0&&chart.rows.every(row=>row&&typeof row.size==='string'&&row.size.trim()&&Array.isArray(row.values)&&row.values.length===chart.columns.length&&row.values.every(value=>(typeof value==='number'&&Number.isFinite(value)&&value>=0)||(typeof value==='string'&&value.trim())));
      if(!valid){container.hidden=true;return;}
      container.dataset.initialized='true';
      const values=chart.rows.flatMap(row=>row.values);const cells=[...container.querySelectorAll('[data-measurement-cell]')];const buttons=[...container.querySelectorAll('[data-measurement-unit]')];
      const numeric=values.some(value=>typeof value==='number');
      if(numeric){container.querySelector('.measurement-units').hidden=false;buttons.forEach(button=>button.addEventListener('click',()=>{
        const unit=button.dataset.measurementUnit;
        cells.forEach((cell,index)=>{const value=values[index];if(typeof value==='number'){const converted=unit===chart.unit?value:chart.unit==='cm'?value/2.54:value*2.54;cell.textContent=unit===chart.unit?String(value):new Intl.NumberFormat(config.locale,{maximumFractionDigits:1,minimumFractionDigits:0}).format(converted);}else{cell.textContent=String(value)+(unit===chart.unit?'':' ('+chart.unit+')');}});
        container.querySelector('[data-measurement-caption-unit]').textContent=unit;container.querySelector('.measurement-conversion').hidden=unit===chart.unit;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      }));}
      const details=container.querySelector('.measurement-details');const content=container.querySelector('[data-measurement-content]');const link=container.querySelector('[data-measurement-link]');
      if(!window.HTMLDialogElement||!HTMLDialogElement.prototype.showModal)return;
      const dialog=document.createElement('dialog');dialog.className='size-guide-dialog measurement-dialog';dialog.id=details.id+'-Dialog';dialog.setAttribute('aria-label','Product measurements');const heading=document.createElement('div');heading.className='drawer-heading';const title=document.createElement('h2');title.textContent='Product measurements';const close=document.createElement('button');close.type='button';close.dataset.closeDialog='';close.textContent='Close';heading.append(title,close);dialog.append(heading,content);container.append(dialog);details.hidden=true;
      link.dataset.sizeGuideDialog=dialog.id;
    });
  }
  initMeasurements();
  function initMobileFilters(scope=document){
    const controls=scope.querySelector('[data-filter-controls]');const trigger=scope.querySelector('[data-open-filters]');if(!controls||!trigger||controls.dataset.initialized)return;controls.dataset.initialized='true';
    const owner=controls.closest('.shopify-section');controls._owner=owner;
    const anchor=document.createElement('span');controls.before(anchor);
    const dialog=document.createElement('dialog');dialog.className='side-dialog filter-dialog';dialog.setAttribute('aria-label','Filter and sort results');
    const heading=document.createElement('div');heading.className='drawer-heading';const title=document.createElement('h2');title.textContent='Find your pieces';const close=document.createElement('button');close.type='button';close.dataset.closeDialog='';close.textContent='Close';heading.append(title,close);dialog.append(heading);document.body.append(dialog);
    const media=matchMedia('(max-width: 749px)');
    const update=()=>{trigger.hidden=!media.matches;if(media.matches)dialog.append(controls);else{closeDialog(dialog);anchor.after(controls);}};
    media.addEventListener('change',update);update();trigger.addEventListener('click',()=>openDialog(dialog));
    controls._cleanup=()=>{media.removeEventListener('change',update);dialog.remove();anchor.remove();};
  }
  initMobileFilters();
  function initCategoryRails(scope=document){
    scope.querySelectorAll('[data-category-section]').forEach(section=>{
      if(section.dataset.initialized)return;section.dataset.initialized='true';const rail=section.querySelector('[data-category-rail]');const previous=section.querySelector('[data-rail-prev]');const next=section.querySelector('[data-rail-next]');const controls=section.querySelector('.rail-controls');const media=matchMedia('(max-width: 749px)');
      const update=()=>{controls.hidden=!media.matches||rail.children.length<2;previous.disabled=rail.scrollLeft<5;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-5;};
      const move=direction=>{rail.scrollBy({left:direction*(rail.firstElementChild?.getBoundingClientRect().width+18||rail.clientWidth*.82),behavior:motionBehavior()});};
      previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));rail.addEventListener('scroll',update,{passive:true});media.addEventListener('change',update);update();section._railCleanup=()=>{rail.removeEventListener('scroll',update);media.removeEventListener('change',update);};
    });
  }
  initCategoryRails();
  const header=document.querySelector('.site-header');
  if(header&&'IntersectionObserver' in window){const marker=document.createElement('div');marker.className='header-sentinel';document.body.prepend(marker);const observer=new IntersectionObserver(entries=>header.classList.toggle('is-condensed',!entries[0].isIntersecting));observer.observe(marker);}
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}});},{threshold:.08});
    document.querySelectorAll('.collection-section,.story-content,.newsletter,.brand-statement,.editorial-copy').forEach(item=>observer.observe(item));
  }
  document.addEventListener('shopify:section:load',event=>{initProducts(event.target);initMeasurements(event.target);syncSaved();initRecommendations(event.target);initMobileFilters(event.target);initCategoryRails(event.target);});
  document.addEventListener('shopify:section:unload',event=>{event.target.querySelectorAll('[data-category-section]').forEach(section=>section._railCleanup?.());event.target.querySelectorAll('[data-product-section]').forEach(section=>{section._galleryObserver?.disconnect();section._buyObserver?.disconnect();});document.querySelectorAll('[data-filter-controls]').forEach(controls=>{if(event.target.contains(controls)||controls._owner===event.target)controls._cleanup?.();});event.target.querySelectorAll('dialog[open]').forEach(closeDialog);});
})();
