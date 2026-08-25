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


    /* Atualiza textos da avaliação */

    atualizarTextoAvaliacao(idioma);

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
    "25 de agosto de 2026";

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
  ========================= */

  const botoesEstrela =
    document.querySelectorAll(".estrela-botao");

  const mediaElemento =
    document.getElementById("media-estrelas");

  const numeroAvaliacoes =
    document.getElementById("numero-avaliacoes");

  const estrelasMedia =
    document.querySelectorAll(".estrela-media");

  const mensagemAvaliacao =
    document.getElementById("mensagem-avaliacao");


  const CHAVE_AVALIACOES =
    "avaliacoes-lucas";


  function pegarAvaliacoes() {

    try {

      const dados =
        localStorage.getItem(CHAVE_AVALIACOES);

      if (!dados) {
        return [];
      }

      return JSON.parse(dados);

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


  function calcularMedia() {

    const avaliacoes =
      pegarAvaliacoes();


    if (avaliacoes.length === 0) {

      if (mediaElemento) {
        mediaElemento.textContent = "0.0";
      }

      if (numeroAvaliacoes) {
        numeroAvaliacoes.textContent = "0 avaliações";
      }

      preencherEstrelasMedia(0);

      return;

    }


    const soma =
      avaliacoes.reduce(
        function (total, valor) {
          return total + valor;
        },
        0
      );


    const media =
      soma / avaliacoes.length;


    const mediaFormatada =
      media.toFixed(1);


    if (mediaElemento) {

      mediaElemento.textContent =
        mediaFormatada;

    }


    if (numeroAvaliacoes) {

      const idioma =
        localStorage.getItem("idioma") || "pt";


      if (idioma === "en") {

        numeroAvaliacoes.textContent =
          avaliacoes.length +
          (
            avaliacoes.length === 1
              ? " rating"
              : " ratings"
          );

      } else {

        numeroAvaliacoes.textContent =
          avaliacoes.length +
          (
            avaliacoes.length === 1
              ? " avaliação"
              : " avaliações"
          );

      }

    }


    preencherEstrelasMedia(media);

  }


  function preencherEstrelasMedia(media) {

    estrelasMedia.forEach(function (estrela, indice) {

      const valorEstrela =
        indice + 1;

      let percentual = 0;


      if (media >= valorEstrela) {

        percentual = 100;

      } else if (media > indice) {

        percentual =
          (media - indice) * 100;

      }


      const preenchimento =
        estrela.querySelector(".preenchimento");


      if (preenchimento) {

        preenchimento.style.width =
          percentual + "%";

      }

    });

  }


  /* Clique nas estrelas */

  botoesEstrela.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const nota =
        Number(
          botao.getAttribute("data-valor")
        );


      if (
        nota < 1 ||
        nota > 5
      ) {
        return;
      }


      const avaliacoes =
        pegarAvaliacoes();


      avaliacoes.push(nota);


      salvarAvaliacoes(avaliacoes);


      /* Marca a avaliação escolhida */

      botoesEstrela.forEach(function (estrela) {

        const valor =
          Number(
            estrela.getAttribute("data-valor")
          );

        if (valor <= nota) {

          estrela.classList.add("ativa");

        } else {

          estrela.classList.remove("ativa");

        }

      });


      calcularMedia();


      const idioma =
        localStorage.getItem("idioma") || "pt";


      if (mensagemAvaliacao) {

        if (idioma === "en") {

          mensagemAvaliacao.textContent =
            "Thank you for your rating!";

        } else {

          mensagemAvaliacao.textContent =
            "Obrigado pela avaliação!";

        }

      }

    });

  });


  /* =========================
     TEXTO DA AVALIAÇÃO
  ========================= */

  function atualizarTextoAvaliacao(idioma) {

    const instrucao =
      document.getElementById("instrucao-avaliacao");


    const mediaTexto =
      document.getElementById("texto-media");


    if (instrucao) {

      if (idioma === "en") {

        instrucao.textContent =
          "How would you rate my profile?";

      } else {

        instrucao.textContent =
          "Como você avaliaria meu perfil?";

      }

    }


    if (mediaTexto) {

      if (idioma === "en") {

        mediaTexto.textContent =
          "Average rating";

      } else {

        mediaTexto.textContent =
          "Média das avaliações";

      }

    }


    calcularMedia();

  }


  /* =========================
     IDIOMA INICIAL
  ========================= */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";


  traduzir(idiomaSalvo);


  /* =========================
     CARREGA MÉDIA
  ========================= */

  calcularMedia();

});
