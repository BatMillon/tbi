/* Service worker du tableau interactif : fonctionne aussi sans réseau.
   - la page : réseau d'abord (toujours la dernière version), copie en cache si hors-ligne
   - le reste (anatomie, bibliothèques) : cache d'abord, rempli à la première utilisation */
const V='tbi-cache-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.protocol!=='https:'&&u.hostname!=='localhost')return;
  const page=r.mode==='navigate'||/\.html?$/.test(u.pathname);
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(page){try{const n=await fetch(r);if(n&&n.ok)c.put(r,n.clone());return n;}catch(_){const h=await c.match(r,{ignoreSearch:true});if(h)return h;throw _;}}
    const h=await c.match(r);if(h)return h;
    const n=await fetch(r);if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n;
  })());
});
