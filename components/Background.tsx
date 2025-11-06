import React, { useState, useEffect, useMemo } from 'react';
import { BATHROOM_SIGNS, GAME_WIDTH } from '../constants';
import { GameStatus } from '../types';

interface BackgroundProps {
    scrollX: number;
    status: GameStatus;
}

interface Sign {
    id: number;
    text: string;
    worldX: number;
    y: number;
}

const WALL_STYLES = [
    'bg-stone-200 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:16px_16px]',
    'bg-slate-200 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%),linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%)] [background-size:40px_40px] [background-position:0_0,20px_20px]',
    'bg-emerald-200 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:50px_25px]',
    'bg-rose-200 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:25px_50px]',
    'bg-indigo-200 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0,rgba(255,255,255,0.2)_1px,transparent_1px,transparent_100%)] [background-size:20px_20px]'
];

const Background: React.FC<BackgroundProps> = ({ scrollX, status }) => {
    const parallaxX = -(scrollX * 0.5) % GAME_WIDTH;
    const isGameOver = status === 'gameOver';
    
    const initialSigns = useMemo((): Sign[] => {
      return Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        text: BATHROOM_SIGNS[Math.floor(Math.random() * BATHROOM_SIGNS.length)],
        worldX: GAME_WIDTH + i * 6400 + Math.random() * 3200, // Increased spacing by 4x
        y: 50 + Math.random() * 450,
      }));
    }, []);
    
    const [signs, setSigns] = useState<Sign[]>(initialSigns);
    const [wallStyle, setWallStyle] = useState(() => WALL_STYLES[Math.floor(Math.random() * WALL_STYLES.length)]);

    useEffect(() => {
        if (isGameOver) return;

        const handle = requestAnimationFrame(() => {
            setSigns(currentSigns => {
                let signsChanged = false;
                const newSigns = currentSigns.map(sign => {
                    const screenX = sign.worldX - scrollX;
                    if (screenX < -200) { // Off-screen to the left
                        signsChanged = true;
                        return {
                            ...sign,
                            worldX: scrollX + GAME_WIDTH + 3200 + Math.random() * 6400, // Increased respawn distance by 4x
                            y: 50 + Math.random() * 450,
                            text: BATHROOM_SIGNS[Math.floor(Math.random() * BATHROOM_SIGNS.length)],
                        };
                    }
                    return sign;
                });
                return signsChanged ? newSigns : currentSigns;
            });
        });
        
        return () => cancelAnimationFrame(handle);
    }, [scrollX, isGameOver]);
    
    useEffect(() => {
      // Reset signs and change wall when game restarts
      if (status === 'playing') {
          setSigns(initialSigns);
          setWallStyle(WALL_STYLES[Math.floor(Math.random() * WALL_STYLES.length)]);
      }
    }, [status, initialSigns]);


    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Parallax Background Layer */}
            <div 
                className={`absolute top-0 left-0 h-full ${wallStyle}`}
                style={{ 
                    width: `${GAME_WIDTH * 2}px`,
                    transform: `translateX(${parallaxX}px)`
                }}
            />
        
            {/* Humorous Signs */}
            {signs.map((sign) => (
                <div key={sign.id} 
                     className="absolute p-2 w-48 bg-yellow-600 border-4 border-yellow-800 rounded-md shadow-lg text-white text-xs text-center leading-tight font-game"
                     style={{
                         left: sign.worldX - scrollX,
                         top: sign.y,
                         transform: 'translateY(-50%)',
                         textShadow: '1px 1px #54310A'
                     }}
                >
                    {sign.text}
                </div>
            ))}
        </div>
    );
};

export default Background;