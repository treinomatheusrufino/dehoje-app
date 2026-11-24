"""Gera os SVGs do catálogo e um arquivo JSON para inserir no banco.
uso: python3 gerar.py [--preview DIR]"""
import json, os, re, sys, unicodedata
from boneco import render
import catalogo

def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

ROOT = os.path.join(os.path.dirname(__file__), '..', 'exercicios')
rows = []
seen = set()
for e in catalogo.E:
    sl = slug(e['name'])
    assert sl not in seen, sl; seen.add(sl)
    svg = render(e['name'], e['A'], e['B'], hl=e['hl'], props=e['props'], static=e['static'], **e['kw'])
    d = os.path.join(ROOT, e['folder']); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, sl + '.svg'), 'w').write(svg)
    # versões estáticas (pose A e pose B) para conferência visual
    if '--preview' in sys.argv:
        pv = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(pv, exist_ok=True)
        open(os.path.join(pv, sl + '__A.svg'), 'w').write(render(e['name'], e['A'], e['A'], hl=e['hl'], props=e['props'], static=e['static'], **e['kw']))
        open(os.path.join(pv, sl + '__B.svg'), 'w').write(render(e['name'], e['B'], e['B'], hl=e['hl'], props=e['props'], static=e['static'], **e['kw']))
    rows.append(dict(slug=sl, name=e['name'], muscle_group=e['group'], equip=e['equip'], image_path=f"exercicios/{e['folder']}/{sl}.svg",
                     how_to=e['how'], aliases=sorted(set([e['name']] + e['aliases']), key=str.lower)))
did = {'mobilidade': [], 'alongamento': []}
for e in catalogo.E:
    if e.get('secao'):
        sl = slug(e['name'])
        did[e['secao']].append(dict(nome=e['name'], img=f"exercicios/{e['folder']}/{sl}.svg", regiao=e['regiao'], dose=e['dose'], passos=e['passos']))
open(os.path.join(ROOT, '..', 'didatica_dados.js'), 'w').write('// gerado por tools/gerar.py — não editar à mão\nexport const DIDATICA = ' + json.dumps(did, ensure_ascii=False, indent=1) + ';\n')
print(len(did['mobilidade']), 'mobilidade,', len(did['alongamento']), 'alongamentos na Didática')
json.dump(rows, open(os.path.join(os.path.dirname(__file__), 'lote2.json'), 'w'), ensure_ascii=False, indent=1)
print(len(rows), 'exercícios gerados')
