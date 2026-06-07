import { z } from 'zod';
import { MIN_DEX, MAX_DEX } from '../constants/index';

/**
 * Detail-route id param. Bounded to the Gen-I dex range (SEC-007). A value
 * outside 1–151 (or non-numeric) parses to `null`, which the route renders as
 * a not-found state rather than querying the DB (edge case in spec).
 */
export const detailParamSchema = z
  .string()
  .transform((v) => Number.parseInt(v, 10))
  .refine((n) => Number.isInteger(n) && n >= MIN_DEX && n <= MAX_DEX, {
    message: 'out_of_range',
  });

export function parseDexId(raw: string): number | null {
  const result = detailParamSchema.safeParse(raw);
  return result.success ? result.data : null;
}
