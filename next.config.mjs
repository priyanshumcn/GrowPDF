/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  experimental: {
    serverActions: { bodySizeLimit: '55mb' }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // pdfjs-dist/legacy/build/pdf.mjs is itself a webpack bundle.
      // When Next.js webpack re-processes it, the inner webpack runtime's
      // Object.defineProperty call fails on the frozen ESM namespace object.
      // Fix: tell webpack NOT to parse pdfjs at all — treat it as a pre-bundled file.
      config.module = config.module || {};
      config.module.noParse = [
        ...(Array.isArray(config.module.noParse) ? config.module.noParse : []),
        /pdfjs-dist/,
      ];
    }
    return config;
  },
};

export default nextConfig;
