import { RecallRecord } from '@recalllens/core';

/**
 * CPSC fetcher - placeholder implementation
 */
export async function fetchCPSCRecalls(): Promise<RecallRecord[]> {
  console.log('CPSC fetcher not implemented yet');
  return [];
}

export async function fetchAllCPSCRecalls(): Promise<RecallRecord[]> {
  return await fetchCPSCRecalls();
}
