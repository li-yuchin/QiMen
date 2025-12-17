import React, { useState, useRef } from 'react';
import { UserInput } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  
  // Divination Chart States
  const [isNow, setIsNow] = useState(true);
  const [consultationTime, setConsultationTime] = useState(new Date().toISOString().slice(0, 16));
  const [divinationPillars, setDivinationPillars] = useState('');
  const [chartText, setChartText] = useState('');
  const [chartImage, setChartImage] = useState('');
  
  // Birth Chart States
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPillars, setBirthPillars] = useState('');
  const [birthChartText, setBirthChartText] = useState('');
  const [birthChartImage, setBirthChartImage] = useState('');

  const chartFileInputRef = useRef<HTMLInputElement>(null);
  const birthChartFileInputRef = useRef<HTMLInputElement>(null);

  // Helper for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (setter: (val: string) => void, ref: React.RefObject<HTMLInputElement>) => {
    setter('');
    if (ref.current) ref.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    onSubmit({
      question,
      isNow,
      consultationTime,
      divinationPillars,
      birthDate,
      birthTime,
      birthPillars,
      chartText,
      chartImage,
      birthChartText,
      birthChartImage
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-2xl mx-auto p-6 md:p-8 bg-mystic-800/90 backdrop-blur-md rounded-xl border border-mystic-700 shadow-2xl relative overflow-hidden">
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-mystic-gold to-transparent opacity-50"></div>

      {/* Question Section */}
      <div className="space-y-2">
        <label htmlFor="question" className="block text-mystic-gold font-serif text-xl tracking-wide font-bold">
          所測何事 (The Matter)
        </label>
        <textarea
          id="question"
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：遺失的錢包能否找回？明日的商業談判是否順利？"
          className="w-full bg-mystic-900 border border-mystic-700 rounded-lg p-4 text-gray-200 placeholder-gray-600 focus:border-mystic-gold focus:ring-1 focus:ring-mystic-gold transition-all resize-none text-lg"
        />
      </div>

      {/* === Divination Chart Section === */}
      <div className="space-y-4 pt-6 border-t border-mystic-700/50">
        <h3 className="text-mystic-goldLight font-display text-lg tracking-widest border-l-4 border-mystic-gold pl-3">
          時空排盤 (Divination Chart)
        </h3>
        
        {/* Manual Input Toggle */}
        <div className="grid grid-cols-1 gap-4">
           {/* Time Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
            <button
                type="button"
                onClick={() => setIsNow(true)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all font-serif text-sm md:text-base ${
                isNow 
                    ? 'bg-mystic-gold text-mystic-900 border-mystic-gold font-bold' 
                    : 'bg-transparent text-gray-400 border-mystic-700 hover:border-mystic-gold/50'
                }`}
            >
                即刻起局 (Now)
            </button>
            <button
                type="button"
                onClick={() => setIsNow(false)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all font-serif text-sm md:text-base ${
                !isNow 
                    ? 'bg-mystic-gold text-mystic-900 border-mystic-gold font-bold' 
                    : 'bg-transparent text-gray-400 border-mystic-700 hover:border-mystic-gold/50'
                }`}
            >
                指定時間 (Select Time)
            </button>
            </div>

            {/* Date Picker */}
            {!isNow && (
            <input
                type="datetime-local"
                value={consultationTime}
                onChange={(e) => setConsultationTime(e.target.value)}
                className="w-full bg-mystic-900 border border-mystic-700 rounded-lg p-3 text-gray-200 focus:border-mystic-gold focus:outline-none"
            />
            )}

            {/* Manual Pillars Input */}
            <input
                type="text"
                value={divinationPillars}
                onChange={(e) => setDivinationPillars(e.target.value)}
                placeholder="四柱 (選填)：乙巳年 戊子月 庚申日 癸未時"
                className="w-full bg-mystic-900/50 border border-mystic-700 rounded-lg p-3 text-gray-200 focus:border-mystic-gold focus:outline-none placeholder-gray-600 font-serif"
            />
        </div>

        {/* Chart Text/Image */}
        <div className="pt-2">
            <p className="text-sm text-gray-400 font-serif mb-2">
            亦可直接提供問事盤資訊（圖/文）：
            </p>
            <textarea
            rows={3}
            value={chartText}
            onChange={(e) => setChartText(e.target.value)}
            placeholder="【貼上問事盤文字】西曆：2025-12-17..."
            className="w-full bg-mystic-900/60 border border-mystic-700 rounded-lg p-3 text-gray-300 placeholder-gray-600 focus:border-mystic-gold focus:outline-none font-mono text-sm mb-3"
            />

            <div className="flex flex-col items-start gap-3">
            <input 
                type="file" 
                ref={chartFileInputRef}
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, setChartImage)} 
                className="hidden" 
            />
            <button
                type="button"
                onClick={() => chartFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-mystic-700 hover:bg-mystic-600 text-gray-200 rounded border border-gray-600 transition-colors text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                上傳問事盤截圖
            </button>
            
            {chartImage && (
                <div className="relative mt-2 group">
                <img src={chartImage} alt="Divination Chart" className="h-24 w-auto rounded border border-mystic-gold/50 object-cover" />
                <button 
                    type="button" 
                    onClick={() => clearImage(setChartImage, chartFileInputRef)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
            )}
            </div>
        </div>
      </div>

      {/* === Birth Chart Section === */}
      <div className="space-y-4 pt-6 border-t border-mystic-700/50">
        <h3 className="text-mystic-goldLight font-display text-lg tracking-widest border-l-4 border-mystic-gold pl-3">
          命主資訊 (Subject/Life Chart)
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="flex-1 bg-mystic-900 border border-mystic-700 rounded-lg p-3 text-gray-200 focus:border-mystic-gold focus:outline-none"
          />
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="flex-1 bg-mystic-900 border border-mystic-700 rounded-lg p-3 text-gray-200 focus:border-mystic-gold focus:outline-none"
          />
        </div>
         <input
            type="text"
            value={birthPillars}
            onChange={(e) => setBirthPillars(e.target.value)}
            placeholder="命主八字 (選填)：甲子年 丙寅月..."
            className="w-full bg-mystic-900/50 border border-mystic-700 rounded-lg p-3 text-gray-200 focus:border-mystic-gold focus:outline-none placeholder-gray-600 font-serif"
          />
        
        {/* Birth Chart Text/Image */}
        <div className="pt-2">
            <p className="text-sm text-gray-400 font-serif mb-2">
             亦可提供命主命盤（圖/文）：
            </p>
            <textarea
            rows={3}
            value={birthChartText}
            onChange={(e) => setBirthChartText(e.target.value)}
            placeholder="【貼上命盤文字】..."
            className="w-full bg-mystic-900/60 border border-mystic-700 rounded-lg p-3 text-gray-300 placeholder-gray-600 focus:border-mystic-gold focus:outline-none font-mono text-sm mb-3"
            />

            <div className="flex flex-col items-start gap-3">
            <input 
                type="file" 
                ref={birthChartFileInputRef}
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, setBirthChartImage)} 
                className="hidden" 
            />
            <button
                type="button"
                onClick={() => birthChartFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-mystic-700 hover:bg-mystic-600 text-gray-200 rounded border border-gray-600 transition-colors text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                上傳命盤截圖
            </button>
            
            {birthChartImage && (
                <div className="relative mt-2 group">
                <img src={birthChartImage} alt="Birth Chart" className="h-24 w-auto rounded border border-mystic-gold/50 object-cover" />
                <button 
                    type="button" 
                    onClick={() => clearImage(setBirthChartImage, birthChartFileInputRef)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
            )}
            </div>
        </div>

      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 mt-6 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-amber-400 hover:to-amber-700 text-mystic-900 font-display font-bold text-xl uppercase tracking-widest rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-mystic-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            推演天機...
          </span>
        ) : (
          "開始推演 (Analyze)"
        )}
      </button>
    </form>
  );
};

export default InputForm;