import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import {
  Configuracoes,
  AssetsJogo,
  obterConfigAudio,
  atualizarConfigAudio,
  inscreverConfigAudio,
} from '../models/Configuracoes';
import Gato from '../components/Gato';

export default function TelaBoasVindas({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

  const [temaAtual, setTemaAtual] = useState(route?.params?.temaInicial || 'DIA');
  const [asaCimaPreview, setAsaCimaPreview] = useState(true);
  const [efeitoPreview, setEfeitoPreview] = useState(false);
  const [modalAudioVisivel, setModalAudioVisivel] = useState(false);
  const [cfgAudio, setCfgAudio] = useState(obterConfigAudio);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAsaCimaPreview((prev) => !prev);
    }, 360);
    const cancelarInscricao = inscreverConfigAudio((novaCfg) => {
      setCfgAudio(novaCfg);
    });
    return () => {
      clearInterval(intervalo);
      cancelarInscricao();
    };
  }, []);

  const dadosTema = Configuracoes.TEMAS[temaAtual];
  const imagemFundo = AssetsJogo.FUNDOS[temaAtual];

  const alternarTema = (novoTema) => {
    setTemaAtual(novoTema);
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

  const paddingTopo = isPaisagem
    ? 6
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 10
    : 18;

  const renderizarCardPreview = () => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setEfeitoPreview((prev) => !prev)}
      style={[
        styles.previewCard,
        isPaisagem && styles.previewCardPaisagem,
        {
          backgroundColor: dadosTema.corCard,
          borderColor: dadosTema.corPrimaria,
        },
      ]}
    >
      <View style={[styles.gatoPreviewBox, isPaisagem && styles.gatoPreviewBoxPaisagem]}>
        <Gato
          PosicaoAbsoluta={false}
          escala={isPaisagem ? 0.95 : 1.25}
          efeitoAtivo={efeitoPreview}
          estado={
            asaCimaPreview
              ? Configuracoes.ESTADOS_GATO.ASA_CIMA
              : Configuracoes.ESTADOS_GATO.ASA_BAIXO
          }
        />
      </View>
      <Text style={[styles.dicaPreview, { color: dadosTema.corTexto }]}>
        {efeitoPreview
          ? 'Modo Leite de Coelho (3x) - Toque para alternar'
          : 'Toque no gatinho para ver o Turbo Arco-Iris'}
      </Text>

      <View style={styles.itensResumoRow}>
        <View style={styles.itemBadge}>
          <Image
            source={AssetsJogo.ITENS.LEITE_URSO}
            style={styles.iconeLeite}
            resizeMode="contain"
          />
          <Text style={[styles.itemBadgeTexto, { color: dadosTema.corTexto }]}>
            Leite de Urso (+1 pt)
          </Text>
        </View>
        <View style={styles.itemBadge}>
          <Image
            source={AssetsJogo.ITENS.LEITE_COELHO}
            style={styles.iconeLeite}
            resizeMode="contain"
          />
          <Text style={[styles.itemBadgeTexto, { color: dadosTema.corTexto }]}>
            Leite de Coelho (3x)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderizarControlesMenu = () => (
    <View style={styles.blocoDireitoMenu}>
      <View style={styles.seletorTemaContainer}>
        <Text style={styles.seletorLabel}>ESCOLHA O TEMA DO CENARIO:</Text>
        <View style={styles.botoesTemaRow}>
          <TouchableOpacity
            style={[
              styles.botaoTema,
              isPaisagem && styles.botaoTemaPaisagem,
              temaAtual === 'DIA' && styles.botaoTemaAtivoDia,
            ]}
            onPress={() => alternarTema('DIA')}
          >
            <Text
              style={[
                styles.botaoTemaTexto,
                temaAtual === 'DIA' && styles.botaoTemaTextoAtivo,
              ]}
            >
              TEMA DIA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoTema,
              isPaisagem && styles.botaoTemaPaisagem,
              temaAtual === 'NOITE' && styles.botaoTemaAtivoNoite,
            ]}
            onPress={() => alternarTema('NOITE')}
          >
            <Text
              style={[
                styles.botaoTemaTexto,
                temaAtual === 'NOITE' && styles.botaoTemaTextoAtivoNoite,
              ]}
            >
              TEMA NOITE
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuBotoes}>
        <TouchableOpacity
          style={[
            styles.botaoPrincipal,
            isPaisagem && styles.botaoPrincipalPaisagem,
            { backgroundColor: dadosTema.corPrimaria },
          ]}
          onPress={() => navigation.navigate('TelaJogo', { temaEscolhido: temaAtual })}
        >
          <Text style={styles.botaoPrincipalTexto}>JOGAR AGORA</Text>
        </TouchableOpacity>

        <View style={styles.botoesSecundariosRow}>
          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() =>
              navigation.navigate('TelaInstrucoes', { temaEscolhido: temaAtual })
            }
          >
            <Text style={styles.botaoSecundarioTexto}>INSTRUCOES</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() => setModalAudioVisivel(true)}
          >
            <Text style={styles.botaoSecundarioTexto}>
              {cfgAudio.mudoGeral ? 'AUDIO: OFF' : 'AUDIO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoSecundario, isPaisagem && styles.botaoSecundarioPaisagem]}
            onPress={() =>
              navigation.navigate('TelaCreditos', { temaEscolhido: temaAtual })
            }
          >
            <Text style={styles.botaoSecundarioTexto}>CREDITOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={imagemFundo} style={styles.fundo} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.overlay,
            { paddingTop: paddingTopo },
            isPaisagem && styles.overlayPaisagem,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {isPaisagem ? (
            <View style={styles.containerPaisagemRow}>
              <View style={styles.colunaEsquerdaPaisagem}>
                <View style={styles.headerPaisagemRow}>
                  <Text style={styles.tituloPaisagem}>FLAPPY DCAT</Text>
                  <View style={styles.badgeTopoPaisagem}>
                    <Text style={styles.badgeTexto}>{Configuracoes.META.INSTITUICAO}</Text>
                  </View>
                </View>
                {renderizarCardPreview()}
              </View>

              <View style={styles.colunaDireitaPaisagem}>
                {renderizarControlesMenu()}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.badgeTopo}>
                <Text style={styles.badgeTexto}>{Configuracoes.META.INSTITUICAO}</Text>
              </View>

              <View style={styles.headerContainer}>
                <Text style={styles.tituloSombra}>FLAPPY DCAT</Text>
                <Text style={styles.titulo}>FLAPPY DCAT</Text>
                <Text style={styles.subtitulo}>{dadosTema.subtitulo}</Text>
              </View>

              {renderizarCardPreview()}
              {renderizarControlesMenu()}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {modalAudioVisivel && (
        <View style={styles.modalFundoAbsoluto}>
          <View style={[styles.modalCard, isPaisagem && styles.modalCardPaisagem]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>CONFIGURACAO DE AUDIO</Text>
              <TouchableOpacity
                style={styles.botaoFecharTopo}
                onPress={() => setModalAudioVisivel(false)}
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
              onPress={() => setModalAudioVisivel(false)}
            >
              <Text style={styles.botaoFecharModalTexto}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  overlay: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayPaisagem: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  containerPaisagemRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colunaEsquerdaPaisagem: {
    width: '49%',
    justifyContent: 'center',
  },
  colunaDireitaPaisagem: {
    width: '48%',
    justifyContent: 'center',
  },
  blocoDireitoMenu: {
    width: '100%',
  },
  headerPaisagemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeTopo: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 6,
  },
  badgeTopoPaisagem: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  badgeTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tituloSombra: {
    position: 'absolute',
    top: 3,
    fontSize: 40,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  titulo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tituloPaisagem: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitulo: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  previewCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 10,
  },
  previewCardPaisagem: {
    padding: 8,
    marginBottom: 0,
  },
  gatoPreviewBox: {
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gatoPreviewBoxPaisagem: {
    height: 54,
  },
  dicaPreview: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  itensResumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.3)',
    paddingTop: 6,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeLeite: {
    width: 22,
    height: 30,
    marginRight: 5,
  },
  itemBadgeTexto: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  seletorTemaContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  seletorLabel: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  botoesTemaRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  botaoTema: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
  },
  botaoTemaPaisagem: {
    paddingVertical: 8,
  },
  botaoTemaAtivoDia: {
    backgroundColor: '#FFB703',
    borderColor: '#FFFFFF',
  },
  botaoTemaAtivoNoite: {
    backgroundColor: '#1D3557',
    borderColor: '#F4A261',
  },
  botaoTemaTexto: {
    color: '#E0E0E0',
    fontWeight: '800',
    fontSize: 12.5,
  },
  botaoTemaTextoAtivo: {
    color: '#023047',
  },
  botaoTemaTextoAtivoNoite: {
    color: '#FFD166',
  },
  menuBotoes: {
    width: '100%',
  },
  botaoPrincipal: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  botaoPrincipalPaisagem: {
    paddingVertical: 11,
    marginBottom: 6,
  },
  botaoPrincipalTexto: {
    color: '#023047',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  botoesSecundariosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoSecundario: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  botaoSecundarioPaisagem: {
    paddingVertical: 9,
  },
  botaoSecundarioTexto: {
    color: '#FFFFFF',
    fontSize: 11.5,
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
