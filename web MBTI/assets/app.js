/* ========================================================
   Know Yourself — shared engine
   theme + language (SK/EN) live-switch, quiz, evaluators, PDF,
   local profiles + results history, combined profile.
   ======================================================== */
(function(){
'use strict';

var LANG  = localStorage.getItem('ky_lang')  || 'en';
var THEME = localStorage.getItem('ky_theme') || 'light';
document.documentElement.setAttribute('data-theme', THEME);

var UI = {
  brand:        {en:'✦ Know Yourself',        sk:'✦ Spoznaj sa'},
  navHome:      {en:'Home',                        sk:'Domov'},
  navMbti:      {en:'Personality',                 sk:'Osobnosť'},
  navLove:      {en:'Love Languages',              sk:'Jazyky lásky'},
  navAttach:    {en:'Attachment',                  sk:'Vzťahová väzba'},
  navProfile:   {en:'My Profile',                  sk:'Môj profil'},
  readFull:     {en:'Read the full explanation',   sk:'Prečítať celé vysvetlenie'},
  copy:         {en:'⧉ Copy result',          sk:'⧉ Kopírovať výsledok'},
  copied:       {en:'✓ Copied',               sk:'✓ Skopírované'},
  borderline:   {en:'You sit close to the middle on {x} — you lean {y}, but only slightly.',
                 sk:'Pri {x} si blízko stredu — mierne sa prikláňaš k {y}, ale len jemne.'},
  loveTie:      {en:'Your top two are nearly tied — both {a} and {b} matter a lot to you.',
                 sk:'Tvoje prvé dve sú takmer vyrovnané — veľmi ti záležia obe: {a} aj {b}.'},
  savedTo:      {en:'Saved to profile: {n}',        sk:'Uložené do profilu: {n}'},
  profileIntro: {en:'Your saved results live on this device. Switch profiles to track results for different people.',
                 sk:'Tvoje uložené výsledky sú v tomto zariadení. Prepínaním profilov sleduješ výsledky rôznych ľudí.'},
  combinedH:    {en:'Your combined profile',         sk:'Tvoj kombinovaný profil'},
  latestH:      {en:'Latest results',                sk:'Najnovšie výsledky'},
  historyH:     {en:'History',                       sk:'História'},
  noneYet:      {en:'No results yet.',               sk:'Zatiaľ žiadne výsledky.'},
  takeIt:       {en:'Take the test →',          sk:'Spustiť test →'},
  newProfile:   {en:'+ New profile',                 sk:'+ Nový profil'},
  renameP:      {en:'Rename',                        sk:'Premenovať'},
  deleteP:      {en:'Delete',                        sk:'Zmazať'},
  clearHist:    {en:'Clear history',                 sk:'Vymazať históriu'},
  dlCombined:   {en:'⬇ Download combined PDF',  sk:'⬇ Stiahnuť kombinovaný PDF'},
  promptName:   {en:'Profile name:',                 sk:'Názov profilu:'},
  confDelete:   {en:'Delete this profile and all its results?', sk:'Zmazať tento profil a všetky jeho výsledky?'},
  confClear:    {en:'Clear all saved results for this profile?', sk:'Vymazať všetky uložené výsledky tohto profilu?'},
  creditsH:     {en:'Where this comes from',         sk:'Odkiaľ to pochádza'},
  credits:      {en:'Personality types draw on the work of Jung and Myers & Briggs; the five love languages on Gary Chapman; attachment styles on Bowlby and Ainsworth. These tests are simplified, for self-reflection — not clinical tools.',
                 sk:'Typy osobnosti vychádzajú z práce Junga a Myers & Briggsovej; päť jazykov lásky z Garyho Chapmana; typy vzťahovej väzby z Bowlbyho a Ainsworthovej. Tieto testy sú zjednodušené, na sebareflexiu — nie sú klinické nástroje.'},
  combinedKicker:{en:'Combined profile',             sk:'Kombinovaný profil'},
  qOf:          {en:'Question {a} of {b}',          sk:'Otázka {a} z {b}'},
  back:         {en:'← Back',                  sk:'← Späť'},
  next:         {en:'Next →',                  sk:'Ďalej →'},
  seeResults:   {en:'See results ✦',           sk:'Zobraziť výsledok ✦'},
  retake:       {en:'↺ Retake test',           sk:'↺ Spustiť znova'},
  download:     {en:'⬇ Download PDF report',   sk:'⬇ Stiahnuť PDF report'},
  likert:       {en:['Strongly agree','Agree','Neutral','Disagree','Strongly disagree'],
                 sk:['Úplne súhlasím','Súhlasím','Neutrálne','Nesúhlasím','Úplne nesúhlasím'],
                 v:[5,4,3,2,1]},
  reportKicker: {en:'Know Yourself · Personal Report', sk:'Spoznaj sa · Osobný report'},
  generated:    {en:'Generated',                   sk:'Vytvorené'},
  prDisclaimer: {en:'For self-reflection and entertainment only — not a psychological diagnosis.',
                 sk:'Len na sebareflexiu a zábavu — nie je to psychologická diagnóza.'},
  themeLight:   {en:'☀️', sk:'☀️'},
  themeDark:    {en:'🌙', sk:'🌙'},
  footer:       {en:'✦ Know Yourself — explore your personality, love language & attachment style.',
                 sk:'✦ Spoznaj sa — objav svoj typ osobnosti, jazyk lásky a vzťahovú väzbu.'}
};
function tt(node){ if(node==null) return ''; var v=node[LANG]; return v!==undefined? v : node.en; }
function fmt(s,o){ return s.replace(/\{(\w+)\}/g,function(_,k){return o[k];}); }

window.KY = { lang:function(){return LANG;}, tt:tt, UI:UI };

var _render = null;

function clearChrome(){
  document.querySelectorAll('header.nav, footer').forEach(function(e){ e.remove(); });
}
function addFooter(){
  var f=document.createElement('footer');
  f.textContent=tt(UI.footer);
  document.body.appendChild(f);
}
function buildHeader(active){
  var pages=[
    {id:'home',href:'index.html',key:'navHome'},
    {id:'mbti',href:'mbti.html',key:'navMbti'},
    {id:'love',href:'love.html',key:'navLove'},
    {id:'attach',href:'attachment.html',key:'navAttach'},
    {id:'profile',href:'profile.html',key:'navProfile'}
  ];
  var tabs=pages.map(function(p){
    return '<a href="'+p.href+'"'+(p.id===active?' class="active"':'')+'>'+tt(UI[p.key])+'</a>';
  }).join('');
  var h=document.createElement('header');
  h.className='nav';
  h.innerHTML='<div class="nav-inner">'+
      '<a class="logo" href="index.html">'+tt(UI.brand)+'</a>'+
      '<nav class="tabs">'+tabs+'</nav>'+
      '<button class="toolbtn" id="langBtn" title="Language">'+(LANG==='en'?'SK':'EN')+'</button>'+
      '<button class="toolbtn" id="themeBtn" title="Theme">'+(THEME==='dark'?tt(UI.themeLight):tt(UI.themeDark))+'</button>'+
    '</div>';
  document.body.insertBefore(h, document.body.firstChild);

  document.getElementById('themeBtn').onclick=function(){
    THEME=(THEME==='dark'?'light':'dark');
    localStorage.setItem('ky_theme',THEME);
    document.documentElement.setAttribute('data-theme',THEME);
    this.textContent=(THEME==='dark'?tt(UI.themeLight):tt(UI.themeDark));
  };
  document.getElementById('langBtn').onclick=function(){
    LANG=(LANG==='en'?'sk':'en');
    localStorage.setItem('ky_lang',LANG);
    if(_render) _render();
  };
}

var palette=['#7c5cff','#ff5c9d','#33c9ff','#46d39a','#ffb347'];
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function sb(){ return REDUCED?'auto':'smooth'; }
function shareText(rep){
  var lines=[(rep.emoji||'')+' '+rep.title, rep.subtitle, '', rep.desc];
  if(rep.note) lines.push('', rep.note);
  lines.push('', rep.barsTitle);
  rep.bars.forEach(function(b){ lines.push('• '+b.label+'  ('+b.right+')'); });
  lines.push('', '— Know Yourself');
  return lines.join('\n');
}

function renderResultHTML(rep){
  var bars=rep.bars.map(function(b){
    var ml=b.offset?'margin-left:'+b.offset+'%;':'';
    return '<div class="bar"><div class="lab"><span>'+b.label+'</span><span>'+b.right+'</span></div>'+
      '<div class="track"><div class="fill" data-w="'+b.pct+'" style="width:0;'+ml+'background:'+b.color+'"></div></div></div>';
  }).join('');
  var note=rep.note?'<p class="rnote" style="font-size:14px;color:var(--muted);background:var(--soft);padding:12px 14px;border-radius:12px;margin:6px 0 0">'+rep.note+'</p>':'';
  return '<div class="rbadge">'+rep.emoji+'</div>'+
    '<div class="rtitle">'+rep.title+'</div>'+
    '<div class="rsub">'+rep.subtitle+'</div>'+
    '<p>'+rep.desc+'</p>'+note+
    '<h4 style="margin:18px 0 8px">'+rep.barsTitle+'</h4>'+bars+
    '<div class="actionbar">'+
      '<button class="btn retry">'+tt(UI.retake)+'</button>'+
      '<button class="btn ghost pdf">'+tt(UI.download)+'</button>'+
      '<button class="btn ghost copy">'+tt(UI.copy)+'</button>'+
    '</div>'+
    '<p class="savednote" style="font-size:12.5px;color:var(--muted);margin:12px 0 0"></p>';
}
function buildPrintReport(rep, topicLabel){
  var host=document.getElementById('print-report');
  if(!host){ host=document.createElement('div'); host.id='print-report'; document.body.appendChild(host); }
  var d=new Date();
  var dateStr=d.toLocaleDateString(LANG==='sk'?'sk-SK':'en-GB',{year:'numeric',month:'long',day:'numeric'});
  var bars=rep.bars.map(function(b){
    var ml=b.offset?'margin-left:'+b.offset+'%;':'';
    return '<div class="pr-bar"><div class="pr-lab"><span>'+b.label+'</span><span>'+b.right+'</span></div>'+
      '<div class="pr-track"><div class="pr-fill" style="width:'+b.pct+'%;'+ml+'background:'+b.color+'"></div></div></div>';
  }).join('');
  host.innerHTML='<div class="pr-band">'+
      '<div class="pr-kicker">'+tt(UI.reportKicker)+' · '+topicLabel+'</div>'+
      '<div class="pr-emoji">'+rep.emoji+'</div>'+
      '<h1>'+rep.title+'</h1><p class="pr-sub">'+rep.subtitle+'</p></div>'+
    '<p class="pr-desc">'+rep.desc+'</p>'+
    '<h2>'+rep.barsTitle+'</h2>'+bars+
    '<div class="pr-foot">'+tt(UI.generated)+': '+dateStr+' &nbsp;·&nbsp; '+tt(UI.prDisclaimer)+'</div>';
  window.print();
}

function evalMBTI(scores,cfg){
  var poles=tt(cfg.poles), types=tt(cfg.types);
  var dims={EI:{E:{s:0,c:0},I:{s:0,c:0}},SN:{S:{s:0,c:0},N:{s:0,c:0}},
            TF:{T:{s:0,c:0},F:{s:0,c:0}},JP:{J:{s:0,c:0},P:{s:0,c:0}}};
  scores.forEach(function(s){ var w=s.v-3, d=dims[s.q.dim][s.q.key]; d.s+=w; d.c++; });
  var order=[['EI','E','I'],['SN','S','N'],['TF','T','F'],['JP','J','P']];
  var code='',bars=[],borders=[];
  order.forEach(function(o,n){
    var A=dims[o[0]][o[1]], B=dims[o[0]][o[2]];
    var stA=(((A.c?A.s/A.c:0))+2)/4*100, stB=(((B.c?B.s/B.c:0))+2)/4*100;
    var tot=stA+stB||1, pa=Math.round(stA/tot*100);
    var winner=(stA>=stB)?o[1]:o[2]; code+=winner;
    var winPct=(winner===o[1])?pa:100-pa;
    bars.push({label:poles[o[1]]+' · '+pa+'%', right:(100-pa)+'% · '+poles[o[2]],
      pct:winPct, offset:(winner===o[1]?0:pa), color:palette[n]});
    if(Math.abs(pa-50)<=6) borders.push({pair:poles[o[1]]+'/'+poles[o[2]], lean:poles[winner]});
  });
  var ty=types[code];
  var note=borders.length? fmt(tt(UI.borderline),{x:borders[0].pair,y:borders[0].lean}) : '';
  return {emoji:'🧠', title:code+' — '+ty.name, subtitle:tt(cfg.subtitle), desc:ty.desc,
          barsTitle:tt(cfg.barsTitle), bars:bars, code:code, key:code, note:note};
}
function evalLove(scores,cfg){
  var cats=tt(cfg.cats), cat={WA:0,QT:0,RG:0,AS:0,PT:0};
  scores.forEach(function(s){ cat[s.q.key]+=s.v; });
  var ranked=Object.keys(cat).map(function(k){return [k,cat[k]];}).sort(function(a,b){return b[1]-a[1];});
  var max=ranked[0][1]||1, top=cats[ranked[0][0]], colorMap={WA:0,QT:1,RG:4,AS:3,PT:2};
  var bars=ranked.map(function(r){
    var c=cats[r[0]], pct=Math.round(r[1]/max*100);
    return {label:c.emoji+' '+c.name, right:pct+'%', pct:pct, color:palette[colorMap[r[0]]]};
  });
  var note='';
  if(ranked.length>1 && ranked[1][1] && (ranked[0][1]-ranked[1][1])/(ranked[0][1]||1) <= 0.10)
    note=fmt(tt(UI.loveTie),{a:cats[ranked[0][0]].name, b:cats[ranked[1][0]].name});
  return {emoji:top.emoji, title:top.name, subtitle:tt(cfg.subtitle), desc:top.desc,
          barsTitle:tt(cfg.barsTitle), bars:bars, key:ranked[0][0], note:note};
}
function evalAttach(scores,cfg){
  var types=tt(cfg.types), anx=0,avo=0;
  scores.forEach(function(s){ if(s.q.key==='ANX') anx+=s.v; else avo+=s.v; });
  var anxPct=Math.round((anx-6)/24*100), avoPct=Math.round((avo-6)/24*100);
  var hiAnx=anx>18, hiAvo=avo>18;
  var key=(!hiAnx&&!hiAvo)?'Secure':(hiAnx&&!hiAvo)?'Anxious':(!hiAnx&&hiAvo)?'Avoidant':'Fearful';
  var ty=types[key];
  return {emoji:ty.emoji, title:ty.name, subtitle:tt(cfg.subtitle), desc:ty.desc,
          barsTitle:tt(cfg.barsTitle), key:key,
          bars:[{label:tt(cfg.anxLabel), right:anxPct+'%', pct:anxPct, color:'#ff5c9d'},
                {label:tt(cfg.avoLabel), right:avoPct+'%', pct:avoPct, color:'#33c9ff'}]};
}
var EVALS={mbti:evalMBTI, love:evalLove, attach:evalAttach};

function initTopic(cfg){
  var root=document.getElementById('app');
  var state={ idx:0, answers:[], active:false, finished:false, saved:false };
  function L(n){ return tt(n); }
  function chipsHTML(){
    return cfg.chips.map(function(c){ return '<div class="chip"><b>'+L(c.title)+'</b>'+L(c.body)+'</div>'; }).join('');
  }
  function renderPage(){
    clearChrome();
    buildHeader(cfg.nav);
    root.innerHTML=
      '<div class="topic-head">'+
        '<div class="badge '+cfg.badgeClass+'">'+cfg.emoji+'</div>'+
        '<div><div class="sub">'+L(cfg.kicker)+'</div><h2>'+L(cfg.title)+'</h2></div>'+
      '</div>'+
      '<div class="card">'+
        '<p class="lead">'+L(cfg.lead)+'</p>'+
        '<div class="grid">'+chipsHTML()+'</div>'+
        '<details class="more"><summary><span class="arrow">▸</span> '+tt(UI.readFull)+'</summary>'+
          '<div class="detail-body">'+L(cfg.explanation)+'</div></details>'+
        '<div class="actionbar"><button class="btn" id="openTest">'+L(cfg.testBtn)+'</button></div>'+
        '<div class="quiz" id="quiz">'+
          '<div class="qprogress"><i></i></div><div class="qhost"></div>'+
          '<div class="qnav"><button class="back">'+tt(UI.back)+'</button><button class="next" disabled>'+tt(UI.next)+'</button></div>'+
          '<div class="result"></div></div>'+
      '</div>';
    addFooter();
    wire();
  }
  function wire(){
    var quiz=root.querySelector('#quiz');
    var host=quiz.querySelector('.qhost');
    var fill=quiz.querySelector('.qprogress > i');
    var backBtn=quiz.querySelector('.back');
    var nextBtn=quiz.querySelector('.next');
    var resultBox=quiz.querySelector('.result');
    var qnav=quiz.querySelector('.qnav');

    root.querySelector('#openTest').onclick=function(){
      if(quiz.classList.contains('active')) return;
      state.active=true; quiz.classList.add('active');
      quiz.scrollIntoView({behavior:sb(),block:'start'});
    };
    if(state._key) document.removeEventListener('keydown',state._key);
    state._key=function(e){
      if(!state.active||state.finished) return;
      if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      var n=parseInt(e.key,10);
      if(n>=1&&n<=5){ var opt=host.querySelector('.opt[data-i="'+(n-1)+'"]'); if(opt){opt.click();e.preventDefault();} }
      else if(e.key==='Enter'||e.key==='ArrowRight'){ if(!nextBtn.disabled){nextBtn.click();e.preventDefault();} }
      else if(e.key==='ArrowLeft'){ if(!backBtn.disabled){backBtn.click();e.preventDefault();} }
    };
    document.addEventListener('keydown',state._key);

    function renderQ(){
      var q=cfg.questions[state.idx], labels=UI.likert[LANG];
      host.innerHTML='<div class="question">'+
          '<div class="qnum">'+fmt(tt(UI.qOf),{a:state.idx+1,b:cfg.questions.length})+'</div>'+
          '<div class="qtext">'+L(q)+'</div>'+
          '<div class="opts">'+labels.map(function(o,i){
            return '<button class="opt'+(state.answers[state.idx]===i?' sel':'')+'" data-i="'+i+'"><span class="dot"></span>'+o+'</button>';
          }).join('')+'</div></div>';
      fill.style.width=(state.idx/cfg.questions.length*100)+'%';
      backBtn.disabled=state.idx===0;
      nextBtn.textContent=(state.idx===cfg.questions.length-1)?tt(UI.seeResults):tt(UI.next);
      nextBtn.disabled=(state.answers[state.idx]==null);
      host.querySelectorAll('.opt').forEach(function(b){
        b.onclick=function(){
          state.answers[state.idx]=+b.dataset.i;
          host.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel');});
          b.classList.add('sel'); nextBtn.disabled=false;
        };
      });
    }
    backBtn.onclick=function(){ if(state.idx>0){state.idx--;renderQ();} };
    nextBtn.onclick=function(){
      if(state.answers[state.idx]==null) return;
      if(state.idx<cfg.questions.length-1){ state.idx++; renderQ(); }
      else { state.finished=true; showResult(true); }
    };
    function computeReport(){
      var scores=state.answers.map(function(ai,i){ return {q:cfg.questions[i], v:UI.likert.v[ai]}; });
      return EVALS[cfg.type](scores, cfg.results);
    }
    function showResult(scroll){
      fill.style.width='100%';
      host.style.display='none'; qnav.style.display='none';
      var rep=computeReport();
      resultBox.innerHTML=renderResultHTML(rep);
      resultBox.classList.add('active');
      requestAnimationFrame(function(){
        resultBox.querySelectorAll('.fill').forEach(function(f){ f.style.width=f.dataset.w+'%'; });
      });
      if(scroll && !state.saved && window.KYStore){
        KYStore.saveResult(cfg.type, rep.key, rep);
        var sn=resultBox.querySelector('.savednote');
        if(sn) sn.textContent=fmt(tt(UI.savedTo),{n:KYStore.active().name});
      }
      state.saved=true;
      if(scroll) resultBox.scrollIntoView({behavior:sb(),block:'center'});
      resultBox.querySelector('.retry').onclick=function(){
        state.idx=0; state.answers=[]; state.finished=false; state.saved=false;
        resultBox.classList.remove('active'); resultBox.innerHTML='';
        host.style.display=''; qnav.style.display='';
        renderQ(); quiz.scrollIntoView({behavior:sb(),block:'start'});
      };
      resultBox.querySelector('.pdf').onclick=function(){ buildPrintReport(rep, L(cfg.title)); };
      var copyBtn=resultBox.querySelector('.copy');
      if(copyBtn) copyBtn.onclick=function(){
        var txt=shareText(rep), btn=this;
        function done(){ btn.textContent=tt(UI.copied); setTimeout(function(){btn.textContent=tt(UI.copy);},1600); }
        if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,done); }
        else { var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} ta.remove(); done(); }
      };
    }
    if(state.active) quiz.classList.add('active');
    if(state.finished){ renderQ(); showResult(false); }
    else renderQ();
  }
  _render=renderPage;
  renderPage();
}

function initHome(cfg){
  var root=document.getElementById('app');
  function L(n){return tt(n);}
  function renderPage(){
    clearChrome();
    buildHeader('home');
    var cards=cfg.cards.map(function(c){
      return '<a class="home-card" href="'+c.href+'">'+
        '<div class="badge '+c.badgeClass+'">'+c.emoji+'</div>'+
        '<div class="sub">'+L(c.kicker)+'</div><h3>'+L(c.title)+'</h3>'+
        '<p>'+L(c.body)+'</p><span class="go">'+L(cfg.explore)+'</span></a>';
    }).join('');
    root.innerHTML='<section class="hero"><h1>'+L(cfg.heroTitle)+'</h1><p>'+L(cfg.heroSub)+'</p></section>'+
      '<div class="home-grid">'+cards+'</div>'+
      '<p class="disclaimer">'+L(cfg.disclaimer)+'</p>';
    addFooter();
  }
  _render=renderPage;
  renderPage();
}

function barsHTML(rep){
  return rep.bars.map(function(b){
    var ml=b.offset?'margin-left:'+b.offset+'%;':'';
    return '<div class="bar"><div class="lab"><span>'+b.label+'</span><span>'+b.right+'</span></div>'+
      '<div class="track"><div class="fill" data-w="'+b.pct+'" style="width:0;'+ml+'background:'+b.color+'"></div></div></div>';
  }).join('');
}
function buildCombinedPrint(lat, narr){
  var host=document.getElementById('print-report');
  if(!host){ host=document.createElement('div'); host.id='print-report'; document.body.appendChild(host); }
  var d=new Date(), dateStr=d.toLocaleDateString(LANG==='sk'?'sk-SK':'en-GB',{year:'numeric',month:'long',day:'numeric'});
  var blocks='';
  ['mbti','love','attach'].forEach(function(t){
    if(lat[t]){ var r=lat[t].report;
      blocks+='<h2>'+r.emoji+' '+r.title+'</h2><p class="pr-desc" style="margin:0 0 10px">'+r.desc+'</p>'+
        r.bars.map(function(b){var ml=b.offset?'margin-left:'+b.offset+'%;':'';
          return '<div class="pr-bar"><div class="pr-lab"><span>'+b.label+'</span><span>'+b.right+'</span></div>'+
          '<div class="pr-track"><div class="pr-fill" style="width:'+b.pct+'%;'+ml+'background:'+b.color+'"></div></div></div>';}).join('');
    }
  });
  host.innerHTML='<div class="pr-band"><div class="pr-kicker">'+tt(UI.reportKicker)+' · '+tt(UI.combinedKicker)+'</div>'+
      '<div class="pr-emoji">✦</div><h1>'+KYStore.active().name+'</h1>'+
      '<p class="pr-sub">'+tt(UI.combinedH)+'</p></div>'+
    '<p class="pr-desc">'+narr+'</p>'+blocks+
    '<div class="pr-foot">'+tt(UI.generated)+': '+dateStr+' &nbsp;·&nbsp; '+tt(UI.prDisclaimer)+'</div>';
  window.print();
}

function initProfile(){
  var root=document.getElementById('app');
  function renderPage(){
    clearChrome(); buildHeader('profile');
    var profs=KYStore.list(), actId=KYStore.activeId(), lat=KYStore.latest();
    var narr=KYStore.narrative(LANG, lat);
    var hasAny = lat.mbti||lat.love||lat.attach;

    var chips=profs.map(function(p){
      return '<button class="pchip toolbtn'+(p.id===actId?' on':'')+'" data-id="'+p.id+'">'+
        (p.id===actId?'● ':'')+p.name.replace(/</g,'&lt;')+'</button>';
    }).join('');

    var topics=[{t:'mbti',href:'mbti.html'},{t:'love',href:'love.html'},{t:'attach',href:'attachment.html'}];
    var latestCards=topics.map(function(o){
      var rec=lat[o.t];
      if(rec){ var r=rec.report;
        return '<div class="card" style="margin-top:0">'+
          '<div style="display:flex;align-items:center;gap:12px">'+
            '<span style="font-size:34px">'+r.emoji+'</span>'+
            '<div><div style="font-weight:800;font-size:20px;letter-spacing:-.4px">'+r.title+'</div>'+
            '<div style="color:var(--muted);font-size:13px">'+r.subtitle+'</div></div></div>'+
          '<p style="font-size:14px;margin:12px 0 6px">'+r.desc+'</p>'+barsHTML(r)+'</div>';
      }
      return '<div class="card" style="margin-top:0"><p style="color:var(--muted);margin:0 0 12px">'+tt(UI.noneYet)+'</p>'+
        '<a class="btn" href="'+o.href+'">'+tt(UI.takeIt)+'</a></div>';
    }).join('');

    var hist=KYStore.history();
    var histHTML = hist.length ? hist.map(function(r){
      var dt=new Date(r.ts).toLocaleDateString(LANG==='sk'?'sk-SK':'en-GB',{day:'numeric',month:'short',year:'numeric'});
      return '<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px">'+
        '<span>'+r.report.emoji+' '+r.report.title+'</span><span style="color:var(--muted)">'+dt+'</span></div>';
    }).join('') : '<p style="color:var(--muted)">'+tt(UI.noneYet)+'</p>';

    root.innerHTML=
      '<div class="topic-head"><div class="badge b1">✦</div>'+
        '<div><div class="sub">'+tt(UI.navProfile)+'</div><h2>'+KYStore.active().name+'</h2></div></div>'+
      '<p class="disclaimer" style="text-align:left;margin:14px 0 0">'+tt(UI.profileIntro)+'</p>'+
      '<div class="actionbar" style="margin-top:14px">'+chips+
        '<button class="btn ghost" id="addP">'+tt(UI.newProfile)+'</button></div>'+
      '<div class="actionbar" style="margin-top:10px">'+
        '<button class="toolbtn" id="renP">'+tt(UI.renameP)+'</button>'+
        '<button class="toolbtn" id="delP">'+tt(UI.deleteP)+'</button>'+
        '<button class="toolbtn" id="clrP">'+tt(UI.clearHist)+'</button>'+
      '</div>'+
      '<div class="topic-head" style="margin-top:36px"><div class="badge b2">🧩</div>'+
        '<div><div class="sub">'+tt(UI.combinedKicker)+'</div><h2>'+tt(UI.combinedH)+'</h2></div></div>'+
      '<div class="card"><p class="lead">'+narr+'</p>'+
        (hasAny?'<div class="actionbar"><button class="btn ghost" id="dlAll">'+tt(UI.dlCombined)+'</button></div>':'')+
      '</div>'+
      '<h2 style="margin:36px 0 0;font-size:22px;letter-spacing:-.5px">'+tt(UI.latestH)+'</h2>'+
      '<div class="home-grid" style="margin-top:14px">'+latestCards+'</div>'+
      '<h2 style="margin:14px 0 0;font-size:22px;letter-spacing:-.5px">'+tt(UI.historyH)+'</h2>'+
      '<div class="card">'+histHTML+'</div>'+
      '<details class="more" style="margin-top:18px;border:none"><summary><span class="arrow">▸</span> '+tt(UI.creditsH)+'</summary>'+
        '<div class="detail-body"><p style="color:var(--muted);font-size:13.5px">'+tt(UI.credits)+'</p></div></details>';

    addFooter();
    requestAnimationFrame(function(){
      root.querySelectorAll('.fill').forEach(function(f){ f.style.width=f.dataset.w+'%'; });
    });
    root.querySelectorAll('.pchip').forEach(function(b){
      b.onclick=function(){ KYStore.setActive(b.dataset.id); renderPage(); };
    });
    root.querySelector('#addP').onclick=function(){
      var n=prompt(tt(UI.promptName),''); if(n!==null){ KYStore.add(n||'New profile'); renderPage(); }
    };
    root.querySelector('#renP').onclick=function(){
      var n=prompt(tt(UI.promptName),KYStore.active().name); if(n){ KYStore.rename(KYStore.activeId(),n); renderPage(); }
    };
    root.querySelector('#delP').onclick=function(){
      if(confirm(tt(UI.confDelete))){ KYStore.remove(KYStore.activeId()); renderPage(); }
    };
    root.querySelector('#clrP').onclick=function(){
      if(confirm(tt(UI.confClear))){ KYStore.clearHistory(); renderPage(); }
    };
    var dl=root.querySelector('#dlAll');
    if(dl) dl.onclick=function(){ buildCombinedPrint(KYStore.latest(), KYStore.narrative(LANG,KYStore.latest())); };
  }
  _render=renderPage;
  renderPage();
}

window.KY.initTopic=initTopic;
window.KY.initHome =initHome;
window.KY.initProfile=initProfile;

})();
