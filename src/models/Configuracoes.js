import { Dimensions } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export const Configuracoes = {
  META: {
    TITULO: 'Flappy Dcat',
    DESENVOLVEDOR: 'Felipe Rocha de Oliveira',
    INSTITUICAO: 'FATEC - DSM - 2026',
    ARQUITETURA: 'MVC (Model-View-Controller)',
    SDK: 'Expo SDK 57',
    ENGINE: 'Matter.js + react-native-game-engine',
  },

  TELA: {
    LARGURA: WINDOW_WIDTH,
    ALTURA: WINDOW_HEIGHT,
    ALTURA_CHAO: 51,
  },

  FISICA: {
    GRAVIDADE_Y: 0.65,
    VELOCIDADE_PULO_Y: -3.2,
    VELOCIDADE_CANO_X: -2.0,
    VELOCIDADE_CANO_MAX_X: -3.1,
    ACELERACAO_POR_PONTO: 0.018,
  },

  GATO: {
    POSICAO_X_INICIAL: 95,
    POSICAO_Y_INICIAL: Math.min(320, WINDOW_HEIGHT * 0.45),
    LARGURA_CORPO: 30,
    ALTURA_CORPO: 26,
    LARGURA_SPRITE_NORMAL: 76,
    LARGURA_SPRITE_EFEITO: 108,
    ALTURA_SPRITE: 54,
    OFFSET_FUMACA_X: 30,
  },

  OBSTACULOS: {
    QUANTIDADE_PARES: 5,
    LARGURA: 65,
    LARGURA_HITBOX: 30,
    FOLGA_PONTA_DEDOS: 16,
    ALTURA: 650,
    ABERTURA_VERTICAL: 180,
    TEMPO_PREPARO_INICIAL_SEGUNDOS: 2.0,
    TEMPO_ENTRE_MAOS_SEGUNDOS: 2.2,
    TEMPO_ENTRE_MAOS_MINIMO_SEGUNDOS: 1.15,
    REDUCAO_TEMPO_POR_PONTO: 0.022,
  },

  ITENS: {
    LARGURA: 38,
    ALTURA: 52,
    DURACAO_ANIMACAO_COLETA_MS: 420,

    LEITE_URSO: {
      ID: 'LEITE_URSO',
      NOME: 'Leite de Urso',
      PONTOS_BASE: 1,
      DESCRICAO: 'Surge sempre no centro do espaco vazio entre as maos (caminho seguro). Vale +1 ponto.',
    },

    LEITE_COELHO: {
      ID: 'LEITE_COELHO',
      NOME: 'Leite de Coelho',
      PONTOS_BASE: 1,
      DURACAO_EFEITO_MS: 10000,
      MULTIPLICADOR_PONTOS: 3,
      MULTIPLICADOR_VELOCIDADE: 1.05,
      CHANCE_APARECER: 0.25,
      MARGEM_CANTO_EXTREMO: 72,
      DESCRICAO: 'Surge nos cantos extremos (alto risco). Por 10s: pontos 3x, velocidade 1.05x e turbo arco-iris.',
    },
  },

  TEMAS: {
    DIA: {
      id: 'DIA',
      nome: 'Tema Dia',
      subtitulo: 'Sol Teletubbies e Algodao-Doce',
      corPrimaria: '#FFB703',
      corSecundaria: '#219EBC',
      corFundoFallback: '#71C5CF',
      corChao: '#52B788',
      corBordaChao: '#2D6A4F',
      corTexto: '#023047',
      corCard: 'rgba(255, 255, 255, 0.92)',
    },
    NOITE: {
      id: 'NOITE',
      nome: 'Tema Noite',
      subtitulo: 'Gotham City e Mulher-Gato',
      corPrimaria: '#F4A261',
      corSecundaria: '#8E9AAF',
      corFundoFallback: '#0D1B2A',
      corChao: '#1B263B',
      corBordaChao: '#415A77',
      corTexto: '#F8F9FA',
      corCard: 'rgba(18, 26, 42, 0.92)',
    },
  },

  ESTADOS_GATO: {
    ASA_CIMA: 'ASA_CIMA',
    ASA_BAIXO: 'ASA_BAIXO',
    LEITE: 'LEITE',
    COLISAO: 'COLISAO',
  },
};

export const AssetsJogo = {
  FUNDOS: {
    DIA: require('../assets/Fundo_Tema_Dia.png'),
    NOITE: require('../assets/Fundo_Tema_Noite.png'),
  },

  OBSTACULOS: {
    DIA: require('../assets/Impacto_Dia.png'),
    NOITE: require('../assets/Impacto_Noite.png'),
  },

  ITENS: {
    LEITE_URSO: require('../assets/Leite_normal.png'),
    LEITE_COELHO: require('../assets/Leite_Efeito.png'),
  },

  GATO: {
    NORMAL: {
      ASA_CIMA: require('../assets/Gato_Normal_Asa_Cima.png'),
      ASA_BAIXO: require('../assets/Gato_Normal_Asa_Baixo.png'),
      LEITE: require('../assets/Gato_Normal_Leite.png'),
      COLISAO: require('../assets/Gato_Normal_Colisao.png'),
    },
    EFEITO: {
      ASA_CIMA: require('../assets/Gato_Efeito_Asa_Cima.png'),
      ASA_BAIXO: require('../assets/Gato_Efeito_Asa_Baixo.png'),
      LEITE: require('../assets/Gato_Efeito_Leite.png'),
      COLISAO: require('../assets/Gato_Efeito_Colisao.png'),
    },
  },

  SONS: {
    COLISAO: require('../assets/Ai.ogg'),
    GULOSO: require('../assets/Guloso.ogg'),
    SEU_SAFADO: require('../assets/Seu_safado.ogg'),
    GANANCIOSO: require('../assets/Ganancioso.ogg'),
    MIADO: require('../assets/Miado.ogg'),
    MUSICA_DIA: require('../assets/Musica_fundo_dia.ogg'),
    MUSICA_NOITE: require('../assets/Musica_fundo_noite.ogg'),
    MUSICA_EFEITO: require('../assets/Musica_efeito.ogg'),
  },
};

const estadoAudioInterno = {
  volumeGeral: 100,
  mudoGeral: false,
  volumeMusica: 85,
  mudoMusica: false,
  volumeEfeitos: 100,
  mudoEfeitos: false,
};

const ouvintesAudio = new Set();

export const obterConfigAudio = () => ({ ...estadoAudioInterno });

export const atualizarConfigAudio = (parcial) => {
  Object.assign(estadoAudioInterno, parcial);
  const copia = obterConfigAudio();
  ouvintesAudio.forEach((fn) => {
    try {
      fn(copia);
    } catch (e) {}
  });
  return copia;
};

export const inscreverConfigAudio = (fn) => {
  ouvintesAudio.add(fn);
  return () => {
    ouvintesAudio.delete(fn);
  };
};

export const calcularMultiplicadorMusica = (cfg = estadoAudioInterno) => {
  if (cfg.mudoGeral || cfg.mudoMusica) return 0;
  return Math.max(0, Math.min(1, (cfg.volumeGeral / 100) * (cfg.volumeMusica / 100)));
};

export const calcularMultiplicadorEfeitos = (cfg = estadoAudioInterno) => {
  if (cfg.mudoGeral || cfg.mudoEfeitos) return 0;
  return Math.max(0, Math.min(1, (cfg.volumeGeral / 100) * (cfg.volumeEfeitos / 100)));
};

export default Configuracoes;
