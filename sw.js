const CACHE="ent-hk-v34";
const FILES=["./","./index.html","./manifest.json","./apple-touch-icon.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>fetch(new Request(u,{cache:"reload"})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  const isPage=req.mode==="navigate"||/\/(index\.html)?$/.test(url.pathname)||/manifest\.json$/.test(url.pathname);
  if(isPage){
    // сначала сеть (свежая версия), без сети — сохранённая копия
    e.respondWith(fetch(new Request(req,{cache:"no-store"})).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(url.pathname.endsWith("manifest.json")?"./manifest.json":"./index.html",c))}return r})
      .catch(()=>caches.match(url.pathname.endsWith("manifest.json")?"./manifest.json":"./index.html").then(h=>h||caches.match("./"))));
    return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const c=r.clone();if(r.ok)caches.open(CACHE).then(x=>x.put(req,c));return r})));
});
