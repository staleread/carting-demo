import { ConfigService } from '@nestjs/config';
import { Dispatcher, ProxyAgent } from 'undici';
import { ProxyConfig } from './interfaces/proxy.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpConfigService {
  constructor(private readonly configService: ConfigService) {}

  public getDispatcher(): Dispatcher | undefined {
    const proxyConfig = this.configService.get<ProxyConfig>('proxy');

    if (!proxyConfig) {
      return undefined;
    }

    const isProxyConfigComplete = Object.values(proxyConfig).every(
      (v) => v !== undefined,
    );

    if (!isProxyConfigComplete) {
      return undefined;
    }

    const authToken = Buffer.from(
      `${proxyConfig.username}:${proxyConfig.password}`,
    ).toString('base64');

    return new ProxyAgent({
      uri: `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`,
      token: `Basic ${authToken}`,
    });
  }
}
