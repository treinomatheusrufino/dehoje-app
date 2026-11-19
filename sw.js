const V='dehoje-v9';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','app.js','style.css','icons/icon-192.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// rede primeiro (sempre a versão mais nova); cache só se estiver sem internet
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match(e.request)))});
