export type GameStatus = 'ready' | 'playing';

export type GameInput = {
  left: boolean;
  right: boolean;
};

export type LightningBolt = {
  id: number;
  x: number;
  phase: number;
};

export type GameState = {
  status: GameStatus;
  score: number;
  playerX: number;
  bolts: LightningBolt[];
  elapsed: number;
  spawnIn: number;
  nextBoltId: number;
};

export const GAME_WIDTH = 1000;
export const PLAYER_MIN_X = 92;
export const PLAYER_MAX_X = GAME_WIDTH - PLAYER_MIN_X;
export const PLAYER_SPEED = 390;
export const PICKUP_RADIUS = 74;
export const ROAD_Y = 390;

export function createGameState(): GameState {
  return {
    status: 'ready',
    score: 0,
    playerX: GAME_WIDTH / 2,
    bolts: [],
    elapsed: 0,
    spawnIn: 0.4,
    nextBoltId: 0,
  };
}

export function startGame(): GameState {
  return {
    ...createGameState(),
    status: 'playing',
  };
}

function spawnBolt(state: GameState): GameState {
  const margin = 86;
  const x = margin + Math.random() * (GAME_WIDTH - margin * 2);

  return {
    ...state,
    bolts: [
      ...state.bolts,
      {
        id: state.nextBoltId,
        x,
        phase: Math.random() * Math.PI * 2,
      },
    ],
    nextBoltId: state.nextBoltId + 1,
  };
}

export function stepGame(
  state: GameState,
  deltaSeconds: number,
  input: GameInput,
): GameState {
  if (state.status !== 'playing') return state;

  const delta = Math.min(Math.max(deltaSeconds, 0), 0.05);
  const direction = Number(input.right) - Number(input.left);
  const playerX = Math.min(
    PLAYER_MAX_X,
    Math.max(PLAYER_MIN_X, state.playerX + direction * PLAYER_SPEED * delta),
  );

  let next: GameState = {
    ...state,
    playerX,
    elapsed: state.elapsed + delta,
    spawnIn: state.spawnIn - delta,
    bolts: state.bolts.filter(
      (bolt) => Math.abs(bolt.x - playerX) > PICKUP_RADIUS,
    ),
  };

  const collected = state.bolts.length - next.bolts.length;
  if (collected > 0) {
    next = { ...next, score: next.score + collected };
  }

  if (next.spawnIn <= 0 && next.bolts.length < 5) {
    next = spawnBolt(next);
    next.spawnIn = 1.15 + Math.random() * 0.75;
  }

  return next;
}
