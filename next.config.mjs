// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
import createNextPWA from "@ducanh2912/next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development" || process.env.DISABLE_PWA === "1",
});

const baseConfig = {
  // REMOVIDO: output: "export"
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withPWA(baseConfig));
