import { Cookie } from 'undici';

export class CookieFormatter {
  public static formatCookies(cookies: Cookie[]): string {
    return cookies.map((c) => c.name + '=' + c.value).join('; ');
  }
}
