"""Lote 3: mobilidade e alongamentos (aba Didática + biblioteca). Mesmo estilo de boneco animado."""
from catalogo import (E, ex, st, sq, hinge, lunge, split, plank, plank_elbow, supine, hook, prone, quad, sit, kneel,
                      half_kneel, hang, side_lying, up, shift, pose, place, X, FWD, OVER, DOWN, CHEST, MO)

AL = '18-alongamentos'
M = 'mobilidade'; A = 'alongamento'
MAT = [('colchonete', 20, 140)]

def mob(name, group, equip, Apose, Bpose, hl, regiao, dose, passos, **kw):
    ex(name, MO, group, equip, Apose, Bpose, hl, regiao=regiao, dose=dose, passos=passos, secao=M,
       how=' '.join(f'{i + 1}) {p}' for i, p in enumerate(passos)), **kw)

def along(name, group, equip, Apose, Bpose, hl, regiao, dose, passos, **kw):
    ex(name, AL, group, equip, Apose, Bpose, hl, regiao=regiao, dose=dose, passos=passos, secao=A,
       how=' '.join(f'{i + 1}) {p}' for i, p in enumerate(passos)), **kw)

# ============================================================== MOBILIDADE
gq = 'Mobilidade — Quadril'
mob('Balanço de perna frente e trás', gq, 'peso-do-corpo', st(hip=(76, 82), nT=55, nS=40, nU=-20, nL=20, fU=60, fL=60), st(hip=(76, 82), nT=-30, nS=-30, nU=-20, nL=20, fU=60, fL=60), ['coxa', 'gluteo'],
    'Quadril', '10 a 15 balanços por perna', ['Apoie uma mão na parede e fique em pé sobre uma perna.', 'Balance a outra perna para a frente e para trás, solta e controlada.', 'Aumente a amplitude aos poucos, sem forçar a lombar.'], aliases=['leg swing', 'balanco de perna', 'pendulo de perna'], static=[('parede', 128)])
mob('Círculos de quadril em pé', gq, 'peso-do-corpo', st(hip=(78, 82), nT=90, nS=0, nU=-20, nL=30), st(hip=(78, 82), nT=20, nS=-80, nU=-20, nL=30), ['gluteo', 'coxa'],
    'Quadril', '6 a 8 círculos para cada lado', ['Em pé, apoie uma mão na parede.', 'Suba o joelho até a altura do quadril.', 'Abra o joelho para o lado e leve para trás desenhando um círculo grande. Depois inverta o sentido.'], aliases=['hip circles', 'circulo de quadril', 'abrir e fechar o portao'], static=[('parede', 120)])
mob('Rotação de quadril sentado (limpador de para-brisa)', gq, 'colchonete', pose((60, 130), 200, nA=(98, 132), fA=(98, 132), knee='up', nH=(40, 134)), pose((60, 130), 200, nT=70, nS=100, fT=70, fS=100, nF=200, fF=200, nH=(40, 134)), ['gluteo', 'coxa'],
    'Quadril', '8 a 10 para cada lado', ['Sente com os joelhos dobrados e os pés afastados, mãos apoiadas atrás.', 'Deixe os dois joelhos caírem para um lado, devagar.', 'Volte ao centro e leve para o outro lado.'], aliases=['windshield wipers', 'limpador de parabrisa', 'rotacao de quadril sentado'], static=MAT)
mob('Balanço para trás em quatro apoios (rock back)', gq, 'colchonete', quad(), pose((50, 124), 110, nT=-60, nS=-90, fT=-60, fS=-90, nF=-90, fF=-90, nH=(98, 134)), ['gluteo', 'lombar'],
    'Quadril', '10 repetições lentas', ['Fique em quatro apoios, mãos embaixo dos ombros e joelhos embaixo do quadril.', 'Leve o quadril para trás em direção aos calcanhares, mantendo a coluna longa.', 'Volte à posição inicial sem arredondar as costas.'], aliases=['rock back', 'quadrupede rock back', 'balanco em quatro apoios'], static=MAT)
mob('Sapo em quatro apoios (frog rock)', gq, 'colchonete', pose((62, 112), 104, nT=0, nS=-90, fT=0, fS=-90, nF=-90, fF=-90, nU=0, nL=90), pose((50, 116), 100, nT=-40, nS=-90, fT=-40, fS=-90, nF=-90, fF=-90, nU=0, nL=90), ['coxa', 'gluteo'],
    'Quadril', '8 a 10 repetições', ['Apoie os antebraços no chão e afaste bem os joelhos, com os pés para fora.', 'Leve o quadril para trás até sentir a parte interna da coxa.', 'Volte devagar. Não force o joelho.'], aliases=['frog rock', 'sapo', 'mobilidade de adutor em quatro apoios'], static=MAT)
mob('Avanço do homem-aranha (spiderman lunge)', gq, 'colchonete', plank(hx=118), lunge(front=(108, 134), back=(36, 130), hip=(74, 112), torso=118, nH=(112, 134)), ['coxa_f', 'gluteo', 'core'],
    'Quadril', '5 a 6 por lado, segurando 3 s embaixo', ['Comece em prancha alta.', 'Leve um pé para fora da mão, do mesmo lado.', 'Afunde o quadril e aproxime o cotovelo do pé. Volte e troque de lado.'], aliases=['spiderman lunge', 'homem aranha', 'avanco do homem aranha'], static=MAT)
mob('Joelho ao peito caminhando', gq, 'peso-do-corpo', st(), pose((X, 82), 180, nA=(X, 134), fT=200, fS=60, nU=40, nL=170), ['gluteo_f', 'lombar'],
    'Quadril', '10 passos, alternando as pernas', ['Dê um passo e suba o joelho de trás em direção ao peito.', 'Abrace a canela e puxe por 2 segundos, ficando alto na perna de apoio.', 'Solte, dê outro passo e troque de perna.'], aliases=['knee hug', 'abraco de joelho', 'joelho no peito caminhando'])
mob('Chute com perna estendida caminhando (frankenstein)', gq, 'peso-do-corpo', st(nU=100, nL=100), pose((X, 82), 180, nA=(X, 134), fT=100, fS=100, fF=190, nU=100, nL=100), ['coxa_f'],
    'Quadril', '10 passos, alternando', ['Estique um braço à frente na altura do ombro.', 'Chute a perna oposta estendida tentando tocar a mão.', 'Mantenha o tronco ereto e alterne a cada passo.'], aliases=['frankenstein walk', 'chute de soldado', 'toy soldier'])
mob('Agachamento sumô com abertura (prying squat)', gq, 'peso-do-corpo', sq(1.2, torso=168, foot=(86, 134), **CHEST), sq(1.2, torso=176, foot=(86, 134), nU=10, nL=150), ['coxa', 'gluteo'],
    'Quadril', '30 a 45 s, mexendo devagar', ['Desça em um agachamento profundo com os pés um pouco afastados.', 'Use os cotovelos para empurrar os joelhos para fora.', 'Balance o peso de um lado para o outro, com calma.'], aliases=['prying squat', 'agachamento com abertura', 'goblet prying'])
mob('Escorpião deitado de bruços', gq, 'colchonete', prone(nU=-90, nL=-90), prone(nT=-90, nS=-180, fT=-90, fS=-90, nU=-90, nL=-90), ['coxa', 'lombar'],
    'Quadril', '6 a 8 por lado', ['Deite de bruços com os braços abertos para os lados.', 'Leve o calcanhar de uma perna em direção à mão oposta, girando o quadril.', 'Ombros ficam no chão. Volte e troque.'], aliases=['scorpion', 'escorpiao', 'escorpiao deitado'], static=MAT)
mob('Dobradiça de quadril com bastão', gq, 'bastao', st(nU=-150, nL=-170), hinge(t=100, hip=(68, 84), nU=-150, nL=-170), ['coxa', 'gluteo', 'lombar'],
    'Quadril', '10 repetições', ['Segure um bastão nas costas tocando cabeça, meio das costas e quadril.', 'Empurre o quadril para trás inclinando o tronco, sem perder os três pontos de contato.', 'Volte apertando o glúteo. É o movimento base do terra.'], aliases=['hip hinge', 'dobradica de quadril', 'hip hinge com bastao'], props=[('bastao', {'at': 'sh', 'off': (-4, 0)})])

gc = 'Mobilidade — Coluna e torácica'
mob('Rotação torácica em quatro apoios (mão na nuca)', gc, 'colchonete', quad(nU=10, nL=150), quad(torso=114, nU=160, nL=200), ['costas'],
    'Coluna', '8 a 10 por lado', ['Em quatro apoios, coloque uma mão atrás da cabeça.', 'Leve o cotovelo em direção ao braço de apoio.', 'Gire abrindo o cotovelo para o teto, seguindo com o olhar.'], aliases=['rotacao toracica em quatro apoios', 'thoracic rotation', 'cotovelo ao teto'], static=MAT)
mob('Extensão torácica no rolo', gc, 'rolo', pose((90, 124), -90, nA=(118, 132), fA=(118, 132), knee='up', nU=-150, nL=-20), pose((90, 124), -112, nA=(118, 132), fA=(118, 132), knee='up', nU=-150, nL=-20), ['costas'],
    'Coluna', '8 a 10 extensões, em 2 ou 3 alturas', ['Deite com o rolo atravessado embaixo do meio das costas, mãos atrás da cabeça.', 'Deixe a parte de cima das costas descer sobre o rolo, sem arquear a lombar.', 'Suba e mude o rolo um pouco de lugar.'], aliases=['extensao toracica no rolo', 'foam roller toracica', 'rolo na toracica'], static=[('rolo', (70, 127))])
mob('Extensão torácica sentado na cadeira', gc, 'cadeira', pose((X, 98), 180, nT=90, nS=0, fT=90, fS=0, nU=150, nL=-30), pose((X, 98), 205, nT=90, nS=0, fT=90, fS=0, nU=170, nL=-10), ['costas'],
    'Coluna', '8 a 10 repetições', ['Sente com as mãos atrás da cabeça e o encosto na altura do meio das costas.', 'Incline a parte de cima das costas para trás sobre o encosto.', 'Volte devagar. Ótimo para quem passa o dia sentado.'], aliases=['extensao toracica na cadeira', 'mobilidade toracica sentado'], static=[('cadeira', 80, 100)])
mob('Flexão e extensão da coluna sentado', gc, 'peso-do-corpo', pose((X, 98), 160, nT=90, nS=0, fT=90, fS=0, nU=60, nL=0), pose((X, 98), 190, nT=90, nS=0, fT=90, fS=0, nU=40, nL=-20), ['costas', 'lombar'],
    'Coluna', '10 repetições lentas', ['Sente na beira da cadeira com as mãos nos joelhos.', 'Arredonde as costas olhando para o umbigo.', 'Depois estufe o peito e olhe para a frente. Respire junto com o movimento.'], aliases=['gato camelo sentado', 'cat cow sentado'], static=[('cadeira', 80, 100)])
mob('Respiração do crocodilo', gc, 'colchonete', prone(nU=150, nL=-150), prone(torso=88, nU=150, nL=-150), ['core', 'lombar'],
    'Coluna', '5 a 8 respirações profundas', ['Deite de bruços com a testa apoiada nas mãos.', 'Puxe o ar pelo nariz enchendo a barriga e as costas contra o chão.', 'Solte o ar devagar pela boca, relaxando.'], aliases=['crocodile breathing', 'respiracao crocodilo'], static=MAT)
mob('Avanço com rotação de tronco', gc, 'peso-do-corpo', lunge(**FWD), lunge(nU=150, nL=150, fU=-30, fL=-30), ['costas', 'coxa', 'core'],
    'Coluna', '6 por lado', ['Dê um passo à frente e desça no avanço.', 'Com os braços à frente, gire o tronco para o lado da perna da frente.', 'Volte ao centro, levante e troque de perna.'], aliases=['lunge com rotacao', 'avanco com giro', 'lunge twist'])
mob('Agachamento profundo com rotação torácica', gc, 'peso-do-corpo', sq(1.25, torso=168, foot=(86, 134), nU=0, nL=0), sq(1.25, torso=172, foot=(86, 134), nU=175, nL=175), ['costas', 'coxa'],
    'Coluna', '5 por lado', ['Desça em agachamento profundo e apoie uma mão no chão.', 'Gire o tronco e leve o outro braço para o teto.', 'Siga a mão com o olhar e troque de lado.'], aliases=['deep squat rotation', 'agachamento com rotacao'])
mob('Rotação de tronco em pé com bastão', gc, 'bastao', st(nU=-150, nL=-170), st(nU=-130, nL=-150, torso=184), ['core', 'costas'],
    'Coluna', '10 para cada lado', ['Apoie um bastão nos ombros atrás do pescoço.', 'Com o quadril parado, gire o tronco para um lado e para o outro.', 'Faça devagar, sem dar trancos.'], aliases=['rotacao com bastao', 'torcao com cabo de vassoura'], props=[('bastao', {'at': 'sh', 'off': (-4, -2)})])

go = 'Mobilidade — Ombros'
mob('Círculos de braço', go, 'peso-do-corpo', st(nU=10, nL=10), st(nU=175, nL=175), ['ombro'],
    'Ombros', '10 para a frente e 10 para trás', ['Em pé, braços estendidos ao lado do corpo.', 'Desenhe círculos grandes com os braços, passando perto das orelhas.', 'Depois inverta o sentido.'], aliases=['arm circles', 'circulos de braco', 'rotacao de bracos'])
mob('Deslizamento na parede (wall slide)', go, 'parede', pose((62, 84), 180, nA=(70, 134), fA=(70, 134), nU=170, nL=10, head=180), pose((62, 84), 180, nA=(70, 134), fA=(70, 134), nU=-170, nL=-178), ['ombro', 'costas'],
    'Ombros', '10 repetições lentas', ['Encoste costas, cabeça e braços na parede, cotovelos dobrados em W.', 'Deslize os braços para cima até formar um Y, sem desencostar.', 'Desça devagar contraindo as escápulas.'], aliases=['wall slide', 'deslizamento na parede', 'anjo na parede'], static=[('parede', 52)])
mob('Passagem de bastão (shoulder dislocate)', go, 'bastao', st(nU=40, nL=40), st(nU=-150, nL=-150), ['ombro', 'peito'],
    'Ombros', '10 repetições', ['Segure um bastão ou cabo de vassoura com as mãos bem afastadas.', 'Com os braços estendidos, leve o bastão por cima da cabeça até atrás do corpo.', 'Volte pelo mesmo caminho. Afaste mais as mãos se sentir dor.'], aliases=['shoulder dislocate', 'passagem de bastao', 'pass through'], props=[('bastao',)])
mob('Anjos no chão', go, 'colchonete', hook(nU=-30, nL=-170), hook(nU=-90, nL=-90), ['ombro', 'costas'],
    'Ombros', '10 repetições', ['Deite de costas com os joelhos dobrados e os braços em W no chão.', 'Deslize os braços acima da cabeça sem tirar do chão.', 'Volte ao W apertando as escápulas.'], aliases=['floor angels', 'anjos no chao', 'snow angels'], static=MAT)
mob('Flexão escapular (scapular push-up)', go, 'colchonete', plank(hx=112, torso=111, legs=-69), plank(hx=112), ['peito', 'ombro'],
    'Ombros', '10 a 12 repetições', ['Fique em prancha alta com os braços esticados.', 'Sem dobrar os cotovelos, deixe o peito descer entre as escápulas.', 'Empurre o chão afastando as escápulas e arredondando um pouco as costas.'], aliases=['scapular push up', 'flexao escapular', 'push up plus'], static=MAT)
mob('Ativação escapular na barra (scapular pull-up)', go, 'barra-fixa', hang(nT=10, nS=-50, fT=10, fS=-50), place(pose((0, 0), 180, nT=10, nS=-50, fT=10, fS=-50, nU=178, nL=178), 'nH', (X, 20)), ['costas', 'trapezio'],
    'Ombros', '8 a 10 repetições', ['Pendure-se na barra com os braços esticados.', 'Sem dobrar os cotovelos, puxe os ombros para baixo e para trás.', 'Solte devagar até voltar a ficar pendurado.'], aliases=['scapular pull up', 'escapula na barra', 'ativacao escapular'], static=[('barra_fixa', 50, 112, 16)])
mob('Rotação de ombro deitado (sleeper)', go, 'colchonete', side_lying(nU=90, nL=180), side_lying(nU=90, nL=110), ['ombro'],
    'Ombros', '30 s cada lado', ['Deite de lado com o braço de baixo à frente, cotovelo dobrado a 90 graus.', 'Com a outra mão, empurre o punho em direção ao chão, devagar.', 'Pare quando sentir a parte de trás do ombro alongar.'], aliases=['sleeper stretch', 'alongamento do dorminhoco', 'rotacao interna deitado'], static=MAT)

gt = 'Mobilidade — Tornozelo, punho e pescoço'
mob('Mobilidade de tornozelo meio ajoelhado', gt, 'colchonete', half_kneel(nU=40, nL=100), half_kneel(hip=(86, 110), nA=(108, 134), nU=40, nL=100), ['perna'],
    'Tornozelo', '10 a 15 por lado', ['Fique meio ajoelhado com o pé da frente inteiro no chão.', 'Leve o joelho da frente à frente, passando da ponta do pé, sem tirar o calcanhar.', 'Volte e repita.'], aliases=['ankle rock', 'mobilidade de tornozelo ajoelhado'], static=MAT)
mob('Círculos de tornozelo sentado', gt, 'peso-do-corpo', sit(nF=150, nU=-30, nL=-10), sit(nF=210, nU=-30, nL=-10), ['perna'],
    'Tornozelo', '10 para cada lado', ['Sente com as pernas estendidas.', 'Desenhe círculos grandes com a ponta dos pés.', 'Inverta o sentido na metade.'], aliases=['circulos de tornozelo', 'ankle circles'], static=MAT)
mob('Mobilidade de punho em quatro apoios', gt, 'colchonete', quad(), quad(hip=(70, 108), torso=116), ['antebraco'],
    'Punho', '10 balanços', ['Em quatro apoios, mãos embaixo dos ombros e dedos para a frente.', 'Leve o peso do corpo para a frente sobre as mãos, sem tirar a palma do chão.', 'Volte. Depois repita com os dedos virados para os joelhos.'], aliases=['mobilidade de punho', 'wrist rock', 'aquecimento de punho'], static=MAT)
mob('Mobilidade de pescoço (sim com a cabeça)', gt, 'peso-do-corpo', st(head=160), st(head=205), ['trapezio'],
    'Pescoço', '6 a 8 repetições lentas', ['Em pé ou sentado, ombros relaxados.', 'Leve o queixo em direção ao peito, devagar.', 'Depois olhe para o teto sem jogar a cabeça. Nunca force.'], aliases=['mobilidade de pescoco', 'mobilidade cervical'])

# ============================================================== ALONGAMENTOS
gp = 'Alongamento — Pernas'
along('Alongamento de quadríceps em pé', gp, 'peso-do-corpo', st(nT=-5, nS=-165, nU=-30, nL=-60, fU=60, fL=60), st(nT=-8, nS=-170, nU=-30, nL=-60, fU=60, fL=60), ['coxa'],
      'Coxas', '30 s cada perna', ['Em pé, apoie uma mão na parede.', 'Dobre um joelho e segure o pé atrás, levando o calcanhar ao glúteo.', 'Mantenha os joelhos juntos e o quadril encaixado.'], aliases=['alongamento de quadriceps', 'quadriceps em pe'], static=[('parede', 128)])
along('Alongamento de quadríceps deitado de lado', gp, 'colchonete', side_lying(nT=86, nS=-150, nF=-60, nU=-40, nL=-60), side_lying(nT=82, nS=-156, nF=-66, nU=-40, nL=-60), ['coxa'],
      'Coxas', '30 s cada perna', ['Deite de lado com a cabeça apoiada no braço.', 'Dobre o joelho de cima e segure o pé atrás.', 'Leve o joelho um pouco para trás até sentir a frente da coxa.'], aliases=['quadriceps deitado de lado'], static=MAT)
along('Alongamento de quadríceps no sofá (couch stretch)', gp, 'parede', pose((64, 108), 180, nA=(90, 134), fT=-10, fS=170, fF=270), pose((66, 108), 186, nA=(92, 134), fT=-12, fS=172, fF=270), ['coxa_f'],
      'Coxas', '45 s a 1 min cada perna', ['Ajoelhe de costas para a parede ou sofá e apoie o peito do pé de trás nela.', 'Coloque o outro pé à frente, como no avanço.', 'Suba o tronco e contraia o glúteo da perna de trás.'], aliases=['couch stretch', 'alongamento no sofa', 'quadriceps ajoelhado na parede'], static=[('parede', 40)])
along('Alongamento de posteriores sentado', gp, 'colchonete', sit(torso=150, nU=100, nL=100), sit(torso=126, nU=95, nL=95), ['coxa', 'lombar'],
      'Coxas', '30 a 45 s', ['Sente com as pernas estendidas e unidas.', 'Incline o tronco à frente a partir do quadril, levando as mãos aos pés.', 'Mantenha a coluna longa em vez de arredondar.'], aliases=['alongamento de posterior sentado', 'sentar e alcancar'], static=MAT)
along('Alongamento de posteriores deitado com faixa', gp, 'faixa', supine(nT=170, nS=170, fT=90, fS=90, nF=250, nU=160, nL=160), supine(nT=178, nS=178, fT=90, fS=90, nF=260, nU=165, nL=165), ['coxa'],
      'Coxas', '30 a 45 s cada perna', ['Deite de costas e passe uma faixa ou toalha na sola do pé.', 'Eleve a perna estendida segurando as pontas da faixa.', 'A outra perna fica estendida no chão.'], aliases=['posterior com faixa', 'alongamento com toalha'], props=[('liga', {'b': 'nT'})], static=MAT)
along('Alongamento de posteriores com pé no banco', gp, 'banco', pose((72, 82), 180, nA=(72, 134), fA=(110, 104), fknee='fwd', nU=10, nL=10), pose((70, 82), 120, nA=(72, 134), fT=92, fS=92, fF=180, nU=90, nL=90), ['coxa_f'],
      'Coxas', '30 s cada perna', ['Apoie o calcanhar em um banco baixo com a perna estendida.', 'Incline o tronco à frente com a coluna reta.', 'Sinta atrás da coxa, sem dor no joelho.'], aliases=['posterior no banco', 'alongamento de isquiotibiais no banco'], static=[('banco', 104, 128, 106)])
along('Alongamento de panturrilha na parede', gp, 'parede', split(front=(104, 134), back=(56, 134), hip=(84, 88), torso=158, nH=(124, 70)), split(front=(104, 134), back=(52, 134), hip=(84, 90), torso=155, nH=(124, 70)), ['perna_f'],
      'Pernas', '30 s cada perna', ['Apoie as mãos na parede e dê um passo grande para trás.', 'Mantenha o calcanhar de trás no chão e o joelho esticado.', 'Dobre o joelho da frente até sentir a panturrilha de trás.'], aliases=['panturrilha na parede', 'alongamento de gastrocnemio'], static=[('parede', 128)])
along('Alongamento de panturrilha no degrau', gp, 'degrau', pose((X, 76), 180, nA=(X, 128), fA=(X, 128), nF=60, fF=60, nU=40, nL=90), pose((X, 80), 180, nA=(X, 132), fA=(X, 132), nF=120, fF=120, nU=40, nL=90), ['perna'],
      'Pernas', '30 s', ['Fique com a ponta dos pés na borda de um degrau.', 'Deixe os calcanhares descerem abaixo da linha do degrau.', 'Segure em algo para ter equilíbrio.'], aliases=['panturrilha no degrau', 'calcanhar abaixo do degrau'], static=[('caixa', 70, 92, 6)])
along('Alongamento de sóleo na parede', gp, 'parede', split(front=(104, 134), back=(66, 134), hip=(86, 98), torso=170, nH=(124, 76)), split(front=(104, 134), back=(66, 134), hip=(88, 100), torso=170, nH=(124, 76)), ['perna_f'],
      'Pernas', '30 s cada perna', ['Na mesma posição do alongamento de panturrilha, com o passo mais curto.', 'Dobre os dois joelhos mantendo o calcanhar de trás no chão.', 'Sinta mais embaixo, perto do tendão de Aquiles.'], aliases=['soleo na parede', 'alongamento de soleo'], static=[('parede', 128)])
along('Borboleta sentado (adutores)', gp, 'colchonete', pose((60, 130), 178, nT=60, nS=150, fT=60, fS=150, nF=100, fF=100, nH=(84, 128)), pose((60, 130), 150, nT=74, nS=160, fT=74, fS=160, nF=100, fF=100, nH=(84, 128)), ['coxa'],
      'Coxas', '30 a 45 s', ['Sente e junte as solas dos pés, com os joelhos abertos.', 'Segure os pés e mantenha a coluna alta.', 'Incline o tronco à frente devagar ou empurre os joelhos com os cotovelos.'], aliases=['borboleta', 'butterfly stretch', 'alongamento de adutores sentado'], static=MAT)
along('Pombo (alongamento de glúteo)', gp, 'colchonete', pose((70, 120), 165, nT=90, nS=-110, fT=-90, fS=-90, nF=-30, fF=0, nH=(98, 134)), pose((70, 120), 110, nT=90, nS=-110, fT=-90, fS=-90, nF=-30, fF=0, nU=90, nL=90), ['gluteo'],
      'Glúteos', '45 s a 1 min cada lado', ['Dobre uma perna à frente com a canela atravessada e estenda a outra para trás.', 'Mantenha o quadril alinhado e apoie as mãos.', 'Incline o tronco sobre a perna da frente, respirando fundo.'], aliases=['pigeon', 'pombo', 'pombo de yoga'], static=MAT)
along('Glúteo em figura 4 deitado', gp, 'colchonete', hook(fA=(116, 132), nT=150, nS=-20, nU=150, nL=200), pose((84, 126), -90, fT=200, fS=95, nT=180, nS=-90, nU=150, nL=200), ['gluteo'],
      'Glúteos', '30 a 45 s cada lado', ['Deite de costas com os joelhos dobrados.', 'Cruze um tornozelo sobre o joelho oposto, formando um 4.', 'Segure atrás da coxa de baixo e puxe em direção ao peito.'], aliases=['figura 4', 'alongamento de piriforme', 'piriforme deitado'], static=MAT)
along('Glúteo em figura 4 sentado na cadeira', gp, 'cadeira', pose((X, 98), 180, nT=90, nS=0, fT=90, fS=0, nU=40, nL=80), pose((X, 98), 140, nT=90, nS=0, fT=90, fS=0, nU=40, nL=80), ['gluteo'],
      'Glúteos', '30 s cada lado', ['Sente e apoie um tornozelo sobre o joelho oposto.', 'Mantenha a coluna reta.', 'Incline o tronco à frente até sentir o glúteo.'], aliases=['figura 4 sentado', 'piriforme sentado'], static=[('cadeira', 80, 100)])
along('Flexor do quadril em pé (afundo)', gp, 'peso-do-corpo', split(front=(108, 134), back=(46, 134), hip=(80, 96), nU=-20, nL=30), split(front=(110, 134), back=(44, 132), hip=(86, 100), torso=184, nU=175, nL=175), ['coxa_f'],
      'Quadril', '30 s cada lado', ['Dê um passo grande à frente, com o calcanhar de trás levantado.', 'Encaixe o quadril, contraia o glúteo de trás e leve o corpo à frente.', 'Para alongar mais, suba o braço do lado da perna de trás.'], aliases=['psoas em pe', 'flexor de quadril em pe', 'alongamento de iliopsoas'])
along('Joelho ao peito deitado', gp, 'colchonete', supine(nT=90, nS=90, fT=90, fS=90, nU=90, nL=90), supine(nT=205, nS=80, fT=90, fS=90, nU=150, nL=200), ['gluteo', 'lombar'],
      'Lombar', '30 s cada perna', ['Deite de costas com as pernas estendidas.', 'Puxe um joelho em direção ao peito com as duas mãos.', 'Relaxe a lombar no chão e troque de perna.'], aliases=['joelho ao peito', 'knee to chest', 'alongamento de lombar deitado'], static=MAT)
along('Tibial ajoelhado (sentar sobre os pés)', gp, 'colchonete', kneel(nU=0, nL=0), pose((64, 124), 186, nT=90, nS=-90, fT=90, fS=-90, nF=-90, fF=-90, nH=(46, 134)), ['perna'],
      'Pernas', '30 s', ['Ajoelhe com o peito dos pés no chão.', 'Sente sobre os calcanhares.', 'Para intensificar, apoie as mãos atrás e levante um pouco os joelhos.'], aliases=['alongamento de tibial', 'sentar nos calcanhares'], static=MAT)

gtr = 'Alongamento — Tronco e costas'
along('Torção de coluna deitado', gtr, 'colchonete', hook(nU=-90, nL=-90), pose((84, 126), -90, nT=150, nS=100, fT=140, fS=100, nF=190, fF=190, nU=-90, nL=-90), ['costas', 'gluteo'],
      'Coluna', '30 a 45 s cada lado', ['Deite de costas com os braços abertos.', 'Dobre os joelhos e deixe-os cair para um lado.', 'Mantenha os ombros no chão e olhe para o lado oposto.'], aliases=['torcao deitado', 'supine twist', 'rotacao de lombar deitado'], static=MAT)
along('Esfinge (extensão em antebraços)', gtr, 'colchonete', prone(nU=150, nL=-150), prone(torso=108, nU=0, nL=90), ['core', 'lombar'],
      'Coluna', '30 s, 2 a 3 vezes', ['Deite de bruços.', 'Apoie os antebraços no chão com os cotovelos embaixo dos ombros.', 'Levante o peito e relaxe a lombar e o glúteo.'], aliases=['esfinge', 'sphinx', 'postura da esfinge'], static=MAT)
along('Filhote (puppy pose)', gtr, 'colchonete', quad(), pose((62, 108), 60, nT=0, nS=-90, fT=0, fS=-90, nF=-90, fF=-90, nU=88, nL=88), ['costas', 'ombro'],
      'Costas', '30 a 45 s', ['Em quatro apoios, caminhe com as mãos à frente.', 'Mantenha o quadril em cima dos joelhos e desça o peito em direção ao chão.', 'Respire sentindo as costas e os ombros.'], aliases=['puppy pose', 'filhote', 'alongamento de dorsal no chao'], static=MAT)
along('Dorsal no banco ajoelhado', gtr, 'banco', kneel(hip=(60, 108), torso=120, nH=(110, 104)), kneel(hip=(56, 112), torso=96, nU=95, nL=95), ['costas', 'braco'],
      'Costas', '30 a 45 s', ['Ajoelhe de frente para um banco e apoie os cotovelos nele.', 'Leve o quadril para trás deixando o peito descer.', 'Para soltar mais, junte as mãos atrás da cabeça.'], aliases=['alongamento de dorsal no banco', 'lat stretch'], static=[('banco', 104, 136, 106)])
along('Postura do bebê feliz', gtr, 'colchonete', supine(nT=200, nS=150, fT=200, fS=150, nF=240, fF=240, nU=150, nL=180), supine(nT=210, nS=160, fT=210, fS=160, nF=250, fF=250, nU=155, nL=185), ['gluteo', 'coxa', 'lombar'],
      'Quadril', '30 a 45 s', ['Deite de costas e traga os joelhos em direção às axilas.', 'Segure a parte de fora dos pés com as solas viradas para o teto.', 'Balance devagar de um lado para o outro.'], aliases=['happy baby', 'bebe feliz'], static=MAT)
along('Espreguiçar deitado (alongamento global)', gtr, 'colchonete', supine(nU=90, nL=90), supine(nU=-90, nL=-90, nF=170, fF=170), ['tronco', 'ombro'],
      'Corpo todo', '3 a 5 respirações', ['Deite de costas e estique os braços acima da cabeça.', 'Estenda as pernas e aponte os pés.', 'Cresça para os dois lados ao mesmo tempo enquanto solta o ar.'], aliases=['espreguicar', 'alongamento global deitado'], static=MAT)
along('Espreguiçar em pé (braços acima)', gtr, 'peso-do-corpo', st(nU=5, nL=5), st(hip=(X, 78), nU=176, nL=176, nF=60, fF=60, nA=(X, 130), fA=(X, 130)), ['tronco', 'ombro'],
      'Corpo todo', '3 a 5 respirações', ['Em pé, entrelace os dedos.', 'Leve os braços acima da cabeça e suba na ponta dos pés.', 'Cresça o máximo que puder respirando fundo.'], aliases=['espreguicar em pe', 'alongamento em pe bracos acima'])

gbr = 'Alongamento — Ombros, braços e pescoço'
along('Alongamento de peitoral na parede', gbr, 'parede', st(hip=(88, 82), nU=-80, nL=-80), st(hip=(92, 82), torso=184, nU=-90, nL=-90), ['peito', 'ombro'],
      'Peito', '30 s cada braço', ['Fique de lado para a parede e apoie a palma com o braço estendido na altura do ombro.', 'Gire o corpo para o lado contrário da parede.', 'Sinta a frente do peito e do ombro.'], aliases=['peitoral na parede', 'alongamento de peito na parede'], static=[('parede', 44)])
along('Peitoral com mãos entrelaçadas atrás', gbr, 'peso-do-corpo', st(nU=-20, nL=-20), st(nU=-50, nL=-50, torso=184), ['peito', 'ombro'],
      'Peito', '20 a 30 s', ['Em pé, entrelace os dedos atrás do corpo.', 'Estique os braços e afaste as mãos das costas.', 'Abra o peito sem arquear a lombar.'], aliases=['peitoral com maos atras', 'abertura de peito'])
along('Ombro cruzado à frente do peito', gbr, 'peso-do-corpo', st(nU=90, nL=90, fU=40, fL=120), st(nU=95, nL=95, fU=50, fL=130), ['ombro'],
      'Ombros', '30 s cada braço', ['Leve um braço estendido atravessando a frente do peito.', 'Com a outra mão, puxe o cotovelo em direção ao corpo.', 'Ombro baixo, longe da orelha.'], aliases=['ombro cruzado', 'alongamento de deltoide posterior'])
along('Tríceps acima da cabeça', gbr, 'peso-do-corpo', st(nU=170, nL=-10), st(nU=180, nL=-5), ['braco'],
      'Braços', '30 s cada braço', ['Leve um braço para cima e dobre o cotovelo, com a mão nas costas.', 'Com a outra mão, empurre o cotovelo para trás.', 'Mantenha a cabeça reta.'], aliases=['alongamento de triceps', 'triceps acima da cabeca'])
along('Bíceps na parede', gbr, 'parede', st(hip=(66, 82), nU=-30, nL=-30), st(hip=(62, 82), torso=178, nU=-40, nL=-40), ['braco', 'ombro'],
      'Braços', '30 s cada braço', ['De costas para a parede, apoie a palma nela com o braço estendido abaixo do ombro.', 'Gire o corpo devagar para longe da parede.', 'Sinta a frente do braço.'], aliases=['alongamento de biceps', 'biceps na parede'], static=[('parede', 40)])
along('Flexores do antebraço', gbr, 'peso-do-corpo', st(nU=90, nL=90, fU=60, fL=100), st(nU=90, nL=92, fU=64, fL=104), ['antebraco'],
      'Braços', '20 a 30 s cada lado', ['Estique um braço à frente com a palma para cima.', 'Com a outra mão, puxe os dedos para baixo e para trás.', 'Mantenha o cotovelo esticado.'], aliases=['alongamento de antebraco', 'flexores do punho'])
along('Extensores do antebraço', gbr, 'peso-do-corpo', st(nU=90, nL=90, fU=60, fL=100), st(nU=90, nL=88, fU=64, fL=104), ['antebraco'],
      'Braços', '20 a 30 s cada lado', ['Estique um braço à frente com a palma para baixo.', 'Com a outra mão, dobre o punho puxando os dedos para baixo.', 'Ótimo para quem usa muito o computador ou celular.'], aliases=['extensores do punho', 'alongamento de punho'])
along('Pescoço: queixo ao peito', gbr, 'peso-do-corpo', st(head=168, nU=150, nL=210), st(head=150, nU=160, nL=220), ['trapezio'],
      'Pescoço', '20 a 30 s', ['Sente ou fique em pé com os ombros relaxados.', 'Entrelace as mãos atrás da cabeça e deixe o peso delas puxar o queixo ao peito.', 'Não empurre: só deixe o peso agir.'], aliases=['alongamento de pescoco', 'cervical queixo ao peito'])


# ---------- exercícios de mobilidade/alongamento que já existiam no lote 2: entram na Didática
EXTRA = {
 'Inchworm (lagarta)': (M, 'Corpo todo', '6 a 8 repetições', ['Em pé, incline o tronco e apoie as mãos no chão, dobrando os joelhos se precisar.', 'Caminhe com as mãos à frente até a prancha.', 'Volte caminhando com as mãos e suba devagar.']),
 'Agachamento profundo com mobilidade': (M, 'Quadril', '30 a 60 s', ['Desça no agachamento mais profundo que conseguir com os calcanhares no chão.', 'Mantenha o peito aberto e as mãos juntas à frente.', 'Mexa o quadril de um lado para o outro, com calma.']),
 "World's greatest stretch": (M, 'Corpo todo', '4 a 5 por lado', ['Dê um passo grande à frente e apoie as mãos no chão.', 'Leve o cotovelo para perto do pé da frente.', 'Gire o tronco abrindo o braço para o teto e troque de lado.']),
 'Mobilidade torácica em quatro apoios (thread the needle)': (M, 'Coluna', '6 a 8 por lado', ['Em quatro apoios, passe um braço por baixo do corpo.', 'Deixe o ombro e a cabeça descerem até o chão.', 'Volte abrindo o braço para o teto.']),
 'Livro aberto (open book) deitado de lado': (M, 'Coluna', '8 a 10 por lado', ['Deite de lado com os joelhos dobrados à frente e os braços estendidos juntos.', 'Abra o braço de cima por cima do corpo até o outro lado.', 'Joelhos ficam juntos. Siga a mão com o olhar.']),
 '90/90 de quadril': (M, 'Quadril', '6 a 8 trocas', ['Sente com as duas pernas dobradas a 90 graus, uma à frente e outra ao lado.', 'Mantenha o tronco alto e incline à frente sobre a perna da frente.', 'Gire os joelhos para o outro lado e repita.']),
 'Mobilidade de tornozelo (joelho à parede)': (M, 'Tornozelo', '10 a 15 por lado', ['Fique de frente para a parede com um pé a alguns centímetros dela.', 'Leve o joelho até tocar a parede sem tirar o calcanhar do chão.', 'Afaste o pé aos poucos para progredir.']),
 'Gato-camelo em pé (cat-cow em pé)': (M, 'Coluna', '10 repetições', ['Em pé, joelhos levemente dobrados e mãos nas coxas.', 'Arredonde as costas olhando para o umbigo.', 'Depois estufe o peito e olhe à frente.']),
 'Rotação de quadril em pé (abrir o portão)': (M, 'Quadril', '8 por lado', ['Em pé, suba um joelho à frente.', 'Abra o joelho para o lado, como se abrisse um portão.', 'Volte e troque de perna.']),
 'Alongamento de flexor do quadril ajoelhado': (A, 'Quadril', '30 a 45 s cada lado', ['Fique meio ajoelhado com um pé à frente.', 'Contraia o glúteo da perna de trás e leve o quadril à frente.', 'Suba o braço do mesmo lado do joelho apoiado.']),
 'Cachorro olhando para baixo': (A, 'Corpo todo', '30 s', ['Comece em prancha e leve o quadril para cima e para trás.', 'Empurre o chão com as mãos e leve os calcanhares em direção ao chão.', 'Pode dobrar um pouco os joelhos para manter a coluna reta.']),
 'Cobra (extensão lombar no solo)': (A, 'Coluna', '20 a 30 s', ['Deite de bruços com as mãos ao lado do peito.', 'Estique os braços levantando o tronco, quadril no chão.', 'Ombros longe das orelhas.']),
 'Postura da criança': (A, 'Costas', '30 a 60 s', ['Ajoelhe e sente sobre os calcanhares.', 'Incline o tronco à frente e estique os braços no chão.', 'Respire fundo soltando as costas.']),
 'Alongamento de posteriores em pé': (A, 'Coxas', '30 s', ['Em pé, pés juntos.', 'Incline o tronco à frente deixando os braços pendurados.', 'Dobre levemente os joelhos se a lombar puxar.']),
}
for e in E:
    if e['name'] in EXTRA:
        sec, reg, dose, passos = EXTRA[e['name']]
        e.update(secao=sec, regiao=reg, dose=dose, passos=passos, how=e['how'] or ' '.join(f'{i + 1}) {p}' for i, p in enumerate(passos)))
