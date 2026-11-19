import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const sb = createClient('https://hvqtgnlqcidutvnlxtpd.supabase.co', 'sb_publishable_4bsl7qLRH1N38ZbEahcH4A_u-34P_EU');
const $ = s => document.querySelector(s), app = $('#app'), nav = $('#nav');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let session = null, profile = null, library = [];

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

async function boot() {
  const { data } = await sb.auth.getSession(); session = data.session;
  sb.auth.onAuthStateChange((ev, s) => { session = s; if (ev === 'PASSWORD_RECOVERY') newPass(); });
  if (location.hash.includes('type=recovery')) return;
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
  <button class=p id=in>Entrar</button> <button id=up>Criar conta de treinador</button> <button id=fg>Esqueci a senha</button><p id=m class=err></p>`;
  const go = async (fn) => { $('#m').textContent = ''; const r = await fn({ email: $('#e').value.trim(), password: $('#p').value });
    if (r.error) return $('#m').textContent = r.error.message;
    if (r.data.session) return location.reload();
    $('#m').textContent = r.data.user && r.data.user.identities && r.data.user.identities.length === 0 ? 'Este e-mail já tem conta. Use Entrar ou Esqueci a senha.' : 'Confirme o e-mail que enviamos e depois entre.'; };
  $('#in').onclick = () => go(c => sb.auth.signInWithPassword(c)); $('#up').onclick = () => go(c => sb.auth.signUp(c));
  $('#fg').onclick = async () => { const e = $('#e').value.trim(); if (!e) return $('#m').textContent = 'Digite seu e-mail acima.';
    const r = await sb.auth.resetPasswordForEmail(e, { redirectTo: location.origin + location.pathname }); $('#m').textContent = r.error ? r.error.message : 'Se o e-mail tiver conta, enviamos um link para criar nova senha. Veja também o spam.'; };
}
function newPass() {
  nav.innerHTML = ''; app.innerHTML = '<h2>Nova senha</h2><input id=n type=password placeholder="Nova senha (mín. 8 caracteres)" autocomplete=new-password><button class=p id=sv>Salvar</button><p id=m class=err></p>';
  $('#sv').onclick = async () => { const r = await sb.auth.updateUser({ password: $('#n').value }); if (r.error) return $('#m').textContent = r.error.message; location.href = location.origin + location.pathname; };
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
export function parseFicha(text) {
  const out = { aluno: '', meta: [], geral: [], sessoes: [] };
  let cur = null, mode = 'head';
  for (const raw of text.split(/\r?\n/)) {
    const l = raw.trim().replace(/^[•*\-]\s+/, m => m);
    if (!l || /^[⸺—–_\-=]{2,}$/.test(l) || /^⸻$/.test(l)) continue;
    const t = l.replace(/^[*•]\s*/, '');
    let m = /^TREINO\s+([A-Z0-9]+)\b\s*[:\-–]?\s*(.*)$/i.exec(l);
    if (m) { cur = { nome: 'Treino ' + m[1].toUpperCase(), foco: m[2] || '', itens: [] }; out.sessoes.push(cur); mode = 'sess'; continue; }
    if (/^ORIENTA/i.test(l)) { mode = 'geral'; continue; }
    if (mode === 'head') { if (!out.aluno && !/:/.test(l)) out.aluno = l; else if (/:/.test(l)) out.meta.push(l); continue; }
    if (mode === 'geral') { if (/^(BOM TREINO|MR )/i.test(l)) { mode = 'fim'; continue; } out.geral.push(t); continue; }
    if (/^(BOM TREINO|MR TREINAMENTO)/i.test(l)) { mode = 'fim'; continue; }
    if (!cur || mode === 'fim') continue;
    m = /^(\d+)\s*[.)\-]\s*(.+)$/.exec(l);
    if (!m) { if (!cur.itens.length && !cur.foco) cur.foco = l; else if (cur.itens.length) cur.itens[cur.itens.length - 1].obs = (cur.itens[cur.itens.length - 1].obs ? cur.itens[cur.itens.length - 1].obs + ' ' : '') + l; continue; }
    const body = m[2].trim();
    if (/^CARDIO/i.test(body)) { const livre = /^CARDIO\s+LIVRE/i.test(body); const resto = body.replace(/^CARDIO\s*(LIVRE)?\s*:?\s*/i, '').trim(); cur.itens.push({ tipo: 'cardio', texto: livre ? (resto ? 'Livre: ' + resto : 'Livre') : (resto || 'Livre') }); continue; }
    const [first, ...rest] = body.split(/\s+[–—-]\s+/);
    const detalhe = rest.join(' – ');
    const parts = [first]; let det = detalhe;
    if (detalhe.includes(' + ')) { const q = detalhe.split(/\s+\+\s+/); det = q.shift(); parts.push(...q); }
    parts.forEach((p, i) => {
      const alt = /\(([^)]*)\)/.exec(p); const nome = p.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      cur.itens.push({ tipo: 'ex', texto: p.trim(), busca: nome, obs: [i === 0 ? det : '', alt ? alt[1] : ''].filter(Boolean).join(' · ') });
    });
  }
  return out;
}

async function imp() {
  app.innerHTML = `<h2>Importar ficha</h2><p class=muted>Cole o treino do aluno do jeito que você escreve. O app separa os treinos (A, B, C…), reconhece os exercícios e mostra o desenho.</p>
  <textarea id=t placeholder="NOME DO ALUNO&#10;&#10;TREINO A&#10;1. Supino reto&#10;2. Remada baixa"></textarea><button class=p id=go>Reconhecer exercícios</button><div id=r></div>`;
  $('#go').onclick = async () => {
    const f = parseFicha($('#t').value); const lb = await getLib(); const byId = Object.fromEntries(lb.map(x => [x.id, x]));
    if (!f.sessoes.length) return $('#r').innerHTML = '<p class=warn>Não encontrei nenhum "TREINO A/B/C". Confira o texto.</p>';
    $('#r').innerHTML = 'Lendo…'; let h = '', rev = 0, tot = 0;
    if (f.aluno) h += `<h2>${esc(f.aluno)}</h2>`;
    if (f.meta.length) h += `<p class=muted>${f.meta.map(esc).join('<br>')}</p>`;
    if (f.geral.length) h += `<details><summary>Orientações gerais (${f.geral.length})</summary><ul>${f.geral.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
    for (const s of f.sessoes) {
      h += `<h2>${esc(s.nome)}${s.foco ? ' — ' + esc(s.foco) : ''}</h2>`;
      for (const it of s.itens) {
        if (it.tipo === 'cardio') {
          const q = it.texto.replace(/^livre:?\s*/i, '').replace(/preferencialmente/i, '').trim(); let cx = null;
          if (q.length > 3) { const { data } = await sb.rpc('match_exercise', { p_text: q }); const m = data?.[0]; const e = m && byId[m.exercise_id]; if (e && e.muscle_group === 'Cardio' && m.score >= 0.6) cx = e; }
          h += `<div class=row>${cx ? `<img src="${esc(cx.image_path)}" alt="">` : ''}<div>⏱ <b>Cardio</b>${cx ? ' — ' + esc(cx.name.replace(/^Cardio:\s*/, '')) : ''}<br><small class=muted>${esc(it.texto)}</small></div></div>`; continue; }
        tot++; const { data } = await sb.rpc('match_exercise', { p_text: it.busca }); const m = data?.[0]; const ex = m && byId[m.exercise_id];
        const ob = it.obs ? `<br><small class=muted>${esc(it.obs)}</small>` : '';
        if (ex && m.score >= 0.6) h += `<div class=row><img src="${esc(ex.image_path)}" alt=""><div><b>${esc(it.texto)}</b><br><small class=muted>→ ${esc(ex.name)}</small>${ob}</div></div>`;
        else { rev++; h += `<div class=row><div><b>${esc(it.texto)}</b><br><small class=warn>Sem desenho — revisar${ex ? ' (parecido: ' + esc(ex.name) + ')' : ''}</small>${ob}</div></div>`; }
      }
    }
    $('#r').innerHTML = `<p class=muted>${f.sessoes.length} treinos · ${tot} exercícios · ${rev} para revisar</p>` + h;
  };
}
boot();
