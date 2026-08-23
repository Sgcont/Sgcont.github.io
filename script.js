document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     ABAS
  ========================= */

  const botoes = document.querySelectorAll(".aba-botao");
  const conteudos = document.querySelectorAll(".aba-conteudo");

  botoes.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const alvo = botao.getAttribute("data-aba");

      botoes.forEach(function (b) {
        b.classList.remove("ativo");
      });

      conteudos.forEach(function (c) {
        c.classList.remove("ativo");
      });

      botao.classList.add("ativo");

      const conteudo = document.getElementById(alvo);

      if (conteudo) {
        conteudo.classList.add("ativo");
      }

    });

  });


  /* =========================
     TRADUÇÃO
  ========================= */

  const botoesIdioma =
    document.querySelectorAll(".idioma-botao");


  function traduzir(idioma) {

    const elementos =
      document.querySelectorAll("[data-pt][data-en]");


    elementos.forEach(function (elemento) {

      if (idioma === "en") {

        elemento.textContent =
          elemento.getAttribute("data-en");

      } else {

        elemento.textContent =
          elemento.getAttribute("data-pt");

      }

    });


    /* Idioma da página */

    if (idioma === "en") {

      document.documentElement.lang = "en";

      document.title =
        "Lucas de Araujo Contreiras | Computer Science";

    } else {

      document.documentElement.lang = "pt-br";

      document.title =
        "Lucas de Araujo Contreiras";

    }


    /* Botão ativo */

    botoesIdioma.forEach(function (botao) {

      botao.classList.remove("ativo");

      if (
        botao.getAttribute("data-idioma") === idioma
      ) {

        botao.classList.add("ativo");

      }

    });


    /* Salva idioma */

    localStorage.setItem("idioma", idioma);


    /* Atualiza o contador */

    atualizarTextoContador();

  }


  /* =========================
     BOTÕES DE IDIOMA
  ========================= */

  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma =
        botao.getAttribute("data-idioma");

      traduzir(idioma);

    });

  });


  /* =========================
     DATA DA ÚLTIMA ATUALIZAÇÃO
  ========================= */

  const ULTIMA_ATUALIZACAO =
    "21 de agosto de 2026";

  const elementoData =
    document.getElementById("data-atualizacao");

  if (elementoData) {

    elementoData.textContent =
      ULTIMA_ATUALIZACAO;

  }


  /* =========================
     CONTADOR DE VISITAS
  ========================= */

  const NAMESPACE_CONTADOR =
    "sgcont.github.io";

  const CHAVE_CONTADOR =
    "perfil-visitas";

  const elContadorVisitas =
    document.getElementById("contador-visitas");

  let numeroVisitas = null;


  function atualizarTextoContador() {

    if (!elContadorVisitas || numeroVisitas === null) {
      return;
    }

    const idioma =
      localStorage.getItem("idioma") || "pt";


    if (idioma === "en") {

      elContadorVisitas.textContent =
        "You are the " +
        numeroVisitas +
        "th person to visit my profile";

    } else {

      elContadorVisitas.textContent =
        "Você é a " +
        numeroVisitas +
        "ª pessoa a entrar no meu perfil";

    }

  }


  if (elContadorVisitas) {

    fetch(
      "https://abacus.jasoncameron.dev/hit/" +
      NAMESPACE_CONTADOR +
      "/" +
      CHAVE_CONTADOR
    )

      .then(function (resposta) {

        return resposta.json();

      })

      .then(function (dados) {

        numeroVisitas = dados.value;

        atualizarTextoContador();

      })

      .catch(function () {

        elContadorVisitas.textContent = "";

      });

  }


  /* =========================
     PYTHON / PYODIDE
  ========================= */

  let pyodide = null;


  const PYTHON_JOGO = `

import random
import json


TAMANHO = 10
MINAS = 20


tabuleiro = []
visivel = []
bandeiras = set()
jogo_terminou = False
venceu = False


def novo_jogo():

    global tabuleiro
    global visivel
    global bandeiras
    global jogo_terminou
    global venceu

    tabuleiro = [
        [0 for _ in range(TAMANHO)]
        for _ in range(TAMANHO)
    ]

    visivel = [
        [False for _ in range(TAMANHO)]
        for _ in range(TAMANHO)
    ]

    bandeiras = set()

    jogo_terminou = False
    venceu = False


    posicoes = [
        (linha, coluna)
        for linha in range(TAMANHO)
        for coluna in range(TAMANHO)
    ]

    minas = random.sample(posicoes, MINAS)


    for linha, coluna in minas:
        tabuleiro[linha][coluna] = -1


    for linha in range(TAMANHO):

        for coluna in range(TAMANHO):

            if tabuleiro[linha][coluna] == -1:
                continue

            quantidade = 0

            for dl in (-1, 0, 1):

                for dc in (-1, 0, 1):

                    if dl == 0 and dc == 0:
                        continue

                    nl = linha + dl
                    nc = coluna + dc

                    if (
                        0 <= nl < TAMANHO
                        and 0 <= nc < TAMANHO
                        and tabuleiro[nl][nc] == -1
                    ):
                        quantidade += 1

            tabuleiro[linha][coluna] = quantidade


    return estado()


def revelar(linha, coluna):

    global jogo_terminou
    global venceu

    if jogo_terminou:
        return

    if (linha, coluna) in bandeiras:
        return

    if visivel[linha][coluna]:
        return


    if tabuleiro[linha][coluna] == -1:

        visivel[linha][coluna] = True
        jogo_terminou = True

        for l in range(TAMANHO):
            for c in range(TAMANHO):
                if tabuleiro[l][c] == -1:
                    visivel[l][c] = True

        return


    fila = [(linha, coluna)]
    visitados = set()


    while fila:

        l, c = fila.pop()

        if (l, c) in visitados:
            continue

        visitados.add((l, c))

        if not (0 <= l < TAMANHO and 0 <= c < TAMANHO):
            continue

        if (l, c) in bandeiras:
            continue

        if tabuleiro[l][c] == -1:
            continue

        visivel[l][c] = True


        if tabuleiro[l][c] == 0:

            for dl in (-1, 0, 1):

                for dc in (-1, 0, 1):

                    if dl == 0 and dc == 0:
                        continue

                    nl = l + dl
                    nc = c + dc

                    if (
                        0 <= nl < TAMANHO
                        and 0 <= nc < TAMANHO
                        and not visivel[nl][nc]
                    ):
                        fila.append((nl, nc))


    verificar_vitoria()


def alternar_bandeira(linha, coluna):

    if jogo_terminou:
        return

    if visivel[linha][coluna]:
        return


    posicao = (linha, coluna)

    if posicao in bandeiras:

        bandeiras.remove(posicao)

    else:

        if len(bandeiras) < MINAS:
            bandeiras.add(posicao)


def verificar_vitoria():

    global jogo_terminou
    global venceu

    casas_seguras = TAMANHO * TAMANHO - MINAS

    abertas = sum(
        1
        for linha in range(TAMANHO)
        for coluna in range(TAMANHO)
        if visivel[linha][coluna]
        and tabuleiro[linha][coluna] != -1
    )


    if abertas == casas_seguras:

        venceu = True
        jogo_terminou = True


def acao(linha, coluna, tipo):

    linha = int(linha)
    coluna = int(coluna)

    if tipo == "revelar":

        revelar(linha, coluna)

    elif tipo == "bandeira":

        alternar_bandeira(linha, coluna)

    return estado()


def estado():

    casas = []

    for linha in range(TAMANHO):

        linha_estado = []

        for coluna in range(TAMANHO):

            if (linha, coluna) in bandeiras:

                linha_estado.append("bandeira")

            elif not visivel[linha][coluna]:

                linha_estado.append("fechada")

            elif tabuleiro[linha][coluna] == -1:

                linha_estado.append("bomba")

            else:

                linha_estado.append(str(tabuleiro[linha][coluna]))

        casas.append(linha_estado)


    return json.dumps({
        "tabuleiro": casas,
        "bandeiras": len(bandeiras),
        "jogo_terminou": jogo_terminou,
        "venceu": venceu
    })


novo_jogo()

`;


  /* =========================
     FUNÇÕES DO CAMPO MINADO
  ========================= */

  const tabuleiroHTML =
    document.getElementById("minesweeper-tabuleiro");

  const mensagemMinesweeper =
    document.getElementById("minesweeper-mensagem");

  const minasRestantes =
    document.getElementById("mines-restantes");

  const botaoNovoJogo =
    document.getElementById("novo-jogo");

  const pythonStatus =
    document.getElementById("python-status");


  async function iniciarPython() {

    try {

      pyodide =
        await loadPyodide();


      await pyodide.runPythonAsync(
        PYTHON_JOGO
      );


      botaoNovoJogo.disabled = false;


      pythonStatus.textContent =
        "Python carregado. Jogo pronto.";


      await atualizarJogo();

    }

    catch (erro) {

      console.error(erro);

      pythonStatus.textContent =
        "Não foi possível carregar o Python.";

    }

  }


  async function executarPython(comando) {

    const resultado =
      await pyodide.runPythonAsync(comando);

    return JSON.parse(resultado);

  }


  async function atualizarJogo() {

    if (!pyodide) {
      return;
    }


    const estado =
      await executarPython(
        "estado()"
      );


    desenharTabuleiro(estado);

  }


  function desenharTabuleiro(estado) {

    tabuleiroHTML.innerHTML = "";


    minasRestantes.textContent =
      20 - estado.bandeiras;


    for (
      let linha = 0;
      linha < 10;
      linha++
    ) {

      for (
        let coluna = 0;
        coluna < 10;
        coluna++
      ) {

        const valor =
          estado.tabuleiro[linha][coluna];


        const celula =
          document.createElement("button");


        celula.type = "button";

        celula.className =
          "celula-mina";


        if (valor === "fechada") {

          celula.textContent = "";

        }

        else if (valor === "bandeira") {

          celula.textContent = "⚑";

          celula.classList.add(
            "bandeira"
          );

        }

        else if (valor === "bomba") {

          celula.textContent = "●";

          celula.classList.add(
            "revelada",
            "bomba"
          );

        }

        else {

          celula.textContent =
            valor === "0"
              ? ""
              : valor;

          celula.classList.add(
            "revelada"
          );

        }


        celula.addEventListener(
          "click",
          async function () {

            if (estado.jogo_terminou) {
              return;
            }

            await executarPython(
              "acao(" +
              linha +
              ", " +
              coluna +
              ", 'revelar')"
            );

            await atualizarJogo();

            verificarMensagem();

          }
        );


        celula.addEventListener(
          "contextmenu",
          async function (evento) {

            evento.preventDefault();


            if (estado.jogo_terminou) {
              return;
            }


            await executarPython(
              "acao(" +
              linha +
              ", " +
              coluna +
              ", 'bandeira')"
            );


            await atualizarJogo();

          }
        );


        tabuleiroHTML.appendChild(
          celula
        );

      }

    }

  }


  async function verificarMensagem() {

    const estado =
      await executarPython(
        "estado()"
      );


    if (estado.venceu) {

      mensagemMinesweeper.textContent =
        "Parabéns! Você encontrou todas as casas seguras.";

    }

    else if (estado.jogo_terminou) {

      mensagemMinesweeper.textContent =
        "BOOM! Você encontrou uma bomba.";

    }

    else {

      mensagemMinesweeper.textContent =
        "";

    }

  }


  botaoNovoJogo.addEventListener(
    "click",
    async function () {

      if (!pyodide) {
        return;
      }


      await executarPython(
        "novo_jogo()"
      );


      mensagemMinesweeper.textContent =
        "";


      await atualizarJogo();

    }
  );


  /* =========================
     INICIA PYTHON
  ========================= */

  iniciarPython();


  /* =========================
     IDIOMA INICIAL
  ========================= */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";

  traduzir(idiomaSalvo);

});