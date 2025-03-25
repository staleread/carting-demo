import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class ApiBreakingChangeException extends HttpException {
  constructor(options?: HttpExceptionOptions) {
    super(
      'The API response schema contains some breaking changes',
      HttpStatus.BAD_GATEWAY,
      options,
    );
  }
}
