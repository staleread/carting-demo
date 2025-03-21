import { ModuleRef } from '@nestjs/core';
import { PrimaryMarketPlatform } from './unions/primary-market-platform.union';
import { CartService } from './interfaces/cart-service.interface';
import { Syos2CartService } from './cart-services/syos2-cart.service';
import { SyosCartService } from './cart-services/syos-cart.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartServiceFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  public getCartService(primaryPlatform: PrimaryMarketPlatform): CartService {
    switch (primaryPlatform) {
      case 'syos':
        return this.moduleRef.get(SyosCartService);
      case 'syos2':
        return this.moduleRef.get(Syos2CartService);
    }
  }
}
