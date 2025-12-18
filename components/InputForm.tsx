import React, { useState, useRef, useEffect } from 'react';
import { UserInput } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  onSave?: (data: UserInput) => void;
  isLoading: boolean;
  initialData?: UserInput | null;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, onSave, isLoading, initialData }) => {
  const [question, setQuestion] = useState('');
  const [showTools, setShowTools] = useState(true);
  
  // Divination Chart States
  const [chartText, setChartText] = useState('');
  const [chartImage, setChartImage] = useState('');
  
  // Birth Chart States
  const [birthPillars, setBirthPillars] = useState('');
  const [birthChartText, setBirthChartText] = useState('');
  const [birthChartImage, setBirthChartImage] = useState('');

  const chartFileInputRef = useRef<HTMLInputElement>(null);
  const birthChartFileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data if provided (Recall feature)
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || '');
      setChartText(initialData.chartText || '');
      setChartImage(initialData.chartImage || '');
      setBirthPillars(initialData.birthPillars || '');
      setBirthChartText(initialData.birthChartText || '');
      setBirthChartImage(initialData.birthChartImage || '');
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (setter: (val: string) => void, ref: React.RefObject<HTMLInputElement>) => {
    setter('');
    if (ref.current) ref.current.value = '';
  };

  const getFormData = (): UserInput => ({
    question,
    isNow: true,
    consultationTime: new Date().toISOString(),
    divinationPillars: '',
    birthDate: '',
    birthTime: '',
    birthPillars,
    chartText,
    chartImage,
    birthChartText,
    birthChartImage
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(getFormData());
  };

  const handleSaveDraft = () => {
    if (!question.trim() && !chartText.trim() && !chartImage && !birthChartText.trim() && !birthChartImage) {
      alert("請輸入至少一項資訊再儲存。");
      return;
    }
    if (onSave) onSave(getFormData());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-2xl mx-auto p-6 md:p-8 bg-mystic-800/90 backdrop-blur-md rounded-xl border border-mystic-700 shadow-2xl relative">
      
      {/* Question Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="question" className="block text-mystic-gold font-serif text-xl tracking-wide font-bold">
            所測何事 (The Matter)
          </label>
          <button 
            type="button"
            onClick={() => setShowTools(!showTools)}
            className="text-xs text-mystic-goldLight underline decoration-mystic-gold/30 hover:text-mystic-gold transition-all"
          >
            {showTools ? "關閉工具推薦" : "精準排盤輔助"}
          </button>
        </div>

        {showTools && (
          <div className="p-4 bg-mystic-900/80 border border-mystic-gold/30 rounded-lg animate-fade-in mb-4">
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="text-mystic-gold text-sm font-bold mb-1">💡 提高準確率建議</h4>
                <p className="text-xs text-gray-400">
                  AI 運算可能會有 1-2 節氣誤差。推薦下載手機 <b>「奇門」排盤 App</b> 或至專業網站排盤後，複製<b>「文字結果」</b>或上傳<b>「排盤截圖」</b>貼入下方：
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-mystic-700/50">
                <span className="text-[10px] text-gray-500 font-serif uppercase tracking-wider">下載排盤工具：</span>
                <div className="flex gap-2">
                  <a 
                    href="https://apps.apple.com/cn/search?term=奇門遁甲" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-md text-[10px] text-gray-300 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.5-12.7-151.9zm-63-198.7c15.7-20.1 26.6-47.8 23.2-75.5-23.2 1.2-51.8 16.3-67.6 34.9-14.1 16.1-27.1 44.5-23.3 71.3 26.3 1.8 52.1-11.4 67.7-30.7z"/></svg>
                    App Store
                  </a>
                  <a 
                    href="https://play.google.com/store/search?q=奇門遁甲&c=apps" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-md text-[10px] text-gray-300 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                    Google Play
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <textarea
          id="question"
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：明日面試是否順利？"
          className="w-full bg-mystic-900 border border-mystic-700 rounded-lg p-4 text-gray-200 placeholder-gray-600 focus:border-mystic-gold focus:ring-1 focus:ring-mystic-gold transition-all resize-none text-lg"
        />
      </div>

      {/* Divination Chart */}
      <div className="space-y-4 pt-6 border-t border-mystic-700/50">
        <h3 className="text-mystic-goldLight font-display text-lg tracking-widest border-l-4 border-mystic-gold pl-3">
          時空排盤 (Divination Chart)
        </h3>
        
        <div className="space-y-4">
            <textarea
              rows={4}
              value={chartText}
              onChange={(e) => setChartText(e.target.value)}
              placeholder="【在此貼上專業排盤工具生成的文字】（推薦：包含局數、四柱、九宮星門神儀的資訊）"
              className="w-full bg-mystic-900/60 border border-mystic-gold/20 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 focus:border-mystic-gold focus:outline-none font-mono"
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <input 
                        type="file" ref={chartFileInputRef} accept="image/*" 
                        onChange={(e) => handleImageUpload(e, setChartImage)} className="hidden" 
                    />
                    <button
                        type="button"
                        onClick={() => chartFileInputRef.current?.click()}
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-mystic-700 hover:bg-mystic-600 text-gray-200 rounded border border-gray-600 transition-colors text-sm"
                    >
                        📸 上傳排盤截圖 (更精準)
                    </button>
                </div>
                {chartImage && (
                    <div className="relative group">
                        <img src={chartImage} alt="Chart" className="h-10 w-10 rounded border border-mystic-gold object-cover" />
                        <button type="button" onClick={() => clearImage(setChartImage, chartFileInputRef)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 text-[10px]">✕</button>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-gray-500 italic text-right">* 推演將以「即刻」作為時間基底</p>
        </div>
      </div>

      {/* Birth Chart */}
      <div className="space-y-4 pt-6 border-t border-mystic-700/50">
        <h3 className="text-mystic-goldLight font-display text-lg tracking-widest border-l-4 border-mystic-gold pl-3">
          命主資訊 (Life Chart)
        </h3>
        
        <div className="space-y-4">
          <textarea
              rows={3}
              value={birthChartText}
              onChange={(e) => setBirthChartText(e.target.value)}
              placeholder="在此貼上命主命盤文字 (選填)"
              className="w-full bg-mystic-900/40 border border-mystic-700 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 focus:border-mystic-gold focus:outline-none font-mono"
          />

          <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                  <input 
                      type="file" ref={birthChartFileInputRef} accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setBirthChartImage)} className="hidden" 
                  />
                  <button
                      type="button"
                      onClick={() => birthChartFileInputRef.current?.click()}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-mystic-700 hover:bg-mystic-600 text-gray-200 rounded border border-gray-600 transition-colors text-sm"
                  >
                      📸 上傳終身局截圖 (命宮)
                  </button>
              </div>
              {birthChartImage && (
                  <div className="relative group">
                      <img src={birthChartImage} alt="Birth Chart" className="h-10 w-10 rounded border border-mystic-gold object-cover" />
                      <button type="button" onClick={() => clearImage(setBirthChartImage, birthChartFileInputRef)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 text-[10px]">✕</button>
                  </div>
              )}
          </div>

          <div className="w-full">
              <input
                  type="text"
                  value={birthPillars}
                  onChange={(e) => setBirthPillars(e.target.value)}
                  placeholder="命主八字 (例: 庚午年 戊寅月 丁巳日 辛亥時)"
                  className="w-full bg-mystic-900/50 border border-mystic-700 rounded-lg p-3 text-sm text-gray-200 focus:border-mystic-gold outline-none"
              />
          </div>
        </div>
      </div>

      {/* Submit and Save Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="flex-1 py-4 bg-mystic-800 hover:bg-mystic-700 border border-mystic-gold/50 text-mystic-gold font-display font-bold text-lg rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
        >
          💾 儲存目前資訊
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-[2] py-4 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-mystic-900 font-display font-bold text-xl uppercase tracking-widest rounded-lg shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? "軍師推演中..." : "開始推演 (Analyze)"}
        </button>
      </div>
    </form>
  );
};

export default InputForm;