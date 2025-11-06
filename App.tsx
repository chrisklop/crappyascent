import React from 'react';
import GameContainer from './components/GameContainer';

function App() {
  return (
    <div className="w-full h-full bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <header className="w-full text-center mb-4">
        <h1 className="text-3xl md:text-5xl font-game text-amber-400" style={{ textShadow: '3px 3px #000' }}>
          Crappy Ascent
        </h1>
      </header>
      <main className="flex-grow flex items-center justify-center w-full max-w-full max-h-full">
         <GameContainer />
      </main>
      <footer className="w-full text-center mt-4">
        <p className="text-sm md:text-base text-gray-400 font-game">
          Touch or Spacebar
        </p>
      </footer>
    </div>
  );
}

export default App;