// ============================================================
//  Bit Rush: Corrida dos Bits
//  Arcade de duas teclas: portas lógicas + termos de arquitetura
// ============================================================
"use strict";

const $ = (s) => document.querySelector(s);
const sorteio = (lista) => lista[Math.floor(Math.random() * lista.length)];
const bit = () => (Math.random() < 0.5 ? 0 : 1);

const LISTA_TERMOS = Object.keys(TERMOS);
const MAX_CHIP = 3;
const MAX_PORTA = 5;
const CHAVE = "bitrush-v1";
const TEMPOS = { porta: [5, 2.2], termo: [8, 4], chefe: [12, 7] }; // [inicial, mínimo] em segundos
const CHEFE_A_CADA = 15;

// ---------- progresso salvo ----------
function carregar() {
  const base = { recorde: 0, chips: {}, portas: {}, partidas: 0, som: true, dicas: 0, dicasLiberadas: false, viuComoJogar: false };
  try {
    return Object.assign(base, JSON.parse(localStorage.getItem(CHAVE) || "{}"));
  } catch (e) {
    return base;
  }
}
const salvo = carregar();
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(salvo)); } catch (e) { /* sem armazenamento */ }
}
const nivelChip = (t) => salvo.chips[t] || 0;
const nivelPorta = (p) => salvo.portas[p] || 0;
const chipsDominados = () => LISTA_TERMOS.filter((t) => nivelChip(t) >= MAX_CHIP).length;

// ---------- sons (Web Audio, sem arquivos) ----------
let audioCtx = null;
function audio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tom(freq, dur, tipo = "square", vol = 0.06, atraso = 0) {
  if (!salvo.som) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime + atraso;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
const SOM = {
  acerto(combo) {
    const f = 440 * Math.pow(2, Math.min(combo, 16) / 12); // sobe meio tom a cada acerto seguido
    tom(f, 0.08, "square", 0.05);
    tom(f * 1.5, 0.08, "square", 0.035, 0.05);
  },
  erro() { tom(150, 0.22, "sawtooth", 0.07); tom(105, 0.3, "sawtooth", 0.06, 0.09); },
  nivel() { [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.12, "square", 0.05, i * 0.08)); },
  chefe() { [440, 330, 440, 330].forEach((f, i) => tom(f, 0.12, "sawtooth", 0.045, i * 0.13)); },
  vida() { [784, 1047, 1319].forEach((f, i) => tom(f, 0.1, "triangle", 0.08, i * 0.07)); },
  chip() { [988, 1319].forEach((f, i) => tom(f, 0.12, "triangle", 0.08, i * 0.09)); },
  fim() { [523, 415, 330, 262].forEach((f, i) => tom(f, 0.2, "triangle", 0.08, i * 0.15)); },
  recorde() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tom(f, 0.12, "square", 0.05, i * 0.08)); },
  tique() { tom(1400, 0.03, "square", 0.025); },
  clique() { tom(660, 0.04, "square", 0.035); },
};

// ---------- desenhos ----------
function portaPaths(nome) {
  const corpoAnd = "M28 14 H52 A26 26 0 0 1 52 66 H28 Z";
  const corpoOr = "M24 14 Q40 40 24 66 Q64 66 84 40 Q64 14 24 14 Z";
  let d = "", extra = "", saidaX = 84;
  switch (nome) {
    case "AND": d = corpoAnd; saidaX = 78; break;
    case "NAND": d = corpoAnd; extra = '<circle cx="83" cy="40" r="5"/>'; saidaX = 88; break;
    case "OR": d = corpoOr; break;
    case "NOR": d = corpoOr; extra = '<circle cx="89" cy="40" r="5"/>'; saidaX = 94; break;
    case "XOR": d = corpoOr; extra = '<path d="M16 14 Q32 40 16 66"/>'; break;
    case "NOT": d = "M30 16 L74 40 L30 64 Z"; extra = '<circle cx="79" cy="40" r="5"/>'; break;
  }
  let entradas;
  if (nome === "NOT") entradas = '<line x1="4" y1="40" x2="30" y2="40"/>';
  else {
    const x = nome === "AND" || nome === "NAND" ? 28 : nome === "XOR" ? 22 : 30;
    entradas = `<line x1="4" y1="28" x2="${x}" y2="28"/><line x1="4" y1="52" x2="${x}" y2="52"/>`;
  }
  return `<g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${entradas}<path d="${d}"/>${extra}<line x1="${saidaX}" y1="40" x2="106" y2="40"/></g>`;
}
function svgPorta(nome) {
  return `<svg class="svg-porta" viewBox="0 0 110 80" aria-hidden="true">${portaPaths(nome)}</svg>`;
}
// Circuito da rodada: entradas acesas/apagadas -> porta -> saída "?"
function svgCircuito(nome, a, b) {
  const um = nome === "NOT";
  const ys = um ? [50] : [38, 62];
  const bits = um ? [a] : [a, b];
  let s = `<svg class="circuito" viewBox="0 0 240 100" role="img" aria-label="Porta ${nome} com A=${a}${um ? "" : ", B=" + b}">`;
  bits.forEach((v, i) => {
    const y = ys[i];
    s += `<text class="bit-nome" x="8" y="${y}">${i ? "B" : "A"}</text>`;
    s += `<line class="fio ${v ? "on" : ""}" x1="44" y1="${y}" x2="66" y2="${y}"/>`;
    s += `<circle class="bit ${v ? "on" : ""}" cx="31" cy="${y}" r="12"/><text class="bit-txt" x="31" y="${y + 1}">${v}</text>`;
  });
  s += `<g class="porta-corpo" transform="translate(60 10)">${portaPaths(nome)}</g>`;
  s += `<line class="fio" x1="166" y1="50" x2="198" y2="50"/>`;
  s += `<circle class="saida" cx="214" cy="50" r="16"/><text class="saida-txt" x="214" y="51">?</text>`;
  return s + "</svg>";
}
function linhasPorta(nome) {
  return nome === "NOT" ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
}
// Tabela verdade; "outra" acrescenta a coluna de uma segunda porta para comparar
function tabelaHtml(nome, opcoes = {}) {
  const { destaque = -1, rotulo = nome, outra = null } = opcoes;
  const um = nome === "NOT";
  let h = `<table class="tv"><tr><th>A</th>${um ? "" : "<th>B</th>"}<th>${rotulo}</th>${outra ? `<th>${outra}</th>` : ""}</tr>`;
  linhasPorta(nome).forEach((linha, i) => {
    const s = PORTAS[nome].f(linha[0], linha[1]);
    h += `<tr class="${i === destaque ? "destaque" : ""}">${linha.map((v) => `<td>${v}</td>`).join("")}<td class="saida-col">${s}</td>`;
    if (outra) h += `<td class="saida-col outra">${PORTAS[outra].f(linha[0], linha[1])}</td>`;
    h += "</tr>";
  });
  return h + "</table>";
}

// ---------- elementos ----------
const el = {
  menu: $("#telaMenu"), jogo: $("#telaJogo"), fim: $("#telaFim"),
  vidas: $("#hudVidas"), pontos: $("#hudPontos"), combo: $("#hudCombo"), comboBloco: $("#hudComboBloco"), nivel: $("#hudNivel"),
  barra: $("#barraTempo"), carta: $("#carta"), tipo: $("#cartaTipo"), conteudo: $("#cartaConteudo"),
  dica: $("#cartaDica"), explica: $("#cartaExplica"), banner: $("#banner"), flutuantes: $("#flutuantes"),
  esq: $("#btnEsq"), dir: $("#btnDir"), pausa: $("#pausa"),
};

// ---------- estado da partida ----------
let j = null;

function novaPartida() {
  j = {
    pontos: 0, vidas: 3, combo: 0, maiorCombo: 0, acertos: 0, nivel: 1,
    rodada: null, estado: "jogando", travado: true,
    total: 1, restante: 1, ultimoTs: null, ultimoTique: null,
    ultimosTermos: [], ultimosTipos: [], erros: [], novosChips: [],
    chefePendente: false, timers: [], podeSeguir: false,
  };
  mostrarTela("jogo");
  el.pausa.hidden = true;
  atualizarHud();
  agendar(proxima, 150);
}
function agendar(fn, ms) {
  const id = setTimeout(() => {
    if (j) j.timers = j.timers.filter((t) => t !== id);
    fn();
  }, ms);
  j.timers.push(id);
}
function limparTimers() {
  if (j) j.timers.forEach(clearTimeout);
}

function mostrarTela(nome) {
  el.menu.hidden = nome !== "menu";
  el.jogo.hidden = nome !== "jogo";
  el.fim.hidden = nome !== "fim";
  window.scrollTo(0, 0);
}

function portasLiberadas() {
  return ORDEM_PORTAS.slice(0, Math.min(6, 2 + j.nivel));
}
function tempoPara(tipo) {
  const [base, min] = TEMPOS[tipo];
  return Math.max(min, base * Math.pow(0.92, j.nivel - 1));
}
function sortearPeso(itens, peso) {
  const ws = itens.map(peso);
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < itens.length; i++) {
    r -= ws[i];
    if (r <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}
const nomeDe = (id) => (TERMOS[id] ? TERMOS[id].nome : id);

// ---------- geração das rodadas ----------
function gerarRodada() {
  if (j.chefePendente) {
    j.chefePendente = false;
    return rodadaChefe();
  }
  let tipo = Math.random() < 0.45 ? "porta" : "termo";
  const u = j.ultimosTipos;
  if (u.length >= 2 && u[u.length - 1] === tipo && u[u.length - 2] === tipo) tipo = tipo === "porta" ? "termo" : "porta";
  u.push(tipo);
  if (u.length > 3) u.shift();
  return tipo === "porta" ? rodadaPorta() : rodadaTermo();
}

function rodadaTermo() {
  const candidatos = LISTA_TERMOS.filter((t) => !j.ultimosTermos.includes(t));
  // termos menos dominados aparecem mais
  const id = sortearPeso(candidatos, (t) => 1 + (MAX_CHIP - nivelChip(t)) * 2);
  j.ultimosTermos.push(id);
  if (j.ultimosTermos.length > 5) j.ultimosTermos.shift();

  const termo = TERMOS[id];
  const carta = sorteio(termo.cartas);
  const texto = typeof carta === "string" ? carta : carta.t;
  const rival = sorteio((typeof carta === "object" && carta.r) || termo.rivais);
  const certoEsq = Math.random() < 0.5;
  const rotulo = (x, lado) => `${lado === "esq" ? '<span class="seta">←</span>' : ""}<span>${nomeDe(x)}</span>${lado === "dir" ? '<span class="seta">→</span>' : ""}`;
  return {
    tipo: "termo", termo: id, rival,
    certo: certoEsq ? "esq" : "dir",
    rotuloTipo: "QUAL É?",
    html: `<p class="carta-desc">${texto}</p>`,
    esq: rotulo(certoEsq ? id : rival, "esq"),
    dir: rotulo(certoEsq ? rival : id, "dir"),
    tempo: tempoPara("termo"),
  };
}

function rodadaPorta() {
  const lib = portasLiberadas();
  const p = sortearPeso(lib, (x) => 1 + (MAX_PORTA - nivelPorta(x)));
  const a = bit();
  const b = p === "NOT" ? 0 : bit();
  const s = PORTAS[p].f(a, b);
  const escondido = j.nivel >= 5 && Math.random() < 0.5;
  return {
    tipo: "porta", porta: p, a, b, s,
    certo: s === 0 ? "esq" : "dir",
    rotuloTipo: "QUAL É A SAÍDA?",
    html: `${svgCircuito(p, a, b)}<p class="porta-nome ${escondido ? "escondido" : ""}">${escondido ? "???" : p}</p>`,
    dica: nivelPorta(p) < 2 && !escondido ? PORTAS[p].regra : "",
    esq: '<span class="seta">←</span><span class="bitgrande">0</span>',
    dir: '<span class="bitgrande">1</span><span class="seta">→</span>',
    tempo: tempoPara("porta"),
  };
}

function rodadaChefe() {
  const duplas = ["AND", "OR", "NAND", "NOR", "XOR"];
  const lib = portasLiberadas().filter((p) => p !== "NOT");
  const p = sorteio(lib);
  let outras = lib.filter((x) => x !== p);
  if (!outras.length) outras = duplas.filter((x) => x !== p);
  const rival = sorteio(outras);
  const certoEsq = Math.random() < 0.5;
  const opcao = (nome) => `${svgPorta(nome)}<span>${nome}</span>`;
  return {
    tipo: "chefe", porta: p, rival,
    certo: certoEsq ? "esq" : "dir",
    rotuloTipo: "⚠ CHEFÃO: PORTA MISTERIOSA",
    html: `<p class="carta-pergunta">Qual porta gera esta tabela verdade?</p>${tabelaHtml(p, { rotulo: "S" })}`,
    esq: opcao(certoEsq ? p : rival),
    dir: opcao(certoEsq ? rival : p),
    tempo: tempoPara("chefe"),
  };
}

// ---------- ciclo da partida ----------
function proxima() {
  if (!j) return;
  const r = gerarRodada();
  j.rodada = r;
  j.total = r.tempo;
  j.restante = r.tempo;
  j.ultimoTs = null;
  j.ultimoTique = null;
  if (j.estado === "pausa") j.estadoAntes = "jogando"; // a carta chega, mas o jogo continua pausado
  else j.estado = "jogando";
  j.travado = false;

  el.carta.className = `carta tipo-${r.tipo}`;
  void el.carta.offsetWidth; // reinicia a animação de entrada
  el.carta.classList.add("entrando");
  el.carta.style.transform = "";
  el.tipo.textContent = r.rotuloTipo;
  el.conteudo.innerHTML = r.html;
  el.dica.textContent = r.dica || "";
  el.explica.hidden = true;
  el.esq.innerHTML = r.esq;
  el.dir.innerHTML = r.dir;
  el.esq.setAttribute("aria-label", "Esquerda: " + el.esq.textContent.replace("←", "").trim());
  el.dir.setAttribute("aria-label", "Direita: " + el.dir.textContent.replace("→", "").trim());
}

function responder(lado) {
  if (!j) return;
  if (j.estado === "explicando") {
    if (j.podeSeguir) seguir();
    return;
  }
  if (j.estado !== "jogando" || j.travado) return;
  j.travado = true;
  const botao = lado === "esq" ? el.esq : el.dir;
  botao.classList.add("apertado");
  setTimeout(() => botao.classList.remove("apertado"), 120);
  if (lado === j.rodada.certo) acertar(lado);
  else errar(false);
}

function acertar(lado) {
  const r = j.rodada;
  j.combo++;
  j.maiorCombo = Math.max(j.maiorCombo, j.combo);
  j.acertos++;
  const mult = Math.min(5, 1 + Math.floor(j.combo / 5));
  const bonusTempo = Math.round((j.restante / j.total) * 10);
  const pts = (r.tipo === "chefe" ? 50 : 10) * mult + bonusTempo;
  j.pontos += pts;
  SOM.acerto(j.combo);
  flutuar(`+${pts}`, mult > 1 && j.combo % 5 === 0 ? "combo" : "");
  if (mult > 1 && j.combo % 5 === 0) flutuar(`COMBO x${mult}!`, "combo", 120);

  // progresso da coleção
  if (r.tipo === "termo") {
    const antes = nivelChip(r.termo);
    salvo.chips[r.termo] = Math.min(MAX_CHIP, antes + 1);
    if (antes < MAX_CHIP && salvo.chips[r.termo] === MAX_CHIP) chipDominado(r.termo);
  } else {
    salvo.portas[r.porta] = Math.min(MAX_PORTA, nivelPorta(r.porta) + 1);
  }
  salvar();

  // vida extra a cada 10 acertos seguidos
  let ganhouVida = false;
  if (j.combo % 10 === 0 && j.vidas < 3) {
    j.vidas++;
    ganhouVida = true;
    SOM.vida();
  }

  el.carta.classList.add("certo", lado === "esq" ? "saindo-esq" : "saindo-dir");
  atualizarHud(ganhouVida);

  let atraso = 240;
  const novoNivel = 1 + Math.floor(j.acertos / 10);
  if (novoNivel > j.nivel) {
    j.nivel = novoNivel;
    atualizarHud();
    mostrarBanner(`NÍVEL ${j.nivel}! ${NIVEIS[j.nivel] || "Mais rápido!"}`);
    SOM.nivel();
    atraso = 1300;
  }
  if (j.acertos % CHEFE_A_CADA === 0) {
    j.chefePendente = true;
    agendar(() => { mostrarBanner("⚠ CHEFÃO: descubra a porta pela tabela!", true); SOM.chefe(); }, atraso === 240 ? 0 : atraso - 200);
    atraso += 1200;
  }
  agendar(proxima, atraso);
}

function chipDominado(id) {
  j.novosChips.push(id);
  const total = chipsDominados();
  SOM.chip();
  toast(`💾 Chip dominado: ${TERMOS[id].nome}! (${total}/16)`);
  if (total === LISTA_TERMOS.length && !salvo.dicasLiberadas) {
    salvo.dicasLiberadas = true;
    salvo.dicas = 3;
    setTimeout(() => toast("🏆 Coleção completa! 3 dicas liberadas na cruzadinha."), 2600);
  }
}

function errar(tempoEsgotado) {
  const r = j.rodada;
  j.vidas--;
  j.combo = 0;
  j.estado = "explicando";
  j.podeSeguir = false;
  SOM.erro();
  el.carta.classList.remove("entrando");
  void el.carta.offsetWidth;
  el.carta.classList.add("errado", "explicando");
  atualizarHud();

  // perder energia do chip / da porta
  let perdeu = "";
  if (r.tipo === "termo" && nivelChip(r.termo) > 0) {
    salvo.chips[r.termo] = nivelChip(r.termo) - 1;
    perdeu = `O chip ${TERMOS[r.termo].nome} perdeu 1 de energia.`;
  } else if (r.tipo !== "termo" && nivelPorta(r.porta) > 0) {
    salvo.portas[r.porta] = nivelPorta(r.porta) - 1;
  }
  salvar();

  // explicação: o momento de aprender
  const titulo = tempoEsgotado ? "⏱ TEMPO ESGOTADO" : "✖ ERROU";
  let corpo = "";
  let resumo = "";
  if (r.tipo === "termo") {
    const t = TERMOS[r.termo];
    const textoRival = TERMOS[r.rival] ? TERMOS[r.rival].explica : RIVAIS_EXTRAS[r.rival];
    corpo = `<p class="explica-resposta">Era <strong>${t.nome}</strong></p>
      <p class="explica-texto">${t.explica}</p>
      ${textoRival ? `<p class="explica-rival">E a outra opção? ${textoRival}</p>` : ""}`;
    resumo = t.explica;
  } else if (r.tipo === "porta") {
    const idx = linhasPorta(r.porta).findIndex((l) => l[0] === r.a && (r.porta === "NOT" || l[1] === r.b));
    corpo = `<p class="explica-resposta">${r.porta} com A=${r.a}${r.porta === "NOT" ? "" : ", B=" + r.b} dá <strong>${r.s}</strong></p>
      <p class="explica-texto">${PORTAS[r.porta].regra}</p>${tabelaHtml(r.porta, { destaque: idx })}`;
    resumo = PORTAS[r.porta].regra;
  } else {
    corpo = `<p class="explica-resposta">Era <strong>${r.porta}</strong></p>
      <p class="explica-texto">${PORTAS[r.porta].regra}</p>${tabelaHtml(r.porta, { rotulo: r.porta, outra: r.rival })}
      <p class="explica-rival">Compare a coluna amarela (${r.porta}) com a rosa (${r.rival}).</p>`;
    resumo = PORTAS[r.porta].regra;
  }
  if (!j.erros.includes(resumo)) j.erros.push(resumo);

  el.explica.innerHTML = `<p class="explica-titulo">${titulo}</p>${corpo}
    ${perdeu ? `<p class="explica-chip">${perdeu}</p>` : ""}
    <p class="explica-seguir" id="explicaSeguir">${j.vidas > 0 ? "Toque ou aperte qualquer seta para continuar" : "Toque ou aperte qualquer seta para ver o resultado"}</p>`;
  el.explica.hidden = false;
  agendar(() => {
    j.podeSeguir = true;
    const s = document.getElementById("explicaSeguir");
    if (s) s.classList.add("visivel");
  }, 700);
}

function seguir() {
  if (j.vidas <= 0) fimDeJogo();
  else proxima();
}

function fimDeJogo() {
  limparTimers();
  salvo.partidas++;
  const recordeAntigo = salvo.recorde;
  const novoRecorde = j.pontos > recordeAntigo;
  if (novoRecorde) salvo.recorde = j.pontos;
  salvar();

  $("#fimTitulo").textContent = novoRecorde ? "NOVO RECORDE!" : "FIM DE JOGO";
  $("#fimPontos").textContent = j.pontos;
  const rec = $("#fimRecorde");
  rec.className = "fim-recorde" + (novoRecorde ? " novo" : "");
  rec.textContent = novoRecorde
    ? (recordeAntigo ? `Você bateu o recorde de ${recordeAntigo}!` : "Primeiro recorde registrado!")
    : salvo.recorde === 0
      ? "Acerte algumas cartas para marcar seu primeiro recorde!"
      : `Recorde: ${salvo.recorde} · ${faltam(salvo.recorde - j.pontos + 1)} para bater`;
  $("#fimStats").innerHTML = `
    <div><span>Acertos</span><strong>${j.acertos}</strong></div>
    <div><span>Maior combo</span><strong>${j.maiorCombo}</strong></div>
    <div><span>Nível</span><strong>${j.nivel}</strong></div>`;
  const total = chipsDominados();
  $("#fimChips").innerHTML =
    (j.novosChips.length
      ? `<p>Chips dominados nesta partida:</p><p>${j.novosChips.map((c) => `<span class="tag">${TERMOS[c].nome}</span>`).join("")}</p>`
      : "") +
    `<p>Coleção: <strong>${total}/16</strong> chips${total < 16 ? " · complete para ganhar dicas na cruzadinha" : " · completa! 🏆"}</p>`;
  $("#fimRevisar").innerHTML = j.erros.length
    ? `<h3>📌 Para revisar</h3><ul>${j.erros.slice(0, 6).map((e) => `<li>${e}</li>`).join("")}</ul>`
    : "";
  j = null;
  mostrarTela("fim");
  if (novoRecorde) SOM.recorde(); else SOM.fim();
  $("#btnDeNovo").focus();
}

const faltam = (n) => (n === 1 ? "falta 1 ponto" : `faltam ${n} pontos`);

function sairParaMenu() {
  limparTimers();
  j = null;
  el.pausa.hidden = true;
  renderMenu();
  mostrarTela("menu");
}

// ---------- pausa ----------
function pausar() {
  if (!j || j.estado === "pausa") return;
  j.estadoAntes = j.estado;
  j.estado = "pausa";
  el.pausa.hidden = false;
  $("#btnContinuar").focus();
}
function continuar() {
  if (!j || j.estado !== "pausa") return;
  j.estado = j.estadoAntes;
  j.ultimoTs = null;
  el.pausa.hidden = true;
}

// ---------- relógio ----------
function laco(ts) {
  if (j && j.estado === "jogando" && !j.travado) {
    if (j.ultimoTs !== null) j.restante -= (ts - j.ultimoTs) / 1000;
    j.ultimoTs = ts;
    const frac = Math.max(0, j.restante / j.total);
    el.barra.style.transform = `scaleX(${frac})`;
    el.barra.classList.toggle("urgente", frac < 0.3);
    if (j.restante < 1.5) {
      const marca = Math.floor(j.restante * 3);
      if (marca !== j.ultimoTique) { j.ultimoTique = marca; SOM.tique(); }
    }
    if (j.restante <= 0) {
      j.travado = true;
      errar(true);
    }
  } else if (j) {
    j.ultimoTs = null;
  }
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);

// ---------- HUD e efeitos ----------
function atualizarHud(ganhouVida) {
  if (!j) return;
  el.vidas.innerHTML = [0, 1, 2].map((i) => `<span class="${i < j.vidas ? "" : "vazia"} ${ganhouVida && i === j.vidas - 1 ? "ganhou" : ""}">♥</span>`).join("");
  el.vidas.setAttribute("aria-label", `${j.vidas} vidas`);
  el.pontos.textContent = j.pontos;
  const mult = Math.min(5, 1 + Math.floor(j.combo / 5));
  el.combo.textContent = `x${mult}`;
  el.comboBloco.querySelector("span").textContent = j.combo ? `COMBO ${j.combo}` : "COMBO";
  el.comboBloco.classList.toggle("quente", j.combo >= 5 && j.combo < 15);
  el.comboBloco.classList.toggle("pegando-fogo", j.combo >= 15);
  el.nivel.textContent = j.nivel;
}
function flutuar(texto, classe = "", atraso = 0) {
  setTimeout(() => {
    const s = document.createElement("span");
    s.className = "flutua " + classe;
    s.textContent = texto;
    if (atraso) s.style.top = "52%";
    el.flutuantes.appendChild(s);
    setTimeout(() => s.remove(), 850);
  }, atraso);
}
function mostrarBanner(texto, chefe = false) {
  el.banner.textContent = texto;
  el.banner.className = "banner" + (chefe ? " chefe" : "");
  el.banner.hidden = false;
  clearTimeout(mostrarBanner.t);
  mostrarBanner.t = setTimeout(() => (el.banner.hidden = true), 1500);
}
function toast(texto) {
  const t = $("#toast");
  t.textContent = texto;
  t.classList.add("visivel");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("visivel"), 2400);
}

// ---------- menu e coleção ----------
function renderMenu() {
  const total = chipsDominados();
  $("#menuRecorde").textContent = salvo.recorde;
  $("#menuChips").textContent = `${total}/16`;
  $("#menuPartidas").textContent = salvo.partidas;
  $("#colContagem").textContent = `${total}/16`;
  $("#gradeChips").innerHTML = LISTA_TERMOS.map((id) => {
    const n = nivelChip(id);
    const t = TERMOS[id];
    return `<button type="button" class="chip ${n >= MAX_CHIP ? "dominado" : ""}" data-chip="${id}" aria-label="${t.nome}: ${n} de ${MAX_CHIP}">
      <span class="chip-nome">${t.nome}</span><span class="chip-grafia">${t.grafia}</span>
      <span class="chip-leds">${[0, 1, 2].map((i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span></button>`;
  }).join("");
  $("#gradePortas").innerHTML = ORDEM_PORTAS.map((p) => {
    const n = nivelPorta(p);
    return `<button type="button" class="porta-mini ${n >= MAX_PORTA ? "dominado" : ""}" data-porta="${p}" aria-label="Porta ${p}: ${n} de ${MAX_PORTA}">
      ${svgPorta(p)}${p}<div class="barrinha"><i style="width:${(n / MAX_PORTA) * 100}%"></i></div></button>`;
  }).join("");
  $("#colRecompensa").textContent = salvo.dicasLiberadas
    ? `🏆 Coleção completa! Dicas na cruzadinha: ${salvo.dicas}.`
    : `🎁 Complete os 16 chips para ganhar 3 dicas na cruzadinha.`;
}

function abrirModal(html) {
  $("#modalConteudo").innerHTML = html;
  $("#modal").hidden = false;
  $("#modalFechar").focus();
}
function fecharModal() {
  $("#modal").hidden = true;
}

function infoChip(id) {
  const t = TERMOS[id];
  const n = nivelChip(id);
  const cartas = t.cartas.map((c) => `<li>${typeof c === "string" ? c : c.t}</li>`).join("");
  abrirModal(`<h2>💾 ${t.nome}</h2>
    <p class="info-grafia">Na cruzadinha: ${t.grafia}</p>
    <p>${t.explica}</p>
    <p><strong>Como aparece no jogo:</strong></p>
    <ul class="info-cartas">${cartas}</ul>
    <p class="info-leds">Energia: ${"●".repeat(n)}${"○".repeat(MAX_CHIP - n)} ${n >= MAX_CHIP ? "· dominado!" : ""}</p>`);
}
function infoPorta(p) {
  const n = nivelPorta(p);
  abrirModal(`<h2>${svgPorta(p).replace('class="svg-porta"', 'class="svg-porta" style="width:70px;height:50px;vertical-align:middle"')} Porta ${p}</h2>
    <p>${PORTAS[p].regra}</p>${tabelaHtml(p)}
    <p class="info-leds">Domínio: ${n}/${MAX_PORTA}</p>`);
}
function comoJogar() {
  abrirModal(`<h2>❓ Como jogar</h2>
    <p>Cada carta tem <strong>duas respostas</strong>. Responda com <kbd>←</kbd> e <kbd>→</kbd> (ou <kbd>A</kbd> e <kbd>D</kbd>), tocando nos botões ou arrastando a carta. O tempo encurta a cada nível.</p>
    <div class="como-tipos">
      <div><strong>QUAL É A SAÍDA?</strong> Uma porta lógica com as entradas acesas (1) ou apagadas (0). Responda 0 ou 1. Também vale <kbd>0</kbd> e <kbd>1</kbd> no teclado.</div>
      <div><strong>QUAL É?</strong> Uma descrição de arquitetura de computadores. Escolha o termo certo entre os dois.</div>
      <div><strong>⚠ CHEFÃO</strong> A cada ${CHEFE_A_CADA} acertos: só a tabela verdade aparece e você descobre qual é a porta. Vale 50 pontos.</div>
    </div>
    <ul>
      <li>Você tem 3 vidas. A cada 10 acertos seguidos, recupera uma.</li>
      <li>A cada 5 acertos seguidos, o multiplicador sobe (até x5). Responder rápido dá bônus.</li>
      <li>A cada 10 acertos você sobe de nível: entram NAND, NOR, XOR e depois o modo símbolo.</li>
      <li>Errou? O jogo mostra a resposta e o motivo. Leia com calma: o tempo para.</li>
      <li>Acerte um termo 3 vezes para dominar o chip. Com os 16, a cruzadinha ganha dicas.</li>
      <li><kbd>P</kbd> ou <kbd>Esc</kbd> pausa.</li>
    </ul>
    <p class="como-acao"><button type="button" class="btn-jogar" id="btnComoJogar">▶ Entendi, bora jogar!</button></p>`);
  $("#btnComoJogar").addEventListener("click", () => { fecharModal(); audio(); novaPartida(); });
}

// ---------- dicas da cruzadinha (usadas por cruzadinha.js) ----------
window.dicasCruz = () => ({ liberada: salvo.dicasLiberadas, restantes: salvo.dicas });
window.usarDicaCruz = () => {
  if (!salvo.dicasLiberadas || salvo.dicas <= 0) return false;
  salvo.dicas--;
  salvar();
  renderMenu();
  return true;
};
window.aoCompletarCruzadinha = () => toast("🎉 Cruzadinha completa! Técnico nota 10!");

// ---------- som ----------
function atualizarBotaoSom() {
  const b = $("#btnSom");
  b.textContent = salvo.som ? "🔊" : "🔇";
  b.setAttribute("aria-pressed", String(salvo.som));
  b.setAttribute("aria-label", salvo.som ? "Som ligado" : "Som desligado");
}

// ---------- eventos ----------
$("#btnJogar").addEventListener("click", () => { audio(); novaPartida(); });
$("#btnDeNovo").addEventListener("click", () => { audio(); novaPartida(); });
$("#btnMenu").addEventListener("click", sairParaMenu);
$("#btnComo").addEventListener("click", comoJogar);
$("#btnCruz").addEventListener("click", () => window.abrirCruzadinha());
$("#btnFimCruz").addEventListener("click", () => window.abrirCruzadinha());
$("#btnSom").addEventListener("click", () => { salvo.som = !salvo.som; salvar(); atualizarBotaoSom(); SOM.clique(); });
$("#btnPausa").addEventListener("click", pausar);
$("#btnContinuar").addEventListener("click", continuar);
$("#btnSair").addEventListener("click", sairParaMenu);
$("#modalFechar").addEventListener("click", fecharModal);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") fecharModal(); });
el.esq.addEventListener("click", () => responder("esq"));
el.dir.addEventListener("click", () => responder("dir"));
el.explica.addEventListener("click", () => responder("esq"));

$("#gradeChips").addEventListener("click", (e) => {
  const b = e.target.closest("[data-chip]");
  if (b) infoChip(b.dataset.chip);
});
$("#gradePortas").addEventListener("click", (e) => {
  const b = e.target.closest("[data-porta]");
  if (b) infoPorta(b.dataset.porta);
});

// arrastar a carta para o lado (celular)
let arrasto = null;
el.carta.addEventListener("pointerdown", (e) => {
  if (!j || j.estado !== "jogando" || j.travado) return;
  arrasto = { x: e.clientX, id: e.pointerId };
});
el.carta.addEventListener("pointermove", (e) => {
  if (!arrasto || e.pointerId !== arrasto.id) return;
  const dx = e.clientX - arrasto.x;
  if (Math.abs(dx) > 8) el.carta.style.transform = `translateX(${dx * 0.6}px) rotate(${dx * 0.03}deg)`;
});
function soltarArrasto(e) {
  if (!arrasto || e.pointerId !== arrasto.id) return;
  const dx = e.clientX - arrasto.x;
  arrasto = null;
  el.carta.style.transform = "";
  if (Math.abs(dx) > 70) responder(dx < 0 ? "esq" : "dir");
}
el.carta.addEventListener("pointerup", soltarArrasto);
el.carta.addEventListener("pointercancel", soltarArrasto);

document.addEventListener("keydown", (e) => {
  const cruzAberta = !$("#modalCruz").hidden;
  const modalAberto = !$("#modal").hidden;
  if (cruzAberta) return; // a cruzadinha cuida do próprio teclado
  if (modalAberto) {
    if (e.key === "Escape") fecharModal();
    return;
  }
  const k = e.key;
  if (!el.jogo.hidden && j) {
    if (k === "p" || k === "P" || k === "Escape") {
      e.preventDefault();
      if (j.estado === "pausa") continuar(); else pausar();
      return;
    }
    if (j.estado === "pausa") return;
    const r = j.rodada;
    if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); responder("esq"); }
    else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); responder("dir"); }
    else if (r && r.tipo === "porta" && (k === "0" || k === "1") && j.estado === "jogando") responder(k === "0" ? "esq" : "dir");
    else if (j.estado === "explicando" && (k === " " || k === "Enter")) { e.preventDefault(); responder("esq"); }
    return;
  }
  if (!el.menu.hidden && k === "Enter" && document.activeElement === document.body) { e.preventDefault(); audio(); novaPartida(); }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && j && j.estado !== "explicando") pausar();
});

// ---------- início ----------
atualizarBotaoSom();
renderMenu();
// na primeira visita, explica as regras antes da primeira partida
if (!salvo.viuComoJogar && location.hash !== "#cruzadinha") {
  salvo.viuComoJogar = true;
  salvar();
  comoJogar();
}
