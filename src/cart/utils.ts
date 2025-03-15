import { Cookie } from "undici";

export function formatCookies(cookies: Cookie[]): string {
  return cookies.map((c) => c.name + '=' + c.value).join('; ');
}
