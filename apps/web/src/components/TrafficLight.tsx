'use client';

import { useState } from 'react';
import { Decision, RecallRecord } from '@recalllens/core';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TrafficLightProps {
  decision: Decision;
  reasons: string[];
  matches: RecallRecord[];
}

export function TrafficLight({ decision, reasons, matches }: TrafficLightProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDecisionColor = (decision: Decision) => {
    switch (decision) {
      case 'GREEN':
        return 'traffic-light-green';
      case 'YELLOW':
        return 'traffic-light-yellow';
      case 'RED':
        return 'traffic-light-red';
      default:
        return 'bg-gray-400';
    }
  };

  const getDecisionIcon = (decision: Decision) => {
    switch (decision) {
      case 'GREEN':
        return '✅';
      case 'YELLOW':
        return '⚠️';
      case 'RED':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getDecisionTitle = (decision: Decision) => {
    switch (decision) {
      case 'GREEN':
        return 'No Recalls Found';
      case 'YELLOW':
        return 'Potential Recall';
      case 'RED':
        return 'Product Recalled';
      default:
        return 'Unknown Status';
    }
  };

  const getDecisionDescription = (decision: Decision) => {
    switch (decision) {
      case 'GREEN':
        return 'This product appears to be safe and has no known recalls.';
      case 'YELLOW':
        return 'A similar product has been recalled. Please verify this matches your specific product.';
      case 'RED':
        return 'This product has been recalled. Please follow the official recall notice.';
      default:
        return 'Unable to determine recall status.';
    }
  };

  return (
    <div className="text-center">
      {/* Traffic Light */}
      <div className={`traffic-light ${getDecisionColor(decision)} mx-auto mb-6`}>
        <span className="text-4xl">
          {getDecisionIcon(decision)}
        </span>
      </div>

      {/* Decision Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {getDecisionTitle(decision)}
      </h3>

      {/* Decision Description */}
      <p className="text-gray-600 mb-6">
        {getDecisionDescription(decision)}
      </p>

      {/* Expandable Details */}
      {reasons.length > 0 && (
        <div className="border-t pt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span className="mr-2">Why this result?</span>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 text-left">
              <div className="space-y-3">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                    <p className="text-sm text-gray-600">{reason}</p>
                  </div>
                ))}
              </div>

              {/* Recall Details */}
              {matches.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Recall Details ({matches.length})
                  </h4>
                  <div className="space-y-4">
                    {matches.map((match, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {match.brand.join(', ')} - {match.product}
                          </h5>
                          <span className="text-xs text-gray-500 uppercase">
                            {match.source}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {match.hazard}
                        </p>
                        
                        <div className="space-y-2">
                          <h6 className="text-xs font-medium text-gray-500 uppercase">
                            Recommended Actions:
                          </h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.actions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-start">
                                <span className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={match.links.official}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Official Recall Notice →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
