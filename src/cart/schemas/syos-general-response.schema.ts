import { z } from 'zod';

export const SyosGeneralResponseSchema = z.union([
  z.object({
    id: z.string(),
    result: z.unknown(),
    error: z.null(),
  }),
  z.object({
    id: z.string(),
    result: z.null(),
    error: z.string(),
  }),
]);
