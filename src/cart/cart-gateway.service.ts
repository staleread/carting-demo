import { Injectable } from '@nestjs/common';
import { ReserveSeatsForSessionResponse } from './responses/reserve-seats-for-session.response';
import { ReserveSeatsForSessionPartialDto } from './dto/reserve-seats-for-session-partial.dto';
import { primaryMarkets } from './records/primary-markets.record';
import { ReserveSeatsForSessionDto } from './dto/reserve-seats-for-session.dto';
import { LineItemDto } from './dto/line-item.dto';
import { CartServiceFactory } from './cart-service.factory';

@Injectable()
export class CartGatewayService {
  constructor(private readonly cartServiceFactory: CartServiceFactory) {}

  public async reserveSeatsForSession(
    partialDto: ReserveSeatsForSessionPartialDto,
  ): Promise<ReserveSeatsForSessionResponse> {
    const dto = this.toReserveSeatsForSessionDto(partialDto);
    const cartService = this.cartServiceFactory.getCartService(
      dto.primaryMarketInfo.platform,
    );

    const result = await cartService.reserveSeatsForSession(dto);

    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  }

  private toReserveSeatsForSessionDto(
    partialDto: ReserveSeatsForSessionPartialDto,
  ): ReserveSeatsForSessionDto {
    const primaryMarketInfo = primaryMarkets[partialDto.primaryMarketName];

    const cookieHeaderValue = Object.entries(partialDto.sessionInfo.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const lineItems: LineItemDto[] = partialDto.seatsInfo.seatNumbers.map(
      (seatNumber) => ({
        priceType: partialDto.seatsInfo.priceType,
        seatNumber: seatNumber,
      }),
    );

    return {
      sessionInfo: {
        id: partialDto.sessionInfo.id,
        cookieHeaderValue: cookieHeaderValue,
      },
      seatsInfo: {
        performanceId: partialDto.seatsInfo.performanceId,
        lineItems: lineItems,
      },
      primaryMarketInfo: primaryMarketInfo,
    };
  }
}
