import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      // placehold.co removido (auditoría 2026-07-25, C3): era el host de la foto
      // de Silvana y de los 3 avatares de testimonios, que pasaron a monogramas
      // locales. Ya no se carga ninguna imagen de terceros fuera de Instagram.
      {
        // CDN de las imágenes del feed de Instagram (subdominio variable, ej. scontent-xxx-1)
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
