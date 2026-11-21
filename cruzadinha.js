// ============================================================
//  Cruzadinha do Técnico (atividade avaliativa)
//  - 14 palavras cruzadas, pistas Horizontais e Verticais
//  - digitação direto nas casas
//  - botões Conferir e Reiniciar e contador de acertos
// ============================================================
(function () {
  const TOTAL = CRUZ_PALAVRAS.length;
  const CHAVE = "bitrush-cruz-v1";
  const grade = [];
  let ativa = null;
  let direcao = "H";
  let ignorarFoco = false;

  const elTab = document.getElementById("cruzTabuleiro");
  const elH = document.getElementById("cruzPistasH");
  const elV = document.getElementById("cruzPistasV");
  const elCont = document.getElementById("cruzContador");
  const elMsg = document.getElementById("cruzMsg");
  const elModal = document.getElementById("modalCruz");
  const btnDica = document.getElementById("cruzDica");

  function celulas(p) {
    const lista = [];
    for (let i = 0; i < p.resposta.length; i++) {
      lista.push([p.linha + (p.dir === "V" ? i : 0), p.coluna + (p.dir === "H" ? i : 0)]);
    }
    return lista;
  }

  // ---------- montagem ----------
  function montarGrade() {
    for (let l = 0; l < CRUZ_LINHAS; l++) grade.push(new Array(CRUZ_COLUNAS).fill(null));
    CRUZ_PALAVRAS.forEach((p, idx) => {
      celulas(p).forEach(([l, c], pos) => {
        if (!grade[l][c]) grade[l][c] = { letra: p.resposta[pos], palavras: [] };
        grade[l][c].palavras.push({ idx, pos });
      });
    });

    // numeração na ordem de leitura
    let numero = 0;
    const numeros = {};
    for (let l = 0; l < CRUZ_LINHAS; l++) {
      for (let c = 0; c < CRUZ_COLUNAS; c++) {
        const inicia = CRUZ_PALAVRAS.filter((p) => p.linha === l && p.coluna === c);
        if (inicia.length) {
          numero++;
          numeros[`${l},${c}`] = numero;
          inicia.forEach((p) => (p.numero = numero));
        }
      }
    }

    elTab.style.setProperty("--colunas", CRUZ_COLUNAS);
    for (let l = 0; l < CRUZ_LINHAS; l++) {
      for (let c = 0; c < CRUZ_COLUNAS; c++) {
        const casa = grade[l][c];
        const div = document.createElement("div");
        if (!casa) {
          div.className = "cz-casa vazia";
          elTab.appendChild(div);
          continue;
        }
        div.className = "cz-casa";
        div.dataset.l = l;
        div.dataset.c = c;
        if (numeros[`${l},${c}`]) {
          const n = document.createElement("span");
          n.className = "cz-num";
          n.textContent = numeros[`${l},${c}`];
          div.appendChild(n);
        }
        const input = document.createElement("input");
        input.type = "text";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("autocapitalize", "characters");
        input.setAttribute("aria-label", `Linha ${l + 1}, coluna ${c + 1}`);
        input.addEventListener("focus", () => aoFocar(l, c));
        input.addEventListener("mousedown", () => aoClicar(l, c));
        input.addEventListener("keydown", (e) => aoTeclar(e, l, c));
        input.addEventListener("input", (e) => aoDigitar(e, l, c));
        div.appendChild(input);
        casa.input = input;
        casa.div = div;
        elTab.appendChild(div);
      }
    }
  }

  function montarPistas() {
    [...CRUZ_PALAVRAS.keys()]
      .sort((a, b) => CRUZ_PALAVRAS[a].numero - CRUZ_PALAVRAS[b].numero)
      .forEach((idx) => {
        const p = CRUZ_PALAVRAS[idx];
        const li = document.createElement("li");
        li.innerHTML = `<span class="cz-pnum">${p.numero}</span><span class="cz-ptexto">${p.pista} <em>(${p.resposta.length})</em></span><span class="cz-pstatus" aria-hidden="true"></span>`;
        li.addEventListener("click", () => selecionar(idx, true));
        (p.dir === "H" ? elH : elV).appendChild(li);
        p.li = li;
      });
  }

  // ---------- seleção ----------
  function palavraDaCasa(l, c, dirPreferida) {
    const casa = grade[l][c];
    const naDirecao = casa.palavras.find((w) => CRUZ_PALAVRAS[w.idx].dir === dirPreferida);
    return (naDirecao || casa.palavras[0]).idx;
  }
  function aoClicar(l, c) {
    const casa = grade[l][c];
    if (document.activeElement === casa.input && casa.palavras.length > 1) {
      direcao = direcao === "H" ? "V" : "H";
      selecionar(palavraDaCasa(l, c, direcao), false);
    }
  }
  function aoFocar(l, c) {
    grade[l][c].input.select();
    if (ignorarFoco) return;
    if (ativa !== null && grade[l][c].palavras.some((w) => w.idx === ativa)) { destacar(); return; }
    selecionar(palavraDaCasa(l, c, direcao), false);
  }
  function selecionar(idx, focarVazia) {
    ativa = idx;
    direcao = CRUZ_PALAVRAS[idx].dir;
    destacar();
    const p = CRUZ_PALAVRAS[idx];
    elMsg.textContent = `${p.numero} ${p.dir === "H" ? "Horizontal" : "Vertical"}: ${p.pista}`;
    if (focarVazia) {
      const cs = celulas(p);
      const alvo = cs.find(([l, c]) => !grade[l][c].input.value) || cs[0];
      ignorarFoco = true;
      grade[alvo[0]][alvo[1]].input.focus();
      ignorarFoco = false;
    }
  }
  function destacar() {
    elTab.querySelectorAll(".cz-casa.ativa").forEach((d) => d.classList.remove("ativa"));
    document.querySelectorAll(".cruz-pistas li.ativa").forEach((li) => li.classList.remove("ativa"));
    if (ativa === null) return;
    const p = CRUZ_PALAVRAS[ativa];
    celulas(p).forEach(([l, c]) => grade[l][c].div.classList.add("ativa"));
    p.li.classList.add("ativa");
  }
  function moverNaPalavra(l, c, passo) {
    if (ativa === null) return null;
    const cs = celulas(CRUZ_PALAVRAS[ativa]);
    const novo = cs.findIndex(([a, b]) => a === l && b === c) + passo;
    if (novo < 0 || novo >= cs.length) return null;
    const [nl, nc] = cs[novo];
    grade[nl][nc].input.focus();
    return grade[nl][nc];
  }
  function moverSeta(l, c, dl, dc) {
    let nl = l + dl, nc = c + dc;
    while (nl >= 0 && nl < CRUZ_LINHAS && nc >= 0 && nc < CRUZ_COLUNAS) {
      if (grade[nl][nc]) {
        const idx = palavraDaCasa(nl, nc, dl !== 0 ? "V" : "H");
        ativa = idx;
        ignorarFoco = true;
        grade[nl][nc].input.focus();
        ignorarFoco = false;
        selecionar(idx, false);
        return;
      }
      nl += dl; nc += dc;
    }
  }

  // ---------- digitação ----------
  function limparLetra(t) {
    return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
  }
  function aoDigitar(e, l, c) {
    const letras = limparLetra(e.target.value);
    e.target.value = letras ? letras[letras.length - 1] : "";
    limparStatus(l, c);
    salvar();
    if (e.target.value) moverNaPalavra(l, c, +1);
  }
  function aoTeclar(e, l, c) {
    const input = e.target;
    switch (e.key) {
      case "Backspace":
        if (!input.value) {
          e.preventDefault();
          const ant = moverNaPalavra(l, c, -1);
          if (ant) {
            ant.input.value = "";
            limparStatus(+ant.div.dataset.l, +ant.div.dataset.c);
            salvar();
          }
        }
        break;
      case "ArrowRight": e.preventDefault(); moverSeta(l, c, 0, 1); break;
      case "ArrowLeft": e.preventDefault(); moverSeta(l, c, 0, -1); break;
      case "ArrowDown": e.preventDefault(); moverSeta(l, c, 1, 0); break;
      case "ArrowUp": e.preventDefault(); moverSeta(l, c, -1, 0); break;
      case "Enter":
      case "Tab": {
        e.preventDefault();
        const ordem = [...CRUZ_PALAVRAS.keys()].sort((a, b) =>
          (CRUZ_PALAVRAS[a].dir === CRUZ_PALAVRAS[b].dir ? 0 : CRUZ_PALAVRAS[a].dir === "H" ? -1 : 1) ||
          CRUZ_PALAVRAS[a].numero - CRUZ_PALAVRAS[b].numero);
        const atual = ordem.indexOf(ativa);
        const prox = ordem[(atual + (e.shiftKey ? -1 : 1) + ordem.length) % ordem.length];
        selecionar(prox, true);
        break;
      }
      default:
        if (e.key.length === 1 && /[a-zA-ZÀ-ÿ]/.test(e.key) && input.value) input.value = "";
    }
  }

  // ---------- Conferir, contador e Reiniciar ----------
  function digitada(p) {
    return celulas(p).map(([l, c]) => grade[l][c].input.value || " ").join("");
  }
  function conferir() {
    elTab.querySelectorAll(".certa, .errada").forEach((d) => d.classList.remove("certa", "errada"));
    const res = CRUZ_PALAVRAS.map((p) => digitada(p) === p.resposta);
    CRUZ_PALAVRAS.forEach((p, i) => {
      p.li.classList.remove("certa", "errada");
      p.li.classList.add(res[i] ? "certa" : "errada");
      if (!res[i]) celulas(p).forEach(([l, c]) => grade[l][c].div.classList.add("errada"));
    });
    let acertos = 0;
    CRUZ_PALAVRAS.forEach((p, i) => {
      if (!res[i]) return;
      acertos++;
      celulas(p).forEach(([l, c]) => {
        grade[l][c].div.classList.remove("errada");
        grade[l][c].div.classList.add("certa");
      });
    });
    contador(acertos);
    if (acertos === TOTAL) {
      elMsg.textContent = "🎉 Perfeito! Você acertou todas as 14 palavras. Técnico nota 10!";
      if (window.aoCompletarCruzadinha) window.aoCompletarCruzadinha();
    } else if (acertos === 0) {
      elMsg.textContent = "Nenhuma palavra certa ainda. Releia as pistas com calma: a coleção de chips do jogo pode ajudar!";
    } else {
      elMsg.textContent = `Você acertou ${acertos} de ${TOTAL}. As palavras em vermelho ainda precisam de conserto.`;
    }
  }
  function contador(n) {
    elCont.textContent = `${n} de ${TOTAL} palavras`;
  }
  function limparStatus(l, c) {
    grade[l][c].palavras.forEach(({ idx }) => {
      const p = CRUZ_PALAVRAS[idx];
      if (!p.li.classList.contains("certa") && !p.li.classList.contains("errada")) return;
      p.li.classList.remove("certa", "errada");
      celulas(p).forEach(([a, b]) => grade[a][b].div.classList.remove("certa", "errada"));
    });
  }
  function reiniciar() {
    grade.forEach((linha) => linha.forEach((casa) => {
      if (!casa) return;
      casa.input.value = "";
      casa.div.classList.remove("certa", "errada", "ativa", "revelada");
    }));
    CRUZ_PALAVRAS.forEach((p) => p.li.classList.remove("certa", "errada", "ativa"));
    ativa = null;
    contador(0);
    elMsg.textContent = "Tabuleiro limpo! Clique numa casa ou numa pista para recomeçar.";
    salvar();
  }

  // ---------- salvar letras ----------
  function salvar() {
    try {
      const letras = [];
      grade.forEach((linha) => linha.forEach((casa) => letras.push(casa ? casa.input.value : "")));
      localStorage.setItem(CHAVE, JSON.stringify(letras));
    } catch (e) { /* ignora */ }
  }
  function carregar() {
    try {
      const letras = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (!Array.isArray(letras)) return;
      let i = 0;
      grade.forEach((linha) => linha.forEach((casa) => {
        if (casa) casa.input.value = limparLetra(letras[i] || "").slice(0, 1);
        i++;
      }));
    } catch (e) { /* ignora */ }
  }

  // ---------- abrir / fechar ----------
  function fechar() {
    elModal.hidden = true;
    if (location.hash === "#cruzadinha") history.replaceState(null, "", location.pathname + location.search);
  }
  window.abrirCruzadinha = function () {
    elModal.hidden = false;
    atualizarDica();
  };

  // ---------- dica (prêmio por completar a coleção de chips) ----------
  function atualizarDica() {
    const d = window.dicasCruz ? window.dicasCruz() : { liberada: false, restantes: 0 };
    if (!d.liberada) {
      btnDica.disabled = true;
      btnDica.textContent = "🔒 Dica";
      btnDica.title = "Complete os 16 chips no Bit Rush para liberar dicas";
    } else {
      btnDica.disabled = d.restantes <= 0;
      btnDica.textContent = `💡 Dica (${d.restantes})`;
      btnDica.title = "Revela uma letra da palavra selecionada";
    }
  }
  function darDica() {
    if (ativa === null) { elMsg.textContent = "Selecione uma palavra primeiro e depois peça a dica."; return; }
    const p = CRUZ_PALAVRAS[ativa];
    const alvo = celulas(p).find(([l, c]) => grade[l][c].input.value !== grade[l][c].letra);
    if (!alvo) { elMsg.textContent = "Essa palavra já está completa e certa!"; return; }
    if (!window.usarDicaCruz || !window.usarDicaCruz()) { atualizarDica(); return; }
    const casa = grade[alvo[0]][alvo[1]];
    casa.input.value = casa.letra;
    casa.div.classList.add("revelada");
    limparStatus(alvo[0], alvo[1]);
    salvar();
    atualizarDica();
    elMsg.textContent = `💡 Uma letra de ${p.numero} ${p.dir === "H" ? "Horizontal" : "Vertical"} foi revelada.`;
  }

  montarGrade();
  montarPistas();
  carregar();
  contador(0);
  document.getElementById("cruzConferir").addEventListener("click", conferir);
  document.getElementById("cruzReiniciar").addEventListener("click", reiniciar);
  document.getElementById("cruzFechar").addEventListener("click", fechar);
  btnDica.addEventListener("click", darDica);
  elModal.addEventListener("click", (e) => { if (e.target === elModal) fechar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !elModal.hidden) fechar(); });
  atualizarDica();
  if (location.hash === "#cruzadinha") window.abrirCruzadinha();
})();
