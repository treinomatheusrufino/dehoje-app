// Recursos extras da tela do aluno: ficha de saúde, mensalidade, conquistas, relatório do mês,
// avaliação física e sugestão de progressão de carga. Também exporta o relatório para a tela do treinador.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = v => String(v).replace('.', ',');
export const brl = c => (Number(c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const nomeMes = d => { const x = new Date(String(d).slice(0, 10) + 'T12:00:00'); return MES[x.getMonth()] + ' de ' + x.getFullYear(); };
const dbr = d => d ? new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '';

// ---------- ficha de saúde (PAR-Q + anamnese)
export const PARQ = [
  'Algum médico já disse que você tem problema no coração e só deve fazer atividade física com acompanhamento?',
  'Você sente dor no peito quando faz atividade física?',
  'No último mês, você sentiu dor no peito mesmo sem fazer atividade física?',
  'Você perde o equilíbrio por tontura ou já desmaiou?',
  'Você tem algum problema nos ossos ou articulações que pode piorar com exercício?',
  'Você toma remédio para pressão ou para o coração?',
  'Existe algum outro motivo para você não fazer atividade física?',
];
export const OBJ_A = ['Emagrecer', 'Ganhar massa muscular', 'Saúde e qualidade de vida', 'Condicionamento', 'Performance esportiva', 'Reabilitação / dor', 'Gestação / pós-parto'];
export const COND = ['Pressão alta', 'Diabetes', 'Colesterol alto', 'Asma / bronquite', 'Problema no coração', 'Problema na coluna', 'Problema no joelho', 'Problema no ombro', 'Labirintite'];
export function anamneseHTML(a) { if (!a) return '';
  const parqSim = PARQ.map((q, i) => a.parq?.['q' + (i + 1)] ? `<li>${esc(q)}</li>` : '').join('');
  const L = (t, v) => v ? `<p><b>${t}:</b> ${esc(v)}</p>` : '';
  return `${parqSim ? `<div class=ax-alert>⚠️ <b>Respondeu SIM no PAR-Q</b> — peça liberação médica antes de treinos intensos:<ul>${parqSim}</ul></div>` : '<p class=ok>✓ Respondeu NÃO a todas as perguntas do PAR-Q</p>'}
    ${L('Objetivo', (a.objetivos || []).join(', '))}${L('Experiência', a.experiencia)}${L('Dias disponíveis', a.dias ? a.dias + ' por semana' : '')}
    ${L('Condições de saúde', (a.condicoes || []).join(', '))}${L('Dores ou lesões', a.lesoes)}${L('Cirurgias', a.cirurgias)}${L('Remédios', a.remedios)}
    ${L('Gestação / pós-parto', a.gestante)}${L('Sono', a.sono ? a.sono + ' horas por noite' : '')}${L('Fuma', a.fuma)}${L('Atividade atual', a.atividade)}${L('Observações', a.obs)}`; }
function abrirFicha(mdl, sb, token, onOk, atual = {}) {
  const ch = (name, opts, sel = [], multi = true) => `<div class=ax-chips data-n=${name} data-m=${multi ? 1 : 0}>${opts.map(o => `<button type=button class="${sel.includes(o) ? 'on' : ''}">${esc(o)}</button>`).join('')}</div>`;
  const d = mdl(`<h3>🩺 Ficha de saúde</h3><p class=muted>Leva 2 minutos. Só você e seu treinador veem. Ajuda a montar um treino seguro para você.</p>
    <h4>Responda com sinceridade (PAR-Q)</h4>${PARQ.map((q, i) => `<div class=ax-q><p>${i + 1}. ${esc(q)}</p><div class=ax-sn data-q=q${i + 1}><button type=button data-v=0 class="${atual.parq?.['q' + (i + 1)] === false ? 'on' : ''}">Não</button><button type=button data-v=1 class="${atual.parq?.['q' + (i + 1)] ? 'on' : ''}">Sim</button></div></div>`).join('')}
    <h4>Sobre você</h4><label class=muted>Seu objetivo (pode marcar mais de um)</label>${ch('objetivos', OBJ_A, atual.objetivos || [])}
    <label class=muted>Experiência com treino</label>${ch('experiencia', ['Nunca treinei', 'Parado há mais de 6 meses', 'Treino há menos de 1 ano', 'Treino há mais de 1 ano'], [atual.experiencia], false)}
    <label class=muted>Quantos dias por semana pode treinar?</label>${ch('dias', ['1', '2', '3', '4', '5', '6', '7'], [String(atual.dias || '')], false)}
    <label class=muted>Você tem alguma dessas condições?</label>${ch('condicoes', COND, atual.condicoes || [])}
    <label class=muted>Sente alguma dor ou tem lesão? Onde?</label><input id=ax-les value="${esc(atual.lesoes || '')}" maxlength=500 placeholder="Ex.: dor no joelho direito ao descer escada">
    <label class=muted>Já fez alguma cirurgia?</label><input id=ax-cir value="${esc(atual.cirurgias || '')}" maxlength=300>
    <label class=muted>Toma algum remédio?</label><input id=ax-rem value="${esc(atual.remedios || '')}" maxlength=300>
    <label class=muted>Está grávida ou teve bebê há menos de 1 ano?</label>${ch('gestante', ['Não', 'Estou grávida', 'Tive bebê há menos de 1 ano'], [atual.gestante], false)}
    <div class=ax-2><label class=muted>Horas de sono por noite<input id=ax-sono inputmode=numeric value="${esc(atual.sono || '')}" maxlength=2></label><label class=muted>Fuma?${ch('fuma', ['Não', 'Sim'], [atual.fuma], false)}</label></div>
    <label class=muted>Faz alguma atividade física hoje? Qual?</label><input id=ax-atv value="${esc(atual.atividade || '')}" maxlength=300>
    <label class=muted>Algo mais que seu treinador precisa saber?</label><textarea id=ax-obs maxlength=1000 style="min-height:70px">${esc(atual.obs || '')}</textarea>
    <label class=chk><input type=checkbox id=ax-ok> Autorizo meu treinador a usar essas informações de saúde para montar e acompanhar meus treinos.</label>
    <p id=ax-m class=err></p><button class=p id=ax-s>Enviar ficha</button> <button id=ax-c>Depois</button>`);
  d.querySelectorAll('.ax-chips').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (g.dataset.m === '1') b.classList.toggle('on'); else g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
  d.querySelectorAll('.ax-sn').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
  d.querySelector('#ax-c').onclick = d.close;
  d.querySelector('#ax-s').onclick = async () => { const m = d.querySelector('#ax-m'), parq = {}; let falta = 0;
    d.querySelectorAll('.ax-sn').forEach(g => { const on = g.querySelector('.on'); if (!on) falta++; else parq[g.dataset.q] = on.dataset.v === '1'; });
    if (falta) return m.textContent = `Responda as ${PARQ.length} perguntas do PAR-Q (faltam ${falta}).`;
    if (!d.querySelector('#ax-ok').checked) return m.textContent = 'Marque a autorização no final para enviar.';
    const pick = n => [...d.querySelectorAll(`.ax-chips[data-n=${n}] .on`)].map(b => b.textContent);
    const ans = { parq, objetivos: pick('objetivos'), experiencia: pick('experiencia')[0] || '', dias: +pick('dias')[0] || null, condicoes: pick('condicoes'), lesoes: d.querySelector('#ax-les').value.trim(), cirurgias: d.querySelector('#ax-cir').value.trim(), remedios: d.querySelector('#ax-rem').value.trim(), gestante: pick('gestante')[0] || '', sono: d.querySelector('#ax-sono').value.trim(), fuma: pick('fuma')[0] || '', atividade: d.querySelector('#ax-atv').value.trim(), obs: d.querySelector('#ax-obs').value.trim(), em: new Date().toISOString() };
    d.querySelector('#ax-s').disabled = true; m.textContent = '';
    const r = await sb.rpc('student_anamnese_save', { p_token: token, p_answers: ans });
    if (r.error) { d.querySelector('#ax-s').disabled = false; return m.textContent = 'Não foi possível enviar agora. Confira a internet e tente de novo.'; }
    d.close(); onOk && onOk(r.data); };
}

// ---------- conquistas
const semana = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x.getTime(); };
export function stats(sessions) {
  const ss = (sessions || []).map(x => new Date(x)).sort((a, b) => b - a), total = ss.length;
  const wks = new Set(ss.map(semana)); let seq = 0; let w = semana(new Date()); if (!wks.has(w)) w -= 7 * 864e5;
  while (wks.has(w)) { seq++; w -= 7 * 864e5; }
  const porMes = {}; ss.forEach(d => { const k = d.getFullYear() + '-' + d.getMonth(); porMes[k] = (porMes[k] || 0) + 1; });
  return { total, seq, melhorMes: Math.max(0, ...Object.values(porMes)) };
}
const BADGES = [
  ['t1', '🎉', 'Primeiro treino', s => s.total >= 1, s => [s.total, 1]], ['t10', '🥉', '10 treinos', s => s.total >= 10, s => [s.total, 10]], ['t25', '🥈', '25 treinos', s => s.total >= 25, s => [s.total, 25]],
  ['t50', '🥇', '50 treinos', s => s.total >= 50, s => [s.total, 50]], ['t100', '🏆', '100 treinos', s => s.total >= 100, s => [s.total, 100]], ['t200', '👑', '200 treinos', s => s.total >= 200, s => [s.total, 200]],
  ['s4', '🔥', '4 semanas seguidas', s => s.seq >= 4, s => [s.seq, 4]], ['s8', '⚡', '8 semanas seguidas', s => s.seq >= 8, s => [s.seq, 8]], ['s12', '💎', '12 semanas seguidas', s => s.seq >= 12, s => [s.seq, 12]],
  ['m12', '🦾', 'Mês de ferro (12 treinos no mês)', s => s.melhorMes >= 12, s => [s.melhorMes, 12]],
];
export function conquistasHTML(sessions) {
  const s = stats(sessions), got = BADGES.filter(b => b[3](s)), prox = BADGES.find(b => !b[3](s));
  const [a, z] = prox ? prox[4](s) : [0, 0];
  return `<div class="wcard ax-badges"><div class=wc1><b>🏅 Conquistas</b><small class=muted>${s.seq ? `🔥 ${s.seq} semana${s.seq > 1 ? 's' : ''} seguida${s.seq > 1 ? 's' : ''}` : ''}</small></div>
    <div class=ax-bg>${BADGES.map(b => `<span class="ax-b${b[3](s) ? ' on' : ''}" title="${esc(b[2])}">${b[1]}<small>${esc(b[2].replace(/ \(.*\)/, ''))}</small></span>`).join('')}</div>
    ${prox ? `<small class=muted>Próxima: ${prox[1]} <b>${esc(prox[2])}</b> — ${Math.max(0, z - a)} para chegar lá</small><div class=bar><i style="width:${Math.min(100, Math.round(a / z * 100))}%"></i></div>` : '<small class=ok>Você conquistou todas! 👑</small>'}
    ${got.length ? '' : '<small class=muted>Faça seu primeiro treino para ganhar a primeira medalha.</small>'}</div>`;
}
// marcos alcançados com o treino que acabou de terminar
export function marcos(antes, depois) { const a = stats(antes), d = stats(depois);
  return BADGES.filter(b => !b[3](a) && b[3](d)).map(b => `${b[1]} Conquista nova: <b>${esc(b[2])}</b>`); }

// ---------- relatório do mês
export function relatorioHTML(r, nome) { if (!r) return '<p class=muted>Sem dados.</p>';
  const dif = r.treinos - (r.anterior || 0);
  return `<div class=ax-rel><h3>📊 ${esc(nome ? nome + ' — ' : '')}${esc(nomeMes(r.mes))}</h3>
    <div class=stats><div><b>${r.treinos}</b><small>treinos</small></div><div><b>${r.semanas || 0}</b><small>semanas ativas</small></div><div><b>${r.nota ? br(r.nota) : '–'}</b><small>nota média</small></div></div>
    <p>${r.treinos ? (dif > 0 ? `📈 ${dif} treino${dif > 1 ? 's' : ''} a mais que no mês anterior.` : dif < 0 ? `${-dif} treino${dif < -1 ? 's' : ''} a menos que no mês anterior.` : 'Mesma frequência do mês anterior.') : 'Nenhum treino registrado neste mês.'}${r.volume ? ` Você levantou <b>${Number(r.volume).toLocaleString('pt-BR')} kg</b> no total.` : ''}</p>
    ${r.recordes?.length ? `<h4>🏆 Recordes</h4><ul>${r.recordes.map(x => `<li><b>${esc(x.ex)}</b>: ${br(x.kg)} kg <small class=muted>(antes ${br(x.antes)} kg)</small></li>`).join('')}</ul>` : ''}
    ${r.progressos?.length ? `<h4>💪 Cargas que subiram</h4><ul>${r.progressos.map(x => `<li><b>${esc(x.ex)}</b>: ${br(x.de)} → ${br(x.para)} kg <small class=ok>+${Math.round((x.para - x.de) / x.de * 100)}%</small></li>`).join('')}</ul>` : ''}</div>`; }
export function relatorioTexto(r, nome) { if (!r) return '';
  const L = [`📊 ${nome ? nome.split(' ')[0] + ', seu' : 'Seu'} relatório de ${nomeMes(r.mes)} — DE HOJE`, `✅ ${r.treinos} treinos em ${r.semanas || 0} semanas${r.nota ? ` · nota média ${br(r.nota)}` : ''}`];
  if (r.volume) L.push(`🏋️ ${Number(r.volume).toLocaleString('pt-BR')} kg levantados no mês`);
  (r.recordes || []).slice(0, 3).forEach(x => L.push(`🏆 Recorde: ${x.ex} ${br(x.kg)} kg`));
  (r.progressos || []).slice(0, 3).forEach(x => L.push(`💪 ${x.ex}: ${br(x.de)} → ${br(x.para)} kg`));
  L.push('Bora para mais um mês! 💪'); return L.join('\n'); }
export function abrirRelatorio(mdl, carregar, nome) {
  let m = new Date(); m.setDate(1);
  const d = mdl('<div id=ax-rb>Carregando…</div><div class=ax-nav><button id=ax-pv>‹ Mês anterior</button><button id=ax-nx>Próximo ›</button></div><button class=p id=ax-fc>Fechar</button>');
  const draw = async () => { const iso = m.toISOString().slice(0, 8) + '01'; d.querySelector('#ax-rb').innerHTML = 'Carregando…'; try { d.querySelector('#ax-rb').innerHTML = relatorioHTML(await carregar(iso), nome); } catch { d.querySelector('#ax-rb').innerHTML = '<p class=err>Sem internet agora.</p>'; }
    d.querySelector('#ax-nx').disabled = m.getFullYear() === new Date().getFullYear() && m.getMonth() === new Date().getMonth(); };
  d.querySelector('#ax-pv').onclick = () => { m.setMonth(m.getMonth() - 1); draw(); };
  d.querySelector('#ax-nx').onclick = () => { m.setMonth(m.getMonth() + 1); draw(); };
  d.querySelector('#ax-fc').onclick = d.close; draw(); return d; }

// ---------- avaliação física: cálculos (Jackson & Pollock + Siri)
export const DOBRAS7 = [['peitoral', 'Peitoral'], ['axilar', 'Axilar média'], ['triceps', 'Tríceps'], ['subescapular', 'Subescapular'], ['abdominal', 'Abdominal'], ['suprailiaca', 'Suprailíaca'], ['coxa', 'Coxa']];
export const DOBRAS3 = { m: ['peitoral', 'abdominal', 'coxa'], f: ['triceps', 'suprailiaca', 'coxa'] };
export const CIRC = [['peito', 'Peito'], ['cintura', 'Cintura'], ['abdomen', 'Abdômen'], ['quadril', 'Quadril'], ['braco_d', 'Braço direito'], ['braco_e', 'Braço esquerdo'], ['coxa_d', 'Coxa direita'], ['coxa_e', 'Coxa esquerda'], ['panturrilha', 'Panturrilha']];
export function calcAval(a) { // a: { sex, age, weight_kg, height_cm, protocol, folds, circ, body_fat_pct }
  const r = {}; const w = +a.weight_kg || 0, h = +a.height_cm || 0, age = +a.age || 0, f = a.folds || {};
  if (w && h) { r.imc = w / Math.pow(h / 100, 2); r.imcTxt = r.imc < 18.5 ? 'abaixo do peso' : r.imc < 25 ? 'peso normal' : r.imc < 30 ? 'sobrepeso' : r.imc < 35 ? 'obesidade grau I' : r.imc < 40 ? 'obesidade grau II' : 'obesidade grau III'; }
  let fat = a.body_fat_pct != null && a.body_fat_pct !== '' ? +a.body_fat_pct : null;
  if (a.protocol === 'pollock7' && age && DOBRAS7.every(([k]) => +f[k] > 0)) { const S = DOBRAS7.reduce((t, [k]) => t + +f[k], 0); r.soma = S;
    const D = a.sex === 'm' ? 1.112 - 0.00043499 * S + 0.00000055 * S * S - 0.00028826 * age : 1.097 - 0.00046971 * S + 0.00000056 * S * S - 0.00012828 * age; fat = 495 / D - 450; }
  if (a.protocol === 'pollock3' && age && DOBRAS3[a.sex === 'm' ? 'm' : 'f'].every(k => +f[k] > 0)) { const S = DOBRAS3[a.sex === 'm' ? 'm' : 'f'].reduce((t, k) => t + +f[k], 0); r.soma = S;
    const D = a.sex === 'm' ? 1.10938 - 0.0008267 * S + 0.0000016 * S * S - 0.0002574 * age : 1.0994921 - 0.0009929 * S + 0.0000023 * S * S - 0.0001392 * age; fat = 495 / D - 450; }
  if (fat != null && isFinite(fat) && fat > 0 && fat < 70) { r.fat = Math.round(fat * 10) / 10; if (w) { r.massaGorda = Math.round(w * r.fat / 10) / 10; r.massaMagra = Math.round((w - r.massaGorda) * 10) / 10; }
    const faixa = a.sex === 'm' ? [6, 14, 18, 25] : [14, 21, 25, 32]; r.fatTxt = r.fat < faixa[0] ? 'muito baixo (atleta)' : r.fat < faixa[1] ? 'atlético' : r.fat < faixa[2] ? 'bom' : r.fat < faixa[3] ? 'aceitável' : 'acima do recomendado'; }
  const c = a.circ || {}; if (+c.cintura && +c.quadril) { r.rcq = Math.round(+c.cintura / +c.quadril * 100) / 100; r.rcqRisco = r.rcq >= (a.sex === 'm' ? 0.9 : 0.85) ? 'risco aumentado' : 'adequado'; }
  if (+c.cintura && h) { r.rce = Math.round(+c.cintura / h * 100) / 100; }
  return r;
}
export function avalResumo(list, sex) { if (!list?.length) return ''; const a = list[list.length - 1], z = list[0], ca = calcAval({ ...a, weight_kg: a.weight ?? a.weight_kg, height_cm: a.height ?? a.height_cm, body_fat_pct: a.fat ?? a.body_fat_pct, sex, protocol: 'manual' });
  const dv = (x, y, u) => list.length > 1 && x != null && y != null ? ` <small class="${x - y <= 0 ? 'ok' : 'muted'}">(${x - y > 0 ? '+' : ''}${br(Math.round((x - y) * 10) / 10)} ${u})</small>` : '';
  const P = []; const wa = a.weight ?? a.weight_kg, wz = z.weight ?? z.weight_kg, fa = a.fat ?? a.body_fat_pct, fz = z.fat ?? z.body_fat_pct;
  if (wa != null) P.push(`Peso <b>${br(wa)} kg</b>${dv(wa, wz, 'kg')}`); if (fa != null) P.push(`Gordura <b>${br(fa)}%</b>${dv(fa, fz, '%')}`); if (ca.massaMagra) P.push(`Massa magra <b>${br(ca.massaMagra)} kg</b>`);
  return P.join('<br>'); }

// ---------- progressão de carga
export function sugestao(i, sets) {
  const h = i.hist; if (!h || h.length < 2) return null; const m = /^(\d+)(?:-(\d+))?$/.exec(String(i.reps || '').replace(/\s/g, '')); if (!m) return null;
  const top = +(m[2] || m[1]), L = +h[0].load; if (!L || +h[1].load !== L) return null;
  if (h.some(x => +x.n < (sets || 1) || +x.minreps < top)) return null;
  const inc = L < 10 ? 1 : L < 30 ? 2 : Math.max(2.5, Math.round(L * 0.05 / 2.5) * 2.5); const kg = Math.round((L + inc) * 10) / 10;
  return { kg, de: L, txt: `Você fez todas as repetições com ${br(L)} kg nos 2 últimos treinos.` }; }

// ---------- cartões da tela inicial do aluno
export function cartoesAluno({ P, token, sb, mdl, box, preview }) {
  if (!box) return; let h = '';
  if (!P.anamnese_ok && !preview) h += `<div class="wcard ax-cta"><div class=wc1><div><b>🩺 Preencha sua ficha de saúde</b><br><small class=muted>2 minutos · ajuda seu treinador a montar um treino seguro</small></div><button class="p" data-ax=ficha>Preencher</button></div></div>`;
  const f = P.fee; if (f) { const dias = Math.ceil((new Date(f.venc + 'T23:59:59') - Date.now()) / 864e5);
    const st = f.pago ? '<span class="ag-st ag-ok">Pago este mês ✓</span>' : dias < 0 ? `<span class="ag-st ag-no">Venceu dia ${dbr(f.venc).slice(0, 5)}</span>` : dias <= 5 ? `<span class="ag-st ag-wait">Vence ${dias === 0 ? 'hoje' : `em ${dias} dia${dias > 1 ? 's' : ''}`}</span>` : `<span class=muted>vence todo dia ${f.dia}</span>`;
    h += `<div class="wcard ax-fee"><div class=wc1><div><b>💳 Mensalidade ${brl(f.valor)}</b><br>${st}</div>${!f.pago && f.pix ? '<button class=sm data-ax=pix>Copiar PIX</button>' : ''}</div>${!f.pago && f.pix ? `<small class=muted>Chave PIX: <b>${esc(f.pix)}</b></small>` : ''}</div>`; }
  h += conquistasHTML(P.sessions);
  h += `<div class=wcard><div class=wc1><div><b>📊 Seu mês</b><br><small class=muted>Treinos, recordes e cargas que subiram</small></div><button data-ax=rel>Ver</button></div></div>`;
  const av = avalResumo(P.assess, null); if (av) h += `<div class=wcard><div class=wc1><div><b>📏 Avaliação física</b><br><small>${av}</small></div><button data-ax=av>Evolução</button></div></div>`;
  box.innerHTML = h;
  const on = (k, fn) => { const b = box.querySelector(`[data-ax=${k}]`); if (b) b.onclick = fn; };
  on('ficha', async () => { let atual = {}; try { const r = await sb.rpc('student_anamnese_get', { p_token: token }); atual = r.data || {}; } catch {}
    abrirFicha(mdl, sb, token, () => { P.anamnese_ok = true; cartoesAluno({ P, token, sb, mdl, box, preview }); const d = mdl('<h3>Ficha enviada ✓</h3><p>Obrigado! Seu treinador já pode ver suas respostas.</p><button class=p>Fechar</button>'); d.querySelector('button').onclick = d.close; }, atual); });
  on('pix', async e => { try { await navigator.clipboard.writeText(f.pix); e.target.textContent = 'Copiado ✓'; } catch { prompt('Copie a chave PIX:', f.pix); } });
  on('rel', () => abrirRelatorio(mdl, async iso => { const r = await sb.rpc('student_month_report', { p_token: token, p_month: iso }); if (r.error) throw r.error; return r.data; }));
  on('av', () => { const L = [...(P.assess || [])].reverse(); const d = mdl(`<h3>📏 Suas avaliações</h3><div style="overflow:auto"><table class=evo><tr><th>Data</th><th>Peso</th><th>% gordura</th><th>Cintura</th><th>Quadril</th></tr>${L.map(a => `<tr><td>${dbr(a.on)}</td><td>${a.weight != null ? br(a.weight) : '–'}</td><td>${a.fat != null ? br(a.fat) : '–'}</td><td>${a.circ?.cintura ? br(a.circ.cintura) : '–'}</td><td>${a.circ?.quadril ? br(a.circ.quadril) : '–'}</td></tr>`).join('')}</table></div>${grafico(P.assess.map(a => [a.on, a.fat]), '% gordura')}${grafico(P.assess.map(a => [a.on, a.weight]), 'Peso (kg)')}<button class=p>Fechar</button>`); d.querySelector('button.p').onclick = d.close; });
}
// gráfico de linha simples (SVG)
export function grafico(pts, titulo) { const p = pts.filter(x => x[1] != null && x[1] !== '').map(x => [x[0], +x[1]]); if (p.length < 2) return '';
  const W = 320, H = 120, pad = 26, ys = p.map(x => x[1]), mn = Math.min(...ys), mx = Math.max(...ys), sp = mx - mn || 1;
  const X = i => pad + i * (W - 2 * pad) / (p.length - 1), Y = v => H - pad - (v - mn) / sp * (H - 2 * pad);
  return `<div class=ax-graf><small class=muted>${esc(titulo)}</small><svg viewBox="0 0 ${W} ${H}" role=img aria-label="${esc(titulo)}"><polyline fill=none stroke="var(--o)" stroke-width=3 points="${p.map((x, i) => X(i) + ',' + Y(x[1])).join(' ')}"/>${p.map((x, i) => `<circle cx=${X(i)} cy=${Y(x[1])} r=4 fill="var(--od)"/><text x=${X(i)} y=${Y(x[1]) - 8} text-anchor=middle font-size=11>${br(x[1])}</text><text x=${X(i)} y=${H - 6} text-anchor=middle font-size=9 fill="#6b7280">${dbr(x[0]).slice(0, 5)}</text>`).join('')}</svg></div>`; }
