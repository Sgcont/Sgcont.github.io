/* =========================================================
   PREVISAO.JS — previsão de notas futuras via ML (Pyodide)
   -----------------------------------------------------------
   Independente do script.js principal: o Pyodide só é carregado
   quando a pessoa realmente abre a aba "Prevendo Notas Futuras",
   e não no carregamento normal da página — assim o resto do site
   continua leve para quem não for usar essa aba. Se o carregamento
   falhar por qualquer motivo, só esta aba fica indisponível.
========================================================= */

const VERSAO_PYODIDE = "0.26.3";

document.addEventListener("DOMContentLoaded", function () {

  const botaoAba =
    document.querySelector('.aba-botao[data-aba="previsao"]');

  const selectMateria =
    document.getElementById("select-materia-previsao");

  const previsaoStatus =
    document.getElementById("previsao-status");

  const previsaoResultado =
    document.getElementById("previsao-resultado");

  const previsaoNomeMateria =
    document.getElementById("previsao-nome-materia");

  const previsaoValor =
    document.getElementById("previsao-valor");

  const previsaoMargem =
    document.getElementById("previsao-margem");

  const previsaoListaPrereqs =
    document.getElementById("previsao-lista-prereqs");


  if (!botaoAba || !selectMateria) {
    return;
  }


  function idiomaAtual() {
    return localStorage.getItem("idioma") || "pt";
  }


  let pyodide = null;
  let carregando = false;
  let carregado = false;


  async function garantirPyodideCarregado() {

    if (carregado) {
      return true;
    }

    if (carregando) {
      return false;
    }

    carregando = true;

    previsaoStatus.textContent =
      idiomaAtual() === "en"
        ? "Loading the Python engine in the browser (this can take a few seconds)..."
        : "Carregando o motor Python no navegador (pode levar alguns segundos)...";

    try {

      const pyodideModulo = await import(
        "https://cdn.jsdelivr.net/pyodide/v" + VERSAO_PYODIDE + "/full/pyodide.mjs"
      );

      pyodide = await pyodideModulo.loadPyodide();

      const resposta = await fetch("previsao.py");
      const codigoPython = await resposta.text();
      await pyodide.runPythonAsync(codigoPython);

      carregado = true;
      previsaoStatus.textContent = "";

      return true;

    } catch (erro) {

      console.error("Não foi possível carregar o modelo de previsão:", erro);

      previsaoStatus.textContent =
        idiomaAtual() === "en"
          ? "Could not load the prediction model right now. Try reloading the page."
          : "Não foi possível carregar o modelo de previsão agora. Tente recarregar a página.";

      carregando = false;

      return false;

    }

  }


  function chamarPython(funcao, ...args) {
    const fn = pyodide.globals.get(funcao);
    const resultadoPy = fn(...args);
    const resultado = resultadoPy.toJs({ dict_converter: Object.fromEntries });
    resultadoPy.destroy();
    return resultado;
  }


  async function popularSelectMaterias() {

    const materias = chamarPython("listar_materias_alvo");

    selectMateria.innerHTML = "";

    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.value = "";
    opcaoPadrao.textContent =
      idiomaAtual() === "en" ? "Select a course..." : "Selecione uma disciplina...";
    selectMateria.appendChild(opcaoPadrao);

    materias.forEach(function (materia) {
      const opcao = document.createElement("option");
      opcao.value = materia.codigo;
      opcao.textContent =
        materia.periodo + "º período — " + materia.codigo + " — " + materia.nome;
      selectMateria.appendChild(opcao);
    });

  }


  function renderizarResultado(resultado) {

    if (!resultado || resultado.erro) {

      previsaoResultado.style.display = "none";

      previsaoStatus.textContent =
        resultado && resultado.erro
          ? resultado.erro
          : idiomaAtual() === "en"
            ? "Could not calculate a prediction for this course."
            : "Não foi possível calcular uma previsão para essa disciplina.";

      return;

    }

    previsaoStatus.textContent = "";
    previsaoResultado.style.display = "block";

    previsaoNomeMateria.textContent =
      resultado.codigo + " — " + resultado.nome;

    const idioma = idiomaAtual();

    previsaoValor.textContent =
      idioma === "en"
        ? resultado.media_estimada.toFixed(1)
        : resultado.media_estimada.toFixed(1).replace(".", ",");

    if (resultado.margem_erro !== null && resultado.margem_erro !== undefined) {

      const margemTxt =
        idioma === "en"
          ? resultado.margem_erro.toFixed(1)
          : resultado.margem_erro.toFixed(1).replace(".", ",");

      previsaoMargem.textContent = "± " + margemTxt + " (99%)";

      const limiteInferior = Math.max(0, resultado.media_estimada - resultado.margem_erro);
      const limiteSuperior = Math.min(10, resultado.media_estimada + resultado.margem_erro);

      const fmt = function (n) {
        return idioma === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ",");
      };

      const previsaoIntervalo = document.getElementById("previsao-intervalo");
      if (previsaoIntervalo) {
        previsaoIntervalo.textContent =
          idioma === "en"
            ? "With 99% confidence, the grade is estimated to fall between " + fmt(limiteInferior) + " and " + fmt(limiteSuperior) + " (a wide range like this reflects how little data the model has to work with)."
            : "Com 99% de confiança, a nota estimada fica entre " + fmt(limiteInferior) + " e " + fmt(limiteSuperior) + " (um intervalo largo assim reflete o quão pouco dado o modelo tem pra trabalhar).";
      }

    } else {

      previsaoMargem.textContent = "";

      const previsaoIntervalo = document.getElementById("previsao-intervalo");
      if (previsaoIntervalo) {
        previsaoIntervalo.textContent = "";
      }

    }

    previsaoListaPrereqs.innerHTML = "";

    resultado.prereqs.forEach(function (prereq) {

      const li = document.createElement("li");

      const notaTxt =
        prereq.nota === null || prereq.nota === undefined
          ? "?"
          : idioma === "en"
            ? prereq.nota.toFixed(1)
            : prereq.nota.toFixed(1).replace(".", ",");

      let texto = prereq.codigo + " — " + prereq.nome + ": " + notaTxt;

      li.textContent = texto;

      if (prereq.previsto) {
        const tag = document.createElement("span");
        tag.className = "previsto-tag";
        tag.textContent =
          idioma === "en" ? "  (predicted value)" : "  (valor previsto)";
        li.appendChild(tag);
      }

      previsaoListaPrereqs.appendChild(li);

    });

  }


  async function calcularEExibir() {

    const codigo = selectMateria.value;

    if (!codigo) {
      previsaoResultado.style.display = "none";
      return;
    }

    const resultado = chamarPython("calcular_previsao", codigo);

    renderizarResultado(resultado);

  }


  botaoAba.addEventListener("click", async function () {

    const ok = await garantirPyodideCarregado();

    if (!ok) {
      return;
    }

    await popularSelectMaterias();

  });


  selectMateria.addEventListener("change", calcularEExibir);


  document.addEventListener("idioma-alterado", function () {

    if (!carregado) {
      return;
    }

    popularSelectMaterias().then(function () {
      if (selectMateria.value) {
        calcularEExibir();
      }
    });

  });

});
