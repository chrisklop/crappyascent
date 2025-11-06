/**
 * Difficulty Configuration
 * Controls how the game gets progressively harder as the player's score increases
 */

export interface DifficultyLevel {
  level: number;
  scoreThreshold: number;
  speedMultiplier: number;
  gapSizeMultiplier: number;
  obstacleSpacingMultiplier: number;
  displayName: string;
}

// Difficulty increases every 100 points
export const SCORE_PER_DIFFICULTY_LEVEL = 100;

// Maximum difficulty level (caps at score 1000)
export const MAX_DIFFICULTY_LEVEL = 10;

/**
 * Calculate the current difficulty level based on score
 */
export function getDifficultyLevel(score: number): number {
  return Math.min(
    Math.floor(score / SCORE_PER_DIFFICULTY_LEVEL),
    MAX_DIFFICULTY_LEVEL
  );
}

/**
 * Get difficulty multipliers for the current level
 */
export function getDifficultyMultipliers(level: number) {
  // Clamp level to max
  const clampedLevel = Math.min(level, MAX_DIFFICULTY_LEVEL);

  // Speed increases smoothly: 1.0 → 1.8 at max level
  const speedMultiplier = 1.0 + (clampedLevel * 0.08);

  // Gap decreases: 1.0 → 0.65 at max level (35% smaller gaps)
  const gapSizeMultiplier = Math.max(0.65, 1.0 - (clampedLevel * 0.035));

  // Obstacle spacing decreases: 1.0 → 0.7 at max level (tighter obstacles)
  const obstacleSpacingMultiplier = Math.max(0.7, 1.0 - (clampedLevel * 0.03));

  return {
    speedMultiplier,
    gapSizeMultiplier,
    obstacleSpacingMultiplier,
  };
}

/**
 * Get display name for current depth/difficulty level
 */
export function getDifficultyDisplayName(level: number): string {
  if (level === 0) return "Bathroom Surface";
  if (level <= 2) return `Drain Pipe -${level}`;
  if (level <= 5) return `Sewer Level -${level}`;
  if (level <= 8) return `Deep Sewer -${level}`;
  return `The Depths -${level}`;
}

/**
 * Get background darkness multiplier (darker as you go deeper)
 */
export function getBackgroundDarknessMultiplier(level: number): number {
  // 0.0 = normal brightness, 0.3 = 30% darker at max level
  return Math.min(0.3, level * 0.03);
}
