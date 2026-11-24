// Aba Didática do DE HOJE: Músculos (atlas), Mobilidade e Alongamentos.
import { montarAtlas } from './atlas.js';
import { DIDATICA } from './didatica_dados.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SECOES = [['musculos', 'Músculos'], ['mobilidade', 'Mobilidade'], ['alongamento', 'Alongamentos']];
const TXT = {
  mobilidade: ['Mobilidade', 'Movimentos ativos para ganhar amplitude nas articulações. Bons para o aquecimento e para quem fica muito tempo sentado.'],
  alongamento: ['Alongamentos', 'Posições mantidas para alongar o músculo. Faça devagar, respirando, sem dor. Melhor no fim do treino ou em outro horário.'],
};

export function montarDidatica(el, opts = {}) {
  let secao = opts.secao || 'musculos';
  el.innerHTML = `<div class="did"><h2>Didática</h2>
    <div class="did-tabs" role="tablist">${SECOES.map(([k, t]) => `<button role="tab" data-s="${k}">${t}</button>`).join('')}</div>
    <div id="didCorpo"></div></div>`;
  const corpo = el.querySelector('#didCorpo');
  const abrir = s => {
    secao = s;
    el.querySelectorAll('[data-s]').forEach(b => { const on = b.dataset.s === s; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    if (s === 'musculos') return montarAtlas(corpo, opts);
    lista(corpo, s, opts);
  };
  el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => abrir(b.dataset.s));
  abrir(secao);
}

function lista(el, s, opts) {
  const itens = DIDATICA[s] || [], regioes = [...new Set(itens.map(i => i.regiao))];
  let filtro = '';
  el.innerHTML = `<p class="muted">${esc(TXT[s][1])}</p>
    <div class="did-filtros"><button data-r="" class="on">Todos (${itens.length})</button>${regioes.map(r => `<button data-r="${esc(r)}">${esc(r)}</button>`).join('')}</div>
    <div class="did-grid" id="didGrid"></div>`;
  const grid = el.querySelector('#didGrid');
  const desenhar = () => {
    const vis = itens.filter(i => !filtro || i.regiao === filtro);
    grid.innerHTML = vis.map((i, k) => `<button class="did-card" data-k="${itens.indexOf(i)}">
        <img loading="lazy" src="${esc(i.img)}" alt="">
        <b>${esc(i.nome)}</b><span class="did-dose">${esc(i.dose)}</span><span class="did-reg">${esc(i.regiao)}</span></button>`).join('');
    grid.querySelectorAll('[data-k]').forEach(b => b.onclick = () => ficha(itens[+b.dataset.k], s, opts));
  };
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { filtro = b.dataset.r; el.querySelectorAll('[data-r]').forEach(x => x.classList.toggle('on', x === b)); desenhar(); });
  desenhar();
}

function ficha(i, s, opts) {
  const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="box did-ficha"><img src="${esc(i.img)}" alt="Desenho animado: ${esc(i.nome)}">
    <h3>${esc(i.nome)}</h3><p><span class="did-dose">${esc(i.dose)}</span> <span class="did-reg">${esc(i.regiao)}</span></p>
    <p><b>Como fazer</b></p><ol>${(i.passos || []).map(p => `<li>${esc(p)}</li>`).join('')}</ol>
    <p class="muted">${s === 'alongamento' ? 'Sinta alongar, nunca dor. Se doer, diminua a amplitude.' : 'Movimento controlado e sem dor. Aumente a amplitude aos poucos.'}</p>
    <button class="p" data-x>Fechar</button></div>`;
  document.body.appendChild(d);
  const fechar = () => d.remove();
  d.querySelector('[data-x]').onclick = fechar; d.onclick = e => { if (e.target === d) fechar(); };
}
