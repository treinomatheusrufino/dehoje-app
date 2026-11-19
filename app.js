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
function show(k) { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); ({ lib, imp, stu: students })(); }

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
      cur.itens.push({ tipo: 'ex', texto: p.trim(), busca: nome, bi: parts.length > 1 ? gid : 0, obs: [i === 0 ? det : '', alt ? alt[1] : ''].filter(Boolean).join(' · ') });
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
      if (q.length > 3) { const { data } = await sb.rpc('match_exercise', { p_text: q }); const m = data?.[0]; const e = m && byId[m.exercise_id];
        if (e && m.score >= 0.6 && (it.tipo !== 'cardio' || e.muscle_group === 'Cardio')) it.ex = e; else if (e && it.tipo === 'ex') it.sug = e; }
    }
    const view = () => {
      let h = `<label class=muted>Nome do aluno</label><input id=an value="${esc(f.aluno)}">`, rev = 0, tot = 0;
      if (f.meta.length) h += `<p class=muted>${f.meta.map(esc).join('<br>')}</p>`;
      if (f.geral.length) h += `<details><summary>Orientações gerais (${f.geral.length})</summary><ul>${f.geral.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
      f.sessoes.forEach((s, si) => { h += `<h2>${esc(s.nome)}${s.foco ? ' — ' + esc(s.foco) : ''}</h2>`;
        s.itens.forEach((it, ii) => { const ob = it.obs ? `<br><small class=muted>${esc(it.obs)}</small>` : ''; const bi = it.bi ? '<span class=tag>bi-set</span> ' : '';
          if (it.tipo === 'cardio') { h += `<div class=row>${it.ex ? `<img src="${esc(it.ex.image_path)}" alt="">` : ''}<div>⏱ <b>Cardio</b>${it.ex ? ' — ' + esc(it.ex.name.replace(/^Cardio:\s*/, '')) : ''}<br><small class=muted>${esc(it.texto)}</small></div></div>`; return; }
          tot++;
          if (it.ex) h += `<div class=row><img src="${esc(it.ex.image_path)}" alt=""><div>${bi}<b>${esc(it.texto)}</b><br><small class=muted>→ ${esc(it.ex.name)}</small>${ob}<br><button class=sm data-pk="${si},${ii}">Trocar</button></div></div>`;
          else { rev++; h += `<div class=row><div>${bi}<b>${esc(it.texto)}</b><br><small class=warn>Sem desenho${it.sug ? ' (parecido: ' + esc(it.sug.name) + ')' : ''}</small>${ob}<br><button class="sm p" data-pk="${si},${ii}">Escolher exercício</button></div></div>`; } }); });
      $('#r').innerHTML = `<p class=muted>${f.sessoes.length} treinos · ${tot} exercícios · ${rev} sem desenho</p>` + h + '<button class=p id=sv>Salvar para o aluno</button><p id=sm></p>';
      $('#sv').onclick = () => salvar(f, $('#an').value.trim());
      $('#r').querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const [si, ii] = b.dataset.pk.split(',').map(Number); f.aluno = $('#an').value; pick(e => { f.sessoes[si].itens[ii].ex = e; view(); }); });
    };
    view();
  };
}
async function salvar(f, nome) {
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
      const br = await sb.from('workout_blocks').insert(blocks.map((b, i) => ({ workout_id: w.data.id, position: i, set_type: b.tipo === 'cardio' ? 'cardio' : b.bi ? 'biset' : 'normal' }))).select('id,position'); if (br.error) throw br.error;
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

// ---------- tela do aluno (sem login)
async function studentView(token) {
  nav.innerHTML = ''; const { data: P, error } = await sb.rpc('student_plan', { p_token: token });
  if (error || !P) return app.innerHTML = '<h2>Link inválido</h2><p class=muted>Peça um novo link ao seu treinador.</p>';
  const key = w => 'dh_' + token + '_' + w; const ld = w => { try { return JSON.parse(localStorage.getItem(key(w))) || {}; } catch { return {}; } };
  const sv = (w, o) => { try { localStorage.setItem(key(w), JSON.stringify(o)); } catch {} };
  let cur = P.workouts[0]?.id;
  const draw = () => {
    const w = P.workouts.find(z => z.id === cur); if (!w) return app.innerHTML = `<h2>Olá, ${esc(P.student.name)}</h2><p class=muted>Seu treino ainda não foi cadastrado.</p>`;
    const st = ld(w.id);
    let h = `<h2>Olá, ${esc(P.student.name.split(' ')[0])}</h2><div class=tabs>${P.workouts.map(z => `<button data-w=${z.id} class="${z.id === cur ? 'on' : ''}">${esc(z.name.split(' — ')[0])}</button>`).join('')}</div>`;
    if (w.name.includes(' — ')) h += `<p class=muted>${esc(w.name.split(' — ').slice(1).join(' — '))}</p>`;
    w.items.forEach(i => {
      if (i.kind === 'cardio') { h += `<div class=row><div><label class=chk><input type=checkbox data-c=${i.id} ${st['c' + i.id] ? 'checked' : ''}> ⏱ <b>Cardio</b></label><br><small class=muted>${esc(i.text)}</small></div></div>`; return; }
      const n = nsets(i.note || i.text), ex = i.exercise;
      h += `<div class=ex>${ex ? `<img src="${esc(ex.image)}" alt="">` : ''}<div><b>${i.biset ? '<span class=tag>bi-set</span> ' : ''}${esc(i.text)}</b>${ex ? `<br><small class=muted>${esc(ex.name)}</small>` : ''}${i.note ? `<br><small>${esc(i.note)}</small>` : ''}${i.last ? `<br><small class=muted>Última vez: ${i.last.load ?? '-'} kg × ${i.last.reps ?? '-'}</small>` : ''}
        ${ex?.how_to ? `<details><summary>Como fazer</summary><p>${esc(ex.how_to)}</p></details>` : ''}
        <div class=sets>${Array.from({ length: n }, (_, k) => `<div class=set><span>${k + 1}</span><input inputmode=decimal placeholder="kg" data-i=${i.id} data-s=${k + 1} data-f=load value="${esc(st[`${i.id}_${k + 1}_load`] || '')}"><input inputmode=numeric placeholder="reps" data-i=${i.id} data-s=${k + 1} data-f=reps value="${esc(st[`${i.id}_${k + 1}_reps`] || '')}"></div>`).join('')}</div></div></div>`; });
    if (P.student.notes) h += `<details><summary>Orientações do treinador</summary><p class=pre>${esc(P.student.notes)}</p></details>`;
    h += `<div class=box2><b>Como foi o treino?</b><div class=stars>${[1, 2, 3, 4, 5].map(n => `<button data-r=${n} class="${(st.rating || 0) >= n ? 'on' : ''}">★</button>`).join('')}</div><textarea id=cm placeholder="Comentário (opcional)">${esc(st.comment || '')}</textarea><button class=p id=fin>Finalizar treino</button><p id=fm></p></div>`;
    app.innerHTML = h;
    app.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { cur = b.dataset.w; draw(); });
    app.querySelectorAll('input[data-i]').forEach(e => e.oninput = () => { const o = ld(w.id); o[`${e.dataset.i}_${e.dataset.s}_${e.dataset.f}`] = e.value; sv(w.id, o); });
    app.querySelectorAll('input[data-c]').forEach(e => e.onchange = () => { const o = ld(w.id); o['c' + e.dataset.c] = e.checked; sv(w.id, o); });
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const o = ld(w.id); o.comment = $('#cm').value; o.rating = +b.dataset.r; sv(w.id, o); draw(); });
    $('#cm').oninput = () => { const o = ld(w.id); o.comment = $('#cm').value; sv(w.id, o); };
    $('#fin').onclick = async () => {
      const o = ld(w.id), logs = [];
      w.items.forEach(i => { if (i.kind === 'cardio') return; for (let k = 1; k <= nsets(i.note || i.text); k++) { const l = o[`${i.id}_${k}_load`], r = o[`${i.id}_${k}_reps`]; if (l || r) logs.push({ item: i.id, set: k, load: l || '', reps: r || '' }); } });
      $('#fm').textContent = 'Enviando…';
      const r = await sb.rpc('student_finish', { p_token: token, p_workout: w.id, p_rating: o.rating || 0, p_comment: o.comment || '', p_logs: logs });
      if (r.error) return $('#fm').innerHTML = `<span class=err>${esc(r.error.message)}</span>`;
      try { localStorage.removeItem(key(w.id)); } catch {}
      app.innerHTML = '<h2>Treino concluído! 💪</h2><p>Parabéns! Seu treinador já pode ver o seu resultado.</p><button class=p onclick="location.reload()">Voltar ao treino</button>';
    };
  };
  draw();
}
boot();
