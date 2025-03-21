import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Dispatcher, fetch, Request, Response } from 'undici';
import { err, ok, Result, ResultAsync } from 'neverthrow';
import { z, ZodSchema } from 'zod';
import { CartService } from '../interfaces/cart-service.interface';
import { ReserveSeatsForSessionDto } from '../dto/reserve-seats-for-session.dto';
import { ReserveSeatsForSessionResponse } from '../responses/reserve-seats-for-session.response';
import { HttpConfigService } from 'src/config/http-config.service';

@Injectable()
export class Syos2CartService implements CartService {
  private readonly requestDispatcher: Dispatcher | undefined;

  constructor(httpConfigService: HttpConfigService) {
    this.requestDispatcher = httpConfigService.getDispatcher();
  }

  public reserveSeatsForSession(
    dto: ReserveSeatsForSessionDto,
  ): ResultAsync<ReserveSeatsForSessionResponse, HttpException> {
    const request = this.createReserveSeatsForSessionRequest(dto);

    const expectedResultSchema = z.object({
      SeatsReserved: z.number(),
    });

    return ResultAsync.fromPromise(
      fetch(request),
      () =>
        new HttpException('Failed to fetch', HttpStatus.INTERNAL_SERVER_ERROR),
    )
      .andThrough((res: Response) => this.checkResponseStatus(res))
      .andThen((res: Response) => this.unwrapResponseData(res))
      .andThen((data) => this.parseResponseData(data, expectedResultSchema))
      .map(() => ({ url: dto.primaryMarketInfo.cartUrl }));
  }

  private createReserveSeatsForSessionRequest(
    dto: ReserveSeatsForSessionDto,
  ): Request {
    const url = `${dto.primaryMarketInfo.ticketingEndpoint}/Web/Cart/${dto.sessionInfo.id}/Tickets`;

    // Syos2 client determines this value based on some config features and ADA seatings.
    // This logic is ommited here
    const leaveSingleSeatsIndicator = 'Y';
    const lineItems = dto.seatsInfo.lineItems;

    return new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: dto.sessionInfo.cookieHeaderValue,
      },
      body: JSON.stringify({
        PriceType: lineItems.map((item) => item.priceType).join(','),
        PerformanceId: dto.seatsInfo.performanceId,
        NumberOfSeats: lineItems.length,
        SpecialRequests: `LeaveSingleSeats=${leaveSingleSeatsIndicator}`,
        RequestedSeats: lineItems.map((item) => item.seatNumber).join(','),
        ZoneId: 0,
      }),
      dispatcher: this.requestDispatcher,
    });
  }

  private checkResponseStatus(res: Response): Result<void, HttpException> {
    if (res.status == 200) {
      return ok();
    }
    if (res.status == 202) {
      return err(
        new HttpException(
          'Server requests challenge completion',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
    if (res.status == 400) {
      return err(
        new HttpException(
          'The request was rejected by the CloudFront',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }
    return err(
      new HttpException(
        `${res.status}: Unexpected error happened`,
        HttpStatus.BAD_GATEWAY,
      ),
    );
  }

  private unwrapResponseData(
    res: Response,
  ): ResultAsync<unknown, HttpException> {
    return ResultAsync.fromPromise(
      res.json(),
      () =>
        new HttpException(
          'Failed to parse JSON response',
          HttpStatus.BAD_GATEWAY,
        ),
    );
  }

  private parseResponseData<T>(
    data: unknown,
    schema: ZodSchema<T>,
  ): Result<T, HttpException> {
    const parseResult = schema.safeParse(data);

    if (parseResult.success) {
      return ok(parseResult.data);
    }
    return err(
      new HttpException(
        'The response body does not follow the schema',
        HttpStatus.BAD_GATEWAY,
      ),
    );
  }
}
