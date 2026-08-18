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

      const secao = document.getElementById(alvo);

      if (secao) {
        secao.classList.add("ativo");
      }

    });

  });


  /* =========================
     IDIOMAS
  ========================= */

  const botoesIdioma = document.querySelectorAll(".idioma-botao");

  function alterarIdioma(idioma) {

    /*
     * Altera todos os elementos que possuem
     * data-pt e data-en.
     */

    const elementos = document.querySelectorAll("[data-pt][data-en]");

    elementos.forEach(function (elemento) {

      elemento.textContent = elemento.getAttribute(
        idioma === "en" ? "data-en" : "data-pt"
      );

    });


    /*
     * Altera o idioma do documento.
     */

    if (idioma === "en") {
      document.documentElement.lang = "en";
      document.title = "Lucas de Araujo Contreiras | Computer Science";
    } else {
      document.documentElement.lang = "pt-br";
      document.title = "Lucas de Araujo Contreiras";
    }


    /*
     * Marca a bandeira selecionada.
     */

    botoesIdioma.forEach(function (botao) {

      botao.classList.remove("ativo");

      if (botao.getAttribute("data-idioma") === idioma) {
        botao.classList.add("ativo");
      }

    });


    /*
     * Salva a preferência do usuário.
     */

    localStorage.setItem("idioma", idioma);
  }


  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const idioma = botao.getAttribute("data-idioma");

      alterarIdioma(idioma);

    });

  });


  /*
   * Recupera o idioma salvo.
   * Caso não exista, utiliza português.
   */

  const idiomaSalvo = localStorage.getItem("idioma") || "pt";

  alterarIdioma(idiomaSalvo);


  /* =========================
     DATA DE ATUALIZAÇÃO
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


function atualizarData() {

  const hoje = new Date();

  const dia = hoje.getDate();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  const idiomaAtual =
    localStorage.getItem("idioma") || "pt";

  let texto;

  if (idiomaAtual === "en") {

    texto =
      mesesEN[mes] +
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

  document.getElementById(
    "data-atualizacao"
  ).textContent = texto;
}


  /*
   * Corrige a atualização da data quando o idioma é alterado.
   */

  const funcaoOriginalAlterarIdioma = alterarIdioma;

  atualizarData();


  botoesIdioma.forEach(function (botao) {

    botao.addEventListener("click", function () {

      setTimeout(function () {
        atualizarData();
      }, 0);

    });

  });

});
