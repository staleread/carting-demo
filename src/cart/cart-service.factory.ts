import { PrimaryMarketName } from './unions/primary-market-name.union';
import { CartService } from './interfaces/cart-service.interface';
import { Injectable } from '@nestjs/common';
import { PhillyorchCartService } from './services/phillyorch-cart-service';

@Injectable()
export class CartServiceFactory {
  public getCartService(primaryMarketName: PrimaryMarketName): CartService {
    switch (primaryMarketName) {
      case 'phillyorch':
        return new PhillyorchCartService();
      case 'nyballet':
      case 'phillipscenter':
      case 'desymphony':
      case 'bosymphony':
      case 'rtc':
      case 'nyphil':
      case 'ford':
      case 'laphil':
      case 'hollywoodbowl':
        throw new Error('Not implemented cart service');
    }
  }
}
