import React, { useState, useRef } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { YinYangSpinner } from './components/YinYangSpinner';
import { UserInput, LoadingState } from './types';
import { analyzeQiMen } from './services/geminiService';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalysisRequest = async (data: UserInput) => {
    setLoadingState(LoadingState.LOADING);
    setResult('');
    
    try {
      const analysis = await analyzeQiMen(data);
      setResult(analysis);
      setLoadingState(LoadingState.SUCCESS);
      
      // Smooth scroll to results after a short delay for rendering
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
      setResult(error instanceof Error ? error.message : "發生未知錯誤");
    }
  };

  return (
    <div className="min-h-screen bg-mystic-900 text-gray-200 font-sans selection:bg-mystic-gold selection:text-mystic-900 pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-mystic-gold/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-mystic-red/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="pt-16 pb-12 text-center">
          <div className="inline-block mb-4 p-3 rounded-full border border-mystic-gold/30 bg-mystic-800/50 backdrop-blur-sm">
             <span className="text-3xl">☯️</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-mystic-goldLight to-mystic-gold mb-4 drop-shadow-lg">
            奇門遁甲．時空戰略軍師
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-serif max-w-2xl mx-auto leading-relaxed">
            運籌帷幄之中，決勝千里之外。
            <br className="hidden md:block"/>
            運用上古時空模型，為您解析局勢，指引迷津。
          </p>
        </header>

        {/* Input Form */}
        <div className="transition-all duration-500 transform">
          <InputForm 
            onSubmit={handleAnalysisRequest} 
            isLoading={loadingState === LoadingState.LOADING} 
          />
        </div>

        {/* Loading State */}
        {loadingState === LoadingState.LOADING && (
          <div className="mt-12 text-center">
            <YinYangSpinner />
            <p className="text-mystic-gold animate-pulse font-display tracking-widest mt-6">
              正在排盤推演星象...
            </p>
          </div>
        )}

        {/* Error State */}
        {loadingState === LoadingState.ERROR && (
          <div className="mt-8 p-6 bg-red-900/20 border border-red-800/50 rounded-lg max-w-2xl mx-auto text-center">
             <p className="text-red-400 font-serif">{result}</p>
             <button 
               onClick={() => setLoadingState(LoadingState.IDLE)}
               className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 rounded text-red-200 transition-colors"
             >
               重試
             </button>
          </div>
        )}

        {/* Results */}
        <div ref={resultRef}>
          {loadingState === LoadingState.SUCCESS && (
            <ResultDisplay content={result} />
          )}
        </div>

      </div>
    </div>
  );
};

export default App;