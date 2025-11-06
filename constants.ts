import { ObstacleState } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Player constants
export const PLAYER_WIDTH = 45;
export const PLAYER_HEIGHT = 40;
export const PLAYER_START_POS = { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT / 2 };
export const GRAVITY = 12;
export const THRUST = 21; // Reduced from 30
export const PLAYER_HORIZONTAL_SPEED = 200; // pixels per second
export const PLAYER_LIVES = 3;

// Obstacle constants
export const OBSTACLE_WIDTH = 80;
export const OBSTACLE_GAP = 200;
export const OBSTACLE_BASE_INTERVAL = 300; // Base horizontal distance
export const OBSTACLE_INTERVAL_VARIANCE = 225; // Random variance in distance
export const NUM_OBSTACLES = 4;

// Particle constants
export const MAX_PARTICLES = 250;
export const PARTICLE_COLORS = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DAA520'];

export const INITIAL_OBSTACLES: ObstacleState[] = Array.from({ length: NUM_OBSTACLES }).map((_, i) => ({
    x: GAME_WIDTH + i * (OBSTACLE_WIDTH + OBSTACLE_BASE_INTERVAL + OBSTACLE_INTERVAL_VARIANCE / 2),
    gapY: 150 + Math.random() * (GAME_HEIGHT - 300),
}));

export const BATHROOM_SIGNS: string[] = [
    "This is where all your beer money goes",
    "Sorry about the Hershey Squirts",
    "Please remain seated for the entire performance",
    "If you sprinkle when you tinkle, be a sweetie and wipe the seatie",
    "The throne room - mind your manners",
    "Flush twice, it's a long way to the kitchen",
    "We aim to please. You aim too, please",
    "Employees must wash hands. Everyone else, do what you want",
    "This is my office. Please treat it with respect",
    "Warning: Objects in toilet are larger than they appear",
    "Free reign for your number one and number two",
    "Drop everything and come on in",
    "Now wash your hands, you filthy animal",
    "Think green. Pee in the shower",
    "Please don't do coke in our bathroom. Do Pepsi",
    "No selfies on the throne. We're not Instagram-worthy",
    "Exit only. No re-entry",
    "Wash your hands and say your prayers, because germs and Jesus are everywhere",
    "If you must write on walls, please use proper grammar",
    "Caution: Splash zone ahead",
    "This seemed like a good idea 6 beers ago",
    "Poop like nobody's listening",
    "All the cool kids wash their hands",
    "Welcome to the think tank",
    "No lifeguard on duty. Swim at your own risk"
];
