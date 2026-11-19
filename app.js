import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const sb = createClient('https://hvqtgnlqcidutvnlxtpd.supabase.co', 'sb_publishable_4bsl7qLRH1N38ZbEahcH4A_u-34P_EU');
const $ = s => document.querySelector(s), app = $('#app'), nav = $('#nav');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let session = null, profile = null, library = [];

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

async function boot() {
  if (location.hash.startsWith('#/a/')) return studentView(location.hash.slice(4));
  const { data } = await sb.auth.getSession(); session = data.session;
  sb.auth.onAuthStateChange((ev, s) => { session = s; if (ev === 'PASSWORD_RECOVERY') newPass(); });
  if (location.hash.includes('type=recovery')) return;
  if (!session) return login();
  await loadProfile(); menu(); show('stu');
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
  nav.innerHTML = [['stu', 'Alunos'], ['imp', 'Importar ficha'], ['lib', 'Exercícios']].map(([k, t]) => `<button data-k=${k}>${t}</button>`).join('');
  nav.onclick = e => e.target.dataset.k && show(e.target.dataset.k);
}
function show(k) { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); ({ lib, imp, stu: students })[k](); }

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
function restOf(t) { const m = /(?:pausa|descanso|intervalo)\s*(?:de\s*)?(\d+)\s*(min(?:utos?)?|s(?:eg(?:undos?)?)?)\b/i.exec(t || ''); return m ? (/^m/i.test(m[2]) ? +m[1] * 60 : +m[1]) : 0; }
export function parseFicha(text) {
  const out = { aluno: '', meta: [], geral: [], sessoes: [] };
  let cur = null, mode = 'head', gid = 0;
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
    const parts = [first]; let det = detalhe; gid++;
    if (detalhe.includes(' + ')) { const q = detalhe.split(/\s+\+\s+/); det = q.shift(); parts.push(...q); }
    parts.forEach((p, i) => {
      const alt = /\(([^)]*)\)/.exec(p); const nome = p.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      cur.itens.push({ tipo: 'ex', texto: p.trim(), busca: nome, rest: restOf(body), bi: parts.length > 1 ? gid : 0, obs: [i === 0 ? det : '', alt ? alt[1] : ''].filter(Boolean).join(' · ') });
    });
  }
  return out;
}

// ---------- escolher exercício (janela de busca)
async function pick(cb) {
  const lb = await getLib(); const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = '<div class=box><input id=ps placeholder="Buscar exercício" autofocus><div id=pl class=list></div><button id=pc>Cancelar</button></div>'; document.body.appendChild(d);
  const draw = () => { const q = d.querySelector('#ps').value.toLowerCase(); d.querySelector('#pl').innerHTML = lb.filter(x => (x.name + ' ' + x.muscle_group).toLowerCase().includes(q)).slice(0, 40)
    .map(x => `<div class=row data-id=${x.id}><img src="${esc(x.image_path)}" alt=""><div><b>${esc(x.name)}</b><br><small class=muted>${esc(x.muscle_group)}</small></div></div>`).join(''); };
  d.querySelector('#ps').oninput = draw; draw();
  d.querySelector('#pc').onclick = () => d.remove();
  d.querySelector('#pl').onclick = e => { const r = e.target.closest('.row'); if (!r) return; d.remove(); cb(lb.find(x => x.id == r.dataset.id)); };
}
const nsets = t => { const m = /(\d+)\s*[xX×]/.exec(t || ''); return m ? Math.min(+m[1], 10) : 3; };
const linkOf = tk => location.origin + location.pathname + '#/a/' + tk;

// ---------- importar ficha
async function imp() {
  app.innerHTML = `<h2>Importar ficha</h2><p class=muted>Cole o treino do aluno do jeito que você escreve. O app separa os treinos (A, B, C…), reconhece os exercícios e mostra o desenho. Depois você salva para o aluno.</p>
  <textarea id=t placeholder="NOME DO ALUNO&#10;&#10;TREINO A&#10;1. Supino reto&#10;2. Remada baixa"></textarea><button class=p id=go>Reconhecer exercícios</button><div id=r></div>`;
  $('#go').onclick = async () => {
    const f = parseFicha($('#t').value); const lb = await getLib(); const byId = Object.fromEntries(lb.map(x => [x.id, x]));
    if (!f.sessoes.length) return $('#r').innerHTML = '<p class=warn>Não encontrei nenhum "TREINO A/B/C". Confira o texto.</p>';
    $('#r').innerHTML = 'Lendo…';
    for (const s of f.sessoes) for (const it of s.itens) {
      let q = it.tipo === 'cardio' ? it.texto.replace(/^livre:?\s*/i, '').replace(/preferencialmente/i, '').trim() : it.busca; it.ex = null;
      if (/copenhagen/i.test(q) && /joelho/i.test(it.obs || '')) q += ' com joelho apoiado'; else if (/copenhagen/i.test(q) && /p[eé]/i.test(it.obs || '') && /apoiad/i.test(it.obs || '')) q += ' com pé apoiado';
      if (q.length > 3) { const { data } = await sb.rpc('match_exercise', { p_text: q }); const m = data?.[0]; const e = m && byId[m.exercise_id];
        if (e && m.score >= 0.6 && (it.tipo !== 'cardio' || e.muscle_group === 'Cardio')) it.ex = e; else if (e && it.tipo === 'ex') it.sug = e; }
    }
    const view = () => {
      let h = `<label class=muted>Nome do aluno</label><input id=an value="${esc(f.aluno)}"><label class=muted>Pausa padrão entre as séries (segundos)</label><input id=rd type=number inputmode=numeric value="${f.rd || 60}">`, rev = 0, tot = 0;
      if (f.meta.length) h += `<p class=muted>${f.meta.map(esc).join('<br>')}</p>`;
      if (f.geral.length) h += `<details><summary>Orientações gerais (${f.geral.length})</summary><ul>${f.geral.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
      f.sessoes.forEach((s, si) => { h += `<h2>${esc(s.nome)}${s.foco ? ' — ' + esc(s.foco) : ''}</h2>`;
        s.itens.forEach((it, ii) => { const ob = it.obs ? `<br><small class=muted>${esc(it.obs)}</small>` : ''; const bi = it.bi ? '<span class=tag>bi-set</span> ' : '';
          if (it.tipo === 'cardio') { h += `<div class=row>${it.ex ? `<img src="${esc(it.ex.image_path)}" alt="">` : ''}<div>⏱ <b>Cardio</b>${it.ex ? ' — ' + esc(it.ex.name.replace(/^Cardio:\s*/, '')) : ''}<br><small class=muted>${esc(it.texto)}</small></div></div>`; return; }
          tot++;
          if (it.ex) h += `<div class=row><img src="${esc(it.ex.image_path)}" alt=""><div>${bi}<b>${esc(it.texto)}</b><br><small class=muted>→ ${esc(it.ex.name)}</small>${ob}<br><button class=sm data-pk="${si},${ii}">Trocar</button></div></div>`;
          else { rev++; h += `<div class=row><div>${bi}<b>${esc(it.texto)}</b><br><small class=warn>Sem desenho${it.sug ? ' (parecido: ' + esc(it.sug.name) + ')' : ''}</small>${ob}<br><button class="sm p" data-pk="${si},${ii}">Escolher exercício</button></div></div>`; } }); });
      $('#r').innerHTML = `<p class=muted>${f.sessoes.length} treinos · ${tot} exercícios · ${rev} sem desenho</p>` + h + '<button class=p id=sv>Salvar para o aluno</button><p id=sm></p>';
      $('#sv').onclick = () => salvar(f, $('#an').value.trim(), +$('#rd').value || 60);
      $('#r').querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const [si, ii] = b.dataset.pk.split(',').map(Number); f.aluno = $('#an').value; f.rd = +$('#rd').value || 60; pick(e => { f.sessoes[si].itens[ii].ex = e; view(); }); });
    };
    view();
  };
}
async function salvar(f, nome, rd) {
  const msg = $('#sm'); if (!nome) return msg.innerHTML = '<span class=err>Digite o nome do aluno.</span>';
  msg.textContent = 'Salvando…'; const uid = session.user.id;
  try {
    let { data: ex } = await sb.from('students').select('id,token').eq('trainer_id', uid).ilike('name', nome).limit(1); let st = ex && ex[0];
    const notes = [...f.meta, ...f.geral].join('\n');
    if (st) { if (!confirm(`Já existe o aluno "${nome}". Substituir os treinos atuais pelos novos? (o histórico dele é mantido)`)) return msg.textContent = '';
      await sb.from('workouts').update({ active: false }).eq('student_id', st.id); await sb.from('students').update({ notes }).eq('id', st.id); }
    else { const r = await sb.from('students').insert({ trainer_id: uid, name: nome, notes }).select('id,token').single(); if (r.error) throw r.error; st = r.data; }
    for (let si = 0; si < f.sessoes.length; si++) {
      const s = f.sessoes[si];
      const w = await sb.from('workouts').insert({ trainer_id: uid, student_id: st.id, name: s.nome + (s.foco ? ' — ' + s.foco : ''), position: si, raw_text: s.itens.map(i => i.texto).join('\n') }).select('id').single(); if (w.error) throw w.error;
      const blocks = []; s.itens.forEach(it => { const last = blocks[blocks.length - 1];
        if (it.bi && last && last.bi === it.bi) last.items.push(it); else blocks.push({ bi: it.bi, tipo: it.tipo, items: [it] }); });
      const br = await sb.from('workout_blocks').insert(blocks.map((b, i) => ({ workout_id: w.data.id, position: i, set_type: b.tipo === 'cardio' ? 'cardio' : b.bi ? 'biset' : 'normal', sets: b.tipo === 'cardio' ? null : Math.max(...b.items.map(i => nsets(i.obs))), rest_seconds: b.tipo === 'cardio' ? null : (b.items.map(i => i.rest).find(Boolean) || rd) }))).select('id,position'); if (br.error) throw br.error;
      const rows = []; blocks.forEach((b, i) => { const id = br.data.find(x => x.position === i).id;
        b.items.forEach((it, k) => rows.push({ block_id: id, position: k, exercise_id: it.ex ? it.ex.id : null, raw_text: it.texto, note: it.obs || null, kind: it.tipo, needs_review: !it.ex })); });
      const ir = await sb.from('block_items').insert(rows); if (ir.error) throw ir.error;
    }
    msg.innerHTML = `<span class=ok>Treino salvo!</span> <button class=p id=op>Abrir aluno e enviar link</button>`; $('#op').onclick = () => { show('stu'); aluno(st.id); };
  } catch (e) { msg.innerHTML = `<span class=err>${esc(e.message)}</span>`; }
}

// ---------- alunos (treinador)
async function students() {
  app.innerHTML = '<h2>Alunos</h2><div id=ls>Carregando…</div>';
  const { data, error } = await sb.from('students').select('id,name,active,created_at').order('name'); if (error) return $('#ls').innerHTML = `<p class=err>${esc(error.message)}</p>`;
  $('#ls').innerHTML = data.length ? data.map(s => `<div class="row click" data-id=${s.id}><div><b>${esc(s.name)}</b></div></div>`).join('') : '<p class=muted>Nenhum aluno ainda. Vá em “Importar ficha”, cole o treino e salve.</p>';
  $('#ls').onclick = e => { const r = e.target.closest('.row'); if (r) aluno(r.dataset.id); };
}
async function aluno(id) {
  app.innerHTML = 'Carregando…';
  const [s, w, h] = await Promise.all([
    sb.from('students').select('*').eq('id', id).single(),
    sb.from('workouts').select('id,name,position,workout_blocks(id,position,set_type,block_items(id,position,raw_text,note,kind,exercise_id,exercises(name,image_path)))').eq('student_id', id).eq('active', true).order('position'),
    sb.from('workout_sessions').select('started_at,rating,comment,workouts(name),set_logs(set_number,reps,load_kg,block_items(raw_text))').eq('student_id', id).order('started_at', { ascending: false }).limit(10)]);
  if (s.error) return app.innerHTML = `<p class=err>${esc(s.error.message)}</p>`;
  const st = s.data, url = linkOf(st.token);
  let x = `<button id=bk>← Alunos</button><h2>${esc(st.name)}</h2>
   <div class=box2><b>Link do aluno</b><input readonly id=lk value="${esc(url)}"><button class=p id=cp>Copiar link</button> <a class=btn href="https://wa.me/?text=${encodeURIComponent('Oi! Seu treino está aqui: ' + url)}" target=_blank>Enviar no WhatsApp</a>
   <p class=muted>O aluno abre esse link no celular, sem senha. Dica: “Adicionar à tela inicial” para virar app.</p></div>`;
  (w.data || []).forEach(wo => { x += `<h2>${esc(wo.name)}</h2>`;
    wo.workout_blocks.sort((a, b) => a.position - b.position).forEach(b => b.block_items.sort((a, c) => a.position - c.position).forEach(i => {
      x += `<div class=row><img ${i.exercises ? `src="${esc(i.exercises.image_path)}"` : ''} alt=""><div>${b.set_type === 'biset' ? '<span class=tag>bi-set</span> ' : ''}<b>${esc(i.raw_text)}</b>${i.exercises ? `<br><small class=muted>→ ${esc(i.exercises.name)}</small>` : ''}${i.note ? `<br><small class=muted>${esc(i.note)}</small>` : ''}<br>
      ${i.kind === 'ex' ? `<button class=sm data-tr=${i.id}>Trocar</button> ` : ''}<button class=sm data-rm=${i.id}>Remover</button></div></div>`; })); });
  x += '<h2>Histórico</h2>' + ((h.data || []).length ? h.data.map(z => `<div class=row><div><b>${esc(z.workouts?.name || '')}</b> <small class=muted>${new Date(z.started_at).toLocaleString('pt-BR')}</small>${z.rating ? ' ' + '★'.repeat(z.rating) : ''}${z.comment ? `<br><small>${esc(z.comment)}</small>` : ''}<br><small class=muted>${(z.set_logs || []).filter(l => l.load_kg || l.reps).map(l => `${esc(l.block_items?.raw_text || '')} s${l.set_number}: ${l.load_kg ?? '-'}kg×${l.reps ?? '-'}`).join(' · ')}</small></div></div>`).join('') : '<p class=muted>O aluno ainda não registrou treinos.</p>');
  x += '<p><button id=dl class=danger>Excluir aluno</button></p>'; app.innerHTML = x;
  $('#bk').onclick = students; $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(url); $('#cp').textContent = 'Copiado!'; } catch { $('#lk').select(); } };
  app.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => pick(async e => { await sb.from('block_items').update({ exercise_id: e.id, needs_review: false }).eq('id', b.dataset.tr); aluno(id); }));
  app.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (confirm('Remover este exercício do treino?')) { await sb.from('block_items').delete().eq('id', b.dataset.rm); aluno(id); } });
  $('#dl').onclick = async () => { if (confirm(`Excluir ${st.name} e todos os treinos e históricos dele? Isso não pode ser desfeito.`)) { await sb.from('students').delete().eq('id', id); students(); } };
}

// ---------- tela do aluno (sem login): treino do dia, exercício por exercício
async function studentView(token) {
  nav.innerHTML = ''; const { data: P, error } = await sb.rpc('student_plan', { p_token: token });
  if (error || !P) return app.innerHTML = '<h2>Link inválido</h2><p class=muted>Peça um novo link ao seu treinador.</p>';
  document.body.classList.add('aluno');
  const key = w => 'dh2_' + token + '_' + w;
  const ld = w => { try { return JSON.parse(localStorage.getItem(key(w))) || {}; } catch { return {}; } };
  const sv = (w, o) => { try { localStorage.setItem(key(w), JSON.stringify(o)); } catch {} };
  const upd = (fn) => { const o = ld(wk.id); fn(o); sv(wk.id, o); return o; };
  let wk = null, steps = [], idx = 0, rest = null, tick = null;
  const stepsOf = w => { const out = [], seen = {};
    w.items.forEach(i => { if (i.kind === 'cardio') return out.push({ cardio: true, items: [i] });
      if (i.biset && seen[i.group]) return seen[i.group].items.push(i);
      const st = { items: [i], biset: i.biset }; if (i.biset) seen[i.group] = st; out.push(st); });
    out.forEach(x => { if (x.cardio) return; x.sets = x.items[0].sets || Math.max(...x.items.map(i => nsets(i.note || i.text))); x.rest = Math.max(...x.items.map(i => i.rest || 60)); });
    return out; };
  const beep = () => { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = .15; o.start(); setTimeout(() => { o.stop(); c.close(); }, 350); } catch {} };

  // --- cronômetro de pausa (semicírculo)
  const LEN = Math.PI * 80;
  const stopRest = () => { rest = null; clearInterval(tick); tick = null; const r = $('#rest'); if (r) r.innerHTML = ''; };
  const paintRest = () => { const r = $('#rest'); if (!r) return; if (!rest) return r.innerHTML = '';
    r.innerHTML = `<div class=restbox><svg viewBox="0 0 200 112" class=gauge><path d="M20 100 A80 80 0 0 1 180 100" class=gt /><path id=arc d="M20 100 A80 80 0 0 1 180 100" class=ga stroke-dasharray="${LEN} ${LEN}" /><text id=sec x=100 y=88 text-anchor=middle class=gs></text><text x=100 y=108 text-anchor=middle class=gl>segundos de pausa</text></svg>
      <div class=rbtn><button data-r="-15">−15s</button><button data-r="skip">Pular pausa</button><button data-r="15">+15s</button></div></div>`;
    r.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { if (b.dataset.r === 'skip') return stopRest(); const d = +b.dataset.r * 1000; rest.end += d; rest.total = Math.max(5, rest.total + d / 1000); frame(); });
    frame(); };
  const frame = () => { if (!rest) return; const left = Math.max(0, rest.end - Date.now()), sec = Math.ceil(left / 1000); const t = $('#sec'), a = $('#arc'); if (t) t.textContent = sec; if (a) a.setAttribute('stroke-dasharray', `${LEN * Math.min(1, left / (rest.total * 1000))} ${LEN}`);
    if (left <= 0) { clearInterval(tick); tick = null; beep(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {} const r = $('#rest'); if (r) r.innerHTML = '<div class=restbox><b class=ok>Pausa concluída! Bora para a próxima série 💪</b></div>'; rest = null; setTimeout(() => { if (!rest && $('#rest')) $('#rest').innerHTML = ''; }, 3500); } };
  const startRest = sec => { clearInterval(tick); rest = { end: Date.now() + sec * 1000, total: sec }; paintRest(); tick = setInterval(frame, 250); };

  // --- início: escolher o treino do dia
  const home = () => { stopRest(); wk = null; document.title = 'DE HOJE';
    let h = `<h2>Olá, ${esc(P.student.name.split(' ')[0])}</h2>`;
    if (!P.workouts.length) { app.innerHTML = h + '<p class=muted>Seu treino ainda não foi cadastrado.</p>'; return; }
    h += '<p class=muted>Qual treino você vai fazer hoje?</p>';
    P.workouts.forEach(w => { const o = ld(w.id), p = w.name.split(' — ');
      h += `<div class=wcard><div><b>${esc(p[0])}</b><br><small class=muted>${esc(p.slice(1).join(' — '))}${p.length > 1 ? ' · ' : ''}${w.items.length} exercícios</small></div><button class=p data-w=${w.id}>${o.started ? 'Continuar' : 'Começar'}</button></div>`; });
    if (P.student.notes) h += `<details><summary>Orientações do treinador</summary><p class=pre>${esc(P.student.notes)}</p></details>`;
    app.innerHTML = h; app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => start(b.dataset.w)); };
  const start = id => { wk = P.workouts.find(w => w.id === id); steps = stepsOf(wk); const o = ld(id); idx = Math.min(o.idx || 0, steps.length); upd(o => { o.started = true; }); play(); };
  const go = n => { idx = Math.max(0, Math.min(steps.length, n)); upd(o => { o.idx = idx; }); play(); window.scrollTo(0, 0); };

  // --- um exercício por vez
  const play = () => {
    if (idx >= steps.length) return finish();
    const s = steps[idx], st = ld(wk.id), p = wk.name.split(' — ');
    let h = `<div class=ptop><button data-home aria-label=Início>←</button><b>${esc(p[0])}</b><span class=muted>${idx + 1} / ${steps.length}</span></div><div class=bar><i style="width:${idx / steps.length * 100}%"></i></div><div id=rest></div>`;
    if (s.cardio) { const i = s.items[0]; h += `<div class=exv><h3>⏱ Cardio</h3><p>${esc(i.exercise ? i.exercise.name.replace(/^Cardio:\s*/, '') : '')}</p>${i.exercise ? `<img src="${esc(i.exercise.image)}" alt="">` : ''}<p>${esc(i.text)}</p><label class=chk><input type=checkbox data-c=${i.id} ${st['c' + i.id] ? 'checked' : ''}> Cardio concluído</label></div>`; }
    else {
      s.items.forEach((i, ix) => { const ex = i.exercise;
        h += `<div class=exv>${s.biset ? `<span class=tag>Bi-set · exercício ${'AB'[ix] || ix + 1}</span>` : ''}<h3>${esc(i.text)}</h3>${ex ? `<img src="${esc(ex.image)}" alt="${esc(ex.name)}"><small class=muted>${esc(ex.name)}</small>` : ''}${i.note ? `<p>${esc(i.note)}</p>` : ''}${i.last ? `<p class=muted>Última vez: ${i.last.load ?? '-'} kg × ${i.last.reps ?? '-'}</p>` : ''}${ex?.how_to ? `<details><summary>Como fazer</summary><p>${esc(ex.how_to)}</p></details>` : ''}</div>`; });
      h += `<div class=sets><b>Séries</b>${s.biset ? ' <small class=muted>(faça A e B em sequência e marque ✓)</small>' : ''}`;
      for (let k = 1; k <= s.sets; k++) { const dn = st[`d_${idx}_${k}`];
        h += `<div class="setrow${dn ? ' done' : ''}"><span class=sn>${k}</span><div class=ins>${s.items.map((i, ix) => `<div class=pair>${s.biset ? `<small>${'AB'[ix] || ix + 1}</small>` : ''}<input inputmode=decimal placeholder="${i.last?.load ?? 'kg'}" aria-label=kg data-i=${i.id} data-s=${k} data-f=load value="${esc(st[`${i.id}_${k}_load`] || '')}"><input inputmode=numeric placeholder="reps" aria-label=reps data-i=${i.id} data-s=${k} data-f=reps value="${esc(st[`${i.id}_${k}_reps`] || '')}"></div>`).join('')}</div><button class="okb${dn ? ' on' : ''}" data-d=${k} aria-label="Série ${k} feita">✓</button></div>`; }
      h += '</div>'; }
    h += `<div class=pbar><button data-prev ${idx ? '' : 'disabled'}>Anterior</button><button data-skip>Pular</button><button class=p data-next>${idx === steps.length - 1 ? 'Finalizar' : 'Próximo'}</button></div>`;
    app.innerHTML = h; paintRest();
    app.querySelector('[data-home]').onclick = home; app.querySelector('[data-prev]').onclick = () => go(idx - 1);
    app.querySelector('[data-next]').onclick = () => go(idx + 1); app.querySelector('[data-skip]').onclick = () => go(idx + 1);
    app.querySelectorAll('input[data-i]').forEach(e => e.oninput = () => upd(o => { o[`${e.dataset.i}_${e.dataset.s}_${e.dataset.f}`] = e.value; }));
    app.querySelectorAll('input[data-c]').forEach(e => e.onchange = () => upd(o => { o['c' + e.dataset.c] = e.checked; }));
    app.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const k = b.dataset.d; let now; upd(o => { now = !o[`d_${idx}_${k}`]; o[`d_${idx}_${k}`] = now; });
      b.classList.toggle('on', now); b.closest('.setrow').classList.toggle('done', now); if (now) startRest(s.rest); });
  };

  // --- final
  const finish = () => { stopRest(); const o = ld(wk.id); let feitas = 0; Object.keys(o).forEach(k => { if (/^d_/.test(k) && o[k]) feitas++; });
    app.innerHTML = `<div class=ptop><button data-back>←</button><b>Treino concluído?</b><span></span></div><div class=bar><i style="width:100%"></i></div>
      <div class=box2><p><b>${feitas}</b> séries marcadas. Como foi o treino?</p><div class=stars>${[1, 2, 3, 4, 5].map(n => `<button data-r=${n} class="${(o.rating || 0) >= n ? 'on' : ''}">★</button>`).join('')}</div>
      <textarea id=cm placeholder="Comentário (opcional)">${esc(o.comment || '')}</textarea><button class=p id=fin>Concluir treino</button><p id=fm></p></div>`;
    app.querySelector('[data-back]').onclick = () => go(steps.length - 1);
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { upd(z => { z.comment = $('#cm').value; z.rating = +b.dataset.r; }); finish(); });
    $('#cm').oninput = () => upd(z => { z.comment = $('#cm').value; });
    $('#fin').onclick = async () => { const z = ld(wk.id), logs = [];
      wk.items.forEach(i => { if (i.kind === 'cardio') return; const n = Math.max(i.sets || 0, nsets(i.note || i.text), 10); for (let k = 1; k <= n; k++) { const l = z[`${i.id}_${k}_load`], r = z[`${i.id}_${k}_reps`]; if (l || r) logs.push({ item: i.id, set: k, load: l || '', reps: r || '' }); } });
      $('#fm').textContent = 'Enviando…';
      const r = await sb.rpc('student_finish', { p_token: token, p_workout: wk.id, p_rating: z.rating || 0, p_comment: z.comment || '', p_logs: logs });
      if (r.error) return $('#fm').innerHTML = `<span class=err>${esc(r.error.message)}</span>`;
      try { localStorage.removeItem(key(wk.id)); } catch {}
      app.innerHTML = '<h2>Treino concluído! 💪</h2><p>Parabéns! Seu treinador já pode ver o seu resultado.</p><button class=p id=hm>Voltar ao início</button>'; $('#hm').onclick = home; };
  };
  home();
}
boot();
