export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2D;
  velocity: Vector2D;
  lives: number;
  invincibilityEndTime: number;
}

export interface ObstacleState {
  x: number;
  gapY: number; // Center of the gap
}

export interface ParticleState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export type GameStatus = 'start' | 'playing' | 'gameOver';