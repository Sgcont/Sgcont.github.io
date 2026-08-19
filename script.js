document.addEventListener("DOMContentLoaded", function () {

  const botoesIdioma =
    document.querySelectorAll(".idioma-botao");

  const paginasIdioma =
    document.querySelectorAll(".idioma-conteudo");


  /* =========================
     ABAS
  ========================== */

  function configurarAbas(container) {

    const botoes =
      container.querySelectorAll(".aba-botao");

    const conteudos =
      container.querySelectorAll(".aba-conteudo");


    botoes.forEach(function (botao) {

      botao.addEventListener("click", function () {

        const alvo =
          botao.getAttribute("data-aba");


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

  }


  /* Configura as abas dos dois idiomas */

  paginasIdioma.forEach(function (pagina) {
    configurarAbas(pagina);
  });


  /* =========================
     DATA
  ========================== */

  const mesesPT = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
  ];


  const mesesEN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];


  function atualizarData(idioma) {

    const hoje = new Date();

    const dia = hoje.getDate();
    const mes = hoje.getMonth();
    const ano = hoje.getFullYear();


    if (idioma === "pt") {

      document.getElementById(
        "data-atualizacao-pt"
      ).textContent =
        dia +
        " de " +
        mesesPT[mes] +
        " de " +
        ano;

    } else {

      document.getElementById(
        "data-atualizacao-en"
      ).textContent =
        mesesEN[mes] +
        " " +
        dia +
        ", " +
        ano;

    }

  }


  /* =========================
     TROCA DE IDIOMA
  ========================== */

  function mudarIdioma(idioma) {


    /* Esconde os dois idiomas */

    paginasIdioma.forEach(function (pagina) {

      pagina.style.display = "none";

    });


    /* Mostra o idioma escolhido */

    const paginaSelecionada =
      document.querySelector(
        '[data-idioma-conteudo="' +
        idioma +
        '"]'
      );


    if (paginaSelecionada) {

      paginaSelecionada.style.display = "block";

    }


    /* Atualiza botão */

    botoesIdioma.forEach(function (botao) {

      botao.classList.remove("ativo");


      if (
        botao.getAttribute("data-idioma") === idioma
      ) {

        botao.classList.add("ativo");

      }

    });


    /* Atualiza título */

    if (idioma === "en") {

      document.title =
        "Lucas de Araujo Contreiras | Computer Science";

      document.documentElement.lang = "en";

    } else {

      document.title =
        "Lucas de Araujo Contreiras";

      document.documentElement.lang = "pt-br";

    }


    /* Atualiza data */

    atualizarData(idioma);


    /* Guarda idioma escolhido */

    localStorage.setItem(
      "idioma",
      idioma
    );

  }


  /* =========================
     BOTÕES 🇧🇷 🇬🇧
  ========================== */

  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma =
        botao.getAttribute("data-idioma");

      mudarIdioma(idioma);

    });

  });


  /* =========================
     IDIOMA INICIAL
  ========================== */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";


  mudarIdioma(idiomaSalvo);

});
