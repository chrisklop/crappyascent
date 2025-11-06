# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Crappy Ascent: The Great Deuce Escape** is a humorous endless runner game built with React 19, TypeScript, and Vite. The player controls a flying toilet ascending through a bathroom sewer, avoiding obstacles while collecting points.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Game Loop Pattern

The core game logic uses a **single-tick game loop** via `requestAnimationFrame` in `components/GameContainer.tsx`. The loop handles:

1. **Physics updates**: Gravity, thrust, velocity calculation using delta time
2. **Collision detection**: AABB collision with obstacles and boundaries
3. **State updates**: Obstacles, particles, score, scrolling
4. **Life system**: 3 lives with temporary invincibility after collision

**Critical Implementation Detail**: The game loop uses refs (`statusRef`, `isThrustingRef`, `finalPlayerPositionRef`) to access the latest state without recreating the loop callback. This prevents stale closures and ensures smooth gameplay.

### State Management

All game state is managed through React hooks in `GameContainer.tsx`:
- `gameState`: Player position, velocity, lives, invincibility
- `obstacles`: Array of obstacle positions and gap heights
- `particles`: Particle system for thrust visual effects
- `score` and `highScore`: Scoring with localStorage persistence
- `scrollX`: Horizontal scrolling for parallax background

### Component Structure

```
App.tsx (root)
└── GameContainer.tsx (game loop, state, input handling)
    ├── Background.tsx (parallax scrolling, procedural signs)
    ├── Player.tsx (toilet sprite with CSS, rotation based on velocity)
    ├── Obstacle.tsx (pipes with gaps)
    └── StartScreen/GameOverScreen (UI overlays)
```

### Physics System

Physics calculations in the game loop:
- **Gravity**: Applied continuously to velocity (12 units/s²)
- **Thrust**: Applied when spacebar/touch held (-21 units/s²)
- **Collision response**: Bounces player away from obstacles with velocity reversal
- **Delta time scaling**: All physics scaled by `deltaTime` for frame-rate independence

### Audio System

`utils/audio.ts` provides procedural audio using Web Audio API:
- **No external audio files** - all sounds generated in-browser
- `playThrustSound()`: Sawtooth oscillator with lowpass filter for "splat" effect
- `playCollisionSound()`: Filtered noise buffer for impact
- `playGameOverSound()`: 3-second toilet flush simulation with frequency sweeps
- **Lazy initialization**: AudioContext created only when first sound plays

### Procedural Content

- **Obstacles**: Gaps positioned procedurally with randomized vertical position and spacing (300-525px intervals)
- **Background signs**: Pool of 25 humorous bathroom signs, randomly placed and cycled as player progresses
- **Wall patterns**: 5 CSS background patterns randomly selected per game session
- **Particles**: Brown particle system with physics simulation for thrust effect

## Key Constants

All tunable game parameters are centralized in `constants.ts`:
- Game dimensions: 800x600 (scaled responsively)
- Physics values: gravity, thrust, player speed
- Obstacle spacing and gap size
- Particle system limits and colors

## Technical Notes

### Responsive Scaling

The game canvas is fixed at 800x600 but scales using CSS transforms based on viewport size. Scale calculation in `GameContainer.tsx:73-85`.

### Input Handling

Multi-input support via event listeners on window:
- Keyboard: Spacebar for thrust
- Mouse: Any button for thrust
- Touch: Touch events (passive: false to prevent scroll)

Game starts on first input, subsequent inputs control thrust.

### Collision Detection

AABB (Axis-Aligned Bounding Box) collision implemented in game loop:
- Player hitbox: 45x40px
- Obstacles: 80px wide with 200px gaps
- Boundaries: Top (y=0) and bottom (y=560) trigger collisions

### TypeScript Patterns

- All game entities have typed interfaces in `types.ts`
- `GameStatus` union type: `'start' | 'playing' | 'gameOver'`
- Path alias `@/*` maps to project root for imports

## Environment Variables

The Vite config references `GEMINI_API_KEY` from `.env.local`, but this API key is not currently used in the game code. It appears to be legacy from an AI Studio template.
