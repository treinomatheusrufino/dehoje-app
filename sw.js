const V='dehoje-v41', LIB='dehoje-lib-1', IMG='dehoje-img-1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','app.js','style.css','manifest.webmanifest','icons/icon-192.png','icons/icon.svg','icons/apple-touch-icon.png','atlas.js','didatica.js','didatica_dados.js','ia.js','ia_ui.js','aluno_extras.js','extras.js'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>![V,LIB,IMG].includes(x)).map(x=>caches.delete(x)))).then(()=>clients.claim())));
const put=(n,r,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(n).then(c=>c.put(r,cp))}return res};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // biblioteca do Supabase (versão fixa): guarda e usa offline
  if(u.hostname==='esm.sh'){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>put(LIB,r,res))));return}
  if(u.origin!==location.origin)return;
  // desenhos dos exercícios: usa o guardado (mais rápido) e funciona sem internet
  if(u.pathname.includes('/exercicios/')){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>put(IMG,r,res))));return}
  // app: rede primeiro (sempre a versão nova); sem internet usa a cópia guardada
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>put(V,r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(c=>c||(r.mode==='navigate'?caches.match('./'):undefined))));
});

// lembrete diário da aula (notificação enviada pelo servidor)
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'DE HOJE',{body:d.body||'',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:d.tag||'dehoje',data:{url:d.url||'./'},renotify:true}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.split('#')[0]===url.split('#')[0]&&'focus' in c)return c.focus()}return clients.openWindow(url)}))});
