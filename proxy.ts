import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip English-only trees (/blog, /tools), api, Next internals and any
  // path with a file extension (sitemap.xml, robots.txt, images, ...).
  matcher: ["/((?!api|blog|tools|_next|_vercel|.*\\..*).*)"],
};
