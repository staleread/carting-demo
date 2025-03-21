import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Dispatcher, fetch, Request, Response } from 'undici';
import { err, ok, Result, ResultAsync } from 'neverthrow';
import { z, ZodSchema } from 'zod';
import { ConfigService } from '@nestjs/config';
import { ReserveSeatsForSessionDto } from '../dto/reserve-seats-for-session.dto';
import { CartService } from '../interfaces/cart-service.interface';
import { ReserveSeatsForSessionResponse } from '../responses/reserve-seats-for-session.response';

@Injectable()
export class SyosCartService implements CartService {
  private static readonly tessituraGeneralResponseSchema = z.union([
    z.object({
      id: z.string(),
      result: z.unknown(),
      error: z.null(),
    }),
    z.object({
      id: z.string(),
      result: z.null(),
      error: z.string(),
    }),
  ]);

  private readonly requestDispatcher: Dispatcher | undefined;

  constructor(configService: ConfigService) {
    this.requestDispatcher = configService.get<Dispatcher>('dispatcher');
  }

  public reserveSeatsForSession(
    dto: ReserveSeatsForSessionDto,
  ): ResultAsync<ReserveSeatsForSessionResponse, HttpException> {
    const request = this.createReserveSeatsForSessionRequest(dto);

    const expectedResultSchema = z.number();

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
    const lineItems = dto.seatsInfo.lineItems;

    return new Request(dto.primaryMarketInfo.ticketingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: dto.sessionInfo.cookieHeaderValue,
      },
      body: JSON.stringify({
        method: 'ReserveTicketsSpecifiedSeats',
        params: {
          sWebSessionID: dto.sessionInfo.id,
          sPriceType: lineItems.map((item) => item.priceType).join(','),
          iPerformanceNumber: dto.seatsInfo.performanceId,
          iNumberOfSeats: lineItems.length,
          sSpecialRequests: 'LeaveSingleSeats=Y',
          RequestedSeats: lineItems.map((item) => item.seatNumber).join(','),
          iZone: 0,
        },
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
    ).andThen((json: unknown) => {
      const parseResult =
        SyosCartService.tessituraGeneralResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(
          new HttpException(
            'The response does not follow the schema',
            HttpStatus.BAD_GATEWAY,
          ),
        );
      }

      const data = parseResult.data;

      if (data.error) {
        return err(
          new HttpException(
            `Tessitura error occured: ${data.error}`,
            HttpStatus.BAD_GATEWAY,
          ),
        );
      }

      return ok(data.result);
    });
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
