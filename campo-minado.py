import random

LINHAS = 10
COLUNAS = 10
MINAS = 16


class CampoMinado:
    def __init__(self):
        self.tabuleiro = [
            [
                {"bomba": False, "revelada": False, "bandeira": False, "adjacentes": 0}
                for _ in range(COLUNAS)
            ]
            for _ in range(LINHAS)
        ]
        self.primeiro_clique = True
        self.jogo_terminado = False
        self.vitoria = False
        self.bandeiras = 0

    def vizinhos(self, r, c):
        resultado = []
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if 0 <= nr < LINHAS and 0 <= nc < COLUNAS:
                    resultado.append((nr, nc))
        return resultado

    def colocar_minas(self, er, ec):
        proibidas = set(self.vizinhos(er, ec))
        proibidas.add((er, ec))
        colocadas = 0
        while colocadas < MINAS:
            r = random.randint(0, LINHAS - 1)
            c = random.randint(0, COLUNAS - 1)
            if (r, c) in proibidas or self.tabuleiro[r][c]["bomba"]:
                continue
            self.tabuleiro[r][c]["bomba"] = True
            colocadas += 1

        for r in range(LINHAS):
            for c in range(COLUNAS):
                if self.tabuleiro[r][c]["bomba"]:
                    continue
                total = 0
                for nr, nc in self.vizinhos(r, c):
                    if self.tabuleiro[nr][nc]["bomba"]:
                        total += 1
                self.tabuleiro[r][c]["adjacentes"] = total

    def revelar(self, r, c):
        if self.jogo_terminado:
            return self.estado()

        celula = self.tabuleiro[r][c]
        if celula["revelada"] or celula["bandeira"]:
            return self.estado()

        if self.primeiro_clique:
            self.colocar_minas(r, c)
            self.primeiro_clique = False

        celula = self.tabuleiro[r][c]

        if celula["bomba"]:
            celula["revelada"] = True
            self.jogo_terminado = True
            for linha in self.tabuleiro:
                for cel in linha:
                    if cel["bomba"]:
                        cel["revelada"] = True
            return self.estado()

        pilha = [(r, c)]
        while pilha:
            cr, cc = pilha.pop()
            cel = self.tabuleiro[cr][cc]
            if cel["revelada"] or cel["bandeira"] or cel["bomba"]:
                continue
            cel["revelada"] = True
            if cel["adjacentes"] == 0:
                for nr, nc in self.vizinhos(cr, cc):
                    if not self.tabuleiro[nr][nc]["revelada"]:
                        pilha.append((nr, nc))

        self.checar_vitoria()
        return self.estado()

    def alternar_bandeira(self, r, c):
        if self.jogo_terminado:
            return self.estado()
        celula = self.tabuleiro[r][c]
        if celula["revelada"]:
            return self.estado()
        celula["bandeira"] = not celula["bandeira"]
        self.bandeiras += 1 if celula["bandeira"] else -1
        return self.estado()

    def checar_vitoria(self):
        total_seguras = LINHAS * COLUNAS - MINAS
        reveladas = 0
        for linha in self.tabuleiro:
            for cel in linha:
                if cel["revelada"] and not cel["bomba"]:
                    reveladas += 1
        if reveladas == total_seguras:
            self.jogo_terminado = True
            self.vitoria = True

    def estado(self):
        return {
            "tabuleiro": self.tabuleiro,
            "jogo_terminado": self.jogo_terminado,
            "vitoria": self.vitoria,
            "bandeiras": self.bandeiras,
            "minas": MINAS,
            "linhas": LINHAS,
            "colunas": COLUNAS,
        }


jogo = CampoMinado()


def novo_jogo():
    global jogo
    jogo = CampoMinado()
    return jogo.estado()


def clicar(r, c):
    return jogo.revelar(r, c)


def marcar(r, c):
    return jogo.alternar_bandeira(r, c)
