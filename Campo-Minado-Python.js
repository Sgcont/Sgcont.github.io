let pyodide = null;
let modoBandeira = false;

const elStatusCarregamento = document.getElementById("status-carregamento");
const elAreaJogo = document.getElementById("area-jogo");
const elTabuleiro = document.getElementById("tabuleiro-cmp");
const elContadorMinas = document.getElementById("contador-minas");
const elStatusJogo = document.getElementById("status-jogo");
const elMensagem = document.getElementById("mensagem-cmp");
const elBotaoReiniciar = document.getElementById("btn-reiniciar-cmp");
const elBotaoModoBandeira = document.getElementById("btn-modo-bandeira-cmp");
const elModoEstado = document.getElementById("modo-estado-cmp");

async function iniciar() {
  pyodide = await loadPyodide();

  const resposta = await fetch("campo_minado.py");
  const codigoPython = await resposta.text();
  await pyodide.runPythonAsync(codigoPython);

  elStatusCarregamento.style.display = "none";
  elAreaJogo.style.display = "block";

  novoJogo();
}

function chamarPython(funcao, ...args) {
  const fn = pyodide.globals.get(funcao);
  const resultadoPy = fn(...args);
  const resultado = resultadoPy.toJs({ dict_converter: Object.fromEntries });
  resultadoPy.destroy();
  return resultado;
}

function novoJogo() {
  const estado = chamarPython("novo_jogo");
  elMensagem.textContent = "";
  elMensagem.className = "mensagem-cmp";
  renderizar(estado);
}

function clicarCelula(r, c) {
  if (modoBandeira) {
    const estado = chamarPython("marcar", r, c);
    renderizar(estado);
    return;
  }
  const estado = chamarPython("clicar", r, c);
  renderizar(estado);
}

function renderizar(estado) {
  const tabuleiro = estado.tabuleiro;
  const linhas = estado.linhas;
  const colunas = estado.colunas;

  elTabuleiro.innerHTML = "";
  elTabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;

  let bandeirasColocadas = estado.bandeiras;
  elContadorMinas.textContent = String(estado.minas - bandeirasColocadas);

  for (let r = 0; r < linhas; r++) {
    for (let c = 0; c < colunas; c++) {
      const celula = tabuleiro[r][c];
      const div = document.createElement("div");
      div.className = "celula-cmp";

      const revelada = celula.revelada;
      const bomba = celula.bomba;
      const bandeira = celula.bandeira;
      const adjacentes = celula.adjacentes;

      if (revelada) {
        div.classList.add("revelada-cmp");
        if (bomba) {
          div.classList.add("bomba-cmp");
          div.textContent = "💣";
        } else if (adjacentes > 0) {
          div.textContent = adjacentes;
          div.classList.add("n" + adjacentes + "-cmp");
        }
      } else if (bandeira) {
        div.textContent = "🚩";
      }

      div.addEventListener("click", () => clicarCelula(r, c));
      div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const estadoAtual = chamarPython("marcar", r, c);
        renderizar(estadoAtual);
      });

      elTabuleiro.appendChild(div);
    }
  }

  if (estado.jogo_terminado) {
    if (estado.vitoria) {
      elStatusJogo.textContent = "venceu";
      elMensagem.textContent = "✅ Todas as casas seguras reveladas. Você venceu!";
      elMensagem.className = "mensagem-cmp";
    } else {
      elStatusJogo.textContent = "perdeu";
      elMensagem.textContent = "💥 Bomba! Clique em ⟳ para jogar de novo.";
      elMensagem.className = "mensagem-cmp derrota-cmp";
    }
  } else {
    elStatusJogo.textContent = "jogando";
  }
}

elBotaoReiniciar.addEventListener("click", novoJogo);

elBotaoModoBandeira.addEventListener("click", () => {
  modoBandeira = !modoBandeira;
  elModoEstado.textContent = modoBandeira ? "ligado" : "desligado";
  elBotaoModoBandeira.classList.toggle("ativo", modoBandeira);
});

iniciar();
