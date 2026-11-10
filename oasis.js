const VERSAO_PYODIDE_OASIS = "0.26.3";

document.addEventListener("DOMContentLoaded", function () {
  const botaoAba = document.querySelector('.aba-botao[data-aba="oasis"]');
  const seletor = document.getElementById("oasis-rodovia");
  const status = document.getElementById("oasis-status");
  if (!botaoAba || !seletor || !status) return;

  let pyodide = null;
  let carregando = false;
  let carregado = false;
  let usandoFallback = false;

  const dadosFallback = {
    todas: {
      total: 8,
      mortos: 2,
      feridos: 13,
      media_feridos: 1.63,
      por_rodovia: { "BR-040": 2, "BR-101": 2, "BR-116": 2, "BR-493": 2 },
      amostra: [
        { data: "2026-01-02", rodovia: "BR-493", municipio: "Guapimirim", tipo: "Colisão lateral", feridos: 1 },
        { data: "2026-01-02", rodovia: "BR-116", municipio: "Barra Mansa", tipo: "Derramamento de carga", feridos: 1 },
        { data: "2026-01-03", rodovia: "BR-101", municipio: "Itaboraí", tipo: "Colisão traseira", feridos: 2 },
        { data: "2026-01-04", rodovia: "BR-040", municipio: "Petrópolis", tipo: "Saída de leito carroçável", feridos: 0 },
        { data: "2026-01-05", rodovia: "BR-116", municipio: "Resende", tipo: "Colisão frontal", feridos: 3 },
        { data: "2026-01-06", rodovia: "BR-493", municipio: "Magé", tipo: "Tombamento", feridos: 1 }
      ]
    }
  };

  function idiomaAtual() {
    return localStorage.getItem("idioma") || "pt";
  }

  function texto(pt, en) {
    return idiomaAtual() === "en" ? en : pt;
  }

  async function garantirPython() {
    if (carregado) return true;
    if (carregando) return false;
    carregando = true;
    status.textContent = texto(
      "Carregando o motor Python no navegador...",
      "Loading the Python engine in the browser..."
    );
    try {
      const modulo = await import(
        "https://cdn.jsdelivr.net/pyodide/v" +
          VERSAO_PYODIDE_OASIS +
          "/full/pyodide.mjs"
      );
      pyodide = await modulo.loadPyodide();
      const resposta = await fetch("oasis.py");
      await pyodide.runPythonAsync(await resposta.text());
      const rodovias = pyodide.globals.get("listar_rodovias")().toJs();
      rodovias.forEach(function (rodovia) {
        const opcao = document.createElement("option");
        opcao.value = rodovia;
        opcao.textContent = rodovia;
        seletor.appendChild(opcao);
      });
      carregado = true;
      status.textContent = "";
      return true;
    } catch (erro) {
      console.error("Não foi possível carregar a demonstração do OASIS:", erro);
      usandoFallback = true;
      ["BR-040", "BR-101", "BR-116", "BR-493"].forEach(function (rodovia) {
        const opcao = document.createElement("option");
        opcao.value = rodovia;
        opcao.textContent = rodovia;
        seletor.appendChild(opcao);
      });
      status.textContent = texto(
        "O motor Python não está disponível agora; exibindo a demonstração local.",
        "The Python engine is unavailable right now; showing the local demonstration."
      );
      carregado = true;
      return true;
    }
  }

  function analisar() {
    if (usandoFallback) {
      const rodovia = seletor.value || "todas";
      if (rodovia === "todas") {
        renderizar(dadosFallback.todas);
        return;
      }
      const dados = dadosFallback.todas.amostra.filter(function (acidente) {
        return acidente.rodovia === rodovia;
      });
      renderizar({
        total: dadosFallback.todas.por_rodovia[rodovia],
        mortos: dados.reduce(function (total, acidente) {
          return total + (acidente.rodovia === "BR-040" && acidente.tipo === "Saída de leito carroçável" ? 1 : 0);
        }, 0),
        feridos: dados.reduce(function (total, acidente) { return total + acidente.feridos; }, 0),
        media_feridos: dados.length ? dados.reduce(function (total, acidente) {
          return total + acidente.feridos;
        }, 0) / dados.length : 0,
        por_rodovia: dadosFallback.todas.por_rodovia,
        amostra: dados
      });
      return;
    }
    const funcao = pyodide.globals.get("analisar");
    const resultadoPython = funcao(seletor.value || "todas");
    const resultado = resultadoPython.toJs({ dict_converter: Object.fromEntries });
    resultadoPython.destroy();
    renderizar(resultado);
  }

  function renderizar(resultado) {
    document.getElementById("oasis-total").textContent = resultado.total;
    document.getElementById("oasis-mortos").textContent = resultado.mortos;
    document.getElementById("oasis-feridos").textContent = resultado.feridos;
    document.getElementById("oasis-media").textContent =
      resultado.media_feridos.toFixed(2).replace(".", ",");

    const grafico = document.getElementById("oasis-grafico");
    grafico.innerHTML = "";
    const maior = Math.max(...Object.values(resultado.por_rodovia), 1);
    Object.entries(resultado.por_rodovia).forEach(function ([rodovia, total]) {
      const linha = document.createElement("div");
      linha.className = "oasis-barra-linha";
      linha.innerHTML =
        '<span class="oasis-barra-label">' + rodovia + "</span>" +
        '<span class="oasis-barra-fundo"><span class="oasis-barra" style="width:' +
        (total / maior) * 100 +
        '%"></span></span><strong>' +
        total +
        "</strong>";
      grafico.appendChild(linha);
    });

    const corpo = document.getElementById("oasis-tabela-corpo");
    corpo.innerHTML = "";
    resultado.amostra.forEach(function (acidente) {
      const linha = document.createElement("tr");
      [acidente.data, acidente.rodovia, acidente.municipio, acidente.tipo, acidente.feridos]
        .forEach(function (valor) {
          const celula = document.createElement("td");
          celula.textContent = valor;
          linha.appendChild(celula);
        });
      corpo.appendChild(linha);
    });
  }

  async function abrirAba() {
    if (await garantirPython()) {
      analisar();
    }
  }

  botaoAba.addEventListener("click", abrirAba);
  seletor.addEventListener("change", function () {
    if (carregado) analisar();
  });
  document.getElementById("oasis-atualizar").addEventListener("click", function () {
    if (carregado) analisar();
  });
  document.addEventListener("idioma-alterado", function () {
    if (carregado) analisar();
  });
});
