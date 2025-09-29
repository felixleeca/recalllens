import { RecallRecord, RecallSource } from '@recalllens/core';
import { format, parseISO } from 'date-fns';

/**
 * Normalize FDA recall data to our unified schema
 */

export interface FDARecallData {
  recall_number: string;
  product_description: string;
  code_info: string;
  recalling_firm: string;
  recall_initiation_date: string;
  recall_status: string;
  product_quantity: string;
  distribution_pattern: string;
  classification: string;
  reason_for_recall: string;
  voluntary_mandated: string;
  initial_firm_notification: string;
  event_id: string;
  product_type: string;
  country: string;
  city: string;
  state: string;
  more_code_info: string;
  product_share: string;
  report_date: string;
}

/**
 * Extract UPC codes from FDA text fields
 */
function extractUPCs(text: string): string[] {
  const upcPattern = /\b\d{8,13}\b/g;
  const matches = text.match(upcPattern) || [];
  
  // Filter out obvious non-UPC numbers (too short, too long, or invalid patterns)
  return matches.filter(match => {
    const length = match.length;
    return (length === 8 || length === 12 || length === 13) && 
           /^\d+$/.test(match);
  });
}

/**
 * Extract lot codes from FDA text fields
 */
function extractLotCodes(text: string): string[] {
  const lotPatterns = [
    /lot[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /batch[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /serial[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /model[:\s]*([A-Z0-9]+)/gi,
  ];
  
  const lots: string[] = [];
  
  for (const pattern of lotPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      lots.push(...matches.map(match => match.replace(/^(lot|batch|serial|model)[:\s]*/i, '')));
    }
  }
  
  return lots;
}

/**
 * Normalize brand name
 */
function normalizeBrand(brand: string): string[] {
  // Split on common separators and clean up
  const brands = brand
    .split(/[,;&|]/)
    .map(b => b.trim())
    .filter(b => b.length > 0)
    .map(b => b.toLowerCase());
  
  // Remove duplicates
  return [...new Set(brands)];
}

/**
 * Normalize product name
 */
function normalizeProduct(product: string): string {
  return product
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Convert FDA date to ISO format
 */
function normalizeDate(dateStr: string): string {
  try {
    // Try parsing as ISO date first
    const date = parseISO(dateStr);
    if (!isNaN(date.getTime())) {
      return format(date, 'yyyy-MM-dd');
    }
    
    // Try common date formats
    const formats = [
      'MM/dd/yyyy',
      'MM-dd-yyyy',
      'yyyy-MM-dd',
      'MM/dd/yy',
      'MM-dd-yy',
    ];
    
    for (const fmt of formats) {
      try {
        const parsed = parseISO(dateStr);
        if (!isNaN(parsed.getTime())) {
          return format(parsed, 'yyyy-MM-dd');
        }
      } catch {
        // Continue to next format
      }
    }
    
    // Fallback to original string
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Convert FDA recall data to our unified schema
 */
export function normalizeFDARecall(data: FDARecallData): RecallRecord {
  const upcs = [
    ...extractUPCs(data.code_info || ''),
    ...extractUPCs(data.more_code_info || ''),
  ];
  
  const lotCodes = [
    ...extractLotCodes(data.code_info || ''),
    ...extractLotCodes(data.more_code_info || ''),
  ];
  
  // Convert lot codes to regex patterns
  const lotRegex = lotCodes.length > 0 ? 
    lotCodes.map(lot => `^${lot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : 
    undefined;
  
  return {
    id: data.recall_number || data.event_id,
    source: 'fda' as RecallSource,
    brand: normalizeBrand(data.recalling_firm || ''),
    product: normalizeProduct(data.product_description || ''),
    upcs: [...new Set(upcs)], // Remove duplicates
    lotRegex,
    hazard: data.reason_for_recall || 'No reason provided',
    actions: [
      'Do not consume this product',
      'Return to place of purchase for refund',
      'Contact the recalling firm for more information',
    ],
    jurisdictions: data.state ? [data.state] : undefined,
    links: {
      official: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
      manufacturer: data.recalling_firm ? `https://www.google.com/search?q=${encodeURIComponent(data.recalling_firm)}` : undefined,
    },
    published: normalizeDate(data.recall_initiation_date || data.report_date),
    updated: normalizeDate(data.report_date),
    status: data.recall_status === 'Ongoing' ? 'ongoing' : 
            data.recall_status === 'Terminated' ? 'terminated' : 'unknown',
  };
}

/**
 * Validate FDA recall data
 */
export function validateFDARecall(data: any): data is FDARecallData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.recall_number === 'string' &&
    typeof data.product_description === 'string' &&
    typeof data.recalling_firm === 'string'
  );
}
