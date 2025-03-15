import { fetch, Headers } from 'undici';
import { HttpException } from '@nestjs/common';
import {
  AddSeatsToCartDto,
  PrimaryApiClientService,
  SessionInfo,
} from '../cart.types';
import { err, ok, ResultAsync } from 'neverthrow';
import { CookieFormatter } from 'src/common/cookie-formatter';

export class SyosApiClientService implements PrimaryApiClientService {
  constructor(private readonly sessionInfo: SessionInfo) {}

  public addSeatsToCart(
    dto: AddSeatsToCartDto,
  ): ResultAsync<null, HttpException> {
    const url = 'https://my.ensembleartsphilly.org/proxy';

    const headers = new Headers({
      'Content-Type': 'application/json',
      Cookie: CookieFormatter.formatCookies(this.sessionInfo.cookies),
    });

    const body = JSON.stringify({
      method: 'ReserveTicketsSpecifiedSeats',
      params: {
        sWebSessionID: this.sessionInfo.sessionId,
        sPriceType: dto.seatIds.map(() => dto.priceType).join(','),
        iPerformanceNumber: dto.performanceId,
        iNumberOfSeats: dto.seatIds.length,
        sSpecialRequests: 'LeaveSingleSeats=Y',
        RequestedSeats: dto.seatIds.join(','),
        iZone: 0,
        swapLineItemId: null,
        swapOrderId: null,
        returnedSwappedTickets: [],
      },
    });

    const responsePromise = fetch(url, {
      method: 'post',
      headers,
      body,
    });

    return ResultAsync.fromSafePromise(responsePromise).andThen((res) => {
      if (res.status === 200) {
        return ok(null);
      }
      if (res.status === 202) {
        return err(new HttpException('Invalid session info', 502));
      }
      return err(
        new HttpException(
          'The request was refused due to temporary block',
          502,
        ),
      );
    });
  }
}
