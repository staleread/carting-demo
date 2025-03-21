import { PrimaryMarketName } from '../unions/primary-market-name.union';
import { PrimaryMarketInfo } from '../interfaces/primary-market-info.interface';

export const primaryMarkets: Record<PrimaryMarketName, PrimaryMarketInfo> = {
  phillyorch: {
    platform: 'syos',
    ticketingEndpoint: 'https://my.ensembleartsphilly.org/proxy',
    cartUrl: 'https://my.ensembleartsphilly.org/booking/basket',
  },
  nyballet: {
    platform: 'syos',
    ticketingEndpoint: 'https://tickets.nycballet.com/proxy',
    cartUrl: 'https://tickets.nycballet.com/booking/basket',
  },
  phillipscenter: {
    platform: 'syos',
    ticketingEndpoint: 'https://tickets.drphillipscenter.org/proxy',
    cartUrl: 'https://tickets.drphillipscenter.org/booking/basket',
  },
  desymphony: {
    platform: 'syos',
    ticketingEndpoint: 'https://tickets.dso.org/proxy',
    cartUrl: 'https://tickets.dso.org/booking/basket',
  },
  bosymphony: {
    platform: 'syos',
    ticketingEndpoint: 'https://secure.bso.org/proxy',
    cartUrl: '',
  },
  rtc: {
    platform: 'syos',
    ticketingEndpoint: 'https://tickets.roundabouttheatre.org/proxy',
    cartUrl: '',
  },
  nyphil: {
    platform: 'syos',
    ticketingEndpoint: 'https://my.nyphil.org/en/proxy',
    cartUrl: '',
  },
  ford: {
    platform: 'syos2',
    ticketingEndpoint: 'https://my.theford.com/en/rest-proxy',
    cartUrl: '',
  },
  laphil: {
    platform: 'syos2',
    ticketingEndpoint: 'https://my.laphil.com/en/rest-proxy',
    cartUrl: '',
  },
  hollywoodbowl: {
    platform: 'syos2',
    ticketingEndpoint: 'https://my.hollywoodbowl.com/en/rest-proxy',
    cartUrl: '',
  },
};
