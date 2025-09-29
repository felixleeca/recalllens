import { RecallRecord, RecallSource } from '@recalllens/core';
import { format, parseISO } from 'date-fns';

/**
 * Normalize FSIS recall data to our unified schema
 */

export interface FSISRecallData {
  recall_number: string;
  recall_date: string;
  product_description: string;
  product_quantity: string;
  reason_for_recall: string;
  classification: string;
  voluntary_mandated: string;
  distribution_pattern: string;
  states: string;
  firm_name: string;
  firm_ein: string;
  firm_address: string;
  firm_city: string;
  firm_state: string;
  firm_zip: string;
  firm_phone: string;
  firm_email: string;
  recall_type: string;
  recall_class: string;
  recall_reason: string;
  recall_quantity: string;
  recall_distribution: string;
  recall_states: string;
  recall_firm: string;
  recall_firm_address: string;
  recall_firm_city: string;
  recall_firm_state: string;
  recall_firm_zip: string;
  recall_firm_phone: string;
  recall_firm_email: string;
  recall_voluntary_mandated: string;
  recall_classification: string;
  recall_reason_for_recall: string;
  recall_product_description: string;
  recall_product_quantity: string;
  recall_distribution_pattern: string;
  recall_states_affected: string;
  recall_firm_name: string;
  recall_firm_ein: string;
  recall_firm_address_line: string;
  recall_firm_city_name: string;
  recall_firm_state_name: string;
  recall_firm_zip_code: string;
  recall_firm_phone_number: string;
  recall_firm_email_address: string;
}

/**
 * Extract lot codes from FSIS text fields
 */
function extractLotCodes(text: string): string[] {
  const lotPatterns = [
    /lot[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /batch[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /serial[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /pack[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
    /case[:\s]*([A-Z]?\d{4,}[A-Z]?)/gi,
  ];
  
  const lots: string[] = [];
  
  for (const pattern of lotPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      lots.push(...matches.map(match => 
        match.replace(/^(lot|batch|serial|pack|case)[:\s]*/i, '')
      ));
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
 * Convert FSIS date to ISO format
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
 * Convert FSIS recall data to our unified schema
 */
export function normalizeFSISRecall(data: FSISRecallData): RecallRecord {
  const lotCodes = [
    ...extractLotCodes(data.product_description || ''),
    ...extractLotCodes(data.reason_for_recall || ''),
  ];
  
  // Convert lot codes to regex patterns
  const lotRegex = lotCodes.length > 0 ? 
    lotCodes.map(lot => `^${lot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : 
    undefined;
  
  // Parse states
  const states = data.states || data.recall_states || data.recall_states_affected || '';
  const jurisdictions = states ? 
    states.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0) : 
    undefined;
  
  return {
    id: data.recall_number,
    source: 'fsis' as RecallSource,
    brand: normalizeBrand(data.firm_name || data.recall_firm || data.recall_firm_name || ''),
    product: normalizeProduct(data.product_description || data.recall_product_description || ''),
    upcs: [], // FSIS typically doesn't provide UPCs
    lotRegex,
    hazard: data.reason_for_recall || data.recall_reason || data.recall_reason_for_recall || 'No reason provided',
    actions: [
      'Do not consume this product',
      'Return to place of purchase for refund',
      'Contact the recalling firm for more information',
    ],
    jurisdictions,
    links: {
      official: `https://www.fsis.usda.gov/recalls`,
      manufacturer: data.firm_name ? `https://www.google.com/search?q=${encodeURIComponent(data.firm_name)}` : undefined,
    },
    published: normalizeDate(data.recall_date || data.recall_date || ''),
    updated: normalizeDate(data.recall_date || ''),
    status: data.classification === 'Class I' ? 'ongoing' : 
            data.classification === 'Class II' ? 'ongoing' : 
            data.classification === 'Class III' ? 'ongoing' : 'unknown',
  };
}

/**
 * Validate FSIS recall data
 */
export function validateFSISRecall(data: any): data is FSISRecallData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.recall_number === 'string' &&
    typeof data.product_description === 'string' &&
    typeof data.firm_name === 'string'
  );
}
