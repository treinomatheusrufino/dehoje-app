// Tela do DE HOJE.IA (treinador): escolhe objetivo, perfil e escreve o pedido; o app monta a semana de treinos.
import { gerarTreino, OBJETIVOS, lerPedido } from './ia.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = { hipertrofia: '💪', emagrecimento: '🔥', forca: '🏋️', saude: '❤️', gluteos: '🍑', funcional: '⚡', hyrox: '🛷', pilates: '🧘', gestante: '🤰', idoso: '🧓', corrida: '🏃', mobilidade: '🤸' };
const LOCAIS = [['A', 'Academia'], ['C', 'Casa (halteres e elásticos)'], ['P', 'Só peso do corpo'], ['F', 'Box funcional'], ['S', 'Estúdio de Pilates']];
const DICAS = ['Foco em glúteos', 'Foco em braços', 'Dor no joelho', 'Dor lombar', 'Sem impacto', 'Incluir cardio', 'Com bi-sets', 'Sem máquinas', 'Treino de 40 minutos'];
const VOLUME_OBJ = ['hipertrofia', 'gluteos'];

export function montarIA(root, { alunos = [], usar, nome = '', modelo }) {
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
    <label class=muted>Onde treina</label>${chips('local', LOCAIS)}
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
