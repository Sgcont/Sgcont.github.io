document.addEventListener("DOMContentLoaded", function () {
  const botoes = document.querySelectorAll(".aba-botao");
  const conteudos = document.querySelectorAll(".aba-conteudo");

  botoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const alvo = botao.getAttribute("data-aba");

      botoes.forEach(function (b) { b.classList.remove("ativo"); });
      conteudos.forEach(function (c) { c.classList.remove("ativo"); });

      botao.classList.add("ativo");
      document.getElementById(alvo).classList.add("ativo");
    });
  });

  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  const hoje = new Date();
  const texto = hoje.getDate() + " de " + meses[hoje.getMonth()] + " de " + hoje.getFullYear();
  document.getElementById("data-atualizacao").textContent = texto;
});