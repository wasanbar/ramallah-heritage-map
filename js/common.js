
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

function qs(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

async function loadJSON(path){
  // EMBEDDED_DATA_ROUTER
  try{
    if(typeof window !== "undefined"){
      if((/data\/buildings\.json$/).test(path) && window.__DATA_BUILDINGS__) return window.__DATA_BUILDINGS__;
      if((/data\/tours\.json$/).test(path) && window.__DATA_TOURS__) return window.__DATA_TOURS__;
      if((/data\/coming-soon\.json$/).test(path) && window.__DATA_COMINGSOON__) return window.__DATA_COMINGSOON__;
    }
  }catch(e){}
  const res = await fetch(path, {cache:"no-store"});
  if(!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach(a=>{
    if(a.getAttribute("href") === path) a.style.borderColor="rgba(34,197,94,.55)";
  });
}

function embedYouTube(url){
  // supports youtu.be and youtube.com/watch?v=
  let id = null;
  try{
    const u = new URL(url);
    if(u.hostname.includes("youtu.be")) id = u.pathname.replace("/","");
    if(u.hostname.includes("youtube.com")) id = u.searchParams.get("v");
  }catch(e){}
  if(!id) return null;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";
  iframe.style.width="100%";
  iframe.style.aspectRatio="16/9";
  iframe.style.border="0";
  iframe.style.borderRadius="16px";
  return iframe;
}

function render3D(container, model3d){
  if(!model3d) return;
  const wrap = document.createElement("div");
  wrap.className="card";
  wrap.style.marginTop="16px";
  const h = document.createElement("h2");
  h.textContent="عرض ثلاثي الأبعاد (إن وُجد)";
  const p = document.createElement("p");
  p.textContent="يظهر هذا القسم فقط عندما يتوفر نموذج جاهز للمبنى.";
  wrap.appendChild(h); wrap.appendChild(p);

  if(model3d.type === "sketchfab" && model3d.url){
    const iframe = document.createElement("iframe");
    iframe.src = model3d.url;
    iframe.loading="lazy";
    iframe.style.width="100%";
    iframe.style.height="520px";
    iframe.style.border="0";
    iframe.style.borderRadius="16px";
    iframe.allow="autoplay; fullscreen; xr-spatial-tracking";
    wrap.appendChild(document.createElement("hr")).className="sep";
    wrap.appendChild(iframe);
  }else if(model3d.type === "glb" && model3d.url){
    // model-viewer web component
    const mv = document.createElement("model-viewer");
    mv.setAttribute("src", model3d.url);
    mv.setAttribute("camera-controls","");
    mv.setAttribute("auto-rotate","");
    mv.setAttribute("ar","");
    mv.style.width="100%";
    mv.style.height="520px";
    mv.style.background="rgba(15,23,42,.55)";
    mv.style.border="1px solid rgba(148,163,184,.18)";
    mv.style.borderRadius="16px";
    wrap.appendChild(document.createElement("hr")).className="sep";
    wrap.appendChild(mv);
  }

  container.appendChild(wrap);
}


function toast(msg){
  let el = document.getElementById("toast");
  if(!el){
    el = document.createElement("div");
    el.id="toast";
    el.className="toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(()=>{el.style.display="none";}, 2600);
}

function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)*Math.sin(dLon/2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function getUserLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation) return reject(new Error("no geo"));
    navigator.geolocation.getCurrentPosition(
      pos=> resolve({lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy}),
      err=> reject(err),
      {enableHighAccuracy:true, timeout: 9000, maximumAge: 15000}
    );
  });
}

// Favorites (localStorage)
const FAV_KEY = "ramallah_heritage_favs_v1";
function getFavs(){
  try{ return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }catch(e){ return new Set(); }
}
function setFavs(set){
  localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set)));
}
function isFav(id){ return getFavs().has(id); }
function toggleFav(id){
  const s = getFavs();
  if(s.has(id)) s.delete(id); else s.add(id);
  setFavs(s);
  return s.has(id);
}

async function sharePage(title, url){
  try{
    if(navigator.share){
      await navigator.share({title, url});
      return true;
    }
  }catch(e){}
  // fallback copy link
  try{
    await navigator.clipboard.writeText(url);
    toast("تم نسخ الرابط للمشاركة ✅");
    return false;
  }catch(e){
    toast("لم أتمكن من النسخ. انسخ الرابط يدويًا.");
    return false;
  }
}


// Passport (visited)
const VIS_KEY = "ramallah_heritage_visited_v1";
function getVisited(){
  try{ return new Set(JSON.parse(localStorage.getItem(VIS_KEY) || "[]")); }catch(e){ return new Set(); }
}
function setVisited(set){
  localStorage.setItem(VIS_KEY, JSON.stringify(Array.from(set)));
}
function markVisited(id){
  const s = getVisited();
  s.add(id);
  setVisited(s);
}
function isVisited(id){ return getVisited().has(id); }
function toggleVisited(id){
  const s = getVisited();
  if(s.has(id)) s.delete(id); else s.add(id);
  setVisited(s);
  return s.has(id);
}

// Speech (Audio guide using built-in TTS)
let _ttsUtter = null;
function speak(text, lang="ar"){
  try{
    if(!("speechSynthesis" in window)) { toast("الصوت غير مدعوم على هذا الجهاز."); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (lang==="ar") ? "ar" : "en";
    u.rate = 0.95;
    _ttsUtter = u;
    window.speechSynthesis.speak(u);
    toast("دليل صوتي: تشغيل 🔊");
  }catch(e){
    toast("تعذر تشغيل الصوت.");
  }
}
function stopSpeak(){
  try{
    if("speechSynthesis" in window) window.speechSynthesis.cancel();
  }catch(e){}
}

// PWA install & SW
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  // UI can choose to show install button
});
async function promptInstall(){
  if(!deferredPrompt){ toast("التثبيت غير متاح الآن."); return; }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
}
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}

// Mode toggle: visitor vs researcher
const MODE_KEY = "ramallah_heritage_mode_v1"; // "visitor" | "researcher"
function getMode(){ return localStorage.getItem(MODE_KEY) || "visitor"; }
function setMode(m){ localStorage.setItem(MODE_KEY, m); }

// Ambient audio (no music)
let _ambient = null;
function startAmbient(kind="city"){
  try{
    stopAmbient();
    const a = new Audio(kind==="calm" ? "assets/audio/ambient_calm.wav" : "assets/audio/ambient_city.wav");
    a.loop = true;
    a.volume = 0.22;
    a.play().then(()=> toast("تشغيل أجواء المدينة 🔈")).catch(()=> toast("اضغط مرة أخرى لتشغيل الصوت"));
    _ambient = a;
  }catch(e){}
}
function stopAmbient(){
  try{ if(_ambient){ _ambient.pause(); _ambient.currentTime=0; _ambient=null; toast("تم إيقاف الأجواء"); } }catch(e){}
}

// Onboarding (first visit)
const ONBOARD_KEY = "ramallah_heritage_onboard_v1";
function shouldShowOnboard(){ return !localStorage.getItem(ONBOARD_KEY); }
function markOnboardDone(){ localStorage.setItem(ONBOARD_KEY,"1"); }
function openOnboard(){ const b=document.getElementById("onboardBack"); if(b) b.style.display="flex"; }
function closeOnboard(){ const b=document.getElementById("onboardBack"); if(b) b.style.display="none"; }


// Language toggle (AR/EN)
const LANG_KEY = "ramallah_heritage_lang_v1"; // "ar" | "en"
function getLang(){ return localStorage.getItem(LANG_KEY) || "ar"; }
function setLang(l){ localStorage.setItem(LANG_KEY, l); }
function applyLang(){ applyI18n(); }
function t(ar, en){
  return (getLang()==="en" && en) ? en : ar;
}
function wireLangButton(){
  const btn = document.getElementById("langBtn");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    setLang(getLang()==="ar" ? "en" : "ar");
    applyLang();
    // refresh content-rendered pages
    setTimeout(()=> location.reload(), 250);
  });
}
document.addEventListener("DOMContentLoaded", wireLangButton);


// ===== i18n helpers =====

function applyI18n(){
  const l = getLang();
  document.documentElement.lang = l;
  document.documentElement.dir = (l==="ar") ? "rtl" : "ltr";
  document.body.classList.toggle("ltr", l==="en");

  // text nodes
  $$("[data-i18n-ar]").forEach(el=>{
    const ar = el.getAttribute("data-i18n-ar") || "";
    const en = el.getAttribute("data-i18n-en") || "";
    el.textContent = (l==="en" ? (en||ar) : ar);
  });

  // placeholders
  $$("[data-ph-ar]").forEach(el=>{
    const ar = el.getAttribute("data-ph-ar") || "";
    const en = el.getAttribute("data-ph-en") || "";
    el.setAttribute("placeholder", (l==="en" ? (en||ar) : ar));
  });

  // titles (optional)
  $$("[data-title-ar]").forEach(el=>{
    const ar = el.getAttribute("data-title-ar") || "";
    const en = el.getAttribute("data-title-en") || "";
    el.setAttribute("title", (l==="en" ? (en||ar) : ar));
  });

  // language button label
  const btn = document.getElementById("langBtn");
  if(btn){
    btn.textContent = (l==="ar") ? "EN" : "AR";
    btn.title = (l==="ar") ? "Switch to English" : "التبديل للعربية";
  }
}

// override previous applyLang handler if exists
document.addEventListener("DOMContentLoaded", applyI18n);

// ===== lightbox =====
function openLightbox(src, alt){
  let lb = document.getElementById("lightbox");
  if(!lb){
    lb = document.createElement("div");
    lb.id="lightbox";
    lb.className="lightbox";
    lb.innerHTML = `
      <div class="lb-backdrop" data-close></div>
      <div class="lb-card" role="dialog" aria-modal="true">
        <button class="lb-close" data-close aria-label="Close">×</button>
        <img class="lb-img" alt="">
      </div>`;
    document.body.appendChild(lb);
    lb.addEventListener("click", (e)=>{
      if(e.target && (e.target.hasAttribute("data-close") || e.target.closest("[data-close]"))){
        lb.classList.remove("open");
      }
    });
    document.addEventListener("keydown", (e)=>{
      if(e.key==="Escape") lb.classList.remove("open");
    });
  }
  const img = lb.querySelector(".lb-img");
  img.src = src;
  img.alt = alt || "";
  lb.classList.add("open");
}

// ===== carousel =====
function renderCarousel(container, images, altBase){
  if(!container) return;
  const imgs = (images||[]).filter(Boolean);
  if(imgs.length===0){
    container.innerHTML = "";
    return;
  }
  let idx=0;
  container.classList.add("carousel");
  container.innerHTML = `
    <div class="car-main">
      <button class="car-btn prev" type="button" aria-label="Previous">‹</button>
      <img class="car-img" loading="lazy" alt="">
      <button class="car-btn next" type="button" aria-label="Next">›</button>
    </div>
    <div class="car-thumbs"></div>
  `;
  const main = container.querySelector(".car-img");
  const thumbs = container.querySelector(".car-thumbs");
  function set(i){
    idx = (i+imgs.length)%imgs.length;
    main.src = imgs[idx];
    main.alt = altBase ? `${altBase} (${idx+1}/${imgs.length})` : "";
    $$(".car-thumb", thumbs).forEach((t,j)=> t.classList.toggle("active", j===idx));
  }
  imgs.forEach((src,i)=>{
    const b = document.createElement("button");
    b.type="button";
    b.className="car-thumb";
    b.innerHTML = `<img src="${src}" alt="">`;
    b.addEventListener("click", ()=> set(i));
    thumbs.appendChild(b);
  });
  container.querySelector(".prev").addEventListener("click", ()=> set(idx-1));
  container.querySelector(".next").addEventListener("click", ()=> set(idx+1));
  main.addEventListener("click", ()=> openLightbox(main.src, main.alt));
  set(0);
}

// ===== mini quiz =====
const QUIZ_KEY_PREFIX = "rh_quiz_";
function getQuizBank(){
  return {
    "first-time": {
      q_ar: "ما الذي يميّز ساحة المنارة في رام الله؟",
      q_en: "What best describes Al-Manara Square in Ramallah?",
      options_ar: ["مطار قديم", "قلب المدينة ومكان اللقاء العام", "قلعة عسكرية", "ميناء بحري"],
      options_en: ["An old airport", "The city’s heart and a public meeting point", "A military fortress", "A sea port"],
      correct: 1,
      explain_ar: "المنارة تُعد نقطة القلب الحضري ومكان اللقاء والذاكرة العامة للمدينة.",
      explain_en: "Al-Manara is widely seen as Ramallah’s urban heart and a central public meeting point."
    }
  };
}

function showQuizModal(tourId){
  const bank = getQuizBank();
  const q = bank[tourId] || bank["first-time"];
  const l = getLang();
  const key = QUIZ_KEY_PREFIX + (tourId||"general");
  // build modal
  let m = document.getElementById("quizModal");
  if(!m){
    m = document.createElement("div");
    m.id="quizModal";
    m.className="quizmodal";
    document.body.appendChild(m);
  }
  const title = (l==="en") ? "Quick quiz" : "سؤال خفيف";
  const qtext = (l==="en") ? q.q_en : q.q_ar;
  const opts = (l==="en") ? q.options_en : q.options_ar;
  const explain = (l==="en") ? q.explain_en : q.explain_ar;
  m.innerHTML = `
    <div class="qm-backdrop"></div>
    <div class="qm-card" role="dialog" aria-modal="true">
      <div class="qm-head">
        <span class="badge">${title}</span>
        <button class="qm-close" type="button" aria-label="Close">×</button>
      </div>
      <h3 style="margin:10px 0 8px">${qtext}</h3>
      <div class="qm-opts"></div>
      <div class="qm-foot smallmuted" style="margin-top:10px"></div>
    </div>
  `;
  const close=()=> m.classList.remove("open");
  m.querySelector(".qm-close").onclick=close;
  m.querySelector(".qm-backdrop").onclick=close;

  const box = m.querySelector(".qm-opts");
  const foot = m.querySelector(".qm-foot");
  opts.forEach((label, i)=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="pill qm-opt";
    b.style.width="100%";
    b.style.textAlign="start";
    b.textContent = label;
    b.onclick=()=>{
      const ok = (i===q.correct);
      foot.textContent = ok
        ? ((l==="en") ? "✅ Correct. " : "✅ صحيح. ") + explain
        : ((l==="en") ? "❌ Not quite. " : "❌ مش تمام. ") + explain;
      localStorage.setItem(key, JSON.stringify({tourId, ok, picked:i, at: Date.now()}));
      $$(".qm-opt", box).forEach(x=> x.disabled=true);
    };
    box.appendChild(b);
  });

  // show
  m.classList.add("open");
}


/* LOCAL_FILE_WARNING: show message when opened via file:// (fetch blocked) */
document.addEventListener("DOMContentLoaded", ()=>{
  if(location.protocol === "file:"){
    const div = document.createElement("div");
    div.style.position="fixed";
    div.style.top="10px";
    div.style.left="10px";
    div.style.right="10px";
    div.style.zIndex="9999";
    div.style.padding="10px 12px";
    div.style.borderRadius="12px";
    div.style.background="rgba(245,158,11,.92)";
    div.style.color="#111827";
    div.style.fontWeight="800";
    div.style.textAlign="center";
    div.textContent="⚠️ لتظهر الجولات والخرائط لازم تفتحي المشروع عبر سيرفر محلي (Live Server) أو GitHub Pages. فتحه مباشرة (file://) يمنع تحميل ملفات JSON.";
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 12000);
  }
});


/* OPEN_METEO_WEATHER_MAP */
function weatherCodeToText(code, lang){
  const ar = {
    0:"صحو", 1:"غائم جزئيًا", 2:"غائم جزئيًا", 3:"غائم",
    45:"ضباب", 48:"ضباب مُترسّب",
    51:"رذاذ خفيف", 53:"رذاذ", 55:"رذاذ كثيف",
    56:"رذاذ متجمّد خفيف", 57:"رذاذ متجمّد",
    61:"مطر خفيف", 63:"مطر", 65:"مطر غزير",
    66:"مطر متجمّد خفيف", 67:"مطر متجمّد",
    71:"ثلج خفيف", 73:"ثلج", 75:"ثلج كثيف",
    77:"حبّات ثلج", 80:"زخّات مطر خفيفة", 81:"زخّات مطر", 82:"زخّات مطر غزيرة",
    85:"زخّات ثلج خفيفة", 86:"زخّات ثلج كثيفة",
    95:"عواصف رعدية", 96:"عواصف مع بَرَد خفيف", 99:"عواصف مع بَرَد"
  };
  const en = {
    0:"Clear", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast",
    45:"Fog", 48:"Depositing rime fog",
    51:"Light drizzle", 53:"Drizzle", 55:"Dense drizzle",
    56:"Light freezing drizzle", 57:"Freezing drizzle",
    61:"Slight rain", 63:"Rain", 65:"Heavy rain",
    66:"Light freezing rain", 67:"Freezing rain",
    71:"Slight snow", 73:"Snow", 75:"Heavy snow",
    77:"Snow grains", 80:"Light rain showers", 81:"Rain showers", 82:"Violent rain showers",
    85:"Light snow showers", 86:"Heavy snow showers",
    95:"Thunderstorm", 96:"Thunderstorm w/ hail", 99:"Thunderstorm w/ heavy hail"
  };
  const dict = (lang==="en") ? en : ar;
  return dict[code] || ((lang==="en") ? "Weather" : "الطقس");
}
