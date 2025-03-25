import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Dispatcher, fetch, Request, Response } from 'undici';
import { err, errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow';
import { z, ZodSchema } from 'zod';
import { ReserveSeatsForSessionDto } from '../dto/reserve-seats-for-session.dto';
import { CartService } from '../interfaces/cart-service.interface';
import { ReserveSeatsForSessionResponse } from '../responses/reserve-seats-for-session.response';
import { SyosGeneralResponseSchema } from '../schemas/syos-general-response.schema';
import { HttpConfigService } from 'src/config/http-config.service';
import { WafChallengeRequiredException } from '../exceptions/waf-challenge-required.exception';
import { CdnCannotProcessRequestException } from '../exceptions/cdn-cannot-process-request.exception';
import { PrimaryInternalErrorException } from '../exceptions/primary-internal-error.exception';
import { ApiBreakingChangeException } from '../exceptions/api-breaking-change.exception';

@Injectable()
export class SyosCartService implements CartService {
  private readonly requestDispatcher: Dispatcher | undefined;

  constructor(httpConfigService: HttpConfigService) {
    this.requestDispatcher = httpConfigService.getDispatcher();
  }

  public reserveSeatsForSession(
    dto: ReserveSeatsForSessionDto,
  ): ResultAsync<ReserveSeatsForSessionResponse, HttpException> {
    const request = this.createReserveSeatsForSessionRequest(dto);

    const responseSchema = z.number();

    return ResultAsync.fromPromise(
      fetch(request),
      () =>
        new HttpException('Failed to fetch', HttpStatus.INTERNAL_SERVER_ERROR),
    )
      .andThrough((res: Response) => this.checkResponseStatus(res))
      .andThen((res: Response) => this.retrieveJsonResponseBody(res))
      .andThen((json: unknown) => this.unwrapSyosResult(json))
      .andThen((result: unknown) =>
        this.parseResponseSchema(result, responseSchema),
      )
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
    switch (res.status) {
      case 200:
        return ok();
      case 202:
        return err(new WafChallengeRequiredException());
      case 400:
        return err(new CdnCannotProcessRequestException('CloudFront'));
      case 500:
        return err(new PrimaryInternalErrorException('syos'));
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

  private unwrapSyosResult(json: unknown): ResultAsync<unknown, HttpException> {
    const parseResult = SyosGeneralResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return errAsync(new ApiBreakingChangeException());
    }

    const data = parseResult.data;

    if (data.error) {
      return errAsync(
        new PrimaryInternalErrorException('syos', { cause: data.error }),
      );
    }
    return okAsync(data.result);
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
