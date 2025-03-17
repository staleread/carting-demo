import { ResultAsync } from 'neverthrow';
import { HttpException } from '@nestjs/common';
import { ReserveSeatsDto } from '../dto/reserve-seat.dto';
import { ReserveSeatsResponse } from '../responses/reserve-seats.response';

export interface CartService {
  reserveSeats(
    dto: ReserveSeatsDto,
  ): ResultAsync<ReserveSeatsResponse, HttpException>;
}
