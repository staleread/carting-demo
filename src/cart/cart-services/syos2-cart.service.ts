import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Dispatcher, fetch, Request, Response } from 'undici';
import { err, errAsync, ok, Result, ResultAsync } from 'neverthrow';
import { z, ZodSchema } from 'zod';
import { CartService } from '../interfaces/cart-service.interface';
import { ReserveSeatsForSessionDto } from '../dto/reserve-seats-for-session.dto';
import { ReserveSeatsForSessionResponse } from '../responses/reserve-seats-for-session.response';
import { HttpConfigService } from 'src/config/http-config.service';
import { WafChallengeRequiredException } from '../exceptions/waf-challenge-required.exception';
import { CdnCannotProcessRequestException } from '../exceptions/cdn-cannot-process-request.exception';
import { PrimaryInternalErrorException } from '../exceptions/primary-internal-error.exception';
import { ApiBreakingChangeException } from '../exceptions/api-breaking-change.exception';

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

    const responseSchema = z.object({
      LineItemId: z.number(),
      SeatsReserved: z.number(),
    });

    return ResultAsync.fromPromise(
      fetch(request),
      () =>
        new HttpException('Failed to fetch', HttpStatus.INTERNAL_SERVER_ERROR),
    )
      .andThrough((res: Response) => this.checkResponseStatus(res))
      .andThen((res: Response) => this.retrieveJsonResponseBody(res))
      .andThen((data) => this.parseResponseSchema(data, responseSchema))
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
    switch (res.status) {
      case 200:
        return ok();
      case 202:
        return err(new WafChallengeRequiredException());
      case 400:
        return err(new CdnCannotProcessRequestException('CloudFront'));
      case 503:
        return err(new PrimaryInternalErrorException('syos2'));
      default:
        return err(
          new BadGatewayException(
            `Unexpected response with ${res.status} status received`,
          ),
        );
    }
  }

  private retrieveJsonResponseBody(
    res: Response,
  ): ResultAsync<unknown, HttpException> {
    const expectedContentType = 'application/json';
    const contentTypeHeader = res.headers.get('Content-Type')?.toLowerCase();

    if (!contentTypeHeader) {
      return errAsync(
        new BadGatewayException('The API response has no Content-Type header'),
      );
    }

    if (contentTypeHeader.indexOf(expectedContentType) < 0) {
      return errAsync(
        new BadGatewayException(
          `Expected ${expectedContentType} response, but got ${contentTypeHeader}`,
        ),
      );
    }

    return ResultAsync.fromPromise(
      res.json(),
      () => new BadGatewayException('Failed to parse JSON response'),
    );
  }

  private parseResponseSchema<T>(
    data: unknown,
    schema: ZodSchema<T>,
  ): Result<T, HttpException> {
    const parseResult = schema.safeParse(data);

    if (parseResult.success) {
      return ok(parseResult.data);
    }
    return err(new ApiBreakingChangeException());
  }
}
