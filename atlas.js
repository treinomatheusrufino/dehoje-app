// Atlas anatômico do DE HOJE: corpo de frente e de costas, músculos clicáveis e modo desafio.
// Desenho próprio e estilizado (lado esquerdo desenhado, lado direito espelhado).

const G = '#16A34A', G2 = '#BBE5C8', BASE = '#E9ECEF', LINE = '#9AA3AF', SKIN = '#F6F7F8';

// metade do corpo (lado esquerdo da tela); espelhada em x=100
const SIL = [[100, 52], [92, 58], [74, 63], [60, 72], [54, 92], [50, 120], [47, 142], [43, 172], [41, 204], [36, 214], [36, 230], [44, 236], [52, 226], [52, 206], [57, 176], [62, 146], [66, 116], [69, 140], [71, 170], [68, 196], [64, 232], [66, 270], [70, 292], [66, 330], [70, 368], [74, 390], [64, 404], [66, 410], [92, 410], [90, 390], [90, 360], [92, 330], [90, 294], [96, 252], [100, 216]];

// cada músculo: id, vista, polígonos (lado esquerdo)
const SHAPES = {
  frente: [
    ['trapezio', [[94, 57], [84, 61], [74, 65], [88, 68], [97, 63]]],
    ['deltoide', [[74, 64], [64, 68], [57, 80], [55, 98], [60, 106], [67, 96], [71, 82], [80, 70]]],
    ['peitoral', [[99, 72], [86, 69], [75, 74], [69, 88], [70, 102], [80, 110], [92, 110], [99, 106]]],
    ['biceps', [[64, 104], [58, 108], [54, 122], [54, 136], [58, 142], [63, 134], [66, 118]]],
    ['antebraco', [[56, 146], [49, 160], [45, 184], [46, 200], [52, 200], [56, 182], [60, 160]]],
    ['serratil', [[69, 106], [68, 118], [71, 130], [76, 126], [74, 112]]],
    ['obliquo', [[72, 132], [70, 150], [70, 172], [74, 188], [84, 194], [86, 170], [84, 146], [79, 130]]],
    ['abdomen', [[99, 112], [90, 113], [87, 124], [86, 158], [87, 188], [93, 200], [99, 204]]],
    ['quadriceps', [[70, 204], [65, 226], [64, 252], [68, 278], [76, 290], [86, 288], [92, 268], [94, 240], [90, 218]]],
    ['adutores', [[93, 220], [99, 224], [99, 246], [95, 262], [92, 240]]],
    ['tibial', [[72, 300], [68, 322], [70, 354], [74, 384], [78, 384], [80, 350], [80, 318], [77, 300]]],
    ['panturrilha', [[84, 300], [82, 320], [84, 346], [89, 350], [91, 326], [89, 302]]],
  ],
  costas: [
    ['trapezio', [[100, 54], [93, 58], [84, 62], [73, 67], [82, 76], [90, 92], [95, 112], [100, 128]]],
    ['deltoide', [[74, 64], [64, 68], [57, 80], [55, 98], [60, 106], [67, 96], [71, 82], [80, 70]]],
    ['manguito', [[78, 79], [71, 88], [72, 100], [82, 104], [88, 92]]],
    ['romboides', [[99, 86], [93, 90], [92, 100], [95, 108], [99, 112]]],
    ['dorsal', [[69, 104], [69, 124], [73, 148], [84, 168], [99, 182], [99, 142], [93, 124], [84, 110]]],
    ['eretores', [[99, 132], [94, 136], [92, 160], [92, 188], [99, 196]]],
    ['triceps', [[64, 102], [58, 106], [54, 122], [54, 136], [58, 142], [63, 134], [66, 114]]],
    ['antebraco', [[56, 146], [49, 160], [45, 184], [46, 200], [52, 200], [56, 182], [60, 160]]],
    ['gluteo_medio', [[72, 186], [69, 198], [77, 204], [88, 201], [91, 191], [84, 186]]],
    ['gluteo', [[99, 200], [88, 202], [76, 209], [71, 222], [74, 238], [86, 246], [99, 244]]],
    ['posteriores', [[72, 252], [67, 268], [68, 284], [76, 292], [87, 290], [93, 272], [95, 254], [86, 251]]],
    ['panturrilha', [[72, 298], [67, 316], [68, 338], [75, 356], [84, 350], [90, 330], [90, 308], [86, 298]]],
    ['soleo', [[73, 360], [73, 376], [76, 386], [83, 386], [86, 366], [85, 354], [79, 360]]],
  ],
};

// grupos (para pintar o grupo inteiro de verde claro)
export const GRUPOS = {
  'Peito': ['peitoral', 'serratil'], 'Costas': ['dorsal', 'romboides', 'trapezio', 'eretores'], 'Ombros': ['deltoide', 'manguito'],
  'Braços': ['biceps', 'triceps', 'antebraco'], 'Abdômen e core': ['abdomen', 'obliquo', 'eretores'],
  'Glúteos': ['gluteo', 'gluteo_medio'], 'Coxas': ['quadriceps', 'posteriores', 'adutores'], 'Pernas': ['panturrilha', 'soleo', 'tibial'],
};

export const MUSCULOS = {
  peitoral: { nome: 'Peitoral maior', grupo: 'Peito', funcao: 'Aproxima os braços do corpo e empurra para a frente, como ao fechar um abraço ou empurrar uma porta.', dia: 'Empurrar objetos, levantar-se do chão.', ex: ['Supino reto com barra', 'Flexão de braço', 'Crucifixo reto com halteres', 'Crossover polia média'] },
  serratil: { nome: 'Serrátil anterior', grupo: 'Peito', funcao: 'Mantém a escápula colada nas costelas e ajuda a levar o braço acima da cabeça.', dia: 'Socos, alcançar objetos no alto.', ex: ['Flexão de braço', 'Prancha com toque no ombro', 'Pullover com halter'] },
  deltoide: { nome: 'Deltoide', grupo: 'Ombros', funcao: 'Eleva o braço para a frente, para o lado e para trás. Tem três partes: anterior, lateral e posterior.', dia: 'Pegar algo na prateleira, carregar sacolas afastadas do corpo.', ex: ['Desenvolvimento sentado com halteres', 'Elevação lateral com halteres', 'Elevação frontal com halteres', 'Crucifixo inverso com halteres (inclinado)'] },
  manguito: { nome: 'Manguito rotador', grupo: 'Ombros', funcao: 'Quatro músculos pequenos que giram o braço e seguram a cabeça do úmero no lugar. Protegem o ombro.', dia: 'Arremessar, pentear o cabelo.', ex: ['Rotação externa com halter', 'Rotação externa com elástico', 'Face pull na polia com corda'] },
  trapezio: { nome: 'Trapézio', grupo: 'Costas', funcao: 'Eleva, aproxima e abaixa as escápulas. Sustenta o pescoço e os ombros.', dia: 'Encolher os ombros, carregar peso nas mãos.', ex: ['Encolhimento com halteres (trapézio)', 'Remada alta com barra', 'Caminhada do fazendeiro', 'Y-T-W com elástico'] },
  romboides: { nome: 'Romboides', grupo: 'Costas', funcao: 'Aproximam as escápulas da coluna. Ajudam a manter a postura ereta.', dia: 'Abrir os braços para trás, puxar uma gaveta.', ex: ['Remada baixa com triângulo', 'Pull-apart com elástico', 'Remada no TRX'] },
  dorsal: { nome: 'Latíssimo do dorso (dorsal)', grupo: 'Costas', funcao: 'Puxa os braços para baixo e para trás. É o maior músculo das costas.', dia: 'Subir uma escada de mão, puxar algo pesado em direção ao corpo.', ex: ['Puxada frontal pegada aberta', 'Barra fixa pronada', 'Remada curvada com barra', 'Remada unilateral com halter (serrote)'] },
  eretores: { nome: 'Eretores da espinha (lombar)', grupo: 'Costas', funcao: 'Estendem e estabilizam a coluna. Seguram o tronco quando você inclina para a frente.', dia: 'Ficar em pé, levantar algo do chão.', ex: ['Levantamento terra', 'Extensão lombar no banco romano', 'Bird dog (quatro apoios)', 'Superman no solo'] },
  biceps: { nome: 'Bíceps braquial', grupo: 'Braços', funcao: 'Dobra o cotovelo e gira o antebraço para a palma ficar para cima.', dia: 'Carregar compras, levar o copo à boca.', ex: ['Rosca direta com barra reta', 'Rosca alternada com halteres', 'Rosca martelo com halteres', 'Rosca Scott com barra W'] },
  triceps: { nome: 'Tríceps braquial', grupo: 'Braços', funcao: 'Estica o cotovelo. Ocupa cerca de dois terços do volume do braço.', dia: 'Empurrar para se levantar da cadeira.', ex: ['Tríceps pulley com corda', 'Tríceps testa com barra W', 'Tríceps no banco (mergulho)', 'Tríceps francês em pé com halter'] },
  antebraco: { nome: 'Músculos do antebraço', grupo: 'Braços', funcao: 'Fecham e abrem a mão, dobram e esticam o punho. Responsáveis pela força da pegada.', dia: 'Abrir potes, segurar sacolas.', ex: ['Rosca de punho (flexão de punho)', 'Rosca inversa com barra', 'Caminhada do fazendeiro', 'Dead hang (pendurado na barra)'] },
  abdomen: { nome: 'Reto abdominal', grupo: 'Abdômen e core', funcao: 'Flexiona o tronco e protege os órgãos. Junto com o transverso, estabiliza a coluna.', dia: 'Sentar-se a partir da posição deitada.', ex: ['Abdominal supra (crunch)', 'Prancha frontal', 'Dead bug', 'Hollow hold'] },
  obliquo: { nome: 'Oblíquos', grupo: 'Abdômen e core', funcao: 'Giram e inclinam o tronco para o lado. Seguram o corpo contra rotações.', dia: 'Virar o tronco para olhar para trás, carregar peso de um lado só.', ex: ['Prancha lateral', 'Pallof press (anti-rotação)', 'Abdominal bicicleta', 'Woodchop alto para baixo na polia'] },
  gluteo: { nome: 'Glúteo máximo', grupo: 'Glúteos', funcao: 'Estende o quadril e leva a perna para trás. É o músculo mais forte do corpo.', dia: 'Subir escadas, levantar-se da cadeira, correr.', ex: ['Elevação pélvica com barra (hip thrust)', 'Agachamento livre', 'Levantamento terra', 'Chute de glúteo na polia'] },
  gluteo_medio: { nome: 'Glúteo médio', grupo: 'Glúteos', funcao: 'Afasta a perna para o lado e mantém a pelve nivelada quando você apoia em um pé só.', dia: 'Caminhar e correr sem o quadril "cair".', ex: ['Abdução na máquina (abdutora sentada)', 'Caminhada lateral com mini band', 'Concha (clamshell) com elástico', 'Abdução deitada de lado com caneleira'] },
  quadriceps: { nome: 'Quadríceps', grupo: 'Coxas', funcao: 'Quatro músculos na frente da coxa que esticam o joelho. Um deles também dobra o quadril.', dia: 'Levantar-se, subir escadas, chutar.', ex: ['Agachamento livre', 'Cadeira extensora', 'Leg press 45°', 'Avanço com halteres'] },
  posteriores: { nome: 'Posteriores da coxa (isquiotibiais)', grupo: 'Coxas', funcao: 'Dobram o joelho e estendem o quadril. Freiam a perna na corrida.', dia: 'Inclinar o tronco para a frente, correr, saltar.', ex: ['Mesa flexora', 'Stiff com barra', 'Terra romeno com halteres', 'Flexão nórdica'] },
  adutores: { nome: 'Adutores', grupo: 'Coxas', funcao: 'Aproximam as pernas e estabilizam o quadril nos movimentos laterais.', dia: 'Mudar de direção, andar a cavalo, chutar com a parte interna do pé.', ex: ['Adução na máquina (cadeira adutora)', 'Agachamento sumô', 'Prancha Copenhagen com joelho apoiado', 'Agachamento cossaco'] },
  panturrilha: { nome: 'Gastrocnêmio (panturrilha)', grupo: 'Pernas', funcao: 'Fica na ponta dos pés e ajuda a dobrar o joelho. Trabalha mais com o joelho esticado.', dia: 'Andar, correr, saltar.', ex: ['Panturrilha em pé na máquina', 'Panturrilha em pé no degrau', 'Saltos na ponta dos pés (pogo)', 'Double under'] },
  soleo: { nome: 'Sóleo', grupo: 'Pernas', funcao: 'Fica embaixo do gastrocnêmio e também leva à ponta dos pés. Trabalha mais com o joelho dobrado.', dia: 'Ficar em pé por muito tempo, caminhar longas distâncias.', ex: ['Panturrilha sentada (sóleo)', 'Panturrilha sentada na máquina', 'Panturrilha sentada com anilha nos joelhos'] },
  tibial: { nome: 'Tibial anterior', grupo: 'Pernas', funcao: 'Puxa a ponta do pé para cima. Evita tropeços e controla a pisada.', dia: 'Andar sem arrastar o pé, descer escadas.', ex: ['Elevação da ponta dos pés (tibial) na parede', 'Tibial com caneleira', 'Caminhada nos calcanhares'] },
};

const mir = pts => pts.map(([x, y]) => [200 - x, y]).reverse();
const r1 = n => Math.round(n * 10) / 10;
const d = (pts, t = 1) => { // curva suave fechada passando pelos pontos
  const n = pts.length; let o = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const t1 = p1[0] >= 98.5 && p1[0] <= 101.5 ? t * .3 : t, t2 = p2[0] >= 98.5 && p2[0] <= 101.5 ? t * .3 : t; // pontos na linha do meio: curva suave sem "bico"
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * t1, p1[1] + (p2[1] - p0[1]) / 6 * t1], c2 = [p2[0] - (p3[0] - p1[0]) / 6 * t2, p2[1] - (p3[1] - p1[1]) / 6 * t2];
    o += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${p2[0]} ${p2[1]}`;
  }
  return o + 'Z'; };

export function svgAtlas(vista) {
  const sil = SIL.concat(mir(SIL));
  const parts = [`<svg viewBox="20 8 160 410" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Corpo humano, vista de ${vista}" class="atlas-svg">`,
    `<path d="${d(sil, .55)}" fill="${SKIN}" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>`,
    `<ellipse cx="100" cy="30" rx="16" ry="20" fill="${SKIN}" stroke="${LINE}" stroke-width="1.2"/>`,
    `<path d="M93 48L93 58M107 48L107 58" stroke="${LINE}" stroke-width="1.2"/>`];
  if (vista === 'costas') parts.push(`<path d="M100 56L100 200" stroke="${LINE}" stroke-width=".8" stroke-dasharray="2 3"/>`);
  else parts.push(`<path d="M100 114L100 200M87 135L113 135M87 155L113 155M87 174L113 174" stroke="${LINE}" stroke-width=".7" opacity=".7"/>`);
  for (const [id, pts] of SHAPES[vista]) {
    const nome = MUSCULOS[id].nome;
    for (const p of [pts, mir(pts)]) {
      parts.push(`<path class="m" data-m="${id}" d="${d(p)}" fill="${BASE}" stroke="${LINE}" stroke-width="1" stroke-linejoin="round" tabindex="0" role="button" aria-label="${nome}"><title>${nome}</title></path>`);
    }
  }
  parts.push('</svg>');
  return parts.join('');
}

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// monta a aba inteira dentro de `el`. opts.onEx(nome) = abrir exercício na biblioteca (opcional)
export function montarAtlas(el, opts = {}) {
  let vista = 'frente', sel = null, desafio = null, acertos = 0, tentativas = 0;
  const lista = Object.entries(MUSCULOS);
  el.innerHTML = `<div class="atlas">
    <h2>Músculos do corpo</h2>
    <p class="muted">Toque em um músculo para ver o nome, o grupo, para que serve e quais exercícios trabalham ele.</p>
    <div class="atlas-tabs" role="tablist"><button role="tab" data-v="frente" class=on>Frente</button><button role="tab" data-v="costas">Costas</button><button data-q class="atlas-q">🎯 Desafio</button></div>
    <div class="atlas-grid"><div class="atlas-corpo" id="atlasCorpo"></div><div class="atlas-info" id="atlasInfo"></div></div>
    <details class="atlas-todos"><summary>Ver todos os músculos</summary><div class="atlas-chips">${lista.map(([k, m]) => `<button data-pick="${k}">${esc(m.nome)}</button>`).join('')}</div></details>
  </div>`;
  const corpo = el.querySelector('#atlasCorpo'), info = el.querySelector('#atlasInfo');
  const vistaDe = id => SHAPES.frente.some(s => s[0] === id) ? 'frente' : 'costas';
  const pintar = () => corpo.querySelectorAll('.m').forEach(p => {
    const id = p.dataset.m, gs = sel ? (GRUPOS[MUSCULOS[sel].grupo] || []) : [];
    p.setAttribute('fill', id === sel ? G : gs.includes(id) ? G2 : BASE);
    p.setAttribute('stroke', id === sel ? '#0F6B33' : LINE);
  });
  const desenhar = () => {
    corpo.innerHTML = svgAtlas(vista);
    el.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === vista));
    corpo.querySelectorAll('.m').forEach(p => {
      const go = () => clicar(p.dataset.m);
      p.addEventListener('click', go); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    pintar();
  };
  const ficha = id => {
    const m = MUSCULOS[id], irmaos = (GRUPOS[m.grupo] || []).filter(x => x !== id);
    info.innerHTML = `<b class="atlas-nome">${esc(m.nome)}</b><span class="atlas-grupo">Grupo: ${esc(m.grupo)}</span>
      <p><b>Para que serve:</b> ${esc(m.funcao)}</p><p><b>No dia a dia:</b> ${esc(m.dia)}</p>
      <p><b>Exercícios que trabalham:</b></p><div class="atlas-chips ex">${m.ex.map(n => opts.onEx ? `<button data-ex="${esc(n)}">${esc(n)}</button>` : `<span>${esc(n)}</span>`).join('')}</div>
      ${irmaos.length ? `<p class="muted">Mesmo grupo: ${irmaos.map(x => `<a href="#" data-pick="${x}">${esc(MUSCULOS[x].nome)}</a>`).join(', ')}</p>` : ''}`;
    info.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => opts.onEx(b.dataset.ex));
    info.querySelectorAll('[data-pick]').forEach(a => a.onclick = e => { e.preventDefault(); escolher(a.dataset.pick); });
  };
  const escolher = id => { const v = vistaDe(id); sel = id; if (v !== vista && !SHAPES[vista].some(s => s[0] === id)) { vista = v; desenhar(); } else pintar(); ficha(id); info.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); };
  const novaPergunta = () => {
    const pool = lista.map(([k]) => k).filter(k => SHAPES[vista].some(s => s[0] === k));
    desafio = pool[Math.floor(Math.random() * pool.length)]; sel = null; pintar();
    info.innerHTML = `<b class="atlas-nome">Onde fica o ${esc(MUSCULOS[desafio].nome)}?</b><p class="muted">Toque no músculo certo no corpo.${tentativas ? ` Acertos: ${acertos} de ${tentativas}.` : ''}</p><button class="sm" data-sair>Sair do desafio</button>`;
    info.querySelector('[data-sair]').onclick = () => { desafio = null; info.innerHTML = vazio(); };
  };
  const clicar = id => {
    if (!desafio) return escolher(id);
    tentativas++; const ok = id === desafio; if (ok) acertos++;
    sel = desafio; pintar();
    info.innerHTML = `<b class="atlas-nome">${ok ? '✅ Acertou!' : '❌ Quase'}</b><p>${ok ? '' : `Você tocou no ${esc(MUSCULOS[id].nome)}. `}O ${esc(MUSCULOS[desafio].nome)} está pintado de verde.</p><p class="muted">Acertos: ${acertos} de ${tentativas}.</p><button class="p" data-prox>Próximo</button> <button class="sm" data-sair>Sair do desafio</button>`;
    info.querySelector('[data-prox]').onclick = novaPergunta;
    info.querySelector('[data-sair]').onclick = () => { desafio = null; ficha(sel); };
  };
  const vazio = () => `<p class="muted atlas-dica">👆 Toque em um músculo ou escolha na lista abaixo.</p>`;
  el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { vista = b.dataset.v; desenhar(); if (desafio) novaPergunta(); });
  el.querySelector('[data-q]').onclick = () => { acertos = 0; tentativas = 0; novaPergunta(); };
  el.querySelectorAll('.atlas-todos [data-pick]').forEach(b => b.onclick = () => { desafio = null; escolher(b.dataset.pick); });
  info.innerHTML = vazio();
  desenhar();
}
