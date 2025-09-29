'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SourcesSheetProps {
  onClose: () => void;
}

interface DataSource {
  name: string;
  fullName: string;
  description: string;
  lastUpdated?: string;
  totalRecalls?: number;
  url: string;
  color: string;
}

export function SourcesSheet({ onClose }: SourcesSheetProps) {
  const [sources, setSources] = useState<DataSource[]>([
    {
      name: 'FDA',
      fullName: 'Food and Drug Administration',
      description: 'Food, drug, cosmetic, and medical device recalls',
      url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
      color: 'bg-blue-500',
    },
    {
      name: 'FSIS',
      fullName: 'Food Safety and Inspection Service',
      description: 'Meat, poultry, and egg product recalls',
      url: 'https://www.fsis.usda.gov/recalls',
      color: 'bg-green-500',
    },
    {
      name: 'CPSC',
      fullName: 'Consumer Product Safety Commission',
      description: 'Consumer product recalls and safety alerts',
      url: 'https://www.cpsc.gov/Recalls',
      color: 'bg-red-500',
    },
  ]);

  const [dataInfo, setDataInfo] = useState<{
    lastUpdated: string;
    totalRecalls: number;
    sources: Record<string, { count: number; lastUpdated: string }>;
  } | null>(null);

  useEffect(() => {
    // Load data information
    const loadDataInfo = async () => {
      try {
        const response = await fetch('/data/latest.json');
        if (response.ok) {
          const data = await response.json();
          setDataInfo({
            lastUpdated: data.date || 'Unknown',
            totalRecalls: data.total || 0,
            sources: data.sources || {},
          });
        }
      } catch (error) {
        console.error('Error loading data info:', error);
      }
    };

    loadDataInfo();
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Data Sources
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Data Overview */}
          {dataInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Data Overview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">{dataInfo.lastUpdated}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Recalls:</span>
                  <span className="ml-2 font-medium">{dataInfo.totalRecalls.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Official Sources
            </h3>
            
            {sources.map((source) => (
              <div key={source.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${source.color} mr-3`} />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {source.fullName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {source.name}
                      </p>
                    </div>
                  </div>
                  
                  {dataInfo?.sources[source.name.toLowerCase()] && (
                    <div className="text-right text-sm text-gray-500">
                      <div>{dataInfo.sources[source.name.toLowerCase()].count.toLocaleString()} recalls</div>
                      <div>Updated {dataInfo.sources[source.name.toLowerCase()].lastUpdated}</div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {source.description}
                </p>
                
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Official Site →
                </a>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">
              Important Disclaimer
            </h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                This tool provides informational recall data for convenience only. 
                Always refer to official recall notices for the most current and accurate information.
              </p>
              <p>
                When in doubt, contact the manufacturer or retailer directly, or visit 
                the official government recall websites.
              </p>
            </div>
          </div>

          {/* Data Freshness */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Data Freshness
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• FDA data is updated weekly from openFDA API</p>
              <p>• FSIS data is updated daily from FSIS API</p>
              <p>• CPSC data is updated daily from CPSC API</p>
              <p>• All data is cached locally for offline access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
