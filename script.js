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

  // Data da última atualização do currículo.
  // IMPORTANTE: atualize esta linha manualmente toda vez que editar o site
  // (ela não pega mais a data de hoje automaticamente).
  const ULTIMA_ATUALIZACAO = "21 de agosto de 2026";
  document.getElementById("data-atualizacao").textContent = ULTIMA_ATUALIZACAO;

  // Contador de visitas (usa a API pública gratuita "Abacus", que documenta
  // suporte a CORS para chamadas feitas direto do navegador).
  // A chave abaixo precisa ser única para não colidir com o contador de outro site.
  const NAMESPACE_CONTADOR = "sgcont.github.io";
  const CHAVE_CONTADOR = "perfil-visitas";
  const elContadorVisitas = document.getElementById("contador-visitas");

  if (elContadorVisitas) {
    fetch("https://abacus.jasoncameron.dev/hit/" + NAMESPACE_CONTADOR + "/" + CHAVE_CONTADOR)
      .then(function (resposta) { return resposta.json(); })
      .then(function (dados) {
        elContadorVisitas.textContent =
          "Você é a " + dados.value + "ª pessoa a entrar no meu perfil";
      })
      .catch(function () {
        // Se a API estiver fora do ar (ou bloquear a chamada), simplesmente
        // não mostra o contador, em vez de quebrar o resto da página.
        elContadorVisitas.textContent = "";
      });
  }
});
