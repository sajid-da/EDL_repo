import React, { useState, useEffect } from 'react';
import { BrainCircuitIcon } from './icons';

const wittyMessages = [
  "Calibrating neurons...",
  "Persuading pixels to behave...",
  "Counting similarities in quantum sarcasm...",
  "Teaching the AI about art appreciation...",
  "Reticulating splines with extreme prejudice...",
  "Waking up the digital ghost...",
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(wittyMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = wittyMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % wittyMessages.length;
        return wittyMessages[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center my-12 animate-fade-in">
      <BrainCircuitIcon className="w-16 h-16 text-amber-400 animate-pulse" />
      <h3 className="mt-4 text-2xl font-semibold text-gray-300 transition-all duration-300">
        {message}
      </h3>
    </div>
  );
};