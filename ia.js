// DE HOJE.IA — monta treinos completos a partir do objetivo, perfil do aluno e do pedido livre do treinador.
// Motor de prescrição por regras (divisão semanal, volume, intensidade, restrições, equipamento),
// sempre usando exercícios que existem na biblioteca do app (com desenho).
// Saída: texto no mesmo formato da ficha colada, para passar pelo "Importar ficha" (revisão + salvar).

// ---------- biblioteca: nome | onde | nível | marcas
// onde: A academia · C casa (halteres/elásticos) · P só peso do corpo · F box funcional · S estúdio de pilates
// marcas: j joelho · l lombar · o ombro · i impacto/salto · h isometria (segundos) · u unilateral · d distância
const RAW = {
  quad: `Agachamento com barra nas costas|A|2|jl
Agachamento goblet com halter|ACF|1|
Leg press 45°|A|1|j
Agachamento livre (peso do corpo)|CPF|1|
Agachamento no Smith|A|1|j
Leg press horizontal|A|1|
Afundo reverso com halteres|ACF|1|u
Agachamento búlgaro com halteres|ACF|2|ju
Agachamento hack na máquina|A|2|j
Subida no banco (step-up) com halteres|ACF|1|u
Agachamento na caixa (box squat)|AF|1|
Passada (avanço caminhando)|ACPF|2|ju
Agachamento búlgaro (peso do corpo)|CPF|2|ju
Subida no banco (step-up) com peso do corpo|CPF|1|u
Agachamento frontal com barra|AF|3|j
Agachamento goblet com kettlebell|F|1|
Agachamento com halteres ao lado do corpo|AC|1|
Agachamento com elástico|C|1|
Agachamento no TRX|F|1|
Avanço com halteres|ACF|2|ju`,
  quad_iso: `Cadeira extensora|A|1|j
Cadeira extensora unilateral|A|1|ju
Agachamento isométrico na parede|ACPF|1|h
Extensão terminal de joelho (TKE) com elástico|CF|1|u
Agachamento na parede com bola suíça|CF|1|`,
  hip: `Elevação pélvica com barra (hip thrust)|AF|1|
Elevação pélvica na máquina|A|1|
Ponte de glúteos|CP|1|
Elevação pélvica unilateral (hip thrust)|ACPF|2|u
Ponte de glúteos unilateral|CPF|2|u
Ponte com pés elevados|CPF|1|
Ponte de glúteos com mini band|CF|1|
Pull-through na polia|A|1|`,
  hinge: `Terra romeno com halteres|ACF|1|l
Terra romeno com barra|AF|2|l
Stiff com barra|A|2|l
Stiff com halteres|AC|2|l
Levantamento terra com barra hexagonal|A|2|l
Terra romeno unilateral com halter|ACF|2|u
Levantamento terra|AF|3|l
Levantamento terra sumô|AF|2|l
Kettlebell swing|F|2|l
Levantamento terra com elástico|C|1|
Good morning (bom dia)|A|3|l
Terra romeno unilateral na polia|A|2|u`,
  glute_iso: `Cadeira abdutora|A|1|
Abdução de quadril em pé na polia|A|1|u
Chute de glúteo na polia|A|1|u
Abdução de quadril em pé com mini band|CF|1|u
Caminhada lateral com mini band|CF|1|
Fire hydrant com elástico|C|1|u
Chute de glúteo com caneleira|C|1|u
Concha (clamshell) com elástico|C|1|u
Abdução deitada de lado (elevação lateral de perna)|P|1|u
Chute de glúteo (donkey kick)|P|1|u
Coice de glúteo em pé com elástico|CF|1|u
Monster walk com mini band|CF|1|
Fire hydrant (quatro apoios)|P|1|u`,
  hamcurl: `Mesa flexora|A|1|
Cadeira flexora|A|1|
Flexora em pé|A|1|u
Leg curl com bola suíça|CF|2|
Leg curl deslizante (sliders)|CP|2|
Flexão nórdica|AF|3|
Flexora em pé com caneleira|C|1|u
Mesa flexora unilateral|A|1|u`,
  adutor: `Adução na máquina (cadeira adutora)|A|1|
Agachamento sumô com halter (goblet)|ACF|1|
Adução em pé com elástico|C|1|u
Prancha Copenhagen com joelho apoiado|ACPF|2|hu
Adução deitada de lado (perna de baixo)|P|1|u
Adução em pé na polia|A|1|u
Agachamento sumô com kettlebell|F|1|`,
  calf: `Panturrilha em pé na máquina|A|1|
Panturrilha sentada na máquina|A|1|
Panturrilha no leg press|A|1|
Panturrilha em pé no degrau|CPF|1|
Panturrilha unilateral em pé com halter|CF|1|u
Panturrilha sentada com halteres nos joelhos|C|1|
Panturrilha unilateral em pé (apoio na parede)|P|1|u`,
  push_h: `Supino reto com halteres|AC|1|
Supino reto com barra|A|2|o
Supino na máquina|A|1|
Flexão de braço|CPF|2|
Flexão com joelhos apoiados|CPF|1|
Flexão no TRX|F|2|
Supino em pé com elástico|C|1|
Flexão inclinada (mãos no banco)|CPF|1|
Supino declinado com halteres|A|2|
Supino unilateral em pé na polia|A|2|u`,
  push_inc: `Supino inclinado com halteres|AC|1|
Supino inclinado com barra|A|2|o
Crossover polia baixa|A|1|
Landmine press|AF|2|u
Flexão declinada (pés no banco)|CPF|3|o`,
  fly: `Peck deck (voador)|A|1|
Crossover polia média|A|1|
Crucifixo reto com halteres|AC|1|o
Crucifixo inclinado com halteres|AC|1|o
Crossover polia alta|A|1|`,
  push_v: `Desenvolvimento sentado com halteres|ACF|1|o
Desenvolvimento na máquina|A|1|o
Desenvolvimento Arnold|AC|2|o
Desenvolvimento militar em pé com barra|AF|3|ol
Desenvolvimento com elástico|C|1|o
Pike push-up (flexão em V)|PF|2|o
Desenvolvimento meio ajoelhado na polia|A|2|ou
Desenvolvimento unilateral com halter|ACF|1|ou`,
  lat_raise: `Elevação lateral com halteres|ACF|1|
Elevação lateral unilateral na polia|A|1|u
Elevação lateral com elástico|C|1|
Elevação em Y no TRX|F|1|
Elevação lateral unilateral com halter|AC|1|u`,
  rear: `Face pull na polia com corda|A|1|
Voador invertido na máquina|A|1|
Crucifixo inverso com halteres (inclinado)|AC|1|
Pull-apart com elástico|CF|1|
Face pull com elástico|CF|1|
Y-T-W com elástico|C|1|`,
  pull_v: `Puxada frontal pegada aberta|A|1|
Puxada frontal pegada fechada (triângulo)|A|1|
Puxada frontal supinada|A|1|
Barra fixa pronada|AF|3|
Barra fixa supinada (chin-up)|AF|3|
Puxada alta ajoelhado com elástico|C|1|
Puxada unilateral meio ajoelhado na polia|A|1|u
Ring row|F|1|
Puxada com braços estendidos na polia|A|1|`,
  pull_h: `Remada baixa com triângulo|A|1|
Remada unilateral com halter (serrote)|ACF|1|u
Remada na máquina com peito apoiado|A|1|
Remada curvada com barra|A|2|l
Remada sentada com elástico|C|1|
Remada no TRX|F|1|
Remada cavalinho (barra T)|A|2|l
Remada invertida na barra baixa|PF|2|
Remada baixa pegada aberta|A|1|
Remada unilateral na polia em base dividida|A|1|u`,
  biceps: `Rosca direta com barra reta|A|1|
Rosca alternada com halteres|ACF|1|
Rosca martelo com halteres|ACF|1|
Rosca Scott na máquina|A|1|
Rosca inclinada com halteres|AC|2|
Rosca na polia baixa com barra|A|1|
Rosca com elástico|C|1|
Rosca bíceps no TRX|F|1|
Rosca concentrada|AC|1|u
Rosca martelo com corda na polia|A|1|`,
  triceps: `Tríceps pulley com corda|A|1|
Tríceps pulley com barra reta|A|1|
Tríceps francês na polia (corda)|A|1|o
Tríceps testa com barra W|A|2|o
Tríceps francês sentado com halter|AC|1|o
Tríceps coice com halter|AC|1|u
Tríceps pulley com elástico|C|1|
Tríceps no banco (mergulho)|CP|1|o
Flexão fechada com joelhos apoiados|CP|1|
Tríceps no TRX|F|1|
Supino fechado com barra|A|2|
Mergulho nas paralelas (foco em tríceps)|AF|3|o`,
  core: `Prancha frontal|ACPF|1|h
Dead bug|ACPF|1|
Prancha lateral|ACPF|1|hu
Pallof press meio ajoelhado na polia|A|1|u
Pallof press com elástico|CF|1|u
Abdominal supra (crunch)|ACP|1|
Abdominal infra (elevação de pernas)|ACP|1|
Bird dog (quatro apoios)|ACPF|1|u
Abdominal na polia (ajoelhado)|A|1|
Prancha com toque no ombro|ACPF|2|
Hollow hold|PF|2|h
Abdominal bicicleta|ACP|1|
Woodchop alto para baixo na polia|A|1|u
Woodchop com elástico|C|1|u
Roda abdominal (ab wheel)|AF|3|l
Elevação de pernas pendurado na barra|AF|3|`,
  cond: `Mountain climber|ACPF|1|
Polichinelo|ACPF|1|i
Corda naval (battle rope)|AF|1|
Lançamento de medicine ball no chão (slam ball)|AF|1|
Burpee|ACPF|2|ij
Agachamento com salto|ACPF|2|ij
Skipping alto|ACPF|1|i
Salto lateral (skater)|ACPF|2|ij
Kettlebell swing|F|2|l
Thruster com halteres|ACF|2|o
Prancha com salto de pernas (plank jack)|CPF|2|i
Bear crawl|PF|2|
Corrida estacionária|CP|1|i
Box step-over|F|1|
Wall ball|F|2|j`,
  mob: `World's greatest stretch|ACPF|1|u
Gato-camelo em pé (cat-cow em pé)|ACPF|1|
Mobilidade de tornozelo (joelho à parede)|ACPF|1|u
90/90 de quadril|ACPF|1|u
Deslizamento na parede (wall slide)|ACPF|1|
Mobilidade torácica em quatro apoios (thread the needle)|ACPF|1|u
Círculos de braço|ACPF|1|
Avanço do homem-aranha (spiderman lunge)|ACPF|1|u
Rotação de quadril em pé (abrir o portão)|ACPF|1|u
Inchworm (lagarta)|ACPF|1|
Agachamento profundo com mobilidade|ACPF|1|
Passagem de bastão (shoulder dislocate)|ACF|1|
Livro aberto (open book) deitado de lado|ACPF|1|u
Balanço de perna frente e trás|ACPF|1|u`,
  balance: `Equilíbrio unipodal|ACPF|1|hu
Equilíbrio unipodal com alcance (star excursion)|ACPF|2|u
Ponte com marcha|ACPF|1|
Caminhada do fazendeiro|ACF|1|d
Avião de quadril (hip airplane)|ACPF|3|u
Equilíbrio unipodal no bosu|AF|2|hu`,
};
// listas próprias de alguns objetivos (mesmo formato)
const RAW2 = {
  cf_str: `Agachamento goblet com kettlebell|AF|1|
Front rack lunge|AF|2|ju
Thruster com barra|AF|2|o
Hang power clean|AF|2|
Push press|AF|2|o
Sumo deadlift high pull|AF|2|l
Push jerk|AF|3|o
Overhead squat|AF|3|oj
Power clean|AF|3|l
Power snatch|AF|3|ol
Squat clean|AF|3|j
Clean and jerk|AF|3|o`,
  cf_gym: `Ring row|AF|1|
Air squat|ACPF|1|
Box step-over|AF|1|
Sit-up com abmat|ACPF|1|
Hollow rock|ACPF|1|
Flexão de braço|ACPF|1|
Knees to elbows|AF|2|
Box jump|AF|2|ij
Wall walk|AF|2|o
Pull-up kipping|AF|2|o
Burpee sobre a barra (bar facing burpee)|AF|2|ij
Toes to bar|AF|3|
Chest to bar pull-up|AF|3|o
Handstand push-up|AF|3|o
Pistol squat|ACPF|3|ju
Double under|AF|3|i
Bar muscle-up|AF|3|o`,
  cf_wod: `Wall ball|AF|1|j
Kettlebell swing americano|AF|1|lo
Remo ergômetro|AF|1|
Air squat|ACPF|1|
Lançamento de medicine ball no chão (slam ball)|AF|1|
Sit-up com abmat|ACPF|1|
Burpee|ACPF|2|ij
Box jump|AF|2|ij
Thruster com halteres|ACF|2|o
Snatch com halter|ACF|2|o
Cardio: AirBike|AF|1|
Shuttle run|ACPF|2|i
Devil press|ACF|3|o
Double under|AF|3|i`,
  pil_solo: `Hundred (Cem)|ACPFS|1|
Roll up|ACPFS|2|
Círculo com uma perna (single leg circle)|ACPFS|1|u
Rolando como bola (rolling like a ball)|ACPFS|1|
Alongamento de uma perna (single leg stretch)|ACPFS|1|u
Alongamento das duas pernas (double leg stretch)|ACPFS|2|
Tesoura (single straight leg stretch)|ACPFS|2|u
Criss-cross|ACPFS|1|
Spine stretch forward|ACPFS|1|
Serrote (saw)|ACPFS|1|u
Cisne (swan)|ACPFS|1|
Chute com uma perna (single leg kick)|ACPFS|1|u
Ponte de ombros (shoulder bridge)|ACPFS|2|u
Chute lateral frente e trás (side kick)|ACPFS|1|u
Natação (swimming)|ACPFS|1|
Leg pull front|ACPFS|2|
Sereia sentada (mermaid)|ACPFS|1|u
Teaser|ACPFS|3|
Enrolamento pélvico (pelvic curl)|ACPFS|1|
Toe taps (toque de pés em tabletop)|ACPFS|1|
Chest lift (abdominal pilates)|ACPFS|1|
Open leg rocker|ACPFS|3|
Corkscrew (saca-rolhas)|ACPFS|3|
Roll over|ACPFS|3|l`,
  pil_ref: `Footwork no reformer|S|1|
Hundred no reformer|S|1|
Pernas nas alças (feet in straps)|S|1|
Ponte no reformer (bridging)|S|1|
Remada sentada no reformer (rowing)|S|1|
Chest expansion ajoelhado no reformer|S|1|
Elefante no reformer (elephant)|S|2|
Knee stretch no reformer|S|2|
Long stretch no reformer|S|3|
Running no reformer|S|1|
Stomach massage no reformer|S|2|
Long box pulling straps|S|2|
Short box round back|S|2|
Footwork na chair (wunda chair)|S|1|`,
};
const N = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const DB = {}, POOLS = {};
for (const [k, txt] of Object.entries({ ...RAW, ...RAW2 })) POOLS[k] = txt.split('\n').map(l => { const [name, eq, lv, fl] = l.split('|'); const e = DB[name] || (DB[name] = { name, eq, lv: +lv, fl: fl || '', p: k }); return e; });

// exercícios de listas fixas (gestante, idosos, corrida, mobilidade, hyrox)
const EXTRA = `Respiração diafragmática sentada|ACPFS|1|
Ativação do assoalho pélvico sentada (Kegel)|ACPFS|1|
Respiração 360° em quatro apoios|ACPFS|1|
Gato-camelo|ACPFS|1|
Prancha lateral nos joelhos|ACPFS|1|hu
Pallof press (anti-rotação)|ACF|1|u
Elevação pélvica|ACF|1|
Remada sentada com elástico|C|1|
Postura da criança|ACPFS|1|h
Alongamento de flexor do quadril ajoelhado|ACPFS|1|hu
Saltos na ponta dos pés (pogo)|ACPF|1|i
Salto horizontal (broad jump)|ACPF|2|ij
Tibial sentado com elástico|CF|1|
Panturrilha sentada (sóleo)|ACPF|1|
Corrida (pista ou rua)|ACPF|1|i
SkiErg|AF|1|
Sled push (empurrar trenó)|AF|1|d
Sled pull (puxar trenó com corda)|AF|1|d
Burpee broad jump|ACPF|2|ij
Farmer carry com kettlebells|ACF|1|d
Sandbag lunges (avanço com saco de areia)|AF|2|jd
Wall ball (Hyrox)|AF|1|j
Agachamento com saco de areia|AF|1|
Superman no solo|CP|1|
Cobra (extensão lombar no solo)|ACPFS|1|
Respiração do crocodilo|ACPFS|1|`;
EXTRA.split('\n').forEach(l => { const [name, eq, lv, fl] = l.split('|'); DB[name] = DB[name] || { name, eq, lv: +lv, fl: fl || '', p: 'extra' }; });

// ---------- leitura do pedido livre do treinador
const PARTES = { joelho: /joelho|patel|menisco|condromal|lca\b|ligamento cruzado/, lombar: /lombar|coluna|h[eé]rnia|ci[aá]tic|protus|escoliose|lombalgia/, ombro: /ombro|manguito|bursite|supraespinhal|luxa/, punho: /punho|t[uú]nel do carpo/, quadril: /quadril/, tornozelo: /tornozelo|entorse/, cervical: /cervical|pesco[cç]o/ };
const DOR = /(dor|dores|doi|les[aã]o|lesion|machuc|problema|cirurgi|operad|limita|evitar|poupar|cuidado|sens[ií]vel|tendin|bursite|h[eé]rnia|artrose|condromal|protus|inflam|instab|fratur|lombalgia|entorse)/;
const FOCOS = [['gluteo', /gl[uú]te|bumbum|bunda/], ['perna', /perna|inferior|coxa|quadr[ií]ceps/], ['posterior', /posterior/], ['panturrilha', /panturrilha/], ['braco', /bra[cç]o|b[ií]ceps|tr[ií]ceps/], ['costas', /costas|dorsa|las?tissimo/], ['peito', /peito|peitoral/], ['ombro', /ombro|delt/], ['core', /abd[oô]m|core|barriga|cintura/], ['superior', /superior(es)?/]];
export function lerPedido(t) {
  const x = N(t), r = { focos: [], restr: [], semImpacto: false, cardio: null, bisets: false, circuito: false, mob: false, min: 0, excluir: [], gestante: false, idoso: false, notas: [] };
  // restrições: parte do corpo perto de palavra de dor
  for (const [k, re] of Object.entries(PARTES)) if (new RegExp(DOR.source + '[^.,;!?]{0,25}(' + re.source + ')|(' + re.source + ')[^.,;!?]{0,14}(dolorid|machucad|operad|lesionad|ruim|fragil|sensivel|instavel|doi|inflamad)').test(x)) r.restr.push(k);
  const semFoco = x.replace(new RegExp('(' + DOR.source + ').{0,40}', 'g'), ' ');
  FOCOS.forEach(([k, re]) => { if (new RegExp('(foco|enfase|priori|mais|destaque|crescer|ganhar|definir|fortalecer|trabalhar|desenvolver|melhorar|aumentar|especial).{0,40}(' + re.source + ')|(' + re.source + ').{0,20}(em foco|prioridade|como foco)').test(semFoco)) r.focos.push(k); });
  if (/sem (impacto|salto|pulo|pular|corrida)|baixo impacto|obes|sobrepeso|acima do peso/.test(x)) r.semImpacto = true;
  if (/sem cardio|nao (quer|gosta de|fazer) cardio/.test(x)) r.cardio = false; else if (/cardio|aerobic|hiit|queimar|gordura|emagrec|condicionamento|folego/.test(x)) r.cardio = true;
  if (/bi[\s-]?set|conjugad|super[\s-]?set/.test(x)) r.bisets = true;
  if (/circuito|amrap|emom|metabolic/.test(x)) r.circuito = true;
  if (/mobilidade|alongamento|flexibilidade|postura/.test(x)) r.mob = true;
  const mm = /(\d{2,3})\s*(min|minutos)\b/.exec(x); if (mm) r.min = Math.max(20, Math.min(120, +mm[1]));
  const mh = /(\d)\s*h(ora)?\b/.exec(x); if (!mm && mh && +mh[1] <= 2) r.min = +mh[1] * 60;
  if (/gestant|gravid|gesta[cç][aã]o|trimestre/.test(x)) r.gestante = true;
  if (/idos|terceira idade|senior|mais de (6|7|8)\d anos|osteopor/.test(x)) r.idoso = true;
  // "sem agachamento", "não gosta de burpee", "evitar leg press"
  const re = /(?:sem|evitar|nada de|tirar|exceto|menos|nao (?:gosta|quer|curte|faz|pode)\w*(?: de| fazer)?)\s+([a-z\- ]{4,30}?)(?=[,.;!\n]| e | ou |$)/g; let q;
  while ((q = re.exec(x))) { const w = q[1].trim().replace(/^(o|a|os|as|de|do|da)\s+/, ''); if (!/^(impacto|salto|pulo|pular|cardio|dor|carga|equipamento|peso|pressa|tempo|muito|nada|problema)/.test(w) && w.length >= 4) r.excluir.push(w.split(' ').slice(0, 2).join(' ')); }
  return r;
}

// ---------- escolha dos exercícios
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const temLocal = (e, loc) => e.eq.includes(loc) || ((loc === 'C' || loc === 'F') && e.eq.includes('P')) || (loc === 'S' && (e.eq.includes('C') || e.eq.includes('P')));
function restrito(e, ctx) {
  const f = e.fl, R = ctx.restr;
  if (R.includes('joelho') && /[ji]/.test(f)) return true;
  if (R.includes('lombar') && /l/.test(f)) return true;
  if (R.includes('ombro') && /o/.test(f)) return true;
  if (R.includes('tornozelo') && /i/.test(f)) return true;
  if (R.includes('punho') && /^(Flexão|Prancha com toque|Burpee|Mountain|Bear|Pike|Handstand)/.test(e.name)) return true;
  if (ctx.semImpacto && /i/.test(f)) return true;
  if (ctx.excluir.some(w => N(e.name).includes(N(w)))) return true;
  return false;
}
function escolher(lista, ctx, opts = {}) {
  const cands = (Array.isArray(lista) ? lista.map(n => DB[n]).filter(Boolean) : POOLS[lista] || []);
  const lvl = opts.lvl || ctx.nivel;
  const ok = e => temLocal(e, ctx.local) && !restrito(e, ctx) && (!opts.filtro || opts.filtro(e));
  const tries = [e => ok(e) && e.lv <= lvl && !ctx.usados.has(e.name), e => ok(e) && e.lv <= lvl && !ctx.dia.has(e.name), e => ok(e) && !ctx.dia.has(e.name), e => temLocal(e, ctx.local) && !restrito(e, ctx) && !ctx.dia.has(e.name)];
  for (const t of tries) { let c = cands.filter(t); if (opts.prefer) { const p = c.filter(opts.prefer); if (p.length) c = p; }
    if (opts.fixo && c.length > 4) c = c.slice(0, 4);
    if (c.length) { const e = c[Math.floor(Math.pow(ctx.r(), 1.5) * c.length)]; ctx.usados.add(e.name); ctx.dia.add(e.name); return e; } }
  return null;
}

// ---------- prescrição
const OBJ = {
  hipertrofia: 'Hipertrofia', emagrecimento: 'Emagrecimento', forca: 'Força', saude: 'Condicionamento e saúde', gluteos: 'Glúteos e pernas',
  funcional: 'Funcional / CrossFit', hyrox: 'Hyrox', pilates: 'Pilates', gestante: 'Gestante', idoso: 'Terceira idade', corrida: 'Fortalecimento para corrida', mobilidade: 'Mobilidade e postura',
};
export const OBJETIVOS = OBJ;
function rx(ctx, papel, e, k) { // séries, repetições e pausa
  const o = ctx.obj, nv = ctx.nivel; let s, r, p;
  const T = { hipertrofia: { M: [4, '6 a 8', 120], C: [3, '8 a 12', 90], I: [3, '10 a 15', 60], K: [3, '12 a 15', 45] }, gluteos: { M: [4, '8 a 10', 120], C: [3, '10 a 12', 90], I: [3, '12 a 15', 60], K: [3, '12 a 15', 45] },
    forca: { M: [5, '3 a 5', 180], C: [4, '6 a 8', 120], I: [3, '8 a 10', 75], K: [3, '10 a 12', 60] }, emagrecimento: { M: [3, '10 a 12', 60], C: [3, '12 a 15', 45], I: [3, '15', 30], K: [3, '15 a 20', 30] },
    saude: { M: [3, '10 a 12', 75], C: [3, '12 a 15', 60], I: [2, '15', 45], K: [3, '12 a 15', 30] }, gestante: { M: [3, '10 a 12', 90], C: [2, '10 a 12', 90], I: [2, '12 a 15', 60], K: [2, '8 a 10', 60] },
    idoso: { M: [3, '8 a 10', 90], C: [3, '10 a 12', 90], I: [2, '12', 60], K: [2, '10', 60] }, corrida: { M: [4, '5 a 6', 150], C: [3, '6 a 8', 90], I: [3, '10 a 12', 60], K: [3, '10 a 12', 45] },
    mobilidade: { M: [2, '8 a 10', 30], C: [2, '8 a 10', 30], I: [2, '10 a 12', 30], K: [2, '8 a 10', 30] }, pilates: { M: [2, '8 a 10', 15], C: [2, '8 a 10', 15], I: [2, '8 a 10', 15], K: [2, '8 a 10', 15] } };
  const t = (T[o] || T.hipertrofia)[papel === 'W' ? 'I' : papel] || T.hipertrofia.I;
  [s, r, p] = t;
  if (nv === 1 && papel !== 'W') { s = Math.max(2, s - 1); if (papel === 'M' && (o === 'forca' || o === 'hipertrofia' || o === 'corrida')) r = o === 'forca' ? '6 a 8' : '10 a 12'; }
  if (nv === 3 && (papel === 'M' || papel === 'C') && ['hipertrofia', 'gluteos', 'forca'].includes(o)) s += 1;
  if (k && k.foco && papel !== 'K' && papel !== 'M') s += 1;
  if (papel !== 'M') s = Math.min(s, 5);
  if (papel === 'W') { s = 1; r = /h/.test(e.fl) ? '30s' : '8 a 10'; p = 15; }
  else if (/h/.test(e.fl)) r = papel === 'K' ? (nv === 1 ? '20 a 30s' : nv === 2 ? '30 a 40s' : '45s') : '30s';
  else if (/d/.test(e.fl)) r = '30 metros';
  else if (e.p === 'pil_solo' || e.p === 'pil_ref') r = /^Hundred/.test(e.name) ? '100' : '8 a 10';
  return { s, r: r + (/u/.test(e.fl) ? ' cada lado' : ''), p };
}

// ---------- divisões semanais
// cada slot: [lista, papel, ordem]; a lista é um grupo (quad, hip…) ou nomes fixos.
const S = {
  fullA: { nome: 'Corpo inteiro', foco: ['perna', 'peito', 'costas'], slots: [['quad', 'M', 1], ['push_h', 'C', 3], ['pull_h', 'C', 4], ['hinge', 'C', 2], ['pull_v', 'C', 4.5], ['push_v', 'C', 5], ['core', 'K', 9], ['lat_raise', 'I', 6], ['hamcurl', 'I', 2.5], ['biceps', 'I', 7], ['triceps', 'I', 8], ['calf', 'I', 8.5]] },
  fullB: { nome: 'Corpo inteiro', foco: ['gluteo', 'costas', 'peito'], slots: [['hip', 'M', 1], ['pull_v', 'C', 3], ['push_inc', 'C', 4], ['quad', 'C', 2], ['pull_h', 'C', 5], ['glute_iso', 'I', 6], ['core', 'K', 9], ['rear', 'I', 7], ['triceps', 'I', 8], ['biceps', 'I', 8.2], ['adutor', 'I', 6.5]] },
  fullC: { nome: 'Corpo inteiro', foco: ['perna', 'costas', 'ombro'], slots: [['quad', 'M', 1], ['pull_h', 'C', 3], ['push_h', 'C', 4], ['hinge', 'C', 2], ['push_v', 'C', 5], ['core', 'K', 9], ['glute_iso', 'I', 6], ['hamcurl', 'I', 2.5], ['biceps', 'I', 7], ['triceps', 'I', 8], ['calf', 'I', 8.5]] },
  push: { nome: 'Peito, ombros e tríceps', foco: ['peito', 'ombro', 'braco'], slots: [['push_h', 'M', 1], ['push_inc', 'C', 2], ['push_v', 'C', 3], ['lat_raise', 'I', 4], ['fly', 'I', 2.5], ['triceps', 'I', 6], ['triceps', 'I', 7], ['lat_raise', 'I', 4.5], ['core', 'K', 9], ['push_h', 'C', 2.2]] },
  pull: { nome: 'Costas e bíceps', foco: ['costas', 'braco'], slots: [['pull_v', 'M', 1], ['pull_h', 'C', 2], ['pull_h', 'C', 3], ['rear', 'I', 4], ['biceps', 'I', 5], ['biceps', 'I', 6], ['pull_v', 'C', 2.5], ['core', 'K', 9], ['rear', 'I', 4.5], ['hinge', 'C', 0.5]] },
  legs: { nome: 'Pernas completo', foco: ['perna', 'gluteo', 'posterior', 'panturrilha'], slots: [['quad', 'M', 1], ['hinge', 'C', 2], ['quad', 'C', 3], ['hamcurl', 'I', 4], ['glute_iso', 'I', 5], ['calf', 'I', 6], ['quad_iso', 'I', 3.5], ['adutor', 'I', 5.5], ['core', 'K', 9], ['hip', 'C', 2.5]] },
  upper: { nome: 'Superiores', foco: ['peito', 'costas', 'ombro', 'braco', 'superior'], slots: [['push_h', 'M', 1], ['pull_v', 'C', 2], ['push_v', 'C', 3], ['pull_h', 'C', 4], ['lat_raise', 'I', 5], ['biceps', 'I', 6], ['triceps', 'I', 7], ['rear', 'I', 5.5], ['fly', 'I', 4.5], ['core', 'K', 9]] },
  upperB: { nome: 'Superiores', foco: ['costas', 'ombro', 'braco', 'superior'], slots: [['pull_v', 'M', 1], ['push_inc', 'C', 2], ['pull_h', 'C', 3], ['push_v', 'C', 4], ['rear', 'I', 5], ['triceps', 'I', 6], ['biceps', 'I', 7], ['lat_raise', 'I', 5.5], ['core', 'K', 9], ['fly', 'I', 4.5]] },
  lowerQ: { nome: 'Inferiores com foco em quadríceps', foco: ['perna', 'panturrilha'], slots: [['quad', 'M', 1], ['quad', 'C', 2], ['hinge', 'C', 3], ['quad_iso', 'I', 4], ['hamcurl', 'I', 5], ['glute_iso', 'I', 6], ['calf', 'I', 7], ['adutor', 'I', 6.5], ['core', 'K', 9], ['quad', 'C', 2.5]] },
  lowerG: { nome: 'Inferiores com foco em glúteos e posteriores', foco: ['gluteo', 'posterior'], slots: [['hip', 'M', 1], ['quad', 'C', 2, e => /u/.test(e.fl)], ['hinge', 'C', 3], ['glute_iso', 'I', 4], ['hamcurl', 'I', 5], ['glute_iso', 'I', 6], ['adutor', 'I', 7], ['core', 'K', 9], ['hip', 'C', 4.5], ['calf', 'I', 8]] },
  armsSh: { nome: 'Ombros e braços', foco: ['ombro', 'braco'], slots: [['push_v', 'M', 1], ['lat_raise', 'I', 2], ['biceps', 'I', 3], ['triceps', 'I', 4], ['rear', 'I', 5], ['biceps', 'I', 6], ['triceps', 'I', 7], ['lat_raise', 'I', 2.5], ['core', 'K', 9]] },
};
const SPLITS = {
  m: { 1: ['fullA'], 2: ['fullA', 'fullB'], 3: ['push', 'pull', 'legs'], 4: ['upper', 'lowerQ', 'upperB', 'lowerG'], 5: ['push', 'pull', 'legs', 'upper', 'lowerG'], 6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] },
  f: { 1: ['fullB'], 2: ['fullB', 'fullA'], 3: ['lowerQ', 'upper', 'lowerG'], 4: ['lowerQ', 'upper', 'lowerG', 'upperB'], 5: ['lowerG', 'upper', 'lowerQ', 'upperB', 'lowerG'], 6: ['lowerQ', 'upper', 'lowerG', 'upperB', 'lowerQ', 'lowerG'] },
  ini: { 1: ['fullA'], 2: ['fullA', 'fullB'], 3: ['fullA', 'fullB', 'fullC'], 4: ['upper', 'lowerQ', 'upperB', 'lowerG'] },
};

// listas fixas por objetivo especial
const ESP = {
  gestante: [
    { nome: 'Força global e assoalho pélvico', slots: [[['Respiração diafragmática sentada'], 'W'], [['Ativação do assoalho pélvico sentada (Kegel)'], 'K'], [['Agachamento sumô com halter (goblet)', 'Agachamento na caixa (box squat)', 'Agachamento goblet com halter'], 'M'], [['Remada baixa com triângulo', 'Remada sentada com elástico', 'Remada unilateral com halter (serrote)'], 'C'], [['Subida no banco (step-up) com peso do corpo', 'Afundo reverso com halteres'], 'C'], [['Desenvolvimento sentado com halteres', 'Desenvolvimento com elástico'], 'C'], [['Abdução de quadril em pé com mini band', 'Cadeira abdutora', 'Abdução de quadril em pé na polia'], 'I'], [['Bird dog (quatro apoios)'], 'K'], [['Pallof press (anti-rotação)', 'Pallof press com elástico', 'Pallof press meio ajoelhado na polia'], 'K']] },
    { nome: 'Posterior, costas e mobilidade', slots: [[['Gato-camelo'], 'W'], [['Respiração 360° em quatro apoios'], 'K'], [['Terra romeno com halteres', 'Levantamento terra com elástico', 'Pull-through na polia'], 'M'], [['Puxada frontal pegada fechada (triângulo)', 'Puxada alta ajoelhado com elástico'], 'C'], [['Elevação pélvica', 'Ponte de glúteos'], 'C'], [['Supino inclinado com halteres', 'Flexão inclinada (mãos no banco)', 'Supino em pé com elástico'], 'C'], [['Rosca alternada com halteres', 'Rosca com elástico'], 'I'], [['Tríceps pulley com corda', 'Tríceps pulley com elástico', 'Tríceps coice com halter'], 'I'], [['Prancha lateral nos joelhos'], 'K'], [['Panturrilha em pé no degrau'], 'I']] },
  ],
  idoso: [
    { nome: 'Força funcional e equilíbrio', slots: [[['Agachamento na caixa (box squat)', 'Leg press horizontal'], 'M'], [['Remada baixa com triângulo', 'Remada sentada com elástico', 'Remada na máquina com peito apoiado'], 'C'], [['Subida no banco (step-up) com peso do corpo'], 'C'], [['Supino na máquina', 'Flexão inclinada (mãos no banco)', 'Supino em pé com elástico'], 'C'], [['Equilíbrio unipodal'], 'K'], [['Ponte de glúteos', 'Elevação pélvica na máquina'], 'I'], [['Panturrilha em pé no degrau', 'Panturrilha em pé na máquina'], 'I'], [['Pallof press com elástico', 'Pallof press meio ajoelhado na polia'], 'K']] },
    { nome: 'Força, marcha e postura', slots: [[['Leg press horizontal', 'Agachamento goblet com halter'], 'M'], [['Puxada frontal pegada fechada (triângulo)', 'Puxada alta ajoelhado com elástico'], 'C'], [['Cadeira flexora', 'Flexora em pé com caneleira'], 'I'], [['Desenvolvimento na máquina', 'Desenvolvimento sentado com halteres'], 'C'], [['Caminhada do fazendeiro'], 'C'], [['Equilíbrio unipodal com alcance (star excursion)'], 'K'], [['Cadeira abdutora', 'Abdução de quadril em pé com mini band'], 'I'], [['Bird dog (quatro apoios)'], 'K'], [['Face pull com elástico', 'Face pull na polia com corda'], 'I']] },
  ],
  corrida: [
    { nome: 'Força unilateral', slots: [[['Agachamento búlgaro com halteres', 'Agachamento búlgaro (peso do corpo)'], 'M'], [['Terra romeno unilateral com halter', 'Terra romeno com halteres'], 'C'], [['Subida no banco (step-up) com halteres', 'Subida no banco (step-up) com peso do corpo'], 'C'], [['Elevação pélvica unilateral (hip thrust)', 'Ponte de glúteos unilateral'], 'C'], [['Panturrilha unilateral em pé com halter', 'Panturrilha unilateral em pé (apoio na parede)'], 'I'], [['Panturrilha sentada na máquina', 'Panturrilha sentada (sóleo)'], 'I'], [['Prancha lateral'], 'K'], [['Pallof press com elástico', 'Pallof press meio ajoelhado na polia'], 'K'], [['Tibial sentado com elástico'], 'I']] },
    { nome: 'Potência e prevenção', slots: [[['Saltos na ponta dos pés (pogo)'], 'C'], [['Agachamento com barra nas costas', 'Agachamento goblet com halter'], 'M'], [['Salto horizontal (broad jump)', 'Box jump'], 'C'], [['Flexão nórdica', 'Mesa flexora', 'Leg curl deslizante (sliders)'], 'C'], [['Prancha Copenhagen com joelho apoiado'], 'K'], [['Abdução de quadril em pé com mini band', 'Abdução de quadril em pé na polia'], 'I'], [['Dead bug'], 'K'], [['Panturrilha em pé no degrau'], 'I']] },
  ],
  mobilidade: [
    { nome: 'Coluna, quadril e core', slots: [[['Respiração do crocodilo', 'Respiração diafragmática sentada'], 'W'], [['Gato-camelo'], 'C'], [['Mobilidade torácica em quatro apoios (thread the needle)'], 'C'], [['90/90 de quadril'], 'C'], [['Bird dog (quatro apoios)'], 'K'], [['Dead bug'], 'K'], [['Ponte de glúteos'], 'C'], [['Alongamento de flexor do quadril ajoelhado'], 'I'], [['Prancha lateral nos joelhos', 'Prancha lateral'], 'K'], [['Postura da criança'], 'I']] },
    { nome: 'Ombros, postura e cadeia posterior', slots: [[['Círculos de braço'], 'W'], [['Deslizamento na parede (wall slide)'], 'C'], [['Livro aberto (open book) deitado de lado'], 'C'], [['Face pull com elástico', 'Face pull na polia com corda'], 'I'], [['Remada sentada com elástico', 'Remada baixa com triângulo'], 'C'], [['Y-T-W com elástico', 'Pull-apart com elástico'], 'I'], [['Dobradiça de quadril com bastão', 'Terra romeno com halteres'], 'C'], [['Cobra (extensão lombar no solo)'], 'I'], [['Mobilidade de tornozelo (joelho à parede)'], 'C']] },
  ],
};
DB['Dobradiça de quadril com bastão'] = { name: 'Dobradiça de quadril com bastão', eq: 'ACPF', lv: 1, fl: '', p: 'extra' };

const DUR = { 30: 5, 45: 6, 60: 8, 75: 9, 90: 10 };
const GRUPO = { quad: 'Quadríceps', quad_iso: 'Quadríceps', hip: 'Glúteos', glute_iso: 'Glúteos', hinge: 'Posteriores', hamcurl: 'Posteriores', adutor: 'Adutores', calf: 'Panturrilhas', push_h: 'Peito', push_inc: 'Peito', fly: 'Peito', push_v: 'Ombros', lat_raise: 'Ombros', rear: 'Ombros', pull_v: 'Costas', pull_h: 'Costas', biceps: 'Bíceps', triceps: 'Tríceps', core: 'Core' };
const FOCO_POOL = { gluteo: ['hip', 'glute_iso'], perna: ['quad', 'quad_iso'], posterior: ['hinge', 'hamcurl'], panturrilha: ['calf'], braco: ['biceps', 'triceps'], costas: ['pull_v', 'pull_h'], peito: ['push_h', 'fly'], ombro: ['lat_raise', 'push_v'], core: ['core'], superior: ['pull_h', 'push_h'] };
const FOCO_NOME = { gluteo: 'glúteos', perna: 'pernas', posterior: 'posteriores', panturrilha: 'panturrilhas', braco: 'braços', costas: 'costas', peito: 'peito', ombro: 'ombros', core: 'abdômen/core', superior: 'superiores' };

// ---------- montagem
export function gerarTreino(o) {
  const ped = lerPedido(o.pedido || '');
  let obj = o.objetivo || 'hipertrofia'; if (ped.gestante) obj = 'gestante'; else if (ped.idoso && ['hipertrofia', 'saude'].includes(obj)) obj = 'idoso';
  const nivel = +o.nivel || 1, dias = Math.max(1, Math.min(7, +o.dias || 3));
  let min = ped.min || +o.duracao || 60; const dk = Object.keys(DUR).map(Number).reduce((a, b) => Math.abs(b - min) < Math.abs(a - min) ? b : a);
  const ctx = { obj, nivel, local: o.local || 'A', restr: ped.restr, semImpacto: ped.semImpacto || obj === 'gestante' || obj === 'idoso', excluir: ped.excluir, usados: new Set(), dia: new Set(), r: rng(o.seed || Date.now()) };
  const sexo = o.sexo === 'm' ? 'm' : 'f'; const focos = ped.focos.slice(); if (obj === 'gluteos') ['perna', 'gluteo'].forEach(f => { if (!focos.includes(f)) focos.unshift(f); });
  const porque = [], sess = [];
  const perna = focos.some(f => ['gluteo', 'perna', 'posterior'].includes(f)), cima = focos.some(f => ['braco', 'costas', 'peito', 'ombro', 'superior'].includes(f));
  const nEx = Math.max(4, (DUR[dk] || 8) - (nivel === 1 ? 1 : 0));
  const querCardio = ped.cardio !== null ? ped.cardio : ['emagrecimento', 'saude', 'gestante', 'idoso'].includes(obj);
  const aquec = o.aquecimento !== false && !['pilates', 'mobilidade'].includes(obj);
  const treinoDias = Math.min(dias, 6);

  if (['hipertrofia', 'forca', 'emagrecimento', 'saude', 'gluteos'].includes(obj)) {
    let estilo = sexo; if (obj === 'gluteos' || (perna && !cima)) estilo = 'f'; else if (cima && !perna) estilo = 'm';
    let split = (nivel === 1 && treinoDias <= 4 ? SPLITS.ini[treinoDias] : null) || SPLITS[estilo][treinoDias];
    if (['emagrecimento', 'saude'].includes(obj) && treinoDias <= 3) split = ['fullA', 'fullB', 'fullC'].slice(0, treinoDias);
    if (obj === 'forca' && treinoDias <= 3) split = ['fullA', 'fullB', 'fullC'].slice(0, treinoDias);
    if (cima && !perna && treinoDias === 5 && estilo === 'm') split = ['push', 'pull', 'legs', 'armsSh', 'upper'];
    split.forEach(k => sess.push(montarSessao(S[k], ctx, nEx, focos)));
    const qual = { m: 'divisão por grupos musculares', f: 'mais estímulo para membros inferiores', ini: 'corpo inteiro (melhor para aprender os movimentos)' };
    porque.push(`Divisão de ${treinoDias} treino${treinoDias > 1 ? 's' : ''} por semana: ${split === SPLITS.ini[treinoDias] ? qual.ini : (['fullA', 'fullB', 'fullC'].includes(split[0]) ? 'corpo inteiro, cada grupo treinado 2 a 3 vezes na semana' : qual[estilo])}.`);
  } else if (obj === 'funcional') { for (let i = 0; i < treinoDias; i++) sess.push(sessaoCF(ctx, i, nEx));
    porque.push('Cada treino tem aquecimento, uma parte de força (técnica com carga), uma de ginástica e um WOD em circuito.');
  } else if (obj === 'hyrox') { for (let i = 0; i < treinoDias; i++) sess.push(sessaoHyrox(ctx, i));
    porque.push('Alterna força com carregamento, simulação das estações e corrida intervalada, como na prova.');
  } else if (obj === 'pilates') { for (let i = 0; i < treinoDias; i++) sess.push(sessaoPilates(ctx, i, nEx + 1));
    porque.push(ctx.local === 'S' ? 'Mistura reformer e solo; repetições controladas, foco em respiração e centro de força.' : 'Pilates de solo; repetições controladas, foco em respiração e centro de força.');
  } else {
    const L = ESP[obj]; for (let i = 0; i < treinoDias; i++) sess.push(sessaoFixa(L[i % L.length], ctx, Math.max(nEx, 7), i >= L.length ? 'B' : ''));
  }
  if (dias === 7) sess.push(sessaoMob(ctx));
  // aquecimento, bi-sets, cardio
  sess.forEach((s, i) => {
    const normal = !s.cf && !s.mob && !s.fixo;
    if ((ped.circuito || obj === 'emagrecimento') && normal && dk >= 45) { ctx.dia = new Set(s.itens.map(x => x.e.name)); const c = []; for (let j = 0; j < 3; j++) { const e = escolher('cond', ctx); if (e) c.push(e); } if (c.length >= 2) s.circuito = { titulo: 'circuito metabólico de 3 voltas, com 30s de pausa entre as voltas', itens: c.map(e => ({ e, s: 3, r: '40s', p: 0 })) }; }
    if (querCardio && !s.cf && !s.mob && obj !== 'hyrox') s.cardio = cardio(ctx, dk, i);
    if (normal) cortarTempo(s, dk);
    if (aquec && !s.mob && !s.cf && obj !== 'gestante') { ctx.dia = new Set(s.itens.map(x => x.e.name)); const n = dk <= 30 ? 1 : 2; const w = []; for (let j = 0; j < n; j++) { const e = escolher('mob', ctx); if (e) w.push({ e, papel: 'W', ...rx(ctx, 'W', e) }); } s.itens.unshift(...w); }
    const fazBi = obj === 'emagrecimento' || ped.bisets || (nivel >= 2 && dk <= 45 && ['hipertrofia', 'gluteos'].includes(obj)) || (nivel === 3 && ['hipertrofia', 'gluteos'].includes(obj));
    if (fazBi && normal) parear(s, obj === 'emagrecimento' || ped.bisets ? 'tudo' : 'iso');
    if (ped.mob && !s.mob && !s.cf) { ctx.dia = new Set(s.itens.map(x => x.e.name)); const e = escolher('mob', ctx); if (e) s.itens.push({ e, papel: 'K', s: 2, r: '30s' + (/u/.test(e.fl) ? ' cada lado' : ''), p: 15, ordem: 99 }); }
  });
  if (ESPX[obj]) porque.push(ESPX[obj]);
  // explicações
  if (ped.restr.length) porque.push(`Cuidado com ${ped.restr.join(', ')}: tirei os exercícios que mais sobrecarregam essa região${ped.restr.includes('joelho') ? ' (saltos, agachamentos profundos e extensora)' : ped.restr.includes('lombar') ? ' (terra, stiff, remada curvada e agachamento com barra)' : ped.restr.includes('ombro') ? ' (desenvolvimentos acima da cabeça, mergulhos e supino com barra)' : ''}.`);
  if (focos.length) { const fl = focos.map(f => FOCO_NOME[f]); porque.push(`Foco em ${fl.length > 1 ? fl.slice(0, -1).join(', ') + ' e ' + fl[fl.length - 1] : fl[0]}: mais um exercício e uma série a mais para esses músculos nos treinos que os trabalham.`); }
  if (ctx.semImpacto && obj !== 'gestante' && obj !== 'idoso') porque.push('Sem impacto: nenhum salto ou corrida; cardio em bicicleta, elíptico ou caminhada inclinada.');
  if (ped.excluir.length) porque.push(`Deixei de fora: ${ped.excluir.join(', ')}.`);
  if (ped.min) porque.push(`Treinos ajustados para cerca de ${ped.min} minutos.`);
  const vol = {}; sess.forEach(s => s.itens.forEach(x => { const g = GRUPO[x.e.p]; if (g && x.papel !== 'W') vol[g] = (vol[g] || 0) + x.s; }));
  const texto = escrever(o, obj, sess, nivel, dias, dk, ctx);
  return { texto, porque, volume: vol, sessoes: sess.length, objetivo: OBJ[obj], pedido: ped };
}

function montarSessao(T, ctx, n, focos) {
  ctx.dia = new Set(); const slots = T.slots.slice(); const extra = [];
  focos.forEach(f => { if ((T.foco || []).includes(f)) { const p = (FOCO_POOL[f] || [])[0]; if (!p) return; const same = slots.filter(x => x[0] === p).map(x => x[2]);
    extra.push([p, GRUPO[p] === 'Core' ? 'K' : (['quad', 'hip', 'hinge', 'pull_v', 'pull_h', 'push_h'].includes(p) ? 'C' : 'I'), (same.length ? Math.max(...same) : 8) + 0.1 + extra.length / 100, null, true]); } });
  const pick = [...slots.slice(0, Math.max(3, n - extra.length)), ...extra].slice(0, n + (extra.length ? 1 : 0));
  const itens = [];
  pick.forEach(([lista, papel, ordem, filtro, foco], pri) => { const e = escolher(lista, ctx, { filtro, prefer: papel === 'M' ? (ctx.obj === 'forca' && ctx.local === 'A' ? (x => /barra/i.test(x.name) && x.lv >= 2 && !/u/.test(x.fl)) : (x => !/u/.test(x.fl))) : null, fixo: papel === 'M' });
    if (e) { const isFoco = foco || focos.some(f => (FOCO_POOL[f] || []).includes(lista)); itens.push({ e, papel, ordem, pri: isFoco ? -1 : pri, ...rx(ctx, papel, e, { foco: isFoco }) }); } });
  itens.sort((a, b) => a.ordem - b.ordem);
  // o primeiro composto é o principal
  const m = itens.find(x => x.papel === 'M'); if (m && itens[0] !== m && itens[0].papel !== 'W') { /* mantém ordem */ }
  return { nome: T.nome, itens };
}
function sessaoFixa(T, ctx, n, suf) {
  ctx.dia = new Set(); const itens = [];
  T.slots.forEach(([lista, papel], i) => { if (itens.length >= n) return; const e = escolher(lista, ctx, { lvl: 3 }); if (e) itens.push({ e, papel, ordem: i, ...rx(ctx, papel, e) }); });
  if (ctx.obj === 'gestante') itens.forEach(x => { if (x.e.name.startsWith('Respiração')) x.r = '8 respirações'; if (x.e.name.startsWith('Ativação do assoalho')) { x.r = '10 contrações de 5s'; x.s = 2; } });
  return { nome: T.nome + (suf ? ' (variação)' : ''), itens, fixo: true, mob: ctx.obj === 'mobilidade' };
}
function sessaoMob(ctx) { ctx.dia = new Set(); const itens = []; for (let i = 0; i < 8; i++) { const e = escolher('mob', ctx); if (e) itens.push({ e, papel: 'K', ordem: i, s: 2, r: (/h/.test(e.fl) ? '30s' : '8 a 10') + (/u/.test(e.fl) ? ' cada lado' : ''), p: 15 }); } return { nome: 'Recuperação ativa e mobilidade', itens, mob: true, fixo: true }; }
function sessaoPilates(ctx, i, n) {
  ctx.dia = new Set(); const itens = []; const studio = ctx.local === 'S';
  const nr = studio ? Math.ceil(n / 2) : 0;
  if (studio) for (let j = 0; j < nr; j++) { const e = escolher('pil_ref', ctx, { prefer: j === 0 ? (x => /^Footwork/.test(x.name)) : null }); if (e) itens.push({ e, papel: 'C', ordem: j, ...rx(ctx, 'C', e) }); }
  const loc = ctx.local; ctx.local = 'S';
  for (let j = 0; itens.length < n && j < n * 2; j++) { const e = escolher('pil_solo', ctx, { prefer: !studio && j === 0 ? (x => /^Hundred/.test(x.name)) : null }); if (e) itens.push({ e, papel: 'C', ordem: 50 + j, ...rx(ctx, 'C', e) }); }
  ctx.local = loc;
  return { nome: ['Centro de força', 'Coluna e mobilidade', 'Controle e equilíbrio', 'Força e fluidez', 'Integração'][i % 5], itens, fixo: true };
}
function sessaoCF(ctx, i, n) {
  ctx.dia = new Set(); const itens = []; const tema = ['Agachamento e clean', 'Empurrar e puxar', 'Levantamento e potência', 'Ginástica e motor'][i % 4];
  for (let j = 0; j < 2; j++) { const e = escolher('mob', ctx); if (e) itens.push({ e, papel: 'W', ordem: j, ...rx(ctx, 'W', e) }); }
  const pref = [x => /Agachamento|clean|Thruster|lunge/i.test(x.name), x => /press|jerk|Push/i.test(x.name), x => /snatch|pull|Power/i.test(x.name), null][i % 4];
  const f = escolher('cf_str', ctx, { prefer: pref }); if (f) itens.push({ e: f, papel: 'M', ordem: 10, s: 5, r: ctx.nivel === 1 ? '5' : '3', p: 120 });
  const g = escolher('cf_gym', ctx); if (g) itens.push({ e: g, papel: 'C', ordem: 20, s: 4, r: /h/.test(g.fl) ? '30s' : ctx.nivel === 3 ? '8 a 10' : '6 a 8', p: 60 });
  const w = []; for (let j = 0; j < (n >= 7 ? 4 : 3); j++) { const e = escolher('cf_wod', ctx); if (e) w.push({ e, s: 1, r: ['15', '12', '10', '20'][j] + (e.name.startsWith('Remo') || e.name.includes('AirBike') ? ' calorias' : ''), p: 0 }); }
  const fmt = ['AMRAP 12 minutos (máximo de voltas)', 'EMOM 16 minutos (1 exercício por minuto)', '5 voltas contra o relógio', 'AMRAP 15 minutos'][i % 4];
  return { nome: tema, itens, cf: true, circuito: { titulo: 'WOD em circuito, ' + fmt, itens: w } };
}
function sessaoHyrox(ctx, i) {
  ctx.dia = new Set(); const it = (n, s, r, p, papel = 'C') => { const e = escolher(n, ctx, { lvl: 3 }); return e ? { e, papel, ordem: 0, s, r, p } : null; };
  const t = i % 3; let itens, nome, circ = null;
  if (t === 0) { nome = 'Força e carregamento'; itens = [it(['Agachamento com barra nas costas', 'Agachamento goblet com halter'], 4, '6', 120, 'M'), it(['Sandbag lunges (avanço com saco de areia)', 'Afundo reverso com halteres'], 3, '20 passos', 90), it(['Sled push (empurrar trenó)'], 4, '25 metros', 90), it(['Farmer carry com kettlebells', 'Caminhada do fazendeiro'], 4, '40 metros', 60), it(['Wall ball (Hyrox)', 'Wall ball'], 3, '20', 60), it(['Prancha frontal'], 3, '45s', 30, 'K')]; }
  else if (t === 1) { nome = 'Simulação das estações'; itens = [it(['Corrida (pista ou rua)'], 4, '1000 metros', 60)]; circ = { titulo: 'circuito das estações, 3 voltas sem pausa entre as estações', itens: [it(['SkiErg'], 1, '500 metros', 0), it(['Sled pull (puxar trenó com corda)'], 1, '25 metros', 0), it(['Burpee broad jump'], 1, '10', 0), it(['Remo ergômetro'], 1, '500 metros', 0), it(['Sandbag lunges (avanço com saco de areia)'], 1, '20 passos', 0)].filter(Boolean) }; }
  else { nome = 'Corrida intervalada e corrida cansado'; itens = [it(['Corrida (pista ou rua)'], 6, '400 metros', 90), it(['Burpee broad jump'], 3, '10', 60), it(['Wall ball (Hyrox)', 'Wall ball'], 3, '25', 60), it(['SkiErg', 'Remo ergômetro'], 3, '250 metros', 60), it(['Farmer carry com kettlebells', 'Caminhada do fazendeiro'], 3, '50 metros', 60)]; }
  return { nome, itens: itens.filter(Boolean), fixo: true, circuito: circ, cf: true };
}
const ESPX = {
  gestante: 'Treinos pensados para a gestação: respiração e assoalho pélvico no início, força global com esforço moderado, sem impacto e sem abdominais de flexão.',
  idoso: 'Prioriza força de pernas, equilíbrio e marcha (o que mais protege contra quedas), com subida rápida e descida controlada.',
  corrida: 'Força unilateral, panturrilha/sóleo, potência e core: o que mais previne lesões e melhora a economia da corrida.',
  mobilidade: 'Mobilidade de coluna, quadril e ombros com ativação de core e glúteos, em ritmo lento e sem dor.',
};
function tempoItem(x) { return x.s * ((x.p || 0) + (/h/.test(x.e.fl) || /s\b/.test(x.r) ? 40 : 40) * (/u/.test(x.e.fl) ? 1.8 : 1)); }
function cortarTempo(s, dk) { // tira os exercícios menos prioritários até caber no tempo do treino
  const cardioMin = s.cardio ? (/tiros/.test(s.cardio) ? 10 : +((/(\d+) minutos/.exec(s.cardio) || [])[1] || 0)) : 0;
  const budget = (dk - 4 - cardioMin - (s.circuito ? 8 : 0)) * 60;
  const tot = () => s.itens.reduce((a, x) => a + tempoItem(x), 0);
  while (tot() > budget && s.itens.length > 4) { let k = -1; s.itens.forEach((x, i) => { if (x.papel !== 'M' && (k < 0 || (x.pri ?? 0) > (s.itens[k].pri ?? 0))) k = i; }); if (k < 0) break; s.itens.splice(k, 1); }
}
function parear(s, modo) { // marca bi-sets entre exercícios vizinhos
  let g = 0; const L = s.itens;
  for (let i = 0; i < L.length - 1; i++) { const a = L[i], b = L[i + 1];
    if (a.bi || b.bi || a.papel === 'W' || b.papel === 'W' || a.papel === 'M' || b.papel === 'M' || a.papel === 'K' || b.papel === 'K') continue;
    if (modo === 'iso' && (a.papel !== 'I' || b.papel !== 'I')) continue;
    g++; a.bi = b.bi = g; b.p = a.p = Math.min(a.p, b.p); i++; }
}
function cardio(ctx, dk, i) {
  const imp = ctx.semImpacto || ctx.restr.includes('joelho') || ctx.restr.includes('tornozelo'); const casa = ctx.local === 'C' || ctx.local === 'P';
  const m = dk >= 60 ? 20 : dk >= 45 ? 15 : 10;
  if (ctx.obj === 'gestante' || ctx.obj === 'idoso') return `CARDIO — Bicicleta ergométrica ${m} minutos em ritmo moderado (consegue conversar)`;
  if (ctx.obj === 'emagrecimento' && i % 2 === 0 && ctx.nivel >= 2 && !imp) return casa ? 'CARDIO — Corrida estacionária: 10 tiros de 30s forte com 30s leve' : 'CARDIO — Bicicleta ergométrica: 10 tiros de 30s forte com 30s leve';
  return casa ? `CARDIO — Caminhada ${m} minutos em ritmo moderado` : imp ? `CARDIO — Bicicleta ergométrica ${m} minutos em ritmo moderado` : `CARDIO — Esteira (caminhada inclinada) ${m} minutos`;
}
const NOTA = {
  hipertrofia: 'Neste treino: descida controlada (2 a 3s) e 1 a 2 repetições de reserva em todos os exercícios.',
  gluteos: 'Neste treino: segure 1s na contração do glúteo e desça devagar em todos os exercícios.',
  forca: 'Neste treino: aqueça o principal com 2 a 3 séries leves antes; técnica perfeita em todos os exercícios.',
  emagrecimento: 'Neste treino: pausas curtas e ritmo constante; mantenha a técnica em todos os exercícios.',
  saude: 'Neste treino: esforço moderado (dá para conversar) e respiração contínua em todos os exercícios.',
  gestante: 'Neste treino: esforço leve a moderado (consegue conversar), sem prender a respiração e sem ficar muito tempo deitada de barriga para cima.',
  idoso: 'Neste treino: suba rápido e desça devagar em todos os exercícios; apoio sempre por perto nos de equilíbrio.',
  corrida: 'Neste treino: movimentos explosivos na subida e controle na aterrissagem em todos os exercícios.',
  mobilidade: 'Neste treino: movimentos lentos, sem dor, respirando fundo em todos os exercícios.',
  pilates: 'Neste treino: ative o centro de força e coordene a respiração em todos os exercícios.',
  funcional: 'Neste treino: priorize a técnica na força e mantenha o ritmo no WOD.',
  hyrox: 'Neste treino: ritmo de prova; anote os tempos para comparar nas próximas semanas.',
};
const ORIENT = {
  base: ['Aumente a carga quando completar todas as repetições com boa técnica por 2 treinos seguidos.', 'Hidrate-se e respeite as pausas indicadas.', 'Qualquer dor diferente do cansaço muscular: pare o exercício e avise seu treinador.'],
  gestante: ['Treinar somente com liberação do obstetra; ajustar os exercícios a cada trimestre.', 'Pare e procure atendimento se houver sangramento, perda de líquido, contrações, tontura, falta de ar fora do normal ou dor de cabeça forte.'],
  idoso: ['Use apoio (parede ou barra) sempre que precisar nos exercícios de equilíbrio.', 'Meça a pressão antes do treino se tiver hipertensão.'],
  hyrox: ['Sem trenó: empurre anilha no chão ou use a esteira desligada.', 'Repita a simulação a cada 2 a 3 semanas para medir a evolução.'],
  funcional: ['Escale o WOD (carga, repetições ou movimento) para manter a técnica.'],
};
function linha(x, num) { const d = `${x.s}x ${x.r}`; return `${num}. ${x.e.name} — ${d}${x.p ? ` | Pausa: ${x.p >= 120 && x.p % 60 === 0 ? x.p / 60 + ' min' : x.p + 's'}` : ''}`; }
function escrever(o, obj, sess, nivel, dias, dk, ctx) {
  const L = [...(o.nome?.trim() ? [o.nome.trim()] : []), `Objetivo: ${OBJ[obj]} · Nível ${['', 'iniciante', 'intermediário', 'avançado'][nivel]} · ${dias}x por semana · cerca de ${dk} minutos`, ''];
  const letras = 'ABCDEFG';
  sess.forEach((s, si) => {
    L.push(`TREINO ${letras[si]} – ${s.nome}`); L.push((s.mob ? NOTA.mobilidade : NOTA[obj] || NOTA.hipertrofia) + (s.circuito && s.circuito.itens.length ? ' Final do treino: ' + s.circuito.titulo + '.' : ''));
    let n = 0; const its = s.itens;
    for (let i = 0; i < its.length; i++) { const x = its[i];
      if (x.bi && its[i + 1] && its[i + 1].bi === x.bi) { n++; L.push(linha(x, n + 'a').replace(/ \| Pausa:.*$/, '')); L.push(linha(its[i + 1], n + 'b')); i++; }
      else { n++; L.push(linha(x, n)); } }
    if (s.circuito && s.circuito.itens.length) { L.push('CIRCUITO'); const ci = s.circuito.itens; ci.forEach((x, j) => { n++; L.push(`${n}. ${x.e.name} — ${x.s}x ${x.r}` + (j === ci.length - 1 ? ` | Pausa: ${s.cf && !s.fixo ? 10 : 30}s` : '')); }); }
    if (s.cardio) L.push(s.cardio);
    L.push('');
  });
  L.push('ORIENTAÇÕES'); [...(ORIENT[obj] || []), ...ORIENT.base].forEach(t => L.push(t));
  return L.join('\n');
}
