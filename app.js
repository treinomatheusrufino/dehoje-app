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
  nav.innerHTML = [['stu', 'Alunos'], ['imp', 'Importar ficha'], ['lib', 'Exercícios'], ['perfil', 'Perfil']].map(([k, t]) => `<button data-k=${k}>${t}</button>`).join('');
  nav.onclick = e => e.target.dataset.k && show(e.target.dataset.k);
}
function show(k) { nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); ({ lib, imp, stu: students, perfil })[k](); }

async function getLib() {
  if (library.length) return library;
  let from = 0, all = [];
  for (;;) { const { data, error } = await sb.from('exercises').select('id,name,muscle_group,image_path,how_to,created_by').order('name').range(from, from + 999);
    if (error) throw error; all = all.concat(data); if (data.length < 1000) break; from += 1000; }
  return library = all;
}
const im = (p, a = '') => p ? `<img loading=lazy src="${esc(p)}" alt="${esc(a)}">` : '<div class=noimg>🏋️</div>';
let vids = null;
async function getVids(force) { if (vids && !force) return vids; const { data } = await sb.from('trainer_exercise_notes').select('exercise_id,video_url,note'); vids = Object.fromEntries((data || []).map(r => [r.exercise_id, r])); return vids; }
const okUrl = u => /^https?:\/\/\S+$/i.test(u || '');
function mdl(html) { const d = document.createElement('div'); d.className = 'modal'; d.innerHTML = `<div class=box>${html}</div>`; document.body.appendChild(d); d.close = () => d.remove(); return d; }
async function saveNote(exId, url, note) {
  if (!url && !note) { await sb.from('trainer_exercise_notes').delete().eq('exercise_id', exId); }
  else { const r = await sb.from('trainer_exercise_notes').upsert({ trainer_id: session.user.id, exercise_id: exId, video_url: url || null, note: note || null, updated_at: new Date().toISOString() }, { onConflict: 'trainer_id,exercise_id' }); if (r.error) throw r.error; }
  await getVids(true);
}
async function exModal(ex, done) {
  const v = (await getVids())[ex.id] || {}; const mine = ex.created_by && ex.created_by === session.user.id;
  const d = mdl(`<h3>${esc(ex.name)}</h3><label class=muted>Link do vídeo (YouTube, TikTok, Instagram…)</label><input id=vu type=url inputmode=url placeholder="https://..." value="${esc(v.video_url || '')}"><label class=muted>Instruções ou dica do treinador (o aluno vê)</label><textarea id=vn>${esc(v.note || '')}</textarea><p id=vm class=err></p><button class=p id=vs>Salvar</button> <button id=vc>Cancelar</button>${mine ? ' <button class=danger id=vd>Excluir exercício</button>' : ''}`);
  d.querySelector('#vc').onclick = d.close;
  d.querySelector('#vs').onclick = async () => { const u = d.querySelector('#vu').value.trim(); if (u && !okUrl(u)) return d.querySelector('#vm').textContent = 'O link precisa começar com https://';
    try { await saveNote(ex.id, u, d.querySelector('#vn').value.trim()); d.close(); done && done(); } catch (e) { d.querySelector('#vm').textContent = e.message; } };
  if (mine) d.querySelector('#vd').onclick = async () => { if (!confirm('Excluir este exercício criado por você?')) return; const r = await sb.from('exercises').delete().eq('id', ex.id);
    if (r.error) return d.querySelector('#vm').textContent = 'Não foi possível excluir (ele está em algum treino). ' + r.error.message; library = []; d.close(); done && done(); };
}
function createEx(cb, nome = '') {
  const d = mdl(`<h3>Novo exercício</h3><label class=muted>Nome</label><input id=cn value="${esc(nome)}"><label class=muted>Músculo ou grupo</label><input id=cg placeholder="Ex.: Peito, Pernas…" value="Meus exercícios"><label class=muted>Link do vídeo (YouTube, TikTok, Instagram…)</label><input id=cu type=url inputmode=url placeholder="https://..."><label class=muted>Instruções ou dica (o aluno vê)</label><textarea id=cd></textarea><p id=cm2 class=err></p><button class=p id=cs>Criar exercício</button> <button id=cc>Cancelar</button>`);
  d.querySelector('#cc').onclick = d.close;
  d.querySelector('#cs').onclick = async () => { const name = d.querySelector('#cn').value.trim(), url = d.querySelector('#cu').value.trim(), m = d.querySelector('#cm2');
    if (name.length < 3) return m.textContent = 'Digite o nome do exercício.'; if (url && !okUrl(url)) return m.textContent = 'O link precisa começar com https://';
    const slug = 'u-' + session.user.id.slice(0, 8) + '-' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    const r = await sb.from('exercises').insert({ slug, name, muscle_group: d.querySelector('#cg').value.trim() || 'Meus exercícios', created_by: session.user.id }).select('id,name,muscle_group,image_path,how_to,created_by').single();
    if (r.error) return m.textContent = r.error.message;
    await sb.from('exercise_aliases').insert({ exercise_id: r.data.id, alias: name });
    try { await saveNote(r.data.id, url, d.querySelector('#cd').value.trim()); } catch {}
    library = []; await getLib(); d.close(); cb && cb(r.data); };
}
async function lib() {
  app.innerHTML = '<div class=bar2><input id=s placeholder="Buscar exercício ou músculo"><button class=p id=nw>＋ Novo exercício</button></div><div id=g class=grid>Carregando…</div>';
  let items, vs; try { items = await getLib(); vs = await getVids(); } catch (e) { return app.innerHTML = `<p class=err>${esc(e.message)}</p>`; }
  const draw = () => { const q = $('#s').value.toLowerCase(); $('#g').innerHTML = items.filter(x => (x.name + ' ' + x.muscle_group).toLowerCase().includes(q)).slice(0, 300)
    .map(x => `<div class=card>${im(x.image_path, x.name)}<b>${esc(x.name)}</b><small>${esc(x.muscle_group)}</small><button class=sm data-v=${x.id}>${vs[x.id]?.video_url ? '🎬 Vídeo ✓' : '🎬 Vídeo e dica'}</button></div>`).join(''); };
  $('#s').oninput = draw; draw();
  $('#nw').onclick = () => createEx(() => lib());
  $('#g').onclick = e => { const b = e.target.closest('[data-v]'); if (b) exModal(items.find(x => x.id == b.dataset.v), lib); };
}

const nz = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
const fmt = v => v == null ? '–' : String(Number(v)).replace('.', ',');
const dbr = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '';
function shrink(file, max, type) { return new Promise((res, rej) => { const img = new Image(), u = URL.createObjectURL(file);
  img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => b ? res(b) : rej(new Error('imagem inválida')), type, .82); };
  img.onerror = () => rej(new Error('Não consegui ler essa imagem.')); img.src = u; }); }
// ---------- arquivos (aluno e treinador)
const KINDS = { foto: '📷 Foto de progresso', avaliacao: '📋 Avaliação física', laudo: '🩺 Laudo / exame médico', outro: '📎 Outro arquivo' };
const safeName = n => String(n || 'arquivo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(-80) || 'arquivo';
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
async function prepFile(f) { // fotos são reduzidas (economiza espaço e dados); outros arquivos vão como estão
  if (/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && f.size > 400 * 1024) { try { const blob = await shrink(f, 1600, 'image/jpeg'); return { blob, name: f.name.replace(/\.[^.]+$/, '') + '.jpg', type: 'image/jpeg' }; } catch {} }
  return { blob: f, name: f.name, type: f.type || 'application/octet-stream' }; }
function fileCard(r, url, actions, who) { const img = /^image\//.test(r.mime || '') && url;
  return `<div class=fcard>${img ? `<a href="${esc(url)}" target=_blank rel=noopener><img src="${esc(url)}" alt=""></a>` : `<div class=ficon>${(KINDS[r.kind] || '📎').split(' ')[0]}</div>`}<div class=finfo><b>${esc(KINDS[r.kind] || 'Arquivo')}</b><br><small class=muted>${esc(r.title || '')}${r.size_bytes ? ' · ' + kb(r.size_bytes) : ''} · ${r.taken_on ? dbr(r.taken_on) : new Date(r.created_at).toLocaleDateString('pt-BR')}</small>${r.note ? `<br><small>${esc(r.note)}</small>` : ''}<br><small class="badge${r.shared || r.uploaded_by === 'treinador' ? '' : ' priv'}">${esc(who)}</small><br>${url ? `<a class="btn sm" href="${esc(url)}" target=_blank rel=noopener>Abrir</a> ` : ''}${actions || ''}</div></div>`; }

async function perfil() {
  const { data: p } = await sb.from('profiles').select('brand_name,brand_logo,phone').eq('id', session.user.id).maybeSingle(); const pr = p || {};
  app.innerHTML = `<h2>Perfil e marca</h2><p class=muted>Aparece para os seus alunos no app deles.</p>
   <label class=muted>Nome da sua marca</label><input id=bn placeholder="Matheus Rufino Treinamento" value="${esc(pr.brand_name || '')}">
   <label class=muted>Seu WhatsApp (com DDD, só números) — o aluno vê um botão “Falar com meu treinador”</label><input id=ph inputmode=tel placeholder="5511999999999" value="${esc(pr.phone || '')}">
   <label class=muted>Logo (imagem quadrada, de preferência com fundo transparente)</label>${pr.brand_logo ? `<p><img src="${esc(pr.brand_logo)}" alt="" style="width:64px;height:64px;object-fit:contain"></p>` : ''}<input id=lg type=file accept="image/*">
   <button class=p id=sv2>Salvar</button><p id=pm></p>`;
  $('#sv2').onclick = async () => { const m = $('#pm'); m.textContent = 'Salvando…'; try { let logo = pr.brand_logo || null; const f = $('#lg').files[0];
      if (f) { const b = await shrink(f, 256, 'image/png'), path = `${session.user.id}/logo-${Date.now()}.png`; const u = await sb.storage.from('brand').upload(path, b, { contentType: 'image/png' }); if (u.error) throw u.error; logo = sb.storage.from('brand').getPublicUrl(path).data.publicUrl; }
      const r = await sb.from('profiles').update({ brand_name: $('#bn').value.trim() || null, phone: $('#ph').value.replace(/\D/g, '') || null, brand_logo: logo }).eq('id', session.user.id);
      if (r.error) throw r.error; m.innerHTML = '<span class=ok>Salvo ✓</span>'; perfil(); } catch (e) { m.innerHTML = `<span class=err>${esc(e.message)}</span>`; } };
}
// ---------- leitura da ficha colada
// séries x repetições: "4x10", "4 x 8 a 12", "3x 40s", "4x1 min", "2x 20-30 segundos"
const SETS_RE = /(\d{1,2})\s*[xX×]\s*(\d+(?:[.,]\d+)?(?:\s*(?:a|-|–|\/|ou)\s*\d+)?|falha|m[áa]x(?:imo)?)\s*(segundos?\b|seg\b|s\b|"|minutos?\b|min\b|'|repeti\w*|reps?\b)?/i;
const PAUSA_RE = /(?:pausa|descanso|intervalo)\s*(?:de|:|-|–)?\s*(\d+)\s*(minutos?|min|m\b|'|segundos?|seg|s\b|")?\s*(?:e\s*)?(\d{1,2})?\s*(?:s\b|seg\w*|")?/i;
export function restOf(t) { const m = PAUSA_RE.exec(t || ''); if (!m) return 0; let v = +m[1];
  if (m[2] && /^(m|')/i.test(m[2])) v = v * 60 + (m[3] ? +m[3] : 0); else if (!m[2] && v <= 5) v *= 60; return Math.min(v, 900); }
export function nsets(t) { const m = SETS_RE.exec(t || ''); return m ? Math.max(1, Math.min(+m[1], 10)) : 3; }
export function repsOf(t) { const m = SETS_RE.exec(t || ''); if (!m) return null;
  let r = m[2].replace(/(\d)\s*(?:a|–|-|ou|\/)\s*(\d)/i, '$1-$2').replace(/\s+/g, '').replace(/^m[áa]x\w*$/i, 'máx'); const u = (m[3] || '').toLowerCase();
  if (/^(s|seg|"|segundo)/.test(u)) r += 's'; else if (/^(min|')/.test(u)) r += 'min'; return r; }
// cardio intervalado: "4x 20 segundos / 10 segundos de pausa", "4x 1 min | Pausa: 15s"
export function intervalOf(t) { const m = SETS_RE.exec(t || ''); if (!m || !m[3] || /^rep/i.test(m[3])) return null;
  const n = +m[1], v = parseFloat(m[2].replace(',', '.')); if (!n || !v || isNaN(v)) return null; const work = /^(min|')/i.test(m[3]) ? v * 60 : v;
  let rest = restOf(t); if (!rest) { const q = /\/\s*(\d+)\s*(minutos?|min|segundos?|seg|s)\b/i.exec(t); if (q) rest = /^m/i.test(q[2]) ? +q[1] * 60 : +q[1]; }
  return { n: Math.min(n, 30), work: Math.min(work, 3600), rest: rest || 0 }; }
const HDR = /^(?:TREINO|DIA|FICHA|SESS[ÃA]O)\s+([A-Z]|\d{1,2})(?![A-Za-zÀ-ú])\s*[:\-–—.)]?\s*(.*)$/i;
const HDR2 = /^([A-F])\s*[:\-–—)]\s*(.*)$/;
const NUM = /^(\d{1,2})\s*([a-cA-C])?\s*[.)\-:º°]\s*(.+)$/;
const SPECIAL = /^(bi[\s-]?set|tri[\s-]?set|super[\s-]?(?:set|s[ée]rie)|conjugad[oa]|circuito)\b\s*[:\-–—]?\s*(.*)$/i;
const TAGS = [[/pir[âa]mide/i, 'pirâmide'], [/drop[\s-]?set/i, 'drop-set'], [/rest[\s-]?pause/i, 'rest-pause'], [/cluster/i, 'cluster'], [/isometria/i, 'isometria']];
const DAYNOTE = /(todos os exerc|membros (superiores|inferiores)|treino todo|todo o treino|em todos|neste treino)/i;
const clean = s => s.replace(/^[\s|·,;:\-–—]+|[\s|·,;:\-–—]+$/g, '').replace(/\s{2,}/g, ' ');
export function parseFicha(text) {
  const out = { aluno: '', meta: [], geral: [], sessoes: [], auto: false };
  const lines = String(text || '').split(/\r?\n/);
  const strip = r => r.trim().replace(/^[*•►▪✓✔➤→]+\s*/, '').replace(/^-\s+/, '').replace(/\*\*/g, '').trim();
  const hasHdr = lines.some(r => { const l = strip(r); return HDR.test(l) || (HDR2.test(l) && !SETS_RE.test(l)); });
  let cur = null, mode = 'head', gid = 0, pend = 0, pendGid = 0, numGrp = {}, blank = false;
  const newSess = (nome, foco = '') => { cur = { nome, foco, obs: '', itens: [] }; out.sessoes.push(cur); mode = 'sess'; pend = 0; numGrp = {}; };
  const autoName = () => 'Treino ' + 'ABCDEFGHIJKL'[out.sessoes.length];
  const isEx = (l, nm, sp) => !!(nm || sp || /^CARDIO/i.test(l) || (SETS_RE.test(l) && /^[A-Za-zÀ-ú]/.test(l) && !/^(obs|observa|nota|pausa|descanso|intervalo|importante|aten)/i.test(l)));
  const addEx = (body, group) => {
    if (/^CARDIO/i.test(body)) { const livre = /^CARDIO\s+LIVRE/i.test(body); const resto = clean(body.replace(/^CARDIO\s*(LIVRE)?\s*:?\s*/i, ''));
      cur.itens.push({ tipo: 'cardio', texto: livre ? (resto ? 'Livre: ' + resto : 'Livre') : (resto || 'Livre') }); return; }
    let [name, ...rest] = body.split(/\s+[–—-]\s+|\s*\|\s*/); let detail = rest.join(' | ');
    const sm = SETS_RE.exec(name); if (sm && sm.index > 2) { detail = name.slice(sm.index) + (detail ? ' | ' + detail : ''); name = name.slice(0, sm.index); }
    name = clean(name);
    const names = name.split(/\s+\+\s+/).map(clean).filter(Boolean); let dets = detail ? detail.split(/\s+\+\s+/) : [''];
    if (names.length === 1 && dets.length > 1) { const extra = dets.slice(1); dets = [dets[0]];
      extra.forEach(x => { if (/^(\d|até|ate|com|sem|e\s)/i.test(x.trim()) || !/[A-Za-zÀ-ú]{3}/.test(x)) dets[0] += ' + ' + x; else { const mm = SETS_RE.exec(x); names.push(clean(mm ? x.slice(0, mm.index) : x)); dets.push(mm ? x.slice(mm.index) : ''); } }); }
    const g = group || (names.length > 1 ? ++gid : 0); const tags = TAGS.filter(([re]) => re.test(body)).map(t => t[1]);
    names.forEach((p, k) => {
      const d = dets.length === 1 ? dets[0] : (dets[k] || ''); const base = d || dets[0] || body;
      const alt = /\(([^)]*)\)/.exec(p); const nome = clean(p.replace(/\([^)]*\)/g, ''));
      let note = clean(d.replace(SETS_RE, '').replace(PAUSA_RE, '').replace(/^\s*\+\s*/, ''));
      if (!/[A-Za-zÀ-ú]{2}/.test(note)) note = '';
      cur.itens.push({ tipo: 'ex', texto: clean(p), busca: nome, sets: nsets(base), reps: repsOf(base), rest: restOf(body), bi: g, obs: [...tags.filter(t => !note.toLowerCase().includes(t)), note, alt ? alt[1] : ''].filter(Boolean).join(' · ') });
    });
  };
  for (const raw of lines) {
    const l0 = raw.trim();
    if (!l0) { blank = true; continue; }
    if (/^[⸺—–_\-=~*•.]{2,}$/.test(l0) || /^⸻$/.test(l0)) continue;
    const l = strip(l0), wasBlank = blank; blank = false; if (!l) continue;
    const hm = HDR.exec(l) || (!SETS_RE.test(l) && !NUM.test(l) ? HDR2.exec(l) : null);
    if (hm) { newSess('Treino ' + hm[1].toUpperCase(), clean(hm[2] || '')); continue; }
    if (/^ORIENTA/i.test(l)) { mode = 'geral'; continue; }
    if (/^(BOM TREINO|MR TREINAMENTO)/i.test(l)) { mode = 'fim'; continue; }
    if (mode === 'geral') { out.geral.push(l); continue; }
    if (mode === 'fim') continue;
    const nm = NUM.exec(l), sp = !nm && SPECIAL.exec(l), ex = isEx(l, nm, sp);
    if (mode === 'head') {
      if (!hasHdr && ex) { newSess(autoName()); out.auto = true; }
      else { if (!out.aluno && !/:/.test(l) && l.length < 60) out.aluno = l; else out.meta.push(l); continue; }
    }
    if (!hasHdr && wasBlank && ex && cur && cur.itens.filter(i => i.tipo === 'ex').length >= 3 && !(nm && nm[2] && numGrp[nm[1]])) newSess(autoName());
    if (!cur) continue;
    if (sp) { pend = /tri/i.test(sp[1]) ? 3 : /circuito/i.test(sp[1]) ? 20 : 2; pendGid = ++gid; const r = (sp[2] || '').trim(); if (r && /[A-Za-zÀ-ú]{3}/.test(r)) { addEx(r, pendGid); const added = cur.itens.filter(i => i.bi === pendGid).length; pend = Math.max(0, pend - added); } continue; }
    if (ex) {
      let body = nm ? nm[3].trim() : l, group = 0;
      if (nm && nm[2]) group = numGrp[nm[1]] || (numGrp[nm[1]] = ++gid);
      else if (pend > 0 && !/^CARDIO/i.test(body)) { group = pendGid; pend--; }
      else pend = 0;
      addEx(body, group);
      if (nm && nm[2]) { const prev = cur.itens.filter(i => i.bi === group); if (prev.length > 1) prev.forEach(i => i.bi = group); }
      continue;
    }
    // linha sem padrão de exercício: nunca vira exercício
    const last = cur.itens[cur.itens.length - 1];
    if (last && last.tipo === 'cardio' && !SETS_RE.test(last.texto)) { last.texto = clean(last.texto === 'Livre' ? l : last.texto + ' — ' + l); continue; }
    if (!cur.itens.length) { if (!cur.foco && l.length < 60 && !/^(obs|observa)/i.test(l)) cur.foco = l; else cur.obs = clean((cur.obs ? cur.obs + ' ' : '') + l.replace(/^(obs(erva[çc][ãa]o)?|nota)\s*[:.\-]?\s*/i, '')); continue; }
    if (/^(obs(erva[çc][ãa]o)?\s+(geral|do treino)|importante)/i.test(l) || DAYNOTE.test(l)) { cur.obs = clean((cur.obs ? cur.obs + ' ' : '') + l.replace(/^(obs(erva[çc][ãa]o)?(\s+(geral|do treino))?|importante)\s*[:.\-]?\s*/i, '')); continue; }
    if (SETS_RE.test(l) && last.tipo === 'ex' && /^\d/.test(l)) { last.sets = nsets(l); last.reps = repsOf(l); last.rest = restOf(l) || last.rest; const rem = clean(l.replace(SETS_RE, '').replace(PAUSA_RE, '')); if (/[A-Za-zÀ-ú]{2}/.test(rem)) last.obs = clean((last.obs ? last.obs + ' · ' : '') + rem); continue; }
    last.obs = clean((last.obs ? last.obs + ' · ' : '') + l.replace(/^(obs(erva[çc][ãa]o)?|nota)\s*[:.\-]?\s*/i, ''));
  }
  // bi-set com um item só não é bi-set
  out.sessoes.forEach(s => { const c = {}; s.itens.forEach(i => { if (i.bi) c[i.bi] = (c[i.bi] || 0) + 1; }); s.itens.forEach(i => { if (i.bi && c[i.bi] < 2) i.bi = 0; }); });
  out.sessoes = out.sessoes.filter(s => s.itens.length);
  return out;
}

// ---------- escolher exercício (janela de busca)
async function pick(cb) {
  const lb = await getLib(); const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = '<div class=box><input id=ps placeholder="Buscar exercício" autofocus><div id=pl class=list></div><button class=p id=pn>＋ Criar exercício novo</button> <button id=pc>Cancelar</button></div>'; document.body.appendChild(d);
  const draw = () => { const q = d.querySelector('#ps').value.toLowerCase(); d.querySelector('#pl').innerHTML = lb.filter(x => (x.name + ' ' + x.muscle_group).toLowerCase().includes(q)).slice(0, 40)
    .map(x => `<div class=row data-id=${x.id}>${im(x.image_path)}<div><b>${esc(x.name)}</b><br><small class=muted>${esc(x.muscle_group)}</small></div></div>`).join(''); };
  d.querySelector('#ps').oninput = draw; draw();
  d.querySelector('#pc').onclick = () => d.remove();
  d.querySelector('#pn').onclick = () => { const n = d.querySelector('#ps').value; d.remove(); createEx(cb, n); };
  d.querySelector('#pl').onclick = e => { const r = e.target.closest('.row'); if (!r) return; d.remove(); cb(lb.find(x => x.id == r.dataset.id)); };
}
const linkOf = tk => location.origin + location.pathname + '#/a/' + tk;

// ---------- importar ficha
async function imp() {
  app.innerHTML = `<h2>Importar ficha</h2><p class=muted>Cole o treino do aluno do jeito que você escreve. O app separa os treinos (A, B, C…), reconhece os exercícios e mostra o desenho. Depois você salva para o aluno.</p>
  <textarea id=t placeholder="NOME DO ALUNO&#10;&#10;TREINO A&#10;1. Supino reto&#10;2. Remada baixa"></textarea><button class=p id=go>Reconhecer exercícios</button><div id=r></div>`;
  $('#go').onclick = async () => {
    const f = parseFicha($('#t').value); const lb = await getLib(); const byId = Object.fromEntries(lb.map(x => [x.id, x]));
    if (!f.sessoes.length) return $('#r').innerHTML = '<p class=warn>Não encontrei exercícios. Escreva um por linha, com séries e repetições (ex.: "Supino reto 4x10").</p>';
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
      if (f.auto) h += `<p class=warn>Não encontrei “TREINO A / B…” no texto, então separei os treinos pelas linhas em branco (${f.sessoes.length} treino${f.sessoes.length > 1 ? 's' : ''}). Se ficou errado, escreva “TREINO A”, “TREINO B”… antes de cada um e toque em Reconhecer de novo.</p>`;
      f.sessoes.forEach((s, si) => { h += `<h2>${esc(s.nome)}${s.foco ? ' — ' + esc(s.foco) : ''}</h2>${s.obs ? `<p class=dnote>📌 ${esc(s.obs)}</p>` : ''}`;
        s.itens.forEach((it, ii) => { const ob = `<br><small class=alvo>${it.sets} × ${esc(it.reps || '—')} · pausa ${it.rest || f.rd || 60}s</small>` + (it.obs ? `<br><small class=muted>${esc(it.obs)}</small>` : ''); const bi = it.bi ? '<span class="tag bi">bi-set</span> ' : '';
          if (it.tipo === 'cardio') { h += `<div class=row>${it.ex ? `<img src="${esc(it.ex.image_path)}" alt="">` : ''}<div>⏱ <b>Cardio</b>${it.ex ? ' — ' + esc(it.ex.name.replace(/^Cardio:\s*/, '')) : ''}<br><small class=muted>${esc(it.texto)}</small></div></div>`; return; }
          tot++;
          if (it.ex) h += `<div class=row>${im(it.ex.image_path)}<div>${bi}<b>${esc(it.texto)}</b><br><small class=muted>→ ${esc(it.ex.name)}</small>${ob}<br><button class=sm data-pk="${si},${ii}">Trocar</button> <button class=sm data-vx=${it.ex.id}>🎬 Vídeo</button></div></div>`;
          else { rev++; h += `<div class=row><div>${bi}<b>${esc(it.texto)}</b><br><small class=warn>Sem desenho${it.sug ? ' (parecido: ' + esc(it.sug.name) + ')' : ''}</small>${ob}<br><button class="sm p" data-pk="${si},${ii}">Escolher exercício</button> <button class=sm data-cr="${si},${ii}">＋ Criar novo</button></div></div>`; } }); });
      $('#r').innerHTML = `<p class=muted>${f.sessoes.length} treinos · ${tot} exercícios · ${rev} sem desenho</p>` + h + '<button class=p id=sv>Salvar para o aluno</button><p id=sm></p>';
      $('#r').querySelectorAll('[data-vx]').forEach(b => b.onclick = () => exModal(lb.find(x => x.id == b.dataset.vx)));
      $('#r').querySelectorAll('[data-cr]').forEach(b => b.onclick = () => { const [si, ii] = b.dataset.cr.split(',').map(Number); f.aluno = $('#an').value; f.rd = +$('#rd').value || 60; createEx(e => { f.sessoes[si].itens[ii].ex = e; view(); }, f.sessoes[si].itens[ii].busca); });
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
      const w = await sb.from('workouts').insert({ trainer_id: uid, student_id: st.id, name: s.nome + (s.foco ? ' — ' + s.foco : ''), position: si, day_note: s.obs || null, raw_text: s.itens.map(i => i.texto).join('\n') }).select('id').single(); if (w.error) throw w.error;
      const blocks = []; s.itens.forEach(it => { const last = blocks[blocks.length - 1];
        if (it.bi && last && last.bi === it.bi) last.items.push(it); else blocks.push({ bi: it.bi, tipo: it.tipo, items: [it] }); });
      const br = await sb.from('workout_blocks').insert(blocks.map((b, i) => ({ workout_id: w.data.id, position: i, set_type: b.tipo === 'cardio' ? 'cardio' : b.bi ? 'biset' : 'normal', sets: b.tipo === 'cardio' ? null : Math.max(...b.items.map(i => i.sets || 3)), rest_seconds: b.tipo === 'cardio' ? null : (b.items.map(i => i.rest).find(Boolean) || rd) }))).select('id,position'); if (br.error) throw br.error;
      const rows = []; blocks.forEach((b, i) => { const id = br.data.find(x => x.position === i).id;
        b.items.forEach((it, k) => rows.push({ block_id: id, position: k, exercise_id: it.ex ? it.ex.id : null, raw_text: it.texto, note: it.obs || null, reps: it.reps || null, kind: it.tipo, needs_review: !it.ex })); });
      const ir = await sb.from('block_items').insert(rows); if (ir.error) throw ir.error;
    }
    msg.innerHTML = `<span class=ok>Treino salvo!</span> <button class=p id=op>Abrir aluno e enviar link</button>`; $('#op').onclick = () => { show('stu'); aluno(st.id); };
  } catch (e) { msg.innerHTML = `<span class=err>${esc(e.message)}</span>`; }
}

// ---------- alunos (treinador)
async function students() {
  app.innerHTML = '<h2>Alunos</h2><div id=ls>Carregando…</div>';
  const [{ data: all, error }, { data: ses }, { data: ups }] = await Promise.all([sb.from('students').select('id,name,active,created_at,plan_end,code').order('name'),
    sb.from('workout_sessions').select('student_id,started_at,rating,comment,workouts(name),students(name)').order('started_at', { ascending: false }).limit(300),
    sb.from('student_uploads').select('student_id,kind,created_at,students(name)').eq('uploaded_by', 'aluno').order('created_at', { ascending: false }).limit(5)]);
  if (error) return $('#ls').innerHTML = `<p class=err>${esc(error.message)}</p>`;
  const data = all.filter(s => s.active !== false), arch = all.filter(s => s.active === false);
  const last = {}; (ses || []).forEach(z => { if (!last[z.student_id]) last[z.student_id] = z; });
  const dias = d => Math.floor((Date.now() - new Date(d)) / 864e5);
  let h = '';
  const left = d => d ? Math.ceil((new Date(d + 'T23:59:59') - Date.now()) / 864e5) : null;
  const att = []; data.forEach(s => { const l = last[s.id], d = l ? dias(l.started_at) : null, pl = left(s.plan_end);
    if (pl !== null && pl <= 7) att.push(`<div class=fb data-id=${s.id}><b>${esc(s.name)}</b> <small class=warn>${pl < 0 ? 'plano vencido' : pl === 0 ? 'plano vence hoje' : `plano vence em ${pl} dia${pl === 1 ? '' : 's'}`}</small></div>`);
    if (l && d > 7) att.push(`<div class=fb data-id=${s.id}><b>${esc(s.name)}</b> <small class=warn>sem treinar há ${d} dias</small></div>`); });
  if (att.length) h += '<div class=box2><b>⚠ Precisam de atenção</b>' + att.join('') + '</div>';
  const fb = (ses || []).slice(0, 6);
  if ((ups || []).length) h += '<div class=box2><b>Arquivos novos dos alunos</b>' + ups.map(u => `<div class=fb data-id=${u.student_id}><b>${esc(u.students?.name || '')}</b> <small class=muted>${esc(KINDS[u.kind] || 'Arquivo')} · ${new Date(u.created_at).toLocaleDateString('pt-BR')}</small></div>`).join('') + '</div>';
  if (fb.length) h += '<div class=box2><b>Atividade recente</b>' + fb.map(z => `<div class=fb data-id=${z.student_id}><b>${esc(z.students?.name || '')}</b> <small class=muted>${esc((z.workouts?.name || '').split(' — ')[0])} · ${new Date(z.started_at).toLocaleDateString('pt-BR')}</small>${z.rating ? ' <span class=star>' + '★'.repeat(z.rating) + '</span>' : ''}${z.comment ? `<br><small class=pre>“${esc(z.comment)}”</small>` : ''}</div>`).join('') + '</div>';
  h += data.length ? data.map(s => { const l = last[s.id], d = l ? dias(l.started_at) : null;
    return `<div class="row click" data-id=${s.id}><div><b>${esc(s.name)}</b><br><small class="${d === null || d > 7 ? 'warn' : 'muted'}">${l ? (d === 0 ? 'Treinou hoje' : `Último treino há ${d} dia${d === 1 ? '' : 's'}`) : 'Ainda não treinou'}</small>${s.plan_end ? `<br><small class=muted>Plano até ${dbr(s.plan_end)}</small>` : ''}</div></div>`; }).join('') : '<p class=muted>Nenhum aluno ainda. Vá em “Importar ficha”, cole o treino e salve.</p>';
  if (arch.length) h += `<details class=arch><summary>Alunos arquivados (${arch.length})</summary>${arch.map(s => `<div class="row click" data-id=${s.id}><div><b>${esc(s.name)}</b><br><small class=muted>Arquivado · toque para ver ou reativar</small></div></div>`).join('')}</details>`;
  $('#ls').innerHTML = h;
  $('#ls').onclick = e => { const r = e.target.closest('[data-id]'); if (r) aluno(r.dataset.id); };
}
async function aluno(id) {
  app.innerHTML = 'Carregando…'; const lbq = await getLib();
  const [s, w, h, ev, bm] = await Promise.all([
    sb.from('students').select('*').eq('id', id).single(),
    sb.from('workouts').select('id,name,position,day_note,workout_blocks(id,position,set_type,sets,rest_seconds,block_items(id,position,raw_text,note,reps,kind,exercise_id,exercises(name,image_path)))').eq('student_id', id).eq('active', true).order('position'),
    sb.from('workout_sessions').select('id,trainer_reply,started_at,rating,comment,workouts(name),set_logs(set_number,reps,load_kg,block_items(raw_text))').eq('student_id', id).order('started_at', { ascending: false }).limit(10),
    sb.from('set_logs').select('load_kg,reps,created_at,block_items(raw_text,exercises(name)),workout_sessions!inner(student_id)').eq('workout_sessions.student_id', id).not('load_kg', 'is', null).order('created_at').limit(3000),
    sb.from('body_measurements').select('*').eq('student_id', id).order('measured_on')]);
  if (s.error) return app.innerHTML = `<p class=err>${esc(s.error.message)}</p>`;
  const st = s.data, url = linkOf(st.token);
  let x = `<button id=bk>← Alunos</button><h2>${esc(st.name)}</h2>${st.code ? `<p class=muted>ID do aluno: <b>${esc(st.code)}</b> <small>(só identificação, não dá acesso)</small></p>` : ''}${st.active === false ? '<p class=warn>Aluno arquivado — o link está desativado. <button class=sm id=react>Reativar</button></p>' : ''}
   <div class=box2><b>Link do aluno</b><input readonly id=lk value="${esc(url)}"><button class=p id=cp>Copiar link</button> <a class=btn href="https://wa.me/?text=${encodeURIComponent('Oi! Seu treino está aqui: ' + url)}" target=_blank>Enviar no WhatsApp</a>
   <p class=muted>O aluno abre esse link no celular, sem senha. Dica: “Adicionar à tela inicial” para virar app.</p><button class=sm id=nl>Gerar novo link (invalida o anterior)</button></div>`;
  x += `<div class=box2><b>Recado para o aluno</b> <small class=muted>(aparece na tela inicial dele)</small><textarea id=msg placeholder="Ex.: Semana que vem trocamos a ficha. Bom treino!">${esc(st.message || '')}</textarea><button class=p id=ms>Salvar recado</button></div>`;
  x += `<div class=box2><b>Plano</b><div class=bar2><input id=pn placeholder="Nome do plano (opcional)" value="${esc(st.plan_name || '')}"><input id=pe type=date value="${esc(st.plan_end || '')}"></div><small class=muted>Data em que o plano acaba — você recebe o aviso na aba Alunos, e o aluno também.</small><br><button class=p id=ps>Salvar plano</button></div>`;
  const itemsById = {};
  (w.data || []).forEach(wo => { x += `<h2>${esc(wo.name)}</h2><p class="${wo.day_note ? 'dnote' : ''}">${wo.day_note ? '📌 ' + esc(wo.day_note) + ' ' : ''}<button class=sm data-dn=${wo.id}>${wo.day_note ? 'Editar observação do dia' : '＋ Observação do dia'}</button></p>`;
    wo.workout_blocks.sort((a, b) => a.position - b.position).forEach(b => b.block_items.sort((a, c) => a.position - c.position).forEach(i => { itemsById[i.id] = { i, b, wo };
      const alvo = i.kind === 'cardio' ? '' : `<br><small class=alvo>${b.sets || 3} × ${esc(i.reps || '—')} · pausa ${b.rest_seconds || 60}s</small>`;
      x += `<div class="row${b.set_type === 'biset' ? ' birow' : ''}">${im(i.exercises?.image_path)}<div>${b.set_type === 'biset' ? '<span class="tag bi">bi-set</span> ' : ''}<b>${esc(i.raw_text)}</b>${i.exercises ? `<br><small class=muted>→ ${esc(i.exercises.name)}</small>` : ''}${alvo}${i.note ? `<br><small class=muted>${esc(i.note)}</small>` : ''}<br>
      <button class=sm data-ed=${i.id}>✏️ Editar</button> ${i.kind === 'ex' ? `<button class=sm data-tr=${i.id}>Trocar</button> ` : ''}${i.exercise_id ? `<button class=sm data-vx=${i.exercise_id}>🎬 Vídeo</button> ` : ''}<button class=sm data-rm=${i.id}>Remover</button></div></div>`; }));
    x += `<button class=sm data-add=${wo.id} data-pos=${wo.workout_blocks.length}>＋ Adicionar exercício ao ${esc(wo.name.split(' — ')[0])}</button>`; });
  const evo = {}; (ev.data || []).forEach(l => { const n = l.block_items?.exercises?.name || l.block_items?.raw_text || '?'; const e = evo[n] || (evo[n] = { first: Number(l.load_kg), last: 0, best: 0, n: 0 }); e.last = Number(l.load_kg); e.best = Math.max(e.best, Number(l.load_kg)); e.n++; });
  const el = Object.entries(evo); if (el.length) x += '<h2>Evolução de cargas</h2><div class=box2><table class=evo><tr><th>Exercício</th><th>1ª</th><th>Última</th><th>Melhor</th></tr>' + el.map(([n, e]) => `<tr><td>${esc(n)}</td><td>${e.first}</td><td>${e.last} ${e.last > e.first ? '<span class=ok>▲</span>' : e.last < e.first ? '<span class=err>▼</span>' : ''}</td><td>${e.best}</td></tr>`).join('') + '</table><small class=muted>Cargas em kg.</small></div>';
  const ms = bm.data || [], f0 = ms[0];
  x += `<h2>Avaliações</h2><div class=box2><div class=mgrid><label>Data<input id=m_d type=date value="${new Date().toISOString().slice(0, 10)}"></label><label>Peso (kg)<input id=m_w inputmode=decimal></label><label>% gordura<input id=m_f inputmode=decimal></label><label>Cintura (cm)<input id=m_wa inputmode=decimal></label><label>Quadril (cm)<input id=m_h inputmode=decimal></label><label>Peito (cm)<input id=m_c inputmode=decimal></label><label>Braço (cm)<input id=m_a inputmode=decimal></label><label>Coxa (cm)<input id=m_t inputmode=decimal></label></div><button class=p id=mb>Salvar avaliação</button> <small id=mm class=muted></small>`;
  if (ms.length) x += '<div style="overflow:auto"><table class=evo><tr><th>Data</th><th>Peso</th><th>%G</th><th>Cint.</th><th>Quad.</th><th>Peit.</th><th>Braç.</th><th>Coxa</th><th></th></tr>' + [...ms].reverse().map(m => `<tr><td>${dbr(m.measured_on)}</td><td>${fmt(m.weight_kg)}${f0 && m.id !== f0.id && m.weight_kg != null && f0.weight_kg != null ? `<br><small class="${m.weight_kg < f0.weight_kg ? 'ok' : 'muted'}">${m.weight_kg - f0.weight_kg > 0 ? '+' : ''}${fmt(Math.round((m.weight_kg - f0.weight_kg) * 10) / 10)}</small>` : ''}</td><td>${fmt(m.body_fat_pct)}</td><td>${fmt(m.waist_cm)}</td><td>${fmt(m.hip_cm)}</td><td>${fmt(m.chest_cm)}</td><td>${fmt(m.arm_cm)}</td><td>${fmt(m.thigh_cm)}</td><td><button class=sm data-dm=${m.id}>×</button></td></tr>`).join('') + '</table></div>';
  x += `</div><h2>Arquivos e fotos</h2><div class=box2><b>Enviar para ${esc(st.name.split(' ')[0])}</b><select id=tk>${Object.entries(KINDS).map(([k, v]) => `<option value=${k}>${v}</option>`).join('')}</select><input id=tf type=file accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"><input id=tn placeholder="Observação (opcional)">
   <fieldset class=share><legend><b>Deixar visível para o aluno?</b></legend><label><input type=radio name=tsh value=1> Sim, o aluno também vê</label><label><input type=radio name=tsh value=0> Não, só eu vejo</label></fieldset><button class=p id=tsv>Enviar arquivo</button> <small id=tm></small>
   <div id=tl class=flist>Carregando…</div><small class=muted>Fotos, avaliações e laudos que o aluno marcar como “só eu vejo” não aparecem aqui — é escolha dele.</small></div>`;
  x += '<h2>Histórico</h2>' + ((h.data || []).length ? h.data.map(z => `<div class=row><div><b>${esc(z.workouts?.name || '')}</b> <small class=muted>${new Date(z.started_at).toLocaleString('pt-BR')}</small>${z.rating ? ' ' + '★'.repeat(z.rating) : ''}${z.comment ? `<br><small class=pre>${esc(z.comment)}</small>` : ''}${z.trainer_reply ? `<br><small class=ok>Você respondeu: ${esc(z.trainer_reply)}</small>` : ''}<br><button class=sm data-rp=${z.id}>${z.trainer_reply ? 'Editar resposta' : 'Responder'}</button><br><small class=muted>${(z.set_logs || []).filter(l => l.load_kg || l.reps).map(l => `${esc(l.block_items?.raw_text || '')} s${l.set_number}: ${l.load_kg ?? '-'}kg×${l.reps ?? '-'}`).join(' · ')}</small></div></div>`).join('') : '<p class=muted>O aluno ainda não registrou treinos.</p>');
  x += '<p><button id=dl class=danger>Arquivar aluno</button> <small class=muted>O link para de funcionar, mas nada é apagado. Dá para reativar.</small></p>'; app.innerHTML = x;
  app.querySelectorAll('[data-vx]').forEach(b => b.onclick = () => { const e = lbq.find(z => z.id == b.dataset.vx); if (e) exModal(e, () => {}); });
  app.querySelectorAll('[data-rp]').forEach(b => b.onclick = () => { const z = (h.data || []).find(q => q.id === b.dataset.rp);
    const d = mdl(`<h3>Responder ao aluno</h3>${z.comment ? `<p class=muted>“${esc(z.comment)}”</p>` : ''}<textarea id=rt>${esc(z.trainer_reply || '')}</textarea><p id=rm class=err></p><button class=p id=rs>Enviar resposta</button> <button id=rc>Cancelar</button>`);
    d.querySelector('#rc').onclick = d.close;
    d.querySelector('#rs').onclick = async () => { const t = d.querySelector('#rt').value.trim(); const r = await sb.from('workout_sessions').update({ trainer_reply: t || null, trainer_reply_at: t ? new Date().toISOString() : null }).eq('id', z.id); if (r.error) return d.querySelector('#rm').textContent = r.error.message; d.close(); aluno(id); }; });
  $('#ps').onclick = async () => { const r = await sb.from('students').update({ plan_name: $('#pn').value.trim() || null, plan_end: $('#pe').value || null }).eq('id', id); $('#ps').textContent = r.error ? 'Erro: ' + r.error.message : 'Plano salvo ✓'; };
  $('#mb').onclick = async () => { const row = { student_id: id, measured_on: $('#m_d').value || undefined, weight_kg: nz($('#m_w').value), body_fat_pct: nz($('#m_f').value), waist_cm: nz($('#m_wa').value), hip_cm: nz($('#m_h').value), chest_cm: nz($('#m_c').value), arm_cm: nz($('#m_a').value), thigh_cm: nz($('#m_t').value) };
    if ([row.weight_kg, row.body_fat_pct, row.waist_cm, row.hip_cm, row.chest_cm, row.arm_cm, row.thigh_cm].every(v => v == null)) return $('#mm').textContent = 'Preencha ao menos uma medida.';
    const r = await sb.from('body_measurements').insert(row); if (r.error) return $('#mm').textContent = r.error.message; aluno(id); };
  app.querySelectorAll('[data-dm]').forEach(b => b.onclick = async () => { if (confirm('Apagar esta avaliação?')) { await sb.from('body_measurements').delete().eq('id', b.dataset.dm); aluno(id); } });
  const drawFiles = async () => { const box = $('#tl'); if (!box) return;
    const { data: fsx, error: fe } = await sb.from('student_uploads').select('*').eq('student_id', id).order('created_at', { ascending: false }).limit(300);
    if (fe) return box.innerHTML = `<p class=err>${esc(fe.message)}</p>`;
    const rows = fsx || []; if (!rows.length) return box.innerHTML = '<p class=muted>Nenhum arquivo ainda.</p>';
    const { data: urls } = await sb.storage.from('student-files').createSignedUrls(rows.map(r => r.path), 3600); const m = Object.fromEntries((urls || []).filter(u => u.signedUrl).map(u => [u.path, u.signedUrl]));
    box.innerHTML = rows.map(r => fileCard(r, m[r.path], r.uploaded_by === 'treinador' ? `<button class=sm data-tsh=${r.id} data-v=${r.shared ? 0 : 1}>${r.shared ? 'Esconder do aluno' : 'Mostrar ao aluno'}</button> <button class=sm data-trm=${r.id}>Remover</button>` : '', r.uploaded_by === 'aluno' ? 'Enviado pelo aluno' : (r.shared ? 'Você enviou · aluno vê' : 'Você enviou · só você vê'))).join('');
    box.querySelectorAll('[data-tsh]').forEach(b => b.onclick = async () => { const r = await sb.from('student_uploads').update({ shared: b.dataset.v === '1' }).eq('id', b.dataset.tsh); if (r.error) return alert(r.error.message); drawFiles(); });
    box.querySelectorAll('[data-trm]').forEach(b => b.onclick = async () => { if (!confirm('Remover este arquivo da lista? Ele continua guardado com segurança.')) return; const r = await sb.from('student_uploads').update({ deleted_at: new Date().toISOString() }).eq('id', b.dataset.trm); if (r.error) return alert(r.error.message); drawFiles(); }); };
  drawFiles();
  $('#tsv').onclick = async () => { const f = $('#tf').files[0], m = $('#tm'), sh = app.querySelector('input[name=tsh]:checked');
    if (!f) return m.innerHTML = '<span class=err>Escolha um arquivo.</span>'; if (!sh) return m.innerHTML = '<span class=err>Escolha se o aluno pode ver.</span>';
    if (f.size > 25 * 1024 * 1024) return m.innerHTML = '<span class=err>Arquivo maior que 25 MB.</span>';
    $('#tsv').disabled = true; m.textContent = 'Enviando…';
    try { const { blob, name, type } = await prepFile(f); const path = `${id}/treinador/${crypto.randomUUID()}-${safeName(name)}`;
      const u = await sb.storage.from('student-files').upload(path, blob, { contentType: type }); if (u.error) throw u.error;
      const r = await sb.from('student_uploads').insert({ student_id: id, trainer_id: session.user.id, uploaded_by: 'treinador', kind: $('#tk').value, title: f.name.slice(0, 200), note: $('#tn').value.trim() || null, path, mime: type, size_bytes: blob.size, shared: sh.value === '1', status: 'ok' }); if (r.error) throw r.error;
      m.innerHTML = '<span class=ok>Enviado ✓</span>'; $('#tf').value = ''; $('#tn').value = ''; drawFiles(); } catch (er) { m.innerHTML = `<span class=err>${esc(er.message)}</span>`; } finally { $('#tsv').disabled = false; } };
  $('#ms').onclick = async () => { const r = await sb.from('students').update({ message: $('#msg').value.trim() || null }).eq('id', id); $('#ms').textContent = r.error ? 'Erro: ' + r.error.message : 'Recado salvo ✓'; };
  $('#nl').onclick = async () => { if (!confirm('Gerar um novo link? O link antigo deixa de funcionar e o aluno precisará do novo.')) return; const tk = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, ''); const r = await sb.from('students').update({ token: tk }).eq('id', id); if (r.error) return alert(r.error.message); aluno(id); };
  $('#bk').onclick = students; if ($('#react')) $('#react').onclick = async () => { const r = await sb.from('students').update({ active: true }).eq('id', id); if (r.error) return alert(r.error.message); aluno(id); }; $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(url); $('#cp').textContent = 'Copiado!'; } catch { $('#lk').select(); } };
  app.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => pick(async e => { await sb.from('block_items').update({ exercise_id: e.id, needs_review: false }).eq('id', b.dataset.tr); aluno(id); }));
  app.querySelectorAll('[data-ed]').forEach(bt => bt.onclick = () => { const { i, b } = itemsById[bt.dataset.ed]; const cardio = i.kind === 'cardio';
    const d = mdl(`<h3>${esc(i.raw_text)}</h3>${cardio ? '' : `<div class=mgrid><label>Séries<input id=e_s type=number inputmode=numeric min=1 max=10 value="${b.sets || 3}"></label><label>Repetições<input id=e_r placeholder="ex.: 8-12, 40s, falha" value="${esc(i.reps || '')}"></label><label>Pausa (segundos)<input id=e_p type=number inputmode=numeric min=0 max=900 value="${b.rest_seconds ?? 60}"></label></div>${b.set_type === 'biset' ? '<p class=muted>Bi-set: séries e pausa valem para os dois exercícios.</p>' : ''}`}<label class=muted>${cardio ? 'Descrição do cardio (ex.: 4x 20s / 10s de pausa)' : 'Nome como o aluno vê'}</label><input id=e_t value="${esc(i.raw_text)}"><label class=muted>Observação do exercício (o aluno vê)</label><textarea id=e_n style="min-height:80px">${esc(i.note || '')}</textarea><p id=e_m class=err></p><button class=p id=e_ok>Salvar</button> <button id=e_c>Cancelar</button>`);
    d.querySelector('#e_c').onclick = d.close;
    d.querySelector('#e_ok').onclick = async () => { const q = z => d.querySelector(z); const t = q('#e_t').value.trim(); if (!t) return q('#e_m').textContent = 'O nome não pode ficar vazio.';
      const r1 = await sb.from('block_items').update({ raw_text: t, note: q('#e_n').value.trim() || null, ...(cardio ? {} : { reps: q('#e_r').value.trim() || null }) }).eq('id', i.id); if (r1.error) return q('#e_m').textContent = r1.error.message;
      if (!cardio) { const sets = Math.max(1, Math.min(10, parseInt(q('#e_s').value) || 3)), rs = Math.max(0, Math.min(900, parseInt(q('#e_p').value) || 0)); const r2 = await sb.from('workout_blocks').update({ sets, rest_seconds: rs }).eq('id', b.id); if (r2.error) return q('#e_m').textContent = r2.error.message; }
      d.close(); aluno(id); }; });
  app.querySelectorAll('[data-dn]').forEach(bt => bt.onclick = () => { const wo = (w.data || []).find(z => z.id === bt.dataset.dn);
    const d = mdl(`<h3>Observação do dia — ${esc(wo.name.split(' — ')[0])}</h3><p class=muted>Vale para o treino inteiro. O aluno vê abaixo do nome do treino, antes de começar.</p><textarea id=dn_t placeholder="Ex.: fase excêntrica lenta de 3s em membros superiores e 5s em inferiores">${esc(wo.day_note || '')}</textarea><p id=dn_m class=err></p><button class=p id=dn_ok>Salvar</button> <button id=dn_c>Cancelar</button>`);
    d.querySelector('#dn_c').onclick = d.close;
    d.querySelector('#dn_ok').onclick = async () => { const r = await sb.from('workouts').update({ day_note: d.querySelector('#dn_t').value.trim() || null }).eq('id', wo.id); if (r.error) return d.querySelector('#dn_m').textContent = r.error.message; d.close(); aluno(id); }; });
  app.querySelectorAll('[data-add]').forEach(bt => bt.onclick = () => pick(async e => { const wid = bt.dataset.add, wo = (w.data || []).find(z => z.id === wid); const pos = Math.max(-1, ...wo.workout_blocks.map(z => z.position)) + 1;
    const nb = await sb.from('workout_blocks').insert({ workout_id: wid, position: pos, set_type: 'normal', sets: 3, rest_seconds: 60 }).select('id').single(); if (nb.error) return alert(nb.error.message);
    const ni = await sb.from('block_items').insert({ block_id: nb.data.id, position: 0, exercise_id: e.id, raw_text: e.name, reps: '10', kind: 'ex', needs_review: false }); if (ni.error) return alert(ni.error.message); aluno(id); }));
  app.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (confirm('Remover este exercício do treino?')) { await sb.from('block_items').delete().eq('id', b.dataset.rm); aluno(id); } });
  $('#dl').onclick = async () => { if (!confirm(`Arquivar ${st.name}? O link dele para de funcionar, mas treinos, histórico, fotos e arquivos ficam guardados. Você pode reativar depois.`)) return; const r = await sb.from('students').update({ active: false }).eq('id', id); if (r.error) return alert(r.error.message); students(); };
}

// ---------- tela do aluno (sem login): treino do dia, exercício por exercício
async function studentView(token) {
  nav.innerHTML = ''; const { data: P, error } = await sb.rpc('student_plan', { p_token: token });
  if (error || !P) return app.innerHTML = '<h2>Link inválido</h2><p class=muted>Peça um novo link ao seu treinador.</p>';
  document.body.classList.add('aluno');
  const BR = P.brand || { name: 'DE HOJE' }; const hd = document.querySelector('header'); hd.querySelector('b').textContent = BR.name; document.title = BR.name;
  if (BR.logo && /^https:\/\//.test(BR.logo)) hd.querySelector('img').src = BR.logo;
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

  let lock = null;
  const wake = async () => { try { if (navigator.wakeLock && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch {} };
  const unwake = () => { try { lock && lock.release(); } catch {} lock = null; };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wk) wake(); });
  const pk = 'dh2_pending_' + token;
  const flush = async () => { let q = []; try { q = JSON.parse(localStorage.getItem(pk)) || []; } catch {} if (!q.length) return; const rest = [];
    for (const a of q) { try { const r = await sb.rpc('student_finish', a); if (r.error && !/inválido/.test(r.error.message)) rest.push(a); } catch { rest.push(a); } }
    try { localStorage.setItem(pk, JSON.stringify(rest)); } catch {} };
  window.addEventListener('online', flush); flush();

  // --- cronômetro de pausa (semicírculo)
  const LEN = Math.PI * 80;
  const stopRest = () => { rest = null; clearInterval(tick); tick = null; const r = $('#rest'); if (r) r.innerHTML = ''; };
  const paintRest = () => { const r = $('#rest'); if (!r) return; if (!rest) return r.innerHTML = ''; const iv = rest.kind !== 'rest';
    r.innerHTML = `<div class="restbox${rest.kind === 'work' ? ' work' : ''}">${rest.title ? `<b class=rtit>${esc(rest.title)}</b>` : ''}<svg viewBox="0 0 200 112" class=gauge><path d="M20 100 A80 80 0 0 1 180 100" class=gt /><path id=arc d="M20 100 A80 80 0 0 1 180 100" class=ga stroke-dasharray="${LEN} ${LEN}" /><text id=sec x=100 y=88 text-anchor=middle class=gs></text><text x=100 y=108 text-anchor=middle class=gl>${esc(rest.label)}</text></svg>
      <div class=rbtn><button data-r="-15">−15s</button><button data-r="skip">${iv ? 'Avançar' : 'Pular pausa'}</button><button data-r="15">+15s</button>${iv ? '<button data-r="stop">Parar</button>' : ''}</div></div>`;
    r.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const a = b.dataset.r; if (a === 'stop') return stopRest(); if (a === 'skip') { if (rest.onEnd) { const f = rest.onEnd; rest = null; return f(); } return stopRest(); }
      const d = +a * 1000; rest.end = Math.max(Date.now() + 1000, rest.end + d); rest.total = Math.max(5, rest.total + d / 1000); frame(); });
    frame(); };
  const frame = () => { if (!rest) return; const left = Math.max(0, rest.end - Date.now()), sec = Math.ceil(left / 1000); const t = $('#sec'), a = $('#arc'); if (t) t.textContent = sec; if (a) a.setAttribute('stroke-dasharray', `${LEN * Math.min(1, left / (rest.total * 1000))} ${LEN}`);
    if (left <= 0) { clearInterval(tick); tick = null; beep(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
      if (rest.onEnd) { const f = rest.onEnd; rest = null; return f(); }
      const r = $('#rest'); if (r) r.innerHTML = '<div class=restbox><b class=ok>Pausa concluída! Bora para a próxima série 💪</b></div>'; rest = null; setTimeout(() => { if (!rest && $('#rest')) $('#rest').innerHTML = ''; }, 3500); } };
  const startRest = (sec, o = {}) => { clearInterval(tick); rest = { end: Date.now() + sec * 1000, total: sec, label: o.label || 'segundos de pausa', title: o.title || '', kind: o.kind || 'rest', onEnd: o.onEnd || null }; paintRest(); tick = setInterval(frame, 250); };
  const runIntervals = (item, cfg) => { let r = 1;
    const work = () => startRest(cfg.work, { kind: 'work', title: `Rodada ${r} de ${cfg.n}`, label: 'segundos — execução', onEnd: () => {
      if (r >= cfg.n) { upd(o => { o['c' + item.id] = true; }); stopRest(); play(); const z = $('#rest'); if (z) z.innerHTML = '<div class=restbox><b class=ok>Intervalos concluídos! 🔥</b></div>'; return; }
      if (cfg.rest) startRest(cfg.rest, { kind: 'ivrest', title: `Rodada ${r} de ${cfg.n} feita`, label: 'segundos de pausa', onEnd: () => { r++; work(); } }); else { r++; work(); } } });
    work(); };

  // --- início: escolher o treino do dia
  const home = () => { stopRest(); wk = null; document.title = BR.name; unwake();
    let h = `<h2>Olá, ${esc(P.student.name.split(' ')[0])}</h2>`;
    if (!P.workouts.length) { app.innerHTML = h + '<p class=muted>Seu treino ainda não foi cadastrado.</p>'; return; }
    const now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), dow = (d0.getDay() + 6) % 7, mon = new Date(d0); mon.setDate(d0.getDate() - dow);
    const ss = (P.sessions || []).map(x => new Date(x)), wkc = ss.filter(x => x >= mon).length, m30 = ss.filter(x => now - x < 30 * 864e5).length;
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((l, n) => { const a = new Date(mon); a.setDate(mon.getDate() + n); const b = new Date(a); b.setDate(a.getDate() + 1); const did = ss.some(x => x >= a && x < b); return `<span class="dot${did ? ' on' : ''}${n === dow ? ' today' : ''}">${l}</span>`; }).join('');
    h += `<div class=week><div class=dots>${days}</div><small class=muted><b>${wkc}</b> treino${wkc === 1 ? '' : 's'} esta semana · <b>${m30}</b> nos últimos 30 dias</small></div>`;
    if (P.student.message) h += `<div class=msg><b>Recado do treinador</b><p class=pre>${esc(P.student.message)}</p></div>`;
    (P.replies || []).slice(0, 2).forEach(r => { h += `<div class=msg><small class=muted>Resposta do treinador · ${new Date(r.at).toLocaleDateString('pt-BR')}</small><p class=pre>${esc(r.text)}</p></div>`; });
    const pl = P.plan_end ? Math.ceil((new Date(P.plan_end + 'T23:59:59') - Date.now()) / 864e5) : null;
    if (pl !== null && pl <= 7) h += `<div class=msg><b>${pl < 0 ? 'Seu plano venceu' : pl === 0 ? 'Seu plano vence hoje' : `Seu plano termina em ${pl} dia${pl === 1 ? '' : 's'}`}</b><p>Fale com seu treinador para renovar e continuar evoluindo.</p></div>`;
    const ms = P.measures || []; if (ms.length) { const a = ms[0], z = ms[ms.length - 1], df = (k, u) => ms.length > 1 && a[k] != null && z[k] != null ? ` (${z[k] - a[k] > 0 ? '+' : ''}${String(Math.round((z[k] - a[k]) * 10) / 10).replace('.', ',')} ${u})` : '';
      const parts = []; if (z.weight != null) parts.push(`Peso <b>${String(z.weight).replace('.', ',')} kg</b>${df('weight', 'kg')}`); if (z.waist != null) parts.push(`Cintura <b>${String(z.waist).replace('.', ',')} cm</b>${df('waist', 'cm')}`); if (z.fat != null) parts.push(`Gordura <b>${String(z.fat).replace('.', ',')}%</b>${df('fat', '%')}`);
      if (parts.length) h += `<div class=week><b>Seu progresso</b><br><small>${parts.join('<br>')}</small></div>`; }
    h += '<p class=muted>Qual treino você vai fazer hoje?</p>';
    P.workouts.forEach(w => { const o = ld(w.id), p = w.name.split(' — ');
      const nEx = stepsOf(w).length;
      h += `<div class=wcard><div class=wc1><div><b>${esc(p[0])}</b><br><small class=muted>${esc(p.slice(1).join(' — '))}${p.length > 1 ? ' · ' : ''}${nEx} exercício${nEx === 1 ? '' : 's'}</small></div><button class=p data-w=${w.id}>${o.started ? 'Continuar' : 'Começar'}</button></div>${w.day_note ? `<p class=dnote>📌 ${esc(w.day_note)}</p>` : ''}</div>`; });
    if (P.student.notes) h += `<details><summary>Orientações do treinador</summary><p class=pre>${esc(P.student.notes)}</p></details>`;
    h += `<div class=wcard><div class=wc1><div><b>📁 Meus arquivos</b><br><small class=muted>Fotos de progresso, avaliações, laudos e exames</small></div><button data-files>Abrir</button></div></div>`;
    if (BR.phone) h += `<p><a class=btn href="https://wa.me/${esc(BR.phone)}" target=_blank rel=noopener>💬 Falar com meu treinador</a></p>`;
    if (P.student.code) h += `<p class=muted><small>Seu ID: <b>${esc(P.student.code)}</b></small></p>`;
    h += '<p class=muted style="margin-top:18px"><small>Dica: no menu do navegador, toque em “Adicionar à tela inicial” para abrir como um app. As cargas ficam salvas mesmo sem internet.</small></p>';
    app.innerHTML = h; app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => start(b.dataset.w)); app.querySelector('[data-files]').onclick = files; };

  // --- meus arquivos (o aluno escolhe se o treinador vê)
  const callF = async body => { const { data, error } = await sb.functions.invoke('student-files', { body: { token, ...body } });
    if (error) { let m = error.message; try { const c = await error.context?.json(); if (c?.error) m = c.error; } catch {} if (/Failed to fetch|NetworkError|Load failed/i.test(m)) m = 'Sem internet agora. Tente de novo quando a conexão voltar.'; throw new Error(m); }
    if (data?.error) throw new Error(data.error); return data; };
  const files = async () => { stopRest(); wk = null; unwake(); window.scrollTo(0, 0);
    app.innerHTML = `<div class=ptop><button data-home aria-label=Início>←</button><b>Meus arquivos</b><span></span></div>
      <div class=box2><b>Enviar arquivo ou foto</b><label class=muted>Tipo</label><select id=fk>${Object.entries(KINDS).map(([k, v]) => `<option value=${k}>${v}</option>`).join('')}</select>
      <input id=ff type=file accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"><label class=muted>Data</label><input id=fd type=date value="${new Date().toISOString().slice(0, 10)}"><input id=fn placeholder="Observação (opcional)">
      <fieldset class=share><legend><b>Deixar visível para o seu treinador?</b></legend><label><input type=radio name=sh value=1> Sim, meu treinador pode ver</label><label><input type=radio name=sh value=0> Não, só eu vejo</label></fieldset>
      <button class=p id=fs>Enviar</button> <small id=fm></small><p class=muted><small>Você pode mudar essa escolha depois em cada arquivo. Tamanho máximo: 25 MB.</small></p></div><div id=fl>Carregando…</div>`;
    app.querySelector('[data-home]').onclick = home;
    const list = async () => { const box = $('#fl'); try { const { files: fs } = await callF({ action: 'list' }); const mine = fs.filter(f => f.uploaded_by === 'aluno'), tr = fs.filter(f => f.uploaded_by === 'treinador');
        let h = '<h3>Enviados por você</h3>' + (mine.length ? mine.map(f => fileCard(f, f.url, `<button class=sm data-sh=${f.id} data-v=${f.shared ? 0 : 1}>${f.shared ? 'Deixar só para mim' : 'Mostrar ao treinador'}</button> <button class=sm data-rm=${f.id}>Remover</button>`, f.shared ? '👁 Seu treinador vê' : '🔒 Só você vê')).join('') : '<p class=muted>Nada enviado ainda.</p>');
        if (tr.length) h += '<h3>Do seu treinador</h3>' + tr.map(f => fileCard(f, f.url, '', 'Enviado pelo treinador')).join('');
        box.innerHTML = h;
        box.querySelectorAll('[data-sh]').forEach(b => b.onclick = async () => { b.disabled = true; try { await callF({ action: 'share', id: b.dataset.sh, shared: b.dataset.v === '1' }); list(); } catch (e) { alert(e.message); b.disabled = false; } });
        box.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (!confirm('Remover este arquivo da sua lista? Ele fica guardado com segurança e não é apagado.')) return; try { await callF({ action: 'remove', id: b.dataset.rm }); list(); } catch (e) { alert(e.message); } });
      } catch (e) { box.innerHTML = `<p class=err>${esc(e.message)}</p>`; } };
    list();
    $('#fs').onclick = async () => { const f = $('#ff').files[0], m = $('#fm'), sh = app.querySelector('input[name=sh]:checked');
      if (!f) return m.innerHTML = '<span class=err>Escolha um arquivo ou foto.</span>';
      if (!sh) return m.innerHTML = '<span class=err>Responda se o seu treinador pode ver.</span>';
      if (f.size > 25 * 1024 * 1024) return m.innerHTML = '<span class=err>Arquivo maior que 25 MB.</span>';
      $('#fs').disabled = true; m.textContent = 'Enviando…';
      try { const { blob, name, type } = await prepFile(f);
        const r = await callF({ action: 'upload', kind: $('#fk').value, name, title: f.name, mime: type, size: blob.size, shared: sh.value === '1', note: $('#fn').value.trim(), taken_on: $('#fd').value });
        const u = await sb.storage.from('student-files').uploadToSignedUrl(r.path, r.token, blob, { contentType: type }); if (u.error) throw new Error(u.error.message);
        await callF({ action: 'confirm', id: r.id });
        m.innerHTML = '<span class=ok>Enviado e salvo ✓</span>'; $('#ff').value = ''; $('#fn').value = ''; app.querySelectorAll('input[name=sh]').forEach(x => x.checked = false); list();
      } catch (e) { m.innerHTML = `<span class=err>Não foi enviado: ${esc(e.message)}</span>`; } finally { $('#fs').disabled = false; } }; };
  const start = id => { wk = P.workouts.find(w => w.id === id); steps = stepsOf(wk); const o = ld(id); idx = Math.min(o.idx || 0, steps.length); upd(o => { o.started = true; o.t0 = o.t0 || Date.now(); }); wake(); play(); };
  const go = n => { idx = Math.max(0, Math.min(steps.length, n)); upd(o => { o.idx = idx; }); play(); window.scrollTo(0, 0); };

  // --- um exercício por vez (bi-set: os dois juntos)
  const stepDone = (n, st) => { const x = steps[n]; if (!x) return false; if (x.cardio) return !!st['c' + x.items[0].id]; for (let k = 1; k <= x.sets; k++) if (!st[`d_${n}_${k}`]) return false; return true; };
  const stepPart = (n, st) => { const x = steps[n]; if (!x || x.cardio) return false; for (let k = 1; k <= x.sets; k++) if (st[`d_${n}_${k}`]) return true; return false; };
  const alvo = (s, i) => `${s.sets} série${s.sets > 1 ? 's' : ''} × ${esc(i.reps || '—')}${/^\d+(-\d+)?$/.test(i.reps || '') ? ' reps' : ''} · pausa ${s.rest}s`;
  const play = () => {
    if (idx >= steps.length) return finish();
    const s = steps[idx], st = ld(wk.id), p = wk.name.split(' — ');
    let h = `<div class=ptop><button data-home aria-label=Início>←</button><b>${esc(p[0])}</b><span class=muted>${idx + 1} / ${steps.length}</span></div>
      <div class=segs>${steps.map((x, n) => `<button class="seg${stepDone(n, st) ? ' on' : stepPart(n, st) ? ' part' : ''}${n === idx ? ' cur' : ''}${x.biset ? ' bi' : ''}" data-g=${n} aria-label="Exercício ${n + 1}"></button>`).join('')}</div>
      <div class=acts><button class="sm danger" data-cancel>Cancelar treino</button><button class="sm p" data-fin>Finalizar treino</button></div><div id=rest></div>`;
    if (s.cardio) { const i = s.items[0], iv = intervalOf(i.text) || intervalOf(i.note);
      h += `<div class=exv><h3>⏱ Cardio</h3>${i.exercise ? `<p><b>${esc(i.exercise.name.replace(/^Cardio:\s*/, ''))}</b></p><img src="${esc(i.exercise.image)}" alt="">` : ''}<p>${esc(i.text)}</p>${i.note ? `<p class=muted>${esc(i.note)}</p>` : ''}
        ${iv ? `<p class=alvo>${iv.n} rodadas · ${iv.work}s de execução${iv.rest ? ` · ${iv.rest}s de pausa` : ''}</p><button class=p data-iv>▶ Iniciar intervalos</button>` : ''}
        <label class=chk><input type=checkbox data-c=${i.id} ${st['c' + i.id] ? 'checked' : ''}> Cardio concluído</label></div>`; }
    else {
      s.items.forEach((i, ix) => { const ex = i.exercise;
        h += `<div class="exv${s.biset ? ' bi' : ''}">${s.biset ? `<span class="tag bi">Bi-set · exercício ${'ABC'[ix] || ix + 1}</span>` : ''}<h3>${esc(i.text)}</h3>${ex ? `${im(ex.image, ex.name)}<small class=muted>${esc(ex.name)}</small>` : ''}<p class=alvo>${alvo(s, i)}</p>${i.video?.url && /^https?:\/\//i.test(i.video.url) ? `<a class="btn vid" href="${esc(i.video.url)}" target=_blank rel=noopener>▶ Ver vídeo</a>` : ''}${i.video?.note ? `<p class=tnote>💬 ${esc(i.video.note)}</p>` : ''}${i.note ? `<p class=inote>${esc(i.note)}</p>` : ''}${i.last ? `<p class=muted>Última vez: ${i.last.load ?? '-'} kg × ${i.last.reps ?? '-'}</p>` : ''}${ex?.how_to ? `<details><summary>Como fazer</summary><p>${esc(ex.how_to)}</p></details>` : ''}</div>`; });
      const hasLast = s.items.some(i => i.last);
      h += `<div class="sets${s.biset ? ' bi' : ''}"><b>Séries</b>${hasLast ? ' <button class=sm data-rep>Repetir última vez</button>' : ''}${s.biset ? ' <small class=muted>(faça A e B em sequência, depois marque ✓ e descanse)</small>' : ''}`;
      for (let k = 1; k <= s.sets; k++) { const dn = st[`d_${idx}_${k}`];
        h += `<div class="setrow${dn ? ' done' : ''}"><span class=sn>${k}</span><div class=ins>${s.items.map((i, ix) => `<div class=pair>${s.biset ? `<small>${'ABC'[ix] || ix + 1}</small>` : ''}<label class=fl><input inputmode=decimal placeholder="${esc(i.last?.load ?? '')}" data-i=${i.id} data-s=${k} data-f=load value="${esc(st[`${i.id}_${k}_load`] || '')}"><span>kg</span></label><label class=fl><input inputmode=numeric placeholder="${esc(i.reps || '')}" data-i=${i.id} data-s=${k} data-f=reps value="${esc(st[`${i.id}_${k}_reps`] || '')}"><span>reps</span></label></div>`).join('')}</div><button class="okb${dn ? ' on' : ''}" data-d=${k} aria-label="Série ${k} feita">✓</button></div>`; }
      h += '</div>';
      h += `<details class=anot${s.items.some(i => st['n_' + i.id]) ? ' open' : ''}><summary>📝 Minhas anotações ${s.items.some(i => st['n_' + i.id]) ? '✓' : ''}</summary><small class=muted>Seu treinador vai ver.</small>${s.items.map((i, ix) => `<textarea data-n=${i.id} placeholder="${s.biset ? 'Exercício ' + ('ABC'[ix] || ix + 1) + ': ' : ''}Ex.: senti o ombro, aumentei a carga…">${esc(st['n_' + i.id] || '')}</textarea>`).join('')}</details>`; }
    h += `<div class=pbar><button data-prev ${idx ? '' : 'disabled'}>‹ Anterior</button><button data-skip>Pular</button><button class=p data-next>${idx === steps.length - 1 ? 'Concluir ›' : 'Próximo ›'}</button></div>`;
    app.innerHTML = h; paintRest();
    app.querySelector('[data-home]').onclick = home; app.querySelector('[data-prev]').onclick = () => go(idx - 1);
    app.querySelector('[data-next]').onclick = () => go(idx + 1); app.querySelector('[data-skip]').onclick = () => go(idx + 1);
    app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => go(+b.dataset.g));
    app.querySelector('[data-fin]').onclick = () => { stopRest(); upd(o => { o.idx = idx; }); finish(); };
    app.querySelector('[data-cancel]').onclick = () => { if (!confirm('Cancelar este treino? O que você marcou hoje será apagado e nada será enviado ao treinador.')) return; stopRest(); try { localStorage.removeItem(key(wk.id)); } catch {} home(); };
    app.querySelectorAll('input[data-i]').forEach(e => e.oninput = () => upd(o => { o[`${e.dataset.i}_${e.dataset.s}_${e.dataset.f}`] = e.value; }));
    app.querySelectorAll('textarea[data-n]').forEach(e => e.oninput = () => upd(o => { o['n_' + e.dataset.n] = e.value; }));
    const rp = app.querySelector('[data-rep]'); if (rp) rp.onclick = () => { upd(o => { s.items.forEach(i => { if (!i.last) return; for (let k = 1; k <= s.sets; k++) { if (!o[`${i.id}_${k}_load`] && i.last.load != null) o[`${i.id}_${k}_load`] = String(i.last.load); if (!o[`${i.id}_${k}_reps`] && i.last.reps != null) o[`${i.id}_${k}_reps`] = String(i.last.reps); } }); }); play(); };
    const ivb = app.querySelector('[data-iv]'); if (ivb) ivb.onclick = () => runIntervals(s.items[0], intervalOf(s.items[0].text) || intervalOf(s.items[0].note));
    app.querySelectorAll('input[data-c]').forEach(e => e.onchange = () => { upd(o => { o['c' + e.dataset.c] = e.checked; }); paintSegs(); });
    app.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const k = b.dataset.d; let now; upd(o => { now = !o[`d_${idx}_${k}`]; o[`d_${idx}_${k}`] = now; });
      b.classList.toggle('on', now); b.closest('.setrow').classList.toggle('done', now); paintSegs();
      if (now) { if (stepDone(idx, ld(wk.id)) && idx < steps.length - 1) startRest(s.rest, { title: 'Exercício concluído ✓ — descanse e vá para o próximo' }); else startRest(s.rest); } });
  };
  const paintSegs = () => { const st = ld(wk.id); app.querySelectorAll('.seg').forEach((b, n) => { b.classList.toggle('on', stepDone(n, st)); b.classList.toggle('part', !stepDone(n, st) && stepPart(n, st)); }); };

  // --- final
  const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; };
  const finish = () => { stopRest(); const o = ld(wk.id); let feitas = 0; Object.keys(o).forEach(k => { if (/^d_/.test(k) && o[k]) feitas++; });
    let vol = 0; const prs = []; wk.items.forEach(i => { if (i.kind === 'cardio') return; let mx = 0; for (let k = 1; k <= 12; k++) { const l = num(o[`${i.id}_${k}_load`]), r = num(o[`${i.id}_${k}_reps`]); vol += l * r; mx = Math.max(mx, l); } if (mx > 0 && i.best != null && mx > Number(i.best)) prs.push(`${i.exercise ? i.exercise.name : i.text}: ${mx} kg`); });
    const min = o.t0 ? Math.max(1, Math.round((Date.now() - o.t0) / 60000)) : null;
    app.innerHTML = `<div class=ptop><button data-back>←</button><b>Treino concluído?</b><span></span></div><div class=bar><i style="width:100%"></i></div>
      <div class=box2><div class=stats><div><b>${feitas}</b><small>séries</small></div><div><b>${Math.round(vol)}</b><small>kg levantados</small></div>${min ? `<div><b>${min}</b><small>min</small></div>` : ''}</div>${prs.length ? `<div class=pr>🏆 <b>Novo recorde!</b><br>${prs.map(esc).join('<br>')}</div>` : ''}<p><b>Como foi o treino de hoje?</b></p><div class=stars>${[1, 2, 3, 4, 5].map(n => `<button data-r=${n} class="${(o.rating || 0) >= n ? 'on' : ''}">★</button>`).join('')}</div>
      <textarea id=cm placeholder="${(o.rating || 0) && o.rating <= 2 ? 'Conte o que não foi bem (obrigatório para 1 ou 2 estrelas)' : 'Comentário (opcional)'}">${esc(o.comment || '')}</textarea><button class=p id=fin>Enviar e concluir</button><p id=fm></p></div>`;
    app.querySelector('[data-back]').onclick = () => go(Math.min(o.idx ?? steps.length - 1, steps.length - 1));
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { upd(z => { z.comment = $('#cm').value; z.rating = +b.dataset.r; }); finish(); });
    $('#cm').oninput = () => upd(z => { z.comment = $('#cm').value; });
    $('#fin').onclick = async () => { const z = ld(wk.id), logs = []; z.comment = $('#cm').value;
      if (!z.rating) return $('#fm').innerHTML = '<span class=err>Toque nas estrelas para dar uma nota ao treino.</span>';
      if (z.rating <= 2 && !String(z.comment || '').trim()) { $('#cm').focus(); return $('#fm').innerHTML = '<span class=err>Para nota 1 ou 2, escreva um comentário contando o que não foi bem.</span>'; }
      const notas = []; wk.items.forEach(i => { const t = String(z['n_' + i.id] || '').trim(); if (t) notas.push(`📝 ${i.exercise ? i.exercise.name : i.text}: ${t}`); });
      const comentario = [String(z.comment || '').trim(), ...notas].filter(Boolean).join('\n');
      wk.items.forEach(i => { if (i.kind === 'cardio') return; const n = Math.max(i.sets || 0, nsets(i.note || i.text), 10); for (let k = 1; k <= n; k++) { const l = z[`${i.id}_${k}_load`], r = z[`${i.id}_${k}_reps`]; if (l || r) logs.push({ item: i.id, set: k, load: l || '', reps: r || '' }); } });
      $('#fm').textContent = 'Enviando…'; $('#fin').disabled = true;
      if (!z.cid) { z.cid = crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ Math.random() * 16 >> c / 4).toString(16)); sv(wk.id, z); }
      const args = { p_token: token, p_workout: wk.id, p_rating: z.rating || 0, p_comment: comentario, p_logs: logs, p_client: z.cid };
      let r; try { r = await sb.rpc('student_finish', args); } catch (e) { r = { error: { message: 'network' } }; }
      let queued = false;
      if (r.error) { if (/inválido/.test(r.error.message)) { $('#fin').disabled = false; return $('#fm').innerHTML = `<span class=err>${esc(r.error.message)}</span>`; }
        try { const q = JSON.parse(localStorage.getItem(pk)) || []; q.push(args); localStorage.setItem(pk, JSON.stringify(q)); queued = true; } catch { return $('#fm').innerHTML = '<span class=err>Sem conexão. Tente novamente.</span>'; } }
      try { localStorage.removeItem(key(wk.id)); } catch {}
      unwake();
      const wpp = BR.phone && String(z.comment || '').trim() ? `https://wa.me/${encodeURIComponent(BR.phone)}?text=${encodeURIComponent(`🏋️ ${P.student.name} concluiu o ${wk.name.split(' — ')[0]} (${new Date().toLocaleDateString('pt-BR')})\nNota: ${'★'.repeat(z.rating)}${'☆'.repeat(5 - z.rating)}\nComentário: ${String(z.comment).trim()}`)}` : '';
      app.innerHTML = `<h2>Treino concluído! 💪</h2><p>Parabéns, ${esc(P.student.name.split(' ')[0])}!</p>${queued ? '<p class=warn>Sem internet agora: seu treino ficou guardado e será enviado ao treinador quando a conexão voltar.</p>' : '<p>Seu treinador já pode ver o seu resultado.</p>'}${wpp ? `<div class=msg><b>Enviar seu comentário no WhatsApp do treinador</b><p>Vamos abrir o WhatsApp com a mensagem pronta — é só tocar em <b>Enviar</b>.</p><a class="btn p wpp" href="${esc(wpp)}" target=_blank rel=noopener>💬 Abrir WhatsApp</a></div>` : ''}<button class=p id=hm>Voltar ao início</button>`;
      if (wpp) setTimeout(() => { try { window.open(wpp, '_blank'); } catch {} }, 400); $('#hm').onclick = () => { if (!queued) { P.sessions = [new Date().toISOString(), ...(P.sessions || [])]; } home(); }; };
  };
  home();
}
boot();
