const CACHE="ent-hk-v58";
const FILES=["./","./index.html","./privacy.html","./manifest.json","./apple-touch-icon.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>fetch(new Request(u,{cache:"reload"})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin==="https://www.gstatic.com"&&url.pathname.startsWith("/firebasejs/")){e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const c=r.clone();if(r.ok)caches.open(CACHE).then(x=>x.put(req,c));return r})));return}
  if(url.origin!==location.origin)return;
  const isPage=req.mode==="navigate"||/\/(index\.html)?$/.test(url.pathname)||/manifest\.json$/.test(url.pathname);
  if(isPage){
    // сначала сеть (свежая версия), без сети — сохранённая копия
    e.respondWith(fetch(new Request(req,{cache:"no-store"})).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(url.pathname.endsWith("manifest.json")?"./manifest.json":"./index.html",c))}return r})
      .catch(()=>caches.match(url.pathname.endsWith("manifest.json")?"./manifest.json":"./index.html").then(h=>h||caches.match("./"))));
    return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const c=r.clone();if(r.ok)caches.open(CACHE).then(x=>x.put(req,c));return r})));
});

self.addEventListener("periodicsync",e=>{if(e.tag!=="ent-remind")return;e.waitUntil((async()=>{try{const c=await caches.open("ent-settings");const r=await c.match("/remind.json");if(!r)return;const s=await r.json();if(!s.on)return;const now=new Date(),d=(now.getDay()+6)%7,today=now.toISOString().slice(0,10);if(s.last===today||!s.days.includes(d))return;const [hh,mm]=s.time.split(":").map(Number);if(now.getHours()*60+now.getMinutes()<hh*60+mm)return;s.last=today;await c.put("/remind.json",new Response(JSON.stringify(s)));await self.registration.showNotification("Пора заниматься! 📚",{body:"10 минут сегодня — плюс баллы на ЕНТ 💪",icon:"icon-192.png",tag:"ent-remind"})}catch(_){}})())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{for(const w of ws){if("focus" in w)return w.focus()}return self.clients.openWindow("./")}))});
