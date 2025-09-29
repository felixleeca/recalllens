/**
 * UPC/EAN utility functions for barcode processing
 */

export interface UPCDetails {
  type: 'UPC-A' | 'EAN-13' | 'EAN-8' | 'invalid';
  normalized: string;
  isValid: boolean;
}

/**
 * Normalize and validate a UPC/EAN barcode
 */
export function normalizeUPC(input: string): UPCDetails {
  // Remove all non-digit characters
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return {
      type: 'EAN-8',
      normalized: cleaned.padStart(8, '0'),
      isValid: validateChecksum(cleaned, 8),
    };
  }
  
  if (cleaned.length === 12) {
    return {
      type: 'UPC-A',
      normalized: cleaned.padStart(12, '0'),
      isValid: validateChecksum(cleaned, 12),
    };
  }
  
  if (cleaned.length === 13) {
    return {
      type: 'EAN-13',
      normalized: cleaned.padStart(13, '0'),
      isValid: validateChecksum(cleaned, 13),
    };
  }
  
  return {
    type: 'invalid',
    normalized: cleaned,
    isValid: false,
  };
}

/**
 * Validate UPC/EAN checksum using the standard algorithm
 */
function validateChecksum(code: string, length: number): boolean {
  if (code.length !== length) return false;
  
  let sum = 0;
  const multiplier = length === 8 ? 3 : 1; // EAN-8 uses different pattern
  
  for (let i = 0; i < length - 1; i++) {
    const digit = parseInt(code[i], 10);
    const weight = (length === 8 && i % 2 === 0) ? 3 : (i % 2 === 0 ? 1 : 3);
    sum += digit * weight;
  }
  
  const checkDigit = parseInt(code[length - 1], 10);
  const calculatedCheck = (10 - (sum % 10)) % 10;
  
  return checkDigit === calculatedCheck;
}

/**
 * Extract manufacturer code from UPC-A (first 6 digits)
 */
export function getManufacturerCode(upc: string): string | null {
  const normalized = normalizeUPC(upc);
  if (normalized.type === 'UPC-A' && normalized.isValid) {
    return normalized.normalized.substring(0, 6);
  }
  return null;
}

/**
 * Check if two UPCs are equivalent (same product, different packaging)
 */
export function areUPCEquivalent(upc1: string, upc2: string): boolean {
  const norm1 = normalizeUPC(upc1);
  const norm2 = normalizeUPC(upc2);
  
  if (!norm1.isValid || !norm2.isValid) return false;
  
  // For UPC-A, compare first 11 digits (excluding check digit)
  if (norm1.type === 'UPC-A' && norm2.type === 'UPC-A') {
    return norm1.normalized.substring(0, 11) === norm2.normalized.substring(0, 11);
  }
  
  // For EAN-13, compare first 12 digits
  if (norm1.type === 'EAN-13' && norm2.type === 'EAN-13') {
    return norm1.normalized.substring(0, 12) === norm2.normalized.substring(0, 12);
  }
  
  return false;
}
