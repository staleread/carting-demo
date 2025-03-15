import { Module } from '@nestjs/common';
import { SyosApiClientService } from './primary-api-clients/syos-api-client.service';
import { CartController } from './cart.controller';

@Module({
  controllers: [CartController],
  providers: [SyosApiClientService],
})
export class CartModule {}
