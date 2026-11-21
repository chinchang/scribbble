import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // `pnpm dev` binds to 0.0.0.0. Let phones/other machines on the LAN load
  // the dev server's JS and HMR (dev only; ignored in production).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
};

export default withNextIntl(nextConfig);
