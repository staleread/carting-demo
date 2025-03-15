import { fetch, Headers } from 'undici';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SeatsInfo as ReservationInfo, PrimaryApiClientService, SessionInfo } from '../cart.types';
import { err, ok, ResultAsync } from 'neverthrow';
import { formatCookies } from '../utils';

export class SyosApiClientService implements PrimaryApiClientService {
  public reserveSeats(
    sessionInfo: SessionInfo,
    reservationInfo: ReservationInfo,
  ): ResultAsync<null, HttpException> {
    const url = 'https://my.ensembleartsphilly.org/proxy';

    const headers = new Headers({
      'Content-Type': 'application/json',
      Cookie: formatCookies(sessionInfo.cookies),
    });

    const formattedPriceType = reservationInfo.seatIds
      .map(() => reservationInfo.priceType)
      .join(',');
    const formattedSeatIds = reservationInfo.seatIds.join(',');

    const body = JSON.stringify({
      method: 'ReserveTicketsSpecifiedSeats',
      params: {
        sWebSessionID: sessionInfo.sessionId,
        sPriceType: formattedPriceType,
        iPerformanceNumber: reservationInfo.performanceId,
        iNumberOfSeats: reservationInfo.seatIds.length,
        RequestedSeats: formattedSeatIds,
        sSpecialRequests: 'LeaveSingleSeats=Y',
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
        return err(
          new HttpException('Invalid session info', HttpStatus.BAD_GATEWAY),
        );
      }
      return err(
        new HttpException(
          `${res.status} - the request was rejected due to a temporary block`,
          HttpStatus.BAD_GATEWAY,
        ),
      );
    });
  }
}
