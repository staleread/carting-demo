import { z } from 'zod';
import { PRIMARY_MARKET_NAMES } from '../unions/primary-market-name.union';

export const ReserveSeatsDtoSchema = z.object({
  sessionId: z.string(),
  sessionCookies: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
  primaryMarketName: z.enum(PRIMARY_MARKET_NAMES),
  performanceId: z.number(),
  priceType: z.string(),
  seatIds: z.array(z.number()),
});

export type ReserveSeatsDto = z.infer<typeof ReserveSeatsDtoSchema>;
