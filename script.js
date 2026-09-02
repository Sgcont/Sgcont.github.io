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
     ABRIR ABA VIA LINK (#hash)
     Permite que um link tipo index.html#cultura abra
     direto na aba certa (usado, por exemplo, pelo botão
     "voltar" da página do Campo Minado em Python).
  ========================== */

  const abaPelaHash = window.location.hash.replace("#", "");

  if (abaPelaHash) {
    const botaoAlvo = document.querySelector(
      '.aba-botao[data-aba="' + abaPelaHash + '"]'
    );
    if (botaoAlvo) {
      botaoAlvo.click();
    }
  }

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


    /* Traduz placeholders (ex: campo de mensagem da avaliação),
       que não são cobertos pela troca de textContent acima. */

    const elementosComPlaceholder =
      document.querySelectorAll("[data-pt-placeholder][data-en-placeholder]");

    elementosComPlaceholder.forEach(function (elemento) {

      if (idioma === "en") {
        elemento.placeholder = elemento.getAttribute("data-en-placeholder");
      } else {
        elemento.placeholder = elemento.getAttribute("data-pt-placeholder");
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


    /* Avisa outros scripts (ex: avaliacoes.js) que o idioma mudou,
       para que também atualizem seus textos dinâmicos. Isso é feito
       via evento customizado para manter este arquivo independente
       de qualquer outro script da página. */

    document.dispatchEvent(
      new CustomEvent("idioma-alterado", { detail: { idioma: idioma } })
    );

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
     IMPORTANTE: atualize esta linha manualmente toda vez
     que editar o site (não pega a data de hoje sozinha).
  ========================== */

  const ULTIMA_ATUALIZACAO =
    "2 de setembro de 2026";


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
     IDIOMA INICIAL
  ========================== */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";


  traduzir(idiomaSalvo);

});
