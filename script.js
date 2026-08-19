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


    /* Idioma do documento */

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


    /* Atualiza data */

    atualizarData(idioma);

  }


  /* =========================
     BOTÕES DE IDIOMA
  ========================= */

  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma =
        botao.getAttribute("data-idioma");

      if (idioma) {
        traduzir(idioma);
      }

    });

  });


  /* =========================
     DATA
  ========================= */

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

    let texto;


    if (idioma === "en") {

      texto =
        monthsEN[mes] +
        " " +
        dia +
        ", " +
        ano;

    } else {

      texto =
        dia +
        " de " +
        mesesPT[mes] +
        " de " +
        ano;

    }


    const elemento =
      document.getElementById("data-atualizacao");

    if (elemento) {
      elemento.textContent = texto;
    }

  }


  /* =========================
     CORREÇÃO DO NOME DOS MESES
  ========================= */

  /*
     Mantemos mesesEN separado para evitar
     qualquer problema com a tradução.
  */

  const monthsEN = mesesEN;


  /* =========================
     IDIOMA INICIAL
  ========================= */

  const idiomaSalvo =
    localStorage.getItem("idioma") || "pt";

  traduzir(idiomaSalvo);

});