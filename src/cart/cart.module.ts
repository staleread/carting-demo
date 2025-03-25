import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartGatewayService } from './cart-gateway.service';
import { CartServiceFactory } from './cart-service.factory';
import { SyosCartService } from './cart-services/syos-cart.service';
import { Syos2CartService } from './cart-services/syos2-cart.service';
import { AppConfigModule } from 'src/config/app-config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [CartController],
  providers: [
    CartGatewayService,
    CartServiceFactory,
    SyosCartService,
    Syos2CartService,
  ],
})
export class CartModule {}
