import { HttpException } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { Cookie } from 'undici';

export type PrimaryType = 'syos' | 'syos2';

export type AddSeatsToCartDto = {
  performanceId: number;
  seatIds: number[];
  priceType: string;
};

export type SessionInfo = {
  sessionId: string;
  cookies: Cookie[];
};

export interface PrimaryApiClientService {
  addSeatsToCart(dto: AddSeatsToCartDto): ResultAsync<null, HttpException>;
}

export type ReserveSeatsDto = {
  sessionInfo: SessionInfo;
  seatsInfo: AddSeatsToCartDto;
};
