import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { HttpConfigService } from './http-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [HttpConfigService],
  exports: [HttpConfigService],
})
export class AppConfigModule {}
