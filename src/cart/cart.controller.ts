import { Body, Controller, Post } from '@nestjs/common';
import { CartGatewayService } from './cart-gateway.service';
import { ReserveSeatsForSessionResponse } from './responses/reserve-seats-for-session.response';
import {
  ReserveSeatsForSessionPartialDto,
  ReserveSeatsForSessionPartialDtoSchema,
} from './dto/reserve-seats-for-session-partial.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';

@Controller('/cart')
export class CartController {
  constructor(private readonly cartGatewayService: CartGatewayService) {}

  @Post()
  public async reserveSeatsForSesssion(
    @Body(new ValidationPipe(ReserveSeatsForSessionPartialDtoSchema))
    dto: ReserveSeatsForSessionPartialDto,
  ): Promise<ReserveSeatsForSessionResponse> {
    return await this.cartGatewayService.reserveSeatsForSession(dto);
  }
}
