const C='sao-workplace-v6-4-journey-purpose';
const A=['./','./index.html','./styles.css?v=6.4.0','./app.js?v=6.4.0','./cloud-sync.js?v=6.4.0','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./vision-50-years.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put('./index.html',copy)).catch(()=>{});return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy)).catch(()=>{})}return r});
    return cached||net;
  }));
});