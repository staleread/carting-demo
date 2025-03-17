export class SessionCookie {
  constructor(
    readonly name: string,
    readonly value: string,
  ) {}

  static toHttpHeaderValue(cookies: SessionCookie[]): string {
    return cookies.map((c) => c.name + '=' + c.value).join('; ');
  }
}
