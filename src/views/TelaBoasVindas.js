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
  Modal,
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
      <View style={styles.blocoAudio}>
        <View style={styles.cabecalhoBlocoAudio}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloBlocoAudio}>{titulo}</Text>
            <Text style={styles.subtituloBlocoAudio}>{subtitulo}</Text>
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

        <View style={styles.controlesVolumeRow}>
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
    ? 10
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 12
    : 20;

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
          <View style={styles.badgeTopo}>
            <Text style={styles.badgeTexto}>{Configuracoes.META.INSTITUICAO}</Text>
          </View>

          <View style={styles.headerContainer}>
            <Text style={[styles.tituloSombra, isPaisagem && styles.tituloPaisagem]}>
              FLAPPY DCAT
            </Text>
            <Text style={[styles.titulo, isPaisagem && styles.tituloPaisagem]}>
              FLAPPY DCAT
            </Text>
            <Text style={styles.subtitulo}>{dadosTema.subtitulo}</Text>
          </View>

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
                escala={isPaisagem ? 1.05 : 1.25}
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
                ? 'Modo Leite de Coelho (3x Pontos) - Toque para alternar'
                : 'Estado Normal - Toque no gatinho para ver o Turbo Arco-Iris'}
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
                  Leite de Coelho (3x / 10s)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.seletorTemaContainer, isPaisagem && styles.larguraMaxPaisagem]}>
            <Text style={styles.seletorLabel}>ESCOLHA O TEMA DO CENARIO:</Text>
            <View style={styles.botoesTemaRow}>
              <TouchableOpacity
                style={[
                  styles.botaoTema,
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

          <View style={[styles.menuBotoes, isPaisagem && styles.larguraMaxPaisagem]}>
            <TouchableOpacity
              style={[styles.botaoPrincipal, { backgroundColor: dadosTema.corPrimaria }]}
              onPress={() => navigation.navigate('TelaJogo', { temaEscolhido: temaAtual })}
            >
              <Text style={styles.botaoPrincipalTexto}>JOGAR AGORA</Text>
            </TouchableOpacity>

            <View style={styles.botoesSecundariosRow}>
              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() =>
                  navigation.navigate('TelaInstrucoes', { temaEscolhido: temaAtual })
                }
              >
                <Text style={styles.botaoSecundarioTexto}>INSTRUCOES</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => setModalAudioVisivel(true)}
              >
                <Text style={styles.botaoSecundarioTexto}>
                  {cfgAudio.mudoGeral ? 'AUDIO: OFF' : 'AUDIO'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() =>
                  navigation.navigate('TelaCreditos', { temaEscolhido: temaAtual })
                }
              >
                <Text style={styles.botaoSecundarioTexto}>CREDITOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={modalAudioVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalAudioVisivel(false)}
      >
        <View style={styles.modalFundo}>
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

            <ScrollView
              style={styles.modalScrollArea}
              showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>

            <TouchableOpacity
              style={[styles.botaoFecharModal, { backgroundColor: dadosTema.corPrimaria }]}
              onPress={() => setModalAudioVisivel(false)}
            >
              <Text style={styles.botaoFecharModalTexto}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayPaisagem: {
    paddingVertical: 10,
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
  badgeTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
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
    fontSize: 30,
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
    maxWidth: 520,
    padding: 10,
  },
  larguraMaxPaisagem: {
    maxWidth: 520,
  },
  gatoPreviewBox: {
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gatoPreviewBoxPaisagem: {
    height: 62,
  },
  dicaPreview: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  itensResumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.3)',
    paddingTop: 10,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeLeite: {
    width: 26,
    height: 34,
    marginRight: 6,
  },
  itemBadgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  seletorTemaContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  seletorLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
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
    marginHorizontal: 5,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
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
    fontSize: 13,
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
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  botaoPrincipalTexto: {
    color: '#023047',
    fontSize: 18,
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  botaoSecundarioTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2.5,
    borderColor: '#FFD166',
  },
  modalCardPaisagem: {
    maxWidth: 480,
    maxHeight: '94%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    paddingVertical: 6,
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
  modalScrollArea: {
    flexGrow: 0,
  },
  blocoAudio: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  cabecalhoBlocoAudio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tituloBlocoAudio: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  subtituloBlocoAudio: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  botaoMudo: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 74,
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
    fontSize: 11,
    fontWeight: '900',
  },
  controlesVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoAjusteVolume: {
    width: 32,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAjusteVolumeTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  barraSegmentosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    height: 20,
    alignItems: 'center',
  },
  segmentoVolume: {
    flex: 1,
    height: 16,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  segmentoVolumeAtivo: {
    backgroundColor: '#FFB703',
  },
  segmentoVolumeInativo: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  botaoFecharModal: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoFecharModalTexto: {
    color: '#023047',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
