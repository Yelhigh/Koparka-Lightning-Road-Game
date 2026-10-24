import type { CSSProperties } from 'react';
import './SceneExtras.css';

export type SceneExtrasProps = {
  playerX: number;
  henioGreetingVisible: boolean;
  activeBark: { dog: 'black' | 'white'; text: string } | null;
};

function Chihuahua({ coat }: { coat: 'white' | 'black' }) {
  const white = coat === 'white';
  const fur = white ? '#fff8e5' : '#343b3b';
  const shade = white ? '#e9d8b6' : '#222b2d';
  const line = '#25434a';
  const innerEar = white ? '#e9a9a0' : '#a86e62';

  return (
    <svg
      className={`scene-extra__dog-art scene-extra__dog-art--${coat}`}
      viewBox="0 0 120 108"
      role="img"
      aria-label={white ? 'Fluffy white Chihuahua' : 'Dark Chihuahua'}
    >
      <g stroke={line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Big upright ears and a soft, slightly irregular coat silhouette */}
        <path fill={fur} d="M28 43 17 9q-2-7 4-3l25 21M77 28 99 7q5-5 5 2l-2 37" />
        <path fill={innerEar} d="m25 28-4-13 14 14m57 2 12-12-3 19" strokeWidth="1.8" />
        <path
          fill={fur}
          d="M24 42q5-12 18-16 13-7 28-2 21 2 29 20 8 17-1 29-2 12-16 15l-3 9-7-7q-10 4-19 0l-7 8-3-10q-19-4-24-17-7-13 5-29Z"
        />
        <path fill={shade} stroke="none" d="M34 78q24 12 51 0l-4 12q-22 10-42 0Z" opacity=".34" />
        <path fill="#fffaf0" d="M39 49q4-5 10 0t-1 11q-8 5-10-2m27-7q5-5 10 0t-2 11q-8 5-9-2" strokeWidth="2" />
        <ellipse cx="46" cy="54" rx="2.4" ry="3.2" fill={line} stroke="none" />
        <ellipse cx="72" cy="54" rx="2.4" ry="3.2" fill={line} stroke="none" />
        <path fill="#58646a" d="M54 65q5-5 10 0l-5 5Z" strokeWidth="1.7" />
        <path d="M59 70q-3 5-8 2m8-2q4 5 9 1" fill="none" strokeWidth="1.8" />
        <path d="M32 70 25 75m63-6 8 4" fill="none" strokeWidth="1.3" opacity=".75" />
        <path d="M42 89q-2 7 1 11m31-11q3 6 2 10" fill="none" strokeWidth="4" />
        <path d="M31 82q8 7 18 8m28 0q10-2 16-9" fill="none" stroke={white ? '#df8f78' : '#d7a54a'} strokeWidth="4" />
        <circle cx="59" cy="91" r="2.3" fill="#f5d461" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function SceneExtras({
  playerX,
  henioGreetingVisible,
  activeBark,
}: SceneExtrasProps) {
  const safePlayerX = Math.min(1000, Math.max(0, playerX));

  return (
    <div className="scene-extras" style={{ '--player-x': `${(safePlayerX / 1000) * 100}%` } as CSSProperties}>
      <div className="scene-extras__trailer" aria-hidden="true">
        <img src="/koparka-trailer.png" alt="" draggable={false} />
      </div>

      <div className="scene-extras__dog scene-extras__dog--white">
        <Chihuahua coat="white" />
        {activeBark?.dog === 'white' && (
          <div className="scene-extras__bark scene-extras__bark--white" role="status">
            {activeBark.text}
          </div>
        )}
      </div>

      <div className="scene-extras__dog scene-extras__dog--black">
        <Chihuahua coat="black" />
        {activeBark?.dog === 'black' && (
          <div className="scene-extras__bark scene-extras__bark--black" role="status">
            {activeBark.text}
          </div>
        )}
      </div>

      {henioGreetingVisible && (
        <div className="scene-extras__greeting" role="status">
          Hej!! Jestem Henio!
        </div>
      )}
    </div>
  );
}
