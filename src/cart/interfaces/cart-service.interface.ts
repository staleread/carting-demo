import { ResultAsync } from 'neverthrow';
import { HttpException } from '@nestjs/common';
import { ReserveSeatsForSessionResponse } from '../responses/reserve-seats-for-session.response';
import { ReserveSeatsForSessionDto } from '../dto/reserve-seats-for-session.dto';

export interface CartService {
  reserveSeatsForSession(
    dto: ReserveSeatsForSessionDto,
  ): ResultAsync<ReserveSeatsForSessionResponse, HttpException>;
}
