(()=>{
  const localMode=new URLSearchParams(location.search).get('local')==='1';
  let localData=null;
  if(localMode){
    try{localData=JSON.parse(localStorage.getItem('lunarx_zero_env_data')||'null')}catch(e){}
  }
  const baseData=(typeof SITE_DATA!=='undefined')?JSON.parse(JSON.stringify(SITE_DATA)):null;
  function mergeOptimizedFields(local,base){
    if(!local||!base) return local||base;
    const caseMap=new Map((base.cases?.items||[]).map(x=>[String(x.id),x]));
    (local.cases?.items||[]).forEach(x=>{const b=caseMap.get(String(x.id));if(b){x.desc=b.desc;x.detail=b.detail;x.seo=JSON.parse(JSON.stringify(b.seo||{}));x.keywords=JSON.parse(JSON.stringify(b.keywords||[]));}});
    const newsMap=new Map((base.news?.items||[]).map(x=>[String(x.id),x]));
    (local.news?.items||[]).forEach(x=>{const b=newsMap.get(String(x.id));if(b){x.seo=JSON.parse(JSON.stringify(b.seo||{}));if(['insight','industry'].includes(x.category))x.category='industry';else if(x.category==='project')x.category='project';else x.category='lunar';}});
    local.about=local.about||base.about; local.contact=local.contact||base.contact;
    local.about.seo=JSON.parse(JSON.stringify(base.about?.seo||{}));
    local.contact.seo=JSON.parse(JSON.stringify(base.contact?.seo||{}));
    return local;
  }
  const data=localMode?mergeOptimizedFields(localData,baseData):baseData;
  if(!data) return;function applyProductionSeo(){
    const seo=data.siteInfo?.seo||{};
    const brand=data.siteInfo?.brand||{};
    if(seo.title) document.title=seo.title;
    const desc=document.getElementById('meta-desc');
    const keywords=document.getElementById('meta-keywords');
    if(desc) desc.content=seo.description||'';
    if(keywords) keywords.content=seo.keywords||'';

    const ogTitle=document.querySelector('meta[property="og:title"]');
    const ogDesc=document.querySelector('meta[property="og:description"]');
    if(ogTitle) ogTitle.content=seo.title||brand.name||'LUNAR X';
    if(ogDesc) ogDesc.content=seo.description||'';

    // After binding a custom domain, set siteInfo.seo.siteUrl in data.js.
    const siteUrl=String(seo.siteUrl||'').replace(/\/+$/,'');
    if(siteUrl){
      let canonical=document.querySelector('link[rel="canonical"]');
      if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}
      canonical.href=siteUrl+'/';
      const ogUrl=document.querySelector('meta[property="og:url"]');
      if(ogUrl) ogUrl.content=siteUrl+'/';
    }
  }
  applyProductionSeo();

  const $=id=>document.getElementById(id);
  const icons={education:'◈',ai:'✦',content:'◉',platform:'▦',brand:'◌',production:'▶',film:'🎬',cube:'◈',palette:'◉',chart:'▦',tv:'◌',video:'▶'};
  const categoryName=(kind,id)=>{
    const set=kind==='case'?(data.cases?.categories||[]):(data.news?.categories||[]);
    return (set.find(x=>x.id===id)||{}).name||id||'';
  };
  const dateValue=v=>{const t=Date.parse(String(v||'').replace(/[./]/g,'-'));return Number.isFinite(t)?t:0};
  const newestFirst=arr=>[...(arr||[])].sort((a,b)=>dateValue(b.date)-dateValue(a.date)||Number(b.id||0)-Number(a.id||0));

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

  document.title=data.siteInfo?.seo?.title||'LUNAR X';
  $('meta-desc').content=data.siteInfo?.seo?.description||'';
  $('meta-keywords').content=data.siteInfo?.seo?.keywords||'';
  $('brand-logo').src=data.siteInfo?.brand?.logo||'images/logo.png';
  $('brand-name').textContent=data.siteInfo?.brand?.name||'LUNAR X';
  $('footer-brand').textContent=data.siteInfo?.brand?.name||'LUNAR X';
  $('footer-slogan').textContent=data.siteInfo?.brand?.slogan||'';
  $('footer-copy').innerHTML=`${esc(data.siteInfo?.footer?.copyright||'')}<br>${esc(data.siteInfo?.footer?.icp||'')}${data.siteInfo?.footer?.police?'<br>'+esc(data.siteInfo.footer.police):''}`;
  $('main-nav').innerHTML=(data.siteInfo?.nav||[]).map((n,i)=>`<a href="#${n.id==='home'?'banner':n.id}" class="${i===0?'active':''}">${esc(n.label)}</a>`).join('');

  function addBorderSweep(root=document){
    const selector='.service-card,.case-card,.news-card,.stat-card,.about-block,.about-video,.contact-item,.content-modal,.video-box';
    root.querySelectorAll(selector).forEach((el,i)=>{
      if(el.querySelector(':scope > .border-sweep')) return;
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      const gid='g'+Math.random().toString(36).slice(2);
      svg.setAttribute('class','border-sweep');
      svg.setAttribute('viewBox','0 0 100 100');
      svg.setAttribute('preserveAspectRatio','none');
      svg.innerHTML=`<defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(70,190,240,0)"/><stop offset="40%" stop-color="rgba(70,190,240,.12)"/><stop offset="55%" stop-color="rgba(255,255,255,.78)"/><stop offset="72%" stop-color="rgba(70,190,240,.18)"/><stop offset="100%" stop-color="rgba(70,190,240,0)"/></linearGradient></defs><rect class="base" x="1" y="1" width="98" height="98" rx="5" ry="5" vector-effect="non-scaling-stroke"/><rect x="1" y="1" width="98" height="98" rx="5" ry="5" pathLength="100" stroke="url(#${gid})" vector-effect="non-scaling-stroke"/>`;
      const moving=svg.querySelectorAll('rect')[1];
      moving.style.animationDelay=`-${(i%7)*1.2}s`;
      el.prepend(svg);
    });
  }

  function dragScroll(el,{fade=false,center=false}={}){
    if(!el) return;
    let down=false,startX=0,startLeft=0,moved=false;
    const updateFade=()=>{
      if(!fade) return;
      const rect=el.getBoundingClientRect(),centerX=rect.left+rect.width/2;
      el.querySelectorAll('.case-card').forEach(card=>{
        const r=card.getBoundingClientRect(),d=Math.abs((r.left+r.width/2)-centerX)/(rect.width/2);
        card.classList.toggle('edge-fade',d>.98);
        card.classList.toggle('edge-soft',d>.76&&d<=.98);
      });
    };
    el.addEventListener('pointerdown',e=>{down=true;moved=false;startX=e.clientX;startLeft=el.scrollLeft;el.setPointerCapture?.(e.pointerId);el.classList.add('dragging')});
    el.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5)moved=true;el.scrollLeft=startLeft-dx;updateFade()});
    const stop=()=>{down=false;el.classList.remove('dragging');updateFade();setTimeout(()=>{moved=false},0)};
    ['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,stop));
    el.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();el.scrollBy({left:e.deltaY,behavior:'smooth'})}},{passive:false});
    el.addEventListener('scroll',()=>requestAnimationFrame(updateFade),{passive:true});
    el._wasDragged=()=>moved;
    requestAnimationFrame(updateFade);
  }

  // Banner
  let slide=0,bannerTimer=null;
  function setMobileHeaderBanner(index){
    const items=data.banner||[];
    const bg=items[index]?.bg||'';
    const safe=String(bg).replace(/[\"\n\r]/g,'');
    document.documentElement.style.setProperty('--mobile-active-banner-bg', safe ? `url("${safe}")` : 'none');
  }
  function renderBanner(){
    const items=data.banner||[];
    $('banner-slides').innerHTML=items.map((b,i)=>`<article class="hero-slide ${i===0?'active':''}"><div class="hero-bg" style="background-image:url('${esc(b.bg)}')"></div><div class="hero-inner"><div class="hero-copy"><span class="eyebrow">LUNAR X / ${String(i+1).padStart(2,'0')}</span><h1>${b.title||''}</h1><p>${esc(b.desc||'')}</p><div class="hero-actions"><a class="btn primary" href="${esc(b.primaryLink||'#services')}">${esc(b.primary||'探索更多')}</a><a class="btn" href="${esc(b.secondaryLink||'#cases')}">${esc(b.secondary||'查看案例')}</a></div></div><div class="hero-art"><img src="${esc(b.img||'')}" alt=""></div></div></article>`).join('');
    $('banner-dots').innerHTML=items.map((_,i)=>`<button data-i="${i}" class="${i===0?'active':''}"></button>`).join('');
    setMobileHeaderBanner(0);
  }
  function showSlide(i){
    const slides=[...document.querySelectorAll('.hero-slide')],dots=[...$('banner-dots').children];
    if(!slides.length)return;
    slide=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle('active',n===slide));
    dots.forEach((d,n)=>d.classList.toggle('active',n===slide));
    setMobileHeaderBanner(slide);
  }
  renderBanner();
  bannerTimer=setInterval(()=>showSlide(slide+1),6000);
  $('banner-prev').onclick=()=>showSlide(slide-1);$('banner-next').onclick=()=>showSlide(slide+1);
  $('banner-dots').onclick=e=>{if(e.target.dataset.i!==undefined)showSlide(Number(e.target.dataset.i))};

  // Services fixed-size cards
  $('services-track').innerHTML=(data.services||[]).map(s=>`<article class="service-card"><div class="service-icon">${icons[s.icon]||'✦'}</div><h3 title="${esc(s.title)}">${esc(s.title)}</h3><p title="${esc(s.desc)}">${esc(s.desc)}</p><div class="service-features">${(s.features||[]).map(f=>`<span>${esc(f)}</span>`).join('')}</div></article>`).join('');
  addBorderSweep($('services-track'));dragScroll($('services-zone'));

  // Cases
  let activeCat='all';
  let caseQuery='';
  function caseCard(c,center=false){return `<article class="case-card" role="button" tabindex="0" data-id="${c.id}" ${center?'data-center-anchor="1"':''}><a class="seo-detail-link" href="case/${encodeURIComponent(c.id)}.html" aria-label="查看${esc(c.title)}独立详情页"></a><img src="${esc(c.thumb)}" alt="${esc(c.title)}" loading="lazy"><div class="case-info"><span class="case-tag">${esc(categoryName('case',c.category))}</span><h3 title="${esc(c.title)}">${esc(c.title)}</h3><div class="case-date">${esc(c.date||'')}</div></div><div class="case-hover-detail"><span>点击查看详情</span></div></article>`}
  function centeredRows(items){
    const sorted=newestFirst(items),rows=[[],[],[]];
    if(!sorted.length)return rows;
    if(sorted.length<=6){
      const left=[],right=[];sorted.slice(1).forEach((x,i)=>(i%2===0?left:right).push(x));
      rows[1]=[...left.reverse(),sorted[0],...right];return rows;
    }
    const b=[{l:[],r:[]},{l:[],r:[]},{l:[],r:[]}];
    rows[1]=[sorted[0]];
    const seq=[[1,'l'],[1,'r'],[0,'l'],[0,'r'],[2,'l'],[2,'r']];
    sorted.slice(1).forEach((x,i)=>b[seq[i%6][0]][seq[i%6][1]].push(x));
    [0,1,2].forEach(r=>rows[r]=[...b[r].l.reverse(),...(r===1?[sorted[0]]:[]),...b[r].r]);
    return rows;
  }
  function centerCaseStage(){
    const vp=$('case-viewport');
    const stage=$('cases-grid');
    if(!vp||!stage)return;

    const apply=()=>{
      const rows=[...stage.querySelectorAll('.case-row')];
      if(!rows.length)return;

      /* 先清掉旧宽度，得到每一行真实内容宽度 */
      stage.style.width='auto';
      stage.style.minWidth='0';
      rows.forEach(r=>{
        r.style.width='max-content';
        r.style.minWidth='0';
      });

      /* 三行都使用最宽一行作为共同舞台宽度，确保真正存在左右滚动区域 */
      const naturalWidths=rows.map(r=>r.scrollWidth);
      const contentWidth=Math.max(...naturalWidths,0);
      const stageWidth=Math.max(vp.clientWidth,contentWidth);

      stage.style.width=stageWidth+'px';
      stage.style.minWidth=stageWidth+'px';
      rows.forEach(r=>{
        r.style.width=stageWidth+'px';
        r.style.minWidth=stageWidth+'px';
      });

      /* 最新案例就是中间行正中间的锚点 */
      const middle=stage.querySelector('.case-row-middle,.row-1');
      const anchor=middle?.querySelector('[data-center-anchor="1"]') || middle?.querySelector('.case-card');
      if(!anchor){
        vp.scrollLeft=Math.max(0,(stageWidth-vp.clientWidth)/2);
        return;
      }

      /* offsetLeft 是相对于共同舞台的位置，直接让锚点中心对准视口中心 */
      const target=anchor.offsetLeft + anchor.offsetWidth/2 - vp.clientWidth/2;
      vp.scrollLeft=Math.max(0,Math.min(target,stageWidth-vp.clientWidth));
      vp.dispatchEvent(new Event('scroll'));
    };

    requestAnimationFrame(()=>{
      apply();
      setTimeout(apply,60);
      setTimeout(apply,180);
    });
  }
  function caseCategoryLabel(id){
    const cats=data.cases?.categories||[];
    return cats.find(c=>c.id===id)?.name||id||'';
  }
  function normalizeSearchText(v){
    return String(v??'').toLowerCase().replace(/\s+/g,' ').trim();
  }
  function caseMatchesSearch(c,q){
    if(!q)return true;
    const haystack=[
      c.title,
      c.desc,
      c.detail,
      c.category,
      caseCategoryLabel(c.category),
      c.date,
      ...(Array.isArray(c.tags)?c.tags:[]),
      ...(Array.isArray(c.keywords)?c.keywords:[])
    ].map(normalizeSearchText).join(' ');
    return q.split(' ').filter(Boolean).every(word=>haystack.includes(word));
  }

  function renderCases(){
    const cats=data.cases?.categories||[];
    $('cases-filter').innerHTML=cats.map(c=>`<button data-cat="${c.id}" class="${c.id===activeCat?'active':''}">${esc(c.name)}</button>`).join('');

    const q=normalizeSearchText(caseQuery);
    const categoryFiltered=(data.cases?.items||[]).filter(c=>activeCat==='all'||c.category===activeCat);
    const filtered=categoryFiltered.filter(c=>caseMatchesSearch(c,q));

    const status=$('case-search-status');
    if(status){
      if(q){
        status.innerHTML=`找到 <strong>${filtered.length}</strong> 个相关案例${activeCat!=='all'?` · 当前分类：${esc(caseCategoryLabel(activeCat))}`:''}`;
        status.classList.add('show');
      }else{
        status.textContent='';
        status.classList.remove('show');
      }
    }

    if(!filtered.length){
      $('cases-grid').innerHTML=`<div class="case-empty">
        <span>NO MATCH</span>
        <h3>没有找到匹配的案例</h3>
        <p>可以换一个名称、关键词，或切换到“全部案例”。</p>
      </div>`;
      const vp=$('case-viewport');
      if(vp)vp.scrollLeft=0;
      return;
    }

    const rows=centeredRows(filtered);
    const newest=newestFirst(filtered)[0];
    $('cases-grid').innerHTML=rows.map((row,i)=>`<div class="case-row ${i===0?'case-row-top':i===1?'case-row-middle':'case-row-bottom'} row-${i}">${row.map(c=>caseCard(c,Boolean(newest&&c.id===newest.id))).join('')}</div>`).join('');
    addBorderSweep($('cases-grid'));
    centerCaseStage();
  }
  renderCases();dragScroll($('case-viewport'),{fade:true});
  $('cases-filter').onclick=e=>{if(e.target.dataset.cat){activeCat=e.target.dataset.cat;renderCases()}};

  const caseSearchInput=$('case-search-input');
  const caseSearchClear=$('case-search-clear');
  if(caseSearchInput){
    caseSearchInput.addEventListener('input',e=>{
      caseQuery=e.target.value||'';
      if(caseSearchClear)caseSearchClear.classList.toggle('show',Boolean(caseQuery));
      renderCases();
    });
    caseSearchInput.addEventListener('keydown',e=>{
      if(e.key==='Escape' && caseQuery){
        caseQuery='';
        caseSearchInput.value='';
        if(caseSearchClear)caseSearchClear.classList.remove('show');
        renderCases();
      }
    });
  }
  if(caseSearchClear){
    caseSearchClear.addEventListener('click',()=>{
      caseQuery='';
      if(caseSearchInput){
        caseSearchInput.value='';
        caseSearchInput.focus();
      }
      caseSearchClear.classList.remove('show');
      renderCases();
    });
  }



  // Cases: reliable pointer interaction.
  // A short press/click opens detail; an actual horizontal drag does not.
  (function(){
    const grid=$('cases-grid');
    const viewport=$('case-viewport');
    if(!grid||!viewport)return;

    let activeCard=null;
    let startX=0,startY=0;
    let dragged=false;
    let pointerId=null;

    grid.addEventListener('pointerdown',e=>{
      const card=e.target.closest('.case-card');
      if(!card)return;
      activeCard=card;
      startX=e.clientX;
      startY=e.clientY;
      dragged=false;
      pointerId=e.pointerId;
      card.classList.add('pressed');
    },true);

    window.addEventListener('pointermove',e=>{
      if(!activeCard || e.pointerId!==pointerId)return;
      const dx=e.clientX-startX;
      const dy=e.clientY-startY;
      if(Math.hypot(dx,dy)>8) dragged=true;
    },true);

    window.addEventListener('pointerup',e=>{
      if(!activeCard || e.pointerId!==pointerId)return;
      const card=activeCard;
      activeCard=null;
      pointerId=null;
      card.classList.remove('pressed');

      if(!dragged){
        e.preventDefault();
        e.stopPropagation();
        openCaseDetail(card.dataset.id);
      }
      dragged=false;
    },true);

    window.addEventListener('pointercancel',()=>{
      if(activeCard) activeCard.classList.remove('pressed');
      activeCard=null; pointerId=null; dragged=false;
    },true);

    grid.addEventListener('keydown',e=>{
      const card=e.target.closest('.case-card');
      if(card&&(e.key==='Enter'||e.key===' ')){
        e.preventDefault();
        openCaseDetail(card.dataset.id);
      }
    });
  })();

  // Stats fixed-size cards
  $('stats-grid').innerHTML=(data.stats||[]).map((s,i)=>`<article class="stat-card"><div class="stat-index">0${i+1}</div><div class="stat-value">${esc(s.value)}</div><h3 title="${esc(s.label)}">${esc(s.label)}</h3><p title="${esc(s.note||'')}">${esc(s.note||'')}</p></article>`).join('');
  addBorderSweep($('stats-grid'));

  // News: 5/page fixed-size
  let newsPage=1;
  const getNewsPageSize=()=>{
    const w=window.innerWidth||document.documentElement.clientWidth||1280;
    if(w<=720)return 3;      // mobile: latest 3 list rows
    if(w<=1000)return 3;     // compact desktop/tablet: one row of 3
    if(w<=1280)return 4;     // medium desktop: one row of 4
    return 5;                // wide desktop: one row of 5
  };
  let lastNewsPageSize=getNewsPageSize();
  function renderNews(){
    const mobileNews=window.matchMedia('(max-width:720px)').matches;
    const PAGE=getNewsPageSize();
    if(mobileNews) newsPage=1; // V5.13 mobile: only the latest three news items, no paging
    const items=newestFirst(data.news?.items||[]),pages=Math.max(1,Math.ceil(items.length/PAGE));newsPage=Math.min(Math.max(1,newsPage),pages);
    const pageItems=items.slice((newsPage-1)*PAGE,newsPage*PAGE);
    $('news-grid').innerHTML=pageItems.map(n=>`<article class="news-card" role="button" tabindex="0" data-id="${n.id}"><a class="seo-detail-link" href="news/${encodeURIComponent(n.id)}.html" aria-label="查看${esc(n.title)}独立详情页"></a><img src="${esc(n.thumb)}" alt="${esc(n.title)}" loading="lazy"><div class="news-info"><span class="news-tag">${esc(categoryName('news',n.category))}</span><h3 title="${esc(n.title)}">${esc(n.title)}</h3><div class="news-date">${esc(n.date||'')}</div><p title="${esc(n.desc||'')}">${esc(n.desc||'')}</p></div></article>`).join('');
    const visible=[];
    if(pages<=7){for(let p=1;p<=pages;p++)visible.push(p)}
    else{visible.push(1);const s=Math.max(2,newsPage-1),e=Math.min(pages-1,newsPage+1);if(s>2)visible.push('…');for(let p=s;p<=e;p++)visible.push(p);if(e<pages-1)visible.push('…');visible.push(pages)}
    const nums=visible.map(p=>p==='…'?'<span class="page-ellipsis" aria-hidden="true">…</span>':`<button data-p="${p}" class="${p===newsPage?'active':''}">${p}</button>`).join('');
    $('news-pagination').innerHTML=`<button data-p="${newsPage-1}" ${newsPage===1?'disabled':''}>‹</button>${nums}<button data-p="${newsPage+1}" ${newsPage===pages?'disabled':''}>›</button>`;
    addBorderSweep($('news-grid'));
  }
  renderNews();
  $('news-pagination').onclick=e=>{const b=e.target.closest('button[data-p]');if(!b||b.disabled)return;newsPage=Number(b.dataset.p);renderNews()};
  const newsMedia=window.matchMedia('(max-width:720px)');
  const handleNewsPageSizeChange=()=>{
    const nextSize=getNewsPageSize();
    if(nextSize===lastNewsPageSize)return;
    const firstVisibleIndex=(newsPage-1)*lastNewsPageSize;
    lastNewsPageSize=nextSize;
    newsPage=Math.floor(firstVisibleIndex/nextSize)+1;
    renderNews();
  };
  if(newsMedia.addEventListener)newsMedia.addEventListener('change',handleNewsPageSizeChange);
  else if(newsMedia.addListener)newsMedia.addListener(handleNewsPageSizeChange);
  window.addEventListener('resize',handleNewsPageSizeChange,{passive:true});

  // About fixed-size blocks
  $('about-title').textContent=data.about?.heroTitle||'';
  $('about-sub').textContent=data.about?.heroSub||'';
  $('about-text').innerHTML=(data.about?.sections||[]).slice(0,3).map(s=>`<article class="about-block"><h3 title="${esc(s.title)}">${esc(s.title)}</h3><div class="about-copy">${s.content||''}</div></article>`).join('');
  $('about-poster').src=data.about?.video?.poster||'images/dizi.jpg';
  addBorderSweep($('about-text'));addBorderSweep(document.querySelector('#about'));

  // Contact fixed-size cards
  const c=data.contact||{};
  const contacts=[['PHONE',c.phone],['MOBILE',c.mobile],['EMAIL',c.email],['ADDRESS',c.address]].filter(x=>x[1]);
  $('contact-grid').innerHTML=contacts.map(x=>`<article class="contact-item" data-kind="${x[0]}"><small>${x[0]}</small><strong title="${esc(x[1])}">${esc(x[1])}</strong></article>`).join('');
  addBorderSweep($('contact-grid'));

  // Modal
  function openCaseDetail(id){
    const item=(data.cases?.items||[]).find(x=>Number(x.id)===Number(id));
    if(!item)return;
    const link=item.link||item.url||'#';
    $('modal-body').innerHTML=`
      <article class="detail-view detail-case">
        <div class="detail-head">
          <span class="detail-kicker">${esc(categoryName('case',item.category))}</span>
          <h2>${esc(item.title||'')}</h2>
        </div>
        <div class="modal-hero-frame"><img class="modal-hero" src="${esc(item.thumb||'')}" alt="${esc(item.title||'')}"></div>
        <div class="detail-body">
          <h3>案例介绍</h3>
          <p>${esc(item.detail||item.desc||'')}</p>
          <a class="detail-action ${link==='#'?'disabled':''}" href="${esc(link)}" ${link==='#'?'aria-disabled="true"':'target="_blank" rel="noopener noreferrer"'}>查看详情</a>
        </div>
      </article>`;
    $('modal-overlay').classList.add('active');
    document.body.style.overflow='hidden';
    addBorderSweep($('modal-overlay'));
  }

  function openNewsDetail(id){
    const item=(data.news?.items||[]).find(x=>Number(x.id)===Number(id));
    if(!item)return;
    $('modal-body').innerHTML=`
      <article class="detail-view detail-news">
        <div class="detail-head">
          <span class="detail-kicker">${esc(categoryName('news',item.category))}</span>
          <h2>${esc(item.title||'')}</h2>
          <div class="news-detail-meta">
            <span>${esc(item.date||'')}</span>
            <span>发表人：${esc(item.author||'LUNAR X 月球数智')}</span>
          </div>
        </div>
        <div class="modal-hero-frame"><img class="modal-hero" src="${esc(item.thumb||'')}" alt="${esc(item.title||'')}"></div>
        <div class="detail-body">
          <p>${esc(item.content||item.detail||item.desc||'')}</p>
          ${item.link && item.link!=='#' ? `<a class="detail-action" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">查看原文 ↗</a>` : ''}
        </div>
      </article>`;
    $('modal-overlay').classList.add('active');
    document.body.style.overflow='hidden';
    addBorderSweep($('modal-overlay'));
  }

  function openContent(type,id){
    if(type==='case') openCaseDetail(id);
    else openNewsDetail(id);
  }
  // Reliable case open: dragScroll marks real horizontal movement; ordinary click always opens.
  
  
  $('news-grid').onclick=e=>{const card=e.target.closest('.news-card');if(card)openNewsDetail(card.dataset.id)};
  $('news-grid').addEventListener('keydown',e=>{
    const card=e.target.closest('.news-card');
    if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openNewsDetail(card.dataset.id)}
  });
  $('modal-close').onclick=()=>{$('modal-overlay').classList.remove('active');document.body.style.overflow=''};
  $('modal-overlay').onclick=e=>{if(e.target===$('modal-overlay'))$('modal-close').click()};

  // Video
  $('about-video').onclick=()=>{
    const src=data.about?.video?.src||'';
    $('video-box').innerHTML=src?(/youtube|vimeo|bilibili/i.test(src)?`<iframe src="${esc(src)}" allowfullscreen></iframe>`:`<video src="${esc(src)}" controls autoplay></video>`):`<div style="height:100%;display:grid;place-items:center;color:white;text-align:center;padding:30px">品牌影片地址尚未配置</div>`;
    $('video-modal').classList.add('active');document.body.style.overflow='hidden';addBorderSweep($('video-modal'));
  };
  $('video-close').onclick=()=>{$('video-modal').classList.remove('active');$('video-box').innerHTML='';document.body.style.overflow=''};
  $('video-modal').onclick=e=>{if(e.target===$('video-modal'))$('video-close').click()};


  // Certificates in footer
  function renderCertificates(){
    const items=data.certificates||[];
    $('footer-certificates').innerHTML=items.map(c=>`<button class="certificate-btn glass-panel" data-cert="${c.id}">${esc(c.title)}</button>`).join('');
    addBorderSweep($('footer-certificates'));
  }
  renderCertificates();

  $('footer-certificates').addEventListener('click',e=>{
    const btn=e.target.closest('[data-cert]');
    if(!btn)return;
    const item=(data.certificates||[]).find(x=>Number(x.id)===Number(btn.dataset.cert));
    if(!item)return;
    $('certificate-title').textContent=item.title||'';
    $('certificate-image').src=item.image||'';
    $('certificate-image').alt=item.title||'';
    $('certificate-desc').textContent=item.desc||'';
    $('certificate-modal').classList.add('active');
    document.body.style.overflow='hidden';
    addBorderSweep($('certificate-modal'));
  });
  $('certificate-close').onclick=()=>{$('certificate-modal').classList.remove('active');document.body.style.overflow=''};
  $('certificate-modal').onclick=e=>{if(e.target===$('certificate-modal'))$('certificate-close').click()};

  // Header / theme / mobile
  $('theme-toggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'};
  $('nav-toggle').onclick=()=>$('main-nav').classList.toggle('active');
  document.querySelectorAll('#main-nav a').forEach(a=>a.onclick=()=>$('main-nav').classList.remove('active'));
  const back=$('back-to-top');
  window.addEventListener('scroll',()=>{
    $('header').classList.toggle('scrolled',scrollY>30);back.classList.toggle('visible',scrollY>500);
    let cur='banner';['banner','services','cases','stats','news','about','contact'].forEach(id=>{const el=$(id);if(el&&scrollY>=el.offsetTop-120)cur=id});
    document.querySelectorAll('#main-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
  },{passive:true});
  back.onclick=()=>scrollTo({top:0,behavior:'smooth'});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('modal-close').click();$('video-close').click()}});

  // Interactive background: line network diffuses away from cursor, no cursor glow
  (function(){
    const canvas=$('tech-network-canvas'),ctx=canvas?.getContext('2d');if(!ctx)return;
    let w=0,h=0,dpr=1,points=[],mouse={x:-9999,y:-9999,on:false};
    function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);build()}
    function build(){points=[];const gap=Math.max(88,Math.min(120,w/13));for(let y=-1;y<Math.ceil(h/gap)+2;y++)for(let x=-1;x<Math.ceil(w/gap)+2;x++){const px=x*gap+(y%2?gap*.33:0),py=y*gap;points.push({bx:px,by:py,x:px,y:py,vx:0,vy:0,s:Math.random()*6.28})}}
    addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true},{passive:true});addEventListener('pointerleave',()=>mouse.on=false,{passive:true});addEventListener('resize',resize,{passive:true});
    function frame(t){ctx.clearRect(0,0,w,h);const light=document.documentElement.dataset.theme==='light',rgb=light?'44,132,180':'76,190,235';
      points.forEach(p=>{let tx=p.bx+Math.sin(t*.00025+p.s)*2,ty=p.by+Math.cos(t*.00022+p.s)*2;if(mouse.on){const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy)||1,R=240;if(d<R){const f=(1-d/R);tx+=(dx/d)*f*52;ty+=(dy/d)*f*52}}p.vx+=(tx-p.x)*.035;p.vy+=(ty-p.y)*.035;p.vx*=.86;p.vy*=.86;p.x+=p.vx;p.y+=p.vy});
      for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j],dx=a.x-b.x,dy=a.y-b.y;if(Math.abs(dx)>145||Math.abs(dy)>145)continue;const d=Math.hypot(dx,dy);if(d<145){let alpha=(1-d/145)*.12;if(mouse.on){const md=Math.hypot((a.x+b.x)/2-mouse.x,(a.y+b.y)/2-mouse.y);if(md<260)alpha+=(1-md/260)*.18}ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
      requestAnimationFrame(frame)}
    resize();requestAnimationFrame(frame);
  })();

  let caseResizeTimer=null;
  window.addEventListener('resize',()=>{
    clearTimeout(caseResizeTimer);
    caseResizeTimer=setTimeout(()=>centerCaseStage(),140);
  });

  addBorderSweep();
})();

document.addEventListener('click',function(e){
  const trigger=e.target.closest('#about-video,.about-video,.video-card,.about-video-card,[data-about-video]');
  if(!trigger)return;
  const url=data?.about?.video?.src||'';
  if(isExternalVideoUrl(url)){
    e.preventDefault();
    e.stopImmediatePropagation();
    window.open(url,'_blank','noopener,noreferrer');
  }
},true);
