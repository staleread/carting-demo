import { z } from 'zod';
import { PRIMARY_MARKET_NAMES } from '../unions/primary-market-name.union';

export const ReserveSeatsForSessionPartialDtoSchema = z.object({
  sessionInfo: z.object({
    id: z.string(),
    cookies: z.object({
      'aws-waf-token': z.string(),
      crowdhandler: z.string(),
      crowdhandler_integration: z.string(),
    }),
  }),
  seatsInfo: z.object({
    performanceId: z.number(),
    priceType: z.number(),
    seatNumbers: z.array(z.number()).min(1),
  }),
  primaryMarketName: z.enum(PRIMARY_MARKET_NAMES),
});

export type ReserveSeatsForSessionPartialDto = z.infer<
  typeof ReserveSeatsForSessionPartialDtoSchema
>;
