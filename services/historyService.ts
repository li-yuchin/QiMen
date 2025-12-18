import { HistoryRecord, UserInput } from '../types';

const STORAGE_KEY = 'qimen_history_records';

export const historyService = {
  getRecords: (): HistoryRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  saveRecord: (input: UserInput, result: string): HistoryRecord => {
    const records = historyService.getRecords();
    const newRecord: HistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input,
      result
    };
    
    // Unshift to keep most recent at top
    const updatedRecords = [newRecord, ...records].slice(0, 50); // Keep last 50
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (e) {
      // LocalStorage might be full due to images
      console.warn("LocalStorage full, trying to save without images");
      const strippedRecord = { ...newRecord, input: { ...input, chartImage: '', birthChartImage: '' } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([strippedRecord, ...records.slice(0, 49)]));
    }
    
    return newRecord;
  },

  deleteRecord: (id: string): HistoryRecord[] => {
    const records = historyService.getRecords();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};