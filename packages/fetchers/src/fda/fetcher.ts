import axios from 'axios';
import { RecallRecord } from '@recalllens/core';
import { normalizeFDARecall, validateFDARecall, FDARecallData } from './normalize';

/**
 * FDA API configuration
 */
const FDA_BASE_URL = 'https://api.fda.gov';
const FDA_ENFORCEMENT_ENDPOINT = '/food/enforcement.json';

/**
 * Fetch FDA recall data from the openFDA API
 */
export async function fetchFDARecalls(
  limit: number = 1000,
  skip: number = 0
): Promise<RecallRecord[]> {
  try {
    const url = `${FDA_BASE_URL}${FDA_ENFORCEMENT_ENDPOINT}`;
    const params = {
      limit,
      skip,
      sort: 'recall_initiation_date:desc',
    };
    
    console.log(`Fetching FDA recalls from ${url}...`);
    const response = await axios.get(url, { params });
    
    if (!response.data || !response.data.results) {
      console.warn('No FDA recall data found');
      return [];
    }
    
    const rawRecalls = response.data.results as FDARecallData[];
    console.log(`Found ${rawRecalls.length} raw FDA recalls`);
    
    const normalizedRecalls: RecallRecord[] = [];
    
    for (const rawRecall of rawRecalls) {
      try {
        if (validateFDARecall(rawRecall)) {
          const normalized = normalizeFDARecall(rawRecall);
          normalizedRecalls.push(normalized);
        } else {
          console.warn('Invalid FDA recall data:', rawRecall);
        }
      } catch (error) {
        console.error('Error normalizing FDA recall:', error);
      }
    }
    
    console.log(`Successfully normalized ${normalizedRecalls.length} FDA recalls`);
    return normalizedRecalls;
    
  } catch (error) {
    console.error('Error fetching FDA recalls:', error);
    throw error;
  }
}

/**
 * Fetch all FDA recalls with pagination
 */
export async function fetchAllFDARecalls(): Promise<RecallRecord[]> {
  const allRecalls: RecallRecord[] = [];
  const limit = 1000;
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const recalls = await fetchFDARecalls(limit, skip);
      
      if (recalls.length === 0) {
        hasMore = false;
      } else {
        allRecalls.push(...recalls);
        skip += limit;
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error fetching FDA recalls (skip: ${skip}):`, error);
      hasMore = false;
    }
  }
  
  return allRecalls;
}

/**
 * Get FDA recall statistics
 */
export function getFDAStats(recalls: RecallRecord[]): {
  total: number;
  withUPCs: number;
  withLotCodes: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
} {
  const stats = {
    total: recalls.length,
    withUPCs: recalls.filter(r => r.upcs.length > 0).length,
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
