import { z } from 'zod';

export type RecallSource = 'fda' | 'fsis' | 'cpsc';

export const RecallSourceSchema = z.enum(['fda', 'fsis', 'cpsc']);

export const RecallRecordSchema = z.object({
  id: z.string(),
  source: RecallSourceSchema,
  brand: z.array(z.string()),
  product: z.string(),
  upcs: z.array(z.string()),
  lotRegex: z.array(z.string()).optional(),
  expiration: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  hazard: z.string(),
  actions: z.array(z.string()),
  jurisdictions: z.array(z.string()).optional(),
  links: z.object({
    official: z.string(),
    manufacturer: z.string().optional(),
  }),
  published: z.string(),
  updated: z.string().optional(),
  status: z.enum(['ongoing', 'terminated', 'unknown']).optional(),
});

export type RecallRecord = z.infer<typeof RecallRecordSchema>;

export const ScanResultSchema = z.object({
  upc: z.string().optional(),
  brand: z.string().optional(),
  product: z.string().optional(),
  lot: z.string().optional(),
  expiry: z.string().optional(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const DecisionSchema = z.enum(['GREEN', 'YELLOW', 'RED']);

export type Decision = z.infer<typeof DecisionSchema>;

export const MatchResultSchema = z.object({
  decision: DecisionSchema,
  reasons: z.array(z.string()),
  matches: z.array(RecallRecordSchema),
  confidence: z.number().min(0).max(1).optional(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;
