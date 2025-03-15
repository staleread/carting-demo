import { HttpException } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { Cookie } from 'undici';

export type PrimaryType = 'syos' | 'syos2';

export type SeatsInfo = {
  performanceId: number;
  seatIds: number[];
  priceType: string;
};

export type SessionInfo = {
  sessionId: string;
  cookies: Cookie[];
};

export type ReserveSeatsDto = {
  sessionInfo: SessionInfo;
  seatsInfo: SeatsInfo;
};

export interface PrimaryApiClientService {
  reserveSeats(
    sessionInfo: SessionInfo,
    seatsInfo: SeatsInfo,
  ): ResultAsync<null, HttpException>;
}
