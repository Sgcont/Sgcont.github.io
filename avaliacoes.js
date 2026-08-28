/* =========================================================
   AVALIACOES.JS — sistema de avaliação global (Firestore)
   -----------------------------------------------------------
   Este arquivo é independente do script.js: se o Firebase não
   carregar por qualquer motivo (bloqueador de anúncio, rede
   instável, etc.), só a seção "Avalie-me" fica indisponível —
   o resto do site (abas, tradução, contador) continua normal.

   Os valores de FIREBASE_CONFIG abaixo já são os do projeto
   "site-lucas-a54b1". Isso NÃO é segredo: a apiKey do Firebase
   é pública por design — quem protege os dados são as Regras
   de Segurança do Firestore, configuradas no console do
   Firebase, não este arquivo.
========================================================= */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAv9VnBZvm_3lmwzNiR7zyNLu2vCC6tCRU",
  authDomain: "site-lucas-a54b1.firebaseapp.com",
  projectId: "site-lucas-a54b1",
  storageBucket: "site-lucas-a54b1.firebasestorage.app",
  messagingSenderId: "703800066914",
  appId: "1:703800066914:web:ae3ec7ee5c5272ba24e23b"
};

const NOME_COLECAO_AVALIACOES = "avaliacoes_monitoria";
const VERSAO_FIREBASE = "12.18.0";

const CHAVE_UUID_VISITANTE = "uuid-visitante-avaliacao";
const CHAVE_JA_AVALIOU = "avaliacao-enviada-monitoria";


document.addEventListener("DOMContentLoaded", async function () {

  const estrelas =
    document.querySelectorAll(".estrela");

  const valorSelecionado =
    document.getElementById("valor-selecionado");

  const botaoEnviar =
    document.getElementById("enviar-avaliacao");

  const campoMensagem =
    document.getElementById("mensagem-avaliacao");

  const mediaValor =
    document.getElementById("media-valor");

  const estrelasPreenchidas =
    document.getElementById("estrelas-preenchidas");

  const quantidadeAvaliacoes =
    document.getElementById("quantidade-avaliacoes");

  const distribuicaoAvaliacoes =
    document.getElementById("distribuicao-avaliacoes");

  const areaEstrelas =
    document.getElementById("estrelas-avaliacao");


  /* Esta página pode não ter a seção de avaliação (ex: se um dia
     você tiver outra página no site) — nesse caso, não faz nada. */

  if (!mediaValor) {
    return;
  }


  function idiomaAtual() {
    return localStorage.getItem("idioma") || "pt";
  }


  function obterUuidVisitante() {
    let uuid = localStorage.getItem(CHAVE_UUID_VISITANTE);
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem(CHAVE_UUID_VISITANTE, uuid);
    }
    return uuid;
  }


  function jaAvaliou() {
    return localStorage.getItem(CHAVE_JA_AVALIOU) === "1";
  }


  function mostrarEstrelas(valor) {

    estrelas.forEach(function (estrela) {

      const numero =
        Number(estrela.getAttribute("data-valor"));

      if (numero <= valor) {
        estrela.classList.add("selecionada");
      } else {
        estrela.classList.remove("selecionada");
      }

    });

  }


  function bloquearFormularioAvaliacao(mensagem) {

    estrelas.forEach(function (estrela) {
      estrela.disabled = true;
    });

    if (botaoEnviar) {
      botaoEnviar.disabled = true;
    }

    if (campoMensagem) {
      campoMensagem.disabled = true;
    }

    if (valorSelecionado && mensagem) {
      valorSelecionado.textContent = mensagem;
    }

  }


  function textoJaAvaliou() {
    return idiomaAtual() === "en"
      ? "You have already rated. Thank you!"
      : "Você já avaliou. Obrigado!";
  }


  if (jaAvaliou()) {
    bloquearFormularioAvaliacao(textoJaAvaliou());
  }


  /* Reage a troca de idioma feita pelo script.js principal */

  document.addEventListener("idioma-alterado", function () {

    if (jaAvaliou() && valorSelecionado) {
      valorSelecionado.textContent = textoJaAvaliou();
    }

    carregarMediaGlobal();

  });


  let avaliacaoSelecionada = 0;


  estrelas.forEach(function (estrela) {

    estrela.addEventListener("mouseenter", function () {
      if (jaAvaliou()) return;
      const valor = Number(estrela.getAttribute("data-valor"));
      mostrarEstrelas(valor);
    });


    estrela.addEventListener("click", function () {

      if (jaAvaliou()) return;

      avaliacaoSelecionada =
        Number(estrela.getAttribute("data-valor"));

      mostrarEstrelas(avaliacaoSelecionada);

      if (idiomaAtual() === "en") {

        valorSelecionado.textContent =
          "Selected rating: " +
          avaliacaoSelecionada +
          " star" +
          (avaliacaoSelecionada > 1 ? "s" : "");

      } else {

        valorSelecionado.textContent =
          "Avaliação selecionada: " +
          avaliacaoSelecionada +
          " estrela" +
          (avaliacaoSelecionada > 1 ? "s" : "");

      }

    });

  });


  if (areaEstrelas) {

    areaEstrelas.addEventListener("mouseleave", function () {
      if (jaAvaliou()) return;
      mostrarEstrelas(avaliacaoSelecionada);
    });

  }


  /* =========================================================
     CARREGAMENTO DO FIREBASE (dinâmico, com tratamento de erro)
  ========================================================== */

  let db = null;
  let firestoreApi = null;

  try {

    const [{ initializeApp }, firestoreModulo] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/" + VERSAO_FIREBASE + "/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/" + VERSAO_FIREBASE + "/firebase-firestore.js")
    ]);

    const app = initializeApp(FIREBASE_CONFIG);
    db = firestoreModulo.getFirestore(app);
    firestoreApi = firestoreModulo;

  } catch (erro) {

    console.error("Não foi possível carregar o sistema de avaliação (Firebase):", erro);

    if (quantidadeAvaliacoes) {
      quantidadeAvaliacoes.textContent =
        idiomaAtual() === "en"
          ? "Rating system temporarily unavailable."
          : "Sistema de avaliação temporariamente indisponível.";
    }

    bloquearFormularioAvaliacao(
      idiomaAtual() === "en"
        ? "Rating system temporarily unavailable."
        : "Sistema de avaliação temporariamente indisponível."
    );

    return;

  }


  async function carregarMediaGlobal() {

    const idioma = idiomaAtual();

    try {

      const instantaneo = await firestoreApi.getDocs(
        firestoreApi.collection(db, NOME_COLECAO_AVALIACOES)
      );

      const contagemPorNota = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let soma = 0;
      let total = 0;

      instantaneo.forEach(function (docSnap) {

        const dados = docSnap.data();
        const nota = Number(dados.nota);

        if (nota >= 1 && nota <= 5) {
          contagemPorNota[nota] = (contagemPorNota[nota] || 0) + 1;
          soma += nota;
          total += 1;
        }

      });

      if (total === 0) {

        mediaValor.textContent = "0,0";
        estrelasPreenchidas.style.width = "0%";

        quantidadeAvaliacoes.textContent =
          idioma === "en" ? "No ratings yet." : "Nenhuma avaliação ainda.";

        if (distribuicaoAvaliacoes) {
          distribuicaoAvaliacoes.innerHTML = "";
        }

        return;

      }

      const media = soma / total;

      mediaValor.textContent =
        idioma === "en"
          ? media.toFixed(1)
          : media.toFixed(1).replace(".", ",");

      estrelasPreenchidas.style.width = (media / 5) * 100 + "%";

      quantidadeAvaliacoes.textContent =
        idioma === "en"
          ? total + (total === 1 ? " rating" : " ratings")
          : total + (total === 1 ? " avaliação" : " avaliações");

      if (distribuicaoAvaliacoes) {

        distribuicaoAvaliacoes.innerHTML = "";

        for (let n = 5; n >= 1; n--) {

          const linha = document.createElement("div");
          linha.className = "linha-distribuicao";

          const contagemTxt =
            idioma === "en"
              ? contagemPorNota[n] + (contagemPorNota[n] === 1 ? " person" : " people")
              : contagemPorNota[n] + (contagemPorNota[n] === 1 ? " pessoa" : " pessoas");

          linha.textContent = n + " ★ — " + contagemTxt;

          distribuicaoAvaliacoes.appendChild(linha);

        }

      }

    } catch (erro) {

      console.error("Erro ao carregar avaliações:", erro);

      if (quantidadeAvaliacoes) {
        quantidadeAvaliacoes.textContent =
          idioma === "en"
            ? "Could not load ratings right now."
            : "Não foi possível carregar as avaliações no momento.";
      }

    }

  }


  if (botaoEnviar) {

    botaoEnviar.addEventListener("click", async function () {

      if (jaAvaliou()) {
        return;
      }

      if (avaliacaoSelecionada === 0) {

        valorSelecionado.textContent =
          idiomaAtual() === "en"
            ? "Please select a rating first."
            : "Selecione uma avaliação primeiro.";

        return;

      }

      botaoEnviar.disabled = true;

      try {

        const uuid = obterUuidVisitante();

        const mensagemDigitada =
          campoMensagem ? campoMensagem.value.trim().slice(0, 500) : "";

        await firestoreApi.setDoc(
          firestoreApi.doc(db, NOME_COLECAO_AVALIACOES, uuid),
          {
            nota: avaliacaoSelecionada,
            mensagem: mensagemDigitada,
            criadoEm: firestoreApi.serverTimestamp()
          }
        );

        localStorage.setItem(CHAVE_JA_AVALIOU, "1");

        valorSelecionado.textContent =
          idiomaAtual() === "en"
            ? "Thank you for your feedback!"
            : "Obrigado pela avaliação!";

        bloquearFormularioAvaliacao();

        await carregarMediaGlobal();

      } catch (erro) {

        console.error("Erro ao enviar avaliação:", erro);

        valorSelecionado.textContent =
          idiomaAtual() === "en"
            ? "Could not send your rating. Please try again later."
            : "Não foi possível enviar sua avaliação. Tente novamente mais tarde.";

        botaoEnviar.disabled = false;

      }

    });

  }


  carregarMediaGlobal();

});
