import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const sb = createClient('https://hvqtgnlqcidutvnlxtpd.supabase.co', 'sb_publishable_4bsl7qLRH1N38ZbEahcH4A_u-34P_EU');
const $ = s => document.querySelector(s), app = $('#app'), nav = $('#nav');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let session = null, profile = null, library = [];

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

async function boot() {
  const { data } = await sb.auth.getSession(); session = data.session;
  sb.auth.onAuthStateChange((_e, s) => { session = s; });
  if (!session) return login();
  await loadProfile(); menu(); show('lib');
}
async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  profile = data;
  if (!profile) {
    const name = session.user.user_metadata?.full_name || session.user.email;
    const r = await sb.from('profiles').insert({ id: session.user.id, role: 'trainer', full_name: name, owner_id: session.user.id }).select().single();
    profile = r.data;
  }
  $('#out').hidden = false;
}
$('#out').onclick = async () => { await sb.auth.signOut(); location.reload(); };

function login() {
  nav.innerHTML = '';
  app.innerHTML = `<h2>Entrar</h2><input id=e type=email placeholder="E-mail" autocomplete=email><input id=p type=password placeholder="Senha (mín. 8 caracteres)" autocomplete=current-password>
  <button class=p id=in>Entrar</button> <button id=up>Criar conta de treinador</button><p id=m class=err></p>`;
  const go = async (fn) => { $('#m').textContent = ''; const r = await fn({ email: $('#e').value.trim(), password: $('#p').value });
    if (r.error) return $('#m').textContent = r.error.message; if (r.data.session) location.reload(); else $('#m').textContent = 'Confirme o e-mail que enviamos e depois entre.'; };
  $('#in').onclick = () => go(c => sb.auth.signInWithPassword(c)); $('#up').onclick = () => go(c => sb.auth.signUp(c));
}
function menu() {
  nav.innerHTML = [['lib', 'Exercícios'], ['imp', 'Importar ficha']].map(([k, t]) => `<button data-k=${k}>${t}</button>`).join('');
  nav.onclick = e => e.target.dataset.k && show(e.target.dataset.k);
}
function show(k) { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); (k === 'lib' ? lib : imp)(); }

async function getLib() {
  if (library.length) return library;
  let from = 0, all = [];
  for (;;) { const { data, error } = await sb.from('exercises').select('id,name,muscle_group,image_path,how_to').order('name').range(from, from + 999);
    if (error) throw error; all = all.concat(data); if (data.length < 1000) break; from += 1000; }
  return library = all;
}
async function lib() {
  app.innerHTML = '<input id=s placeholder="Buscar exercício ou músculo"><div id=g class=grid>Carregando…</div>';
  let items; try { items = await getLib(); } catch (e) { return app.innerHTML = `<p class=err>${esc(e.message)}</p>`; }
  const draw = () => { const q = $('#s').value.toLowerCase(); $('#g').innerHTML = items.filter(x => (x.name + ' ' + x.muscle_group).toLowerCase().includes(q))
    .map(x => `<div class=card><img loading=lazy src="${esc(x.image_path)}" alt="${esc(x.name)}"><b>${esc(x.name)}</b><small>${esc(x.muscle_group)}</small></div>`).join(''); };
  $('#s').oninput = draw; draw();
}
async function imp() {
  app.innerHTML = `<h2>Importar ficha</h2><p class=muted>Cole a ficha de treino, um exercício por linha. O app reconhece o exercício e mostra o desenho.</p>
  <textarea id=t placeholder="Supino reto 4x10&#10;Crucifixo inclinado 3x12&#10;Stiff com barra 3x10"></textarea><button class=p id=go>Reconhecer exercícios</button><div id=r></div>`;
  $('#go').onclick = async () => {
    const lines = $('#t').value.split('\n').map(l => l.trim()).filter(Boolean); const lb = await getLib(); const byId = Object.fromEntries(lb.map(x => [x.id, x]));
    $('#r').innerHTML = 'Lendo…'; let h = '';
    for (const l of lines) {
      const { data } = await sb.rpc('match_exercise', { p_text: l }); const m = data?.[0]; const ex = m && byId[m.exercise_id];
      h += ex ? `<div class=row><img src="${esc(ex.image_path)}" alt=""><div><b>${esc(l)}</b><br><small class=muted>${esc(ex.name)}</small></div></div>`
              : `<div class=row><div><b>${esc(l)}</b><br><small class=warn>Não reconheci este exercício — revisar</small></div></div>`;
    }
    $('#r').innerHTML = h || '<p class=muted>Nada para ler.</p>';
  };
}
boot();
