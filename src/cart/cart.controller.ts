import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ReserveSeatsDto, ReserveSeatsDtoSchema } from './dto/reserve-seat.dto';
import { ReserveSeatsResponse } from './responses/reserve-seats.response';
import { CartServiceFactory } from './cart-service.factory';

@Controller()
export class CartController {
  constructor(private readonly cartServiceFactory: CartServiceFactory) {}

  @Post()
  public async addSeatsToCart(
    @Body() dto: ReserveSeatsDto,
  ): Promise<ReserveSeatsResponse> {
    const isValidDto = ReserveSeatsDtoSchema.safeParse(dto).success;

    if (!isValidDto) {
      throw new HttpException(
        "Reservation DTO doesn't follow the schema",
        HttpStatus.BAD_REQUEST,
      );
    }

    const cartService = this.cartServiceFactory.getCartService(
      dto.primaryMarketName,
    );
    const result = await cartService.reserveSeats(dto);

    if (result.isOk()) {
      return result.value;
    }
    throw result.error;
  }
}
