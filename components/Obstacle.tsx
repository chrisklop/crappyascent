import React from 'react';
import { ObstacleState } from '../types';
import { OBSTACLE_GAP, OBSTACLE_WIDTH, GAME_HEIGHT } from '../constants';

interface ObstacleProps {
  obstacle: ObstacleState;
}

const Pipe: React.FC<{ height: number, position: 'top' | 'bottom' }> = ({ height, position }) => {
  const pipeEndHeight = 30;
  
  return (
    <div
      className="absolute bg-emerald-700"
      style={{
        width: OBSTACLE_WIDTH,
        height: height,
        top: position === 'top' ? 0 : undefined,
        bottom: position === 'bottom' ? 0 : undefined,
      }}
    >
      {/* Pipe Body */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-600 shadow-inner"
      />

      {/* Pipe End */}
      <div 
        className={`absolute w-[110%] left-[-5%] bg-gradient-to-b from-emerald-600 to-emerald-800 border-y-4 border-emerald-900 rounded-md shadow-lg`}
        style={{
            height: pipeEndHeight,
            top: position === 'bottom' ? -2 : undefined,
            bottom: position === 'top' ? -2 : undefined,
        }}
      >
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 rounded-md shadow-[inset_0_4px_6px_rgba(0,0,0,0.4)]"></div>
      </div>
    </div>
  );
};


const Obstacle: React.FC<ObstacleProps> = ({ obstacle }) => {
  const topPipeHeight = obstacle.gapY - OBSTACLE_GAP / 2;
  const bottomPipeY = obstacle.gapY + OBSTACLE_GAP / 2;
  const bottomPipeHeight = GAME_HEIGHT - bottomPipeY;

  return (
    <div className="absolute" style={{ left: obstacle.x, top: 0, width: OBSTACLE_WIDTH, height: GAME_HEIGHT }}>
      <Pipe height={topPipeHeight} position="top" />
      <Pipe height={bottomPipeHeight} position="bottom" />
    </div>
  );
};

export default Obstacle;