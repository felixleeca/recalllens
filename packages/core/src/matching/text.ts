/**
 * Text matching utilities for brand and product names
 */

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '') // Remove common stop words
    .trim();
}

/**
 * Calculate Jaro-Winkler similarity between two strings
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const s1Norm = normalizeText(s1);
  const s2Norm = normalizeText(s2);
  
  if (s1Norm === s2Norm) return 1.0;
  if (s1Norm.length === 0 || s2Norm.length === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(s1Norm.length, s2Norm.length) / 2) - 1;
  if (matchWindow < 0) return 0.0;
  
  const s1Matches = new Array(s1Norm.length).fill(false);
  const s2Matches = new Array(s2Norm.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < s1Norm.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2Norm.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1Norm[i] !== s2Norm[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1Norm.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1Norm[i] !== s2Norm[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / s1Norm.length + matches / s2Norm.length + (matches - transpositions / 2) / matches) / 3;
  
  // Apply Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(s1Norm.length, s2Norm.length, 4); i++) {
    if (s1Norm[i] === s2Norm[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}

/**
 * Calculate cosine similarity between two strings using character n-grams
 */
export function cosineSimilarity(s1: string, s2: string, n: number = 2): number {
  const s1Norm = normalizeText(s1);
  const s2Norm = normalizeText(s2);
  
  if (s1Norm === s2Norm) return 1.0;
  if (s1Norm.length === 0 || s2Norm.length === 0) return 0.0;
  
  const getNGrams = (text: string, n: number): Map<string, number> => {
    const ngrams = new Map<string, number>();
    for (let i = 0; i <= text.length - n; i++) {
      const ngram = text.substring(i, i + n);
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }
    return ngrams;
  };
  
  const ngrams1 = getNGrams(s1Norm, n);
  const ngrams2 = getNGrams(s2Norm, n);
  
  const allKeys = new Set([...ngrams1.keys(), ...ngrams2.keys()]);
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (const key of allKeys) {
    const count1 = ngrams1.get(key) || 0;
    const count2 = ngrams2.get(key) || 0;
    
    dotProduct += count1 * count2;
    norm1 += count1 * count1;
    norm2 += count2 * count2;
  }
  
  if (norm1 === 0 || norm2 === 0) return 0.0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Check if two brand names are similar
 */
export function isBrandSimilar(brand1: string, brand2: string, threshold: number = 0.8): boolean {
  const similarity = jaroWinklerSimilarity(brand1, brand2);
  return similarity >= threshold;
}

/**
 * Check if two product names are similar
 */
export function isProductSimilar(product1: string, product2: string, threshold: number = 0.7): boolean {
  const jaroSim = jaroWinklerSimilarity(product1, product2);
  const cosineSim = cosineSimilarity(product1, product2);
  
  // Use the higher of the two similarities
  const maxSim = Math.max(jaroSim, cosineSim);
  return maxSim >= threshold;
}

/**
 * Find the best matching brand from a list
 */
export function findBestBrandMatch(targetBrand: string, candidateBrands: string[], threshold: number = 0.8): {
  brand: string;
  similarity: number;
} | null {
  let bestMatch: { brand: string; similarity: number } | null = null;
  
  for (const candidate of candidateBrands) {
    const similarity = jaroWinklerSimilarity(targetBrand, candidate);
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { brand: candidate, similarity };
    }
  }
  
  return bestMatch;
}

/**
 * Find the best matching product from a list
 */
export function findBestProductMatch(targetProduct: string, candidateProducts: string[], threshold: number = 0.7): {
  product: string;
  similarity: number;
} | null {
  let bestMatch: { product: string; similarity: number } | null = null;
  
  for (const candidate of candidateProducts) {
    const jaroSim = jaroWinklerSimilarity(targetProduct, candidate);
    const cosineSim = cosineSimilarity(targetProduct, candidate);
    const maxSim = Math.max(jaroSim, cosineSim);
    
    if (maxSim >= threshold && (!bestMatch || maxSim > bestMatch.similarity)) {
      bestMatch = { product: candidate, similarity: maxSim };
    }
  }
  
  return bestMatch;
}
