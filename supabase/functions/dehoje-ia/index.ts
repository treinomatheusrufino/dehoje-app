import { createClient } from 'npm:@supabase/supabase-js@2';

// DE HOJE.IA v2 — geração de treino personalizada pelo método de cada treinador.
// Ações: status | salvar_metodo | salvar_preset | excluir_preset | gerar | refinar
// Segurança: só treinador logado; nenhum dado pessoal do aluno (nome, contato) é enviado à IA.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const TIPOS: Record<string, string> = {
  forca: 'Força máxima: cargas altas, poucas repetições (3–6), descansos longos (2–4 min), exercícios multiarticulares como base.',
  hipertrofia: 'Hipertrofia: volume moderado a alto, 6–15 repetições perto da falha, descansos de 60–120 s, controle de cadência.',
  emagrecimento: 'Emagrecimento: alto gasto energético preservando massa magra; força com descansos curtos, circuitos ou métodos combinados e cardio estratégico.',
  condicionamento: 'Condicionamento: capacidade aeróbia e anaeróbia, circuitos, intervalados e exercícios metabólicos.',
  resistencia: 'Resistência muscular: repetições altas (15–25+), descansos curtos, densidade de treino.',
  funcional: 'Funcional: padrões de movimento (agachar, empurrar, puxar, levantar, girar, carregar), estabilidade e core.',
  mobilidade: 'Mobilidade e flexibilidade: amplitude, controle articular, alongamentos e ativação.',
  reabilitacao: 'Retorno/readaptação: progressão conservadora, controle motor, sem dor, baixa carga articular.',
  gestante: 'Gestante: segurança materno-fetal, sem decúbito dorsal prolongado após o 1º trimestre, sem impacto e sem manobra de Valsalva, foco em postura, assoalho pélvico e condicionamento leve a moderado.',
  idoso: 'Pessoa idosa: força funcional, equilíbrio, prevenção de quedas, potência com segurança.',
  performance: 'Performance esportiva: potência, velocidade, força específica do esporte informado.',
  personalizado: 'Personalizado: o tipo de treino é definido exclusivamente pela descrição do treinador.',
};

function norm(t: string) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function grupo(mg: string): 'mmss' | 'mmii' | 'core' | 'cardio' | 'mobilidade' | 'outro' {
  const g = norm(mg);
  if (/^(cardio|funcional — condicionamento|crossfit — condicionamento|hyrox — estacoes)/.test(g)) return 'cardio';
  if (/^(mobilidade|alongamento)/.test(g)) return 'mobilidade';
  if (/(abdomen|core|reto abdominal|obliquo|transverso|assoalho)/.test(g)) return 'core';
  if (/(peito|costas|dorsa|ombro|deltoide|biceps|triceps|antebraco|trapezio|manguito|romboide)/.test(g)) return 'mmss';
  if (/(quadriceps|posterior|gluteo|abducao|aducao|adutor|panturrilha|gastrocnemio|soleo|tibial|pernas)/.test(g)) return 'mmii';
  return 'outro';
}

type Cat = { id: number; name: string; muscle_group: string; g: string };

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    titulo: { type: 'STRING' },
    resumo_estrategia: { type: 'STRING' },
    treinos: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nome: { type: 'STRING' },
          foco: { type: 'STRING' },
          observacao_dia: { type: 'STRING' },
          duracao_estimada_min: { type: 'INTEGER' },
          blocos: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                metodo: { type: 'STRING', enum: ['normal', 'biset', 'triset', 'giant_set', 'superset', 'piramide', 'piramide_inv', 'dropset', 'rest_pause', 'cluster', 'pre_exaustao', 'pos_exaustao', 'isometria', 'negativa', 'cardio'] },
                series: { type: 'INTEGER' },
                descanso_s: { type: 'INTEGER' },
                nota_bloco: { type: 'STRING' },
                itens: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      exercicio_id: { type: 'INTEGER' },
                      exercicio_nome: { type: 'STRING' },
                      repeticoes: { type: 'STRING' },
                      carga_sugerida: { type: 'STRING' },
                      nota: { type: 'STRING' },
                    },
                    required: ['exercicio_id', 'exercicio_nome', 'repeticoes'],
                  },
                },
              },
              required: ['metodo', 'series', 'descanso_s', 'itens'],
            },
          },
        },
        required: ['nome', 'foco', 'blocos'],
      },
    },
    como_segui_o_pedido: { type: 'ARRAY', items: { type: 'STRING' } },
    progressao: { type: 'STRING' },
    alertas: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['titulo', 'resumo_estrategia', 'treinos', 'como_segui_o_pedido'],
};

function systemPrompt() {
  return `Você é o motor de prescrição do DE HOJE, atuando como um personal trainer sênior (CREF), especialista em periodização e prescrição individualizada. Você escreve em português do Brasil, com a linguagem técnica de um treinador experiente.

PRINCÍPIO CENTRAL: o treino pertence ao TREINADOR. Você executa a visão dele com precisão; não entrega "receita de bolo". Um treino genérico, que serviria para qualquer pessoa, é uma resposta errada.

ORDEM DE PRIORIDADE (a de cima sempre vence):
1. Segurança e restrições informadas (lesões, dores, gestação, condições).
2. A DESCRIÇÃO DO TREINADOR para este treino (texto livre). Siga cada instrução dela literalmente: quantidades, ordem, exercícios citados, métodos, cadência, tempo, divisão.
3. O MÉTODO PERMANENTE do treinador (o jeito dele de trabalhar).
4. Os parâmetros do formulário (tipo, nível, frequência, duração, volumes, equipamentos).
5. Boas práticas de prescrição — só para preencher o que o treinador não definiu.

REGRAS OBRIGATÓRIAS:
- Use SOMENTE exercícios do CATÁLOGO enviado, pelo id exato. exercicio_nome deve ser o nome do catálogo. Nunca invente exercício.
- Se o treinador citar um exercício, encontre o equivalente mais próximo no catálogo.
- Quantidades pedidas são exatas: se pediu 4 exercícios de membros superiores, são 4 (um bi-set conta 2 exercícios).
- Número de treinos = frequência semanal informada, salvo se a descrição definir outra divisão.
- Cada treino: nome curto ("Treino A"), foco claro, observacao_dia com a orientação que vale para a sessão inteira (cadência, aquecimento, percepção de esforço) quando fizer sentido.
- repeticoes: "10", "8-12", "6/8/10/12" (pirâmide), "40 s" (isometria), "até a falha". Para cardio use duração ou protocolo: "20 min", "8x (30 s forte / 90 s leve)", "5 km".
- Blocos com mais de um exercício (biset, triset, superset, giant_set, pre_exaustao, pos_exaustao) só quando o treinador pedir ou permitir métodos avançados.
- Cardio: um bloco com metodo "cardio", series 1, descanso_s 0, com intensidade (zona, % FCmáx, PSE ou velocidade) na nota.
- descanso_s coerente com o objetivo. carga_sugerida em termos relativos (ex.: "RIR 2", "PSE 8", "60% 1RM") — nunca invente kg.
- nota de cada exercício: dica técnica curta e específica ligada ao objetivo, não frase genérica.
- Respeite a duração da sessão (estime ~2–3 min por série com descanso).
- Distribua grupos musculares com lógica (sinergistas, recuperação entre treinos da semana, ordem multiarticular → isolado, salvo pedido contrário).
- Em "como_segui_o_pedido", liste ponto a ponto como cada instrução do treinador foi atendida. Se algo não pôde ser atendido (por segurança ou por falta no catálogo), diga em "alertas" e explique.
- "progressao": como evoluir esse treino nas próximas semanas, no estilo do treinador.`;
}

function catalogText(cat: Cat[]) {
  const by: Record<string, string[]> = {};
  for (const c of cat) (by[c.muscle_group] ||= []).push(`${c.id}:${c.name}`);
  return Object.entries(by).map(([g, l]) => `# ${g}\n${l.join('\n')}`).join('\n');
}

function briefText(b: any, metodo: string, preset: any) {
  const L: string[] = [];
  const tipo = String(b.tipo || 'personalizado');
  L.push(`TIPO DE TREINO: ${tipo}${TIPOS[tipo] ? ' — ' + TIPOS[tipo] : ''}`);
  if (preset) L.push(`TIPO SALVO PELO TREINADOR "${preset.name}":\n${preset.description}`);
  if (b.descricao) L.push(`DESCRIÇÃO DO TREINADOR PARA ESTE TREINO (prioridade máxima depois da segurança):\n${String(b.descricao).slice(0, 4000)}`);
  if (metodo) L.push(`MÉTODO PERMANENTE DO TREINADOR:\n${metodo.slice(0, 3000)}`);
  const P: string[] = [];
  if (b.sexo) P.push(`sexo: ${b.sexo}`);
  if (b.idade) P.push(`idade: ${b.idade}`);
  if (b.nivel) P.push(`nível: ${b.nivel}`);
  if (b.frequencia) P.push(`frequência: ${b.frequencia}x por semana`);
  if (b.duracao_min) P.push(`duração da sessão: ${b.duracao_min} min`);
  if (b.divisao && b.divisao !== 'auto') P.push(`divisão: ${b.divisao}`);
  const v = b.volume || {};
  if (v.mmss != null) P.push(`exercícios de membros superiores por treino: ${v.mmss}`);
  if (v.mmii != null) P.push(`exercícios de membros inferiores por treino: ${v.mmii}`);
  if (v.core != null) P.push(`exercícios de core/abdômen por treino: ${v.core}`);
  if (v.total != null) P.push(`total de exercícios por treino: ${v.total}`);
  if (Array.isArray(b.metodos) && b.metodos.length) P.push(`métodos permitidos: ${b.metodos.join(', ')}`);
  else P.push('métodos avançados: só se a descrição pedir');
  const c = b.cardio || {};
  if (c.incluir) P.push(`cardio: sim — momento: ${c.momento || 'a critério'}, modalidade: ${c.modalidade || 'a critério'}, duração: ${c.duracao_min ? c.duracao_min + ' min' : 'a critério'}, protocolo: ${c.protocolo || 'a critério'}`);
  else if (c.incluir === false) P.push('cardio: não incluir');
  if (b.equipamentos) P.push(`equipamentos disponíveis: ${b.equipamentos}`);
  if (b.restricoes) P.push(`RESTRIÇÕES / CUIDADOS: ${String(b.restricoes).slice(0, 1500)}`);
  if (P.length) L.push('PARÂMETROS:\n- ' + P.join('\n- '));
  return L.join('\n\n');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(key: string, sys: string, user: string, deadline: number, opts: any = {}): Promise<{ data: any; model: string }> {
  const models = opts.models || [...new Set([Deno.env.get('GEMINI_MODEL'), 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-flash-lite-latest'].filter(Boolean) as string[])];
  let thinking: any = opts.thinking === undefined ? { thinkingLevel: 'low' } : opts.thinking;
  const erros: string[] = [];
  for (const m of models) {
    for (let tent = 0; tent < 2; tent++) {
      const resta = deadline - Date.now();
      if (resta < 15000) throw new Error('A IA demorou demais para responder. Tente de novo em instantes.');
      let r: Response;
      try {
        r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sys }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature: 0.55, responseMimeType: 'application/json', responseSchema: SCHEMA, maxOutputTokens: 16384, ...(thinking ? { thinkingConfig: thinking } : {}) },
          }),
          signal: AbortSignal.timeout(Math.min(80000, resta - 5000)),
        });
      } catch (e) { erros.push(`${m}: ${String((e as Error)?.message || e)}`); break; }
      const txt = await r.text();
      if (r.status === 400 && thinking && /thinking/i.test(txt)) { thinking = null; tent--; continue; }
      if (r.status === 404 || r.status === 429 || r.status === 400 || r.status === 403) { erros.push(`${m}: ${r.status} ${txt.replace(/\s+/g, ' ').slice(0, 160)}`); break; }
      if (r.status >= 500) { erros.push(`${m}: ${r.status} sobrecarregado`); await sleep(1500 + tent * 2000); continue; }
      if (!r.ok) { erros.push(`${m}: ${r.status} ${txt.replace(/\s+/g, ' ').slice(0, 160)}`); break; }
      try {
        const body = JSON.parse(txt);
        const out = body?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
        return { data: JSON.parse(out), model: m + (opts.trace ? ` (${erros.length} falhas antes)` : '') };
      } catch { erros.push(`${m}: resposta em formato inválido`); }
    }
  }
  const det = erros.join(' || ');
  if (/API key|API_KEY|PERMISSION_DENIED|403/i.test(det) && !/50\d/.test(det)) throw new Error('A chave da IA foi recusada pelo Google. Detalhe: ' + det.slice(0, 400));
  throw new Error('Os servidores de IA do Google estão ocupados agora. Tente de novo em 1 ou 2 minutos. Detalhe: ' + det.slice(0, 400));
}

function validar(res: any, cat: Map<number, Cat>, byName: Map<string, Cat>, b: any) {
  const problemas: string[] = [];
  const v = b.volume || {};
  for (const t of res.treinos || []) {
    const cont: Record<string, number> = { mmss: 0, mmii: 0, core: 0, cardio: 0, total: 0 };
    for (const bl of t.blocos || []) {
      for (const it of bl.itens || []) {
        let c = cat.get(Number(it.exercicio_id));
        if (!c || norm(c.name) !== norm(it.exercicio_nome)) {
          const byN = byName.get(norm(it.exercicio_nome));
          if (byN) c = byN;
        }
        if (!c) { it.exercicio_id = null; it.revisar = true; problemas.push(`${t.nome}: "${it.exercicio_nome}" não existe no catálogo.`); continue; }
        it.exercicio_id = c.id; it.exercicio_nome = c.name; it.grupo = c.g;
        if (c.g in cont) cont[c.g]++;
        if (c.g !== 'cardio' && c.g !== 'mobilidade') cont.total++;
      }
    }
    for (const k of ['mmss', 'mmii', 'core'] as const) {
      if (v[k] != null && Number(v[k]) !== cont[k]) problemas.push(`${t.nome}: pedido ${v[k]} exercício(s) de ${k === 'mmss' ? 'membros superiores' : k === 'mmii' ? 'membros inferiores' : 'core'}, veio ${cont[k]}.`);
    }
    if (v.total != null && Number(v.total) !== cont.total) problemas.push(`${t.nome}: pedido total de ${v.total} exercícios, veio ${cont.total}.`);
  }
  if (b.frequencia && !String(b.descricao || '').trim() && (res.treinos || []).length !== Number(b.frequencia))
    problemas.push(`Pedido ${b.frequencia} treinos na semana, vieram ${(res.treinos || []).length}.`);
  return problemas;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return j({ error: 'método inválido' }, 405);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  let uid = '';
  let action = '';
  let body: any = {};
  void action; void body;
  try {
    const cs = req.headers.get('x-cron-secret');
    if (cs) {
      const { data: sec } = await sb.from('app_secrets').select('v').eq('k', 'cron_secret').maybeSingle();
      if (!sec?.v || sec.v !== cs) return j({ error: 'não autorizado' }, 401);
      const body0 = await req.json().catch(() => ({}));
      const key = Deno.env.get('GEMINI_API_KEY') || '';
      if (body0.teste_treino) {
        const { data: rows } = await sb.from('exercises').select('id,name,muscle_group').order('muscle_group').order('name');
        const cat: Cat[] = (rows || []).map((r: any) => ({ ...r, g: grupo(r.muscle_group) }));
        const b = body0.briefing || { tipo: 'personalizado', descricao: 'Treino de força para inferiores: 5 exercícios, começando por agachamento livre 5x5 com 3 min de pausa, 2 de posterior, 1 de glúteo e 1 de core. Superiores só 2, de puxar. Cardio de 15 min no elíptico no final.', frequencia: 1, duracao_min: 60, volume: { mmss: 2 } };
        const t0 = Date.now();
        try {
          const r = await callGemini(key, systemPrompt(), `CATÁLOGO DE EXERCÍCIOS (id:nome, agrupados por grupo muscular):\n${catalogText(cat)}\n\n=== PEDIDO DO TREINADOR ===\n${briefText(b, '', null)}`, Date.now() + 140000, { models: body0.modelos, thinking: body0.thinking });
          const pr = validar(r.data, new Map(cat.map((c) => [c.id, c])), new Map(cat.map((c) => [norm(c.name), c])), b);
          return j({ ok: true, ms: Date.now() - t0, model: r.model, pendencias: pr, resultado: r.data });
        } catch (e) { return j({ ok: false, ms: Date.now() - t0, error: String((e as Error)?.message || e) }); }
      }
      const out: any = { tem_chave: !!key, prefixo: key.slice(0, 3), tamanho: key.length, modelos: [], testes: [] };
      const lm = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
      const lt = await lm.text();
      out.lista_status = lm.status;
      try { out.modelos = (JSON.parse(lt).models || []).filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m: any) => m.name); } catch { out.lista_erro = lt.slice(0, 300); }
      for (const m of (body0.modelos || ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash'])) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Responda só: ok' }] }] }) });
        out.testes.push({ m, status: r.status, corpo: (await r.text()).replace(/\s+/g, ' ').slice(0, 220) });
      }
      return j(out);
    }
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = await sb.auth.getUser(jwt);
    if (!u?.user) return j({ error: 'Entre na sua conta de treinador.' });
    uid = u.user.id;
    const { data: pr } = await sb.from('profiles').select('id,role,plan,demo_until,paid_until,ai_method').eq('id', uid).maybeSingle();
    if (!pr || pr.role !== 'trainer') return j({ error: 'Apenas treinadores usam a DE HOJE.IA.' });
    const { data: ok } = await sb.rpc('trainer_access_ok', { p_trainer: uid });
    if (!ok) return j({ error: 'Seu acesso está vencido. Fale com o responsável pelo DE HOJE.' });

    body = await req.json().catch(() => ({}));
    action = String(body.action || 'gerar');
    const limite = pr.plan === 'demo' ? 8 : 40;
    const desde = new Date(Date.now() - 864e5).toISOString();
    const { count: usados } = await sb.from('ai_generations').select('id', { count: 'exact', head: true }).eq('trainer_id', uid).in('action', ['gerar', 'refinar']).eq('status', 'ok').gte('created_at', desde);
    const key = Deno.env.get('GEMINI_API_KEY') || '';

    if (action === 'status') {
      const { data: presets } = await sb.from('trainer_ai_presets').select('id,name,base_type,description,params,updated_at').eq('trainer_id', uid).order('name');
      return j({ ok: true, configurada: !!key, metodo: pr.ai_method || '', presets: presets || [], usados_24h: usados || 0, limite_24h: limite, tipos: Object.keys(TIPOS) });
    }
    if (action === 'resultado') {
      const { data: g } = await sb.from('ai_generations').select('id,status,output,error,created_at').eq('id', String(body.job || '')).eq('trainer_id', uid).maybeSingle();
      if (!g) return j({ error: 'Geração não encontrada.' });
      if (g.status === 'pendente') {
        if (Date.now() - new Date(g.created_at).getTime() > 200000) return j({ error: 'A geração não terminou a tempo. Tente de novo.' });
        return j({ pendente: true });
      }
      if (g.status === 'erro') return j({ error: g.error || 'Falha na geração.' });
      return j({ ok: true, resultado: g.output, usados_24h: usados || 0, limite_24h: limite });
    }
    if (action === 'salvar_metodo') {
      const t = String(body.texto || '').slice(0, 3000);
      const { error } = await sb.from('profiles').update({ ai_method: t || null }).eq('id', uid);
      if (error) throw error;
      return j({ ok: true });
    }
    if (action === 'salvar_preset') {
      const nome = String(body.nome || '').trim().slice(0, 60);
      const desc = String(body.descricao || '').trim().slice(0, 4000);
      if (nome.length < 2 || desc.length < 10) return j({ error: 'Dê um nome e descreva como é esse tipo de treino.' });
      const row = { trainer_id: uid, name: nome, base_type: String(body.base_type || 'personalizado'), description: desc, params: body.params || {}, updated_at: new Date().toISOString() };
      const { data, error } = await sb.from('trainer_ai_presets').upsert(row, { onConflict: 'trainer_id,name' }).select('id').single();
      if (error) throw error;
      return j({ ok: true, id: data.id });
    }
    if (action === 'excluir_preset') {
      const { error } = await sb.from('trainer_ai_presets').delete().eq('id', String(body.id || '')).eq('trainer_id', uid);
      if (error) throw error;
      return j({ ok: true });
    }
    if (action !== 'gerar' && action !== 'refinar') return j({ error: 'ação inválida' });

    if (!key) return j({ error: 'A DE HOJE.IA ainda não foi ativada pelo responsável do app.' });
    if ((usados || 0) >= limite) return j({ error: `Você usou as ${limite} gerações das últimas 24 horas. Tente mais tarde.` });

    const b = body.briefing || {};
    if (String(b.tipo) === 'personalizado' && !String(b.descricao || '').trim() && !b.preset_id)
      return j({ error: 'No tipo Personalizado, descreva como você quer o treino.' });

    let preset: any = null;
    if (b.preset_id) {
      const { data } = await sb.from('trainer_ai_presets').select('name,description,params').eq('id', b.preset_id).eq('trainer_id', uid).maybeSingle();
      preset = data;
    }

    const { data: rows, error: ce } = await sb.from('exercises').select('id,name,muscle_group').order('muscle_group').order('name');
    if (ce) throw ce;
    const cat: Cat[] = (rows || []).map((r: any) => ({ ...r, g: grupo(r.muscle_group) }));
    const catMap = new Map(cat.map((c) => [c.id, c]));
    const byName = new Map(cat.map((c) => [norm(c.name), c]));

    const sys = systemPrompt();
    let user = `CATÁLOGO DE EXERCÍCIOS (id:nome, agrupados por grupo muscular):\n${catalogText(cat)}\n\n=== PEDIDO DO TREINADOR ===\n${briefText(b, pr.ai_method || '', preset)}`;
    if (action === 'refinar') {
      const ant = body.anterior;
      const ped = String(body.pedido || '').trim().slice(0, 2000);
      if (!ant || !ped) return j({ error: 'Diga o que você quer mudar no treino.' });
      user += `\n\n=== TREINO ATUAL (gerado antes) ===\n${JSON.stringify(ant).slice(0, 30000)}\n\n=== AJUSTE PEDIDO PELO TREINADOR ===\n${ped}\n\nDevolva o treino completo já ajustado. Mude apenas o que o ajuste pede; mantenha o resto igual.`;
    }

    const { data: job, error: je } = await sb.from('ai_generations').insert({ trainer_id: uid, action, input: { briefing: b, pedido: body.pedido || null }, status: 'pendente', ok: false }).select('id').single();
    if (je) throw je;
    const inicio = Date.now(), deadline = inicio + 140000;
    const trabalho = (async () => {
      try {
        let { data: res, model } = await callGemini(key, sys, user, deadline);
        let problemas = validar(res, catMap, byName, b);
        if (problemas.length && deadline - Date.now() > 60000) {
          const fix = `${user}\n\n=== SUA RESPOSTA ANTERIOR ===\n${JSON.stringify(res).slice(0, 30000)}\n\n=== CORRIJA ESTES PROBLEMAS (obrigatório) ===\n- ${problemas.join('\n- ')}\nDevolva o treino completo corrigido.`;
          try {
            const r2 = await callGemini(key, sys, fix, deadline);
            const p2 = validar(r2.data, catMap, byName, b);
            if (p2.length <= problemas.length) { res = r2.data; problemas = p2; model = r2.model; }
          } catch (_) { /* mantém a primeira versão */ }
        }
        res.pendencias = problemas;
        await sb.from('ai_generations').update({ output: res, model, ok: true, status: 'ok' }).eq('id', job.id);
      } catch (e) {
        await sb.from('ai_generations').update({ status: 'erro', ok: false, error: String((e as Error)?.message || e).slice(0, 500) }).eq('id', job.id);
      }
    })();
    // @ts-ignore EdgeRuntime existe no Supabase
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) { EdgeRuntime.waitUntil(trabalho); return j({ ok: true, job: job.id }); }
    await trabalho;
    return j({ ok: true, job: job.id });
  } catch (e) {
    return j({ error: String((e as Error)?.message || e) });
  }
});
