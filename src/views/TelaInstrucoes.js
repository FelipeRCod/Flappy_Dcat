import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Configuracoes, AssetsJogo } from '../models/Configuracoes';

export default function TelaInstrucoes({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

  const temaAtual = route?.params?.temaEscolhido || 'DIA';
  const dadosTema = Configuracoes.TEMAS[temaAtual];
  const imagemFundo = AssetsJogo.FUNDOS[temaAtual];

  const paddingTopo = isPaisagem
    ? 6
    : Platform.OS === 'android'
    ? (RNStatusBar.currentHeight || 24) + 8
    : 14;

  return (
    <ImageBackground source={imagemFundo} style={styles.fundo} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.overlay, { paddingTop: paddingTopo }, isPaisagem && styles.overlayPaisagem]}>
          {isPaisagem ? (
            <View style={styles.headerPaisagemRow}>
              <TouchableOpacity
                style={styles.botaoTopoPaisagem}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR</Text>
              </TouchableOpacity>

              <View style={styles.headerCentroPaisagem}>
                <Text style={styles.tituloPaisagem}>COMO JOGAR</Text>
                <Text style={styles.subtituloPaisagem}>Guia Completo - Flappy Dcat</Text>
              </View>

              <TouchableOpacity
                style={[styles.botaoJogarTopoPaisagem, { backgroundColor: dadosTema.corPrimaria }]}
                onPress={() => navigation.navigate('TelaJogo', { temaEscolhido: temaAtual })}
              >
                <Text style={styles.botaoJogarTexto}>JOGAR AGORA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.header}>
              <Text style={styles.titulo}>COMO JOGAR</Text>
              <Text style={styles.subtitulo}>Guia Completo - Flappy Dcat</Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[isPaisagem && styles.gridPaisagemRow]}>
              <View
                style={[
                  styles.card,
                  isPaisagem && styles.cardMetadePaisagem,
                  { backgroundColor: dadosTema.corCard },
                ]}
              >
                <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                  1. Controles e Fisica
                </Text>
                <View style={styles.itemRow}>
                  <Image
                    source={AssetsJogo.GATO.NORMAL.ASA_CIMA}
                    style={styles.spriteExemplo}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      - <Text style={styles.negrito}>Toque na Tela:</Text> Faz o gatinho bater as asas e subir.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      - <Text style={styles.negrito}>Gravidade:</Text> Puxa o gatinho constantemente para baixo.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      - <Text style={styles.negrito}>Limites:</Text> Tocar no teto ou no chao resulta em{' '}
                      <Text style={styles.destaquePerigo}>Game Over</Text>.
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.card,
                  isPaisagem && styles.cardMetadePaisagem,
                  { backgroundColor: dadosTema.corCard },
                ]}
              >
                <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                  2. Obstaculos e Temas
                </Text>
                <View style={styles.itemRow}>
                  <Image
                    source={AssetsJogo.OBSTACULOS.DIA}
                    style={styles.iconeMao}
                    resizeMode="contain"
                  />
                  <Image
                    source={AssetsJogo.OBSTACULOS.NOITE}
                    style={styles.iconeMao}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      Passe pelo espaco vazio central entre as maos. A frequencia aumenta conforme sua pontuacao sobe.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      - <Text style={styles.negrito}>Dia:</Text> Manga colorida de algodao-doce.
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      - <Text style={styles.negrito}>Noite:</Text> Luva com garras da Mulher-Gato.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
              <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                3. Itens Coletaveis e Power-ups
              </Text>

              <View style={isPaisagem ? styles.gridPaisagemRow : null}>
                <View style={[styles.itemRow, isPaisagem && styles.itemMetadePaisagem]}>
                  <Image
                    source={AssetsJogo.ITENS.LEITE_URSO}
                    style={styles.iconeLeite}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.subtituloItem, { color: dadosTema.corTexto }]}>
                      Leite de Urso (Item Padrao)
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      Surge no <Text style={styles.negrito}>centro do espaco vazio</Text>. Vale{' '}
                      <Text style={styles.negrito}>+1 ponto</Text>.
                    </Text>
                  </View>
                </View>

                {!isPaisagem && <View style={styles.divisor} />}

                <View style={[styles.itemRow, isPaisagem && styles.itemMetadePaisagem]}>
                  <Image
                    source={AssetsJogo.ITENS.LEITE_COELHO}
                    style={styles.iconeLeite}
                    resizeMode="contain"
                  />
                  <View style={styles.textoCol}>
                    <Text style={[styles.subtituloItem, { color: '#E76F51' }]}>
                      Leite de Coelho (Power-up 3x)
                    </Text>
                    <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                      Surge nos cantos extremos. Por <Text style={styles.negrito}>10s</Text>: pontos{' '}
                      <Text style={styles.negrito}>3x</Text>, trilha acelerada e turbo arco-iris.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {!isPaisagem && (
            <View style={styles.footerBotoes}>
              <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoJogar, { backgroundColor: dadosTema.corPrimaria }]}
                onPress={() => navigation.navigate('TelaJogo', { temaEscolhido: temaAtual })}
              >
                <Text style={styles.botaoJogarTexto}>JOGAR AGORA</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  overlayPaisagem: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerPaisagemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCentroPaisagem: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD166',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  tituloPaisagem: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD166',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitulo: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtituloPaisagem: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  gridPaisagemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardMetadePaisagem: {
    width: '49%',
  },
  itemMetadePaisagem: {
    width: '48%',
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spriteExemplo: {
    width: 62,
    height: 48,
    marginRight: 10,
  },
  iconeMao: {
    width: 26,
    height: 64,
    marginRight: 6,
  },
  iconeLeite: {
    width: 40,
    height: 54,
    marginRight: 10,
  },
  textoCol: {
    flex: 1,
  },
  subtituloItem: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  itemTexto: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  negrito: {
    fontWeight: '800',
  },
  destaquePerigo: {
    fontWeight: '900',
    color: '#E63946',
  },
  divisor: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    marginVertical: 8,
  },
  footerBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  botaoVoltar: {
    flex: 1,
    marginRight: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoTopoPaisagem: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoVoltarTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
  },
  botaoJogar: {
    flex: 1.4,
    marginLeft: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoJogarTopoPaisagem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoJogarTexto: {
    color: '#023047',
    fontWeight: '900',
    fontSize: 12.5,
  },
});
