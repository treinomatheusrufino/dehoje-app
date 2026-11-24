// Recursos do treinador: painel Hoje, Financeiro, mensalidade/ficha de saúde/avaliação física/relatório na página do aluno,
// modelos de treino e aviso de treino vencendo.
import { brl, anamneseHTML, relatorioHTML, relatorioTexto, abrirRelatorio, calcAval, DOBRAS7, DOBRAS3, CIRC, grafico, nomeMes } from './aluno_extras.js';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = v => String(v).replace('.', ',');
const dbr = d => d ? new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '';
const hora = d => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const nz = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
const cents = v => { const n = nz(v); return n == null ? null : Math.round(n * 100); };
const hojeISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const mesISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
const wa = (phone, txt) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
const primeiro = n => String(n || '').split(' ')[0];
const venceEm = (dia, m) => { const [y, mo] = m.split('-').map(Number); const last = new Date(y, mo, 0).getDate(); return `${y}-${String(mo).padStart(2, '0')}-${String(Math.min(dia, last)).padStart(2, '0')}`; };
const diasAte = d => Math.round((new Date(d + 'T12:00:00') - new Date(hojeISO() + 'T12:00:00')) / 864e5);
const msgCobranca = (s, valor, venc, pix, marca) => `Oi, ${primeiro(s.name)}! Tudo bem? 😊\nPassando para lembrar da mensalidade de ${brl(valor)}${venc ? `, com vencimento em ${dbr(venc)}` : ''}.${pix ? `\n\nChave PIX: ${pix}` : ''}\n\nQualquer dúvida é só me chamar. Obrigado!${marca ? '\n' + marca : ''}`;

// ---------- marcar pagamento
function pagar(ctx, s, ref, valor, done) {
  const d = ctx.mdl(`<h3>Registrar pagamento — ${esc(s.name)}</h3><p class=muted>Mensalidade de ${esc(nomeMes(ref))}</p><div class=mgrid><label>Valor (R$)<input id=pg_v inputmode=decimal value="${valor ? br((valor / 100).toFixed(2)) : ''}"></label><label>Data do pagamento<input id=pg_d type=date value="${hojeISO()}"></label></div>
    <label class=muted>Forma</label><select id=pg_f><option>PIX</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option><option>Outro</option></select><input id=pg_n placeholder="Observação (opcional)" maxlength=300><p id=pg_m class=err></p><button class=p id=pg_s>Salvar pagamento</button> <button id=pg_c>Cancelar</button>`);
  d.querySelector('#pg_c').onclick = d.close;
  d.querySelector('#pg_s').onclick = async () => { const v = cents(d.querySelector('#pg_v').value); if (v == null) return d.querySelector('#pg_m').textContent = 'Digite o valor.';
    const r = await ctx.sb.from('student_payments').upsert({ trainer_id: ctx.session.user.id, student_id: s.id, ref_month: ref, amount_cents: v, paid_on: d.querySelector('#pg_d').value || hojeISO(), method: d.querySelector('#pg_f').value, note: d.querySelector('#pg_n').value.trim() || null }, { onConflict: 'student_id,ref_month' });
    if (r.error) return d.querySelector('#pg_m').textContent = r.error.message; d.close(); done && done(); };
}
function definirMensalidade(ctx, s, done) {
  const d = ctx.mdl(`<h3>Mensalidade — ${esc(s.name)}</h3><div class=mgrid><label>Valor por mês (R$)<input id=fe_v inputmode=decimal value="${s.fee_cents != null ? br((s.fee_cents / 100).toFixed(2)) : ''}" placeholder="Ex.: 350"></label><label>Dia do vencimento<input id=fe_d type=number inputmode=numeric min=1 max=31 value="${s.fee_due_day || ''}" placeholder="Ex.: 10"></label></div>
    <p class=muted>O app avisa você no painel Hoje e manda um lembrete no celular do aluno 2 dias antes e no dia (se ele ativou as notificações).</p><p id=fe_m class=err></p><button class=p id=fe_s>Salvar</button> ${s.fee_cents != null ? '<button class=danger id=fe_x>Tirar mensalidade</button>' : ''} <button id=fe_c>Cancelar</button>`);
  d.querySelector('#fe_c').onclick = d.close;
  const save = async (v, dia) => { const r = await ctx.sb.from('students').update({ fee_cents: v, fee_due_day: dia }).eq('id', s.id); if (r.error) return d.querySelector('#fe_m').textContent = r.error.message; d.close(); done && done(); };
  d.querySelector('#fe_s').onclick = () => { const v = cents(d.querySelector('#fe_v').value), dia = parseInt(d.querySelector('#fe_d').value); if (v == null || v <= 0) return d.querySelector('#fe_m').textContent = 'Digite o valor da mensalidade.'; if (!(dia >= 1 && dia <= 31)) return d.querySelector('#fe_m').textContent = 'Escolha um dia de 1 a 31.'; save(v, dia); };
  const x = d.querySelector('#fe_x'); if (x) x.onclick = () => save(null, null);
}

// ---------- painel Hoje
export async function painel(ctx) {
  const { app, sb, profile } = ctx; app.innerHTML = '<h2>Hoje</h2><div id=pnl>Carregando…</div>';
  const [{ data: T, error }, { data: stu }] = await Promise.all([sb.rpc('trainer_today'), sb.from('students').select('id,name,phone,fee_cents,fee_due_day').eq('active', true)]);
  if (error) return app.querySelector('#pnl').innerHTML = `<p class=err>${esc(error.message)}</p>`;
  const S = Object.fromEntries((stu || []).map(s => [s.id, s])), pr = await sb.from('profiles').select('pix_key,brand_name,daily_summary,renew_weeks,phone,wa_apikey').eq('id', ctx.session.user.id).single();
  const P = pr.data || {}; const nome = primeiro(P.brand_name || profile?.full_name || '');
  const hr = new Date().getHours(), saud = hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
  const card = (ico, tit, n, body, cls = '') => `<div class="box2 pn-card ${cls}"><div class=pn-h><b>${ico} ${tit}</b>${n != null ? `<span class=pn-n>${n}</span>` : ''}</div>${body}</div>`;
  const linha = (id, txt, acts = '') => `<div class=pn-l><a href="#" data-al=${id}>${txt}</a>${acts ? `<span class=pn-a>${acts}</span>` : ''}</div>`;
  let h = `<p class=pn-oi>${saud}${nome ? ', ' + esc(nome) : ''}! <small class=muted>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</small></p>`;
  const cont = [['📅', T.aulas.length, 'aulas hoje'], ['✅', T.treinaram.length, 'treinaram'], ['💰', T.vencidas.length, 'atrasadas'], ['😴', T.sumidos.length, 'sumidos']];
  h += `<div class=pn-cont>${cont.map(([i, n, t]) => `<div><b>${i} ${n}</b><small>${t}</small></div>`).join('')}</div>`;
  const ST = { confirmada: ['Confirmada', 'ag-ok'], marcada: ['Aguardando', 'ag-wait'], desmarcada: ['Não vai', 'ag-no'], realizada: ['Realizada', 'ag-done'] };
  h += card('📅', 'Aulas de hoje', T.aulas.length, T.aulas.length ? T.aulas.map(a => linha(a.aluno, `<b>${hora(a.inicio)}</b> ${esc(a.nome)}${a.local ? ` <small class=muted>· ${esc(a.local)}</small>` : ''}`, `<span class="ag-st ${(ST[a.status] || ['', ''])[1]}">${(ST[a.status] || [a.status])[0]}</span>`)).join('') : '<p class=muted>Nenhuma aula marcada para hoje. <a href="#" data-go=agd>Abrir agenda</a></p>');
  h += card('✅', 'Treinaram hoje', T.treinaram.length, T.treinaram.length ? T.treinaram.map(t => linha(t.id, `<b>${esc(t.nome)}</b> <small class=muted>${esc(t.treino || '')} · ${hora(t.hora)}</small>${t.nota ? ` <span class=star>${'★'.repeat(t.nota)}</span>` : ''}${t.comentario ? `<br><small class=pre>“${esc(t.comentario)}”</small>` : ''}`)).join('') : '<p class=muted>Ninguém treinou ainda hoje.</p>');
  if (T.notas_baixas.length) h += card('⚠️', 'Notas baixas (últimos 7 dias)', T.notas_baixas.length, T.notas_baixas.map(t => linha(t.id, `<b>${esc(t.nome)}</b> <span class=star>${'★'.repeat(t.nota)}</span> <small class=muted>${dbr(t.quando)}</small>${t.comentario ? `<br><small class=pre>“${esc(t.comentario)}”</small>` : ''}`)).join(''), 'pn-warn');
  const cob = (x, s) => s?.phone ? `<a class="btn sm" target=_blank rel=noopener href="${wa(s.phone, msgCobranca(s, x.valor, x.venc, P.pix_key, P.brand_name))}">Cobrar</a>` : '';
  const fin = [...T.vencidas.map(x => linha(x.id, `<b>${esc(x.nome)}</b> ${brl(x.valor)} <small class=err>atrasada há ${x.dias} dia${x.dias > 1 ? 's' : ''}</small>`, `<button class="sm p" data-pg=${x.id}>Pago</button>${cob(x, S[x.id])}`)),
    ...T.vencem.map(x => linha(x.id, `<b>${esc(x.nome)}</b> ${brl(x.valor)} <small class=warn>${x.dias === 0 ? 'vence hoje' : `vence em ${x.dias} dia${x.dias > 1 ? 's' : ''}`}</small>`, `<button class="sm p" data-pg=${x.id}>Pago</button>${cob(x, S[x.id])}`))];
  h += card('💰', 'Mensalidades', fin.length || null, fin.length ? fin.join('') : `<p class=muted>Nenhuma mensalidade atrasada ou vencendo nos próximos 3 dias. <a href="#" data-go=fin>Abrir financeiro</a></p>`);
  if (T.renovar.length) h += card('🔄', `Treinos para trocar (mais de ${T.renew_weeks} semanas)`, T.renovar.length, T.renovar.map(x => linha(x.id, `<b>${esc(x.nome)}</b> <small class=muted>mesmo treino há ${x.semanas} semanas</small>`, `<button class="sm p" data-ia="${esc(x.nome)}">✨ Gerar novo</button>`)).join(''));
  if (T.sumidos.length) h += card('😴', 'Sem treinar há mais de 7 dias', T.sumidos.length, T.sumidos.map(x => { const s = S[x.id]; return linha(x.id, `<b>${esc(x.nome)}</b> <small class=muted>${x.dias == null ? 'ainda não treinou' : `há ${x.dias} dias`}</small>`, s?.phone ? `<a class="btn sm" target=_blank rel=noopener href="${wa(s.phone, `Oi, ${primeiro(s.name)}! Senti sua falta nos treinos 💪 Está tudo bem? Seu treino está te esperando no app DE HOJE.`)}">Chamar</a>` : ''); }).join(''));
  if (T.planos.length) h += card('📆', 'Planos vencendo', T.planos.length, T.planos.map(x => linha(x.id, `<b>${esc(x.nome)}</b> <small class=warn>${x.dias < 0 ? 'venceu' : x.dias === 0 ? 'vence hoje' : `vence em ${x.dias} dia${x.dias > 1 ? 's' : ''}`} (${dbr(x.fim)})</small>`)).join(''));
  h += card('🩺', 'Ficha de saúde', T.saude.length || null, `${T.saude.length ? T.saude.map(x => linha(x.id, `<b>${esc(x.nome)}</b> <small class=err>respondeu SIM no PAR-Q — pedir liberação médica</small>`)).join('') : ''}${T.sem_anamnese ? `<p class=muted>${T.sem_anamnese} aluno${T.sem_anamnese > 1 ? 's ainda não preencheram' : ' ainda não preencheu'} a ficha. Eles veem o pedido na tela inicial do app.</p>` : '<p class=ok>Todos os alunos preencheram ✓</p>'}`);
  h += `<details class=box2><summary><b>⚙️ Ajustes do painel</b></summary>
    <label class=chk><input type=checkbox id=pn_rs ${P.daily_summary ? 'checked' : ''}> Receber este resumo no meu WhatsApp todo dia às 5h30</label>${!P.phone || !P.wa_apikey ? '<small class=warn>Para receber no WhatsApp, ative antes o WhatsApp automático na aba Perfil.</small>' : ''}
    <label class=muted>Avisar para trocar o treino depois de</label><select id=pn_rw>${[4, 5, 6, 8, 10, 12].map(n => `<option value=${n} ${n === (P.renew_weeks || 8) ? 'selected' : ''}>${n} semanas</option>`).join('')}</select><small id=pn_m class=ok></small></details>`;
  app.querySelector('#pnl').innerHTML = h;
  app.querySelectorAll('[data-al]').forEach(a => a.onclick = e => { e.preventDefault(); ctx.abrirAluno(a.dataset.al); });
  app.querySelectorAll('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); ctx.show(a.dataset.go); });
  app.querySelectorAll('[data-ia]').forEach(b => b.onclick = () => ctx.ia({ nome: b.dataset.ia }));
  app.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { const s = S[b.dataset.pg]; if (s) pagar(ctx, s, mesISO(), s.fee_cents, () => painel(ctx)); });
  const salvar = async patch => { const r = await sb.from('profiles').update(patch).eq('id', ctx.session.user.id); app.querySelector('#pn_m').textContent = r.error ? r.error.message : ' Salvo ✓'; };
  app.querySelector('#pn_rs').onchange = e => salvar({ daily_summary: e.target.checked });
  app.querySelector('#pn_rw').onchange = e => salvar({ renew_weeks: +e.target.value });
}

// ---------- Financeiro
export async function financeiro(ctx) {
  const { app, sb } = ctx; let mes = new Date(); mes.setDate(1);
  app.innerHTML = '<h2>Financeiro</h2><div id=fn>Carregando…</div>';
  const pr = await sb.from('profiles').select('pix_key,brand_name').eq('id', ctx.session.user.id).single(); const P = pr.data || {};
  const draw = async () => { const ref = mesISO(mes), box = app.querySelector('#fn');
    const [{ data: st, error }, { data: pg }] = await Promise.all([sb.from('students').select('id,name,phone,fee_cents,fee_due_day,created_at').eq('active', true).order('name'), sb.from('student_payments').select('*').eq('ref_month', ref)]);
    if (error) return box.innerHTML = `<p class=err>${esc(error.message)}</p>`;
    const pago = Object.fromEntries((pg || []).map(p => [p.student_id, p])); const atual = ref === mesISO();
    let prev = 0, rec = 0, arec = 0, atr = 0;
    const rows = st.map(s => { const p = pago[s.id]; let tag, acts = '';
      if (p) { rec += p.amount_cents; tag = `<span class="ag-st ag-ok">Pago ${dbr(p.paid_on).slice(0, 5)} · ${esc(p.method || '')}</span>`; acts = `<button class=sm data-un=${p.id}>Desfazer</button>`; if (s.fee_cents) prev += s.fee_cents; else prev += p.amount_cents; }
      else if (s.fee_cents && s.fee_due_day) { prev += s.fee_cents; const v = venceEm(s.fee_due_day, ref), dd = diasAte(v);
        if (dd < 0) { atr += s.fee_cents; tag = `<span class="ag-st ag-no">Atrasada ${-dd} dia${dd < -1 ? 's' : ''}</span>`; } else { arec += s.fee_cents; tag = `<span class="ag-st ag-wait">Vence ${dd === 0 ? 'hoje' : dbr(v).slice(0, 5)}</span>`; }
        acts = `<button class="sm p" data-pg=${s.id}>Marcar pago</button>${s.phone ? `<a class="btn sm" target=_blank rel=noopener href="${wa(s.phone, msgCobranca(s, s.fee_cents, v, P.pix_key, P.brand_name))}">Cobrar</a>` : ''}`; }
      else { tag = '<span class=muted>Sem mensalidade definida</span>'; acts = `<button class=sm data-pg=${s.id}>Registrar pagamento</button>`; }
      return `<div class=fn-r><div><b>${esc(s.name)}</b><br><small class=muted>${s.fee_cents ? `${brl(s.fee_cents)} · todo dia ${s.fee_due_day}` : ''}</small> <a href="#" class=fn-ed data-fe=${s.id}>${s.fee_cents ? 'editar' : '＋ definir mensalidade'}</a><br>${tag}</div><div class=fn-a>${acts}</div></div>`; });
    box.innerHTML = `<div class=ag-nav><button id=fn_p>‹</button><b>${esc(nomeMes(ref))}</b><button id=fn_n>›</button></div>
      <div class=fn-sum><div><small>Previsto</small><b>${brl(prev)}</b></div><div class=ok><small>Recebido</small><b>${brl(rec)}</b></div><div><small>A receber</small><b>${brl(arec)}</b></div><div class=err><small>Atrasado</small><b>${brl(atr)}</b></div></div>
      ${prev ? `<div class=bar><i style="width:${Math.min(100, Math.round(rec / prev * 100))}%"></i></div><small class=muted>${Math.round(rec / prev * 100)}% recebido</small>` : ''}
      <div class=box2><b>Sua chave PIX</b> <small class=muted>(aparece para o aluno e na mensagem de cobrança)</small><div class=bar2><input id=fn_pix maxlength=140 placeholder="CPF, celular, e-mail ou chave aleatória" value="${esc(P.pix_key || '')}"><button class=p id=fn_ps>Salvar</button></div></div>
      ${st.length ? rows.join('') : '<p class=muted>Cadastre alunos para controlar as mensalidades.</p>'}
      <p class=muted><small>Dica: defina a mensalidade e o dia de vencimento de cada aluno. O app avisa você no painel Hoje e lembra o aluno no celular 2 dias antes e no dia do vencimento.</small></p>`;
    box.querySelector('#fn_p').onclick = () => { mes.setMonth(mes.getMonth() - 1); draw(); };
    box.querySelector('#fn_n').onclick = () => { mes.setMonth(mes.getMonth() + 1); draw(); }; box.querySelector('#fn_n').disabled = atual;
    box.querySelector('#fn_ps').onclick = async () => { const v = box.querySelector('#fn_pix').value.trim() || null; const r = await sb.from('profiles').update({ pix_key: v }).eq('id', ctx.session.user.id); P.pix_key = v; box.querySelector('#fn_ps').textContent = r.error ? 'Erro' : 'Salvo ✓'; };
    box.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { const s = st.find(x => x.id === b.dataset.pg); pagar(ctx, s, ref, s.fee_cents, draw); });
    box.querySelectorAll('[data-fe]').forEach(b => b.onclick = e => { e.preventDefault(); definirMensalidade(ctx, st.find(x => x.id === b.dataset.fe), draw); });
    box.querySelectorAll('[data-un]').forEach(b => b.onclick = async () => { if (!confirm('Desfazer este pagamento?')) return; await sb.from('student_payments').delete().eq('id', b.dataset.un); draw(); });
  };
  draw();
}

// ---------- modelos de treino
export async function abrirModelos(ctx, aplicar) {
  const d = ctx.mdl('<h3>📁 Meus modelos de treino</h3><div id=tp_l>Carregando…</div><button id=tp_c>Fechar</button>'); d.querySelector('#tp_c').onclick = d.close;
  const draw = async () => { const { data, error } = await ctx.sb.from('workout_templates').select('id,name,body,created_at').order('created_at', { ascending: false });
    const l = d.querySelector('#tp_l'); if (error) return l.innerHTML = `<p class=err>${esc(error.message)}</p>`;
    if (!data.length) return l.innerHTML = '<p class=muted>Nenhum modelo ainda. Depois de reconhecer uma ficha (ou gerar no DE HOJE.IA), toque em <b>Salvar como modelo</b>.</p>';
    l.innerHTML = data.map(t => { const n = (t.body.match(/^\s*TREINO\s/gim) || []).length; return `<div class=row><div style="flex:1"><b>${esc(t.name)}</b><br><small class=muted>${n ? n + ' treino' + (n > 1 ? 's' : '') + ' · ' : ''}${dbr(t.created_at)}</small><br><button class="sm p" data-ap=${t.id}>Usar este modelo</button> <button class=sm data-rn=${t.id}>Renomear</button> <button class=sm data-rm=${t.id}>Excluir</button></div></div>`; }).join('');
    l.querySelectorAll('[data-ap]').forEach(b => b.onclick = () => { const t = data.find(x => x.id === b.dataset.ap); d.close(); aplicar(t.body); });
    l.querySelectorAll('[data-rn]').forEach(b => b.onclick = async () => { const t = data.find(x => x.id === b.dataset.rn); const n = prompt('Novo nome do modelo:', t.name); if (n && n.trim()) { await ctx.sb.from('workout_templates').update({ name: n.trim().slice(0, 120) }).eq('id', t.id); draw(); } });
    l.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (!confirm('Excluir este modelo? Os treinos já salvos nos alunos não mudam.')) return; await ctx.sb.from('workout_templates').delete().eq('id', b.dataset.rm); draw(); }); };
  draw();
}
export function salvarModelo(ctx, texto, sugestao = '') {
  // tira o nome do aluno (1ª linha sem ":" antes do primeiro TREINO) para o modelo servir para qualquer aluno
  const linhas = String(texto || '').split('\n'); const iT = linhas.findIndex(l => /^\s*TREINO\s/i.test(l));
  if (iT > 0) { const k = linhas.slice(0, iT).findIndex(l => l.trim() && !l.includes(':')); if (k >= 0) linhas.splice(k, 1); }
  const body = linhas.join('\n').trim(); if (!body) return alert('Não há treino para salvar.');
  const d = ctx.mdl(`<h3>Salvar como modelo</h3><p class=muted>O modelo fica em <b>Importar ficha → Meus modelos</b> para usar com qualquer aluno.</p><label class=muted>Nome do modelo</label><input id=sm_n maxlength=120 value="${esc(sugestao)}" placeholder="Ex.: Hipertrofia feminino 4x — glúteos"><p id=sm_m class=err></p><button class=p id=sm_s>Salvar modelo</button> <button id=sm_c>Cancelar</button>`);
  d.querySelector('#sm_c').onclick = d.close;
  d.querySelector('#sm_s').onclick = async () => { const n = d.querySelector('#sm_n').value.trim(); if (!n) return d.querySelector('#sm_m').textContent = 'Dê um nome ao modelo.';
    const r = await ctx.sb.from('workout_templates').insert({ trainer_id: ctx.session.user.id, name: n, body }); if (r.error) return d.querySelector('#sm_m').textContent = r.error.message;
    d.querySelector('.box').innerHTML = '<h3>Modelo salvo ✓</h3><p>Use em <b>Importar ficha → 📁 Meus modelos</b>.</p><button class=p id=sm_ok>Fechar</button>'; d.querySelector('#sm_ok').onclick = d.close; };
}
// texto da ficha a partir dos treinos salvos do aluno
export function textoDosTreinos(workouts) {
  const L = []; const letras = 'ABCDEFGHIJ';
  (workouts || []).forEach((w, wi) => { const nm = w.name || ''; L.push(/^treino\s/i.test(nm) ? nm.replace(/^(Treino\s+\w+)\s+—\s+/i, '$1 – ') : `TREINO ${letras[wi]} – ${nm}`); if (w.day_note) L.push(w.day_note);
    let n = 0; [...w.workout_blocks].sort((a, b) => a.position - b.position).forEach(b => { const its = [...b.block_items].sort((a, c) => a.position - c.position); n++;
      its.forEach((i, k) => { if (i.kind === 'cardio') return L.push('CARDIO — ' + i.raw_text); const lt = its.length > 1 ? 'abc'[k] || '' : '';
        L.push(`${n}${lt}. ${i.exercises?.name || i.raw_text} — ${b.sets || 3}x ${i.reps || '10'}${k === its.length - 1 ? ` | Pausa: ${b.rest_seconds ?? 60}s` : ''}${i.note ? ' | ' + i.note : ''}`); }); });
    L.push(''); });
  return L.join('\n').trim();
}

// ---------- avaliação física completa
function novaAvaliacao(ctx, st, ultima, done) {
  const u = ultima || {}; const sex = u.sex || 'f';
  const d = ctx.mdl(`<h3>📏 Nova avaliação — ${esc(st.name)}</h3>
    <div class=mgrid><label>Data<input id=av_d type=date value="${hojeISO()}"></label><label>Sexo<select id=av_s><option value=f ${sex === 'f' ? 'selected' : ''}>Feminino</option><option value=m ${sex === 'm' ? 'selected' : ''}>Masculino</option></select></label>
    <label>Idade<input id=av_i inputmode=numeric value="${esc(u.age || '')}"></label><label>Peso (kg)<input id=av_w inputmode=decimal></label><label>Altura (cm)<input id=av_h inputmode=decimal value="${esc(u.height_cm || '')}"></label>
    <label>Protocolo<select id=av_p><option value=pollock7>Dobras — Pollock 7</option><option value=pollock3>Dobras — Pollock 3</option><option value=manual>Só medidas / % gordura de outro método</option></select></label></div>
    <div id=av_dobras></div><div id=av_man class=mgrid style="display:none"><label>% gordura (bioimpedância etc.)<input id=av_f inputmode=decimal></label></div>
    <h4>Circunferências (cm)</h4><div class=mgrid>${CIRC.map(([k, t]) => `<label>${t}<input data-c=${k} inputmode=decimal></label>`).join('')}</div>
    <label class=muted>Observações</label><textarea id=av_n style="min-height:60px" maxlength=1000></textarea>
    <div id=av_res class=av-res></div><p id=av_m class=err></p><button class=p id=av_ok>Salvar avaliação</button> <button id=av_c>Cancelar</button>`);
  const q = s => d.querySelector(s);
  const dobras = () => { const p = q('#av_p').value, sx = q('#av_s').value; q('#av_man').style.display = p === 'manual' ? '' : 'none';
    const ks = p === 'pollock7' ? DOBRAS7 : p === 'pollock3' ? DOBRAS7.filter(([k]) => DOBRAS3[sx].includes(k)) : [];
    const old = {}; d.querySelectorAll('[data-f]').forEach(i => old[i.dataset.f] = i.value);
    q('#av_dobras').innerHTML = ks.length ? `<h4>Dobras cutâneas (mm)</h4><div class=mgrid>${ks.map(([k, t]) => `<label>${t}<input data-f=${k} inputmode=decimal value="${esc(old[k] || '')}"></label>`).join('')}</div>` : '';
    d.querySelectorAll('input').forEach(i => i.oninput = calc); calc(); };
  const dados = () => { const folds = {}, circ = {}; d.querySelectorAll('[data-f]').forEach(i => { const v = nz(i.value); if (v != null) folds[i.dataset.f] = v; }); d.querySelectorAll('[data-c]').forEach(i => { const v = nz(i.value); if (v != null) circ[i.dataset.c] = v; });
    return { sex: q('#av_s').value, age: parseInt(q('#av_i').value) || null, weight_kg: nz(q('#av_w').value), height_cm: nz(q('#av_h').value), protocol: q('#av_p').value, folds, circ, body_fat_pct: q('#av_p').value === 'manual' ? nz(q('#av_f').value) : null }; };
  const calc = () => { const r = calcAval(dados()); const P = [];
    if (r.fat != null) P.push(`<div><small>% gordura</small><b>${br(r.fat)}%</b><em>${r.fatTxt}</em></div>`); if (r.massaMagra) P.push(`<div><small>Massa magra</small><b>${br(r.massaMagra)} kg</b></div>`); if (r.massaGorda) P.push(`<div><small>Massa gorda</small><b>${br(r.massaGorda)} kg</b></div>`);
    if (r.imc) P.push(`<div><small>IMC</small><b>${br(r.imc.toFixed(1))}</b><em>${r.imcTxt}</em></div>`); if (r.rcq) P.push(`<div><small>Cintura/quadril</small><b>${br(r.rcq)}</b><em>${r.rcqRisco}</em></div>`);
    q('#av_res').innerHTML = P.length ? `<div class=av-g>${P.join('')}</div>` : '<small class=muted>Preencha idade, peso e as dobras para ver o percentual de gordura calculado.</small>'; return r; };
  q('#av_p').onchange = dobras; q('#av_s').onchange = dobras; dobras();
  q('#av_c').onclick = d.close;
  q('#av_ok').onclick = async () => { const x = dados(), r = calcAval(x); if (!x.weight_kg && r.fat == null && !Object.keys(x.circ).length) return q('#av_m').textContent = 'Preencha ao menos o peso ou as medidas.';
    const row = { trainer_id: ctx.session.user.id, student_id: st.id, measured_on: q('#av_d').value || hojeISO(), ...x, body_fat_pct: r.fat ?? null, note: q('#av_n').value.trim() || null };
    const res = await ctx.sb.from('assessments').insert(row); if (res.error) return q('#av_m').textContent = res.error.message; d.close(); done && done(); };
}
function relatorioAvaliacao(ctx, st, lista, marca) {
  const a = lista[lista.length - 1], z = lista[0], r = calcAval(a), r0 = calcAval(z);
  const dv = (x, y, u, bomDesce = true) => lista.length > 1 && x != null && y != null && x !== y ? ` <small class="${(x < y) === bomDesce ? 'ok' : 'err'}">${x > y ? '+' : ''}${br(Math.round((x - y) * 10) / 10)} ${u}</small>` : '';
  const linha = (t, v, extra = '') => v != null && v !== '' ? `<tr><td>${t}</td><td><b>${v}</b>${extra}</td></tr>` : '';
  const d = ctx.mdl(`<div class=rep id=rep><div class=rep-h><div><b>Avaliação física</b><br><span>${esc(st.name)}</span></div><div class=rep-m>${esc(marca || 'DE HOJE')}<br><small>${dbr(a.measured_on)}</small></div></div>
    <div class=av-g>${r.fat != null ? `<div><small>% gordura</small><b>${br(r.fat)}%</b><em>${r.fatTxt}</em>${dv(r.fat, r0.fat, '%')}</div>` : ''}${a.weight_kg != null ? `<div><small>Peso</small><b>${br(a.weight_kg)} kg</b>${dv(+a.weight_kg, +z.weight_kg, 'kg')}</div>` : ''}${r.massaMagra ? `<div><small>Massa magra</small><b>${br(r.massaMagra)} kg</b>${dv(r.massaMagra, r0.massaMagra, 'kg', false)}</div>` : ''}${r.massaGorda ? `<div><small>Massa gorda</small><b>${br(r.massaGorda)} kg</b>${dv(r.massaGorda, r0.massaGorda, 'kg')}</div>` : ''}</div>
    <table class=evo>${linha('Idade', a.age ? a.age + ' anos' : '')}${linha('Altura', a.height_cm ? br(a.height_cm) + ' cm' : '')}${linha('IMC', r.imc ? br(r.imc.toFixed(1)) : '', r.imc ? ` <small class=muted>${r.imcTxt}</small>` : '')}${linha('Cintura/quadril', r.rcq ? br(r.rcq) : '', r.rcq ? ` <small class=muted>${r.rcqRisco}</small>` : '')}${linha('Protocolo', { pollock7: 'Pollock 7 dobras', pollock3: 'Pollock 3 dobras', manual: 'Medidas' }[a.protocol])}${linha('Soma das dobras', r.soma ? br(r.soma) + ' mm' : '')}</table>
    ${Object.keys(a.circ || {}).length ? `<h4>Circunferências (cm)</h4><table class=evo><tr><th></th><th>Agora</th>${lista.length > 1 ? `<th>${dbr(z.measured_on)}</th>` : ''}</tr>${CIRC.filter(([k]) => a.circ[k] != null).map(([k, t]) => `<tr><td>${t}</td><td><b>${br(a.circ[k])}</b>${dv(+a.circ[k], z.circ?.[k] != null ? +z.circ[k] : null, '', !/braco|coxa|panturrilha/.test(k))}</td>${lista.length > 1 ? `<td>${z.circ?.[k] != null ? br(z.circ[k]) : '–'}</td>` : ''}</tr>`).join('')}</table>` : ''}
    ${Object.keys(a.folds || {}).length ? `<h4>Dobras (mm)</h4><table class=evo>${DOBRAS7.filter(([k]) => a.folds[k] != null).map(([k, t]) => `<tr><td>${t}</td><td><b>${br(a.folds[k])}</b></td></tr>`).join('')}</table>` : ''}
    ${grafico(lista.map(x => [x.measured_on, x.body_fat_pct]), '% gordura')}${grafico(lista.map(x => [x.measured_on, x.weight_kg]), 'Peso (kg)')}
    ${a.note ? `<p><b>Observações:</b> ${esc(a.note)}</p>` : ''}<p class=rep-f><small>Cálculo: Jackson & Pollock (densidade corporal) e Siri (% gordura). Gerado pelo app DE HOJE.</small></p></div>
    <div class=noprint><button class=p id=rp_pr>🖨️ Imprimir ou salvar em PDF</button> ${st.phone ? `<a class=btn target=_blank rel=noopener href="${wa(st.phone, `Oi, ${primeiro(st.name)}! Resultado da sua avaliação de ${dbr(a.measured_on)}:\n${r.fat != null ? `• Gordura: ${br(r.fat)}%\n` : ''}${a.weight_kg != null ? `• Peso: ${br(a.weight_kg)} kg\n` : ''}${r.massaMagra ? `• Massa magra: ${br(r.massaMagra)} kg\n` : ''}${lista.length > 1 && r.fat != null && r0.fat != null ? `• Desde ${dbr(z.measured_on)}: ${r.fat - r0.fat > 0 ? '+' : ''}${br(Math.round((r.fat - r0.fat) * 10) / 10)}% de gordura\n` : ''}\nSeguimos firmes! 💪`)}">Enviar resumo no WhatsApp</a>` : ''} <button id=rp_c>Fechar</button></div>`);
  d.classList.add('full'); d.querySelector('#rp_c').onclick = d.close;
  d.querySelector('#rp_pr').onclick = () => { document.body.classList.add('printing'); setTimeout(() => { window.print(); document.body.classList.remove('printing'); }, 50); };
}

// ---------- seções extras na página do aluno
export async function alunoExtras(ctx, box, st, workouts) {
  const { sb } = ctx; const ref = mesISO();
  const [{ data: pg }, { data: an }, { data: av }, { data: pr }] = await Promise.all([
    sb.from('student_payments').select('*').eq('student_id', st.id).order('ref_month', { ascending: false }).limit(12),
    sb.from('anamneses').select('*').eq('student_id', st.id).maybeSingle(),
    sb.from('assessments').select('*').eq('student_id', st.id).order('measured_on'),
    sb.from('profiles').select('pix_key,brand_name,renew_weeks').eq('id', ctx.session.user.id).single()]);
  const P = pr || {}; let h = '';
  // treino atual / troca
  const wk = (workouts || []); const ini = wk.length ? Math.min(...wk.map(w => new Date(w.created_at || Date.now()).getTime())) : null; const sem = ini ? Math.floor((Date.now() - ini) / 6048e5) : 0, rw = P.renew_weeks || 8;
  if (wk.length) h += `<div class="box2${sem >= rw ? ' pn-warn' : ''}"><b>🔄 Treino atual</b><p>${sem >= rw ? `⚠️ <b>Mesmo treino há ${sem} semanas</b> — hora de trocar.` : `Treino montado há ${sem} semana${sem === 1 ? '' : 's'}. Aviso de troca com ${rw} semanas.`}</p><button class="sm p" id=x_ia>✨ Gerar próximo com DE HOJE.IA</button> <button class=sm id=x_tpl>📁 Salvar treino como modelo</button></div>`;
  // mensalidade
  const pm = (pg || []).find(p => p.ref_month === ref);
  let ms = '<span class=muted>Sem mensalidade definida.</span>';
  if (st.fee_cents && st.fee_due_day) { const v = venceEm(st.fee_due_day, ref), dd = diasAte(v); ms = `<b>${brl(st.fee_cents)}</b> todo dia ${st.fee_due_day} · ${pm ? `<span class="ag-st ag-ok">Pago ${dbr(pm.paid_on).slice(0, 5)}</span>` : dd < 0 ? `<span class="ag-st ag-no">Atrasada ${-dd} dia${dd < -1 ? 's' : ''}</span>` : `<span class="ag-st ag-wait">Vence ${dd === 0 ? 'hoje' : dbr(v).slice(0, 5)}</span>`}`; }
  h += `<div class=box2><b>💰 Mensalidade</b><p>${ms}</p><button class=sm id=x_fe>${st.fee_cents ? 'Editar mensalidade' : '＋ Definir mensalidade'}</button>${!pm ? ' <button class="sm p" id=x_pg>Marcar mês pago</button>' : ''}${!pm && st.phone && st.fee_cents ? ` <a class="btn sm" target=_blank rel=noopener href="${wa(st.phone, msgCobranca(st, st.fee_cents, venceEm(st.fee_due_day, ref), P.pix_key, P.brand_name))}">Cobrar no WhatsApp</a>` : ''}
    ${(pg || []).length ? `<details><summary>Pagamentos (${pg.length})</summary><table class=evo>${pg.map(p => `<tr><td>${esc(nomeMes(p.ref_month))}</td><td>${brl(p.amount_cents)}</td><td>${dbr(p.paid_on)}</td><td>${esc(p.method || '')}</td></tr>`).join('')}</table></details>` : ''}</div>`;
  // ficha de saúde
  h += `<div class="box2${an?.parq_alert ? ' pn-warn' : ''}"><b>🩺 Ficha de saúde (anamnese e PAR-Q)</b>${an ? `<p class=muted><small>Preenchida em ${dbr(an.updated_at)}</small></p><details ${an.parq_alert ? 'open' : ''}><summary>Ver respostas</summary>${anamneseHTML(an.answers)}</details>` : `<p class=muted>Ainda não preencheu. O pedido aparece na tela inicial do app do aluno.</p>${st.phone ? `<a class="btn sm" target=_blank rel=noopener href="${wa(st.phone, `Oi, ${primeiro(st.name)}! Preenche sua ficha de saúde no app DE HOJE? Leva 2 minutos e me ajuda a montar um treino seguro para você. É só abrir o app e tocar em "Preencher" na tela inicial 🙏`)}">Pedir no WhatsApp</a>` : ''}`}</div>`;
  // avaliação física
  const L = av || [];
  h += `<div class=box2><b>📏 Avaliação física</b>${L.length ? `<div style="overflow:auto"><table class=evo><tr><th>Data</th><th>Peso</th><th>%G</th><th>M. magra</th><th>Cintura</th><th></th></tr>${[...L].reverse().map(a => { const r = calcAval(a); return `<tr><td>${dbr(a.measured_on)}</td><td>${a.weight_kg != null ? br(a.weight_kg) : '–'}</td><td>${r.fat != null ? br(r.fat) : '–'}</td><td>${r.massaMagra ? br(r.massaMagra) : '–'}</td><td>${a.circ?.cintura != null ? br(a.circ.cintura) : '–'}</td><td><button class=sm data-avx=${a.id} aria-label="Apagar">✕</button></td></tr>`; }).join('')}</table></div>${grafico(L.map(a => [a.measured_on, a.body_fat_pct]), '% gordura')}` : '<p class=muted>Nenhuma avaliação ainda. Pollock 3 ou 7 dobras, bioimpedância ou só medidas — o app calcula % de gordura, massa magra, IMC e cintura/quadril.</p>'}
    <button class="sm p" id=x_av>＋ Nova avaliação</button>${L.length ? ' <button class=sm id=x_rp>📄 Relatório</button>' : ''}</div>`;
  // relatório do mês
  h += `<div class=box2><b>📊 Relatório do mês</b><p class=muted>Treinos, recordes e cargas que subiram. O aluno também vê no app e recebe um aviso no dia 1.</p><button class=sm id=x_rel>Ver relatório</button> <button class=sm id=x_relw>Enviar no WhatsApp</button></div>`;
  box.innerHTML = h;
  const q = s => box.querySelector(s), re = () => ctx.reload();
  if (q('#x_ia')) q('#x_ia').onclick = () => ctx.ia({ nome: st.name });
  if (q('#x_tpl')) q('#x_tpl').onclick = () => salvarModelo(ctx, textoDosTreinos(wk), 'Treino de ' + primeiro(st.name));
  q('#x_fe').onclick = () => definirMensalidade(ctx, st, re);
  if (q('#x_pg')) q('#x_pg').onclick = () => pagar(ctx, st, ref, st.fee_cents, re);
  q('#x_av').onclick = () => novaAvaliacao(ctx, st, L[L.length - 1], re);
  if (q('#x_rp')) q('#x_rp').onclick = () => relatorioAvaliacao(ctx, st, L, P.brand_name);
  box.querySelectorAll('[data-avx]').forEach(b => b.onclick = async () => { if (confirm('Apagar esta avaliação?')) { await sb.from('assessments').delete().eq('id', b.dataset.avx); re(); } });
  const carregar = async iso => { const r = await sb.rpc('trainer_month_report', { p_student: st.id, p_month: iso }); if (r.error) throw r.error; return r.data; };
  q('#x_rel').onclick = () => abrirRelatorio(ctx.mdl, carregar, st.name);
  q('#x_relw').onclick = async () => { const m = new Date(); if (m.getDate() <= 5) m.setMonth(m.getMonth() - 1); const r = await carregar(mesISO(m)); const t = relatorioTexto(r, st.name);
    if (st.phone) window.open(wa(st.phone, t), '_blank'); else { try { await navigator.clipboard.writeText(t); alert('Relatório copiado. Cole no WhatsApp do aluno.'); } catch { prompt('Copie o relatório:', t); } } };
}
