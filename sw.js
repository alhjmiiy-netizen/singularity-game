// Singularity service worker: caches the whole game for offline play
const CACHE='singularity-ecee348f05';
const FILES=["./", "index.html", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
// A new version waits until the player taps "Update available" (SKIP_WAITING) or closes every tab.
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
// Only this game's own caches are touched; the remakes in drift/, collapse/ and tactics/ have their own workers and caches.
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('singularity-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const SCOPE=new URL(self.registration.scope).pathname;
const OWN=u=>{if(u.origin!==location.origin||!u.pathname.startsWith(SCOPE))return false;return !/^(drift|collapse|tactics)([/]|$)/.test(u.pathname.slice(SCOPE.length));};
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(!OWN(u))return;   // never intercept the remakes' subfolders
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;
  }).catch(()=>e.request.mode==='navigate'?caches.open(CACHE).then(c=>c.match('index.html')):Response.error())));
});
