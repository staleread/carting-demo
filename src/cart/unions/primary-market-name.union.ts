export const PRIMARY_MARKET_NAMES = [
  'phillyorch',
  'nyballet',
  'phillipscenter',
  'desymphony',
  'bosymphony',
  'rtc',
  'nyphil',
  'ford',
  'laphil',
  'hollywoodbowl',
] as const;

export type PrimaryMarketName = (typeof PRIMARY_MARKET_NAMES)[number];
