import { PrimaryMarketPlatform } from '../unions/primary-market-platform.union';

export interface PrimaryMarketInfo {
  platform: PrimaryMarketPlatform;
  ticketingEndpoint: string;
  cartUrl: string;
}
