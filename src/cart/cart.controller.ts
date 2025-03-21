import { Body, Controller, Post } from '@nestjs/common';
import { CartGatewayService } from './cart-gateway.service';
import { ReserveSeatsForSessionResponse } from './responses/reserve-seats-for-session.response';
import { ReserveSeatsForSessionPartialDto } from './dto/reserve-seats-for-session-partial.dto';

@Controller('/cart')
export class CartController {
  constructor(private readonly cartGatewayService: CartGatewayService) {}

  @Post()
  public async reserveSeatsForSesssion(
    @Body() dto: ReserveSeatsForSessionPartialDto,
  ): Promise<ReserveSeatsForSessionResponse> {
    return await this.cartGatewayService.reserveSeatsForSession(dto);
  }
}
