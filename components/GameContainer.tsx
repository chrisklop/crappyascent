import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, ObstacleState, GameStatus, ParticleState, Vector2D, PowerUpState, PowerUpType, ActivePowerUp } from '../types';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_START_POS,
  GRAVITY,
  THRUST,
  PLAYER_HORIZONTAL_SPEED,
  OBSTACLE_WIDTH,
  OBSTACLE_GAP,
  PLAYER_LIVES,
  OBSTACLE_BASE_INTERVAL,
  OBSTACLE_INTERVAL_VARIANCE,
  INITIAL_OBSTACLES,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MAX_PARTICLES,
  PARTICLE_COLORS,
} from '../constants';
import { getDifficultyLevel, getDifficultyMultipliers, getDifficultyDisplayName, getBackgroundDarknessMultiplier } from '../difficultyConfig';
import Player from './Player';
import Obstacle from './Obstacle';
import Background from './Background';
import PowerUp, { POWER_UP_SIZE } from './PowerUp';
import AudioManager from '../utils/audio';

interface GameState {
  player: PlayerState;
  obstacles: ObstacleState[];
}

const GameContainer: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('start');
  const [gameState, setGameState] = useState<GameState>({
    player: {
      position: { ...PLAYER_START_POS },
      velocity: { x: 0, y: 0 },
      lives: PLAYER_LIVES,
      invincibilityEndTime: 0,
    },
    obstacles: INITIAL_OBSTACLES,
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [particles, setParticles] = useState<ParticleState[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [scale, setScale] = useState(1);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUpState[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const isThrustingRef = useRef(false);
  const scoreAccumulatorRef = useRef(0);
  const particleSpawnAccumulatorRef = useRef(0);
  const thrustSoundAccumulatorRef = useRef(0);
  const powerUpSpawnAccumulatorRef = useRef(0);
  const nextPowerUpIdRef = useRef(0);
  const statusRef = useRef(status);
  const finalPlayerPositionRef = useRef<Vector2D>(gameState.player.position);
  const audioManagerRef = useRef<AudioManager | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
  useEffect(() => {
    finalPlayerPositionRef.current = gameState.player.position;
  }, [gameState.player.position]);

  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem('crappyAscentHighScore') || '0', 10);
    setHighScore(savedHighScore);
  }, []);
  
  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current.parentElement!;
      const scaleX = clientWidth / GAME_WIDTH;
      const scaleY = clientHeight / GAME_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetGame = useCallback(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new AudioManager();
    }
    
    setGameState({
      player: {
        position: { ...PLAYER_START_POS },
        velocity: { x: 0, y: 0 },
        lives: PLAYER_LIVES,
        invincibilityEndTime: 0,
      },
      obstacles: INITIAL_OBSTACLES,
    });
    setScore(0);
    setScrollX(0);
    setParticles([]);
    setPowerUps([]);
    setActivePowerUps([]);
    scoreAccumulatorRef.current = 0;
    powerUpSpawnAccumulatorRef.current = 0;
    setStatus('playing');
  }, []);

  const handleInteractionStart = useCallback(() => {
    if (statusRef.current === 'playing') {
      isThrustingRef.current = true;
    } else {
      resetGame();
    }
  }, [resetGame]);

  const handleInteractionEnd = useCallback(() => {
    isThrustingRef.current = false;
  }, []);
  
  const gameLoop = useCallback((time: number) => {
    if (!lastTimeRef.current || statusRef.current !== 'playing') {
      lastTimeRef.current = time;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Apply slow-mo power-up
    const hasSlowMo = activePowerUps.some(p => p.type === 'slowmo');
    if (hasSlowMo) {
      deltaTime *= 0.5; // Slow down game by 50%
    }

    // Check for other active power-ups
    const hasShield = activePowerUps.some(p => p.type === 'shield');
    const hasDoublePoints = activePowerUps.some(p => p.type === 'doublepoints');

    // Calculate difficulty multipliers based on current score
    const currentDifficultyLevel = getDifficultyLevel(score);
    const { speedMultiplier, gapSizeMultiplier, obstacleSpacingMultiplier } = getDifficultyMultipliers(currentDifficultyLevel);

    // Update difficulty level if changed
    if (currentDifficultyLevel !== difficultyLevel) {
      setDifficultyLevel(currentDifficultyLevel);
    }

    // Apply difficulty to game constants
    const currentSpeed = PLAYER_HORIZONTAL_SPEED * speedMultiplier;
    const currentGap = OBSTACLE_GAP * gapSizeMultiplier;

    setGameState(gs => {
        // 1. Update obstacles
        let maxObsX = 0;
        let rightmostObstacle: ObstacleState | null = null;
        gs.obstacles.forEach(o => {
            if (o.x > maxObsX) {
                maxObsX = o.x;
                rightmostObstacle = o;
            }
        });

        const nextObstacles = gs.obstacles.map(o => {
            let newX = o.x - currentSpeed * deltaTime;
            if (newX < -OBSTACLE_WIDTH) {
                const lastGapY = rightmostObstacle ? rightmostObstacle.gapY : GAME_HEIGHT / 2;
                const change = (Math.random() - 0.5) * (GAME_HEIGHT / 3);
                let newGapY = lastGapY + change;

                const minGapY = currentGap / 2 + 50;
                const maxGapY = GAME_HEIGHT - currentGap / 2 - 50;
                newGapY = Math.max(minGapY, Math.min(newGapY, maxGapY));

                const interval = (OBSTACLE_BASE_INTERVAL + Math.random() * OBSTACLE_INTERVAL_VARIANCE) * obstacleSpacingMultiplier;
                newX = maxObsX + OBSTACLE_WIDTH + interval;
                return { ...o, x: newX, gapY: newGapY };
            }
            return { ...o, x: newX };
        });

        // 2. Create a mutable next state for the player
        const nextPlayer = JSON.parse(JSON.stringify(gs.player)) as PlayerState;

        // 3. Apply forces to velocity
        nextPlayer.velocity.y += GRAVITY * deltaTime;
        if (isThrustingRef.current) {
            nextPlayer.velocity.y -= THRUST * deltaTime;
        }

        // 4. Apply velocity to position
        nextPlayer.position.y += nextPlayer.velocity.y * deltaTime * 100;

        // 5. Collision Detection & Resolution
        const isInvincible = time < gs.player.invincibilityEndTime;
        let collisionOccurred = false;

        if (!isInvincible) {
            // Top boundary
            if (nextPlayer.position.y <= 0) {
                nextPlayer.position.y = 0; // Clamp position
                nextPlayer.velocity.y = 5;  // Bounce down
                collisionOccurred = true;
            }
            // Bottom boundary
            else if (nextPlayer.position.y >= GAME_HEIGHT - PLAYER_HEIGHT) {
                nextPlayer.position.y = GAME_HEIGHT - PLAYER_HEIGHT; // Clamp
                nextPlayer.velocity.y = -5; // Bounce up
                collisionOccurred = true;
            }
            // Obstacles
            else {
                const playerRect = { x: nextPlayer.position.x, y: nextPlayer.position.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
                for (const o of nextObstacles) {
                    const topPipeRect = { x: o.x, y: 0, width: OBSTACLE_WIDTH, height: o.gapY - currentGap / 2 };
                    const bottomPipeRect = { x: o.x, y: o.gapY + currentGap / 2, width: OBSTACLE_WIDTH, height: GAME_HEIGHT - (o.gapY + currentGap / 2) };
                    
                    const hitTopPipe = playerRect.x < topPipeRect.x + topPipeRect.width && playerRect.x + playerRect.width > topPipeRect.x && playerRect.y < topPipeRect.y + topPipeRect.height;
                    const hitBottomPipe = playerRect.x < bottomPipeRect.x + bottomPipeRect.width && playerRect.x + playerRect.width > bottomPipeRect.x && playerRect.y + playerRect.height > bottomPipeRect.y;

                    if (hitTopPipe) {
                        nextPlayer.velocity.y = 5; // Bounce DOWN from top pipe
                        collisionOccurred = true;
                        break; 
                    }
                    if (hitBottomPipe) {
                        nextPlayer.velocity.y = -5; // Bounce UP from bottom pipe
                        collisionOccurred = true;
                        break; 
                    }
                }
            }
        }

        // 6. Handle consequences of collision
        if (collisionOccurred) {
            audioManagerRef.current?.playCollisionSound();
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);

            // Shield power-up protects from losing lives
            if (!hasShield) {
              nextPlayer.lives -= 1;
            }
            
            if (nextPlayer.lives > 0) {
                nextPlayer.invincibilityEndTime = time + 2000;
            } else {
                setStatus('gameOver');
                nextPlayer.lives = 0;
            }
        }

        finalPlayerPositionRef.current = nextPlayer.position;
        return { player: nextPlayer, obstacles: nextObstacles };
    });

    setScrollX(s => s + currentSpeed * deltaTime);

    if (isThrustingRef.current) {
      // Particle logic
      particleSpawnAccumulatorRef.current += deltaTime;
      if (particleSpawnAccumulatorRef.current > 0.02) {
        particleSpawnAccumulatorRef.current = 0;
        const particleCount = 10;
        const newParticles: ParticleState[] = Array.from({ length: particleCount }).map(() => ({
          id: Math.random(),
          x: finalPlayerPositionRef.current.x + PLAYER_WIDTH * 0.7,
          y: finalPlayerPositionRef.current.y + PLAYER_HEIGHT * 0.5,
          vx: -currentSpeed - 100 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 120,
          life: 0.8 + Math.random() * 0.6,
          size: Math.random() * 8 + 4,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
        }));
        setParticles(prev => [...prev.slice(-MAX_PARTICLES), ...newParticles]);
      }
      
      // Sound logic
      thrustSoundAccumulatorRef.current += deltaTime;
      if (thrustSoundAccumulatorRef.current > 0.08) {
          thrustSoundAccumulatorRef.current = 0;
          audioManagerRef.current?.playThrustSound();
      }
    }

    setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx * deltaTime,
        y: p.y + p.vy * deltaTime,
        vy: p.vy + GRAVITY * 1.5 * deltaTime,
        life: p.life - deltaTime * 1.2,
    })).filter(p => p.life > 0));

    // Power-up spawning
    powerUpSpawnAccumulatorRef.current += currentSpeed * deltaTime;
    const POWER_UP_SPAWN_DISTANCE = 600; // Spawn every 600 pixels of scroll
    if (powerUpSpawnAccumulatorRef.current > POWER_UP_SPAWN_DISTANCE) {
      powerUpSpawnAccumulatorRef.current = 0;

      // Random power-up type
      const types: PowerUpType[] = ['shield', 'slowmo', 'doublepoints', 'clearpipes'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      const newPowerUp: PowerUpState = {
        id: nextPowerUpIdRef.current++,
        type: randomType,
        x: GAME_WIDTH + 50,
        y: 100 + Math.random() * (GAME_HEIGHT - 200),
        collected: false
      };

      setPowerUps(prev => [...prev, newPowerUp]);
    }

    // Move and clean up power-ups
    setPowerUps(prev => prev
      .map(p => ({ ...p, x: p.x - currentSpeed * deltaTime }))
      .filter(p => p.x > -POWER_UP_SIZE && !p.collected)
    );

    // Power-up collision detection
    const playerRect = {
      x: finalPlayerPositionRef.current.x,
      y: finalPlayerPositionRef.current.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };

    setPowerUps(prev => {
      const now = performance.now();
      return prev.map(powerUp => {
        if (!powerUp.collected) {
          const powerUpRect = {
            x: powerUp.x,
            y: powerUp.y,
            width: POWER_UP_SIZE,
            height: POWER_UP_SIZE
          };

          const isColliding =
            playerRect.x < powerUpRect.x + powerUpRect.width &&
            playerRect.x + playerRect.width > powerUpRect.x &&
            playerRect.y < powerUpRect.y + powerUpRect.height &&
            playerRect.y + playerRect.height > powerUpRect.y;

          if (isColliding) {
            // Activate power-up
            const duration = powerUp.type === 'clearpipes' ? 0 : 5000; // clearpipes is instant

            if (powerUp.type === 'clearpipes') {
              // Clear next 3 obstacles
              setGameState(gs => ({
                ...gs,
                obstacles: gs.obstacles.slice(3)
              }));
            } else {
              setActivePowerUps(active => {
                // Remove existing power-up of same type
                const filtered = active.filter(a => a.type !== powerUp.type);
                return [...filtered, { type: powerUp.type, expiresAt: now + duration }];
              });
            }

            return { ...powerUp, collected: true };
          }
        }
        return powerUp;
      });
    });

    // Remove expired power-ups
    const now = performance.now();
    setActivePowerUps(prev => prev.filter(p => p.expiresAt > now));

    // Apply double points multiplier
    const pointsMultiplier = hasDoublePoints ? 2 : 1;
    scoreAccumulatorRef.current += currentSpeed * deltaTime * pointsMultiplier;
    if(scoreAccumulatorRef.current > 10) {
        setScore(s => s + Math.floor(scoreAccumulatorRef.current / 10));
        scoreAccumulatorRef.current %= 10;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [score, difficultyLevel, activePowerUps]);

  useEffect(() => {
    if (status === 'playing') {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (status === 'gameOver') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      audioManagerRef.current?.playGameOverSound();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('crappyAscentHighScore', score.toString());
      }
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [status, gameLoop, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleInteractionStart(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleInteractionEnd(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleInteractionStart);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchstart', handleInteractionStart, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleInteractionStart);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchstart', handleInteractionStart);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleInteractionStart, handleInteractionEnd]);

  const isInvincible = status === 'playing' && performance.now() < gameState.player.invincibilityEndTime;

  const darknessMultiplier = getBackgroundDarknessMultiplier(difficultyLevel);
  const difficultyDisplayName = getDifficultyDisplayName(difficultyLevel);

  return (
    <div ref={containerRef} style={{ width: GAME_WIDTH, height: GAME_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div
        className={`relative bg-sky-300 overflow-hidden border-8 border-amber-800 rounded-lg shadow-2xl ${isShaking ? 'animate-shake' : ''}`}
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          filter: `brightness(${1 - darknessMultiplier})`
        }}
        >
        <Background scrollX={scrollX} status={status} />
        {particles.map(p => (
            <div key={p.id} className="absolute rounded-full" style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 5px ${p.color}`
            }} />
        ))}
        {status !== 'start' && <Player player={gameState.player} isInvincible={isInvincible} />}
        {status === 'playing' && gameState.obstacles.map((obs, index) => {
            const { gapSizeMultiplier } = getDifficultyMultipliers(difficultyLevel);
            const adjustedGap = OBSTACLE_GAP * gapSizeMultiplier;
            return <Obstacle key={`${obs.x}-${index}`} obstacle={obs} gapSize={adjustedGap} />;
        })}
        {status === 'playing' && powerUps.filter(p => !p.collected).map(powerUp => (
            <PowerUp key={powerUp.id} powerUp={powerUp} />
        ))}
        <div className="absolute top-0 left-0 right-0 p-3 font-game text-white text-lg z-20 flex justify-between items-center" style={{ textShadow: '2px 2px #000' }}>
            <span>SCORE:{score.toString().padStart(6, '0')}</span>
            <span>LIVES: {status === 'playing' ? Array(gameState.player.lives).fill('🚽').join('') : ''}</span>
        </div>
         <div className="absolute bottom-2 right-2 font-game text-yellow-300 text-sm z-20" style={{ textShadow: '2px 2px #000' }}>
            HI:{highScore.toString().padStart(6, '0')}
        </div>
        {status === 'playing' && difficultyLevel > 0 && (
          <div className="absolute bottom-2 left-2 font-game text-orange-400 text-xs z-20" style={{ textShadow: '2px 2px #000' }}>
            {difficultyDisplayName}
          </div>
        )}
        {status === 'playing' && activePowerUps.length > 0 && (
          <div className="absolute top-14 right-2 flex flex-col gap-1 z-20">
            {activePowerUps.map((powerUp, index) => {
              const timeLeft = Math.max(0, powerUp.expiresAt - performance.now());
              const secondsLeft = Math.ceil(timeLeft / 1000);
              const config = { shield: '🛡️', slowmo: '💨', doublepoints: '✨', clearpipes: '🪠' };
              return (
                <div
                  key={`${powerUp.type}-${index}`}
                  className="bg-black bg-opacity-70 px-2 py-1 rounded flex items-center gap-1 font-game text-xs text-white"
                  style={{ textShadow: '1px 1px #000' }}
                >
                  <span className="text-base">{config[powerUp.type]}</span>
                  <span>{secondsLeft}s</span>
                </div>
              );
            })}
          </div>
        )}
        {status === 'start' && <StartScreen />}
        {status === 'gameOver' && <GameOverScreen score={score} highScore={highScore} />}
        </div>
    </div>
  );
};

const StartScreen: React.FC = () => (
  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-10 text-center p-4">
    <h2 className="text-5xl font-game text-red-500 mb-6" style={{textShadow: '3px 3px #000'}}>
      GET READY TO PLUNGE!
    </h2>
    <p className="text-xl text-white font-game animate-pulse">
      TAP OR PRESS SPACE
    </p>
  </div>
);

interface GameOverScreenProps {
  score: number;
  highScore: number;
}
const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore }) => (
  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-10 text-center p-4">
    <h2 className="text-5xl font-game text-red-600 mb-4" style={{textShadow: '3px 3px #000'}}>
      YOU WIPED OUT
    </h2>
    <div className="font-game text-white text-2xl">
      <p className="mb-2">SCORE: <span className="text-yellow-400">{score}</span></p>
      <p>HI-SCORE: <span className="text-green-400">{highScore}</span></p>
    </div>
    <p className="mt-10 text-lg text-gray-300 font-game animate-pulse">
      FLUSH TO TRY AGAIN
    </p>
  </div>
);

export default GameContainer;