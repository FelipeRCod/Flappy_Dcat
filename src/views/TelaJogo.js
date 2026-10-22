import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as NavigationBar from 'expo-navigation-bar';
import {
  Configuracoes,
  AssetsJogo,
  obterConfigAudio,
  atualizarConfigAudio,
  inscreverConfigAudio,
  calcularMultiplicadorMusica,
  calcularMultiplicadorEfeitos,
} from '../models/Configuracoes';
import { criarEntidadesIniciais, Physics } from '../controllers/MotorJogo';

const ocultarBotoesSistema = () => {
  try {
    RNStatusBar.setHidden(true, 'fade');
    if (Platform.OS === 'android') {
      if (NavigationBar.NavigationBar && NavigationBar.NavigationBar.setHidden) {
        NavigationBar.NavigationBar.setHidden(true);
      }
      if (NavigationBar.setVisibilityAsync) {
        NavigationBar.setVisibilityAsync('hidden').catch(() => {});
      }
    }
  } catch (e) {}
};

export default function TelaJogo({ navigation, route }) {
  const windowDims = useWindowDimensions();
  const [temaAtual, setTemaAtual] = useState(route?.params?.temaEscolhido || 'DIA');
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [modalAudioVisivel, setModalAudioVisivel] = useState(false);
  const [estavaRodandoAntesModal, setEstavaRodandoAntesModal] = useState(false);
  const [cfgAudio, setCfgAudio] = useState(obterConfigAudio);

  const [pontuacao, setPontuacao] = useState(0);
  const [recorde, setRecorde] = useState(0);
  const [efeitoCoelho, setEfeitoCoelho] = useState({ ativo: false, segundos: 0 });
  const [dimensoesLayout, setDimensoesLayout] = useState({
    largura: windowDims.width,
    altura: windowDims.height,
  });

  const gameEngineRef = useRef(null);
  const pontuacaoRef = useRef(0);
  const leitesColetadosRef = useRef(0);
  const duckTimeoutRef = useRef(null);
  const vozEmDestaqueRef = useRef(false);

  const opcoesAudio = { keepAudioSessionActive: true, downloadFirst: true };
  const playerColisao = useAudioPlayer(AssetsJogo.SONS.COLISAO, opcoesAudio);
  const playerGuloso = useAudioPlayer(AssetsJogo.SONS.GULOSO, opcoesAudio);
  const playerSeuSafado = useAudioPlayer(AssetsJogo.SONS.SEU_SAFADO, opcoesAudio);
  const playerGanancioso = useAudioPlayer(AssetsJogo.SONS.GANANCIOSO, opcoesAudio);
  const playerMiado = useAudioPlayer(AssetsJogo.SONS.MIADO, opcoesAudio);
  const playerMusicaDia = useAudioPlayer(AssetsJogo.SONS.MUSICA_DIA, opcoesAudio);
  const playerMusicaNoite = useAudioPlayer(AssetsJogo.SONS.MUSICA_NOITE, opcoesAudio);
  const playerMusicaEfeito = useAudioPlayer(AssetsJogo.SONS.MUSICA_EFEITO, opcoesAudio);

  const larguraAtual = dimensoesLayout.largura || windowDims.width;
  const alturaAtual = dimensoesLayout.altura || windowDims.height;
  const isPaisagem = larguraAtual > alturaAtual;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'mixWithOthers',
    }).catch(() => {});

    const cancelarInscricao = inscreverConfigAudio((novaCfg) => {
      setCfgAudio(novaCfg);
    });
    return cancelarInscricao;
  }, []);

  const obterVolumesMusicaAtuais = (configuracaoAudio = obterConfigAudio()) => {
    const multMusica = calcularMultiplicadorMusica(configuracaoAudio);
    const baseTema = vozEmDestaqueRef.current ? 0.12 : 0.48;
    const baseEfeito = vozEmDestaqueRef.current ? 0.18 : 0.58;
    return {
      multMusica,
      volumeTema: Math.max(0, Math.min(1, baseTema * multMusica)),
      volumeEfeito: Math.max(0, Math.min(1, baseEfeito * multMusica)),
    };
  };

  const sincronizarMusicaFundo = (
    tema = temaAtual,
    coelhoAtivo = efeitoCoelho.ativo,
    gameOver = isGameOver,
    configuracaoAudio = obterConfigAudio()
  ) => {
    if (gameOver) {
      pararMusicasFundo();
      return;
    }

    const { multMusica, volumeTema, volumeEfeito } =
      obterVolumesMusicaAtuais(configuracaoAudio);

    if (multMusica <= 0) {
      try {
        if (playerMusicaDia && playerMusicaDia.playing) playerMusicaDia.pause();
      } catch (e) {}
      try {
        if (playerMusicaNoite && playerMusicaNoite.playing) playerMusicaNoite.pause();
      } catch (e) {}
      try {
        if (playerMusicaEfeito && playerMusicaEfeito.playing) playerMusicaEfeito.pause();
      } catch (e) {}
      return;
    }

    const playerAtivo = tema === 'NOITE' ? playerMusicaNoite : playerMusicaDia;
    const playerInativo = tema === 'NOITE' ? playerMusicaDia : playerMusicaNoite;

    try {
      if (playerInativo && playerInativo.playing) {
        playerInativo.pause();
      }
    } catch (e) {}

    try {
      if (playerAtivo) {
        playerAtivo.loop = true;
        playerAtivo.muted = false;
        playerAtivo.volume = volumeTema;
        if (!playerAtivo.playing) {
          playerAtivo.play();
        }
        try {
          playerAtivo.setPlaybackRate(coelhoAtivo ? 1.32 : 1.0);
        } catch (errRate) {}
      }
    } catch (e) {}

    try {
      if (playerMusicaEfeito) {
        if (coelhoAtivo) {
          playerMusicaEfeito.loop = true;
          playerMusicaEfeito.muted = false;
          playerMusicaEfeito.volume = volumeEfeito;
          if (!playerMusicaEfeito.playing) {
            playerMusicaEfeito.seekTo(0);
            playerMusicaEfeito.play();
          }
        } else if (playerMusicaEfeito.playing) {
          playerMusicaEfeito.pause();
        }
      }
    } catch (e) {}
  };

  const pararMusicasFundo = () => {
    if (duckTimeoutRef.current) {
      clearTimeout(duckTimeoutRef.current);
      duckTimeoutRef.current = null;
    }
    vozEmDestaqueRef.current = false;

    try {
      if (playerMusicaDia) {
        playerMusicaDia.pause();
      }
    } catch (e) {}

    try {
      if (playerMusicaNoite) {
        playerMusicaNoite.pause();
      }
    } catch (e) {}

    try {
      if (playerMusicaEfeito) {
        playerMusicaEfeito.pause();
      }
    } catch (e) {}
  };

  const tocarSomCurto = (player, volumeBase = 1.0, destacarVoz = false) => {
    try {
      const multEfeitos = calcularMultiplicadorEfeitos();
      if (multEfeitos <= 0) {
        return;
      }

      if (destacarVoz) {
        vozEmDestaqueRef.current = true;
        const { volumeTema, volumeEfeito } = obterVolumesMusicaAtuais();
        try {
          if (playerMusicaDia && playerMusicaDia.playing) playerMusicaDia.volume = volumeTema;
          if (playerMusicaNoite && playerMusicaNoite.playing) playerMusicaNoite.volume = volumeTema;
          if (playerMusicaEfeito && playerMusicaEfeito.playing) playerMusicaEfeito.volume = volumeEfeito;
        } catch (errVol) {}

        if (duckTimeoutRef.current) clearTimeout(duckTimeoutRef.current);
        duckTimeoutRef.current = setTimeout(() => {
          vozEmDestaqueRef.current = false;
          const restaurado = obterVolumesMusicaAtuais();
          try {
            if (playerMusicaDia && playerMusicaDia.playing) playerMusicaDia.volume = restaurado.volumeTema;
            if (playerMusicaNoite && playerMusicaNoite.playing) playerMusicaNoite.volume = restaurado.volumeTema;
            if (playerMusicaEfeito && playerMusicaEfeito.playing) playerMusicaEfeito.volume = restaurado.volumeEfeito;
          } catch (errRestore) {}
        }, 1500);
      }

      if (player) {
        player.muted = false;
        player.volume = Math.max(0, Math.min(1, volumeBase * multEfeitos));
        player.seekTo(0);
        player.play();
      }
    } catch (e) {}
  };

  useEffect(() => {
    sincronizarMusicaFundo(temaAtual, efeitoCoelho.ativo, isGameOver, cfgAudio);
    const timer = setTimeout(() => {
      sincronizarMusicaFundo(temaAtual, efeitoCoelho.ativo, isGameOver, cfgAudio);
    }, 450);
    return () => clearTimeout(timer);
  }, [
    isRunning,
    isGameOver,
    temaAtual,
    efeitoCoelho.ativo,
    cfgAudio,
    playerMusicaDia,
    playerMusicaNoite,
    playerMusicaEfeito,
  ]);

  useEffect(() => {
    return () => {
      pararMusicasFundo();
    };
  }, []);

  const abrirModalAudio = () => {
    if (isRunning) {
      setEstavaRodandoAntesModal(true);
      setIsRunning(false);
    } else {
      setEstavaRodandoAntesModal(false);
    }
    setModalAudioVisivel(true);
  };

  const fecharModalAudio = () => {
    setModalAudioVisivel(false);
    if (estavaRodandoAntesModal && !isGameOver) {
      setIsRunning(true);
      setEstavaRodandoAntesModal(false);
    }
  };

  const alterarVolumeCanal = (chaveVolume, chaveMudo, novoValor) => {
    const valorLimitado = Math.max(0, Math.min(100, novoValor));
    atualizarConfigAudio({
      [chaveVolume]: valorLimitado,
      [chaveMudo]: valorLimitado === 0,
    });
  };

  const alternarMudoCanal = (chaveMudo, chaveVolume) => {
    const atualMudo = cfgAudio[chaveMudo];
    const novoMudo = !atualMudo;
    const novoVolume =
      !novoMudo && cfgAudio[chaveVolume] === 0 ? 50 : cfgAudio[chaveVolume];
    atualizarConfigAudio({
      [chaveMudo]: novoMudo,
      [chaveVolume]: novoVolume,
    });
  };

  const handlebackToStart = () => {
    pontuacaoRef.current = 0;
    leitesColetadosRef.current = 0;
    setIsRunning(false);
    setIsGameOver(false);
    setEfeitoCoelho({ ativo: false, segundos: 0 });
    sincronizarMusicaFundo(temaAtual, false, false);
  };

  const handleOnStartGame = () => {
    ocultarBotoesSistema();
    pontuacaoRef.current = 0;
    leitesColetadosRef.current = 0;
    setPontuacao(0);
    setEfeitoCoelho({ ativo: false, segundos: 0 });
    setIsRunning(true);
    setIsGameOver(false);
    sincronizarMusicaFundo(temaAtual, false, false);
  };

  const handleOnGameOver = () => {
    pararMusicasFundo();
    setIsRunning(false);
    setIsGameOver(true);
    tocarSomCurto(playerColisao, 1.0, false);
  };

  const registrarColetaLeite = (pontosGanhos, isCoelho) => {
    const anterior = pontuacaoRef.current;
    const novo = anterior + pontosGanhos;
    pontuacaoRef.current = novo;

    leitesColetadosRef.current += 1;
    const totalLeites = leitesColetadosRef.current;

    setPontuacao(novo);
    setRecorde((recAtual) => (novo > recAtual ? novo : recAtual));

    const cruzouMultiplo50 = Math.floor(novo / 50) > Math.floor(anterior / 50);
    const atingiuMultiplo10Leites = totalLeites > 0 && totalLeites % 10 === 0;

    if (isCoelho) {
      tocarSomCurto(playerSeuSafado, 1.0, true);
    }

    if (cruzouMultiplo50) {
      tocarSomCurto(playerGanancioso, 1.0, true);
    } else if (atingiuMultiplo10Leites) {
      tocarSomCurto(playerGuloso, 1.0, true);
    }
  };

  const handleOnEvent = (event) => {
    switch (event.type) {
      case 'game_over':
        handleOnGameOver();
        break;
      case 'pulo_gato':
        ocultarBotoesSistema();
        tocarSomCurto(playerMiado, 0.18, false);
        sincronizarMusicaFundo(temaAtual, efeitoCoelho.ativo, false);
        break;
      case 'coletou_leite_urso':
        registrarColetaLeite(event.pontos || 1, false);
        sincronizarMusicaFundo(temaAtual, efeitoCoelho.ativo, false);
        break;
      case 'coletou_leite_coelho':
        registrarColetaLeite(event.pontos || 3, true);
        setEfeitoCoelho({ ativo: true, segundos: event.segundos || 10 });
        sincronizarMusicaFundo(temaAtual, true, false);
        break;
      case 'efeito_coelho_tick':
        setEfeitoCoelho({ ativo: event.ativo, segundos: event.segundos });
        sincronizarMusicaFundo(temaAtual, event.ativo, false);
        break;
      default:
        break;
    }
  };

  const alternarTema = () => {
    const novoTema = temaAtual === 'DIA' ? 'NOITE' : 'DIA';
    setTemaAtual(novoTema);
    sincronizarMusicaFundo(novoTema, efeitoCoelho.ativo, isGameOver);
    if (gameEngineRef.current && isRunning) {
      gameEngineRef.current.swap(
        criarEntidadesIniciais(novoTema, larguraAtual, alturaAtual, pontuacaoRef.current)
      );
    }
  };

  const aoMedirLayout = (e) => {
    ocultarBotoesSistema();
    const { width, height } = e.nativeEvent.layout;
    if (
      width > 0 &&
      height > 0 &&
      (Math.abs(width - dimensoesLayout.largura) > 2 ||
        Math.abs(height - dimensoesLayout.altura) > 2)
    ) {
      setDimensoesLayout({ largura: width, altura: height });
      if (gameEngineRef.current && isRunning) {
        gameEngineRef.current.swap(
          criarEntidadesIniciais(temaAtual, width, height, pontuacaoRef.current)
        );
      }
    }
  };

  const renderizarLinhaControleAudio = (
    titulo,
    subtitulo,
    chaveVolume,
    chaveMudo
  ) => {
    const volume = cfgAudio[chaveVolume];
    const mudo = cfgAudio[chaveMudo] || volume === 0;
    const niveis = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    return (
      <View
        style={[
          styles.blocoAudio,
          isPaisagem && styles.blocoAudioPaisagem,
        ]}
      >
        <View
          style={[
            styles.cabecalhoBlocoAudio,
            isPaisagem && styles.cabecalhoBlocoAudioPaisagem,
          ]}
        >
          <View style={styles.infoCanalAudio}>
            <Text style={styles.tituloBlocoAudio}>{titulo}</Text>
            {!isPaisagem && (
              <Text style={styles.subtituloBlocoAudio}>{subtitulo}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.botaoMudo,
              mudo ? styles.botaoMudoAtivo : styles.botaoMudoInativo,
            ]}
            onPress={() => alternarMudoCanal(chaveMudo, chaveVolume)}
          >
            <Text style={styles.botaoMudoTexto}>
              {mudo ? 'MUTADO' : `${volume}%`}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.controlesVolumeRow,
            isPaisagem && styles.controlesVolumeRowPaisagem,
          ]}
        >
          <TouchableOpacity
            style={styles.botaoAjusteVolume}
            onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, volume - 10)}
          >
            <Text style={styles.botaoAjusteVolumeTexto}>-</Text>
          </TouchableOpacity>

          <View style={styles.barraSegmentosContainer}>
            {niveis.map((nivel) => {
              const preenchido = !mudo && volume >= nivel;
              return (
                <TouchableOpacity
                  key={`${chaveVolume}_${nivel}`}
                  style={[
                    styles.segmentoVolume,
                    preenchido
                      ? styles.segmentoVolumeAtivo
                      : styles.segmentoVolumeInativo,
                  ]}
                  onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, nivel)}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.botaoAjusteVolume}
            onPress={() => alterarVolumeCanal(chaveVolume, chaveMudo, volume + 10)}
          >
            <Text style={styles.botaoAjusteVolumeTexto}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const imagemFundo = AssetsJogo.FUNDOS[temaAtual];
  const dadosTema = Configuracoes.TEMAS[temaAtual];
  const paddingTopoSeguro = isPaisagem
    ? 6
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 10
    : 42;

  return (
    <ImageBackground
      source={imagemFundo}
      style={[styles.container, { backgroundColor: dadosTema.corFundoFallback }]}
      resizeMode="cover"
      onLayout={aoMedirLayout}
    >
      <SafeAreaView style={styles.hudSafeArea} pointerEvents="box-none">
        <View
          style={[
            styles.hudTopoRow,
            { paddingTop: paddingTopoSeguro },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.grupoBotoesHud}>
            <TouchableOpacity
              style={styles.botaoHud}
              onPress={() => {
                pararMusicasFundo();
                navigation.navigate('TelaBoasVindas', { temaInicial: temaAtual });
              }}
            >
              <Text style={styles.botaoHudTexto}>MENU</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoHud, styles.botaoHudEspaco]}
              onPress={abrirModalAudio}
            >
              <Text style={styles.botaoHudTexto}>
                {cfgAudio.mudoGeral ? 'AUDIO: OFF' : 'AUDIO'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.placarBox,
              isPaisagem && styles.placarBoxPaisagem,
              efeitoCoelho.ativo && styles.placarBoxEfeito,
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.placarValor, isPaisagem && styles.placarValorPaisagem]}>
              {pontuacao}
            </Text>
            <Text style={styles.placarLabel}>
              {efeitoCoelho.ativo ? `3X (${efeitoCoelho.segundos}s)` : 'PONTOS'}
            </Text>
          </View>

          <TouchableOpacity style={styles.botaoHud} onPress={alternarTema}>
            <Text style={styles.botaoHudTexto}>
              {temaAtual === 'DIA' ? 'TEMA DIA' : 'TEMA NOITE'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {!isRunning && !isGameOver && (
        <View style={[styles.overlayCentral, isPaisagem && styles.overlayCentralPaisagem]}>
          <View
            style={[
              styles.startCard,
              isPaisagem && styles.cardPaisagem,
              { backgroundColor: dadosTema.corCard },
            ]}
          >
            {isPaisagem ? (
              <View style={styles.cardPaisagemRow}>
                <View style={styles.cardPaisagemColEsquerda}>
                  <Text style={styles.logoTextoPaisagem}>FLAPPY DCAT</Text>
                  <Text style={[styles.subtituloStartPaisagem, { color: dadosTema.corTexto }]}>
                    {dadosTema.subtitulo}
                  </Text>
                  <Image
                    source={
                      temaAtual === 'DIA'
                        ? AssetsJogo.GATO.NORMAL.ASA_CIMA
                        : AssetsJogo.GATO.EFEITO.ASA_CIMA
                    }
                    style={styles.gatoStartPreviewPaisagem}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardPaisagemColDireita}>
                  <TouchableWithoutFeedback onPress={handleOnStartGame}>
                    <View
                      style={[
                        styles.playButton,
                        styles.playButtonPaisagem,
                        { backgroundColor: dadosTema.corPrimaria },
                      ]}
                    >
                      <Text style={styles.playButtonText}>PLAY</Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <Text style={[styles.dicaStartPaisagem, { color: dadosTema.corTexto }]}>
                    Toque na tela para bater as asas e desviar das maos
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.logoTexto}>FLAPPY DCAT</Text>
                <Text style={[styles.subtituloStart, { color: dadosTema.corTexto }]}>
                  {dadosTema.subtitulo}
                </Text>

                <Image
                  source={
                    temaAtual === 'DIA'
                      ? AssetsJogo.GATO.NORMAL.ASA_CIMA
                      : AssetsJogo.GATO.EFEITO.ASA_CIMA
                  }
                  style={styles.gatoStartPreview}
                  resizeMode="contain"
                />

                <TouchableWithoutFeedback onPress={handleOnStartGame}>
                  <View
                    style={[
                      styles.playButton,
                      { backgroundColor: dadosTema.corPrimaria },
                    ]}
                  >
                    <Text style={styles.playButtonText}>PLAY</Text>
                  </View>
                </TouchableWithoutFeedback>

                <Text style={[styles.dicaStart, { color: dadosTema.corTexto }]}>
                  Toque na tela para bater as asas e desviar das maos
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {!isRunning && isGameOver && (
        <View style={[styles.overlayCentral, isPaisagem && styles.overlayCentralPaisagem]}>
          <View
            style={[
              styles.gameOverCard,
              isPaisagem && styles.cardPaisagem,
              { backgroundColor: dadosTema.corCard, borderColor: '#E63946' },
            ]}
          >
            {isPaisagem ? (
              <View style={styles.cardPaisagemRow}>
                <View style={styles.cardPaisagemColEsquerda}>
                  <Text style={styles.gameOverLogoPaisagem}>GAME OVER</Text>
                  <View style={[styles.placarFinalRow, styles.placarFinalRowPaisagem]}>
                    <View style={styles.placarFinalItem}>
                      <Text style={styles.placarFinalNumero}>{pontuacao}</Text>
                      <Text style={[styles.placarFinalLabel, { color: dadosTema.corTexto }]}>
                        PONTOS
                      </Text>
                    </View>
                    <View style={styles.divisorVertical} />
                    <View style={styles.placarFinalItem}>
                      <Text style={styles.placarFinalNumero}>
                        {Math.max(recorde, pontuacao)}
                      </Text>
                      <Text style={[styles.placarFinalLabel, { color: dadosTema.corTexto }]}>
                        RECORDE
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardPaisagemColDireita}>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      styles.botaoFullPaisagem,
                      { backgroundColor: dadosTema.corPrimaria },
                    ]}
                    onPress={handleOnStartGame}
                  >
                    <Text style={styles.playButtonTextPaisagem}>JOGAR NOVAMENTE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoVoltarStart, styles.botaoFullPaisagem]}
                    onPress={handlebackToStart}
                  >
                    <Text style={styles.botaoVoltarStartTexto}>TELA DE START</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.gameOverLogo}>GAME OVER</Text>

                <Image
                  source={
                    efeitoCoelho.ativo
                      ? AssetsJogo.GATO.EFEITO.COLISAO
                      : AssetsJogo.GATO.NORMAL.COLISAO
                  }
                  style={styles.gatoColisaoImg}
                  resizeMode="contain"
                />

                <View style={styles.placarFinalRow}>
                  <View style={styles.placarFinalItem}>
                    <Text style={styles.placarFinalNumero}>{pontuacao}</Text>
                    <Text style={[styles.placarFinalLabel, { color: dadosTema.corTexto }]}>
                      PONTOS
                    </Text>
                  </View>
                  <View style={styles.divisorVertical} />
                  <View style={styles.placarFinalItem}>
                    <Text style={styles.placarFinalNumero}>
                      {Math.max(recorde, pontuacao)}
                    </Text>
                    <Text style={[styles.placarFinalLabel, { color: dadosTema.corTexto }]}>
                      RECORDE
                    </Text>
                  </View>
                </View>

                <View style={styles.botoesColRetrato}>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      { width: '100%', backgroundColor: dadosTema.corPrimaria },
                    ]}
                    onPress={handleOnStartGame}
                  >
                    <Text style={styles.playButtonText}>JOGAR NOVAMENTE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botaoVoltarStart}
                    onPress={handlebackToStart}
                  >
                    <Text style={styles.botaoVoltarStartTexto}>TELA DE START</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {isRunning && (
        <GameEngine
          key={`engine_${larguraAtual}x${alturaAtual}`}
          systems={[Physics]}
          ref={gameEngineRef}
          running={isRunning}
          entities={criarEntidadesIniciais(
            temaAtual,
            larguraAtual,
            alturaAtual,
            pontuacaoRef.current
          )}
          onEvent={handleOnEvent}
          style={styles.engineContainer}
        />
      )}

      {modalAudioVisivel && (
        <View style={styles.modalFundoAbsoluto}>
          <View style={[styles.modalCard, isPaisagem && styles.modalCardPaisagem]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>CONFIGURACAO DE AUDIO</Text>
              <TouchableOpacity
                style={styles.botaoFecharTopo}
                onPress={fecharModalAudio}
              >
                <Text style={styles.botaoFecharTopoTexto}>FECHAR X</Text>
              </TouchableOpacity>
            </View>

            {renderizarLinhaControleAudio(
              'GERAL',
              'Controla ou muta todos os audios do jogo',
              'volumeGeral',
              'mudoGeral'
            )}

            {renderizarLinhaControleAudio(
              'MUSICAS',
              'Controla ou muta apenas a trilha sonora',
              'volumeMusica',
              'mudoMusica'
            )}

            {renderizarLinhaControleAudio(
              'EFEITOS',
              'Controla ou muta apenas vozes e miado',
              'volumeEfeitos',
              'mudoEfeitos'
            )}

            <TouchableOpacity
              style={[
                styles.botaoFecharModal,
                isPaisagem && styles.botaoFecharModalPaisagem,
                { backgroundColor: dadosTema.corPrimaria },
              ]}
              onPress={fecharModalAudio}
            >
              <Text style={styles.botaoFecharModalTexto}>
                {estavaRodandoAntesModal ? 'FECHAR E VOLTAR AO JOGO' : 'FECHAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  engineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hudSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
  hudTopoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  grupoBotoesHud: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoHudEspaco: {
    marginLeft: 6,
  },
  botaoHud: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  botaoHudTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  placarBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD166',
  },
  placarBoxPaisagem: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  placarBoxEfeito: {
    backgroundColor: 'rgba(123, 44, 191, 0.92)',
    borderColor: '#00F5D4',
  },
  placarValor: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  placarValorPaisagem: {
    fontSize: 16,
  },
  placarLabel: {
    color: '#FFD166',
    fontSize: 9.5,
    fontWeight: '900',
  },
  overlayCentral: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  overlayCentralPaisagem: {
    paddingTop: 34,
  },
  startCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD166',
  },
  cardPaisagem: {
    maxWidth: 520,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  cardPaisagemRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPaisagemColEsquerda: {
    width: '48%',
    alignItems: 'center',
  },
  cardPaisagemColDireita: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFB703',
    letterSpacing: 1.5,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  logoTextoPaisagem: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFB703',
    letterSpacing: 1.2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtituloStart: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 10,
  },
  subtituloStartPaisagem: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 4,
  },
  gatoStartPreview: {
    width: 115,
    height: 68,
    marginBottom: 12,
  },
  gatoStartPreviewPaisagem: {
    width: 82,
    height: 48,
  },
  playButton: {
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPaisagem: {
    width: '100%',
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginTop: 0,
  },
  playButtonText: {
    color: '#023047',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  playButtonTextPaisagem: {
    color: '#023047',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dicaStart: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  dicaStartPaisagem: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  gameOverCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 3,
  },
  gameOverLogo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#E63946',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  gameOverLogoPaisagem: {
    fontSize: 22,
    fontWeight: '900',
    color: '#E63946',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  gatoColisaoImg: {
    width: 120,
    height: 70,
    marginBottom: 12,
  },
  placarFinalRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  placarFinalRowPaisagem: {
    marginBottom: 0,
    paddingVertical: 8,
  },
  placarFinalItem: {
    alignItems: 'center',
    flex: 1,
  },
  divisorVertical: {
    width: 1,
    backgroundColor: 'rgba(150,150,150,0.35)',
  },
  placarFinalNumero: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFB703',
  },
  placarFinalLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  botoesColRetrato: {
    width: '100%',
  },
  botaoFullPaisagem: {
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  botaoVoltarStart: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoVoltarStartTexto: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  modalFundoAbsoluto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 200,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2.5,
    borderColor: '#FFD166',
  },
  modalCardPaisagem: {
    maxWidth: 620,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitulo: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    flex: 1,
  },
  botaoFecharTopo: {
    backgroundColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginLeft: 8,
  },
  botaoFecharTopoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  blocoAudio: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  blocoAudioPaisagem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  cabecalhoBlocoAudio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cabecalhoBlocoAudioPaisagem: {
    width: 175,
    marginBottom: 0,
    marginRight: 10,
  },
  infoCanalAudio: {
    flex: 1,
  },
  tituloBlocoAudio: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  subtituloBlocoAudio: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  botaoMudo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    minWidth: 68,
    alignItems: 'center',
  },
  botaoMudoAtivo: {
    backgroundColor: '#E63946',
  },
  botaoMudoInativo: {
    backgroundColor: '#2A9D8F',
  },
  botaoMudoTexto: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  controlesVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlesVolumeRowPaisagem: {
    flex: 1,
  },
  botaoAjusteVolume: {
    width: 30,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAjusteVolumeTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  barraSegmentosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    height: 18,
    alignItems: 'center',
  },
  segmentoVolume: {
    flex: 1,
    height: 14,
    marginHorizontal: 2,
    borderRadius: 3,
  },
  segmentoVolumeAtivo: {
    backgroundColor: '#FFB703',
  },
  segmentoVolumeInativo: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  botaoFecharModal: {
    marginTop: 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoFecharModalPaisagem: {
    paddingVertical: 7,
  },
  botaoFecharModalTexto: {
    color: '#023047',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
