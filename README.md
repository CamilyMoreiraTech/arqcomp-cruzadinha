# ⚡ Bit Rush: Corrida dos Bits

Um jogo arcade rápido, jogado no navegador, para praticar **Arquitetura Computacional** e **portas lógicas**. Cada partida dura um ou dois minutos e só usa duas teclas, por isso dá vontade de jogar "só mais uma". Inclui a **Cruzadinha do Técnico**, que é a atividade avaliativa.

🔗 **Site publicado:** https://camilymoreiratech.github.io/arqcomp-cruzadinha/
🔗 **Abrir direto na cruzadinha:** https://camilymoreiratech.github.io/arqcomp-cruzadinha/#cruzadinha

## Como jogar

As cartas aparecem uma de cada vez e cada uma tem **duas respostas**. Para responder, use **←** e **→** (ou **A** e **D**), toque nos botões ou arraste a carta para o lado. O tempo de cada carta encurta conforme você sobe de nível.

| Carta | O que aparece | Como responder |
|-------|---------------|----------------|
| **QUAL É A SAÍDA?** | Uma porta lógica com as entradas acesas (1) ou apagadas (0) | **0** ou **1** (também valem as teclas 0 e 1) |
| **QUAL É?** | Uma descrição de arquitetura, por exemplo *"Fios que respondem: ONDE ler ou escrever?"* | Escolha o termo certo entre os dois, aqui **Address bus** ou **Data bus** |
| **⚠ CHEFÃO** | A cada 15 acertos, só a tabela verdade aparece | Descubra qual é a porta (vale 50 pontos) |

- **Vidas:** você começa com 3. A cada 10 acertos seguidos, recupera uma.
- **Combo:** a cada 5 acertos seguidos, o multiplicador sobe (até x5). Responder rápido dá bônus.
- **Níveis:** a cada 10 acertos você sobe de nível. Primeiro entram NAND, NOR e XOR; depois vem o modo símbolo, em que o nome da porta pode sumir.
- **Errou?** O jogo para o tempo, mostra a resposta certa e explica o motivo. Nas portas, mostra a tabela verdade com a linha destacada. Nos termos, explica também a opção errada.
- **Para revisar:** no fim da partida aparece a lista do que você errou.
- **Pausa:** `P` ou `Esc`.

### Coleção de chips
Cada uma das **16 palavras** da atividade é um chip. Acerte um termo **3 vezes** para acender o chip; errar tira energia. O jogo mostra com mais frequência os termos que você ainda não domina. Clique num chip para estudar a explicação e a grafia usada na cruzadinha. Com os 16 chips acesos, a cruzadinha ganha **3 dicas** (cada dica revela uma letra).

As **portas lógicas** também têm uma barra de domínio. Enquanto a barra está baixa, a carta mostra a regra da porta como ajuda.

### Cruzadinha do Técnico (atividade)
- Abra pelo botão **📰 Cruzadinha** ou pelo link com `#cruzadinha`.
- Clique numa casa ou numa pista e digite as letras direto no tabuleiro (maiúsculas, sem acento e sem espaço).
- Clique de novo numa casa de cruzamento para trocar entre horizontal e vertical. As setas movem o cursor, `Backspace` apaga e `Enter` pula para a próxima pista.
- **✔ Conferir** mostra as palavras certas (verde) e erradas (vermelho), com o contador de acertos, por exemplo `8 de 14 palavras`.
- **↺ Reiniciar** limpa o tabuleiro.

## Palavras e pistas da cruzadinha

São **14 das 16 palavras** da lista, todas cruzadas com pelo menos uma outra.

### Horizontais

| Nº | Palavra | Pista |
|----|---------|-------|
| 3 | REGISTRADORES | Memórias minúsculas dentro da CPU, as mais rápidas; o PC é um deles. |
| 7 | MICROCONTROLADOR | Chip único com CPU, memória e entrada e saída, como o do Arduino. |
| 10 | DMA | Controlador que copia dados entre dispositivo e RAM sem ocupar a CPU. |
| 11 | FLASH | Tecnologia do pendrive: não volátil, regravável, guarda o programa do Arduino. |
| 12 | ULA | Bloco da CPU que soma, subtrai e faz AND, OR, XOR e NOT. |
| 13 | CPU | Busca e executa as instruções; une as partes que calculam e comandam. |
| 14 | DATABUS | Fios de mão dupla que levam O QUÊ: valores lidos, escritos e instruções. |

### Verticais

| Nº | Palavra | Pista |
|----|---------|-------|
| 1 | CACHE | Cantinho veloz dentro do processador com cópia do que a CPU usou há pouco. |
| 2 | MEMORIADEMASSA | SSD ou HD: base da pirâmide, lenta, enorme e guarda tudo sem energia. |
| 4 | EEPROM | Onde o próprio programa guarda configurações que sobrevivem ao desligamento, como no Arduino. |
| 5 | ADDRESSBUS | Fios que só saem da CPU e dizem ONDE ler ou escrever. |
| 6 | UC | Lê cada instrução, decodifica e dá as ordens às outras partes da CPU. |
| 8 | ROM | Guarda a BIOS; nas primeiras versões, era gravada na fábrica e nunca mudava. |
| 9 | RAM | Área de trabalho volátil do computador: guarda programas em execução e seus dados. |

## Os 16 termos no jogo

Todos os 16 termos da lista viram cartas no Bit Rush, sempre contra um rival que costuma causar confusão:

| Termo | Rival comum | Exemplo de carta |
|-------|-------------|------------------|
| ULA | UC | "Faz as contas da CPU: soma e subtração." |
| UC | ULA | "Lê cada instrução e descobre o que ela pede." |
| CPU | DMA | "Busca e executa as instruções do programa." |
| Registradores | Cache | "Memórias minúsculas dentro da CPU, coladas na ULA." |
| RAM | ROM | "Memória de trabalho volátil: sem energia, perde tudo." |
| ROM | RAM | "Guarda o firmware de inicialização, como a BIOS." |
| EEPROM | Flash | "Pequena e não volátil: só 1 KB no Arduino Uno." |
| Flash | EEPROM | "Guarda o programa do Arduino: 32 KB no Uno." |
| Cache | Registradores | "Guarda cópia do que a CPU usou há pouco." |
| Memória de massa | RAM | "SSD ou HD: guarda arquivos de forma permanente." |
| DMA | CPU | "Copia dados entre um dispositivo e a RAM sem ocupar a CPU." |
| Address bus | Data bus | "Fios que respondem: ONDE ler ou escrever?" |
| Data bus | Address bus | "Fios que respondem: O QUÊ está sendo lido ou escrito?" |
| Microcontrolador | Microprocessador | "CPU, memória e entrada e saída num chip só." |
| Dual core | Quad core | "Processador com 2 núcleos no mesmo chip." |
| Quad core | Dual core | "Processador com 4 núcleos no mesmo chip." |

As portas lógicas treinadas são AND, OR, NOT, NAND, NOR e XOR.

## Tecnologias

- HTML, CSS e JavaScript puros, sem bibliotecas
- Desenhos em SVG e sons gerados com Web Audio, sem arquivos de imagem ou áudio
- Fontes *Space Grotesk* e *Press Start 2P* (Google Fonts)
- Recorde e coleção salvos no próprio navegador (localStorage)
- Publicado com GitHub Pages

## Estrutura

```
index.html      → página do jogo (menu, partida, fim de jogo e cruzadinha)
style.css       → visual
dados.js        → termos, cartas, portas lógicas e pistas da cruzadinha
script.js       → o jogo Bit Rush (rodadas, combo, vidas, coleção e sons)
cruzadinha.js   → cruzadinha (Conferir, contador, Reiniciar e dicas)
README.md       → este arquivo
```
