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
} from 'react-native';
import { Configuracoes, AssetsJogo } from '../models/Configuracoes';

export default function TelaInstrucoes({ navigation, route }) {
  const temaAtual = route?.params?.temaEscolhido || 'DIA';
  const dadosTema = Configuracoes.TEMAS[temaAtual];
  const imagemFundo = AssetsJogo.FUNDOS[temaAtual];

  return (
    <ImageBackground source={imagemFundo} style={styles.fundo} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.titulo}>COMO JOGAR</Text>
            <Text style={styles.subtitulo}>Guia Completo - Flappy Dcat</Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
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
                    - <Text style={styles.negrito}>Toque na Tela (Tap):</Text> Aplica impulso
                    vertical fazendo o gatinho bater as asas e subir.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - <Text style={styles.negrito}>Gravidade:</Text> Sem tocar na tela, a gravidade
                    puxa o gatinho constantemente para baixo.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - <Text style={styles.negrito}>Limites:</Text> Tocar no teto ou no chao resulta
                    em <Text style={styles.destaquePerigo}>Game Over</Text>.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
              <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                2. Obstaculos e Temas Dinamicos
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
                    Pares de maos surgem da direita para a esquerda. Passe pelo espaco vazio central.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - <Text style={styles.negrito}>Tema Dia:</Text> Manga colorida de algodao-doce.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - <Text style={styles.negrito}>Tema Noite:</Text> Luva com garras da Mulher-Gato.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
              <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                3. Itens Coletaveis e Power-ups
              </Text>

              <View style={styles.itemRow}>
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
                    Surge sempre no <Text style={styles.negrito}>centro do espaco vazio</Text>{' '}
                    (caminho seguro). Recompensa: <Text style={styles.negrito}>+1 ponto</Text>.
                  </Text>
                </View>
              </View>

              <View style={styles.divisor} />

              <View style={styles.itemRow}>
                <Image
                  source={AssetsJogo.ITENS.LEITE_COELHO}
                  style={styles.iconeLeite}
                  resizeMode="contain"
                />
                <View style={styles.textoCol}>
                  <Text style={[styles.subtituloItem, { color: '#E76F51' }]}>
                    Leite de Coelho (Power-up Premium)
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    Surge nos <Text style={styles.negrito}>cantos extremos da tela</Text> (alto
                    risco). Durante <Text style={styles.negrito}>10 segundos</Text>:
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - Multiplica a pontuacao ganha por <Text style={styles.negrito}>3x</Text>.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - Aumenta a velocidade do cenario em <Text style={styles.negrito}>1.05x</Text>.
                  </Text>
                  <Text style={[styles.itemTexto, { color: dadosTema.corTexto }]}>
                    - Ativa a propulsao de <Text style={styles.negrito}>fumaca de arco-iris</Text>.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

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
    paddingVertical: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 26,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spriteExemplo: {
    width: 68,
    height: 52,
    marginRight: 10,
  },
  iconeMao: {
    width: 28,
    height: 70,
    marginRight: 6,
  },
  iconeLeite: {
    width: 44,
    height: 60,
    marginRight: 12,
  },
  textoCol: {
    flex: 1,
  },
  subtituloItem: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  itemTexto: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 3,
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
    marginVertical: 10,
  },
  footerBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  botaoVoltar: {
    flex: 1,
    marginRight: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  botaoVoltarTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  botaoJogar: {
    flex: 1.4,
    marginLeft: 6,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoJogarTexto: {
    color: '#023047',
    fontWeight: '900',
    fontSize: 14,
  },
});
