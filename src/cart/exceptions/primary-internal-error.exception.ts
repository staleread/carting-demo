import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { PrimaryMarketPlatform } from '../unions/primary-market-platform.union';

export class PrimaryInternalErrorException extends HttpException {
  constructor(
    primaryPlatform?: PrimaryMarketPlatform,
    options?: HttpExceptionOptions,
  ) {
    super(
      `${primaryPlatform ?? 'Primary platform'}'s internal server error occured`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      options,
    );
  }
}
