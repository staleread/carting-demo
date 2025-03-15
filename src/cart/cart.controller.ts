import { Body, Controller, Post } from '@nestjs/common';
import { SyosApiClientService } from './primary-api-clients/syos-api-client.service';
import { ReserveSeatsDto } from './cart.types';

@Controller()
export class CartController {
  @Post()
  public async addSeatsToCart(@Body() dto: ReserveSeatsDto): Promise<string> {
    const primaryApiClient = new SyosApiClientService(dto.sessionInfo);

    const result = await primaryApiClient.addSeatsToCart(dto.seatsInfo);

    if (result.isOk()) {
      return 'https://my.ensembleartsphilly.org/booking/basket';
    }
    throw result.error;
  }
}
