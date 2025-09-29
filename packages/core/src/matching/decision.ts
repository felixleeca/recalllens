import { RecallRecord, Decision, MatchResult, ScanResult } from '../schemas/recall';
import { normalizeUPC, areUPCEquivalent } from '../utils/upc';
import { isBrandSimilar, isProductSimilar } from './text';
import { matchesLotPattern, isDateInRange } from '../parsers/lot';

export interface DecisionInput {
  upc?: string;
  brand?: string;
  product?: string;
  lot?: string;
  expiry?: string;
  sourceHits: RecallRecord[];
}

/**
 * Main decision engine for determining recall status
 */
export function decide(input: DecisionInput): MatchResult {
  const { upc, brand, product, lot, expiry, sourceHits } = input;
  
  if (sourceHits.length === 0) {
    return {
      decision: 'GREEN',
      reasons: ['No recalls found for this product'],
      matches: [],
    };
  }
  
  // Tier 1: Exact UPC match with lot/date validation
  const upcMatches = findUPCMatches(upc, sourceHits);
  if (upcMatches.length > 0) {
    const redMatches = upcMatches.filter(record => 
      !record.lotRegex || !lot || record.lotRegex.some(pattern => matchesLotPattern(lot, pattern))
    );
    
    if (redMatches.length > 0) {
      return {
        decision: 'RED',
        reasons: [
          'Exact UPC match found',
          lot ? 'Lot code matches recall criteria' : 'No lot code restrictions in recall',
        ],
        matches: redMatches,
        confidence: 0.95,
      };
    }
    
    // UPC matches but lot doesn't - this is YELLOW
    return {
      decision: 'YELLOW',
      reasons: [
        'Exact UPC match found',
        'Your lot code does not match the recalled lots',
        'Please verify your lot code matches the recall notice',
      ],
      matches: upcMatches,
      confidence: 0.8,
    };
  }
  
  // Tier 2: Brand + Product fuzzy match
  const brandProductMatches = findBrandProductMatches(brand, product, sourceHits);
  if (brandProductMatches.length > 0) {
    // Check if lot/date constraints apply
    const constrainedMatches = brandProductMatches.filter(record => 
      record.lotRegex || record.expiration
    );
    
    if (constrainedMatches.length > 0) {
      const lotMatches = constrainedMatches.filter(record => {
        if (record.lotRegex && lot) {
          return record.lotRegex.some(pattern => matchesLotPattern(lot, pattern));
        }
        if (record.expiration && expiry) {
          return isDateInRange(expiry, record.expiration.start, record.expiration.end);
        }
        return false;
      });
      
      if (lotMatches.length > 0) {
        return {
          decision: 'RED',
          reasons: [
            'Brand and product match found',
            'Lot/expiry date matches recall criteria',
          ],
          matches: lotMatches,
          confidence: 0.85,
        };
      }
      
      return {
        decision: 'YELLOW',
        reasons: [
          'Brand and product match found',
          'Your lot/expiry date does not match the recalled range',
          'Please verify your lot/expiry date matches the recall notice',
        ],
        matches: constrainedMatches,
        confidence: 0.7,
      };
    }
    
    // No lot/date constraints - this is YELLOW with verification needed
    return {
      decision: 'YELLOW',
      reasons: [
        'Brand and product match found',
        'No specific lot/date restrictions in recall',
        'Please verify this matches your product',
      ],
      matches: brandProductMatches,
      confidence: 0.6,
    };
  }
  
  // No matches found
  return {
    decision: 'GREEN',
    reasons: ['No recalls found for this product'],
    matches: [],
  };
}

/**
 * Find records that match the UPC exactly
 */
function findUPCMatches(upc: string | undefined, records: RecallRecord[]): RecallRecord[] {
  if (!upc) return [];
  
  const normalizedUPC = normalizeUPC(upc);
  if (!normalizedUPC.isValid) return [];
  
  return records.filter(record => 
    record.upcs.some(recordUPC => {
      const normalizedRecordUPC = normalizeUPC(recordUPC);
      return normalizedRecordUPC.isValid && 
             (normalizedUPC.normalized === normalizedRecordUPC.normalized ||
              areUPCEquivalent(normalizedUPC.normalized, normalizedRecordUPC.normalized));
    })
  );
}

/**
 * Find records that match brand and product with fuzzy matching
 */
function findBrandProductMatches(
  brand: string | undefined, 
  product: string | undefined, 
  records: RecallRecord[]
): RecallRecord[] {
  if (!brand && !product) return [];
  
  const matches: RecallRecord[] = [];
  
  for (const record of records) {
    let brandMatch = true;
    let productMatch = true;
    
    if (brand) {
      brandMatch = record.brand.some(recordBrand => 
        isBrandSimilar(brand, recordBrand, 0.8)
      );
    }
    
    if (product) {
      productMatch = isProductSimilar(product, record.product, 0.7);
    }
    
    if (brandMatch && productMatch) {
      matches.push(record);
    }
  }
  
  return matches;
}

/**
 * Generate human-readable reasons for the decision
 */
export function generateReasons(decision: Decision, matches: RecallRecord[]): string[] {
  const reasons: string[] = [];
  
  switch (decision) {
    case 'RED':
      reasons.push('⚠️ This product has been recalled');
      if (matches.length === 1) {
        reasons.push(`Recall: ${matches[0].hazard}`);
      } else {
        reasons.push(`Found ${matches.length} matching recalls`);
      }
      break;
      
    case 'YELLOW':
      reasons.push('⚠️ Similar product has been recalled');
      reasons.push('Please verify this matches your specific product');
      if (matches.length === 1) {
        reasons.push(`Potential recall: ${matches[0].hazard}`);
      } else {
        reasons.push(`Found ${matches.length} potential matches`);
      }
      break;
      
    case 'GREEN':
      reasons.push('✅ No recalls found for this product');
      reasons.push('This product appears to be safe');
      break;
  }
  
  return reasons;
}
