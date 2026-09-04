/* ========================================================
   Know Yourself — local data layer
   Named local profiles + results history + combined narrative.
   All stored in localStorage (no server). Designed so a cloud
   backend (e.g. Supabase) could replace the internals later.
   ======================================================== */
(function(){
'use strict';

var KEY='ky_v2';

function load(){
  try{ var d=JSON.parse(localStorage.getItem(KEY)); if(d&&d.profiles) return d; }catch(e){}
  return null;
}
function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }
function uid(){ return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

function data(){
  var d=load();
  if(!d){
    var id=uid();
    d={ profiles:[{id:id,name:'You',created:Date.now()}], active:id, results:{} };
    d.results[id]=[];
    save(d);
  }
  return d;
}

function list(){ return data().profiles.slice(); }
function activeId(){ return data().active; }
function active(){ var d=data(); return d.profiles.filter(function(p){return p.id===d.active;})[0]||d.profiles[0]; }
function setActive(id){ var d=data(); if(d.profiles.some(function(p){return p.id===id;})){ d.active=id; save(d);} }
function add(name){
  var d=data(), id=uid();
  d.profiles.push({id:id,name:(name||'New profile').slice(0,40),created:Date.now()});
  d.results[id]=[]; d.active=id; save(d); return id;
}
function rename(id,name){ var d=data(); d.profiles.forEach(function(p){ if(p.id===id) p.name=(name||p.name).slice(0,40); }); save(d); }
function remove(id){
  var d=data();
  d.profiles=d.profiles.filter(function(p){return p.id!==id;});
  delete d.results[id];
  if(!d.profiles.length){ var nid=uid(); d.profiles=[{id:nid,name:'You',created:Date.now()}]; d.results[nid]=[]; d.active=nid; }
  else if(d.active===id){ d.active=d.profiles[0].id; }
  save(d);
}

/* record: { ts, topic:'mbti'|'love'|'attach', key, report } */
function saveResult(topic,key,report){
  var d=data(), id=d.active;
  if(!d.results[id]) d.results[id]=[];
  d.results[id].push({ ts:Date.now(), topic:topic, key:key, report:report });
  save(d);
}
function history(topic){
  var d=data(), arr=(d.results[d.active]||[]).slice();
  if(topic) arr=arr.filter(function(r){return r.topic===topic;});
  return arr.sort(function(a,b){return b.ts-a.ts;});
}
function latest(){
  var out={};
  ['mbti','love','attach'].forEach(function(t){ var h=history(t); if(h.length) out[t]=h[0]; });
  return out;
}
function clearHistory(){ var d=data(); d.results[d.active]=[]; save(d); }

/* ---------- combined narrative (bilingual, from keys) ---------- */
var ATTACH_LABEL={
  Secure:{en:'secure',sk:'istá'}, Anxious:{en:'anxious / preoccupied',sk:'úzkostná'},
  Avoidant:{en:'avoidant / dismissive',sk:'vyhýbavá'}, Fearful:{en:'fearful-avoidant',sk:'úzkostno-vyhýbavá'}
};
var ATTACH_NEED={
  Secure:{en:'You already balance closeness and independence well, which gives relationships a steady base.',
          sk:'Blízkosť a nezávislosť už dobre vyvažuješ, čo dáva vzťahom pevný základ.'},
  Anxious:{en:'You thrive on consistent reassurance and clear, frequent communication.',
           sk:'Najlepšie ti je pri stálom uistení a jasnej, častej komunikácii.'},
  Avoidant:{en:'You open up best when you are given space and no pressure to share.',
            sk:'Otváraš sa najlepšie, keď máš priestor a žiadny tlak deliť sa.'},
  Fearful:{en:'You feel safest with steady, predictable closeness that earns your trust slowly.',
           sk:'Najbezpečnejšie sa cítiš pri stálej, predvídateľnej blízkosti, ktorá si tvoju dôveru získava pomaly.'}
};
var LOVE_NAME={
  WA:{en:'words of affirmation',sk:'slová uznania'}, QT:{en:'quality time',sk:'spoločný čas'},
  RG:{en:'receiving gifts',sk:'prijímanie darov'}, AS:{en:'acts of service',sk:'skutky služby'},
  PT:{en:'physical touch',sk:'fyzický dotyk'}
};
var LOVE_TIP={
  WA:{en:'specific, genuine appreciation said out loud',sk:'konkrétne, úprimné ocenenie povedané nahlas'},
  QT:{en:'undivided, undistracted time together',sk:'nerozdelený, ničím nerušený spoločný čas'},
  RG:{en:'small, thoughtful tokens that show you were in mind',sk:'malé, premyslené pozornosti, ktoré ukážu, že na teba mysleli'},
  AS:{en:'helpful actions that quietly lighten your load',sk:'užitočné činy, ktoré ti ticho uľahčia bremeno'},
  PT:{en:'closeness and affectionate touch',sk:'blízkosť a nežný dotyk'}
};

function narrative(lang, lat){
  function L(o){ return (o&&o[lang])||o.en; }
  if(!lat.mbti && !lat.love && !lat.attach){
    return lang==='sk'
      ? 'Zatiaľ tu nie sú žiadne výsledky. Sprav aspoň jeden test a tvoj kombinovaný profil sa objaví tu.'
      : 'No results yet. Take at least one test and your combined profile will appear here.';
  }
  var s=[];
  if(lat.mbti) s.push(lang==='sk'
    ? 'Tvoj typ osobnosti je '+lat.mbti.key+'.'
    : 'Your personality type is '+lat.mbti.key+'.');
  if(lat.attach){
    s.push((lang==='sk'?'Tvoja vzťahová väzba je ':'Your attachment style is ')+L(ATTACH_LABEL[lat.attach.key])+'.');
    s.push(L(ATTACH_NEED[lat.attach.key]));
  }
  if(lat.love){
    s.push((lang==='sk'?'Tvoj hlavný jazyk lásky: ':'Your main love language: ')+L(LOVE_NAME[lat.love.key])+'.');
    s.push((lang==='sk'?'Najviac lásky cítiš cez ':'You feel most loved through ')+L(LOVE_TIP[lat.love.key])+
      (lang==='sk'?' — tak daj najbližším vedieť, že to pre teba znamená viac než veľké gestá.'
                  :' — so let the people closest to you know that matters more than grand gestures.'));
  }
  return s.join(' ');
}

window.KYStore={
  list:list, activeId:activeId, active:active, setActive:setActive,
  add:add, rename:rename, remove:remove,
  saveResult:saveResult, history:history, latest:latest, clearHistory:clearHistory,
  narrative:narrative
};

})()
