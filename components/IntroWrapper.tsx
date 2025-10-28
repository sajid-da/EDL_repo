import React, { useState, useEffect } from 'react';

const scenes = [
  'production',
  'title',
  'credits',
  'loader',
  'finished'
];

export const IntroWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const sceneDurations = [2500, 3500, 7500, 2000]; // Durations for production, title, credits, loader
    if (sceneIndex < sceneDurations.length) {
      const timer = setTimeout(() => {
        setSceneIndex(prev => prev + 1);
      }, sceneDurations[sceneIndex]);
      return () => clearTimeout(timer);
    }
    if(sceneIndex === scenes.length - 1) { // Finished
        const fadeTimer = setTimeout(() => setIsFadingOut(true), 100);
        return () => clearTimeout(fadeTimer);
    }
  }, [sceneIndex]);

  const currentScene = scenes[sceneIndex];

  if (currentScene === 'finished' && isFadingOut) {
    return <div className="animate-fade-out">{children}</div>;
  }
  
  if (currentScene !== 'finished') {
    return (
      <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center text-center transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        {currentScene === 'production' && (
          <div className="animate-fade-in">
            <svg viewBox="0 0 400 50" className="w-96 mx-auto mb-2">
                <line x1="0" y1="25" x2="400" y2="25" stroke="#FFD700" strokeWidth="1" className="animate-draw-line" />
            </svg>
            <p className="text-xl tracking-widest text-gold-glow">A Neural Studio Production</p>
            <svg viewBox="0 0 400 50" className="w-96 mx-auto mt-2">
                <line x1="0" y1="25" x2="400" y2="25" stroke="#FFD700" strokeWidth="1" className="animate-draw-line" />
            </svg>
          </div>
        )}
        {currentScene === 'title' && (
          <div className="animate-fade-in">
             <h1 className="text-5xl md:text-7xl font-black tracking-wider text-gold-glow animate-shimmer">
                ESSENTIALS OF DEEP LEARNING
             </h1>
          </div>
        )}
        {currentScene === 'credits' && (
          <div className="text-4xl font-bold text-gold-glow">
            <p className="animate-fade-in opacity-0 text-2xl mb-6 tracking-widest">
              DONE BY
            </p>
            <div className="space-y-4">
                <p className="animate-fade-in-delay-1">SAJID</p>
                <p className="animate-fade-in-delay-2">ANIRUDH</p>
                <p className="animate-fade-in-delay-3">SANJAY</p>
                <p className="animate-fade-in-delay-4">VASTHAV</p>
                <p className="animate-fade-in-delay-5">SHYAM</p>
            </div>
          </div>
        )}
        {currentScene === 'loader' && (
             <h2 className="text-2xl text-gold-glow animate-pulse">Now Loading Neural Intelligence...</h2>
        )}
      </div>
    );
  }

  return <>{children}</>;
};