import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class CdnCannotProcessRequestException extends HttpException {
  constructor(cdnName?: string, options?: HttpExceptionOptions) {
    super(
      `${cdnName ?? 'CDN'} cannot process the request`,
      HttpStatus.BAD_REQUEST,
      options,
    );
  }
}
