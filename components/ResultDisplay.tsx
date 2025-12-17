import React from 'react';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  if (!content) return null;

  // Simple formatter to handle bold text and create paragraphs
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Check for headers (simple check for ### or ##)
      if (line.trim().startsWith('#')) {
        const headerText = line.replace(/^#+\s*/, '');
        return (
          <h3 key={index} className="text-mystic-gold font-display text-xl md:text-2xl mt-6 mb-3 font-bold border-b border-mystic-700 pb-2">
            {headerText}
          </h3>
        );
      }
      
      // Handle list items
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-4 pl-2 text-gray-300 my-1 list-disc marker:text-mystic-gold">
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/^[*-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-mystic-goldLight">$1</strong>') 
            }} />
          </li>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Standard paragraph with bold formatting
      return (
        <p key={index} className="text-gray-300 leading-relaxed mb-2 font-serif">
           <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-mystic-goldLight">$1</strong>') 
            }} />
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      <div className="bg-mystic-800 border-t-4 border-mystic-gold rounded-lg shadow-2xl overflow-hidden relative">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-white/10 rounded-br-lg pointer-events-none"></div>

        <div className="p-8 md:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="h-px w-12 bg-mystic-gold/50"></div>
            <h2 className="mx-4 text-2xl font-display text-mystic-gold tracking-widest text-center">
              軍師策論
            </h2>
            <div className="h-px w-12 bg-mystic-gold/50"></div>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none">
            {formatText(content)}
          </div>

          <div className="mt-12 pt-6 border-t border-mystic-700 text-center">
            <p className="text-sm text-gray-500 font-serif italic">
              "天時不如地利，地利不如人和。此策僅供參考，決策仍在人心。"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;