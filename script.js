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


      const conteudo =
        document.getElementById(alvo);


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


    atualizarTextoContador();

  }


  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma =
        botao.getAttribute("data-idioma");

      traduzir(idioma);

    });

  });


  /* =========================
     DATA DA ÚLTIMA ATUALIZAÇÃO
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


  let numeroVisitas = null;


  function atualizarTextoContador() {

    if (
      !elContadorVisitas ||
      numeroVisitas === null
    ) {
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

        numeroVisitas =
          dados.value;

        atualizarTextoContador();

      })

      .catch(function () {

        elContadorVisitas.textContent = "";

      });

  }


  /* =========================
     SISTEMA DE AVALIAÇÃO
  ========================== */

  const estrelas =
    document.querySelectorAll(".estrela");


  const valorSelecionado =
    document.getElementById("valor-selecionado");


  const botaoEnviar =
    document.getElementById("enviar-avaliacao");


  const mediaValor =
    document.getElementById("media-valor");


  const estrelasPreenchidas =
    document.getElementById("estrelas-preenchidas");


  const quantidadeAvaliacoes =
    document.getElementById("quantidade-avaliacoes");


  const CHAVE_AVALIACOES =
    "avaliacoes-monitoria-lucas";


  let avaliacaoSelecionada = 0;


  function obterAvaliacoes() {

    try {

      const dados =
        localStorage.getItem(CHAVE_AVALIACOES);

      if (!dados) {
        return [];
      }

      const avaliacoes =
        JSON.parse(dados);

      if (!Array.isArray(avaliacoes)) {
        return [];
      }

      return avaliacoes;

    } catch (erro) {

      return [];

    }

  }


  function salvarAvaliacoes(avaliacoes) {

    localStorage.setItem(
      CHAVE_AVALIACOES,
      JSON.stringify(avaliacoes)
    );

  }


  function mostrarEstrelas(valor) {

    estrelas.forEach(function (estrela) {

      const numero =
        Number(
          estrela.getAttribute("data-valor")
        );


      if (numero <= valor) {

        estrela.classList.add("selecionada");

      } else {

        estrela.classList.remove("selecionada");

      }

    });

  }


  estrelas.forEach(function (estrela) {

    estrela.addEventListener("mouseenter", function () {

      const valor =
        Number(
          estrela.getAttribute("data-valor")
        );

      mostrarEstrelas(valor);

    });


    estrela.addEventListener("click", function () {

      avaliacaoSelecionada =
        Number(
          estrela.getAttribute("data-valor")
        );


      mostrarEstrelas(
        avaliacaoSelecionada
      );


      const idioma =
        localStorage.getItem("idioma") || "pt";


      if (idioma === "en") {

        valorSelecionado.textContent =
          "Selected rating: " +
          avaliacaoSelecionada +
          " star" +
          (
            avaliacaoSelecionada > 1
              ? "s"
              : ""
          );

      } else {

        valorSelecionado.textContent =
          "Avaliação selecionada: " +
          avaliacaoSelecionada +
          " estrela" +
          (
            avaliacaoSelecionada > 1
              ? "s"
              : ""
          );

      }

    });

  });


  const areaEstrelas =
    document.getElementById(
      "estrelas-avaliacao"
    );


  areaEstrelas.addEventListener(
    "mouseleave",
    function () {

      mostrarEstrelas(
        avaliacaoSelecionada
      );

    }
  );


  function atualizarMedia() {

    const avaliacoes =
      obterAvaliacoes();


    if (avaliacoes.length === 0) {

      mediaValor.textContent =
        "0,0";


      estrelasPreenchidas.style.width =
        "0%";


      quantidadeAvaliacoes.textContent =
        "Nenhuma avaliação ainda.";

      return;

    }


    let soma = 0;


    avaliacoes.forEach(function (valor) {

      soma += Number(valor);

    });


    const media =
      soma / avaliacoes.length;


    const mediaFormatada =
      media.toFixed(1).replace(".", ",");


    mediaValor.textContent =
      mediaFormatada;


    const porcentagem =
      (media / 5) * 100;


    estrelasPreenchidas.style.width =
      porcentagem + "%";


    const idioma =
      localStorage.getItem("idioma") || "pt";


    if (idioma === "en") {

      quantidadeAvaliacoes.textContent =
        avaliacoes.length +
        (
          avaliacoes.length === 1
            ? " rating"
            : " ratings"
        );

    } else {

      quantidadeAvaliacoes.textContent =
        avaliacoes.length +
        (
          avaliacoes.length === 1
            ? " avaliação"
            : " avaliações"
        );

    }

  }


  if (botaoEnviar) {

    botaoEnviar.addEventListener(
      "click",
      function () {

        if (avaliacaoSelecionada === 0) {

          const idioma =
            localStorage.getItem("idioma") || "pt";


          if (idioma === "en") {

            valorSelecionado.textContent =
              "Please select a rating first.";

          } else {

            valorSelecionado.textContent =
              "Selecione uma avaliação primeiro.";

          }

          return;

        }


        const avaliacoes =
          obterAvaliacoes();


        avaliacoes.push(
          avaliacaoSelecionada
        );


        salvarAvaliacoes(
          avaliacoes
        );


        avaliacaoSelecionada = 0;


        mostrarEstrelas(0);


        const idioma =
          localStorage.getItem("idioma") || "pt";


        if (idioma === "en") {

          valorSelecionado.textContent =
            "Thank you for your feedback!";

        } else {

          valorSelecionado.textContent =
            "Obrigado pela avaliação!";

        }


        atualizarMedia();

      }
    );

  }


  /* =========================
     IDIOMA INICIAL
  ========================== */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";


  traduzir(idiomaSalvo);


  /* =========================
     CARREGA MÉDIA
  ========================== */

  atualizarMedia();

});
