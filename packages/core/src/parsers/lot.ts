/**
 * Lot code and expiration date parsing utilities
 */

export interface ParsedLot {
  raw: string;
  normalized: string;
  components: {
    prefix?: string;
    date?: string;
    suffix?: string;
  };
}

export interface ParsedExpiry {
  raw: string;
  normalized: string; // ISO date format (YYYY-MM-DD)
  confidence: number; // 0-1 confidence score
}

/**
 * Common lot code patterns
 */
const LOT_PATTERNS = [
  // L2207A, L2207, 2207A
  /^(L?)(\d{4,6})([A-Z]?)$/i,
  // Lot: 12345, LOT 12345
  /^lot[:\s]*([A-Z]?\d{4,})$/i,
  // Batch: 12345
  /^batch[:\s]*([A-Z]?\d{4,})$/i,
  // Serial: 12345
  /^serial[:\s]*([A-Z]?\d{4,})$/i,
  // Model: ABC123
  /^model[:\s]*([A-Z0-9]+)$/i,
];

/**
 * Common expiration date patterns
 */
const EXPIRY_PATTERNS = [
  // MM/DD/YYYY, MM-DD-YYYY, MM DD YYYY
  /^(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{4})$/,
  // MM/DD/YY, MM-DD-YY
  /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
  // YYYY-MM-DD (ISO)
  /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  // Best by: MM/DD/YYYY
  /^best\s(?:if\s)?(?:used\s)?by\s(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})$/i,
  // Exp: MM/DD/YYYY
  /^exp[.:\s]*(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})$/i,
  // Use by: MM/DD/YYYY
  /^use\sby[:\s]*(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})$/i,
  // Sell by: MM/DD/YYYY
  /^sell\sby[:\s]*(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})$/i,
];

/**
 * Parse lot code from text
 */
export function parseLotCode(text: string): ParsedLot | null {
  const cleaned = text.trim().toUpperCase();
  
  for (const pattern of LOT_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      const [, prefix = '', date, suffix = ''] = match;
      return {
        raw: text.trim(),
        normalized: `${prefix}${date}${suffix}`,
        components: {
          prefix: prefix || undefined,
          date: date || undefined,
          suffix: suffix || undefined,
        },
      };
    }
  }
  
  return null;
}

/**
 * Parse expiration date from text
 */
export function parseExpiryDate(text: string): ParsedExpiry | null {
  const cleaned = text.trim();
  
  for (const pattern of EXPIRY_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      const [, month, day, year] = match;
      
      // Convert 2-digit year to 4-digit
      const fullYear = year.length === 2 ? 
        (parseInt(year, 10) < 50 ? 2000 + parseInt(year, 10) : 1900 + parseInt(year, 10)) :
        parseInt(year, 10);
      
      // Validate date
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      
      if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        continue;
      }
      
      // Create ISO date string
      const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Validate the actual date
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        continue;
      }
      
      return {
        raw: text.trim(),
        normalized: isoDate,
        confidence: 0.9, // High confidence for matched patterns
      };
    }
  }
  
  return null;
}

/**
 * Extract lot codes and expiry dates from OCR text
 */
export function extractFromOCRText(text: string): {
  lots: ParsedLot[];
  expiries: ParsedExpiry[];
} {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const lots: ParsedLot[] = [];
  const expiries: ParsedExpiry[] = [];
  
  for (const line of lines) {
    // Try to parse as lot code
    const lot = parseLotCode(line);
    if (lot) {
      lots.push(lot);
      continue;
    }
    
    // Try to parse as expiry date
    const expiry = parseExpiryDate(line);
    if (expiry) {
      expiries.push(expiry);
    }
  }
  
  return { lots, expiries };
}

/**
 * Check if a lot code matches a regex pattern
 */
export function matchesLotPattern(lot: string, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(lot);
  } catch {
    return false;
  }
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date: string, start?: string, end?: string): boolean {
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) return false;
  
  if (start) {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime()) || targetDate < startDate) return false;
  }
  
  if (end) {
    const endDate = new Date(end);
    if (isNaN(endDate.getTime()) || targetDate > endDate) return false;
  }
  
  return true;
}
