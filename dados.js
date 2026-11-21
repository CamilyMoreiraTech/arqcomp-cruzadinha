// ============================================================
//  Bit Rush: dados do jogo
//  Fatos conferidos com os e-books de Lógica Digital I e de
//  Tópicos de Arquitetura Computacional.
// ============================================================

// ---------- Termos (os 16 chips da coleção) ----------
// cartas: descrições que aparecem no jogo. Uma carta pode trazer
// seus próprios rivais (r) quando os rivais gerais confundiriam.
const TERMOS = {
  CPU: {
    nome: "CPU", grafia: "CPU",
    explica: "A CPU busca e executa as instruções. Ela é formada por ULA, UC e registradores.",
    cartas: [
      "Busca e executa as instruções do programa.",
      { t: "Formada por ULA, UC e registradores.", r: ["DMA", "MICROCONTROLADOR", "CACHE"] },
      { t: "Faz o ciclo: buscar, decodificar, executar e guardar o resultado.", r: ["DMA", "CACHE", "DATABUS"] },
    ],
    rivais: ["DMA", "MICROCONTROLADOR"],
  },
  ULA: {
    nome: "ULA", grafia: "ULA",
    explica: "A ULA faz as contas (soma, subtração) e as operações lógicas (AND, OR, XOR, NOT).",
    cartas: [
      "Faz as contas da CPU: soma e subtração.",
      "Executa as operações lógicas AND, OR, XOR e NOT.",
      "Em ADD 2, 2, é ela que calcula 2 + 2 = 4.",
    ],
    rivais: ["UC", "REGISTRADORES"],
  },
  UC: {
    nome: "UC", grafia: "UC",
    explica: "A UC lê cada instrução, descobre o que ela pede e envia as ordens às outras partes.",
    cartas: [
      "Lê cada instrução e descobre o que ela pede.",
      "Envia as ordens para as outras partes da CPU.",
      "Em ADD 2, 2, reconhece a soma e manda a ULA somar.",
    ],
    rivais: ["ULA", "REGISTRADORES"],
  },
  REGISTRADORES: {
    nome: "Registra­dores", grafia: "REGISTRADORES",
    explica: "Registradores são memórias minúsculas dentro da CPU: as mais rápidas e as menores (PC, acumulador).",
    cartas: [
      "Memórias minúsculas dentro da CPU, coladas na ULA.",
      "O acumulador e o PC (Contador de Programa) são exemplos.",
      "Topo da pirâmide de memória: as mais rápidas e as menores.",
    ],
    rivais: ["CACHE", "RAM"],
  },
  RAM: {
    nome: "RAM", grafia: "RAM",
    explica: "A RAM é a memória de trabalho: guarda o que está rodando e é volátil (perde tudo sem energia).",
    cartas: [
      "Guarda os programas em execução e os dados deles.",
      "Memória de trabalho volátil: sem energia, perde tudo.",
      "No Arduino Uno tem só 2 KB e guarda as variáveis.",
      "Faltou luz e a última leitura do sensor sumiu: estava nela.",
    ],
    rivais: ["ROM", "CACHE", "FLASH", "MEMORIADEMASSA"],
  },
  ROM: {
    nome: "ROM", grafia: "ROM",
    explica: "A ROM é não volátil e guarda o firmware de inicialização, como a BIOS.",
    cartas: [
      "Guarda o firmware de inicialização, como a BIOS.",
      "Nas primeiras versões, era gravada na fábrica e nunca mudava.",
      "Não volátil: guarda o que o aparelho precisa para ligar.",
    ],
    rivais: ["RAM", "CACHE", "EEPROM"],
  },
  EEPROM: {
    nome: "EEPROM", grafia: "EEPROM",
    explica: "A EEPROM é a memória não volátil pequena (1 KB no Uno) onde o programa do Arduino salva dados que não podem sumir.",
    cartas: [
      "No Arduino, guarda dados que o próprio programa salva, como uma configuração.",
      "Pequena e não volátil: só 1 KB no Arduino Uno.",
      "Seu programa quer lembrar a contagem depois de desligar: grave nela.",
    ],
    rivais: ["FLASH", "RAM"],
  },
  FLASH: {
    nome: "Flash", grafia: "FLASH",
    explica: "A Flash é não volátil e regravável, a tecnologia do pendrive. Guarda o programa do Arduino (32 KB).",
    cartas: [
      "A mesma tecnologia do pendrive.",
      "Guarda o programa do Arduino: 32 KB no Uno.",
      { t: "Não volátil e regravável: hoje faz o papel da antiga ROM.", r: ["RAM", "CACHE"] },
      "Permite atualizar o firmware da placa-mãe.",
    ],
    rivais: ["EEPROM", "RAM", "ROM"],
  },
  CACHE: {
    nome: "Cache", grafia: "CACHE",
    explica: "A cache fica dentro do processador, é pequena e muito rápida, e guarda cópia do que a CPU usou há pouco.",
    cartas: [
      "Pequena e muito rápida, fica dentro do processador.",
      "Guarda cópia do que a CPU usou há pouco.",
      "Evita buscar tudo na RAM; o Arduino Uno não tem.",
    ],
    rivais: ["REGISTRADORES", "RAM", "MEMORIADEMASSA"],
  },
  MEMORIADEMASSA: {
    nome: "Memória de massa", grafia: "MEMORIADEMASSA",
    explica: "Memória de massa (SSD, HD) é a base da pirâmide: a mais lenta, a maior e não volátil.",
    cartas: [
      "SSD ou HD: guarda arquivos de forma permanente.",
      "Base da pirâmide: a mais lenta, a maior e a mais barata por byte.",
      "Centenas de GB a TB, e não perde nada sem energia.",
    ],
    rivais: ["RAM", "CACHE"],
  },
  DMA: {
    nome: "DMA", grafia: "DMA",
    explica: "No DMA, um controlador copia dados entre dispositivo e RAM enquanto a CPU fica livre.",
    cartas: [
      "Copia dados entre um dispositivo e a RAM sem ocupar a CPU.",
      "A CPU só configura a cópia e fica livre para outras tarefas.",
      "Usado pela placa de rede, pela de vídeo e pelo controlador de disco.",
    ],
    rivais: ["CPU", "DATABUS"],
  },
  ADDRESSBUS: {
    nome: "Address bus", grafia: "ADDRESSBUS",
    explica: "O barramento de endereço (address bus) responde ONDE: sai da CPU com a posição de memória.",
    cartas: [
      "Fios que respondem: ONDE ler ou escrever?",
      "Só sai da CPU, levando o número da posição de memória.",
      "Com 16 fios, alcança 2¹⁶ = 65.536 posições.",
    ],
    rivais: ["DATABUS"],
  },
  DATABUS: {
    nome: "Data bus", grafia: "DATABUS",
    explica: "O barramento de dados (data bus) responde O QUÊ: leva valores e instruções nos dois sentidos.",
    cartas: [
      "Fios que respondem: O QUÊ está sendo lido ou escrito?",
      "Vai e volta entre CPU e memória, levando valores e instruções.",
      "Na leitura, traz o conteúdo da memória até a CPU.",
    ],
    rivais: ["ADDRESSBUS"],
  },
  MICROCONTROLADOR: {
    nome: "Microcon­trolador", grafia: "MICROCONTROLADOR",
    explica: "O microcontrolador junta CPU, memória e entrada e saída num chip só (ex.: ATmega328P do Arduino).",
    cartas: [
      "CPU, memória e entrada e saída num chip só.",
      "O ATmega328P do Arduino Uno é um deles.",
      "Baixo consumo, feito para ler sensores e controlar motores.",
    ],
    rivais: ["Microprocessador"],
  },
  DUALCORE: {
    nome: "Dual core", grafia: "DUALCORE",
    explica: "Dual core = processador com 2 núcleos no mesmo chip.",
    cartas: [
      "Processador com 2 núcleos no mesmo chip.",
      "Executa 2 tarefas ao mesmo tempo, uma em cada núcleo.",
      "Tem metade dos núcleos de um quad core.",
    ],
    rivais: ["QUADCORE"],
  },
  QUADCORE: {
    nome: "Quad core", grafia: "QUADCORE",
    explica: "Quad core = processador com 4 núcleos no mesmo chip.",
    cartas: [
      "Processador com 4 núcleos no mesmo chip.",
      "Executa 4 tarefas ao mesmo tempo, uma em cada núcleo.",
      "Tem o dobro de núcleos de um dual core.",
    ],
    rivais: ["DUALCORE"],
  },
};

// Rivais que não são chips da coleção (só aparecem como alternativa errada)
const RIVAIS_EXTRAS = {
  Microprocessador: "Microprocessador é só a CPU num chip: depende de RAM e armazenamento de fora (ex.: Intel Core).",
};

// ---------- Portas lógicas ----------
const ORDEM_PORTAS = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"];
const PORTAS = {
  AND:  { f: (a, b) => a & b,       regra: "AND só dá 1 quando A e B são 1." },
  OR:   { f: (a, b) => a | b,       regra: "OR dá 1 quando pelo menos uma entrada é 1." },
  NOT:  { f: (a) => 1 - a,          regra: "NOT inverte: 0 vira 1 e 1 vira 0." },
  NAND: { f: (a, b) => 1 - (a & b), regra: "NAND é o AND invertido: só dá 0 quando A e B são 1." },
  NOR:  { f: (a, b) => 1 - (a | b), regra: "NOR é o OR invertido: só dá 1 quando A e B são 0." },
  XOR:  { f: (a, b) => a ^ b,       regra: "XOR dá 1 quando as entradas são diferentes." },
};

// Mensagens de subida de nível
const NIVEIS = {
  2: "NAND liberada! É o AND invertido.",
  3: "NOR liberada! É o OR invertido.",
  4: "XOR liberada! Dá 1 quando as entradas são diferentes.",
  5: "Modo símbolo: às vezes o nome da porta some!",
};

// ---------- Cruzadinha (atividade avaliativa) ----------
// Grade de 14 linhas x 16 colunas. Todas as palavras se cruzam.
const CRUZ_LINHAS = 14;
const CRUZ_COLUNAS = 16;
const CRUZ_PALAVRAS = [
  { resposta: "CACHE", linha: 0, coluna: 9, dir: "V",
    pista: "Cantinho veloz dentro do processador com cópia do que a CPU usou há pouco." },
  { resposta: "MEMORIADEMASSA", linha: 0, coluna: 13, dir: "V",
    pista: "SSD ou HD: base da pirâmide, lenta, enorme e guarda tudo sem energia." },
  { resposta: "REGISTRADORES", linha: 1, coluna: 2, dir: "H",
    pista: "Memórias minúsculas dentro da CPU, as mais rápidas; o PC é um deles." },
  { resposta: "EEPROM", linha: 2, coluna: 0, dir: "V",
    pista: "Onde o próprio programa guarda configurações que sobrevivem ao desligamento, como no Arduino." },
  { resposta: "ADDRESSBUS", linha: 4, coluna: 3, dir: "V",
    pista: "Fios que só saem da CPU e dizem ONDE ler ou escrever." },
  { resposta: "UC", linha: 6, coluna: 5, dir: "V",
    pista: "Lê cada instrução, decodifica e dá as ordens às outras partes da CPU." },
  { resposta: "MICROCONTROLADOR", linha: 7, coluna: 0, dir: "H",
    pista: "Chip único com CPU, memória e entrada e saída, como o do Arduino." },
  { resposta: "ROM", linha: 7, coluna: 9, dir: "V",
    pista: "Guarda a BIOS; nas primeiras versões, era gravada na fábrica e nunca mudava." },
  { resposta: "RAM", linha: 7, coluna: 15, dir: "V",
    pista: "Área de trabalho volátil do computador: guarda programas em execução e seus dados." },
  { resposta: "DMA", linha: 9, coluna: 8, dir: "H",
    pista: "Controlador que copia dados entre dispositivo e RAM sem ocupar a CPU." },
  { resposta: "FLASH", linha: 10, coluna: 0, dir: "H",
    pista: "Tecnologia do pendrive: não volátil, regravável, guarda o programa do Arduino." },
  { resposta: "ULA", linha: 10, coluna: 11, dir: "H",
    pista: "Bloco da CPU que soma, subtrai e faz AND, OR, XOR e NOT." },
  { resposta: "CPU", linha: 12, coluna: 1, dir: "H",
    pista: "Busca e executa as instruções; une as partes que calculam e comandam." },
  { resposta: "DATABUS", linha: 12, coluna: 7, dir: "H",
    pista: "Fios de mão dupla que levam O QUÊ: valores lidos, escritos e instruções." },
];
