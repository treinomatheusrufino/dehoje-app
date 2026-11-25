"""Desenhos dos cardios novos (lote 3): elíptico, spinning, bike horizontal, step e cama elástica.
uso: python3 cardio_novos.py [--preview DIR]"""
import os, sys
from boneco import render, pose

ROOT = os.path.join(os.path.dirname(__file__), '..', 'exercicios', '12-variacoes')

def eliptico_static():
    return [('linhas', [(26, 136), (34, 126), (122, 126), (130, 136)], 3),   # base
            ('linha', (122, 126), (124, 60), 3),                              # coluna frontal
            ('linhas', [(112, 50), (124, 60), (130, 54)], 3)]                 # alças

def bike_static(seat=(62, 94), bar=(108, 72)):
    return [('linha', (seat[0] - 9, seat[1]), (seat[0] + 9, seat[1]), 4),     # selim
            ('linha', seat, (78, 128), 2), ('linha', (78, 128), (112, 132), 2),
            ('linha', (112, 132), bar, 3), ('linha', (bar[0] - 4, bar[1]), (bar[0] + 8, bar[1]), 4),
            ('linhas', [(60, 136), (120, 136)], 3)]

def horizontal_static():
    return [('linhas', [(30, 104), (66, 104)], 4), ('linhas', [(32, 104), (24, 66)], 4),   # banco + encosto
            ('linha', (48, 104), (48, 136), 2), ('linha', (66, 110), (122, 116), 2), ('linha', (122, 116), (122, 136), 2)]

E = [
    dict(name='Cardio: elíptico (transport)', slug='cardio-eliptico', hl=['coxa', 'gluteo'],
         static=eliptico_static(),
         A=pose((76, 76), 184, nA=(92, 118), fA=(56, 124), nH=(112, 52), fH=(126, 58), fknee='fwd'),
         B=pose((78, 78), 176, nA=(58, 124), fA=(94, 118), nH=(124, 58), fH=(110, 52), fknee='fwd'), kw=dict(floor=False)),
    dict(name='Cardio: bike de spinning', slug='cardio-bike-spinning', hl=['coxa', 'gluteo'],
         static=bike_static(),
         A=pose((62, 90), 146, nA=(92, 126), fA=(74, 112), nH=(108, 70), fH=(104, 70)),
         B=pose((62, 90), 146, nA=(74, 112), fA=(92, 126), nH=(108, 70), fH=(104, 70)), kw=dict(floor=False)),
    dict(name='Cardio: bicicleta horizontal', slug='cardio-bike-horizontal', hl=['coxa'],
         static=horizontal_static(),
         A=pose((50, 100), 200, nA=(108, 108), fA=(96, 120), nH=(56, 104), knee='up', fknee='up'),
         B=pose((50, 100), 200, nA=(96, 120), fA=(108, 108), nH=(56, 104), knee='up', fknee='up'), kw=dict(floor=False)),
    dict(name='Cardio: step aeróbico', slug='cardio-step-aerobico', hl=['coxa', 'gluteo'],
         static=[('caixa', 84, 124, 14)],
         A=pose((72, 82), 180, nA=(96, 120), fA=(70, 134), knee='fwd', nU=-20, nL=40, fU=20, fL=-10),
         B=pose((98, 68), 180, nA=(100, 120), fA=(106, 118), nU=20, nL=-10, fU=-20, fL=40), kw=dict()),
    dict(name='Cardio: cama elástica (jump)', slug='cardio-cama-elastica', hl=['coxa', 'perna'],
         static=[('linhas', [(44, 128), (116, 128)], 4), ('linha', (50, 128), (46, 136), 2), ('linha', (110, 128), (114, 136), 2)],
         A=pose((80, 82), 176, nA=(92, 112), fA=(76, 126), nU=-30, nL=60, fU=30, fL=-20),
         B=pose((80, 82), 176, nA=(78, 126), fA=(94, 112), nU=30, nL=-20, fU=-30, fL=60), kw=dict(floor=False)),
]

if __name__ == '__main__':
    pv = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    for e in E:
        svg = render(e['name'], e['A'], e['B'], hl=e['hl'], static=e['static'], **e['kw'])
        open(os.path.join(ROOT, e['slug'] + '.svg'), 'w').write(svg)
        if pv:
            os.makedirs(pv, exist_ok=True)
            for k in 'AB':
                open(os.path.join(pv, f"{e['slug']}__{k}.svg"), 'w').write(render(e['name'], e[k], e[k], hl=e['hl'], static=e['static'], **e['kw']))
    print(len(E), 'desenhos gerados')
