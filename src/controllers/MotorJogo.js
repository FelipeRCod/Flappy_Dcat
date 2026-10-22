import React from 'react';
import { View, Image, Text, Dimensions } from 'react-native';
import Matter from 'matter-js';
import { Configuracoes, AssetsJogo } from '../models/Configuracoes';
import { criarEntidadeGato } from '../components/Gato';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const calcularDistanciaPorTempo = (segundos, velocidadeX = Configuracoes.FISICA.VELOCIDADE_CANO_X) => {
  const velocidadePxPorSegundo = Math.abs(velocidadeX) * 60;
  return Math.round(velocidadePxPorSegundo * segundos);
};

export const calcularVelocidadeCanoPorPontuacao = (pontuacao = 0) => {
  const base = Math.abs(Configuracoes.FISICA.VELOCIDADE_CANO_X);
  const max = Math.abs(Configuracoes.FISICA.VELOCIDADE_CANO_MAX_X || 3.1);
  const aceleracao = Configuracoes.FISICA.ACELERACAO_POR_PONTO || 0.018;
  const velocidade = Math.min(max, base + pontuacao * aceleracao);
  return -velocidade;
};

export const calcularDistanciaEntreMaosPorPontuacao = (pontuacao = 0) => {
  const tempoInicial = Configuracoes.OBSTACULOS.TEMPO_ENTRE_MAOS_SEGUNDOS || 2.2;
  const tempoMinimo = Configuracoes.OBSTACULOS.TEMPO_ENTRE_MAOS_MINIMO_SEGUNDOS || 1.15;
  const reducaoPorPonto = Configuracoes.OBSTACULOS.REDUCAO_TEMPO_POR_PONTO || 0.022;
  const tempoAtual = Math.max(tempoMinimo, tempoInicial - pontuacao * reducaoPorPonto);
  const distancia = calcularDistanciaPorTempo(tempoAtual, Configuracoes.FISICA.VELOCIDADE_CANO_X);
  return Math.max(150, distancia);
};

export const getPipeSizePosPair = (
  xPosExplicito,
  larguraTela = windowWidth,
  alturaTela = windowHeight,
  permitirCoelho = true,
  distanciaEntreParesExplicita = null
) => {
  const isPaisagem = larguraTela > alturaTela;
  const alturaChao = isPaisagem ? 28 : Configuracoes.TELA.ALTURA_CHAO;
  const areaUtilVertical = Math.max(240, alturaTela - alturaChao);

  const pipeWidth = isPaisagem ? 56 : Configuracoes.OBSTACULOS.LARGURA;
  const pipeHeight = Math.max(Configuracoes.OBSTACULOS.ALTURA, alturaTela);
  const gap = isPaisagem
    ? Math.max(132, Math.min(155, Math.floor(areaUtilVertical * 0.46)))
    : Configuracoes.OBSTACULOS.ABERTURA_VERTICAL;

  const minTopEdge = isPaisagem ? 42 : 78;
  const maxTopEdge = Math.max(
    minTopEdge + 25,
    areaUtilVertical - gap - (isPaisagem ? 42 : 85)
  );
  const alturaVisivelSuperior = getRandom(minTopEdge, maxTopEdge);

  const yCenterTop = alturaVisivelSuperior - pipeHeight / 2;
  const yCenterBottom = alturaVisivelSuperior + gap + pipeHeight / 2;
  const xPos = xPosExplicito !== undefined ? xPosExplicito : larguraTela;

  const pipeTop = {
    pos: { x: xPos, y: yCenterTop },
    size: { height: pipeHeight, width: pipeWidth },
  };

  const pipeBottom = {
    pos: { x: xPos, y: yCenterBottom },
    size: { height: pipeHeight, width: pipeWidth },
  };

  const leiteUrsoPos = {
    x: xPos,
    y: alturaVisivelSuperior + gap / 2,
  };

  const distanciaEntrePares =
    distanciaEntreParesExplicita || calcularDistanciaEntreMaosPorPontuacao(0);

  const margemSeguraCanto = isPaisagem
    ? 52
    : Configuracoes.ITENS.LEITE_COELHO.MARGEM_CANTO_EXTREMO;

  const centroVaoY = alturaVisivelSuperior + gap / 2;
  const colocarNoCantoSuperior = centroVaoY > areaUtilVertical * 0.5;

  const yCantoAlcance = colocarNoCantoSuperior
    ? Math.max(margemSeguraCanto, Math.min(areaUtilVertical * 0.25, alturaVisivelSuperior - 20))
    : Math.min(
        areaUtilVertical - margemSeguraCanto,
        Math.max(areaUtilVertical * 0.75, alturaVisivelSuperior + gap + 20)
      );

  const deveAparecerCoelho =
    permitirCoelho &&
    Math.random() < Configuracoes.ITENS.LEITE_COELHO.CHANCE_APARECER;

  const leiteCoelhoPos = {
    x: xPos + distanciaEntrePares * 0.5,
    y: yCantoAlcance,
    visivel: deveAparecerCoelho,
  };

  return {
    pipeTop,
    pipeBottom,
    leiteUrsoPos,
    leiteCoelhoPos,
  };
};

const ObstacleRenderer = (props) => {
  const larguraVisual = props.size ? props.size.width : Configuracoes.OBSTACULOS.LARGURA;
  const alturaVisual = props.size ? props.size.height : Configuracoes.OBSTACULOS.ALTURA;
  const folgaPonta = props.folgaPonta || 0;

  const xVisual = props.body.position.x - larguraVisual / 2;
  const centroYVisual = props.isTop
    ? props.body.position.y + folgaPonta / 2
    : props.body.position.y - folgaPonta / 2;
  const yVisual = centroYVisual - alturaVisual / 2;

  const imagemMao =
    props.tema === 'NOITE' ? AssetsJogo.OBSTACULOS.NOITE : AssetsJogo.OBSTACULOS.DIA;

  return (
    <Image
      source={imagemMao}
      style={{
        position: 'absolute',
        left: xVisual,
        top: yVisual,
        width: larguraVisual,
        height: alturaVisual,
        resizeMode: 'stretch',
        transform: props.isTop ? [] : [{ scaleY: -1 }],
        zIndex: 10,
      }}
    />
  );
};

export const criarObstaculo = (world, label, tema, pos, size, isTop = false) => {
  const larguraHitbox = Configuracoes.OBSTACULOS.LARGURA_HITBOX || 30;
  const folgaPonta = Configuracoes.OBSTACULOS.FOLGA_PONTA_DEDOS || 16;
  const alturaHitbox = Math.max(40, size.height - folgaPonta);
  const yFisico = isTop ? pos.y - folgaPonta / 2 : pos.y + folgaPonta / 2;

  const initialObstacle = Matter.Bodies.rectangle(
    pos.x,
    yFisico,
    larguraHitbox,
    alturaHitbox,
    { label, isStatic: true }
  );

  Matter.World.add(world, [initialObstacle]);

  return {
    body: initialObstacle,
    tema,
    pos,
    size,
    folgaPonta,
    isTop,
    renderer: <ObstacleRenderer />,
  };
};

const FloorRenderer = (props) => {
  if (props.invisivel) return null;

  const widthBody = props.body.bounds.max.x - props.body.bounds.min.x;
  const heightBody = props.body.bounds.max.y - props.body.bounds.min.y;

  const xBody = props.body.position.x - widthBody / 2;
  const yBody = props.body.position.y - heightBody / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: xBody,
        top: yBody,
        width: widthBody,
        height: heightBody,
        backgroundColor: props.color,
        borderTopWidth: 4,
        borderTopColor: props.borderColor || '#2D6A4F',
        zIndex: 12,
      }}
    />
  );
};

export const criarLimiteTela = (
  world,
  label,
  color,
  borderColor,
  pos,
  size,
  invisivel = false
) => {
  const body = Matter.Bodies.rectangle(pos.x, pos.y, size.width, size.height, {
    label,
    isStatic: true,
  });

  Matter.World.add(world, [body]);

  return {
    body,
    color,
    borderColor,
    pos,
    size,
    invisivel,
    renderer: <FloorRenderer />,
  };
};

const ItemLeiteRenderer = (props) => {
  if (props.coletado) return null;

  const { pos, size, tipo } = props;
  const x = pos.x - size.width / 2;
  const y = pos.y - size.height / 2;

  const isCoelho = tipo === Configuracoes.ITENS.LEITE_COELHO.ID;
  const source = isCoelho
    ? AssetsJogo.ITENS.LEITE_COELHO
    : AssetsJogo.ITENS.LEITE_URSO;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size.width,
        height: size.height,
        zIndex: 15,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      pointerEvents="none"
    >
      <Image
        source={source}
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
      {isCoelho && (
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            backgroundColor: '#E63946',
            borderRadius: 6,
            paddingHorizontal: 4,
            borderWidth: 1,
            borderColor: '#FFF',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>3x</Text>
        </View>
      )}
    </View>
  );
};

export const criarItemLeite = (tipo, pos) => ({
  tipo,
  pos: { x: pos.x, y: pos.y },
  size: {
    width: Configuracoes.ITENS.LARGURA,
    height: Configuracoes.ITENS.ALTURA,
  },
  coletado: pos.visivel === false,
  renderer: <ItemLeiteRenderer />,
});

export const criarEntidadesIniciais = (
  tema = 'DIA',
  larguraTela = windowWidth,
  alturaTela = windowHeight,
  pontuacaoInicial = 0
) => {
  const engine = Matter.Engine.create({
    enableSleeping: false,
  });

  const world = engine.world;
  engine.gravity.y = Configuracoes.FISICA.GRAVIDADE_Y;

  const isPaisagem = larguraTela > alturaTela;
  const gatoPosX = isPaisagem ? 85 : Configuracoes.GATO.POSICAO_X_INICIAL;

  const distanciaPreparoInicial = Math.max(
    240,
    calcularDistanciaPorTempo(Configuracoes.OBSTACULOS.TEMPO_PREPARO_INICIAL_SEGUNDOS)
  );
  const distanciaInicialEntrePares = calcularDistanciaEntreMaosPorPontuacao(pontuacaoInicial);
  const quantidadePares = Configuracoes.OBSTACULOS.QUANTIDADE_PARES || 5;

  const primeiroParX = gatoPosX + distanciaPreparoInicial;

  const dadosTema = Configuracoes.TEMAS[tema] || Configuracoes.TEMAS.DIA;
  const alturaChao = isPaisagem ? 28 : Configuracoes.TELA.ALTURA_CHAO;

  const entidades = {
    physics: {
      engine,
      world,
      tema,
      larguraTela,
      alturaTela,
      quantidadePares,
      pontuacaoAtual: pontuacaoInicial,
      alturaChao,
      colisaoRegistrada: false,
      gameOverDisparado: false,
      efeitoCoelhoAtivo: false,
      tempoRestanteEfeitoMs: 0,
    },

    Bird: criarEntidadeGato(
      world,
      {
        x: gatoPosX,
        y: Math.max(60, (alturaTela - alturaChao) * 0.45),
      },
      {
        width: Configuracoes.GATO.LARGURA_CORPO,
        height: Configuracoes.GATO.ALTURA_CORPO,
      }
    ),
  };

  for (let i = 1; i <= quantidadePares; i++) {
    const xPosPar = primeiroParX + (i - 1) * distanciaInicialEntrePares;
    const permitirCoelho = i > 1;
    const pipeSizePos = getPipeSizePosPair(
      xPosPar,
      larguraTela,
      alturaTela,
      permitirCoelho,
      distanciaInicialEntrePares
    );

    entidades[`ObstacleTop${i}`] = criarObstaculo(
      world,
      `ObstacleTop${i}`,
      tema,
      pipeSizePos.pipeTop.pos,
      pipeSizePos.pipeTop.size,
      true
    );

    entidades[`ObstacleBottom${i}`] = criarObstaculo(
      world,
      `ObstacleBottom${i}`,
      tema,
      pipeSizePos.pipeBottom.pos,
      pipeSizePos.pipeBottom.size,
      false
    );

    entidades[`LeiteUrso${i}`] = criarItemLeite(
      Configuracoes.ITENS.LEITE_URSO.ID,
      pipeSizePos.leiteUrsoPos
    );

    entidades[`LeiteCoelho${i}`] = criarItemLeite(
      Configuracoes.ITENS.LEITE_COELHO.ID,
      pipeSizePos.leiteCoelhoPos
    );
  }

  entidades.Floor = criarLimiteTela(
    world,
    'Floor',
    dadosTema.corChao,
    dadosTema.corBordaChao,
    { x: larguraTela / 2, y: alturaTela - alturaChao / 2 + 10 },
    { height: alturaChao + 20, width: larguraTela * 2 },
    false
  );

  entidades.Ceiling = criarLimiteTela(
    world,
    'Ceiling',
    'transparent',
    'transparent',
    { x: larguraTela / 2, y: -25 },
    { height: 50, width: larguraTela * 2 },
    true
  );

  return entidades;
};

const verificarColetaItem = (birdBody, item) => {
  if (!item || item.coletado) return false;
  const toleranciaColeta = 12;
  const bMinX = birdBody.bounds.min.x - toleranciaColeta;
  const bMaxX = birdBody.bounds.max.x + toleranciaColeta;
  const bMinY = birdBody.bounds.min.y - toleranciaColeta;
  const bMaxY = birdBody.bounds.max.y + toleranciaColeta;

  const iMinX = item.pos.x - item.size.width / 2;
  const iMaxX = item.pos.x + item.size.width / 2;
  const iMinY = item.pos.y - item.size.height / 2;
  const iMaxY = item.pos.y + item.size.height / 2;

  return bMinX < iMaxX && bMaxX > iMinX && bMinY < iMaxY && bMaxY > iMinY;
};

export const Physics = (entities, { touches, time, dispatch }) => {
  const phys = entities.physics;
  const engine = phys.engine;
  const bird = entities.Bird;
  const deltaMs = Math.min(time.delta || 16.67, 33);

  if (!phys.colisaoRegistrada) {
    phys.colisaoRegistrada = true;
    Matter.Events.on(engine, 'collisionStart', () => {
      if (!phys.gameOverDisparado) {
        phys.gameOverDisparado = true;
        bird.estadoSprite = Configuracoes.ESTADOS_GATO.COLISAO;
        dispatch({ type: 'game_over' });
      }
    });
  }

  const toquesPulo = touches.filter((t) => t.type === 'start' || t.type === 'press');
  if (toquesPulo.length > 0 && !phys.gameOverDisparado) {
    const agoraMs = time.current || Date.now();
    const temStart = toquesPulo.some((t) => t.type === 'start');
    if (temStart || !phys.ultimoPuloMs || agoraMs - phys.ultimoPuloMs > 120) {
      phys.ultimoPuloMs = agoraMs;
      Matter.Body.setVelocity(bird.body, {
        x: 0,
        y: Configuracoes.FISICA.VELOCIDADE_PULO_Y,
      });
      dispatch({ type: 'pulo_gato' });
    }
  }

  if (phys.efeitoCoelhoAtivo) {
    const antesSegundos = Math.ceil(phys.tempoRestanteEfeitoMs / 1000);
    phys.tempoRestanteEfeitoMs = Math.max(0, phys.tempoRestanteEfeitoMs - deltaMs);
    const agoraSegundos = Math.ceil(phys.tempoRestanteEfeitoMs / 1000);

    if (phys.tempoRestanteEfeitoMs <= 0) {
      phys.efeitoCoelhoAtivo = false;
      bird.efeitoAtivo = false;
      dispatch({ type: 'efeito_coelho_tick', ativo: false, segundos: 0 });
    } else if (agoraSegundos !== antesSegundos) {
      dispatch({
        type: 'efeito_coelho_tick',
        ativo: true,
        segundos: agoraSegundos,
      });
    }
  }

  const velocidadeBasePorPontos = calcularVelocidadeCanoPorPontuacao(phys.pontuacaoAtual || 0);
  const multiplicadorVelocidade = phys.efeitoCoelhoAtivo
    ? Configuracoes.ITENS.LEITE_COELHO.MULTIPLICADOR_VELOCIDADE
    : 1;
  const deslocamentoX = velocidadeBasePorPontos * multiplicadorVelocidade;
  const quantidadePares = phys.quantidadePares || Configuracoes.OBSTACULOS.QUANTIDADE_PARES || 5;

  for (let index = 1; index <= quantidadePares; index++) {
    const topObs = entities[`ObstacleTop${index}`];
    const bottomObs = entities[`ObstacleBottom${index}`];
    const leiteUrso = entities[`LeiteUrso${index}`];
    const leiteCoelho = entities[`LeiteCoelho${index}`];

    if (!topObs || !bottomObs) continue;

    if (topObs.body.bounds.max.x + 25 <= 0) {
      let maiorX = 0;
      for (let j = 1; j <= quantidadePares; j++) {
        if (j !== index && entities[`ObstacleTop${j}`]) {
          const xOutro = entities[`ObstacleTop${j}`].body.position.x;
          if (xOutro > maiorX) {
            maiorX = xOutro;
          }
        }
      }

      const distanciaAtualEntrePares = calcularDistanciaEntreMaosPorPontuacao(
        phys.pontuacaoAtual || 0
      );
      const novoX = Math.max(
        phys.larguraTela * 0.65,
        maiorX + distanciaAtualEntrePares
      );

      const pipeSizePos = getPipeSizePosPair(
        novoX,
        phys.larguraTela,
        phys.alturaTela,
        true,
        distanciaAtualEntrePares
      );

      const folgaPonta = topObs.folgaPonta || Configuracoes.OBSTACULOS.FOLGA_PONTA_DEDOS || 16;

      Matter.Body.setPosition(topObs.body, {
        x: pipeSizePos.pipeTop.pos.x,
        y: pipeSizePos.pipeTop.pos.y - folgaPonta / 2,
      });
      Matter.Body.setPosition(bottomObs.body, {
        x: pipeSizePos.pipeBottom.pos.x,
        y: pipeSizePos.pipeBottom.pos.y + folgaPonta / 2,
      });

      if (leiteUrso) {
        leiteUrso.pos = { ...pipeSizePos.leiteUrsoPos };
        leiteUrso.coletado = false;
      }
      if (leiteCoelho) {
        leiteCoelho.pos = {
          x: pipeSizePos.leiteCoelhoPos.x,
          y: pipeSizePos.leiteCoelhoPos.y,
        };
        leiteCoelho.coletado = !pipeSizePos.leiteCoelhoPos.visivel;
      }
    }

    Matter.Body.translate(topObs.body, { x: deslocamentoX, y: 0 });
    Matter.Body.translate(bottomObs.body, { x: deslocamentoX, y: 0 });

    if (leiteUrso) {
      leiteUrso.pos.x += deslocamentoX;
      if (verificarColetaItem(bird.body, leiteUrso)) {
        leiteUrso.coletado = true;
        bird.tempoRestanteAnimacaoLeiteMs =
          Configuracoes.ITENS.DURACAO_ANIMACAO_COLETA_MS;
        const pontos = phys.efeitoCoelhoAtivo
          ? Configuracoes.ITENS.LEITE_URSO.PONTOS_BASE *
            Configuracoes.ITENS.LEITE_COELHO.MULTIPLICADOR_PONTOS
          : Configuracoes.ITENS.LEITE_URSO.PONTOS_BASE;
        phys.pontuacaoAtual = (phys.pontuacaoAtual || 0) + pontos;
        dispatch({ type: 'coletou_leite_urso', pontos });
      }
    }

    if (leiteCoelho) {
      leiteCoelho.pos.x += deslocamentoX;
      if (verificarColetaItem(bird.body, leiteCoelho)) {
        leiteCoelho.coletado = true;
        phys.efeitoCoelhoAtivo = true;
        phys.tempoRestanteEfeitoMs =
          Configuracoes.ITENS.LEITE_COELHO.DURACAO_EFEITO_MS;
        bird.efeitoAtivo = true;
        bird.tempoRestanteAnimacaoLeiteMs =
          Configuracoes.ITENS.DURACAO_ANIMACAO_COLETA_MS;
        const pontosCoelho = Configuracoes.ITENS.LEITE_COELHO.MULTIPLICADOR_PONTOS;
        phys.pontuacaoAtual = (phys.pontuacaoAtual || 0) + pontosCoelho;
        dispatch({
          type: 'coletou_leite_coelho',
          pontos: pontosCoelho,
          segundos: 10,
        });
      }
    }
  }

  Matter.Engine.update(engine, deltaMs);

  const alturaMaximaPermitida = phys.alturaTela - phys.alturaChao;
  if (
    !phys.gameOverDisparado &&
    (bird.body.bounds.min.y <= 0 ||
      bird.body.bounds.max.y >= alturaMaximaPermitida)
  ) {
    phys.gameOverDisparado = true;
    bird.estadoSprite = Configuracoes.ESTADOS_GATO.COLISAO;
    dispatch({ type: 'game_over' });
  }

  if (!phys.gameOverDisparado) {
    if (bird.tempoRestanteAnimacaoLeiteMs > 0) {
      bird.tempoRestanteAnimacaoLeiteMs = Math.max(
        0,
        bird.tempoRestanteAnimacaoLeiteMs - deltaMs
      );
      bird.estadoSprite = Configuracoes.ESTADOS_GATO.LEITE;
    } else if (bird.body.velocity.y < -0.2) {
      bird.estadoSprite = Configuracoes.ESTADOS_GATO.ASA_CIMA;
    } else {
      bird.estadoSprite = Configuracoes.ESTADOS_GATO.ASA_BAIXO;
    }
  }

  return entities;
};

export const MotorJogo = {
  criarEntidadesIniciais,
  Physics,
  getPipeSizePosPair,
  getRandom,
};

export default MotorJogo;
