import React, { useState } from 'react';
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

export default function TelaCreditos({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isPaisagem = width > height;

  const temaAtual = route?.params?.temaEscolhido || 'DIA';
  const dadosTema = Configuracoes.TEMAS[temaAtual];
  const imagemFundo = AssetsJogo.FUNDOS[temaAtual];

  const [abaSprites, setAbaSprites] = useState('NORMAL');

  const listaSprites =
    abaSprites === 'NORMAL'
      ? [
          { nome: 'Gato_Normal_Asa_Cima.png', desc: 'Subindo (Tap)', img: AssetsJogo.GATO.NORMAL.ASA_CIMA },
          { nome: 'Gato_Normal_Asa_Baixo.png', desc: 'Caindo (Gravidade)', img: AssetsJogo.GATO.NORMAL.ASA_BAIXO },
          { nome: 'Gato_Normal_Leite.png', desc: 'Coletando Leite', img: AssetsJogo.GATO.NORMAL.LEITE },
          { nome: 'Gato_Normal_Colisao.png', desc: 'Colisao / Game Over', img: AssetsJogo.GATO.NORMAL.COLISAO },
        ]
      : [
          { nome: 'Gato_Efeito_Asa_Cima.png', desc: 'Subindo (Turbo 3x)', img: AssetsJogo.GATO.EFEITO.ASA_CIMA },
          { nome: 'Gato_Efeito_Asa_Baixo.png', desc: 'Caindo (Turbo 3x)', img: AssetsJogo.GATO.EFEITO.ASA_BAIXO },
          { nome: 'Gato_Efeito_Leite.png', desc: 'Coletando Leite (3x)', img: AssetsJogo.GATO.EFEITO.LEITE },
          { nome: 'Gato_Efeito_Colisao.png', desc: 'Colisao (Com Efeito)', img: AssetsJogo.GATO.EFEITO.COLISAO },
        ];

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
              <View>
                <Text style={styles.tituloPaisagem}>CREDITOS ACADEMICOS</Text>
                <Text style={styles.subtituloPaisagem}>{Configuracoes.META.INSTITUICAO}</Text>
              </View>

              <TouchableOpacity
                style={[styles.botaoTopoPaisagem, { backgroundColor: dadosTema.corPrimaria }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botaoVoltarTexto}>VOLTAR AO MENU</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.header}>
              <Text style={styles.titulo}>CREDITOS ACADEMICOS</Text>
              <Text style={styles.subtitulo}>{Configuracoes.META.INSTITUICAO}</Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
              <Text style={[styles.labelSecao, { color: dadosTema.corSecundaria }]}>
                DESENVOLVEDOR E AUTOR DO PROJETO
              </Text>
              <Text style={[styles.nomeDev, { color: dadosTema.corTexto }]}>
                {Configuracoes.META.DESENVOLVEDOR}
              </Text>

              <View style={[styles.infoGrid, isPaisagem && styles.infoGridPaisagem]}>
                <View style={[styles.infoItem, isPaisagem && styles.infoItemPaisagem]}>
                  <Text style={[styles.infoTitulo, { color: dadosTema.corTexto }]}>Curso:</Text>
                  <Text style={[styles.infoValor, { color: dadosTema.corTexto }]}>
                    Desenvolvimento de Software Multiplataforma (DSM)
                  </Text>
                </View>

                <View style={[styles.infoItem, isPaisagem && styles.infoItemPaisagem]}>
                  <Text style={[styles.infoTitulo, { color: dadosTema.corTexto }]}>Instituicao:</Text>
                  <Text style={[styles.infoValor, { color: dadosTema.corTexto }]}>
                    FATEC - 2026
                  </Text>
                </View>

                <View style={[styles.infoItem, isPaisagem && styles.infoItemPaisagem]}>
                  <Text style={[styles.infoTitulo, { color: dadosTema.corTexto }]}>Arquitetura:</Text>
                  <Text style={[styles.infoValor, { color: dadosTema.corTexto }]}>
                    {Configuracoes.META.ARQUITETURA}
                  </Text>
                </View>

                <View style={[styles.infoItem, isPaisagem && styles.infoItemPaisagem]}>
                  <Text style={[styles.infoTitulo, { color: dadosTema.corTexto }]}>Plataforma:</Text>
                  <Text style={[styles.infoValor, { color: dadosTema.corTexto }]}>
                    React Native ({Configuracoes.META.SDK})
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: dadosTema.corCard }]}>
              <Text style={[styles.cardTitulo, { color: dadosTema.corTexto }]}>
                Maquina de Estados do Personagem (8 Sprites)
              </Text>

              <View style={styles.abasRow}>
                <TouchableOpacity
                  style={[
                    styles.abaBotao,
                    abaSprites === 'NORMAL' && { backgroundColor: dadosTema.corPrimaria },
                  ]}
                  onPress={() => setAbaSprites('NORMAL')}
                >
                  <Text
                    style={[
                      styles.abaTexto,
                      abaSprites === 'NORMAL' && { color: '#023047' },
                    ]}
                  >
                    Estado Normal (4)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.abaBotao,
                    abaSprites === 'EFEITO' && { backgroundColor: dadosTema.corPrimaria },
                  ]}
                  onPress={() => setAbaSprites('EFEITO')}
                >
                  <Text
                    style={[
                      styles.abaTexto,
                      abaSprites === 'EFEITO' && { color: '#023047' },
                    ]}
                  >
                    Efeito Arco-Iris (4)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.spritesGrid}>
                {listaSprites.map((item) => (
                  <View
                    key={item.nome}
                    style={[styles.spriteBox, isPaisagem && styles.spriteBoxPaisagem]}
                  >
                    <Image source={item.img} style={styles.spriteImg} resizeMode="contain" />
                    <Text style={[styles.spriteDesc, { color: dadosTema.corTexto }]}>
                      {item.desc}
                    </Text>
                    <Text style={styles.spriteArquivo}>{item.nome}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {!isPaisagem && (
            <TouchableOpacity
              style={[styles.botaoVoltar, { backgroundColor: dadosTema.corPrimaria }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.botaoVoltarTexto}>VOLTAR AO MENU PRINCIPAL</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
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
  titulo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD166',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  tituloPaisagem: {
    fontSize: 19,
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
  card: {
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  labelSecao: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nomeDev: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 8,
  },
  infoGrid: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.3)',
    paddingTop: 8,
  },
  infoGridPaisagem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    marginBottom: 5,
  },
  infoItemPaisagem: {
    width: '48%',
  },
  infoTitulo: {
    fontSize: 11.5,
    fontWeight: '800',
    opacity: 0.75,
  },
  infoValor: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  cardTitulo: {
    fontSize: 14.5,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  abasRow: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    padding: 3,
  },
  abaBotao: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  spritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spriteBox: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  spriteBoxPaisagem: {
    width: '23.5%',
  },
  spriteImg: {
    width: 78,
    height: 46,
    marginBottom: 4,
  },
  spriteDesc: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  spriteArquivo: {
    fontSize: 8.5,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  botaoVoltar: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: 6,
  },
  botaoTopoPaisagem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  botaoVoltarTexto: {
    color: '#023047',
    fontWeight: '900',
    fontSize: 12.5,
  },
});
