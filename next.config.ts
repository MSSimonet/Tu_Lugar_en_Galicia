import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        // /apps-utiles reemplaza a /guia-llegada (mismo propósito, diseño y datos ampliados).
        source: '/guia-llegada',
        destination: '/apps-utiles',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
