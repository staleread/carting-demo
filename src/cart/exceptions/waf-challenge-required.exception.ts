import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class WafChallengeRequiredException extends HttpException {
  constructor(options?: HttpExceptionOptions) {
    super(
      'The server requested a challenge completion',
      HttpStatus.FORBIDDEN,
      options,
    );
  }
}
