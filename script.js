document.addEventListener("DOMContentLoaded", function () {


  /* =========================
     ABAS
  ========================== */

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
  ========================== */

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


    if (idioma === "en") {

      document.documentElement.lang = "en";

      document.title =
        "Lucas de Araujo Contreiras | Computer Science";

    } else {

      document.documentElement.lang = "pt-br";

      document.title =
        "Lucas de Araujo Contreiras";

    }


    botoesIdioma.forEach(function (botao) {

      botao.classList.remove("ativo");

      if (
        botao.getAttribute("data-idioma") === idioma
      ) {

        botao.classList.add("ativo");

      }

    });


    localStorage.setItem("idioma", idioma);

  }


  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma =
        botao.getAttribute("data-idioma");

      traduzir(idioma);

    });

  });


  /* =========================
     DATA DA ATUALIZAÇÃO
  ========================== */

  const ULTIMA_ATUALIZACAO =
    "25 de agosto de 2026";

  const elementoData =
    document.getElementById("data-atualizacao");

  if (elementoData) {

    elementoData.textContent =
      ULTIMA_ATUALIZACAO;

  }


  /* =========================
     CONTADOR DE VISITAS
  ========================== */

  const NAMESPACE_CONTADOR =
    "sgcont.github.io";

  const CHAVE_CONTADOR =
    "perfil-visitas";

  const elContadorVisitas =
    document.getElementById("contador-visitas");


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

        const idioma =
          localStorage.getItem("idioma") || "pt";

        if (idioma === "en") {

          elContadorVisitas.textContent =
            "You are the " +
            dados.value +
            "th person to visit my profile";

        } else {

          elContadorVisitas.textContent =
            "Você é a " +
            dados.value +
            "ª pessoa a entrar no meu perfil";

        }

      })

      .catch(function () {

        elContadorVisitas.textContent = "";

      });

  }


  /* =========================
     AVALIAÇÃO
  ========================== */

  const botoesAvaliacao =
    document.querySelectorAll(
      'input[name="nota-avaliacao"]'
    );

  const botaoAvaliar =
    document.getElementById("botao-avaliar");

  const mensagemAvaliacao =
    document.getElementById("mensagem-avaliacao");

  const mediaNumero =
    document.getElementById("media-numero");

  const estrelasPreenchidas =
    document.getElementById("estrelas-preenchidas");

  const quantidadeAvaliacoes =
    document.getElementById("quantidade-avaliacoes");


  function atualizarMedia() {

    const avaliacoes =
      JSON.parse(
        localStorage.getItem("avaliacoes-monitoria") || "[]"
      );


    if (avaliacoes.length === 0) {

      mediaNumero.textContent = "0,0";

      estrelasPreenchidas.style.width = "0%";

      quantidadeAvaliacoes.textContent =
        "0 avaliações";

      return;

    }


    const soma =
      avaliacoes.reduce(function (total, nota) {

        return total + nota;

      }, 0);


    const media =
      soma / avaliacoes.length;


    mediaNumero.textContent =
      media.toFixed(1).replace(".", ",");


    /*
      5 estrelas correspondem a 100%.
      Portanto:

      4,7 / 5 = 94%
    */

    const porcentagem =
      (media / 5) * 100;


    estrelasPreenchidas.style.width =
      porcentagem + "%";


    quantidadeAvaliacoes.textContent =
      avaliacoes.length === 1
        ? "1 avaliação"
        : avaliacoes.length + " avaliações";

  }


  if (botaoAvaliar) {

    botaoAvaliar.addEventListener("click", function () {

      let notaSelecionada = null;


      botoesAvaliacao.forEach(function (botao) {

        if (botao.checked) {

          notaSelecionada =
            Number(botao.value);

        }

      });


      if (notaSelecionada === null) {

        mensagemAvaliacao.textContent =
          "Selecione uma nota antes de avaliar.";

        return;

      }


      const avaliacoes =
        JSON.parse(
          localStorage.getItem("avaliacoes-monitoria") || "[]"
        );


      avaliacoes.push(notaSelecionada);


      localStorage.setItem(
        "avaliacoes-monitoria",
        JSON.stringify(avaliacoes)
      );


      mensagemAvaliacao.textContent =
        "Obrigado pela avaliação!";


      atualizarMedia();

    });

  }


  atualizarMedia();


  /* =========================
     IDIOMA INICIAL
  ========================== */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";

  traduzir(idiomaSalvo);

});
