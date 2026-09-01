"""
Previsão de notas futuras (5º e 6º período) — Bacharelado em Ciência
da Computação, UFRJ.

Metodologia:
- Para cada disciplina já cursada que tem pré-requisitos com nota
  conhecida, criamos um par de treino: (média das notas dos
  pré-requisitos, nota obtida na disciplina).
- Ajustamos uma regressão linear simples (1 variável) sobre esses
  pares: nota_prevista = a * media_prereq + b.
- Como a base é pequena (poucas dezenas de disciplinas, um único
  aluno), não faz sentido estatístico separar aleatoriamente 80/20
  uma única vez — o resultado dependeria demais de sorte na divisão.
  Em vez disso, usamos Leave-One-Out Cross-Validation (LOOCV): a
  cada rodada, treinamos com todas as disciplinas menos uma, e
  testamos a previsão nela. Isso usa efetivamente ~92% dos dados
  para treino e 1 disciplina para teste, repetido para todas —
  no espírito do "80% treino / 20% teste", mas adequado ao tamanho
  real da amostra. O erro médio dessas rodadas vira a margem de
  erro exibida.
- Disciplinas do 5º período que são pré-requisito de disciplinas do
  6º período (ex: ICP353 alimenta ICP361) usam a NOTA PREVISTA como
  entrada — a previsão é recursiva, seguindo a ordem dos períodos.
"""

# Notas já obtidas, usando o código da disciplina na grade ATUAL do curso.
# Disciplinas cursadas ainda no período de transferência (BCMT) foram
# mapeadas aqui pela equivalência confirmada pelo aluno.
GRADES = {
    "ICP131": 8.5,   # equivalência: ICP121 Computação I (2022/2)
    "ICP132": 5.9,   # Processos de Software (2024/2)
    "ICP133": 7.8,   # equivalência: ICP111 Fund Computação Digital (2024/1)
    "ICP134": 9.6,   # Números Inteiros e Criptografia (2024/2)
    "ICP135": 9.3,   # Projeto de Carreira (2024/2)
    "ICP136": 9.2,   # Introdução ao Pensamento Dedutivo (2024/2)

    "ICP141": 9.35,  # equivalência: média de CMT012 Introd Prog C/C++ (9,2) e ICP241 Computação II (9,5)
    "ICP142": 9.0,   # Organização de Dados I (2024/2)
    "ICP143": 8.6,   # Projeto Prático (2025/1)
    "ICP144": 7.7,   # Matemática Discreta (2025/1)
    "ICP145": 9.2,   # Habilidades Sociais para o Trabalho (2025/1)

    "ICP115": 9.8,   # Álgebra Linear Algorítmica (2025/2)
    "ICP116": 5.7,   # Estrutura dos Dados (2025/2)
    "ICP237": 8.3,   # Introdução à Modelagem de Sistemas (2025/1)
    "ICP238": 7.8,   # Introdução à Computação Numérica (2025/1)
    "ICP239": 7.0,   # Programação Orientada a Objeto (2026/1)
    "MAE992": 6.7,   # equivalência: MAC128 Cálculo Dif e Integral II (2023/2)

    "ICP246": 5.4,   # Arquitetura de Computadores e Sist Operacionais (2025/2)
    "ICP248": 7.8,   # Computação Científica e Análise de Dados (2026/1)
    "ICP249": 9.7,   # Tecnologia e Sociedade (2026/1)
    "ICP489": 6.6,   # Banco de Dados I (2026/1)
    "MAD243": 7.9,   # Estatística e Probabilidade (2025/2)
}

# Grade curricular oficial (fonte: ic.ufrj.br/info/grade-curricular-bcc/),
# restrita às disciplinas necessárias para alcançar os períodos 5 e 6.
# Pré-requisitos sem dado disponível (ex: MAE111, MAE121) foram omitidos
# da lista abaixo — a média de pré-requisitos é calculada só com o que
# se conhece.
CURRICULO = {
    "ICP131": {"nome": "Programação de Computadores I", "periodo": 1, "prereq": []},
    "ICP132": {"nome": "Processos de Software", "periodo": 1, "prereq": []},
    "ICP133": {"nome": "Fund de Sistemas de Computação", "periodo": 1, "prereq": []},
    "ICP134": {"nome": "Números Inteiros e Criptografia", "periodo": 1, "prereq": []},
    "ICP135": {"nome": "Projeto de Carreira", "periodo": 1, "prereq": []},
    "ICP136": {"nome": "Introdução ao Pensamento Dedutivo", "periodo": 1, "prereq": []},

    "ICP141": {"nome": "Programação de Computadores II", "periodo": 2, "prereq": ["ICP131"]},
    "ICP142": {"nome": "Organização de Dados I", "periodo": 2, "prereq": []},
    "ICP143": {"nome": "Projeto Prático", "periodo": 2, "prereq": ["ICP131", "ICP132", "ICP133"]},
    "ICP144": {"nome": "Matemática Discreta", "periodo": 2, "prereq": ["ICP134"]},
    "ICP145": {"nome": "Habilidades Sociais para o Trabalho", "periodo": 2, "prereq": ["ICP135"]},

    "ICP115": {"nome": "Álgebra Linear Algorítmica", "periodo": 3, "prereq": ["ICP136", "ICP144"]},
    "ICP116": {"nome": "Estrutura dos Dados", "periodo": 3, "prereq": ["ICP141"]},
    "ICP237": {"nome": "Introdução à Modelagem de Sistemas", "periodo": 3, "prereq": ["ICP132", "ICP141"]},
    "ICP238": {"nome": "Introdução à Computação Numérica", "periodo": 3, "prereq": ["ICP131", "ICP133"]},
    "ICP239": {"nome": "Programação Orientada a Objeto", "periodo": 3, "prereq": ["ICP141"]},
    "MAE992": {"nome": "Cálculo Integral e Diferencial II", "periodo": 3, "prereq": []},

    "ICP246": {"nome": "Arquitetura de Computadores e Sist. Operacionais", "periodo": 4, "prereq": ["ICP133", "ICP141"]},
    "ICP248": {"nome": "Computação Científica e Análise de Dados", "periodo": 4, "prereq": ["ICP115", "ICP238", "MAE992"]},
    "ICP249": {"nome": "Tecnologia e Sociedade", "periodo": 4, "prereq": ["ICP145"]},
    "ICP489": {"nome": "Banco de Dados I", "periodo": 4, "prereq": ["ICP116"]},
    "MAD243": {"nome": "Estatística e Probabilidade", "periodo": 4, "prereq": []},

    "ICP123": {"nome": "Linguagens Formais", "periodo": 5, "prereq": ["ICP141", "ICP144"]},
    "ICP350": {"nome": "Modelagem e Avaliação de Desempenho", "periodo": 5, "prereq": ["ICP115", "MAD243"]},
    "ICP351": {"nome": "Modelagem Matemática e Computacional", "periodo": 5, "prereq": ["ICP115", "MAE992"]},
    "ICP353": {"nome": "Computadores e Programação", "periodo": 5, "prereq": ["ICP246"]},
    "ICP368": {"nome": "Algoritmos e Grafos", "periodo": 5, "prereq": ["ICP116", "ICP144"]},

    "ICP361": {"nome": "Programação Concorrente", "periodo": 6, "prereq": ["ICP239", "ICP353"]},
    "ICP362": {"nome": "Redes de Computadores I", "periodo": 6, "prereq": ["ICP131", "ICP133", "MAD243"]},
    "ICP363": {"nome": "Introdução ao Aprendizado de Máquina", "periodo": 6, "prereq": ["ICP248", "MAD243"]},
    "ICP365": {"nome": "Otimização", "periodo": 6, "prereq": ["ICP115", "ICP238"]},
    "ICP370": {"nome": "Lógica e Computabilidade", "periodo": 6, "prereq": ["ICP123"]},
}


def media(valores):
    return sum(valores) / len(valores)


def regressao_linear(pares):
    xs = [p[0] for p in pares]
    ys = [p[1] for p in pares]
    mx, my = media(xs), media(ys)
    numerador = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denominador = sum((x - mx) ** 2 for x in xs)
    a = numerador / denominador if denominador != 0 else 0.0
    b = my - a * mx
    return a, b


def prever(a, b, x):
    return a * x + b


def construir_pares_treino():
    pares = []
    for codigo, info in CURRICULO.items():
        if codigo not in GRADES:
            continue
        prereqs_conhecidos = [GRADES[p] for p in info["prereq"] if p in GRADES]
        if not prereqs_conhecidos:
            continue
        pares.append((media(prereqs_conhecidos), GRADES[codigo]))
    return pares


def loocv_rmse(pares):
    if len(pares) < 3:
        return None
    erros_quadraticos = []
    for i in range(len(pares)):
        treino = pares[:i] + pares[i + 1:]
        a, b = regressao_linear(treino)
        x_teste, y_teste = pares[i]
        predito = prever(a, b, x_teste)
        erros_quadraticos.append((predito - y_teste) ** 2)
    return media(erros_quadraticos) ** 0.5


# Valores críticos da distribuição t de Student para 99% de confiança
# (bicaudal, alpha = 0,01, ou seja 0,005 em cada cauda), por grau de
# liberdade. Usado para transformar o erro típico do modelo (LOOCV)
# em uma margem de erro de 99% de confiança: margem = t_critico * erro.
# Acima de 30 graus de liberdade, usa-se o valor da normal (z = 2,576).
T_CRITICO_99 = {
    1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
    6: 3.707, 7: 3.499, 8: 3.355, 9: 3.250, 10: 3.169,
    11: 3.106, 12: 3.055, 13: 3.012, 14: 2.977, 15: 2.947,
    16: 2.921, 17: 2.898, 18: 2.878, 19: 2.861, 20: 2.845,
    21: 2.831, 22: 2.819, 23: 2.807, 24: 2.797, 25: 2.787,
    26: 2.779, 27: 2.771, 28: 2.763, 29: 2.756, 30: 2.750,
}


def t_critico_99(graus_liberdade):
    if graus_liberdade < 1:
        return T_CRITICO_99[1]
    if graus_liberdade > 30:
        return 2.576
    return T_CRITICO_99[graus_liberdade]


def margem_erro_99(pares):
    """
    Margem de erro com 99% de confiança, aproximada como
    t_critico(99%, graus de liberdade) * erro típico do modelo (RMSE
    via LOOCV). Graus de liberdade = nº de pares de treino - 2
    (regressão linear com 1 variável). É uma aproximação (uma
    previsão exata levaria em conta também a "alavancagem" de cada
    ponto), mas é uma margem honesta e adequada ao tamanho da base.
    """
    rmse = loocv_rmse(pares)
    if rmse is None:
        return None
    graus_liberdade = len(pares) - 2
    return t_critico_99(graus_liberdade) * rmse


def calcular_previsao(codigo_alvo):
    pares = construir_pares_treino()
    a, b = regressao_linear(pares)
    margem = margem_erro_99(pares)

    ordem_periodos_5_6 = sorted(
        [c for c in CURRICULO if CURRICULO[c]["periodo"] in (5, 6)],
        key=lambda c: CURRICULO[c]["periodo"],
    )

    previstos = {}
    for codigo in ordem_periodos_5_6:
        info = CURRICULO[codigo]
        valores_prereq = []
        for p in info["prereq"]:
            if p in GRADES:
                valores_prereq.append(GRADES[p])
            elif p in previstos:
                valores_prereq.append(previstos[p])
        if not valores_prereq:
            continue
        x = media(valores_prereq)
        pred = prever(a, b, x)
        pred = max(0.0, min(10.0, pred))
        previstos[codigo] = pred

    if codigo_alvo not in previstos:
        return {"erro": "Sem dados suficientes de pré-requisitos para prever essa disciplina."}

    info = CURRICULO[codigo_alvo]
    prereqs_usados = []
    for p in info["prereq"]:
        valor = GRADES.get(p, previstos.get(p))
        se_previsto = p not in GRADES
        prereqs_usados.append({
            "codigo": p,
            "nome": CURRICULO.get(p, {}).get("nome", p),
            "nota": round(valor, 1) if valor is not None else None,
            "previsto": se_previsto,
        })

    return {
        "codigo": codigo_alvo,
        "nome": info["nome"],
        "periodo": info["periodo"],
        "media_estimada": round(previstos[codigo_alvo], 1),
        "margem_erro": round(margem, 1) if margem else None,
        "confianca": 99,
        "prereqs": prereqs_usados,
        "tamanho_treino": len(pares),
    }


def listar_materias_alvo():
    itens = [
        {"codigo": c, "nome": CURRICULO[c]["nome"], "periodo": CURRICULO[c]["periodo"]}
        for c in CURRICULO
        if CURRICULO[c]["periodo"] in (5, 6)
    ]
    itens.sort(key=lambda i: (i["periodo"], i["codigo"]))
    return itens
