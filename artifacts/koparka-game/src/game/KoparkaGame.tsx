import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import {
  createGameState,
  startGame,
  stepGame,
  type GameInput,
  type GameState,
} from './gameEngine';

const INITIAL_GAME = createGameState();

function LightningMark() {
  return (
    <svg viewBox="0 0 100 130" aria-hidden="true">
      <path d="M57 4 12 70h31l-8 55 53-75H55z" />
    </svg>
  );
}

export default function KoparkaGame() {
  const [game, setGame] = useState<GameState>(INITIAL_GAME);
  const gameRef = useRef<GameState>(INITIAL_GAME);
  const inputRef = useRef<GameInput>({ left: false, right: false });

  const updateGame = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const begin = useCallback(() => {
    inputRef.current = { left: false, right: false };
    updateGame(startGame());
  }, [updateGame]);

  useEffect(() => {
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      if (previous === 0) previous = time;
      const delta = (time - previous) / 1000;
      previous = time;
      if (gameRef.current.status === 'playing') {
        updateGame(stepGame(gameRef.current, delta, inputRef.current));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [updateGame]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) event.preventDefault();
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = true;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = false;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = false;
    };
    const clearKeys = () => { inputRef.current = { left: false, right: false }; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, []);

  const holdDirection = (direction: 'left' | 'right', active: boolean) => {
    inputRef.current[direction] = active;
  };

  return (
    <main className="game-shell min-h-[100dvh] px-4 py-5 sm:px-7 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-0.5 text-xs font-extrabold uppercase tracking-[.18em] text-[#487d79] sm:text-sm">A little road adventure</p>
            <h1 className="game-title text-3xl font-bold leading-none text-[#193b4a] sm:text-5xl">Koparka&apos;s lightning run</h1>
          </div>
          <div data-testid="score-lightning" className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-[#193b4a] bg-[#fff8dc] px-3 py-2 shadow-[0_3px_0_#193b4a] sm:px-5 sm:py-3">
            <span className="w-5 text-[#edc52a]"><LightningMark /></span>
            <span className="font-bold text-[#193b4a]">Bolts</span>
            <span className="game-title min-w-7 text-center text-2xl font-bold text-[#ed5548] sm:text-3xl">{game.score}</span>
          </div>
        </header>

        <section aria-label="Koparka lightning game">
          <div className="game-stage" data-testid="game-stage">
            <div className="stage-sky" />
            <div className="sun-doodle" />
            <div className="cloud-doodle" />
            <div className="stage-hill hill-one" />
            <div className="stage-hill hill-two" />
            {game.bolts.map((bolt) => (
              <div
                key={bolt.id}
                className="bolt"
                data-testid={`lightning-bolt-${bolt.id}`}
                style={{ left: `${(bolt.x / 1000) * 100}%`, top: '58%' }}
              >
                <LightningMark />
              </div>
            ))}
            <div
              className="koparka-window"
              data-testid="koparka-character"
              style={{ left: `${(game.playerX / 1000) * 100}%`, top: '39%' }}
            >
              <img src="/koparka-sprite.png" alt="Blue hand-drawn koparka with black wheels and a red digging arm" draggable={false} />
            </div>
            <div className="road" aria-hidden="true">
              <div className="road-grit" />
              <div className="road-line" />
            </div>
            {game.status === 'ready' && (
              <div className="game-overlay">
                <div className="overlay-card">
                  <p className="game-title mb-2 text-2xl font-bold text-[#193b4a] sm:text-3xl">Ready, little builder?</p>
                  <p className="mb-5 text-sm font-bold text-[#527372] sm:text-base">Drive along and dig up the lightning!</p>
                  <button className="play-button" onClick={begin} data-testid="button-start">
                    <Sparkles size={18} strokeWidth={2.8} />
                    Start digging
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-extrabold text-[#477371] sm:block">Steer your koparka</p>
            <div className="flex gap-2" aria-label="Touch movement controls">
              <button
                className="touch-control"
                aria-label="Drive left"
                data-testid="button-drive-left"
                data-pressed={inputRef.current.left}
                onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); holdDirection('left', true); }}
                onPointerUp={() => holdDirection('left', false)}
                onPointerCancel={() => holdDirection('left', false)}
                onLostPointerCapture={() => holdDirection('left', false)}
              ><ArrowLeft size={26} strokeWidth={3} /></button>
              <button
                className="touch-control"
                aria-label="Drive right"
                data-testid="button-drive-right"
                data-pressed={inputRef.current.right}
                onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); holdDirection('right', true); }}
                onPointerUp={() => holdDirection('right', false)}
                onPointerCancel={() => holdDirection('right', false)}
                onLostPointerCapture={() => holdDirection('right', false)}
              ><ArrowRight size={26} strokeWidth={3} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden text-sm font-bold text-[#477371] sm:block">Arrow keys or A / D</p>
            <button
              className="flex items-center gap-2 rounded-full border-2 border-[#193b4a] bg-[#d6f0e7] px-4 py-2.5 text-sm font-extrabold text-[#193b4a] shadow-[0_3px_0_#193b4a] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              onClick={begin}
              data-testid="button-restart"
            >
              <RotateCcw size={16} strokeWidth={2.8} />
              Restart
            </button>
          </div>
        </footer>
        <p className="text-center text-xs font-bold text-[#64877e] sm:hidden">Use arrow keys or A / D to drive</p>
      </div>
    </main>
  );
}
