import React from 'react';
import { PowerUpState, PowerUpType } from '../types';

interface PowerUpProps {
  powerUp: PowerUpState;
}

const POWER_UP_SIZE = 40;

// Power-up visuals and properties
const POWER_UP_CONFIG: Record<PowerUpType, { icon: string; color: string; bgColor: string; label: string }> = {
  shield: {
    icon: '🛡️',
    color: '#60a5fa', // blue
    bgColor: 'rgba(96, 165, 250, 0.2)',
    label: 'SHIELD'
  },
  slowmo: {
    icon: '💨',
    color: '#a78bfa', // purple
    bgColor: 'rgba(167, 139, 250, 0.2)',
    label: 'SLOW-MO'
  },
  doublepoints: {
    icon: '✨',
    color: '#fbbf24', // yellow
    bgColor: 'rgba(251, 191, 36, 0.2)',
    label: '2X POINTS'
  },
  clearpipes: {
    icon: '🪠',
    color: '#34d399', // green
    bgColor: 'rgba(52, 211, 153, 0.2)',
    label: 'CLEAR'
  }
};

const PowerUp: React.FC<PowerUpProps> = ({ powerUp }) => {
  const config = POWER_UP_CONFIG[powerUp.type];

  return (
    <div
      className="absolute flex items-center justify-center animate-pulse"
      style={{
        left: powerUp.x,
        top: powerUp.y,
        width: POWER_UP_SIZE,
        height: POWER_UP_SIZE,
      }}
      aria-label={`Power-up: ${config.label}`}
    >
      {/* Rotating glow background */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background: `conic-gradient(from 0deg, ${config.color}, transparent, ${config.color})`,
          opacity: 0.6,
          animation: 'spin 2s linear infinite'
        }}
      />

      {/* Inner glow */}
      <div
        className="absolute inset-1 rounded-full"
        style={{
          backgroundColor: config.bgColor,
          boxShadow: `0 0 20px ${config.color}, inset 0 0 10px ${config.color}`
        }}
      />

      {/* Icon */}
      <div
        className="relative text-2xl z-10"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))',
          textShadow: `0 0 8px ${config.color}`
        }}
      >
        {config.icon}
      </div>
    </div>
  );
};

export default PowerUp;
export { POWER_UP_SIZE, POWER_UP_CONFIG };
