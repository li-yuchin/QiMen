import React from 'react';
import { HistoryRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, records, onSelect, onDelete, onClearAll }) => {
  const handleClearAll = () => {
    if (window.confirm('確定要清空所有歷史錦囊嗎？此操作將無法還原。')) {
      onClearAll();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-mystic-900 border-l border-mystic-gold/20 z-50 shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-mystic-700 flex justify-between items-center">
            <h2 className="text-2xl font-display text-mystic-gold tracking-widest flex items-center gap-3">
              <span className="text-xl">📜</span> 歷次錦囊
            </h2>
            <div className="flex items-center gap-4">
              {records.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1"
                  title="清空所有記錄"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清空
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {records.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-4">
                <div className="text-5xl">🌑</div>
                <p className="font-serif italic">尚無歷史記載</p>
              </div>
            ) : (
              records.map((record) => (
                <div 
                  key={record.id}
                  className="group relative bg-mystic-800/50 border border-mystic-700 rounded-lg p-4 hover:border-mystic-gold/50 transition-all cursor-pointer overflow-hidden"
                >
                  <div onClick={() => onSelect(record)}>
                    <div className="text-xs text-mystic-gold/60 font-serif mb-1">
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                    <div className="text-gray-200 font-serif line-clamp-2 pr-8">
                      {record.input.question || (record.result.includes("[僅儲存輸入資訊]") ? "未具名存檔" : "無問題記錄")}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-mystic-800/30 border-t border-mystic-700 text-center">
            <p className="text-xs text-gray-500 font-serif">
              * 記錄儲存於您的瀏覽器中，清除快取將會導致資料遺失。
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;