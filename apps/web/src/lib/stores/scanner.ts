import { create } from 'zustand';
import { ScanResult, Decision, RecallRecord } from '@recalllens/core';

interface ScannerState {
  // Scan data
  upc?: string;
  brand?: string;
  product?: string;
  lot?: string;
  expiry?: string;
  
  // Results
  decision?: Decision;
  reasons: string[];
  matches: RecallRecord[];
  confidence?: number;
  
  // UI state
  isScanning: boolean;
  isProcessing: boolean;
  error?: string;
  
  // Actions
  setScanResult: (result: ScanResult) => void;
  setDecision: (decision: Decision, reasons: string[], matches: RecallRecord[], confidence?: number) => void;
  setScanning: (scanning: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  // Initial state
  upc: undefined,
  brand: undefined,
  product: undefined,
  lot: undefined,
  expiry: undefined,
  decision: undefined,
  reasons: [],
  matches: [],
  confidence: undefined,
  isScanning: false,
  isProcessing: false,
  error: undefined,
  
  // Actions
  setScanResult: (result: ScanResult) => {
    set({
      upc: result.upc,
      brand: result.brand,
      product: result.product,
      lot: result.lot,
      expiry: result.expiry,
      error: undefined,
    });
  },
  
  setDecision: (decision: Decision, reasons: string[], matches: RecallRecord[], confidence?: number) => {
    set({
      decision,
      reasons,
      matches,
      confidence,
      isProcessing: false,
      error: undefined,
    });
  },
  
  setScanning: (scanning: boolean) => {
    set({ isScanning: scanning });
  },
  
  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },
  
  setError: (error?: string) => {
    set({ error, isProcessing: false });
  },
  
  reset: () => {
    set({
      upc: undefined,
      brand: undefined,
      product: undefined,
      lot: undefined,
      expiry: undefined,
      decision: undefined,
      reasons: [],
      matches: [],
      confidence: undefined,
      isScanning: false,
      isProcessing: false,
      error: undefined,
    });
  },
}));
