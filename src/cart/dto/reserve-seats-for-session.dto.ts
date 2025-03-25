import { PrimaryMarketInfo } from '../interfaces/primary-market-info.interface';
import { LineItemDto } from './line-item.dto';

export interface ReserveSeatsForSessionDto {
  sessionInfo: {
    id: string;
    cookieHeaderValue: string;
  };
  seatsInfo: {
    performanceId: number;
    lineItems: LineItemDto[];
  };
  primaryMarketInfo: PrimaryMarketInfo;
}
