import { fetch, Headers, RequestInit, Response } from 'undici';
import { HttpException, HttpStatus } from '@nestjs/common';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { CartService } from '../interfaces/cart-service.interface';
import { ReserveSeatsDto } from '../dto/reserve-seat.dto';
import { ReserveSeatsResponse } from '../responses/reserve-seats.response';
import { SessionCookie } from '../models/cookie.model';

export class PhillyorchCartService implements CartService {
  private static readonly ticketingDomain = 'my.ensembleartsphilly.org';

  public reserveSeats(
    dto: ReserveSeatsDto,
  ): ResultAsync<ReserveSeatsResponse, HttpException> {
    const URL = `https://${PhillyorchCartService.ticketingDomain}/proxy`;
    const requestInit = this.initReserveSeatsRequest(dto);

    return ResultAsync.fromSafePromise(fetch(URL, requestInit)).andThen((res) =>
      this.handleReserveSeatsResponse(res),
    );
  }

  private initReserveSeatsRequest(dto: ReserveSeatsDto): RequestInit {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Cookie: SessionCookie.toHttpHeaderValue(dto.sessionCookies),
    });

    const formattedPriceType = dto.seatIds.map(() => dto.priceType).join(',');
    const formattedSeatIds = dto.seatIds.join(',');

    const body = JSON.stringify({
      method: 'ReserveTicketsSpecifiedSeats',
      params: {
        sWebSessionID: dto.sessionId,
        sPriceType: formattedPriceType,
        iPerformanceNumber: dto.performanceId,
        iNumberOfSeats: dto.seatIds.length,
        sSpecialRequests: 'LeaveSingleSeats=Y',
        RequestedSeats: formattedSeatIds,
        iZone: 0,
        swapLineItemId: null,
        swapOrderId: null,
        returnedSwappedTickets: [],
      },
    });

    return { method: 'POST', headers, body };
  }

  private handleReserveSeatsResponse(
    res: Response,
  ): ResultAsync<ReserveSeatsResponse, HttpException> {
    const CART_URL = `https://${PhillyorchCartService.ticketingDomain}/booking/basket`;

    if (res.status === 200) {
      return okAsync({ url: CART_URL });
    }
    if (res.status === 202) {
      return errAsync(
        new HttpException('Invalid session info', HttpStatus.BAD_GATEWAY),
      );
    }
    return errAsync(
      new HttpException(
        `${res.status} - the request was rejected due to a temporary block`,
        HttpStatus.BAD_GATEWAY,
      ),
    );
  }
}
