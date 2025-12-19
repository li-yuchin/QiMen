
import React, { useState, useRef, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import HistoryDrawer from './components/HistoryDrawer';
import { YinYangSpinner } from './components/YinYangSpinner';
import { UserInput, LoadingState, HistoryRecord } from './types';
import { analyzeQiMen } from './services/geminiService';
import { historyService } from './services/historyService';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<UserInput | null>(null);
  const [formKey, setFormKey] = useState(0);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(historyService.getRecords());
  }, []);

  const handleAnalysisRequest = async (data: UserInput) => {
    setLoadingState(LoadingState.LOADING);
    setResult('');
    
    try {
      const analysis = await analyzeQiMen(data);
      setResult(analysis);
      setLoadingState(LoadingState.SUCCESS);
      
      // Save to history
      const newRecord = historyService.saveRecord(data, analysis);
      setHistory(prev => [newRecord, ...prev].slice(0, 50));

      // Smooth scroll to results after a short delay for rendering
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
      setResult(error instanceof Error ? error.message : "發生未知錯誤");
    }
  };

  const handleSaveInput = (data: UserInput) => {
    // Save to history with a placeholder result
    const placeholder = data.question ? `[僅儲存輸入資訊]: ${data.question.slice(0, 20)}...` : "[僅儲存輸入資訊]";
    const newRecord = historyService.saveRecord(data, placeholder);
    setHistory(prev => [newRecord, ...prev].slice(0, 50));
    alert("資訊已儲存至歷史錦囊。");
  };

  const handleSelectHistory = (record: HistoryRecord) => {
    // 1. Restore result view
    setResult(record.result);
    setLoadingState(LoadingState.SUCCESS);
    
    // 2. Restore form input
    setCurrentFormData(record.input);
    setFormKey(prev => prev + 1); // Increment key to force InputForm re-mount/reset with initialData
    
    setIsHistoryOpen(false);
    
    // Smooth scroll to results if there is a real analysis, otherwise scroll to top of form
    setTimeout(() => {
      if (record.result.includes("[僅儲存輸入資訊]")) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = historyService.deleteRecord(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    historyService.clearAll();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-mystic-900 text-gray-200 font-sans selection:bg-mystic-gold selection:text-mystic-900 pb-20 print:bg-white print:text-black print:pb-0">
      
      {/* Background Ambience - Hide on Print */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-mystic-gold/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-mystic-red/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Actions */}
        <div className="fixed top-6 right-6 z-30 print:hidden">
           <button 
             onClick={() => setIsHistoryOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-mystic-800/80 backdrop-blur-md border border-mystic-gold/30 rounded-full text-mystic-gold hover:bg-mystic-700 hover:border-mystic-gold transition-all shadow-xl"
           >
             <span className="text-xl">📜</span>
             <span className="hidden sm:inline font-serif font-bold">歷史錦囊</span>
             {history.length > 0 && (
               <span className="bg-mystic-gold text-mystic-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                 {history.length}
               </span>
             )}
           </button>
        </div>

        {/* Header - Hide on Print */}
        <header className="pt-16 pb-12 text-center print:hidden">
          <div className="inline-block mb-4 p-3 rounded-full border border-mystic-gold/30 bg-mystic-800/50 backdrop-blur-sm">
             <span className="text-3xl">☯️</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-mystic-goldLight to-mystic-gold mb-4 drop-shadow-lg">
            命理預測解盤師
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-serif max-w-2xl mx-auto leading-relaxed">
            融合上古時空模型與命理智慧，為您解析局勢。
            <br className="hidden md:block"/>
            運用奇門、八字、紫微之理，助您趨吉避凶。
          </p>
        </header>

        {/* Input Form - Hide on Print */}
        <div className="transition-all duration-500 transform print:hidden">
          <InputForm 
            key={formKey}
            onSubmit={handleAnalysisRequest} 
            onSave={handleSaveInput}
            isLoading={loadingState === LoadingState.LOADING} 
            initialData={currentFormData}
          />
        </div>

        {/* Loading State - Hide on Print */}
        {loadingState === LoadingState.LOADING && (
          <div className="mt-12 text-center print:hidden">
            < YinYangSpinner />
            <p className="text-mystic-gold animate-pulse font-display tracking-widest mt-6">
              正在解盤推演中...
            </p>
          </div>
        )}

        {/* Error State */}
        {loadingState === LoadingState.ERROR && (
          <div className="mt-8 p-6 bg-red-900/20 border border-red-800/50 rounded-lg max-w-2xl mx-auto text-center print:hidden">
             <p className="text-red-400 font-serif">{result}</p>
             <button 
               onClick={() => setLoadingState(LoadingState.IDLE)}
               className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 rounded text-red-200 transition-colors"
             >
               重試
             </button>
          </div>
        )}

        {/* Results - Visible on Print */}
        <div ref={resultRef}>
          {loadingState === LoadingState.SUCCESS && (
            <ResultDisplay content={result} />
          )}
        </div>

      </div>

      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
};

export default App;
