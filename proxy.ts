import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip English-only trees (/blog, /tools, /changelog), api, Next internals
  // and any path with a file extension (sitemap.xml, robots.txt, images, ...).
  matcher: ["/((?!api|blog|tools|changelog|_next|_vercel|.*\\..*).*)"],
};
