# Flappy Dcat

**Flappy Dcat** e um jogo mobile 2D estilo arcade (*infinite runner* / *flappy*) desenvolvido em **React Native (Expo SDK 57)** com motor de fisica **Matter.js** e **react-native-game-engine**, estruturado sob o padrao arquitetural **MVC (Model-View-Controller)**.

- **Desenvolvedor:** Felipe Rocha de Oliveira
- **Instituicao:** FATEC - Desenvolvimento de Software Multiplataforma (DSM) - 2026
- **Plataforma:** Android / iOS (React Native + Expo Go SDK 57)

---

## Sobre o Projeto

Em **Flappy Dcat**, o jogador controla um gatinho alado em pixel art que precisa atravessar o espaco vazio entre pares de maos em movimento continuo, coletando garrafas de leite para pontuar e ativar efeitos especiais.

O jogo conta com:
- **Layout Responsivo (Retrato e Paisagem):** Todas as telas, menus, HUD e modais se adaptam automaticamente quando o celular esta em pe (vertical) ou deitado (horizontal).
- **Dificuldade Progressiva:** Apos um tempo inicial de preparo de 2 segundos, uma fila continua de obstaculos entra em cena. Conforme a pontuacao do jogador aumenta, a velocidade horizontal cresce e o intervalo entre as maos diminui progressivamente.

---

## Temas Visuais e Ambientacao

O jogador pode escolher e alternar a qualquer momento entre dois temas completos:

1. **Tema Dia (Sol Teletubbies e Algodao-Doce)**
   - **Cenario:** Ceu diurno vibrante com nuvens e sol caracteristico.
   - **Obstaculos:** Pares de maos com mangas coloridas de algodao-doce (`Impacto_Dia.png`).
   - **Trilha Sonora:** Musica alegre em estilo chiptune / 8-bit (`Musica_fundo_dia.ogg`).

2. **Tema Noite (Gotham City e Mulher-Gato)**
   - **Cenario:** Noite sombria inspirada em Gotham City.
   - **Obstaculos:** Pares de maos com luvas e garras da Mulher-Gato (`Impacto_Noite.png`).
   - **Trilha Sonora:** Trilha sombria em estilo 8-bit inspirada no tema classico do Batman (`Musica_fundo_noite.ogg`).

---

## Itens Coletaveis e Power-ups

| Item | Localizacao | Efeito |
| :--- | :--- | :--- |
| **Leite de Urso** (`Leite_normal.png`) | Centro do espaco seguro entre as maos | Soma **+1 ponto** (ou **+3 pontos** quando o efeito do Leite de Coelho esta ativo). |
| **Leite de Coelho** (`Leite_Efeito.png`) | Cantos extremos superior ou inferior (alto risco / raro) | Soma **+3 pontos** imediatos e ativa por **10 segundos** o modo **Turbo Arco-Iris**: multiplicador **3x**, velocidade **1.05x** e trilha sonora acelerada com efeito magico. |

---

## Maquina de Estados do Personagem (8 Sprites)

O componente `Gato.js` alterna dinamicamente entre **8 sprites** divididos em dois modos (**Normal** e **Efeito Arco-Iris**):
1. **Asa para Cima (`ASA_CIMA`):** Acionado quando o gatinho recebe impulso vertical ao tocar na tela.
2. **Asa para Baixo (`ASA_BAIXO`):** Acionado durante a queda pela acao da gravidade.
3. **Tomando Leite (`LEITE`):** Animacao especial exibida ao coletar qualquer garrafa de leite.
4. **Colisao (`COLISAO`):** Exibido no momento do impacto com obstaculos, teto ou chao (*Game Over*).

---

## Sistema de Audio e Mixer de Volume

Implementado com `expo-audio`, o jogo possui controle independente de volume (`0%` a `100%`) e opcao de mutar (**MUDO**) em tempo real para tres canais:
- **Geral:** Controla o volume mestre ou muta todos os sons do jogo.
- **Musicas:** Controla ou muta apenas as trilhas de fundo (`Musica_fundo_dia.ogg`, `Musica_fundo_noite.ogg` e `Musica_efeito.ogg`), mantendo os efeitos ativos.
- **Efeitos:** Controla ou muta apenas os efeitos sonoros e falas, mantendo a musica de fundo:
  - `Miado.ogg`: Reproduzido a cada toque na tela para subir.
  - `Ai.ogg`: Reproduzido ao colidir (*Game Over*).
  - `Seu_safado.ogg`: Reproduzido ao coletar o **Leite de Coelho**.
  - `Guloso.ogg`: Reproduzido a cada **10 leites coletados** na partida (`10, 20, 30...`).
  - `Ganancioso.ogg`: Reproduzido sempre que a pontuacao atinge multiplos de **50 pontos** (`50, 100, 150, 200, 250...`).

---

## Arquitetura do Projeto (MVC)

```text
Flappy_Dcat/
├── App.js                        # Configuracao de rotas (React Navigation Native Stack)
├── index.js                      # Ponto de entrada do Expo
├── app.json                      # Manifesto e configuracoes do Expo SDK 57
├── metro.config.js               # Suporte a assets de audio (.ogg) no Metro Bundler
├── package.json                  # Dependencias e scripts do projeto
└── src/
    ├── assets/                   # 14 sprites/cenarios (.png) e 8 audios (.ogg)
    ├── components/
    │   └── Gato.js               # Entidade fisica e renderizador dos 8 estados do personagem
    ├── controllers/
    │   └── MotorJogo.js          # Loop de fisica Matter.js, colisoes, coleta e dificuldade progressiva
    ├── models/
    │   └── Configuracoes.js      # Constantes fisicas, temas, mapeamento de assets e estado global de audio
    └── views/
        ├── TelaBoasVindas.js     # Menu principal, preview interativo, seletor de tema e modal de audio
        ├── TelaInstrucoes.js     # Guia visual de controles, obstaculos e itens
        ├── TelaJogo.js           # Tela de gameplay, HUD, controle de trilhas/vozes e Game Over
        └── TelaCreditos.js       # Creditos academicos (FATEC - DSM) e galeria dos 8 sprites
```

---

## Tecnologias Utilizadas

- **React Native** (`0.86.3`) & **React** (`19.2.3`)
- **Expo** (`~57.0.31`)
- **Matter.js** (`0.20.0`) - Motor de fisica 2D (corpos rigidos, gravidade e deteccao de colisoes)
- **react-native-game-engine** (`1.2.0`) - Game loop e gerenciamento de entidades
- **expo-audio** (`~57.0.5`) - Reproducao simultanea de trilhas sonoras em loop e efeitos de voz
- **React Navigation** (`@react-navigation/native` e `@react-navigation/native-stack`)

---

## Como Executar o Projeto

1. Clone o repositorio:
   ```bash
   git clone https://github.com/FelipeRCod/Flappy_Dcat.git
   cd Flappy_Dcat
   ```

2. Instale as dependencias:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npx expo start --clear
   ```

4. Escaneie o **QR Code** gerado no terminal utilizando o aplicativo **Expo Go** no seu celular Android ou iOS.
