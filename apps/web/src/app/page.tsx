'use client';

import { useState, useEffect } from 'react';
import { CameraScanner } from '@/components/CameraScanner';
import { TrafficLight } from '@/components/TrafficLight';
import { SourcesSheet } from '@/components/SourcesSheet';
import { ManualEntry } from '@/components/ManualEntry';
import { useScannerStore } from '@/lib/stores/scanner';
import { ScanResult, Decision } from '@recalllens/core';

export default function HomePage() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const { 
    upc, 
    brand, 
    product, 
    lot, 
    expiry, 
    decision, 
    reasons, 
    matches, 
    isScanning,
    setScanResult,
    setDecision,
    reset
  } = useScannerStore();

  const handleScanResult = (result: ScanResult) => {
    setScanResult(result);
    // The matching will be handled by the match worker
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleBackToScanner = () => {
    setShowManualEntry(false);
    reset();
  };

  const handleShowSources = () => {
    setShowSources(true);
  };

  const handleCloseSources = () => {
    setShowSources(false);
  };

  // Show manual entry if no camera access
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setShowManualEntry(true);
    }
  }, []);

  if (showManualEntry) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                RecallLens
              </h1>
              <p className="text-gray-600">
                Scan it. If it's recalled, know in seconds.
              </p>
            </div>
            
            <ManualEntry onResult={handleScanResult} />
            
            <button
              onClick={handleBackToScanner}
              className="w-full mt-4 btn btn-secondary"
            >
              Try Camera Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                RecallLens
              </h1>
              <p className="text-sm text-gray-600">
                Product Recall Scanner
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleManualEntry}
                className="btn btn-secondary text-sm"
              >
                Manual Entry
              </button>
              <button
                onClick={handleShowSources}
                className="btn btn-secondary text-sm"
              >
                Sources
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Scanner Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Scan Product Barcode
            </h2>
            
            <CameraScanner
              onResult={handleScanResult}
              isScanning={isScanning}
            />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Point your camera at the product barcode
              </p>
            </div>
          </div>

          {/* Results Section */}
          {(upc || brand || product) && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Scan Results
              </h2>
              
              <div className="space-y-3">
                {upc && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">UPC:</span>
                    <span className="ml-2 font-mono text-sm">{upc}</span>
                  </div>
                )}
                {brand && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Brand:</span>
                    <span className="ml-2 text-sm">{brand}</span>
                  </div>
                )}
                {product && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Product:</span>
                    <span className="ml-2 text-sm">{product}</span>
                  </div>
                )}
                {lot && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Lot:</span>
                    <span className="ml-2 font-mono text-sm">{lot}</span>
                  </div>
                )}
                {expiry && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Expiry:</span>
                    <span className="ml-2 text-sm">{expiry}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision Section */}
          {decision && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <TrafficLight
                decision={decision}
                reasons={reasons}
                matches={matches}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={reset}
              className="flex-1 btn btn-secondary"
            >
              Scan Another Product
            </button>
            {decision && (
              <button
                onClick={handleShowSources}
                className="flex-1 btn btn-primary"
              >
                View Sources
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Sources Modal */}
      {showSources && (
        <SourcesSheet onClose={handleCloseSources} />
      )}
    </div>
  );
}
