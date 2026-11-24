"""Motor de desenho dos exercícios do DE HOJE (mesmo estilo dos desenhos originais).

Boneco de perfil, olhando para a direita, animado entre a pose A e a pose B (A -> B -> A, 2.8 s).
Ângulos em graus: 0 = para baixo, 90 = para a frente (direita), 180 = para cima, -90 = para trás.
"""
import math

G = '#16A34A'
DUR = '2.8s'
L = dict(thigh=26, shin=26, foot=9, torso=40, upper=20, fore=20, neck=14)
STYLE = ('<style>svg{--text-primary:#1F2A44;--text-secondary:#6B7280;--border-strong:#B8BCC6}'
         '@media (prefers-color-scheme:dark){svg{--text-primary:#F1F1EE;--text-secondary:#A0A4AE;--border-strong:#6B7080}}</style>')
P, S, B = 'var(--text-primary)', 'var(--text-secondary)', 'var(--border-strong)'

def vec(a, l):
    r = math.radians(a)
    return (math.sin(r) * l, math.cos(r) * l)

def add(p, a, l):
    dx, dy = vec(a, l)
    return (p[0] + dx, p[1] + dy)

DEFAULT = dict(hip=(80, 82), torso=180, nT=0, nS=0, nF=90, fT=0, fS=0, fF=90,
               nU=0, nL=0, fU=None, fL=None, head=None)

def joints(pose):
    q = dict(DEFAULT); q.update(pose)
    j = {}
    h = q['hip']; j['hip'] = h
    j['sh'] = add(h, q['torso'], L['torso'])
    j['head'] = add(j['sh'], q['head'] if q['head'] is not None else q['torso'], L['neck'])
    j['nK'] = add(h, q['nT'], L['thigh']); j['nA'] = add(j['nK'], q['nS'], L['shin']); j['nT'] = add(j['nA'], q['nF'], L['foot'])
    j['fK'] = add(h, q['fT'], L['thigh']); j['fA'] = add(j['fK'], q['fS'], L['shin']); j['fT'] = add(j['fA'], q['fF'], L['foot'])
    j['nE'] = add(j['sh'], q['nU'], L['upper']); j['nH'] = add(j['nE'], q['nL'], L['fore'])
    if q['fU'] is not None:
        j['fE'] = add(j['sh'], q['fU'], L['upper']); j['fH'] = add(j['fE'], q['fL'] if q['fL'] is not None else q['fU'], L['fore'])
    j['_q'] = q
    return j

def place(pose, joint, target):
    """Desloca a pose para que a articulação `joint` fique em `target`."""
    p = dict(pose); p['hip'] = (0, 0)
    j = joints(p)[joint]
    p['hip'] = (target[0] - j[0], target[1] - j[1])
    return p

def ground(pose, y=134, keys=None, x=None):
    """Encosta o ponto mais baixo do corpo no chão (y=134 = centro do traço; chão em 136)."""
    j = joints(pose)
    keys = keys or ['nA', 'fA', 'nT', 'fT', 'nK', 'fK', 'nH', 'fH', 'hip', 'sh', 'nE', 'fE', 'head']
    low = max(j[k][1] + (7 if k == 'head' else 0) for k in keys if k in j)
    h = j['hip']; p = dict(pose)
    p['hip'] = (x if x is not None else h[0], h[1] + (y - low))
    return p

def f(n):
    s = f'{n:.1f}'
    return s[:-2] if s.endswith('.0') else s

def pts(seq):
    return 'M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in seq)

def seg(a, b, t0, t1):
    return ((a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0), (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1))

def anim(attr, va, vb):
    return (f'<animate attributeName="{attr}" values="{va};{vb};{va}" keyTimes="0;.5;1" calcMode="spline" '
            f'keySplines=".45 0 .55 1;.45 0 .55 1" dur="{DUR}" repeatCount="indefinite"/>')

def path(da, db, color, w, dash=None):
    extra = f' stroke-dasharray="{dash}"' if dash else ''
    a = '' if da == db else anim('d', da, db)
    return (f'<path d="{da}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" '
            f'stroke-linejoin="round"{extra}>{a}</path>')

def circle(ca, cb, r, fill, stroke='none', sw=None):
    s = f' stroke-width="{sw}"' if sw else ''
    a = ''
    if abs(ca[0] - cb[0]) > .05: a += anim('cx', f(ca[0]), f(cb[0]))
    if abs(ca[1] - cb[1]) > .05: a += anim('cy', f(ca[1]), f(cb[1]))
    return f'<circle cx="{f(ca[0])}" cy="{f(ca[1])}" r="{r}" fill="{fill}" stroke="{stroke}"{s}>{a}</circle>'

# trechos que podem ser pintados de verde (músculo trabalhado)
HL = {
    'peito': ('hip', 'sh', .62, .9), 'costas': ('hip', 'sh', .45, .85), 'core': ('hip', 'sh', .12, .55),
    'lombar': ('hip', 'sh', .08, .4), 'tronco': ('hip', 'sh', .1, .9), 'trapezio': ('hip', 'sh', .82, .98),
    'gluteo': ('hip', 'nK', .0, .35), 'gluteo_f': ('hip', 'fK', .0, .35),
    'coxa': ('hip', 'nK', .1, .9), 'coxa_f': ('hip', 'fK', .1, .9),
    'perna': ('nK', 'nA', .1, .9), 'perna_f': ('fK', 'fA', .1, .9),
    'ombro': ('sh', 'nE', .0, .45), 'ombro_f': ('sh', 'fE', .0, .45),
    'braco': ('sh', 'nE', .1, .9), 'braco_f': ('sh', 'fE', .1, .9),
    'antebraco': ('nE', 'nH', .1, .9), 'antebraco_f': ('fE', 'fH', .1, .9),
}

def render(name, A, B=None, hl=(), props=(), static=(), floor=True, far_arm=False, far_leg=True, head_tilt=0):
    """A/B: poses. props: objetos presos às mãos/pés. static: equipamentos fixos."""
    B = B or A
    ja, jb = joints(A), joints(B)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 150" width="320" height="300" role="img" aria-label="{name}">', STYLE]
    if floor:
        out.append(path('M12 136 L148 136', 'M12 136 L148 136', B, 2))
    for s in static:
        out.append(draw_static(s))
    # elementos presos ao corpo que ficam atrás (cabos, elásticos)
    for p in props:
        if p[0] in ('cabo', 'elastico', 'corda_naval', 'corda_pular', 'trx'):
            out.append(draw_prop(p, ja, jb))
    # perna de trás e braço de trás (cinza)
    if far_leg:
        out.append(path(pts([ja['hip'], ja['fK'], ja['fA'], ja['fT']]), pts([jb['hip'], jb['fK'], jb['fA'], jb['fT']]), S, 4.5))
    if 'fE' in ja and 'fE' in jb:
        out.append(path(pts([ja['sh'], ja['fE'], ja['fH']]), pts([jb['sh'], jb['fE'], jb['fH']]), S, 4.5))
    out.append(path(pts([ja['hip'], ja['nK'], ja['nA'], ja['nT']]), pts([jb['hip'], jb['nK'], jb['nA'], jb['nT']]), P, 5))
    out.append(path(pts([ja['hip'], ja['sh']]), pts([jb['hip'], jb['sh']]), P, 5))
    out.append(path(pts([ja['sh'], ja['nE'], ja['nH']]), pts([jb['sh'], jb['nE'], jb['nH']]), P, 5))
    for h in hl:
        a0, a1, t0, t1 = HL[h]
        if a0 not in ja or a1 not in ja: continue
        sa, sb = seg(ja[a0], ja[a1], t0, t1), seg(jb[a0], jb[a1], t0, t1)
        out.append(path(pts(sa), pts(sb), G, 6.5))
    # cabeça + olhar
    out.append(circle(ja['head'], jb['head'], 9, 'none', P, 4))
    ea = eye(ja, head_tilt); eb = eye(jb, head_tilt)
    out.append(path(pts(ea), pts(eb), P, 2.5))
    for p in props:
        if p[0] not in ('cabo', 'elastico', 'corda_naval', 'corda_pular', 'trx'):
            out.append(draw_prop(p, ja, jb))
    out.append('</svg>')
    return ''.join(out)

def eye(j, tilt):
    q = j['_q']; base = (q['head'] if q['head'] is not None else q['torso'])
    face = base - 90 + tilt  # perpendicular ao pescoço, para a frente
    c = j['head']; p0 = add(c, face, 9); p1 = add(p0, face - 25, 3.8)
    return [p0, p1]

def hand_pt(j, which='nH', off=(0, 0)):
    p = j.get(which, j['nH']); return (p[0] + off[0], p[1] + off[1])

def draw_prop(p, ja, jb):
    kind = p[0]; o = p[1] if len(p) > 1 else {}
    at = o.get('at', 'nH'); off = o.get('off', (0, 0))
    ca, cb = hand_pt(ja, at, off), hand_pt(jb, at, off)
    if kind == 'halter': return circle(ca, cb, 5.5, P)
    if kind == 'barra': return circle(ca, cb, 7, P)
    if kind == 'pegador': return circle(ca, cb, 4, P)
    if kind == 'anilha': return circle(ca, cb, 8, 'none', P, 3)
    if kind == 'bola': return circle(ca, cb, o.get('r', 8), 'none', P, 3)
    if kind == 'caneleira': return circle(ca, cb, 4, G)
    if kind == 'kettlebell':
        ka, kb = (ca[0], ca[1] + 6), (cb[0], cb[1] + 6)
        return circle(ka, kb, 6, P) + path(pts([(ca[0] - 3, ca[1] + 2), ca, (ca[0] + 3, ca[1] + 2)]), pts([(cb[0] - 3, cb[1] + 2), cb, (cb[0] + 3, cb[1] + 2)]), P, 2.5)
    if kind == 'saco':  # sandbag
        w, h = 16, 9
        ra = [(ca[0] - w/2, ca[1] - h/2), (ca[0] + w/2, ca[1] - h/2), (ca[0] + w/2, ca[1] + h/2), (ca[0] - w/2, ca[1] + h/2), (ca[0] - w/2, ca[1] - h/2)]
        rb = [(cb[0] - w/2, cb[1] - h/2), (cb[0] + w/2, cb[1] - h/2), (cb[0] + w/2, cb[1] + h/2), (cb[0] - w/2, cb[1] + h/2), (cb[0] - w/2, cb[1] - h/2)]
        return path(pts(ra), pts(rb), P, 3.5)
    if kind == 'treno':  # trenó: caixa no chão à frente das mãos
        dx = o.get('dx', 6); w, h = o.get('w', 22), o.get('h', 14); y = 136
        def box(c): x = c[0] + dx; return [(x, y), (x, y - h), (x + w, y - h), (x + w, y), (x, y)]
        return path(pts(box(ca)), pts(box(cb)), B, 3) + path(pts([ca, (ca[0] + dx, y - h + 3)]), pts([cb, (cb[0] + dx, y - h + 3)]), B, 2)
    if kind in ('cabo', 'elastico'):
        anc = o['from']
        dash = '4 3' if kind == 'elastico' else None
        col = S if kind == 'elastico' else B
        s = path(pts([anc, ca]), pts([anc, cb]), col, 2, dash)
        if kind == 'cabo': s = circle(anc, anc, 3, 'none', B, 2) + s + circle(ca, cb, 3, P)
        return s
    if kind == 'trx':
        anc = o['from']
        return path(pts([anc, ca]), pts([anc, cb]), S, 2.5) + circle(ca, cb, 3, P)
    if kind == 'corda_naval':
        anc = o.get('from', (146, 128))
        def wave(c, ph):
            n = 6; out = []
            for i in range(n + 1):
                t = i / n; x = c[0] + (anc[0] - c[0]) * t; y = c[1] + (anc[1] - c[1]) * t + math.sin(t * math.pi * 3 + ph) * 5 * (1 - t * .5)
                out.append((x, y))
            return out
        return path(pts(wave(ca, 0)), pts(wave(cb, math.pi)), S, 2.5)
    if kind == 'corda_pular':
        def arc(c, up):
            top = (c[0] - 4, c[1] - 70) if up else (c[0] - 4, 139)
            return f'M{f(c[0])} {f(c[1])}Q{f(top[0] + (-30 if up else 30))} {f(top[1])} {f(c[0] - 2)} {f(c[1] + 1)}'
        return path(arc(ca, True), arc(cb, False), S, 2)
    if kind == 'pe_circulo':  # alvo de wall ball / marca
        return circle(o['c'], o['c'], o.get('r', 6), 'none', B, 2)
    raise ValueError(kind)

def draw_static(s):
    k = s[0]
    if k == 'linha':
        _, a, b, *w = s; return path(pts([a, b]), pts([a, b]), B, w[0] if w else 2)
    if k == 'linhas':
        _, seq, *w = s; return path(pts(seq), pts(seq), B, w[0] if w else 2)
    if k == 'banco':  # banco horizontal: assento de x0 a x1 na altura y
        _, x0, x1, y = s
        return path(pts([(x0, y), (x1, y)]), pts([(x0, y), (x1, y)]), B, 4) + path(pts([((x0 + x1) / 2, y), ((x0 + x1) / 2, 136)]), pts([((x0 + x1) / 2, y), ((x0 + x1) / 2, 136)]), B, 2)
    if k == 'caixa':
        _, x0, x1, h = s; seq = [(x0, 136), (x0, 136 - h), (x1, 136 - h), (x1, 136)]
        return path(pts(seq), pts(seq), B, 3)
    if k == 'barra_fixa':
        _, x0, x1, y = s; return path(pts([(x0, y), (x1, y)]), pts([(x0, y), (x1, y)]), B, 3) + path(pts([(x1, y), (x1, 136)]), pts([(x1, y), (x1, 136)]), B, 2)
    if k == 'argolas':
        _, x, y = s; return path(pts([(x, 10), (x, y - 5)]), pts([(x, 10), (x, y - 5)]), B, 2) + circle((x, y), (x, y), 5, 'none', B, 2.5)
    if k == 'bola_grande':
        _, c, r = s; return circle(c, c, r, 'none', B, 3)
    if k == 'bosu':
        _, x, w = s; return f'<path d="M{f(x - w/2)} 136 A{f(w/2)} {f(w/2.6)} 0 0 1 {f(x + w/2)} 136" fill="none" stroke="{B}" stroke-width="3"/>'
    if k == 'colchonete':
        _, x0, x1 = s; return path(pts([(x0, 134), (x1, 134)]), pts([(x0, 134), (x1, 134)]), B, 4)
    if k == 'parede':
        _, x = s; return path(pts([(x, 14), (x, 136)]), pts([(x, 14), (x, 136)]), B, 3)
    if k == 'alvo':
        _, c = s; return circle(c, c, 6, 'none', B, 2.5) + circle(c, c, 1.5, B)
    if k == 'remo':  # remo ergômetro: trilho + volante
        return (path('M30 124L130 124', 'M30 124L130 124', B, 3) + path('M30 124L30 136M126 124L126 136', 'M30 124L30 136M126 124L126 136', B, 2)
                + circle((132, 112), (132, 112), 9, 'none', B, 3))
    if k == 'skierg':
        _, x = s; return path(pts([(x, 14), (x, 136)]), pts([(x, 14), (x, 136)]), B, 4) + circle((x, 20), (x, 20), 4, 'none', B, 2)
    if k == 'reformer':
        return (path('M14 118L146 118', 'M14 118L146 118', B, 3) + path('M20 118L20 136M140 118L140 136', 'M20 118L20 136M140 118L140 136', B, 2)
                + path('M138 118L138 92', 'M138 118L138 92', B, 4))
    if k == 'faixa_chao':
        _, x0, x1 = s; return path(pts([(x0, 136), (x1, 136)]), pts([(x0, 136), (x1, 136)]), G, 3)
    raise ValueError(k)

# ---------- cinemática inversa (pé/mão num ponto exato)
def ang(p0, p1):
    return math.degrees(math.atan2(p1[0] - p0[0], p1[1] - p0[1]))

def ik(p0, p2, l1, l2, prefer='fwd'):
    d = min(math.dist(p0, p2), l1 + l2 - .01)
    base = ang(p0, p2)
    off = math.degrees(math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))))
    cands = []
    for s in (1, -1):
        a1 = base + s * off
        k = add(p0, a1, l1)
        a2 = ang(k, p2)
        cands.append((a1, a2, k))
    key = {'fwd': lambda c: -c[2][0], 'back': lambda c: c[2][0], 'up': lambda c: c[2][1], 'down': lambda c: -c[2][1]}[prefer]
    a1, a2, _ = sorted(cands, key=key)[0]
    return a1, a2

def pose(hip, torso=180, **kw):
    """Monta uma pose. Atalhos: nA=(x,y)/fA=(x,y) colocam o tornozelo; nH/fH colocam a mão (IK)."""
    p = dict(DEFAULT); p['hip'] = hip; p['torso'] = torso; p['nU'] = 5; p['nL'] = 5
    knee = kw.pop('knee', 'fwd'); fknee = kw.pop('fknee', knee); elbow = kw.pop('elbow', 'down'); felbow = kw.pop('felbow', elbow)
    tgt = {k: kw.pop(k) for k in ('nA', 'fA', 'nH', 'fH') if k in kw}
    p.update(kw)
    sh = add(hip, torso, L['torso'])
    if 'nA' in tgt: p['nT'], p['nS'] = ik(hip, tgt['nA'], L['thigh'], L['shin'], knee)
    if 'fA' in tgt: p['fT'], p['fS'] = ik(hip, tgt['fA'], L['thigh'], L['shin'], fknee)
    if 'nH' in tgt: p['nU'], p['nL'] = ik(sh, tgt['nH'], L['upper'], L['fore'], elbow)
    if 'fH' in tgt: p['fU'], p['fL'] = ik(sh, tgt['fH'], L['upper'], L['fore'], felbow)
    return p
