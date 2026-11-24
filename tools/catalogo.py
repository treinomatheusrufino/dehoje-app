"""Catálogo dos exercícios novos (lote 2): CrossFit, Hyrox, Pilates, estabilização (polias, elásticos,
bola, bosu, TRX) e mobilidade. Cada item gera um SVG animado no mesmo estilo dos desenhos originais."""
from boneco import pose, ground, place, joints, add

X = 80  # centro horizontal

# ---------- poses-base (em pé, quadril em y=82 -> pés no chão em 134)
def st(hip=(X, 82), torso=180, **kw):
    if 'nT' not in kw and 'nS' not in kw: kw.setdefault('nA', (hip[0], 134))
    if 'fT' not in kw and 'fS' not in kw: kw.setdefault('fA', (hip[0], 134))
    return pose(hip, torso, **kw)

def sq(d=1.0, torso=148, foot=None, hipx=None, **kw):
    """Agachamento: d=0 em pé, d=1 coxa paralela."""
    foot = foot or (X + 4, 134)
    hx = hipx if hipx is not None else X - 14 * d
    return pose((hx, 82 + 30 * d), 180 - (180 - torso) * min(1, d * 1.15) if d < 1 else torso, nA=foot, fA=foot, **kw)

def hinge(t=100, hip=(68, 84), foot=(X, 134), **kw):
    return pose(hip, t, nA=foot, fA=foot, **kw)

def lunge(front=(108, 134), back=(50, 130), hip=(X, 108), torso=178, **kw):
    return pose(hip, torso, nA=front, fA=back, fknee='down', fF=40, **kw)

def split(front=(98, 134), back=(62, 134), hip=(X, 84), torso=180, **kw):
    return pose(hip, torso, nA=front, fA=back, **kw)

def plank(hx=110, torso=113, legs=-67, arm_y=134, **kw):
    d = dict(nT=legs, nS=legs, fT=legs, fS=legs, nF=0, fF=0, nU=0, nL=0); d.update(kw)
    p = pose((0, 0), torso, **d)
    return place(p, 'nH', (hx, arm_y)) if d['nU'] == 0 and d['nL'] == 0 else _keep_hand(p, hx, arm_y, torso, legs)

def _keep_hand(p, hx, arm_y, torso, legs):
    # mesma posição de corpo da prancha com braços estendidos; só o braço de perto se move
    base = place(pose((0, 0), torso, nT=legs, nS=legs, fT=legs, fS=legs, nF=0, fF=0, nU=0, nL=0), 'nH', (hx, arm_y))
    q = dict(p); q['hip'] = base['hip']; return q

def plank_elbow(ex=104, torso=101, **kw):
    d = dict(nT=-79, nS=-79, fT=-79, fS=-79, nF=0, fF=0, nU=0, nL=90); d.update(kw)
    p = pose((0, 0), torso, **d)
    if d['nU'] == 0 and d['nL'] == 90: return place(p, 'nE', (ex, 132))
    base = place(pose((0, 0), torso, nT=-79, nS=-79, fT=-79, fS=-79, nU=0, nL=90), 'nE', (ex, 132)); p['hip'] = base['hip']; return p

def supine(hip=(86, 126), torso=-90, **kw):
    kw.setdefault('nT', 90); kw.setdefault('nS', 90); kw.setdefault('fT', 90); kw.setdefault('fS', 90)
    kw.setdefault('nF', 180); kw.setdefault('fF', 180); kw.setdefault('nU', 90); kw.setdefault('nL', 90)
    return pose(hip, torso, **kw)

def hook(hip=(84, 126), torso=-90, foot=(116, 132), **kw):  # deitado de costas, joelhos dobrados
    kw.setdefault('nU', 90); kw.setdefault('nL', 90); kw.setdefault('knee', 'up')
    if 'nT' not in kw: kw.setdefault('nA', foot)
    if 'fT' not in kw: kw.setdefault('fA', foot)
    return pose(hip, torso, **kw)

def prone(hip=(72, 126), torso=90, **kw):
    kw.setdefault('nT', -90); kw.setdefault('nS', -90); kw.setdefault('fT', -90); kw.setdefault('fS', -90)
    kw.setdefault('nF', 0); kw.setdefault('fF', 0); kw.setdefault('nU', 180); kw.setdefault('nL', 180)
    return pose(hip, torso, **kw)

def quad(hip=(62, 108), torso=110, **kw):  # quatro apoios
    kw.setdefault('nT', 0); kw.setdefault('nS', -90); kw.setdefault('fT', 0); kw.setdefault('fS', -90)
    kw.setdefault('nF', -90); kw.setdefault('fF', -90); kw.setdefault('nU', 0); kw.setdefault('nL', 0)
    return pose(hip, torso, **kw)

def sit(hip=(56, 130), torso=180, **kw):  # sentado no chão, pernas à frente
    kw.setdefault('nT', 90); kw.setdefault('nS', 90); kw.setdefault('fT', 90); kw.setdefault('fS', 90)
    kw.setdefault('nF', 180); kw.setdefault('fF', 180)
    return pose(hip, torso, **kw)

def kneel(hip=(X, 108), torso=180, **kw):  # ajoelhado alto
    kw.setdefault('nT', 0); kw.setdefault('nS', -90); kw.setdefault('fT', 0); kw.setdefault('fS', -90)
    kw.setdefault('nF', -90); kw.setdefault('fF', -90)
    return pose(hip, torso, **kw)

def half_kneel(hip=(X, 108), torso=180, **kw):  # meio ajoelhado (perna da frente em 90°)
    kw.setdefault('nA', (hip[0] + 26, 134)); kw.setdefault('fT', 0); kw.setdefault('fS', -90); kw.setdefault('fF', -90)
    return pose(hip, torso, **kw)

def plank_feet_up(hx=112, ankle=(44, 108), tuck=False, pike=False):
    sh = (hx, 94)
    if pike: return pose((92, 66), 30, nA=ankle, fA=ankle, knee='up', nH=(hx, 134))
    if tuck: return pose((78, 96), 100, nA=(66, 104), fA=(66, 104), knee='down', nH=(hx, 134))
    return pose((sh[0] - 39.4, 101), 100, nA=ankle, fA=ankle, knee='down', nH=(hx, 134))

def hang(bar=(X, 16), torso=180, **kw):  # pendurado na barra
    d = dict(nU=180, nL=180); d.update(kw)
    p = pose((0, 0), torso, **d)
    return place(p, 'nH', bar)

def side_lying(hip=(84, 126), **kw):  # deitado de lado (cabeça à esquerda)
    kw.setdefault('nT', 90); kw.setdefault('nS', 90); kw.setdefault('fT', 92); kw.setdefault('fS', 92)
    kw.setdefault('nF', 180); kw.setdefault('fF', 180); kw.setdefault('nU', 90); kw.setdefault('nL', 120)
    return pose(hip, -90, **kw)

def up(p, dy):  # tira do chão (salto)
    q = dict(p); q['hip'] = (p['hip'][0], p['hip'][1] - dy); return q

def shift(p, dx=0, dy=0):
    q = dict(p); q['hip'] = (p['hip'][0] + dx, p['hip'][1] + dy); return q

# braços prontos (perto/longe)
DOWN = dict(nU=5, nL=5)
RACK = dict(nU=40, nL=170)        # barra apoiada nos ombros (frente)
OVER = dict(nU=176, nL=176)       # acima da cabeça
FWD = dict(nU=90, nL=90)
CHEST = dict(nU=20, nL=150)       # mãos no peito (goblet)
BACKR = dict(nU=-150, nL=-170)    # barra nas costas
HIP = dict(nU=-20, nL=40)

E = []  # lista final

def ex(name, folder, group, equip, A, B=None, hl=(), props=(), static=(), aliases=(), how=None, regiao=None, dose=None, passos=None, secao=None, **kw):
    E.append(dict(name=name, folder=folder, group=group, equip=equip, A=A, B=B or A, hl=list(hl), props=list(props),
                  static=list(static), aliases=list(aliases), how=how, regiao=regiao, dose=dose, passos=passos, secao=secao, kw=kw))

CF, HY, PI, ES, MO = '13-crossfit', '14-hyrox', '15-pilates', '16-estabilizacao', '17-mobilidade-funcional'
BOX = ('caixa', 108, 140, 18)
BAR_HI = ('barra_fixa', 50, 112, 16)

# =====================================================================================  CROSSFIT
g = 'CrossFit — Pernas e corpo inteiro'
ex('Air squat', CF, g, 'peso-do-corpo', st(**FWD), sq(1.1, **FWD), ['coxa', 'gluteo'], aliases=['air squat', 'agachamento crossfit'])
ex('Thruster com barra', CF, g, 'barra-olimpica', sq(1.1, torso=160, **RACK), st(**OVER), ['coxa', 'gluteo', 'ombro'], [('barra',)], aliases=['thruster', 'thruster barra'])
ex('Thruster com halteres', CF, g, 'halteres', sq(1.1, torso=160, **RACK), st(**OVER), ['coxa', 'gluteo', 'ombro'], [('halter',)], aliases=['thruster halteres', 'db thruster'])
ex('Wall ball', CF, g, 'wall-ball', sq(1.1, torso=158, **CHEST), up(st(nU=165, nL=160), 0), ['coxa', 'gluteo', 'ombro'], [('bola',)], [('alvo', (118, 18))], aliases=['wall ball', 'wallball', 'arremesso de bola na parede'])
ex('Overhead squat', CF, g, 'barra-olimpica', st(**OVER), sq(1.1, torso=158, nU=170, nL=170), ['coxa', 'gluteo', 'core'], [('barra',)], aliases=['overhead squat', 'ohs', 'agachamento overhead', 'agachamento com barra acima da cabeca'])
ex('Pistol squat', CF, g, 'peso-do-corpo', pose((X, 82), 180, nA=(X, 134), fT=40, fS=40, fF=130, **FWD), pose((66, 120), 140, nA=(84, 134), fT=92, fS=92, fF=180, **FWD), ['coxa', 'gluteo'], aliases=['pistol', 'pistol squat', 'agachamento unilateral pistol'])
ex('Box jump', CF, g, 'caixa', sq(.6, torso=150, hipx=62, foot=(70, 134), nU=-40, nL=-30), pose((122, 64), 180, nA=(124, 116), fA=(124, 116), **FWD), ['coxa', 'gluteo', 'perna'], static=[BOX], aliases=['box jump', 'salto na caixa', 'salto no caixote'])
ex('Box step-over', CF, g, 'caixa', st(hip=(70, 82)), pose((118, 64), 180, nA=(120, 116), fA=(110, 116), **DOWN), ['coxa', 'gluteo'], static=[BOX], aliases=['step over', 'box step over', 'passada sobre a caixa'])
ex('Salto horizontal (broad jump)', CF, g, 'peso-do-corpo', sq(.7, torso=135, hipx=50, foot=(60, 134), nU=-60, nL=-50), up(st(hip=(104, 82), nU=120, nL=120), 14), ['coxa', 'gluteo', 'perna'], aliases=['broad jump', 'salto horizontal', 'salto em distancia'])
ex('Tuck jump', CF, g, 'peso-do-corpo', sq(.5, torso=165, **FWD), up(pose((X, 82), 172, nT=140, nS=20, fT=140, fS=20, **FWD), 8), ['coxa', 'core'], aliases=['tuck jump', 'salto grupado', 'salto com joelhos no peito'])
ex('Shuttle run', CF, g, 'peso-do-corpo', split(front=(108, 134), back=(54, 128), hip=(X, 86), torso=165, nU=60, nL=110, fU=-50, fL=-20), split(front=(108, 128), back=(56, 134), hip=(X, 86), torso=165, nU=-50, nL=-20, fU=60, fL=110), ['coxa', 'perna'], aliases=['shuttle run', 'corrida de vai e volta', 'vai e vem'])
ex('Front rack lunge', CF, g, 'barra-olimpica', st(**RACK), lunge(**RACK), ['coxa', 'gluteo'], [('barra',)], aliases=['front rack lunge', 'avanco com barra na frente'])
ex('Avanço overhead com anilha', CF, g, 'anilha', st(**OVER), lunge(**OVER), ['coxa', 'gluteo', 'ombro', 'core'], [('anilha',)], aliases=['overhead lunge', 'overhead walking lunge', 'avanco overhead'])
ex('Burpee', CF, 'CrossFit — Condicionamento', 'peso-do-corpo', prone(hip=(66, 126), nU=0, nL=-20), up(st(**OVER), 12), ['peito', 'coxa', 'gluteo'], aliases=['burpee', 'burpees'])
ex('Burpee sobre a barra (bar facing burpee)', CF, 'CrossFit — Condicionamento', 'barra-olimpica', prone(hip=(56, 126), nU=0, nL=-20), up(st(hip=(104, 82), nT=30, nS=-30, fT=-10, fS=-60, **OVER), 16), ['peito', 'coxa', 'gluteo'], static=[('linha', (86, 128), (98, 128), 5)], aliases=['bar facing burpee', 'burpee sobre a barra', 'burpee over the bar'])
ex('Double under', CF, 'CrossFit — Condicionamento', 'corda-de-pular', st(nU=20, nL=60), up(st(nU=20, nL=60, nT=8, nS=-8, fT=8, fS=-8), 10), ['perna', 'ombro'], [('corda_pular',)], aliases=['double under', 'du', 'corda dupla', 'pular corda dupla'])
ex('Bear crawl', CF, 'CrossFit — Condicionamento', 'peso-do-corpo', quad(hip=(62, 100), torso=105, nT=30, nS=-60, fT=0, fS=-40, nU=15, nL=-5), quad(hip=(70, 100), torso=105, nT=0, nS=-40, fT=30, fS=-60, nU=-15, nL=5), ['core', 'ombro', 'coxa'], aliases=['bear crawl', 'caminhada do urso', 'urso'])
ex('Crab walk', CF, 'CrossFit — Condicionamento', 'peso-do-corpo', pose((80, 112), 210, nA=(108, 134), fA=(100, 134), nU=-30, nL=-15), pose((86, 112), 210, nA=(112, 134), fA=(106, 134), nU=-15, nL=0), ['braco', 'gluteo', 'ombro'], aliases=['crab walk', 'caminhada do caranguejo', 'caranguejo'])
ex('Inchworm (lagarta)', MO, 'Mobilidade — Posteriores e ombros', 'peso-do-corpo', hinge(t=10, hip=(70, 84), nU=0, nL=0), plank(hx=118), ['coxa', 'core', 'ombro'], aliases=['inchworm', 'lagarta', 'minhoca'])

g = 'CrossFit — Levantamento olímpico'
DL0 = dict(torso=128, hip=(66, 104), foot=(X, 134))
def dl0(**kw):
    a = dict(DL0); a.update(kw); return pose(a.pop('hip'), a.pop('torso'), nA=a['foot'], fA=a.pop('foot'), **a)
ex('Power clean', CF, g, 'barra-olimpica', dl0(nU=0, nL=0), pose((76, 88), 170, nA=(X, 134), fA=(X, 134), **RACK), ['coxa', 'gluteo', 'costas', 'trapezio'], [('barra',)], aliases=['power clean', 'clean', 'arremesso', 'levantamento olimpico clean'])
ex('Hang power clean', CF, g, 'barra-olimpica', hinge(t=145, hip=(72, 86), nU=0, nL=0), pose((76, 88), 170, nA=(X, 134), fA=(X, 134), **RACK), ['coxa', 'gluteo', 'costas', 'trapezio'], [('barra',)], aliases=['hang power clean', 'hang clean'])
ex('Squat clean', CF, g, 'barra-olimpica', dl0(nU=0, nL=0), sq(1.15, torso=162, **RACK), ['coxa', 'gluteo', 'costas'], [('barra',)], aliases=['squat clean', 'clean completo', 'full clean'])
ex('Power snatch', CF, g, 'barra-olimpica', dl0(torso=122, nU=0, nL=0), pose((76, 88), 172, nA=(X, 134), fA=(X, 134), **OVER), ['coxa', 'gluteo', 'costas', 'ombro'], [('barra',)], aliases=['power snatch', 'snatch', 'arranco'])
ex('Hang power snatch', CF, g, 'barra-olimpica', hinge(t=145, hip=(72, 86), nU=0, nL=0), pose((76, 88), 172, nA=(X, 134), fA=(X, 134), **OVER), ['coxa', 'gluteo', 'ombro', 'trapezio'], [('barra',)], aliases=['hang power snatch', 'hang snatch'])
ex('Squat snatch', CF, g, 'barra-olimpica', dl0(torso=122, nU=0, nL=0), sq(1.15, torso=160, nU=168, nL=168), ['coxa', 'gluteo', 'ombro', 'core'], [('barra',)], aliases=['squat snatch', 'snatch completo', 'full snatch'])
ex('Push jerk', CF, g, 'barra-olimpica', pose((X, 90), 180, nA=(X + 6, 134), fA=(X + 6, 134), **RACK), pose((X, 88), 180, nA=(X + 4, 134), fA=(X + 4, 134), **OVER), ['ombro', 'coxa', 'braco'], [('barra',)], aliases=['push jerk', 'jerk'])
ex('Split jerk', CF, g, 'barra-olimpica', pose((X, 90), 180, nA=(X + 6, 134), fA=(X + 6, 134), **RACK), split(front=(104, 134), back=(52, 132), hip=(X, 94), **OVER), ['ombro', 'coxa', 'braco'], [('barra',)], aliases=['split jerk', 'jerk dividido'])
ex('Clean and jerk', CF, g, 'barra-olimpica', dl0(nU=0, nL=0), split(front=(104, 134), back=(52, 132), hip=(X, 94), **OVER), ['coxa', 'gluteo', 'costas', 'ombro'], [('barra',)], aliases=['clean and jerk', 'arremesso completo', 'c&j'])
ex('Sumo deadlift high pull', CF, g, 'barra-olimpica', dl0(torso=135, hip=(68, 100), nU=0, nL=0), st(nU=-60, nL=160), ['coxa', 'gluteo', 'trapezio', 'ombro'], [('barra',)], aliases=['sdhp', 'sumo deadlift high pull', 'levantamento terra sumo com remada alta'])
ex('Cluster (squat clean thruster)', CF, g, 'barra-olimpica', dl0(nU=0, nL=0), st(**OVER), ['coxa', 'gluteo', 'ombro'], [('barra',)], aliases=['cluster', 'squat clean thruster'])
ex('Clean pull', CF, g, 'barra-olimpica', dl0(nU=0, nL=0), pose((80, 82), 186, nA=(X + 4, 130), fA=(X + 4, 130), nF=60, fF=60, nU=0, nL=0), ['coxa', 'gluteo', 'trapezio'], [('barra',)], aliases=['clean pull', 'puxada de clean'])

g = 'CrossFit — Kettlebell e halteres'
ex('Kettlebell swing americano', CF, g, 'kettlebell', hinge(t=115, hip=(68, 86), nU=-20, nL=-20), st(**OVER), ['gluteo', 'coxa', 'lombar', 'ombro'], [('kettlebell',)], aliases=['american swing', 'swing americano', 'kettlebell swing americano'])
ex('Kettlebell snatch', CF, g, 'kettlebell', hinge(t=115, hip=(68, 86), nU=-20, nL=-20), st(**OVER), ['gluteo', 'ombro', 'costas'], [('kettlebell',)], aliases=['kettlebell snatch', 'arranco com kettlebell'])
ex('Kettlebell clean', CF, g, 'kettlebell', hinge(t=118, hip=(68, 86), nU=-10, nL=-10), st(**RACK), ['gluteo', 'coxa', 'braco'], [('kettlebell',)], aliases=['kettlebell clean', 'clean com kettlebell'])
ex('Agachamento goblet com kettlebell', CF, g, 'kettlebell', st(**CHEST), sq(1.1, torso=160, **CHEST), ['coxa', 'gluteo'], [('kettlebell', {'off': (0, -4)})], aliases=['goblet squat kettlebell', 'agachamento goblet kettlebell'])
ex('Devil press', CF, g, 'halteres', prone(hip=(66, 126), nU=0, nL=-20), st(**OVER), ['peito', 'gluteo', 'ombro', 'coxa'], [('halter',)], aliases=['devil press'])
ex('Man maker', CF, g, 'halteres', plank(hx=108, nU=0, nL=0), st(**OVER), ['peito', 'costas', 'coxa', 'ombro'], [('halter',)], aliases=['man maker', 'manmaker'])
ex('Snatch com halter', CF, g, 'halteres', sq(.9, torso=125, nU=0, nL=0), st(**OVER), ['coxa', 'gluteo', 'ombro'], [('halter',)], aliases=['dumbbell snatch', 'db snatch', 'snatch com halter', 'arranco com halter'])
ex('Clean and jerk com halter', CF, g, 'halteres', sq(.9, torso=125, nU=0, nL=0), split(front=(102, 134), back=(56, 132), hip=(X, 92), **OVER), ['coxa', 'gluteo', 'ombro'], [('halter',)], aliases=['dumbbell clean and jerk', 'db clean and jerk'])
ex('Levantamento turco (turkish get-up)', CF, g, 'kettlebell', supine(nU=180, nL=180), pose((X, 108), 180, nT=0, nS=-90, fT=0, fS=-90, nF=-90, fF=-90, **OVER), ['ombro', 'core', 'coxa'], [('kettlebell', {'off': (0, -8)})], aliases=['turkish get up', 'tgu', 'levantamento turco'])
ex('Farmer carry com kettlebells', HY, 'Hyrox — Força e carregamento', 'kettlebell', split(front=(96, 134), back=(64, 130), **DOWN), split(front=(96, 130), back=(64, 134), **DOWN), ['antebraco', 'trapezio', 'core'], [('kettlebell', {'off': (0, -2)})], aliases=['farmers carry', 'farmer carry', 'carregamento de fazendeiro', 'farmers carry kettlebell'])

g = 'CrossFit — Ginástica'
ex('Pull-up kipping', CF, g, 'barra-fixa', hang(nT=-30, nS=-30, fT=-30, fS=-30, torso=192), place(pose((0, 0), 168, nT=30, nS=20, fT=30, fS=20, nU=20, nL=172), 'nH', (X, 16)), ['costas', 'braco'], static=[BAR_HI], aliases=['kipping', 'pull up kipping', 'barra kipping'])
ex('Chest to bar pull-up', CF, g, 'barra-fixa', hang(nT=5, nS=-40, fT=5, fS=-40), place(pose((0, 0), 172, nT=5, nS=-40, fT=5, fS=-40, nU=-10, nL=165), 'nH', (X + 4, 16)), ['costas', 'braco'], static=[BAR_HI], aliases=['chest to bar', 'c2b', 'peito na barra'])
ex('Butterfly pull-up', CF, g, 'barra-fixa', hang(nT=20, nS=-20, fT=20, fS=-20, torso=186), place(pose((0, 0), 170, nT=40, nS=-10, fT=40, fS=-10, nU=20, nL=170), 'nH', (X, 16)), ['costas', 'braco', 'core'], static=[BAR_HI], aliases=['butterfly', 'butterfly pull up'])
ex('Toes to bar', CF, g, 'barra-fixa', hang(nT=-10, nS=-10, fT=-10, fS=-10), place(pose((0, 0), 200, nT=150, nS=165, fT=150, fS=165, nF=250, fF=250, nU=165, nL=165), 'nH', (X, 16)), ['core', 'antebraco'], static=[BAR_HI], aliases=['toes to bar', 't2b', 'pes na barra'])
ex('Knees to elbows', CF, g, 'barra-fixa', hang(nT=0, nS=-20, fT=0, fS=-20), place(pose((0, 0), 172, nT=150, nS=40, fT=150, fS=40, nU=180, nL=180), 'nH', (X, 16)), ['core'], static=[BAR_HI], aliases=['knees to elbows', 'k2e', 'joelhos nos cotovelos'])
ex('Bar muscle-up', CF, g, 'barra-fixa', hang(nT=10, nS=-30, fT=10, fS=-30), place(pose((0, 0), 176, nT=8, nS=-10, fT=8, fS=-10, nU=-40, nL=150), 'nH', (X + 2, 40)), ['costas', 'braco', 'peito'], static=[('barra_fixa', 50, 112, 40)], aliases=['bar muscle up', 'muscle up na barra', 'bmu'])
ex('Ring muscle-up', CF, g, 'argolas', place(pose((0, 0), 180, nT=10, nS=-30, fT=10, fS=-30, nU=180, nL=180), 'nH', (X, 34)), place(pose((0, 0), 178, nT=5, nS=-10, fT=5, fS=-10, nU=-30, nL=10), 'nH', (X + 4, 62)), ['peito', 'braco', 'costas'], static=[('argolas', X, 34)], aliases=['ring muscle up', 'muscle up na argola', 'rmu'])
ex('Ring dip', CF, g, 'argolas', place(pose((0, 0), 182, nT=30, nS=-30, fT=30, fS=-30, nU=0, nL=0), 'nH', (X, 74)), place(pose((0, 0), 168, nT=30, nS=-30, fT=30, fS=-30, nU=-70, nL=10), 'nH', (X, 74)), ['peito', 'braco'], static=[('argolas', X, 74)], aliases=['ring dip', 'mergulho na argola', 'dip na argola'])
ex('Ring row', CF, g, 'argolas', pose((84, 104), -146, nA=(128, 132), fA=(128, 132), nH=(100, 52)), pose((92, 94), -162, nA=(130, 132), fA=(130, 132), nH=(100, 52), elbow='down'), ['costas', 'antebraco'], static=[('argolas', 100, 52)], aliases=['ring row', 'remada na argola', 'remada australiana na argola'])
ex('Handstand push-up', CF, g, 'parede', place(pose((0, 0), 0, nT=180, nS=130, fT=180, fS=130, nF=200, fF=200, nU=0, nL=0), 'nH', (106, 134)), place(pose((0, 0), 4, nT=180, nS=130, fT=180, fS=130, nF=200, fF=200, nU=70, nL=-20), 'nH', (106, 134)), ['ombro', 'braco'], static=[('parede', 128)], aliases=['hspu', 'handstand push up', 'flexao de parada de mao'])
ex('Parada de mão na parede (handstand hold)', CF, g, 'parede', place(pose((0, 0), 2, nT=182, nS=140, fT=182, fS=140, nF=210, fF=210, nU=0, nL=0), 'nH', (108, 134)), place(pose((0, 0), 0, nT=180, nS=142, fT=180, fS=142, nF=210, fF=210, nU=0, nL=0), 'nH', (108, 134)), ['ombro', 'core', 'braco'], static=[('parede', 128)], aliases=['handstand hold', 'parada de mao', 'parada de mao na parede'])
ex('Handstand walk', CF, g, 'peso-do-corpo', place(pose((0, 0), 0, nT=180, nS=150, fT=180, fS=150, nF=200, fF=200, nU=8, nL=8, fU=-8, fL=-8), 'nH', (88, 134)), place(pose((0, 0), 0, nT=180, nS=150, fT=180, fS=150, nF=200, fF=200, nU=-8, nL=-8, fU=8, fL=8), 'nH', (78, 134)), ['ombro', 'core'], aliases=['handstand walk', 'caminhada em parada de mao'])
ex('Wall walk', CF, g, 'parede', plank(hx=100, nU=0, nL=0), place(pose((0, 0), 8, nT=170, nS=170, fT=170, fS=170, nF=100, fF=100, nU=0, nL=0), 'nH', (112, 134)), ['ombro', 'core', 'braco'], static=[('parede', 128)], aliases=['wall walk', 'caminhada na parede', 'subida na parede'])
ex('Subida na corda (rope climb)', CF, g, 'corda', place(pose((0, 0), 180, nT=60, nS=-30, fT=60, fS=-30, nU=180, nL=180), 'nH', (X + 4, 30)), place(pose((0, 0), 180, nT=10, nS=-5, fT=10, fS=-5, nU=10, nL=170), 'nH', (X + 4, 30)), ['costas', 'braco', 'antebraco'], static=[('linha', (X + 4, 4), (X + 4, 134), 3)], aliases=['rope climb', 'subida na corda', 'escalada na corda'])
ex('L-sit nas paralelas', CF, g, 'paralelas', place(pose((0, 0), 180, nT=90, nS=90, fT=90, fS=90, nF=170, fF=170, nU=0, nL=0), 'nH', (X, 104)), place(pose((0, 0), 178, nT=92, nS=92, fT=92, fS=92, nF=170, fF=170, nU=0, nL=0), 'nH', (X, 104)), ['core', 'coxa', 'braco'], static=[('linhas', [(64, 104), (100, 104)], 3), ('linha', (66, 104), (66, 136)), ('linha', (98, 104), (98, 136))], aliases=['l sit', 'l-sit', 'l sit nas paralelas'])
ex('GHD sit-up', CF, g, 'ghd', pose((86, 92), -76, nA=(120, 104), fA=(120, 104), nU=-100, nL=-100), pose((86, 92), 175, nA=(120, 104), fA=(120, 104), nU=95, nL=95), ['core', 'coxa'], static=[('linhas', [(76, 96), (96, 96)], 5), ('linha', (86, 96), (86, 136)), ('linhas', [(116, 108), (124, 108)], 5), ('linha', (120, 108), (120, 136))], aliases=['ghd sit up', 'abdominal no ghd', 'ghd'])
ex('Hiperextensão no GHD', CF, g, 'ghd', pose((86, 92), 0, nA=(54, 104), fA=(54, 104), knee='up', nU=-60, nL=-120), pose((86, 92), 88, nA=(54, 104), fA=(54, 104), knee='up', nU=110, nL=50), ['lombar', 'gluteo', 'coxa'], static=[('linhas', [(78, 96), (96, 96)], 5), ('linha', (86, 96), (86, 136)), ('linhas', [(50, 108), (58, 108)], 5), ('linha', (54, 108), (54, 136))], aliases=['ghd back extension', 'hiperextensao no ghd', 'extensao lombar no ghd'])

g = 'CrossFit — Core'
ex('Hollow hold', CF, g, 'peso-do-corpo', supine(hip=(82, 128), torso=-102, nT=78, nS=78, fT=78, fS=78, nU=-70, nL=-70), supine(hip=(82, 128), torso=-104, nT=76, nS=76, fT=76, fS=76, nU=-72, nL=-72), ['core'], aliases=['hollow hold', 'hollow body', 'canoa'])
ex('Hollow rock', CF, g, 'peso-do-corpo', supine(hip=(82, 128), torso=-108, nT=80, nS=80, fT=80, fS=80, nU=-70, nL=-70), supine(hip=(82, 126), torso=-96, nT=68, nS=68, fT=68, fS=68, nU=-82, nL=-82), ['core'], aliases=['hollow rock', 'canoa balancando'])
ex('Arch hold (superman isométrico)', CF, g, 'peso-do-corpo', prone(torso=84, nT=-84, nS=-84, fT=-84, fS=-84, nU=100, nL=100), prone(torso=82, nT=-82, nS=-82, fT=-82, fS=-82, nU=104, nL=104), ['lombar', 'gluteo'], aliases=['arch hold', 'arch', 'superman isometrico'])
ex('V-up', CF, g, 'peso-do-corpo', supine(hip=(84, 126), nU=-90, nL=-90), pose((84, 126), -148, nT=140, nS=140, fT=140, fS=140, nF=230, fF=230, nU=140, nL=140), ['core', 'coxa'], aliases=['v up', 'v-up', 'canivete'])
ex('Sit-up com abmat', CF, g, 'abmat', pose((82, 128), -90, nA=(114, 132), fA=(114, 132), knee='up', nU=-90, nL=-90), pose((82, 128), 160, nA=(114, 132), fA=(114, 132), knee='up', nU=100, nL=100), ['core'], static=[('linhas', [(52, 132), (70, 128), (82, 132)], 4)], aliases=['sit up', 'situp', 'abdominal completo', 'sit up abmat'])
ex('Abdominal canivete unilateral (V-up alternado)', CF, g, 'peso-do-corpo', supine(hip=(84, 126), nU=-90, nL=-90), pose((84, 126), -140, nT=150, nS=150, fT=90, fS=90, nF=230, nU=150, nL=150), ['core'], aliases=['single leg v up', 'v up alternado', 'canivete alternado'])

# =====================================================================================  HYROX
g = 'Hyrox — Estações'
ex('SkiErg', HY, g, 'skierg', st(hip=(70, 82), nU=170, nL=170), hinge(t=120, hip=(66, 92), foot=(74, 134), nU=10, nL=10), ['costas', 'braco', 'core'], [('cabo', {'from': (112, 20)})], [('skierg', 112)], aliases=['ski erg', 'skierg', 'ski'])
ex('Sled push (empurrar trenó)', HY, g, 'treno', split(front=(96, 134), back=(42, 134), hip=(74, 104), torso=125, nH=(108, 100)), split(front=(96, 132), back=(52, 134), hip=(78, 104), torso=125, nH=(112, 100)), ['coxa', 'gluteo', 'perna', 'ombro'], [('treno', {'dx': 2, 'w': 24, 'h': 34})], aliases=['sled push', 'empurrar treno', 'treno'])
ex('Sled pull (puxar trenó com corda)', HY, g, 'treno', pose((86, 96), 160, nA=(106, 134), fA=(70, 134), nH=(110, 92)), pose((76, 100), 165, nA=(100, 134), fA=(60, 134), nH=(80, 108), elbow='back'), ['costas', 'braco', 'coxa'], [('cabo', {'from': (140, 126)})], [('linhas', [(130, 136), (130, 118), (148, 118), (148, 136)], 3)], aliases=['sled pull', 'puxar treno', 'puxada de treno'])
ex('Burpee broad jump', HY, g, 'peso-do-corpo', prone(hip=(54, 126), nU=0, nL=-20), up(st(hip=(106, 82), nU=120, nL=120), 14), ['peito', 'coxa', 'gluteo'], aliases=['burpee broad jump', 'burpee com salto horizontal', 'burpee salto a frente'])
ex('Remo ergômetro', HY, g, 'remo', pose((52, 116), 160, nA=(110, 122), fA=(110, 122), knee='up', nH=(120, 112)), pose((82, 116), 205, nA=(118, 122), fA=(118, 122), nH=(98, 100), elbow='back'), ['costas', 'coxa', 'braco'], static=[('remo',)], aliases=['remo', 'remo ergometro', 'rowing', 'row', 'remada no ergometro', 'concept2'])
ex('Sandbag lunges (avanço com saco de areia)', HY, g, 'saco-de-areia', st(**BACKR), lunge(**BACKR), ['coxa', 'gluteo'], [('saco', {'at': 'sh', 'off': (-2, -4)})], aliases=['sandbag lunge', 'sandbag lunges', 'avanco com saco de areia'])
ex('Wall ball (Hyrox)', HY, g, 'wall-ball', sq(1.1, torso=158, **CHEST), st(nU=165, nL=160), ['coxa', 'gluteo', 'ombro'], [('bola',)], [('alvo', (118, 18))], aliases=['wall balls hyrox', 'wall ball hyrox'])
ex('Corrida (pista ou rua)', HY, 'Cardio', 'peso-do-corpo', split(front=(110, 128), back=(50, 134), hip=(X, 84), torso=172, nU=50, nL=120, fU=-40, fL=20), split(front=(108, 134), back=(52, 126), hip=(X, 84), torso=172, nU=-40, nL=20, fU=50, fL=120), ['coxa', 'perna'], aliases=['corrida', 'run', 'running', 'corrida na rua', 'corrida na pista'])
ex('BikeErg', HY, 'Cardio', 'bike', pose((74, 90), 150, nA=(98, 124), fA=(92, 108), nH=(112, 76)), pose((74, 90), 150, nA=(92, 108), fA=(98, 124), nH=(112, 76)), ['coxa', 'perna'], static=[('linhas', [(74, 94), (80, 136)], 3), ('linha', (66, 94), (82, 94), 4), ('linhas', [(112, 76), (106, 136)], 3), ('bola_grande', (96, 118), 12)], aliases=['bike erg', 'bikeerg', 'bike'])
ex('Sandbag clean', HY, 'Hyrox — Força e carregamento', 'saco-de-areia', sq(1.0, torso=125, nU=0, nL=0), st(**CHEST), ['coxa', 'gluteo', 'costas'], [('saco', {'off': (2, 0)})], aliases=['sandbag clean', 'clean com saco de areia'])
ex('Sandbag carry (saco no peito)', HY, 'Hyrox — Força e carregamento', 'saco-de-areia', split(front=(96, 134), back=(64, 130), **CHEST), split(front=(96, 130), back=(64, 134), **CHEST), ['core', 'costas', 'braco'], [('saco', {'off': (4, 0)})], aliases=['sandbag carry', 'carregamento de saco de areia', 'bear hug carry'])
ex('Agachamento com saco de areia', HY, 'Hyrox — Força e carregamento', 'saco-de-areia', st(**CHEST), sq(1.1, torso=160, **CHEST), ['coxa', 'gluteo'], [('saco', {'off': (4, 0)})], aliases=['sandbag squat', 'agachamento com sandbag'])
ex('Front rack carry com kettlebell', HY, 'Hyrox — Força e carregamento', 'kettlebell', split(front=(96, 134), back=(64, 130), **RACK), split(front=(96, 130), back=(64, 134), **RACK), ['core', 'ombro', 'braco'], [('kettlebell', {'off': (2, -6)})], aliases=['front rack carry', 'rack carry', 'carregamento em front rack'])
ex('Arrasto de trenó de costas', HY, g, 'treno', pose((70, 104), 165, nA=(54, 134), fA=(90, 134), knee='fwd', nH=(96, 108)), pose((62, 104), 165, nA=(46, 134), fA=(78, 134), nH=(86, 110)), ['coxa', 'gluteo', 'antebraco'], [('cabo', {'from': (128, 126)})], [('linhas', [(122, 136), (122, 118), (142, 118), (142, 136)], 3)], aliases=['sled drag', 'arrasto de treno', 'puxar treno de costas'])
ex('Sled push com braços estendidos', HY, g, 'treno', split(front=(94, 134), back=(36, 134), hip=(70, 108), torso=112, nU=95, nL=95), split(front=(94, 130), back=(44, 134), hip=(74, 108), torso=112, nU=95, nL=95), ['coxa', 'gluteo', 'ombro', 'core'], [('treno', {'dx': 0, 'w': 24, 'h': 34})], aliases=['sled push bracos estendidos', 'empurrar treno baixo'])

# =====================================================================================  PILATES (solo)
g = 'Pilates — Solo'
ex('Hundred (Cem)', PI, g, 'colchonete', supine(torso=-106, nT=135, nS=135, fT=135, fS=135, nU=96, nL=96), supine(torso=-106, nT=135, nS=135, fT=135, fS=135, nU=110, nL=110), ['core'], static=[('colchonete', 20, 140)], aliases=['hundred', 'cem', 'the hundred', 'cem pilates'])
ex('Roll up', PI, g, 'colchonete', supine(nU=-90, nL=-90), sit(torso=130, nU=95, nL=95), ['core'], static=[('colchonete', 20, 140)], aliases=['roll up', 'enrolamento', 'roll up pilates'])
ex('Roll over', PI, g, 'colchonete', supine(nT=170, nS=170, fT=170, fS=170, nU=90, nL=90), place(pose((0, 0), -8, nT=-118, nS=-118, fT=-118, fS=-118, nF=-200, fF=-200, nU=90, nL=90), 'sh', (54, 126)), ['core', 'lombar'], static=[('colchonete', 20, 140)], aliases=['roll over', 'rolamento para tras'])
ex('Círculo com uma perna (single leg circle)', PI, g, 'colchonete', supine(nT=165, nS=165, fT=90, fS=90, nU=90, nL=90), supine(nT=140, nS=140, fT=90, fS=90, nU=90, nL=90), ['core', 'coxa'], static=[('colchonete', 20, 140)], aliases=['single leg circle', 'circulo com a perna', 'leg circle'])
ex('Rolando como bola (rolling like a ball)', PI, g, 'colchonete', pose((72, 120), 150, nT=150, nS=10, fT=150, fS=10, nF=100, fF=100, nU=60, nL=150), place(pose((0, 0), -112, nT=150, nS=60, fT=150, fS=60, nF=140, fF=140, nU=130, nL=60), 'sh', (50, 122)), ['core'], static=[('colchonete', 20, 140)], aliases=['rolling like a ball', 'rolando como bola', 'rolinho'])
ex('Alongamento de uma perna (single leg stretch)', PI, g, 'colchonete', supine(torso=-106, nT=170, nS=80, fT=120, fS=120, nU=120, nL=160), supine(torso=-106, nT=120, nS=120, fT=170, fS=80, nU=120, nL=160), ['core'], static=[('colchonete', 20, 140)], aliases=['single leg stretch', 'alongamento de uma perna'])
ex('Alongamento das duas pernas (double leg stretch)', PI, g, 'colchonete', supine(torso=-108, nT=175, nS=80, fT=175, fS=80, nU=140, nL=170), supine(torso=-104, nT=125, nS=125, fT=125, fS=125, nU=-80, nL=-80), ['core'], static=[('colchonete', 20, 140)], aliases=['double leg stretch', 'alongamento das duas pernas'])
ex('Tesoura (single straight leg stretch)', PI, g, 'colchonete', supine(torso=-108, nT=175, nS=175, fT=110, fS=110, nU=150, nL=170), supine(torso=-108, nT=110, nS=110, fT=175, fS=175, nU=150, nL=170), ['core', 'coxa'], static=[('colchonete', 20, 140)], aliases=['scissors', 'tesoura', 'single straight leg stretch'])
ex('Lower lift (double straight leg)', PI, g, 'colchonete', supine(torso=-104, nT=175, nS=175, fT=175, fS=175, nU=-120, nL=-60), supine(torso=-104, nT=125, nS=125, fT=125, fS=125, nU=-120, nL=-60), ['core'], static=[('colchonete', 20, 140)], aliases=['lower lift', 'double straight leg', 'descida das pernas'])
ex('Criss-cross', PI, g, 'colchonete', supine(torso=-112, nT=170, nS=80, fT=120, fS=120, nU=-150, nL=-60), supine(torso=-108, nT=120, nS=120, fT=170, fS=80, nU=-120, nL=-40), ['core'], static=[('colchonete', 20, 140)], aliases=['criss cross', 'abdominal cruzado pilates'])
ex('Spine stretch forward', PI, g, 'colchonete', sit(torso=180, nU=95, nL=95), sit(torso=130, nU=110, nL=110), ['lombar', 'core'], static=[('colchonete', 20, 140)], aliases=['spine stretch', 'spine stretch forward', 'alongamento da coluna sentado'])
ex('Open leg rocker', PI, g, 'colchonete', pose((76, 126), -158, nT=140, nS=140, fT=140, fS=140, nF=230, fF=230, nH=(108, 92)), place(pose((0, 0), -112, nT=172, nS=172, fT=172, fS=172, nF=260, fF=260, nU=150, nL=165), 'sh', (52, 124)), ['core'], static=[('colchonete', 20, 140)], aliases=['open leg rocker', 'balanco com pernas abertas'])
ex('Corkscrew (saca-rolhas)', PI, g, 'colchonete', supine(nT=175, nS=175, fT=175, fS=175, nU=90, nL=90), supine(nT=150, nS=150, fT=150, fS=150, nU=90, nL=90), ['core', 'lombar'], static=[('colchonete', 20, 140)], aliases=['corkscrew', 'saca rolhas'])
ex('Serrote (saw)', PI, g, 'colchonete', sit(torso=180, nU=90, nL=90, fU=-90, fL=-90), sit(torso=140, nU=150, nL=125, fU=-60, fL=-40), ['core', 'lombar'], static=[('colchonete', 20, 140)], aliases=['saw', 'serrote pilates'])
ex('Cisne (swan)', PI, g, 'colchonete', prone(nU=0, nL=90), prone(hip=(72, 126), torso=118, nH=(108, 134)), ['lombar', 'gluteo'], static=[('colchonete', 20, 140)], aliases=['swan', 'cisne', 'swan dive'])
ex('Chute com uma perna (single leg kick)', PI, g, 'colchonete', prone(torso=104, nT=-90, nS=-150, fT=-90, fS=-90, nU=0, nL=90), prone(torso=104, nT=-90, nS=-90, fT=-90, fS=-150, nU=0, nL=90), ['coxa', 'gluteo'], static=[('colchonete', 20, 140)], aliases=['single leg kick', 'chute de uma perna'])
ex('Chute com as duas pernas (double leg kick)', PI, g, 'colchonete', prone(nT=-90, nS=-160, fT=-90, fS=-160, nU=-120, nL=-60), prone(torso=106, nT=-86, nS=-86, fT=-86, fS=-86, nU=-80, nL=-80), ['coxa', 'lombar', 'gluteo'], static=[('colchonete', 20, 140)], aliases=['double leg kick', 'chute das duas pernas'])
ex('Neck pull', PI, g, 'colchonete', supine(nU=-150, nL=-40), sit(torso=150, nU=170, nL=230), ['core', 'lombar'], static=[('colchonete', 20, 140)], aliases=['neck pull', 'puxada de pescoco pilates'])
ex('Ponte de ombros (shoulder bridge)', PI, g, 'colchonete', hook(nU=90, nL=90), pose((92, 106), -64, nA=(118, 132), fT=150, fS=150, knee='up', nU=60, nL=90), ['gluteo', 'coxa', 'core'], static=[('colchonete', 20, 140)], aliases=['shoulder bridge', 'ponte de ombros pilates'])
ex('Spine twist (rotação de coluna)', PI, g, 'colchonete', sit(nU=90, nL=90, fU=-90, fL=-90), sit(nU=60, nL=60, fU=-120, fL=-120), ['core'], static=[('colchonete', 20, 140)], aliases=['spine twist', 'rotacao de coluna sentado'])
ex('Jackknife', PI, g, 'colchonete', supine(nT=150, nS=150, fT=150, fS=150, nU=90, nL=90), pose((60, 72), -10, nT=180, nS=180, fT=180, fS=180, nF=270, fF=270, nU=90, nL=90), ['core', 'lombar'], static=[('colchonete', 20, 140)], aliases=['jackknife', 'canivete pilates'])
ex('Chute lateral frente e trás (side kick)', PI, g, 'colchonete', side_lying(nT=140, nS=140, nF=230), side_lying(nT=96, nS=96, nF=186), ['coxa', 'gluteo', 'core'], static=[('colchonete', 20, 140)], aliases=['side kick', 'chute lateral pilates', 'side kick frente e tras'])
ex('Chute lateral para cima (side kick up/down)', PI, g, 'colchonete', side_lying(hip=(84, 126), nT=92, nS=92), side_lying(hip=(84, 126), nT=108, nS=108, nF=200), ['gluteo', 'coxa'], static=[('colchonete', 20, 140)], aliases=['side kick up down', 'elevacao lateral de perna pilates'])
ex('Teaser', PI, g, 'colchonete', supine(nU=-90, nL=-90), pose((78, 126), -150, nT=140, nS=140, fT=140, fS=140, nF=230, fF=230, nU=135, nL=135), ['core', 'coxa'], static=[('colchonete', 20, 140)], aliases=['teaser', 'teaser pilates'])
ex('Natação (swimming)', PI, g, 'colchonete', prone(torso=86, nT=-80, nS=-80, fT=-92, fS=-92, nU=100, nL=100, fU=80, fL=80), prone(torso=86, nT=-92, nS=-92, fT=-80, fS=-80, nU=80, nL=80, fU=100, fL=100), ['lombar', 'gluteo', 'ombro'], static=[('colchonete', 20, 140)], aliases=['swimming', 'natacao pilates', 'nadando'])
ex('Leg pull front', PI, g, 'colchonete', plank(hx=114), plank(hx=114, nT=-50, nS=-50), ['core', 'gluteo', 'ombro'], static=[('colchonete', 20, 140)], aliases=['leg pull front', 'prancha com elevacao de perna pilates'])
ex('Leg pull back', PI, g, 'colchonete', pose((84, 104), -105, nT=103, nS=103, fT=103, fS=103, nF=180, fF=180, nH=(48, 134)), pose((84, 104), -105, nT=150, nS=150, fT=103, fS=103, nF=230, fF=180, nH=(48, 134)), ['gluteo', 'braco', 'core'], static=[('colchonete', 20, 140)], aliases=['leg pull back', 'prancha invertida com chute'])
ex('Chute lateral ajoelhado (kneeling side kick)', PI, g, 'colchonete', kneel(hip=(76, 108), torso=150, fT=0, fS=-90, nT=0, nS=-90, nU=-40, nL=10, fU=0, fL=0), kneel(hip=(76, 108), torso=150, nT=100, nS=100, nF=190, fU=0, fL=0, nU=-40, nL=10), ['gluteo', 'core'], static=[('colchonete', 20, 140)], aliases=['kneeling side kick', 'chute lateral ajoelhado'])
ex('Side bend (sereia lateral)', PI, g, 'colchonete', pose((80, 128), -135, nT=95, nS=60, fT=95, fS=60, nH=(52, 134)), pose((84, 98), -115, nT=105, nS=105, fT=105, fS=105, nH=(48, 134), fU=-200, fL=-200), ['core', 'ombro'], static=[('colchonete', 20, 140)], aliases=['side bend', 'sereia lateral', 'prancha lateral pilates'])
ex('Foca (seal)', PI, g, 'colchonete', pose((72, 120), 150, nT=150, nS=20, fT=150, fS=20, nF=100, fF=100, nH=(100, 122)), place(pose((0, 0), -112, nT=150, nS=70, fT=150, fS=70, nF=140, fF=140, nU=130, nL=80), 'sh', (50, 122)), ['core'], static=[('colchonete', 20, 140)], aliases=['seal', 'foca pilates'])
ex('Flexão pilates (push-up)', PI, g, 'colchonete', hinge(t=20, hip=(66, 84), nU=0, nL=0), plank(hx=118, nU=0, nL=0), ['peito', 'core', 'braco'], static=[('colchonete', 20, 140)], aliases=['pilates push up', 'flexao pilates'])
ex('Sereia sentada (mermaid)', PI, g, 'colchonete', pose((72, 128), 180, nT=90, nS=-60, fT=-90, fS=60, nU=176, nL=176), pose((72, 128), 150, nT=90, nS=-60, fT=-90, fS=60, nU=210, nL=230), ['core', 'costas'], static=[('colchonete', 20, 140)], aliases=['mermaid', 'sereia', 'sereia sentada'])
ex('Roll down na parede', PI, g, 'parede', pose((56, 82), 180, nA=(68, 134), fA=(68, 134), nU=5, nL=5), pose((56, 82), 60, nA=(68, 134), fA=(68, 134), nU=0, nL=0), ['lombar', 'core'], static=[('parede', 44)], aliases=['roll down', 'roll down na parede', 'enrolamento na parede'])
ex('Enrolamento pélvico (pelvic curl)', PI, g, 'colchonete', hook(nU=90, nL=90), pose((92, 108), -66, nA=(118, 132), fA=(118, 132), knee='up', nU=60, nL=90), ['gluteo', 'core', 'coxa'], static=[('colchonete', 20, 140)], aliases=['pelvic curl', 'enrolamento pelvico', 'ponte articulada'])
ex('Chest lift (abdominal pilates)', PI, g, 'colchonete', hook(), hook(torso=-114, nU=110, nL=110), ['core'], static=[('colchonete', 20, 140)], aliases=['chest lift', 'abdominal pilates'])
ex('Toe taps (toque de pés em tabletop)', PI, g, 'colchonete', supine(nT=180, nS=90, fT=180, fS=90, nU=90, nL=90), supine(nT=125, nS=55, fT=180, fS=90, nU=90, nL=90), ['core'], static=[('colchonete', 20, 140)], aliases=['toe taps', 'toque de pes', 'toe tap pilates'])
ex('Adução com anel mágico (deitado)', PI, 'Pilates — Acessórios', 'anel-magico', hook(), hook(torso=-100), ['coxa', 'core'], [('bola', {'at': 'nK', 'r': 7})], [('colchonete', 20, 140)], aliases=['magic circle', 'anel magico', 'aducao com anel'])
ex('Abdominal com bola pilates nas costas', PI, 'Pilates — Acessórios', 'bola-pequena', hook(torso=-90), hook(torso=-116, nU=110, nL=110), ['core'], static=[('bola_grande', (64, 128), 6)], aliases=['abdominal com bola pilates', 'overball abdominal'])

g = 'Pilates — Reformer'
REF = [('reformer',)]
ex('Footwork no reformer', PI, g, 'reformer', pose((70, 112), -90, nA=(116, 104), fA=(116, 104), knee='up', nU=90, nL=90), pose((96, 112), -90, nA=(138, 104), fA=(138, 104), nU=90, nL=90), ['coxa', 'gluteo', 'perna'], static=REF, aliases=['footwork', 'footwork reformer', 'trabalho de pes no reformer'])
ex('Hundred no reformer', PI, g, 'reformer', pose((80, 112), -108, nT=140, nS=140, fT=140, fS=140, nF=230, fF=230, nU=96, nL=96), pose((80, 112), -108, nT=140, nS=140, fT=140, fS=140, nF=230, fF=230, nU=112, nL=112), ['core'], [('cabo', {'from': (20, 96)})], REF, aliases=['hundred reformer', 'cem no reformer'])
ex('Long stretch no reformer', PI, g, 'reformer', place(pose((0, 0), 105, nT=-75, nS=-75, fT=-75, fS=-75, nF=-10, fF=-10, nU=0, nL=0), 'nH', (130, 98)), place(pose((0, 0), 105, nT=-75, nS=-75, fT=-75, fS=-75, nF=-10, fF=-10, nU=30, nL=30), 'nH', (130, 98)), ['core', 'ombro', 'peito'], static=REF + [('linha', (130, 98), (136, 92), 4)], aliases=['long stretch', 'long stretch reformer', 'prancha no reformer'])
ex('Elefante no reformer (elephant)', PI, g, 'reformer', place(pose((0, 0), 30, nT=-30, nS=-30, fT=-30, fS=-30, nF=60, fF=60, nU=0, nL=0), 'nH', (128, 98)), place(pose((0, 0), 20, nT=-20, nS=-20, fT=-20, fS=-20, nF=70, fF=70, nU=0, nL=0), 'nH', (128, 98)), ['core', 'coxa', 'ombro'], static=REF, aliases=['elephant', 'elefante reformer'])
ex('Knee stretch no reformer', PI, g, 'reformer', quad(hip=(72, 92), torso=125, nT=-20, nS=-90, fT=-20, fS=-90), quad(hip=(64, 92), torso=118, nT=10, nS=-90, fT=10, fS=-90), ['core', 'coxa'], static=REF, aliases=['knee stretch', 'knee stretch reformer'])
ex('Remada sentada no reformer (rowing)', PI, g, 'reformer', pose((70, 114), 180, nT=90, nS=90, fT=90, fS=90, nF=170, fF=170, nU=-60, nL=200), pose((70, 114), 180, nT=90, nS=90, fT=90, fS=90, nF=170, fF=170, nU=-80, nL=-80), ['costas', 'ombro'], [('cabo', {'from': (20, 98)})], REF, aliases=['rowing reformer', 'remada no reformer'])
ex('Pernas nas alças (feet in straps)', PI, g, 'reformer', pose((60, 112), -90, nT=175, nS=175, fT=175, fS=175, nF=260, fF=260, nU=90, nL=90), pose((60, 112), -90, nT=120, nS=120, fT=120, fS=120, nF=210, fF=210, nU=90, nL=90), ['coxa', 'gluteo', 'core'], [('cabo', {'at': 'nA', 'from': (20, 96)})], REF, aliases=['feet in straps', 'pernas nas alcas', 'leg circles reformer'])
ex('Short box round back', PI, g, 'reformer', pose((70, 104), 180, nT=90, nS=10, fT=90, fS=10, nF=90, fF=90, nU=40, nL=140), pose((70, 104), -150, nT=90, nS=10, fT=90, fS=10, nF=90, fF=90, nU=40, nL=140), ['core'], static=REF + [('linhas', [(58, 108), (86, 108)], 6)], aliases=['short box', 'short box round back'])
ex('Long box pulling straps', PI, g, 'reformer', prone(hip=(70, 102), torso=92, nT=-90, nS=-90, fT=-90, fS=-90, nU=180, nL=180), prone(hip=(70, 102), torso=104, nT=-90, nS=-90, fT=-90, fS=-90, nU=-80, nL=-80), ['costas', 'lombar', 'ombro'], [('cabo', {'from': (140, 92)})], REF + [('linhas', [(50, 108), (110, 108)], 6)], aliases=['pulling straps', 'long box pulling straps'])
ex('Running no reformer', PI, g, 'reformer', pose((80, 112), -90, nA=(130, 100), fA=(124, 106), knee='up', nF=150, fF=110, nU=90, nL=90), pose((80, 112), -90, nA=(124, 106), fA=(130, 100), knee='up', nF=110, fF=150, nU=90, nL=90), ['perna', 'coxa'], static=REF, aliases=['running reformer', 'corrida no reformer'])
ex('Ponte no reformer (bridging)', PI, g, 'reformer', pose((80, 112), -90, nA=(126, 98), fA=(126, 98), knee='up', nU=90, nL=90), pose((92, 100), -68, nA=(126, 98), fA=(126, 98), knee='up', nU=60, nL=90), ['gluteo', 'coxa'], static=REF, aliases=['bridging reformer', 'ponte no reformer'])
ex('Stomach massage no reformer', PI, g, 'reformer', pose((70, 112), 160, nA=(118, 98), fA=(118, 98), knee='up', nH=(64, 116)), pose((86, 112), 160, nA=(136, 98), fA=(136, 98), nH=(80, 116)), ['core', 'coxa'], static=REF, aliases=['stomach massage', 'stomach massage reformer'])
ex('Chest expansion ajoelhado no reformer', PI, g, 'reformer', kneel(hip=(76, 92), nU=30, nL=30), kneel(hip=(76, 92), nU=-30, nL=-30), ['costas', 'ombro'], [('cabo', {'from': (138, 94)})], REF, aliases=['chest expansion', 'chest expansion reformer'])
ex('Círculos de braço nas alças (deitado)', PI, g, 'reformer', pose((80, 112), -90, nA=(118, 98), fA=(118, 98), knee='up', nU=180, nL=180), pose((80, 112), -90, nA=(118, 98), fA=(118, 98), knee='up', nU=100, nL=100), ['ombro', 'costas'], [('cabo', {'from': (20, 96)})], REF, aliases=['arm circles reformer', 'circulos de braco reformer'])
ex('Footwork na chair (wunda chair)', PI, g, 'chair', pose((80, 96), 180, nT=90, nS=-10, fT=90, fS=-10, nU=-30, nL=-10), pose((80, 96), 180, nT=90, nS=40, fT=90, fS=40, nF=150, fF=150, nU=-30, nL=-10), ['perna', 'coxa'], static=[('linhas', [(64, 100), (96, 100)], 5), ('linha', (66, 100), (66, 136)), ('linha', (94, 100), (94, 136)), ('linha', (108, 122), (124, 122), 4)], aliases=['wunda chair', 'chair pilates', 'footwork na chair'])

# =====================================================================================  ESTABILIZAÇÃO — POLIAS
g = 'Estabilização — Polia'
PL = (140, 86)  # polia na altura do peito, à frente
PLH = (140, 20); PLL = (140, 128)
POLIA = [('linha', (142, 12), (142, 136), 3)]
ex('Pallof press ajoelhado na polia', ES, g, 'polia', kneel(nU=40, nL=120), kneel(**FWD), ['core'], [('cabo', {'from': PL})], POLIA, aliases=['pallof ajoelhado', 'pallof press ajoelhado'])
ex('Pallof press meio ajoelhado na polia', ES, g, 'polia', half_kneel(nU=40, nL=120), half_kneel(**FWD), ['core', 'gluteo_f'], [('cabo', {'from': PL})], POLIA, aliases=['pallof meio ajoelhado', 'pallof half kneeling'])
ex('Pallof press com elevação acima da cabeça', ES, g, 'polia', st(nU=40, nL=120), st(**OVER), ['core', 'ombro'], [('cabo', {'from': PL})], POLIA, aliases=['pallof overhead', 'pallof com elevacao'])
ex('Pallof press em base dividida', ES, g, 'polia', split(nU=40, nL=120), split(**FWD), ['core'], [('cabo', {'from': PL})], POLIA, aliases=['pallof base dividida', 'pallof split stance'])
ex('Woodchop alto para baixo na polia', ES, g, 'polia', st(nU=150, nL=150), sq(.4, torso=160, nU=60, nL=40), ['core', 'ombro'], [('cabo', {'from': PLH})], POLIA, aliases=['woodchop', 'lenhador', 'cable chop', 'lenhador na polia'])
ex('Lift baixo para cima na polia', ES, g, 'polia', sq(.4, torso=160, nU=60, nL=40), st(nU=150, nL=150), ['core', 'ombro'], [('cabo', {'from': PLL})], POLIA, aliases=['cable lift', 'lenhador invertido', 'lift na polia'])
ex('Chop meio ajoelhado na polia', ES, g, 'polia', half_kneel(nU=150, nL=150), half_kneel(nU=40, nL=20), ['core'], [('cabo', {'from': PLH})], POLIA, aliases=['half kneeling chop', 'chop ajoelhado'])
ex('Lift meio ajoelhado na polia', ES, g, 'polia', half_kneel(nU=40, nL=20), half_kneel(nU=150, nL=150), ['core'], [('cabo', {'from': PLL})], POLIA, aliases=['half kneeling lift', 'lift ajoelhado'])
ex('Caminhada antirrotação na polia (walkout)', ES, g, 'polia', st(hip=(110, 82), **FWD), st(hip=(70, 82), **FWD), ['core'], [('cabo', {'from': PL})], POLIA, aliases=['pallof walkout', 'antirrotacao caminhando'])
ex('Rotação de tronco na polia', ES, g, 'polia', st(nU=90, nL=90), st(nU=60, nL=60), ['core'], [('cabo', {'from': PL})], POLIA, aliases=['rotacao de tronco na polia', 'cable rotation', 'torso rotation'])
ex('Remada unilateral na polia em base dividida', ES, g, 'polia', split(nU=90, nL=90), split(nU=-30, nL=80, elbow='back'), ['costas', 'core'], [('cabo', {'from': PL})], POLIA, aliases=['remada unilateral em pe na polia', 'cable row split stance'])
ex('Supino unilateral em pé na polia', ES, g, 'polia', split(front=(104, 134), back=(66, 134), nU=-70, nL=80), split(front=(104, 134), back=(66, 134), **FWD), ['peito', 'core'], [('cabo', {'from': (16, 86)})], [('linha', (16, 12), (16, 136), 3)], aliases=['supino unilateral na polia', 'cable press em pe'])
ex('Terra romeno unilateral na polia', ES, g, 'polia', st(nU=5, nL=10), pose((76, 84), 95, nA=(X, 134), fT=-80, fS=-85, fF=0, nU=5, nL=5), ['coxa', 'gluteo', 'core'], [('cabo', {'from': PLL})], POLIA, aliases=['rdl unilateral na polia', 'stiff unilateral na polia'])
ex('Agachamento com polia à frente', ES, g, 'polia', st(**FWD), sq(1.0, torso=160, **FWD), ['coxa', 'gluteo', 'core'], [('cabo', {'from': PL})], POLIA, aliases=['agachamento antiextensao', 'cable squat'])
ex('Puxada unilateral meio ajoelhado na polia', ES, g, 'polia', half_kneel(nU=160, nL=160), half_kneel(nU=40, nL=170, elbow='back'), ['costas', 'core'], [('cabo', {'from': PLH})], POLIA, aliases=['puxada unilateral ajoelhado', 'lat pulldown unilateral ajoelhado'])
ex('Desenvolvimento meio ajoelhado na polia', ES, g, 'polia', half_kneel(hip=(70, 108), nU=40, nL=170), half_kneel(hip=(70, 108), **OVER), ['ombro', 'core'], [('cabo', {'from': (40, 128)})], [('linha', (38, 12), (38, 136), 3)], aliases=['desenvolvimento ajoelhado na polia', 'overhead press meio ajoelhado'])
ex('Avanço reverso com polia', ES, g, 'polia', st(nU=40, nL=120), lunge(nU=40, nL=120), ['coxa', 'gluteo', 'core'], [('cabo', {'from': PL})], POLIA, aliases=['avanco reverso na polia', 'cable reverse lunge'])
ex('Flexão de quadril na polia', ES, g, 'polia', st(hip=(70, 82), nT=-20, nS=-20, nU=-30, nL=10), st(hip=(70, 82), nT=80, nS=0, nU=-30, nL=10), ['coxa', 'core'], [('cabo', {'at': 'nA', 'from': (16, 128)})], [('linha', (16, 12), (16, 136), 3)], aliases=['flexao de quadril na polia', 'psoas na polia', 'hip flexion cable'])
ex('Rotação externa a 90° na polia', ES, g, 'polia', st(nU=90, nL=90), st(nU=90, nL=180), ['ombro', 'costas'], [('cabo', {'from': PL})], POLIA, aliases=['rotacao externa 90 graus', 'rotacao externa abduzido na polia'])
ex('Elevação em Y na polia', ES, g, 'polia', hinge(t=135, hip=(72, 84), nU=20, nL=20), hinge(t=135, hip=(72, 84), nU=160, nL=160), ['ombro', 'trapezio'], [('cabo', {'from': PLL})], POLIA, aliases=['y raise', 'elevacao em y', 'y na polia'])
ex('Prancha com remada na polia', ES, g, 'polia', plank(hx=104, fU=0, fL=0), plank(hx=104, fU=0, fL=0, nU=-40, nL=120), ['core', 'costas'], [('cabo', {'from': (140, 128)})], POLIA, aliases=['prancha com remada', 'plank row cable'])
ex('Agachamento unilateral com apoio na polia', ES, g, 'polia', pose((X, 82), 180, nA=(X, 134), fT=30, fS=-30, **FWD), pose((68, 116), 150, nA=(84, 134), fT=80, fS=80, fF=180, **FWD), ['coxa', 'gluteo'], [('cabo', {'from': PL})], POLIA, aliases=['pistol assistido na polia', 'agachamento unilateral assistido'])

# =====================================================================================  ESTABILIZAÇÃO — ELÁSTICO
g = 'Estabilização — Elástico'
ANC = (140, 86); ANCH = (140, 22); ANCL = (140, 130)
POSTE = [('linha', (142, 12), (142, 136), 3)]
ex('Pallof press com elástico', ES, g, 'elastico', st(nU=40, nL=120), st(**FWD), ['core'], [('elastico', {'from': ANC})], POSTE, aliases=['pallof com elastico', 'pallof elastico'])
ex('Pull-apart com elástico', ES, g, 'elastico', st(**FWD), st(nU=90, nL=90, fU=90, fL=90), ['costas', 'ombro'], [('elastico', {'from': (124, 64)})], aliases=['band pull apart', 'pull apart', 'abertura com elastico'])
ex('Face pull com elástico', ES, g, 'elastico', st(nU=110, nL=110), st(nU=60, nL=170, elbow='up'), ['ombro', 'costas', 'trapezio'], [('elastico', {'from': (140, 56)})], POSTE, aliases=['face pull elastico', 'face pull com elastico'])
ex('Rotação externa com elástico', ES, g, 'elastico', st(nU=5, nL=60), st(nU=5, nL=120), ['ombro'], [('elastico', {'from': (16, 104)})], [('linha', (16, 12), (16, 136), 3)], aliases=['rotacao externa elastico', 'manguito com elastico'])
ex('Rotação interna com elástico', ES, g, 'elastico', st(nU=5, nL=130), st(nU=5, nL=60), ['ombro', 'peito'], [('elastico', {'from': ANC})], POSTE, aliases=['rotacao interna elastico'])
ex('Y-T-W com elástico', ES, g, 'elastico', st(**FWD), st(nU=150, nL=150), ['ombro', 'trapezio', 'costas'], [('elastico', {'from': ANC})], POSTE, aliases=['ytw', 'y t w', 'y-t-w elastico'])
ex('Remada em pé com elástico', ES, g, 'elastico', st(**FWD), st(nU=-30, nL=80, elbow='back'), ['costas', 'antebraco'], [('elastico', {'from': ANC})], POSTE, aliases=['remada elastico', 'remada em pe com elastico'])
ex('Supino em pé com elástico', ES, g, 'elastico', split(nU=-70, nL=80), split(**FWD), ['peito', 'braco'], [('elastico', {'from': (16, 86)})], [('linha', (16, 12), (16, 136), 3)], aliases=['supino com elastico', 'chest press elastico'])
ex('Desenvolvimento com elástico', ES, g, 'elastico', st(nU=40, nL=170), st(**OVER), ['ombro', 'braco'], [('elastico', {'from': (X + 6, 134)})], aliases=['desenvolvimento elastico', 'overhead press elastico'])
ex('Agachamento com elástico', ES, g, 'elastico', st(nU=40, nL=170), sq(1.0, torso=150, nU=40, nL=170), ['coxa', 'gluteo'], [('elastico', {'from': (X + 4, 134)})], aliases=['agachamento elastico', 'band squat'])
ex('Levantamento terra com elástico', ES, g, 'elastico', hinge(t=125, hip=(68, 98), nU=0, nL=0), st(nU=0, nL=0), ['gluteo', 'coxa', 'lombar'], [('elastico', {'from': (X + 4, 134)})], aliases=['terra com elastico', 'band deadlift'])
ex('Good morning com elástico', ES, g, 'elastico', st(**BACKR), hinge(t=100, hip=(70, 84), **BACKR), ['lombar', 'gluteo', 'coxa'], [('elastico', {'at': 'sh', 'from': (X + 4, 134)})], aliases=['good morning elastico', 'bom dia com elastico'])
ex('Monster walk com mini band', ES, g, 'mini-band', sq(.35, torso=165, foot=(86, 134), nU=40, nL=100), split(front=(100, 134), back=(66, 134), hip=(X, 92), torso=165, nU=40, nL=100), ['gluteo', 'coxa'], [('elastico', {'at': 'nK', 'from': (74, 112)})], aliases=['monster walk', 'caminhada monstro', 'caminhada com mini band'])
ex('Extensão terminal de joelho (TKE) com elástico', ES, g, 'elastico', st(nT=10, nS=-15, nU=-20, nL=40), st(nU=-20, nL=40), ['coxa'], [('elastico', {'at': 'nK', 'from': ANCL})], POSTE, aliases=['tke', 'terminal knee extension', 'extensao terminal de joelho'])
ex('Coice de glúteo em pé com elástico', ES, g, 'elastico', st(hip=(90, 82), torso=170, nU=40, nL=90), st(hip=(90, 82), torso=165, nT=-35, nS=-35, nU=40, nL=90), ['gluteo'], [('elastico', {'at': 'nA', 'from': (120, 132)})], aliases=['kickback com elastico', 'coice com elastico em pe'])
ex('Flexão de quadril com elástico', ES, g, 'elastico', st(hip=(80, 82), nT=-10, nS=-10, nU=-20, nL=40), st(hip=(80, 82), nT=85, nS=5, nU=-20, nL=40), ['coxa', 'core'], [('elastico', {'at': 'nA', 'from': (30, 132)})], aliases=['flexao de quadril elastico', 'marcha com elastico'])
ex('Woodchop com elástico', ES, g, 'elastico', st(nU=150, nL=150), sq(.4, torso=160, nU=60, nL=40), ['core'], [('elastico', {'from': ANCH})], POSTE, aliases=['lenhador com elastico', 'woodchop elastico'])
ex('Dead bug com elástico', ES, g, 'elastico', supine(nT=180, nS=90, fT=180, fS=90, nU=180, nL=180), supine(nT=110, nS=110, fT=180, fS=90, nU=-120, nL=-120), ['core'], [('elastico', {'from': (20, 70)})], aliases=['dead bug com elastico', 'dead bug band'])
ex('Puxada alta ajoelhado com elástico', ES, g, 'elastico', kneel(nU=160, nL=160), kneel(nU=30, nL=170, elbow='back'), ['costas', 'braco'], [('elastico', {'from': ANCH})], POSTE, aliases=['puxada com elastico', 'lat pulldown elastico'])
ex('Eversão de tornozelo com elástico', ES, g, 'elastico', sit(nF=180, nU=-30, nL=-10), sit(nF=150, nU=-30, nL=-10), ['perna'], [('elastico', {'at': 'nT', 'from': (140, 130)})], aliases=['eversao de tornozelo', 'tornozelo com elastico', 'inversao e eversao'])
ex('Flexão plantar com elástico', ES, g, 'elastico', sit(nF=170, nU=60, nL=60), sit(nF=120, nU=60, nL=60), ['perna'], [('elastico', {'at': 'nT', 'from': (120, 100)})], aliases=['flexao plantar com elastico', 'panturrilha com elastico'])
ex('Abdução de quadril em pé com elástico no joelho', ES, g, 'mini-band', sq(.3, torso=170, nU=40, nL=100), sq(.3, torso=170, nU=40, nL=100), ['gluteo'], [('elastico', {'at': 'nK', 'from': (70, 112)})], aliases=['abducao com mini band no joelho', 'isometria de abducao'])
ex('Prancha com puxada de elástico', ES, g, 'elastico', plank(hx=104, fU=0, fL=0), plank(hx=104, fU=0, fL=0, nU=-40, nL=120), ['core', 'costas'], [('elastico', {'from': (140, 130)})], POSTE, aliases=['prancha com elastico', 'plank band row'])

# =====================================================================================  ESTABILIZAÇÃO — PESO DO CORPO, BOLA, BOSU, TRX
g = 'Estabilização — Equilíbrio e core'
ex('Equilíbrio unipodal', ES, g, 'peso-do-corpo', pose((X, 82), 180, nA=(X, 134), fT=70, fS=0, nU=-30, nL=20), pose((X, 82), 178, nA=(X, 134), fT=72, fS=-2, nU=-28, nL=22), ['coxa', 'perna', 'core'], aliases=['equilibrio unipodal', 'apoio unipodal', 'equilibrio em uma perna'])
ex('Equilíbrio unipodal com alcance (star excursion)', ES, g, 'peso-do-corpo', pose((X, 82), 180, nA=(X, 134), fT=20, fS=0, **FWD), pose((70, 106), 150, nA=(80, 134), fT=90, fS=90, fF=180, **FWD), ['coxa', 'gluteo', 'core'], aliases=['star excursion', 'alcance unipodal', 'y balance'])
ex('Avião de quadril (hip airplane)', ES, g, 'peso-do-corpo', pose((76, 84), 100, nA=(X, 134), fT=-80, fS=-80, fF=0, nU=60, nL=60), pose((76, 84), 100, nA=(X, 134), fT=-60, fS=-60, fF=20, nU=120, nL=120), ['gluteo', 'coxa', 'core'], aliases=['hip airplane', 'aviao de quadril'])
ex('Prancha com elevação de braço', ES, g, 'peso-do-corpo', plank(hx=110, fU=0, fL=0), plank(hx=110, fU=0, fL=0, nU=150, nL=150), ['core', 'ombro'], aliases=['prancha com elevacao de braco', 'plank reach'])
ex('Prancha com elevação de perna', ES, g, 'peso-do-corpo', plank_elbow(), plank_elbow(nT=-60, nS=-60), ['core', 'gluteo'], aliases=['prancha com elevacao de perna', 'plank leg lift'])
ex('Prancha com toque no ombro', ES, g, 'peso-do-corpo', plank(hx=110, fU=0, fL=0), plank(hx=110, fU=0, fL=0, nU=-20, nL=160), ['core', 'ombro'], aliases=['shoulder tap', 'prancha toque no ombro', 'plank shoulder tap'])
ex('Prancha lateral com elevação de perna', ES, g, 'peso-do-corpo', place(pose((0, 0), -104, nT=101, nS=101, fT=101, fS=101, nF=190, fF=190, nU=0, nL=-90), 'nE', (46, 132)), place(pose((0, 0), -104, nT=120, nS=120, fT=101, fS=101, nF=210, fF=190, nU=0, nL=-90), 'nE', (46, 132)), ['core', 'gluteo'], aliases=['prancha lateral com elevacao de perna', 'side plank leg raise'])
ex('Prancha reversa', ES, g, 'peso-do-corpo', pose((84, 112), -100, nT=100, nS=100, fT=100, fS=100, nF=170, fF=170, nH=(48, 134)), pose((84, 104), -102, nT=102, nS=102, fT=102, fS=102, nF=170, fF=170, nH=(48, 134)), ['gluteo', 'core', 'braco'], aliases=['prancha reversa', 'reverse plank', 'prancha invertida'])
ex('Prancha com caminhada (plank walk-out)', ES, g, 'peso-do-corpo', plank(hx=102), plank(hx=124, torso=118, legs=-62), ['core', 'ombro'], aliases=['plank walkout', 'prancha caminhando'])
ex('Mexer a panela na bola (stir the pot)', ES, g, 'bola-suica', plank_elbow(ex=112), plank_elbow(ex=118), ['core'], static=[('bola_grande', (112, 120), 14)], aliases=['stir the pot', 'mexer a panela'])
ex('Ponte com marcha', ES, g, 'peso-do-corpo', pose((92, 108), -66, nA=(118, 132), fA=(118, 132), knee='up', nU=90, nL=90), pose((92, 108), -66, nT=150, nS=60, fA=(118, 132), knee='up', nU=90, nL=90), ['gluteo', 'core'], aliases=['ponte com marcha', 'glute bridge march', 'marcha na ponte'])
ex('Roda abdominal (ab wheel)', ES, g, 'roda-abdominal', kneel(hip=(70, 108), torso=130, nU=10, nL=10), kneel(hip=(70, 108), torso=96, nU=95, nL=95), ['core', 'ombro'], [('bola', {'r': 6})], aliases=['ab wheel', 'roda abdominal', 'rodinha'])
ex('Abdominal anti-extensão no rolo (rollout ajoelhado)', ES, g, 'roda-abdominal', kneel(hip=(70, 108), torso=125, nU=20, nL=20), kneel(hip=(70, 108), torso=100, nU=80, nL=80), ['core'], [('bola', {'r': 5})], aliases=['rollout', 'rollout ajoelhado'])

g = 'Estabilização — Bola suíça e bosu'
ex('Prancha na bola suíça', ES, g, 'bola-suica', plank_elbow(ex=112), plank_elbow(ex=113), ['core'], static=[('bola_grande', (112, 120), 14)], aliases=['prancha na bola', 'prancha bola suica'])
ex('Rollout na bola suíça', ES, g, 'bola-suica', kneel(hip=(66, 108), torso=130, nU=40, nL=40), kneel(hip=(66, 108), torso=105, nU=95, nL=95), ['core', 'ombro'], [('bola', {'r': 13, 'off': (4, 8)})], aliases=['rollout bola suica', 'rolamento na bola'])
ex('Pike na bola suíça', ES, g, 'bola-suica', plank_feet_up(), plank_feet_up(pike=True, ankle=(48, 106)), ['core', 'ombro'], [('bola', {'at': 'nA', 'r': 12, 'off': (-2, 14)})], aliases=['pike na bola', 'ball pike'])
ex('Joelho ao peito na bola suíça', ES, g, 'bola-suica', plank_feet_up(), plank_feet_up(tuck=True), ['core'], [('bola', {'at': 'nA', 'r': 12, 'off': (-2, 14)})], aliases=['ball tuck', 'joelho no peito na bola', 'knee tuck bola'])
ex('Agachamento na parede com bola suíça', ES, g, 'bola-suica', st(hip=(66, 82), **FWD), pose((60, 112), 180, nA=(88, 134), fA=(88, 134), **FWD), ['coxa', 'gluteo'], [('bola', {'at': 'sh', 'r': 10, 'off': (-12, 8)})], [('parede', 44)], aliases=['agachamento com bola na parede', 'wall squat bola'])
ex('Dead bug com bola suíça', ES, g, 'bola-suica', supine(nT=180, nS=90, fT=180, fS=90, nU=175, nL=175), supine(nT=110, nS=110, fT=180, fS=90, nU=175, nL=175), ['core'], [('bola', {'r': 11, 'off': (0, -10)})], aliases=['dead bug com bola'])
ex('Hiperextensão lombar na bola suíça', ES, g, 'bola-suica', pose((80, 104), 50, nA=(42, 134), fA=(42, 134), knee='down', nU=0, nL=0), pose((80, 104), 92, nA=(42, 134), fA=(42, 134), knee='down', nU=150, nL=220), ['lombar', 'gluteo'], static=[('bola_grande', (86, 120), 15)], aliases=['hiperextensao na bola', 'extensao lombar na bola'])
ex('Abdominal na bola suíça', ES, g, 'bola-suica', pose((78, 104), -96, nA=(112, 134), fA=(112, 134), nU=-140, nL=-50), pose((78, 104), -128, nA=(112, 134), fA=(112, 134), nU=-140, nL=-50), ['core'], static=[('bola_grande', (70, 120), 15)], aliases=['abdominal na bola', 'crunch na bola suica'])
ex('Ponte com pés na bola suíça', ES, g, 'bola-suica', supine(hip=(70, 126), nT=110, nS=60, fT=110, fS=60, nU=90, nL=90), pose((80, 112), -76, nT=80, nS=100, fT=80, fS=100, nU=90, nL=90), ['gluteo', 'coxa'], [('bola', {'at': 'nA', 'r': 12, 'off': (4, 6)})], aliases=['ponte na bola', 'ponte com pes na bola'])
ex('Agachamento no bosu', ES, g, 'bosu', pose((X, 70), 180, nA=(X, 122), fA=(X, 122), **FWD), pose((68, 100), 150, nA=(84, 122), fA=(84, 122), **FWD), ['coxa', 'gluteo', 'perna'], static=[('bosu', X, 48)], aliases=['agachamento no bosu', 'bosu squat'])
ex('Flexão de braço no bosu', ES, g, 'bosu', plank(hx=110, arm_y=122), plank(hx=110, arm_y=122, nU=-40, nL=10), ['peito', 'braco', 'core'], static=[('bosu', 110, 40)], aliases=['flexao no bosu', 'bosu push up'])
ex('Equilíbrio unipodal no bosu', ES, g, 'bosu', pose((X, 70), 180, nA=(X, 122), fT=60, fS=-20, nU=-30, nL=20), pose((X, 70), 177, nA=(X, 122), fT=64, fS=-16, nU=-26, nL=24), ['perna', 'coxa', 'core'], static=[('bosu', X, 48)], aliases=['equilibrio no bosu', 'bosu unipodal'])
ex('Avanço com pé no bosu', ES, g, 'bosu', st(hip=(70, 82)), pose((80, 100), 178, nA=(106, 122), fA=(50, 130), fknee='down', fF=40), ['coxa', 'gluteo'], static=[('bosu', 108, 40)], aliases=['avanco no bosu', 'lunge no bosu'])
ex('Prancha no bosu', ES, g, 'bosu', plank_elbow(ex=110), plank_elbow(ex=110, torso=102), ['core'], static=[('bosu', 104, 40)], aliases=['prancha no bosu', 'bosu plank'])

g = 'Estabilização — TRX (suspensão)'
TA = (106, 8)
TRX = [('linha', (98, 6), (114, 6), 3)]
ex('Remada no TRX', ES, g, 'trx', pose((84, 104), -146, nA=(128, 132), fA=(128, 132), nH=(104, 50)), pose((92, 94), -162, nA=(130, 132), fA=(130, 132), nH=(104, 50), elbow='down'), ['costas', 'braco'], [('trx', {'from': TA})], TRX, aliases=['remada no trx', 'trx row'])
ex('Flexão no TRX', ES, g, 'trx', place(pose((0, 0), 115, nT=-65, nS=-65, fT=-65, fS=-65, nF=-10, fF=-10, nU=10, nL=10), 'nA', (40, 130)), place(pose((0, 0), 108, nT=-72, nS=-72, fT=-72, fS=-72, nF=-10, fF=-10, nU=-50, nL=20), 'nA', (40, 130)), ['peito', 'braco', 'core'], [('trx', {'from': TA})], TRX, aliases=['flexao no trx', 'trx push up'])
ex('Agachamento no TRX', ES, g, 'trx', st(hip=(74, 82), **FWD), sq(1.1, torso=165, foot=(78, 134), hipx=60, **FWD), ['coxa', 'gluteo'], [('trx', {'from': TA})], TRX, aliases=['agachamento no trx', 'trx squat'])
ex('Avanço com pé no TRX', ES, g, 'trx', pose((70, 82), 180, nA=(70, 134), fA=(30, 112), fknee='down', nU=-20, nL=30), pose((80, 104), 175, nA=(100, 134), fA=(34, 116), fknee='down', nU=-20, nL=30), ['coxa', 'gluteo'], [('trx', {'at': 'fA', 'from': (34, 8)})], [('linha', (26, 6), (42, 6), 3)], aliases=['avanco no trx', 'bulgaro no trx', 'trx lunge'])
ex('Pike no TRX', ES, g, 'trx', plank_feet_up(ankle=(44, 104)), plank_feet_up(pike=True, ankle=(48, 100)), ['core', 'ombro'], [('trx', {'at': 'nA', 'from': (44, 8)})], [('linha', (32, 6), (48, 6), 3)], aliases=['pike no trx', 'trx pike'])
ex('Joelho ao peito no TRX', ES, g, 'trx', plank_feet_up(ankle=(44, 104)), plank_feet_up(tuck=True), ['core'], [('trx', {'at': 'nA', 'from': (44, 8)})], [('linha', (32, 6), (48, 6), 3)], aliases=['trx knee tuck', 'joelho ao peito no trx'])
ex('Rosca bíceps no TRX', ES, g, 'trx', pose((84, 104), -146, nA=(128, 132), fA=(128, 132), nH=(104, 50)), pose((92, 96), -160, nA=(130, 132), fA=(130, 132), nU=120, nL=-10), ['braco'], [('trx', {'from': TA})], TRX, aliases=['rosca no trx', 'trx biceps curl'])
ex('Tríceps no TRX', ES, g, 'trx', place(pose((0, 0), 140, nT=-40, nS=-40, fT=-40, fS=-40, nF=40, fF=40, nU=170, nL=30), 'nA', (54, 132)), place(pose((0, 0), 146, nT=-34, nS=-34, fT=-34, fS=-34, nF=40, fF=40, nU=150, nL=150), 'nA', (54, 132)), ['braco'], [('trx', {'from': TA})], TRX, aliases=['triceps no trx', 'trx triceps extension'])
ex('Elevação em Y no TRX', ES, g, 'trx', pose((84, 104), -146, nA=(128, 132), fA=(128, 132), nH=(104, 50)), pose((92, 96), -164, nA=(130, 132), fA=(130, 132), nU=160, nL=160), ['ombro', 'trapezio', 'costas'], [('trx', {'from': TA})], TRX, aliases=['y no trx', 'trx y raise'])
ex('Prancha com pés no TRX', ES, g, 'trx', plank_elbow(ex=110), plank_elbow(ex=110, torso=99), ['core'], [('trx', {'at': 'nA', 'from': (40, 8)})], [('linha', (32, 6), (48, 6), 3)], aliases=['prancha no trx', 'trx plank'])

# =====================================================================================  MOBILIDADE E FUNCIONAL
g = 'Mobilidade — Quadril e coluna'
ex('Agachamento profundo com mobilidade', MO, g, 'peso-do-corpo', sq(1.3, torso=165, foot=(86, 134), **CHEST), sq(1.3, torso=172, foot=(86, 134), nU=-10, nL=160), ['coxa', 'gluteo'], aliases=['deep squat', 'agachamento profundo', 'squat hold'])
ex("World's greatest stretch", MO, g, 'peso-do-corpo', lunge(front=(110, 134), back=(42, 128), hip=(76, 110), torso=120, nU=0, nL=0), lunge(front=(110, 134), back=(42, 128), hip=(76, 110), torso=140, nU=180, nL=180), ['coxa_f', 'core', 'costas'], aliases=['worlds greatest stretch', 'melhor alongamento do mundo', 'wgs'])
ex('Alongamento de flexor do quadril ajoelhado', MO, g, 'colchonete', half_kneel(hip=(76, 108)), half_kneel(hip=(86, 110), torso=176, nA=(110, 134), nU=176, nL=176), ['coxa_f'], aliases=['alongamento de psoas', 'flexor de quadril', 'hip flexor stretch'])
ex('Mobilidade torácica em quatro apoios (thread the needle)', MO, g, 'colchonete', quad(nU=0, nL=0), quad(torso=100, nU=-60, nL=-60), ['costas'], aliases=['thread the needle', 'passar a linha', 'mobilidade toracica'])
ex('Livro aberto (open book) deitado de lado', MO, g, 'colchonete', side_lying(nT=150, nS=60, fT=150, fS=60, nU=150, nL=150), side_lying(nT=150, nS=60, fT=150, fS=60, nU=-120, nL=-120), ['costas', 'peito'], aliases=['open book', 'livro aberto', 'rotacao toracica deitado'])
ex('90/90 de quadril', MO, g, 'colchonete', pose((70, 128), 180, nT=90, nS=0, fT=-90, fS=0, nU=-20, nL=40), pose((70, 128), 140, nT=90, nS=0, fT=-90, fS=0, nU=40, nL=40), ['gluteo'], aliases=['90 90', '90/90', 'mobilidade 90 90'])
ex('Cachorro olhando para baixo', MO, g, 'colchonete', plank(hx=114), place(pose((0, 0), 30, nT=-30, nS=-30, fT=-30, fS=-30, nF=60, fF=60, nU=0, nL=0), 'nH', (116, 134)), ['coxa', 'perna', 'ombro'], aliases=['downward dog', 'cachorro olhando para baixo', 'v invertido'])
ex('Cobra (extensão lombar no solo)', MO, g, 'colchonete', prone(nU=0, nL=90), prone(torso=125, nH=(108, 134)), ['core', 'lombar'], aliases=['cobra', 'extensao lombar no solo', 'upward dog'])
ex('Postura da criança', MO, g, 'colchonete', quad(nU=0, nL=0), pose((56, 122), 100, nT=-30, nS=-90, fT=-30, fS=-90, nF=-90, fF=-90, nU=90, nL=90), ['costas', 'lombar'], aliases=['postura da crianca', 'childs pose', 'balasana'])
ex('Alongamento de posteriores em pé', MO, g, 'peso-do-corpo', st(), hinge(t=30, hip=(70, 82), nU=0, nL=0), ['coxa'], aliases=['alongamento de posterior', 'alongamento de isquiotibiais em pe'])
ex('Mobilidade de tornozelo (joelho à parede)', MO, g, 'parede', pose((86, 96), 180, nA=(110, 134), fA=(66, 134), nH=(124, 80)), pose((90, 98), 180, nA=(110, 134), fA=(66, 134), nH=(124, 80)), ['perna'], static=[('parede', 128)], aliases=['knee to wall', 'mobilidade de tornozelo', 'joelho na parede'])
ex('Gato-camelo em pé (cat-cow em pé)', MO, g, 'peso-do-corpo', hinge(t=135, hip=(72, 88), foot=(80, 134), nH=(96, 108)), hinge(t=115, hip=(72, 88), foot=(80, 134), nH=(96, 108)), ['costas', 'lombar'], aliases=['cat cow em pe', 'gato camelo em pe'])
ex('Rotação de quadril em pé (abrir o portão)', MO, g, 'peso-do-corpo', st(nU=-30, nL=20), st(nT=90, nS=0, nU=-30, nL=20), ['gluteo', 'coxa'], aliases=['abrir o portao', 'hip opener', 'rotacao de quadril em pe'])

g = 'Funcional — Condicionamento'
ex('Polichinelo', MO, g, 'peso-do-corpo', st(nU=5, nL=5), up(st(nU=170, nL=170, nT=10, nS=-10, fT=-10, fS=10), 6), ['perna', 'ombro'], aliases=['polichinelo', 'jumping jack', 'jumping jacks'])
ex('Skipping alto', MO, g, 'peso-do-corpo', pose((X, 82), 180, nT=90, nS=0, fA=(X, 134), nU=-40, nL=20, fU=50, fL=130), pose((X, 82), 180, nA=(X, 134), fT=90, fS=0, nU=50, nL=130, fU=-40, fL=20), ['coxa', 'core'], aliases=['skipping', 'skipping alto', 'joelho alto'])
ex('Salto lateral (skater)', MO, g, 'peso-do-corpo', pose((70, 96), 160, nA=(72, 134), fT=-30, fS=-60, nU=60, nL=60), up(pose((96, 96), 160, nA=(98, 134), fT=-30, fS=-60, nU=-40, nL=-40), 6), ['coxa', 'gluteo'], aliases=['skater', 'salto do patinador', 'skater jump'])
ex('Corrida estacionária', MO, g, 'peso-do-corpo', pose((X, 82), 178, nT=60, nS=-30, fA=(X, 134), nU=-40, nL=40, fU=40, fL=120), pose((X, 82), 178, nA=(X, 134), fT=60, fS=-30, nU=40, nL=120, fU=-40, fL=40), ['coxa', 'perna'], aliases=['corrida estacionaria', 'corrida parada'])
ex('Sprawl', MO, g, 'peso-do-corpo', st(nU=40, nL=90), prone(hip=(66, 128), torso=110, nH=(108, 134)), ['core', 'peito', 'coxa'], aliases=['sprawl'])
ex('Agachamento com salto lateral (lateral hop)', MO, g, 'peso-do-corpo', sq(.6, torso=160, **FWD), up(st(hip=(88, 82), **FWD), 10), ['coxa', 'perna'], aliases=['lateral hop', 'salto lateral sobre linha'])
ex('Prancha com salto de pernas (plank jack)', MO, g, 'peso-do-corpo', plank(hx=112), plank(hx=112, nT=-60, nS=-60, fT=-74, fS=-74), ['core', 'ombro'], aliases=['plank jack', 'prancha polichinelo'])
ex('Escalador cruzado (cross mountain climber)', MO, g, 'peso-do-corpo', plank(hx=112), plank(hx=112, nT=40, nS=-70), ['core'], aliases=['cross mountain climber', 'escalador cruzado'])
ex('Lançamento de medicine ball no chão (slam ball)', CF, 'CrossFit — Condicionamento', 'medicine-ball', st(**OVER), sq(.8, torso=130, nU=60, nL=60), ['core', 'costas', 'ombro'], [('bola',)], aliases=['slam ball', 'ball slam', 'arremesso de bola no chao'])
ex('Corda naval (battle rope)', CF, 'CrossFit — Condicionamento', 'corda-naval', sq(.5, torso=160, nU=60, nL=80), sq(.5, torso=160, nU=30, nL=50), ['ombro', 'braco', 'core'], [('corda_naval',)], aliases=['battle rope', 'corda naval', 'cordas navais'])
ex('Arremesso de medicine ball no peito (chest pass)', CF, 'CrossFit — Condicionamento', 'medicine-ball', split(**CHEST), split(**FWD), ['peito', 'braco'], [('bola',)], aliases=['chest pass', 'passe de peito com medicine ball'])
ex('Arremesso rotacional de medicine ball na parede', ES, 'Estabilização — Equilíbrio e core', 'medicine-ball', sq(.3, torso=170, nU=-40, nL=30), sq(.3, torso=172, nU=80, nL=90), ['core'], [('bola',)], [('parede', 140)], aliases=['rotational throw', 'arremesso rotacional', 'medicine ball rotacional'])

from catalogo_mob import *  # noqa: lote 3 (mobilidade e alongamentos)
