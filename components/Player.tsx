import React from 'react';
import { PlayerState } from '../types';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants';

interface PlayerProps {
  player: PlayerState;
  isInvincible: boolean;
}

const Player: React.FC<PlayerProps> = ({ player, isInvincible }) => {
  const rotation = Math.max(-30, Math.min(30, player.velocity.y * 10));

  return (
    <div
      className={`absolute ${isInvincible ? 'opacity-70 animate-pulse' : ''}`}
      style={{
        left: player.position.x,
        top: player.position.y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 100ms linear',
        filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.4))'
      }}
      aria-label="Player character: a toilet"
    >
      <div className="relative w-full h-full">
        {/* Tank */}
        <div className="absolute top-0 left-0 w-[45%] h-[60%] bg-gradient-to-br from-white to-slate-200 border-2 border-slate-400 rounded-t-md shadow-md z-10">
           {/* Flush Handle */}
           <div className="absolute top-1 right-[-4px] w-1.5 h-3 bg-slate-300 border border-slate-500 rounded-sm"></div>
           {/* Tank Lid */}
           <div className="absolute -top-1 left-[-2px] w-[calc(100%+4px)] h-1.5 bg-gradient-to-b from-slate-50 to-slate-200 border-x-2 border-t-2 border-slate-400 rounded-t-sm"></div>
        </div>

        {/* Bowl */}
        <div className="absolute bottom-[10%] right-0 w-[80%] h-[70%] bg-gradient-to-br from-white to-slate-200 border-2 border-slate-400 rounded-tr-3xl rounded-tl-xl rounded-b-xl shadow-inner z-20"></div>
        
        {/* Water inside bowl */}
        <div className="absolute top-[35%] right-[10%] w-[55%] h-[18%] bg-cyan-400 opacity-60 rounded-full border border-cyan-600 z-20"></div>

        {/* Seat */}
        <div className="absolute top-[10%] right-[2%] w-[76%] h-[25%] bg-gradient-to-b from-slate-100 to-white border-2 border-slate-400 rounded-full shadow-lg z-30">
            {/* Seat Hole */}
            <div className="absolute top-1/2 left-1/2 w-3/5 h-3/5 bg-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></div>
        </div>

        {/* Base */}
        <div className="absolute bottom-0 left-[25%] w-[75%] h-[15%] bg-gradient-to-t from-slate-300 to-white border-b-2 border-x-2 border-slate-400 rounded-b-md z-10"></div>
      </div>
    </div>
  );
};

export default Player;
