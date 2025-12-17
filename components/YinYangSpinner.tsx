import React from 'react';

export const YinYangSpinner: React.FC = () => {
  return (
    <div className="relative w-24 h-24 mx-auto my-12 animate-spin-slow">
       <div className="absolute inset-0 rounded-full border-4 border-mystic-gold/30 border-t-mystic-gold animate-spin"></div>
       <div className="absolute inset-4 rounded-full border-4 border-mystic-red/30 border-b-mystic-red animate-spin-reverse"></div>
       <div className="absolute inset-0 flex items-center justify-center font-serif text-4xl text-white/20 select-none">
         奇
       </div>
    </div>
  );
};