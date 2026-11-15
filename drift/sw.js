// Singularity: Drift service worker. Scope: this folder only (registered with scope './').
const CACHE='sg-drift-c511199a9a';
const FILES=["./", "index.html", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('sg-drift-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;
  }).catch(()=>caches.open(CACHE).then(c=>c.match('index.html')))));
});
