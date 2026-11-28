// ---------- DE HOJE · treinos de corrida
// Reconhece a planilha de corrida (Semana X · Treino Y), separa cada treino em sequência
// e pinta cada trecho pela zona: aquecimento (verde), moderado/contínuo (amarelo),
// firme (laranja), tiro (vermelho), pausa (azul) e desaquecimento (cinza).

export const ZONAS = {
  aq: { nome: 'Aquecimento', cor: '#16A34A', txt: '#fff' },
  mod: { nome: 'Moderado / contínuo', cor: '#EAB308', txt: '#1f2937' },
  firme: { nome: 'Firme', cor: '#EA580C', txt: '#fff' },
  tiro: { nome: 'Tiro / intenso', cor: '#DC2626', txt: '#fff' },
  pausa: { nome: 'Pausa', cor: '#2563EB', txt: '#fff' },
  desaq: { nome: 'Desaquecimento', cor: '#9CA3AF', txt: '#1f2937' },
};
export const ORDEM = ['aq', 'mod', 'firme', 'tiro', 'pausa', 'desaq'];
export const MARCA = ' — Corrida'; // fica no nome do treino salvo (identifica os treinos de corrida)
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = s => String(s || '').replace(/^[\s|·,;:\-–—]+|[\s|·,;:\-–—]+$/g, '').replace(/\s{2,}/g, ' ');

// --- palavras de cada zona
const KW = {
  desaq: /desaquec|volta (a|à) calma|resfriamento|desacelera|soltura final/,
  aq: /aquec/,
  firme: /firme|limiar|\bz4\b|ritmo de prova|tempo run|progressiv|moderado\s*(a|-|\/)?\s*forte|forte\s*moderado|sub\s*maxim/,
  tiro: /\btiros?\b|sprint|\bforte\b|intens|maxim|rapid|\bz5\b|vo2|explosiv|\btiro/,
  pausa: /pausa|descanso|recupera|intervalo|parad[oa]|caminhad|caminhand|andando|\brec\b/,
  mod: /moderad|continu|\bleve\b|trote|trotand|confort|rodagem|regenerat|\bz[1-3]\b|\bcorrida\b|correr|soltinho|ritmo leve/,
};
export function zonaDe(t, pos = 'meio') {
  const s = norm(t);
  if (KW.desaq.test(s)) return 'desaq';
  if (KW.aq.test(s)) return 'aq';
  if (KW.firme.test(s)) return 'firme';
  if (KW.tiro.test(s)) return 'tiro';
  if (KW.pausa.test(s)) return pos === 'ini' ? 'aq' : pos === 'fim' ? 'desaq' : 'pausa';
  return 'mod';
}
const temZona = t => { const s = norm(t); return ORDEM.some(k => KW[k].test(s)); };

// --- tempo (segundos) e distância (metros) de um trecho
export function secOf(t) {
  const s = norm(t).replace(/\d{1,2}\s*[:'’]\s*\d{2}\s*(?:min)?\s*\/\s*km/g, ' ').replace(/(pace|ritmo)\s*(de\s*)?\d{1,2}\s*[:'’]\s*\d{2}/g, ' ');
  let m;
  if ((m = /(\d+(?:[.,]\d+)?)\s*h(?:oras?|r)?\b\s*(?:e\s*)?(?:(\d{1,2})\s*(?:min)?)?/.exec(s))) return Math.round(parseFloat(m[1].replace(',', '.')) * 3600 + (+m[2] || 0) * 60);
  if ((m = /(\d{1,3}(?:[.,]5)?)\s*min(?:utos?|s)?\b\.?(?:(\d{2})\b|\s*(?:e\s*)?(\d{1,2})\s*(?:s|seg|segundos?)\b)?/.exec(s))) return Math.round(parseFloat(m[1].replace(',', '.')) * 60) + (+m[2] || +m[3] || 0);
  if ((m = /(\d{1,3})\s*['’]\s*(?:(\d{1,2})\s*(?:["”]|''|s\b)?)?/.exec(s))) return +m[1] * 60 + (+m[2] || 0);
  if ((m = /\b(\d{1,2}):(\d{2})\b/.exec(s))) return +m[1] * 60 + +m[2];
  if ((m = /(\d{1,3})\s*(?:s|seg|segundos?|["”])(?![a-z])/.exec(s))) return +m[1];
  return 0;
}
export function distOf(t) {
  const m = /(\d+(?:[.,]\d+)?)\s*(km|k|m|metros?)(?![a-z])/i.exec(norm(t)); if (!m) return 0;
  const v = parseFloat(m[1].replace(',', '.')); return Math.round(/^k/i.test(m[2]) ? v * 1000 : v);
}
export const fmtSec = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return h ? `${h}h${String(m).padStart(2, '0')}` : x ? `${m}:${String(x).padStart(2, '0')}` : `${m} min`; };
const fmtDist = m => m >= 1000 ? String(Math.round(m / 100) / 10).replace('.', ',') + ' km' : m + ' m';

// --- cabeçalhos: "SEMANA 3 – TREINO 1", "Semana 3 / Dia 2", "S3T1", "TREINO 2 – SEMANA 4", "Treino 1" (dentro da semana atual)
const SEP = "[\\s\\-–—:|·.,/)]*";
const HTS = new RegExp(`^(?:treino|dia|sess[aã]o|corrida)\\s*(\\d{1,2})${SEP}(?:da\\s*)?semana\\s*(\\d{1,2})\\b${SEP}(.*)$`, 'i');
const HS = new RegExp(`^semana\\s*(\\d{1,2})\\b${SEP}(?:(?:treino|dia|sess[aã]o|corrida)\\s*(\\d{1,2})\\b)?${SEP}(.*)$`, 'i');
const HS2 = new RegExp(`^s\\s?(\\d{1,2})\\s*[-\\s]?\\s*t\\s?(\\d{1,2})\\b${SEP}(.*)$`, 'i');
const HT = new RegExp(`^(?:treino|dia|sess[aã]o|corrida)\\s*(\\d{1,2})\\b${SEP}(.*)$`, 'i');
const REP = /^(\d{1,2})\s*[x×]\s*(.+)$/i;
const LABEL = /^(parte principal|principal|bloco principal|treino principal|est[ií]mulo( principal)?|parte \d|bloco \d|s[ée]rie principal)\s*[:\-–—]\s*/i;
const strip = r => r.trim().replace(/\*\*/g, '').replace(/^[^\p{L}\p{N}(]+/u, '').replace(/^(\d{1,2})\s*[.)º°-]\s+/, '').trim();

// a ficha colada é de corrida?
export function ehCorrida(text) {
  const ls = String(text || '').split(/\r?\n/).map(strip).filter(Boolean);
  let run = 0, forca = 0, sem = false;
  ls.forEach(l => { const s = norm(l);
    if (/^semana\s*\d|^s\d{1,2}\s*-?\s*t\d/.test(s)) sem = true;
    const r = /corrida|correr|trote|\btiros?\b|\d\s*(km|k|m|metros?)(?![a-z])|pace|\/km|caminhad|rodagem|regenerat|desaquec|\bz[1-5]\b|firme|limiar|sprint|ritmo/.test(s);
    if (r) run++;
    else if (/\d\s*[x×]\s*\d+\s*(a|-|–)?\s*\d*\s*(reps?|repeti\w*)?\s*($|\||—|-|pausa)/.test(s) || /(supino|agachamento|remada|rosca|leg press|puxada|extensora|flexora|desenvolvimento|eleva[cç][aã]o)/.test(s)) forca++;
  });
  return run >= 2 && run > forca && (sem || run >= 3);
}

// separa um trecho de linha em partes (intervalado: estímulo + pausa)
function partesDe(body, n) {
  const raw = body.replace(/^\(|\)$/g, '').split(/\s*(?:\/|\+|;|\(|\)|,|\s[-–—]\s|\bcom\b|\be\b(?=\s+\d))\s*/i).map(clean).filter(Boolean);
  const partes = [];
  raw.forEach(p => { const tem = secOf(p) || distOf(p), rest = KW.pausa.test(norm(p));
    if (!partes.length || tem || rest) partes.push(p); else partes[partes.length - 1] += ' ' + p; });
  return partes.map((p, i) => { let z = zonaDe(p, 'meio');
    if (n > 1 && i === 0 && z === 'mod' && !KW.mod.test(norm(p))) z = 'tiro'; // "8x 1 min" = estímulo
    if (n > 1 && i > 0 && (z === 'mod' || z === 'aq')) z = 'pausa'; // no intervalado, o trote/caminhada entre os tiros é pausa
    return { zona: z, texto: p }; });
}

export function parseCorrida(text) {
  const out = { aluno: '', meta: [], geral: [], sessoes: [], corrida: true };
  let semana = 0, cur = null, semFoco = {}, started = false, mode = 'sess';
  const linhas = String(text || '').split(/\r?\n/), temCab = linhas.some(r => { const l = strip(r); return HTS.test(l) || HS.test(l) || HS2.test(l) || (HT.test(l) && !secOf(l) && !distOf(l)); });
  const nova = (s, t, foco = '') => { s = s || semana || 1; semana = s;
    if (!t) t = out.sessoes.filter(x => x.semana === s).length + 1;
    cur = { semana: s, treino: t, nome: `Semana ${s} · Treino ${t}`, foco: clean(foco) || semFoco[s] || '', obs: '', segs: [] }; out.sessoes.push(cur); started = true; mode = 'sess'; };
  for (const r of linhas) {
    if (!r.trim() || /^[⸺—–_\-=~*•.]{2,}$/.test(r.trim())) continue;
    const l = strip(r); if (!l) continue;
    let m;
    if ((m = HTS.exec(l))) { nova(+m[2], +m[1], m[3]); continue; }
    if ((m = HS2.exec(l))) { nova(+m[1], +m[2], m[3]); continue; }
    if ((m = HS.exec(l))) { if (m[2]) nova(+m[1], +m[2], m[3]); else { semana = +m[1]; cur = null; started = true; if (m[3]) semFoco[semana] = clean(m[3]); } continue; }
    if ((m = HT.exec(l)) && !secOf(l) && !distOf(l)) { nova(semana || 1, +m[1], m[2]); continue; }
    if (/^ORIENTA/i.test(l)) { mode = 'geral'; continue; }
    if (/^(BOM TREINO|MR TREINAMENTO)/i.test(l)) { mode = 'fim'; continue; }
    if (mode === 'geral') { out.geral.push(l); continue; }
    if (mode === 'fim') continue;
    if (/^(parte principal|principal|bloco principal|treino principal)\s*:?$/i.test(l)) continue;
    const body0 = l.replace(LABEL, ''), rep = REP.exec(body0);
    const isObs = /^(obs|observa|nota|importante|dica|aten[cç])/i.test(l);
    const isSeg = !isObs && (rep || secOf(body0) || distOf(body0) || /^(aquec|desaquec|volta (a|à) calma|pausa|descanso|trote|tiro|caminh|corrida|rodagem|regenerat|educativ|educat)/i.test(norm(body0)));
    if (!started) { // antes do 1º treino: nome do aluno / informações
      if (!isSeg || temCab) { if (!out.aluno && !/:/.test(l) && l.length < 60) out.aluno = l; else out.meta.push(l); continue; }
      nova(1, 1);
    }
    if (!isSeg) {
      const txt = l.replace(/^(obs(erva[çc][ãa]o)?|nota)\s*[:.\-]?\s*/i, '');
      if (cur && cur.segs.length) { const last = cur.segs[cur.segs.length - 1]; last.obs = clean((last.obs ? last.obs + ' · ' : '') + txt); }
      else if (cur) { if (!cur.foco && l.length < 60 && !isObs) cur.foco = l; else cur.obs = clean((cur.obs ? cur.obs + ' ' : '') + txt); }
      else if (semana) semFoco[semana] = clean((semFoco[semana] ? semFoco[semana] + ' · ' : '') + l);
      continue;
    }
    if (!cur) nova(semana || 1, 0);
    if (rep) { const n = Math.min(+rep[1], 50); cur.segs.push({ n, partes: partesDe(rep[2], n), obs: '' }); continue; }
    cur.segs.push({ n: 1, partes: [{ zona: null, texto: clean(body0) }], obs: '' });
  }
  // zona dos trechos simples: o primeiro sem palavra-chave conta como aquecimento se for caminhada/trote, o último como desaquecimento
  out.sessoes.forEach(s => s.segs.forEach((g, i) => { if (g.n !== 1 || g.partes.length !== 1 || g.partes[0].zona) return;
    const p = g.partes[0], pos = i === 0 ? 'ini' : i === s.segs.length - 1 ? 'fim' : 'meio'; p.zona = zonaDe(p.texto, pos); }));
  out.sessoes = out.sessoes.filter(s => s.segs.length);
  out.sessoes.sort((a, b) => a.semana - b.semana || a.treino - b.treino);
  return out;
}

// --- totais (tempo e distância) de um treino
export function totais(segs) { let sec = 0, dist = 0;
  roteiro(segs).forEach(p => { sec += p.sec; dist += p.dist; }); return { sec, dist }; }
// roteiro passo a passo (expande as repetições; a última pausa do bloco não entra)
export function roteiro(segs) { const out = [];
  segs.forEach(g => { for (let r = 1; r <= g.n; r++) g.partes.forEach((p, pi) => {
    if (g.n > 1 && r === g.n && pi === g.partes.length - 1 && g.partes.length > 1 && p.zona === 'pausa') return;
    out.push({ zona: p.zona, texto: p.texto, sec: secOf(p.texto), dist: distOf(p.texto), rod: g.n > 1 ? `${r} de ${g.n}` : '', obs: g.obs || '' }); }); });
  return out; }

// --- desenho
export const legenda = () => `<div class=rleg>${ORDEM.map(k => `<span style="--z:${ZONAS[k].cor}"><i></i>${ZONAS[k].nome}</span>`).join('')}</div>`;
const linha = (p, extra = '') => { const z = ZONAS[p.zona] || ZONAS.mod;
  return `<div class=rz style="--z:${z.cor};--zt:${z.txt}"><span class=rzl>${z.nome}</span><b>${esc(p.texto)}</b>${extra}</div>`; };
export function segsHtml(segs) {
  return `<div class=rsegs>${segs.map(g => { const ob = g.obs ? `<small class=rzo>${esc(g.obs)}</small>` : '';
    if (g.n > 1 || g.partes.length > 1) return `<div class=rrep><span class=rrn>${g.n > 1 ? `Repetir ${g.n}×` : 'Sequência'}</span>${g.partes.map(p => linha(p)).join('')}${ob}</div>`;
    return linha(g.partes[0], ob); }).join('')}</div>`;
}
export function resumo(segs) { const t = totais(segs), p = [];
  if (t.sec) p.push('≈ ' + fmtSec(t.sec)); if (t.dist) p.push(fmtDist(t.dist)); return p.join(' · '); }
// barra com as cores do treino na proporção do tempo (bom para ver o treino de relance)
export function barra(segs) { const r = roteiro(segs); const tot = r.reduce((t, p) => t + (p.sec || 60), 0) || 1;
  return `<div class=rbar>${r.map(p => `<i style="flex:${(p.sec || 60) / tot};background:${(ZONAS[p.zona] || ZONAS.mod).cor}"></i>`).join('')}</div>`; }

// --- banco: um bloco por trecho (set_type 'corrida', sets = repetições), um item por parte (kind 'corrida', reps = zona)
export function linhasBanco(s) { return s.segs.map(g => ({ set_type: 'corrida', sets: g.n, rest_seconds: null, items: g.partes.map((p, k) => ({ raw_text: p.texto, reps: p.zona, kind: 'corrida', note: k === g.partes.length - 1 ? (g.obs || null) : null, exercise_id: null, needs_review: false })) })); }
// do plano do aluno (student_plan) de volta para trechos
export function segsDoPlano(items) { const out = [], by = {};
  items.filter(i => i.kind === 'corrida').forEach(i => { let g = by[i.group]; if (!g) { g = by[i.group] = { n: i.sets || 1, partes: [], obs: '' }; out.push(g); }
    g.partes.push({ zona: ZONAS[i.reps] ? i.reps : zonaDe(i.text), texto: i.text }); if (i.note) g.obs = clean((g.obs ? g.obs + ' · ' : '') + i.note); });
  return out; }
// dos blocos do banco (tela do treinador) para trechos
export function segsDosBlocos(blocks) { return [...blocks].sort((a, b) => a.position - b.position).map(b => { const its = [...b.block_items].sort((a, c) => a.position - c.position);
  return { n: b.sets || 1, partes: its.map(i => ({ zona: ZONAS[i.reps] ? i.reps : zonaDe(i.raw_text), texto: i.raw_text, id: i.id })), obs: its.map(i => i.note).filter(Boolean).join(' · '), id: b.id }; }); }
// texto da ficha (para modelos / editar como texto)
export function textoTrechos(segs) { return segs.map(g => { const t = p => p.texto + (zonaDe(p.texto) !== p.zona && !temZona(p.texto) ? ` (${ZONAS[p.zona].nome.split(' /')[0].toLowerCase()})` : '');
  const linha = g.n > 1 || g.partes.length > 1 ? `${g.n}x ${g.partes.map(t).join(' / ')}` : t(g.partes[0]); return linha + (g.obs ? ' | ' + g.obs : ''); }).join('\n'); }
export const ehTreinoCorrida = nome => String(nome || '').includes(MARCA);

// --- corrida guiada: tela cheia na cor da zona, contagem regressiva por trecho
export function guia(segs, { beep, onEnd } = {}) {
  const R = roteiro(segs); if (!R.length) return;
  const d = document.createElement('div'); d.className = 'rungo'; document.body.appendChild(d);
  let i = 0, t0 = Date.now(), pausedAt = 0, tick = null, fim = false, avisou = false;
  const bip = (n = 1) => { try { navigator.vibrate && navigator.vibrate(n > 1 ? [250, 120, 250, 120, 250] : [250]); } catch {} if (beep) for (let k = 0; k < n; k++) setTimeout(beep, k * 450); };
  const close = ok => { clearInterval(tick); d.remove(); if (onEnd) onEnd(ok); };
  const paint = () => { const p = R[i], z = ZONAS[p.zona] || ZONAS.mod, nx = R[i + 1];
    d.style.setProperty('--z', z.cor); d.style.setProperty('--zt', z.txt);
    d.innerHTML = `<div class=rgtop><span>Trecho ${i + 1} de ${R.length}</span><button data-x aria-label=Encerrar>✕</button></div>
      <div class=rgmid><small class=rgz>${z.nome}${p.rod ? ' · ' + p.rod : ''}</small><h2>${esc(p.texto)}</h2>
      <div class=rgt id=rgt></div><small id=rgl></small>${p.obs ? `<p class=rgo>${esc(p.obs)}</p>` : ''}</div>
      <div class=rgnx>${nx ? `Depois: <b>${(ZONAS[nx.zona] || ZONAS.mod).nome}</b> · ${esc(nx.texto)}` : 'Último trecho 💪'}</div>
      <div class=rgbt><button data-v ${i ? '' : 'disabled'}>‹ Voltar</button><button data-p>${pausedAt ? '▶ Continuar' : '⏸ Pausar'}</button><button class=p data-n>${nx ? 'Próximo ›' : 'Concluir ✓'}</button></div>`;
    d.querySelector('[data-x]').onclick = () => { if (confirm('Encerrar a corrida guiada?')) close(false); };
    d.querySelector('[data-v]').onclick = () => ir(i - 1, false);
    d.querySelector('[data-n]').onclick = () => ir(i + 1, false);
    d.querySelector('[data-p]').onclick = () => { if (pausedAt) { t0 += Date.now() - pausedAt; pausedAt = 0; } else pausedAt = Date.now(); paint(); };
    frame(); };
  const frame = () => { if (fim) return; const p = R[i], el = d.querySelector('#rgt'), lb = d.querySelector('#rgl'); if (!el) return;
    const pass = ((pausedAt || Date.now()) - t0) / 1000;
    if (p.sec) { const left = p.sec - pass; el.textContent = fmtClock(left); lb.textContent = pausedAt ? 'pausado' : 'restante';
      if (left <= 3 && !avisou && !pausedAt && beep) { avisou = true; beep(); }
      if (left <= 0 && !pausedAt) ir(i + 1, true); }
    else { el.textContent = fmtClock(pass); lb.textContent = p.dist ? `toque em Próximo ao completar ${fmtDist(p.dist)}` : 'toque em Próximo ao terminar'; } };
  const ir = (n, auto) => { if (n < 0) return; if (n >= R.length) { fim = true; bip(3); return close(true); } i = n; t0 = Date.now(); pausedAt = 0; avisou = false; bip(auto ? 2 : 1); paint(); };
  bip(1); paint(); tick = setInterval(frame, 250);
}
const fmtClock = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
