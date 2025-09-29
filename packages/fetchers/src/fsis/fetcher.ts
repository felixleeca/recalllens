import axios from 'axios';
import { RecallRecord } from '@recalllens/core';
import { normalizeFSISRecall, validateFSISRecall, FSISRecallData } from './normalize';

/**
 * FSIS API configuration
 */
const FSIS_BASE_URL = 'https://www.fsis.usda.gov';
const FSIS_RECALLS_ENDPOINT = '/recalls';

/**
 * Fetch FSIS recall data
 * Note: FSIS doesn't have a public API, so we'll need to scrape their website
 */
export async function fetchFSISRecalls(
  limit: number = 1000,
  offset: number = 0
): Promise<RecallRecord[]> {
  try {
    // For now, return empty array as FSIS doesn't have a public API
    // In a real implementation, you would scrape their website or use their RSS feed
    console.log('FSIS fetcher not fully implemented - no public API available');
    console.log('Would fetch from:', `${FSIS_BASE_URL}${FSIS_RECALLS_ENDPOINT}`);
    
    // Mock data for development
    const mockRecalls: FSISRecallData[] = [
      {
        recall_number: 'FSIS-RC-2024-001',
        recall_date: '2024-01-15',
        product_description: 'Ground Beef - 80/20',
        product_quantity: '1,200 lbs',
        reason_for_recall: 'Possible E. coli contamination',
        classification: 'Class I',
        voluntary_mandated: 'Voluntary',
        distribution_pattern: 'Nationwide',
        states: 'CA, TX, NY, FL',
        firm_name: 'ABC Meat Company',
        firm_ein: '12-3456789',
        firm_address: '123 Main St',
        firm_city: 'Chicago',
        firm_state: 'IL',
        firm_zip: '60601',
        firm_phone: '(555) 123-4567',
        firm_email: 'info@abcmeat.com',
        recall_type: 'Food',
        recall_class: 'Class I',
        recall_reason: 'Possible E. coli contamination',
        recall_quantity: '1,200 lbs',
        recall_distribution: 'Nationwide',
        recall_states: 'CA, TX, NY, FL',
        recall_firm: 'ABC Meat Company',
        recall_firm_address: '123 Main St',
        recall_firm_city: 'Chicago',
        recall_firm_state: 'IL',
        recall_firm_zip: '60601',
        recall_firm_phone: '(555) 123-4567',
        recall_firm_email: 'info@abcmeat.com',
        recall_voluntary_mandated: 'Voluntary',
        recall_classification: 'Class I',
        recall_reason_for_recall: 'Possible E. coli contamination',
        recall_product_description: 'Ground Beef - 80/20',
        recall_product_quantity: '1,200 lbs',
        recall_distribution_pattern: 'Nationwide',
        recall_states_affected: 'CA, TX, NY, FL',
        recall_firm_name: 'ABC Meat Company',
        recall_firm_ein: '12-3456789',
        recall_firm_address_line: '123 Main St',
        recall_firm_city_name: 'Chicago',
        recall_firm_state_name: 'IL',
        recall_firm_zip_code: '60601',
        recall_firm_phone_number: '(555) 123-4567',
        recall_firm_email_address: 'info@abcmeat.com',
      },
    ];
    
    const normalizedRecalls: RecallRecord[] = [];
    
    for (const rawRecall of mockRecalls) {
      try {
        if (validateFSISRecall(rawRecall)) {
          const normalized = normalizeFSISRecall(rawRecall);
          normalizedRecalls.push(normalized);
        } else {
          console.warn('Invalid FSIS recall data:', rawRecall);
        }
      } catch (error) {
        console.error('Error normalizing FSIS recall:', error);
      }
    }
    
    console.log(`Successfully normalized ${normalizedRecalls.length} FSIS recalls`);
    return normalizedRecalls;
    
  } catch (error) {
    console.error('Error fetching FSIS recalls:', error);
    throw error;
  }
}

/**
 * Fetch all FSIS recalls with pagination
 */
export async function fetchAllFSISRecalls(): Promise<RecallRecord[]> {
  // For now, return mock data
  // In a real implementation, you would implement pagination
  return await fetchFSISRecalls();
}

/**
 * Get FSIS recall statistics
 */
export function getFSISStats(recalls: RecallRecord[]): {
  total: number;
  withLotCodes: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
} {
  const stats = {
    total: recalls.length,
    withLotCodes: recalls.filter(r => r.lotRegex && r.lotRegex.length > 0).length,
    byStatus: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
  };
  
  for (const recall of recalls) {
    stats.byStatus[recall.status || 'unknown'] = (stats.byStatus[recall.status || 'unknown'] || 0) + 1;
    stats.bySource[recall.source] = (stats.bySource[recall.source] || 0) + 1;
  }
  
  return stats;
}
