// Tela do DE HOJE.IA (treinador).
// IA avançada (servidor): o professor define o tipo de treino — inclusive "Personalizado", descrito do jeito dele —,
// quantidades por grupo, métodos, cardio, restrições e o "Meu método" permanente. A IA usa só exercícios da base do app,
// o servidor confere as quantidades e devolve a ficha pronta para revisar no Importar ficha.
// Se a IA avançada não estiver ativa, cai no gerador básico por regras (montarIABasica).
import { gerarTreino, OBJETIVOS, lerPedido } from './ia.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TIPOS = [
  ['personalizado', '✍️', 'Personalizado'], ['hipertrofia', '💪', 'Hipertrofia'], ['forca', '🏋️', 'Força'], ['emagrecimento', '🔥', 'Emagrecimento'],
  ['condicionamento', '⚡', 'Condicionamento'], ['resistencia', '🔁', 'Resistência muscular'], ['funcional', '🤸', 'Funcional'], ['mobilidade', '🧘', 'Mobilidade'],
  ['reabilitacao', '🩹', 'Readaptação'], ['gestante', '🤰', 'Gestante'], ['idoso', '🧓', 'Pessoa idosa'], ['performance', '🏃', 'Performance'],
];
const DIVISOES = [['auto', 'IA decide'], ['full body', 'Corpo inteiro'], ['AB', 'AB'], ['ABC', 'ABC'], ['ABCD', 'ABCD'], ['ABCDE', 'ABCDE'], ['superior/inferior', 'Superior / Inferior'], ['push/pull/legs', 'Empurrar / Puxar / Pernas']];
const METODOS = [['biset', 'Bi-set'], ['triset', 'Tri-set'], ['superset', 'Superset'], ['dropset', 'Drop-set'], ['piramide', 'Pirâmide'], ['rest_pause', 'Rest-pause'], ['cluster', 'Cluster'], ['isometria', 'Isometria'], ['pre_exaustao', 'Pré-exaustão'], ['negativa', 'Excêntrica lenta']];
const LOCAIS = [['academia completa', 'Academia completa'], ['casa com halteres e elásticos', 'Casa (halteres e elásticos)'], ['apenas peso do corpo', 'Só peso do corpo'], ['box funcional', 'Box funcional'], ['estúdio de pilates', 'Estúdio de pilates']];
const CARDIO_MOD = [['', 'IA decide'], ['esteira', 'Esteira'], ['elíptico', 'Elíptico'], ['bicicleta', 'Bike'], ['spinning', 'Spinning'], ['remo', 'Remo'], ['escada', 'Escada'], ['airbike', 'AirBike'], ['corrida na rua', 'Corrida / rua']];
const CARDIO_PROT = [['', 'IA decide'], ['contínuo leve (zona 2)', 'Contínuo leve'], ['contínuo moderado', 'Moderado'], ['intervalado (HIIT)', 'Intervalado / HIIT'], ['tiros curtos com recuperação completa', 'Tiros']];
const PH = {
  personalizado: 'Descreva o treino do seu jeito. Ex.: "Treino de força para membros inferiores com 5 exercícios, começando por agachamento livre 5x5 com 3 min de pausa; depois 2 acessórios de posterior e 1 de glúteo; fechar com 2 exercícios de core anti-rotação. Superiores só 2 exercícios, de puxar. Cadência 3-1-1."',
  outro: 'Opcional, mas é o que deixa o treino com a sua cara. Ex.: "Quero 4 exercícios de membros superiores e 3 de inferiores, começar sempre com o multiarticular mais pesado, bi-set só no final, nada de máquina Smith, cardio de 15 min no final em zona 2."',
};
const LOADING = ['Lendo o seu pedido…', 'Escolhendo os exercícios da base…', 'Montando séries, pausas e métodos…', 'Conferindo as quantidades que você pediu…', 'Finalizando a ficha…'];

// gerar/refinar rodam em segundo plano no servidor: o app pergunta o resultado a cada 3 s (continua mesmo se você sair do app e voltar)
async function esperar(sb, job) {
  const fim = Date.now() + 240000;
  while (Date.now() < fim) {
    await new Promise(r => setTimeout(r, 3000));
    if (document.hidden) continue;
    let d; try { d = await chamar(sb, { action: 'resultado', job }); } catch (e) { if (/Failed to send|fetch|network/i.test(e.message)) continue; throw e; }
    if (!d.pendente) return d;
  }
  throw new Error('A IA demorou demais. Tente de novo.');
}

async function chamar(sb, body) {
  const { data, error } = await sb.functions.invoke('dehoje-ia', { body });
  if (data?.error) throw new Error(data.error);
  if (error) { let m = error.message; try { const j = await error.context?.json?.(); if (j?.error) m = j.error; } catch {} throw new Error(m); }
  return data;
}

// texto no formato do "Importar ficha" (mesmo padrão do gerador básico)
export function paraFicha(r, nome) {
  const L = [];
  if (nome) L.push(nome);
  if (r.titulo) L.push('Objetivo: ' + r.titulo);
  L.push('');
  const letras = 'ABCDEFGHIJ';
  (r.treinos || []).forEach((t, ti) => {
    const foco = String(t.foco || '').replace(/[\r\n]+/g, ' ');
    L.push(`TREINO ${letras[ti] || ti + 1} – ${foco || t.nome || ''}`.trim());
    if (t.observacao_dia) L.push(String(t.observacao_dia).replace(/[\r\n]+/g, ' '));
    let n = 0;
    const tagMet = { piramide: 'pirâmide', piramide_inv: 'pirâmide invertida', dropset: 'drop-set', rest_pause: 'rest-pause', cluster: 'cluster', isometria: 'isometria', negativa: 'excêntrica lenta' };
    for (const b of t.blocos || []) {
      const its = (b.itens || []).filter(i => i.exercicio_id);
      if (!its.length) continue;
      const pausa = b.descanso_s ? ` | Pausa: ${b.descanso_s >= 120 && b.descanso_s % 60 === 0 ? b.descanso_s / 60 + ' min' : b.descanso_s + 's'}` : '';
      const extra = i => [i.carga_sugerida, i.nota].filter(Boolean).map(x => String(x).replace(/[|\r\n]+/g, ' ')).join(' · ');
      if (b.metodo === 'cardio' && its.every(i => i.grupo === 'cardio' && /^cardio:/i.test(i.exercicio_nome))) {
        for (const i of its) L.push(`CARDIO — ${i.exercicio_nome.replace(/^Cardio:\s*/i, '')} | ${i.repeticoes}${extra(i) ? ' — ' + extra(i) : ''}`);
        continue;
      }
      if (its.length > 1) {
        n++;
        its.forEach((i, k) => { const ult = k === its.length - 1; const ex = extra(i);
          L.push(`${n}${'abcdefgh'[k]}. ${i.exercicio_nome} — ${b.series || 3}x ${i.repeticoes}${ult ? pausa : ''}${ex ? ' | ' + ex : ''}`); });
      } else {
        n++; const i = its[0]; let reps = String(i.repeticoes || ''), tg = tagMet[b.metodo];
        const seq = reps.match(/\d+/g) || [];
        if (/\d\s*\/\s*\d/.test(reps) && seq.length > 2) { tg = `${tg || 'pirâmide'}: ${seq.join('/')}`; const ns = seq.map(Number); reps = `${Math.min(...ns)}-${Math.max(...ns)}`; }
        const ex = [tg, extra(i)].filter(Boolean).join(' · ');
        const sr = /^\d+\s*[xX×]/.test(reps) ? reps : `${b.series || 1}x ${reps}`;
        L.push(`${n}. ${i.exercicio_nome} — ${sr}${pausa}${ex ? ' | ' + ex : ''}`);
      }
    }
    L.push('');
  });
  const geral = [r.progressao, ...(r.alertas || [])].filter(Boolean);
  if (geral.length) { L.push('ORIENTAÇÕES'); geral.forEach(g => L.push(String(g).replace(/[\r\n]+/g, ' '))); }
  return L.join('\n').trim();
}

export async function montarIA(root, opts) {
  const { sb } = opts;
  if (!sb) return montarIABasica(root, opts);
  root.innerHTML = '<p class=muted>Carregando a DE HOJE.IA…</p>';
  let status;
  try { status = await chamar(sb, { action: 'status' }); } catch { status = null; }
  if (!status?.configurada) {
    montarIABasica(root, opts);
    root.insertAdjacentHTML('afterbegin', '<p class="ia-aviso">A IA avançada ainda não está ativa. Por enquanto, este é o gerador básico.</p>');
    return;
  }
  montarAvancada(root, opts, status);
}

function montarAvancada(root, { alunos = [], usar, nome = '', modelo, sb }, status) {
  let st = { tipo: 'personalizado', preset: '', sexo: '', idade: '', nivel: '', frequencia: 3, duracao: 60, divisao: 'auto', mmss: null, mmii: null, core: null, metodos: [], cardio: 'nao', cmom: 'final', cmod: '', cdur: 20, cprot: '', local: 'academia completa' };
  try { st = { ...st, ...JSON.parse(localStorage.getItem('dh_ia2') || '{}') }; } catch {}
  let presets = status.presets || [];
  let ultimo = null, briefing = null;

  const chips = (k, list, multi) => `<div class=ia-chips data-k=${k}${multi ? ' data-multi=1' : ''}>${list.map(([v, t]) => {
    const on = multi ? (st[k] || []).includes(v) : String(st[k]) === String(v);
    return `<button type=button data-v="${esc(v)}" class="${on ? 'on' : ''}">${esc(t)}</button>`; }).join('')}</div>`;
  const step = (k, rot) => `<div class=ia-step data-k=${k}><span>${rot}</span><button type=button data-d=-1>−</button><b>${st[k] == null ? 'livre' : st[k]}</b><button type=button data-d=1>+</button></div>`;
  const tiposHtml = () => `<div class="ia-chips ia-obj" data-k=tipo>${TIPOS.map(([v, ic, t]) => `<button type=button data-v="${v}" class="${!st.preset && st.tipo === v ? 'on' : ''}"><span>${ic}</span>${t}</button>`).join('')}
    ${presets.map(p => `<button type=button data-p="${p.id}" class="ia-preset ${st.preset === p.id ? 'on' : ''}"><span>⭐</span>${esc(p.name)}</button>`).join('')}</div>`;

  root.innerHTML = `<div class=ia>
    <div class=ia-top><h2>✨ DE HOJE.IA</h2><p class=muted>Você define como quer o treino, e a IA monta a ficha com os exercícios e desenhos do app, seguindo o seu jeito de trabalhar. Você revisa tudo antes de salvar para o aluno.</p></div>
    <label class=muted>Nome do aluno (fica só no app, não vai para a IA)</label><input id=ia-nome list=ia-al placeholder="Ex.: Gabriela" autocomplete=off value="${esc(nome)}"><datalist id=ia-al>${alunos.map(a => `<option value="${esc(a)}">`).join('')}</datalist>

    <h3 class=ia-h>1. Tipo de treino</h3>
    <div id=ia-tipos>${tiposHtml()}</div>
    <label class=muted for=ia-ped id=ia-ped-l></label>
    <textarea id=ia-ped class=ia-ped></textarea>
    <div id=ia-presetbox></div>
    <label class=chk><input type=checkbox id=ia-salvar> Salvar como um tipo de treino meu, para usar de novo</label>
    <input id=ia-pnome placeholder="Nome do seu tipo de treino. Ex.: Força Matheus" hidden maxlength=60>

    <h3 class=ia-h>2. Perfil do aluno</h3>
    <div class=ia-2>
      <div><label class=muted>Sexo</label>${chips('sexo', [['', 'Não informar'], ['feminino', 'Feminino'], ['masculino', 'Masculino']])}</div>
      <div><label class=muted>Nível</label>${chips('nivel', [['', 'IA decide'], ['iniciante', 'Iniciante'], ['intermediário', 'Intermediário'], ['avançado', 'Avançado']])}</div>
    </div>
    <label class=muted>Idade (opcional)</label><input id=ia-idade type=number min=10 max=100 inputmode=numeric value="${esc(st.idade)}" placeholder="Ex.: 34" style="max-width:140px">
    <label class=muted>Treinos por semana</label>${chips('frequencia', [1, 2, 3, 4, 5, 6, 7].map(n => [n, n + 'x']))}
    <label class=muted>Tempo de cada treino</label>${chips('duracao', [30, 40, 45, 50, 60, 75, 90].map(n => [n, n + ' min']))}

    <h3 class=ia-h>3. Estrutura</h3>
    <label class=muted>Exercícios por treino (toque em + para definir; “livre” = a IA decide)</label>
    <div class=ia-steps>${step('mmss', 'Membros superiores')}${step('mmii', 'Membros inferiores')}${step('core', 'Core / abdômen')}</div>
    <label class=muted>Divisão</label>${chips('divisao', DIVISOES)}
    <label class=muted>Métodos que a IA pode usar (nenhum marcado = só séries normais, a não ser que você peça no texto)</label>${chips('metodos', METODOS, true)}

    <h3 class=ia-h>4. Cardio</h3>
    ${chips('cardio', [['nao', 'Sem cardio'], ['sim', 'Com cardio'], ['ia', 'IA decide']])}
    <div id=ia-cardio>
      <label class=muted>Quando</label>${chips('cmom', [['início do treino', 'Início'], ['final do treino', 'Final'], ['em dias separados', 'Dia separado']])}
      <label class=muted>Aparelho</label>${chips('cmod', CARDIO_MOD)}
      <label class=muted>Duração</label>${chips('cdur', [10, 15, 20, 25, 30, 40, 50].map(n => [n, n + ' min']))}
      <label class=muted>Protocolo</label>${chips('cprot', CARDIO_PROT)}
    </div>

    <h3 class=ia-h>5. Local e cuidados</h3>
    ${chips('local', LOCAIS)}
    <input id=ia-equip placeholder="Equipamentos a mais ou a evitar (opcional). Ex.: tem leg press 45°, não tem Smith">
    <textarea id=ia-rest class=ia-rest placeholder="Restrições e cuidados (opcional). Ex.: condromalácia no joelho direito, evitar agachamento profundo; hérnia lombar L5-S1."></textarea>

    <details class=ia-met ${status.metodo ? '' : 'open'}><summary>🧠 Meu método (a IA segue em todos os seus treinos)</summary>
      <p class=muted>Escreva uma vez como você trabalha. Ex.: “Sempre começo com 5 min de mobilidade. Iniciantes só em máquinas nas 4 primeiras semanas. Cadência 3-1-1. Nunca coloco dois exercícios de lombar no mesmo dia. Gosto de terminar com core.”</p>
      <textarea id=ia-metodo class=ia-rest maxlength=3000>${esc(status.metodo || '')}</textarea>
      <button type=button class=sm id=ia-metsave>Salvar meu método</button> <small id=ia-metmsg class=muted></small>
    </details>

    <button class="p ia-go" id=ia-go>✨ Gerar treino</button>
    <p class="muted ia-uso" id=ia-uso>${status.usados_24h || 0} de ${status.limite_24h} gerações usadas nas últimas 24 horas.</p>
    <div id=ia-res></div></div>`;

  const $ = s => root.querySelector(s);
  const salvarLocal = () => { try { localStorage.setItem('dh_ia2', JSON.stringify(st)); } catch {} };
  const ped = $('#ia-ped');

  const atualizaTipo = () => {
    const pers = st.tipo === 'personalizado' && !st.preset;
    $('#ia-ped-l').innerHTML = st.preset ? 'Ajustes para este treino (opcional)' : pers ? '<b>Descreva como você quer este treino</b> (obrigatório)' : 'Como você quer este treino';
    ped.placeholder = pers ? PH.personalizado : PH.outro;
    const p = presets.find(x => x.id === st.preset);
    $('#ia-presetbox').innerHTML = p ? `<div class=ia-pbox><b>⭐ ${esc(p.name)}</b><p>${esc(p.description)}</p><button type=button class=sm id=ia-pdel>Excluir este tipo</button></div>` : '';
    if (p) $('#ia-pdel').onclick = async () => { if (!confirm(`Excluir o tipo “${p.name}”?`)) return;
      try { await chamar(sb, { action: 'excluir_preset', id: p.id }); presets = presets.filter(x => x.id !== p.id); st.preset = ''; $('#ia-tipos').innerHTML = tiposHtml(); ligaTipos(); atualizaTipo(); } catch (e) { alert(e.message); } };
  };
  const ligaTipos = () => { $('#ia-tipos .ia-chips').onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.p) { st.preset = b.dataset.p; } else { st.preset = ''; st.tipo = b.dataset.v; }
    $('#ia-tipos').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); atualizaTipo(); salvarLocal(); }; };
  ligaTipos(); atualizaTipo();

  root.querySelectorAll('.ia-chips[data-k]').forEach(g => { if (g.dataset.k === 'tipo') return; g.onclick = e => { const b = e.target.closest('button'); if (!b) return;
    const k = g.dataset.k, v = /^\d+$/.test(b.dataset.v) ? +b.dataset.v : b.dataset.v;
    if (g.dataset.multi) { const s = new Set(st[k] || []); s.has(v) ? s.delete(v) : s.add(v); st[k] = [...s]; b.classList.toggle('on'); }
    else { st[k] = v; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }
    if (k === 'cardio') $('#ia-cardio').hidden = st.cardio !== 'sim'; salvarLocal(); }; });
  $('#ia-cardio').hidden = st.cardio !== 'sim';
  root.querySelectorAll('.ia-step').forEach(s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = s.dataset.k;
    let v = st[k] == null ? (+b.dataset.d > 0 ? 0 : null) : st[k] + +b.dataset.d; if (v != null && v < 0) v = null; if (v > 12) v = 12;
    st[k] = v; s.querySelector('b').textContent = v == null ? 'livre' : v; salvarLocal(); });
  $('#ia-salvar').onchange = e => { $('#ia-pnome').hidden = !e.target.checked; if (e.target.checked) $('#ia-pnome').focus(); };
  $('#ia-metsave').onclick = async () => { const m = $('#ia-metmsg'); m.textContent = 'Salvando…';
    try { await chamar(sb, { action: 'salvar_metodo', texto: $('#ia-metodo').value.trim() }); m.textContent = 'Salvo ✓'; } catch (e) { m.textContent = e.message; } };

  const montarBriefing = () => {
    st.idade = $('#ia-idade').value.trim(); salvarLocal();
    const vol = {}; ['mmss', 'mmii', 'core'].forEach(k => { if (st[k] != null) vol[k] = st[k]; });
    const b = { tipo: st.preset ? (presets.find(p => p.id === st.preset)?.base_type || 'personalizado') : st.tipo, preset_id: st.preset || undefined,
      descricao: ped.value.trim(), sexo: st.sexo || undefined, idade: st.idade ? +st.idade : undefined, nivel: st.nivel || undefined,
      frequencia: st.frequencia, duracao_min: st.duracao, divisao: st.divisao, volume: vol, metodos: st.metodos,
      equipamentos: [st.local, $('#ia-equip').value.trim()].filter(Boolean).join('; '), restricoes: $('#ia-rest').value.trim() || undefined };
    if (st.cardio === 'sim') b.cardio = { incluir: true, momento: st.cmom, modalidade: st.cmod || undefined, duracao_min: st.cdur, protocolo: st.cprot || undefined };
    else if (st.cardio === 'nao') b.cardio = { incluir: false };
    return b;
  };

  const carregando = (on) => { const g = $('#ia-go'); g.disabled = on; let i = 0; clearInterval(g._t);
    if (on) { g.textContent = LOADING[0]; g._t = setInterval(() => { i = Math.min(i + 1, LOADING.length - 1); g.textContent = LOADING[i]; }, 7000); }
    else g.textContent = '✨ Gerar treino'; };

  const mostrar = (data) => {
    const r = data.resultado; ultimo = r;
    $('#ia-uso').textContent = `${data.usados_24h} de ${data.limite_24h} gerações usadas nas últimas 24 horas.`;
    const texto = paraFicha(r, $('#ia-nome').value.trim());
    const resumo = (r.treinos || []).map((t, ti) => `<div class=ia-tcard><b>Treino ${'ABCDEFGHIJ'[ti]} · ${esc(t.foco || t.nome)}</b>${t.duracao_estimada_min ? ` <small class=muted>~${t.duracao_estimada_min} min</small>` : ''}
      <ol>${(t.blocos || []).map(b => { const its = (b.itens || []).filter(i => i.exercicio_id); if (!its.length) return '';
        const nomeMet = { biset: 'Bi-set', triset: 'Tri-set', giant_set: 'Série gigante', superset: 'Superset', pre_exaustao: 'Pré-exaustão', pos_exaustao: 'Pós-exaustão', dropset: 'Drop-set', piramide: 'Pirâmide', piramide_inv: 'Pirâmide invertida', rest_pause: 'Rest-pause', cluster: 'Cluster', isometria: 'Isometria', negativa: 'Excêntrica lenta' }[b.metodo];
        return `<li>${nomeMet ? `<span class="tag bi">${nomeMet}</span> ` : ''}${its.map(i => `${esc(i.exercicio_nome)} <small class=muted>${b.metodo === 'cardio' ? '' : (b.series || '') + '×'}${esc(i.repeticoes)}</small>`).join(' + ')}</li>`; }).join('')}</ol></div>`).join('');
    $('#ia-res').innerHTML = `<div class=ia-out>
      <h3>${esc(r.titulo || 'Treino gerado')}</h3>
      ${r.resumo_estrategia ? `<p>${esc(r.resumo_estrategia)}</p>` : ''}
      ${(r.pendencias || []).length ? `<div class=ia-alert><b>Confira:</b><ul>${r.pendencias.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${(r.alertas || []).length ? `<div class=ia-alert><b>Atenção:</b><ul>${r.alertas.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${resumo}
      ${(r.como_segui_o_pedido || []).length ? `<details class=ia-vol open><summary>Como a IA seguiu o seu pedido</summary><ul class=ia-why>${r.como_segui_o_pedido.map(p => `<li>${esc(p)}</li>`).join('')}</ul></details>` : ''}
      ${r.progressao ? `<details class=ia-vol><summary>Progressão sugerida</summary><p>${esc(r.progressao)}</p></details>` : ''}
      <label class=muted>Quer mudar algo? Escreva e a IA ajusta só isso:</label>
      <div class=ia-ref><input id=ia-ajuste placeholder="Ex.: troque o agachamento por leg press e tire um exercício de peito"><button id=ia-ajbtn>Ajustar</button></div>
      <details class=ia-vol><summary>Ver / editar o texto da ficha</summary><textarea id=ia-txt class=ia-txt spellcheck=false>${esc(texto)}</textarea></details>
      <div class=ia-acts><button class=p id=ia-use>Usar este treino</button><button id=ia-again>↻ Gerar outra versão</button><button id=ia-copy>Copiar texto</button>${modelo ? '<button id=ia-tpl>📁 Salvar como modelo</button>' : ''}</div>
      <p class=muted>Ao tocar em <b>Usar este treino</b>, ele vai para o Importar ficha: os desenhos aparecem e você salva para o aluno.</p></div>`;
    $('#ia-use').onclick = () => usar($('#ia-txt').value);
    if ($('#ia-tpl')) $('#ia-tpl').onclick = () => modelo($('#ia-txt').value);
    $('#ia-again').onclick = () => gerar();
    $('#ia-copy').onclick = async () => { try { await navigator.clipboard.writeText($('#ia-txt').value); $('#ia-copy').textContent = 'Copiado ✓'; } catch { $('#ia-txt').select(); } };
    $('#ia-ajbtn').onclick = () => ajustar();
    $('#ia-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const erro = (e) => { $('#ia-res').innerHTML = `<p class=err>${esc(e.message || e)}</p>`; };

  const gerar = async () => {
    briefing = montarBriefing();
    if (briefing.tipo === 'personalizado' && !briefing.preset_id && briefing.descricao.length < 15) { ped.focus(); erro('No tipo Personalizado, descreva como você quer o treino (quantos exercícios, foco, métodos…).'); return; }
    const salvar = $('#ia-salvar').checked, pn = $('#ia-pnome').value.trim();
    if (salvar && pn.length < 2) { $('#ia-pnome').focus(); erro('Dê um nome para o seu tipo de treino.'); return; }
    carregando(true); $('#ia-res').innerHTML = '<p class=muted>A IA está montando o treino. Isso leva de 20 a 90 segundos. Pode sair do app e voltar: o treino continua sendo montado.</p>';
    try {
      if (salvar && briefing.descricao.length >= 10) {
        const { id } = await chamar(sb, { action: 'salvar_preset', nome: pn, base_type: briefing.tipo, descricao: briefing.descricao, params: { volume: briefing.volume, metodos: briefing.metodos, divisao: briefing.divisao } });
        presets = [...presets.filter(p => p.id !== id && p.name !== pn), { id, name: pn, base_type: briefing.tipo, description: briefing.descricao }];
        $('#ia-salvar').checked = false; $('#ia-pnome').hidden = true; $('#ia-tipos').innerHTML = tiposHtml(); ligaTipos();
      }
      const { job } = await chamar(sb, { action: 'gerar', briefing }); mostrar(await esperar(sb, job));
    } catch (e) { erro(e); } finally { carregando(false); }
  };
  const ajustar = async () => {
    const pedido = $('#ia-ajuste').value.trim(); if (!pedido || !ultimo) { $('#ia-ajuste').focus(); return; }
    const btn = $('#ia-ajbtn'); btn.disabled = true; btn.textContent = 'Ajustando…';
    try { const { pendencias, ...ant } = ultimo; const { job } = await chamar(sb, { action: 'refinar', briefing: briefing || montarBriefing(), anterior: ant, pedido }); mostrar(await esperar(sb, job)); }
    catch (e) { btn.disabled = false; btn.textContent = 'Ajustar'; alert(e.message); }
  };
  $('#ia-go').onclick = gerar;
}

// ---------- gerador básico por regras (sem IA externa)
const ICON = { hipertrofia: '💪', emagrecimento: '🔥', forca: '🏋️', saude: '❤️', gluteos: '🍑', funcional: '⚡', hyrox: '🛷', pilates: '🧘', gestante: '🤰', idoso: '🧓', corrida: '🏃', mobilidade: '🤸' };
const LOCAIS_B = [['A', 'Academia'], ['C', 'Casa (halteres e elásticos)'], ['P', 'Só peso do corpo'], ['F', 'Box funcional'], ['S', 'Estúdio de Pilates']];
const DICAS = ['Foco em glúteos', 'Foco em braços', 'Dor no joelho', 'Dor lombar', 'Sem impacto', 'Incluir cardio', 'Com bi-sets', 'Sem máquinas', 'Treino de 40 minutos'];
const VOLUME_OBJ = ['hipertrofia', 'gluteos'];

export function montarIABasica(root, { alunos = [], usar, nome = '', modelo }) {
  let st = { objetivo: 'hipertrofia', sexo: 'f', nivel: 2, dias: 3, duracao: 60, local: 'A', aquecimento: true, pedido: '', nome: '' };
  try { st = { ...st, ...JSON.parse(localStorage.getItem('dh_ia') || '{}'), pedido: '', nome: '' }; } catch {}
  const chips = (k, opts) => `<div class=ia-chips data-k=${k}>${opts.map(([v, t]) => `<button type=button data-v="${v}" class="${String(st[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  root.innerHTML = `<div class=ia>
    <div class=ia-top><h2>✨ DE HOJE.IA</h2><p class=muted>Escolha o objetivo, conte o que você quer e a IA monta a semana de treinos com os exercícios e desenhos do app. Você revisa e ajusta antes de salvar para o aluno.</p></div>
    <label class=muted>Nome do aluno</label><input id=ia-nome list=ia-al placeholder="Ex.: Gabriela" autocomplete=off value="${esc(nome)}"><datalist id=ia-al>${alunos.map(a => `<option value="${esc(a)}">`).join('')}</datalist>
    <label class=muted>Objetivo do treino</label>
    <div class="ia-chips ia-obj" data-k=objetivo>${Object.entries(OBJETIVOS).map(([v, t]) => `<button type=button data-v="${v}" class="${st.objetivo === v ? 'on' : ''}"><span>${ICON[v]}</span>${t}</button>`).join('')}</div>
    <div class=ia-2>
      <div><label class=muted>Sexo</label>${chips('sexo', [['f', 'Feminino'], ['m', 'Masculino']])}</div>
      <div><label class=muted>Nível</label>${chips('nivel', [[1, 'Iniciante'], [2, 'Intermediário'], [3, 'Avançado']])}</div>
    </div>
    <label class=muted>Treinos por semana</label>${chips('dias', [1, 2, 3, 4, 5, 6, 7].map(n => [n, n + 'x']))}
    <label class=muted>Tempo de cada treino</label>${chips('duracao', [30, 45, 60, 75, 90].map(n => [n, n + ' min']))}
    <label class=muted>Onde treina</label>${chips('local', LOCAIS_B)}
    <label class=muted for=ia-ped>O que você quer neste treino</label>
    <textarea id=ia-ped class=ia-ped placeholder="Escreva do seu jeito. Ex.: quer crescer glúteo e posterior, tem dor no joelho direito, não gosta de burpee, prefere halteres, incluir cardio no final."></textarea>
    <div class=ia-dicas>${DICAS.map(d => `<button type=button class=sm data-d="${d}">＋ ${d}</button>`).join('')}</div>
    <p id=ia-leu class=ia-leu></p>
    <label class=chk><input type=checkbox id=ia-aq ${st.aquecimento ? 'checked' : ''}> Começar cada treino com aquecimento de mobilidade</label>
    <button class="p ia-go" id=ia-go>✨ Gerar treino</button>
    <div id=ia-res></div></div>`;
  const $ = s => root.querySelector(s);
  root.querySelectorAll('.ia-chips').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = g.dataset.k; st[k] = /^\d+$/.test(b.dataset.v) ? +b.dataset.v : b.dataset.v; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
  const ped = $('#ia-ped');
  const leu = () => { const r = lerPedido(ped.value), t = [];
    if (r.focos.length) t.push('foco: ' + r.focos.map(f => ({ gluteo: 'glúteos', perna: 'pernas', posterior: 'posteriores', panturrilha: 'panturrilhas', braco: 'braços', costas: 'costas', peito: 'peito', ombro: 'ombros', core: 'abdômen', superior: 'superiores' }[f])).join(', '));
    if (r.restr.length) t.push('cuidado com ' + r.restr.join(', ')); if (r.semImpacto) t.push('sem impacto'); if (r.cardio === true) t.push('com cardio'); if (r.cardio === false) t.push('sem cardio');
    if (r.bisets) t.push('bi-sets'); if (r.circuito) t.push('circuito'); if (r.mob) t.push('mobilidade no final'); if (r.min) t.push(r.min + ' minutos'); if (r.excluir.length) t.push('sem ' + r.excluir.join(', ')); if (r.gestante) t.push('gestante'); if (r.idoso) t.push('terceira idade');
    $('#ia-leu').innerHTML = t.length ? '🧠 Entendi: <b>' + esc(t.join(' · ')) + '</b>' : ''; };
  ped.oninput = leu;
  $('.ia-dicas').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; const d = b.dataset.d.toLowerCase(); ped.value = (ped.value.trim() ? ped.value.trim().replace(/[.,;]?$/, ', ') : '') + d; leu(); ped.focus(); };
  let seed = Date.now();
  const gerar = () => {
    st.aquecimento = $('#ia-aq').checked; st.nome = $('#ia-nome').value.trim(); st.pedido = ped.value;
    try { const { pedido, nome, ...keep } = st; localStorage.setItem('dh_ia', JSON.stringify(keep)); } catch {}
    const r = gerarTreino({ ...st, seed });
    const vol = Object.entries(r.volume).sort((a, b) => b[1] - a[1]), mx = Math.max(20, ...vol.map(v => v[1]));
    $('#ia-res').innerHTML = `<div class=ia-out>
      <h3>${esc(r.objetivo)} · ${r.sessoes} treino${r.sessoes > 1 ? 's' : ''}</h3>
      <ul class=ia-why>${r.porque.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      ${vol.length ? `<details class=ia-vol ${VOLUME_OBJ.includes(st.objetivo) ? 'open' : ''}><summary>Séries por músculo na semana</summary>${vol.map(([g, n]) => `<div class=ia-vb><span>${esc(g)}</span><i><b style="width:${Math.round(n / mx * 100)}%"></b></i><em>${n}</em></div>`).join('')}${VOLUME_OBJ.includes(st.objetivo) ? '<p class=muted>Para hipertrofia, a faixa mais usada é de 10 a 20 séries por músculo na semana.</p>' : ''}</details>` : ''}
      <label class=muted>Treino gerado (pode editar à vontade)</label>
      <textarea id=ia-txt class=ia-txt spellcheck=false>${esc(r.texto)}</textarea>
      <div class=ia-acts><button class=p id=ia-use>Usar este treino</button><button id=ia-again>↻ Gerar outra versão</button><button id=ia-copy>Copiar texto</button>${modelo ? '<button id=ia-tpl>📁 Salvar como modelo</button>' : ''}</div>
      <p class=muted>Ao tocar em <b>Usar este treino</b>, ele vai para o Importar ficha: os desenhos aparecem e você salva para o aluno.</p></div>`;
    $('#ia-use').onclick = () => usar($('#ia-txt').value);
    if ($('#ia-tpl')) $('#ia-tpl').onclick = () => modelo($('#ia-txt').value);
    $('#ia-again').onclick = () => { seed = Date.now(); gerar(); };
    $('#ia-copy').onclick = async () => { try { await navigator.clipboard.writeText($('#ia-txt').value); $('#ia-copy').textContent = 'Copiado ✓'; } catch { $('#ia-txt').select(); } };
    $('#ia-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $('#ia-go').onclick = () => { seed = Date.now(); gerar(); };
}
