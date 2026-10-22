import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Matter from 'matter-js';
import { Configuracoes, AssetsJogo } from '../models/Configuracoes';

export function obterSpriteGato(estadoGato, efeitoAtivo) {
  const conjuntoSprites = efeitoAtivo ? AssetsJogo.GATO.EFEITO : AssetsJogo.GATO.NORMAL;

  switch (estadoGato) {
    case Configuracoes.ESTADOS_GATO.COLISAO:
      return conjuntoSprites.COLISAO;
    case Configuracoes.ESTADOS_GATO.LEITE:
      return conjuntoSprites.LEITE;
    case Configuracoes.ESTADOS_GATO.ASA_CIMA:
      return conjuntoSprites.ASA_CIMA;
    case Configuracoes.ESTADOS_GATO.ASA_BAIXO:
    default:
      return conjuntoSprites.ASA_BAIXO;
  }
}

export default function Gato(props) {
  const {
    body,
    estadoSprite = Configuracoes.ESTADOS_GATO.ASA_BAIXO,
    estado = Configuracoes.ESTADOS_GATO.ASA_BAIXO,
    efeitoAtivo = false,
    escala = 1,
    PosicaoAbsoluta = true,
  } = props;

  const estadoAtual = body ? estadoSprite : estado;
  const sprite = obterSpriteGato(estadoAtual, efeitoAtivo);

  if (body && PosicaoAbsoluta) {
    const cx = body.position.x;
    const cy = body.position.y;

    const larguraVisual = efeitoAtivo
      ? Configuracoes.GATO.LARGURA_SPRITE_EFEITO
      : Configuracoes.GATO.LARGURA_SPRITE_NORMAL;
    const alturaVisual = Configuracoes.GATO.ALTURA_SPRITE;

    const leftVisual = efeitoAtivo
      ? cx - larguraVisual * 0.64
      : cx - larguraVisual / 2;
    const topVisual = cy - alturaVisual / 2;

    return (
      <Image
        source={sprite}
        style={{
          position: 'absolute',
          left: leftVisual,
          top: topVisual,
          width: larguraVisual,
          height: alturaVisual,
          resizeMode: 'contain',
          zIndex: 20,
        }}
      />
    );
  }

  const larguraPreview =
    (efeitoAtivo
      ? Configuracoes.GATO.LARGURA_SPRITE_EFEITO
      : Configuracoes.GATO.LARGURA_SPRITE_NORMAL) * escala;
  const alturaPreview = Configuracoes.GATO.ALTURA_SPRITE * escala;

  return (
    <View
      style={{
        width: larguraPreview,
        height: alturaPreview,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      pointerEvents="none"
    >
      <Image source={sprite} style={styles.imagemGato} resizeMode="contain" />
    </View>
  );
}

export function criarEntidadeGato(world, pos, size) {
  const initialBird = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: 'Bird', inertia: Infinity }
  );

  Matter.World.add(world, [initialBird]);

  return {
    body: initialBird,
    pos,
    size,
    estadoSprite: Configuracoes.ESTADOS_GATO.ASA_BAIXO,
    efeitoAtivo: false,
    tempoRestanteAnimacaoLeiteMs: 0,
    renderer: <Gato />,
  };
}

const styles = StyleSheet.create({
  imagemGato: {
    width: '100%',
    height: '100%',
  },
});
