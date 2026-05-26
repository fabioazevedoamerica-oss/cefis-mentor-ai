/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cefis.com.br" },
      { protocol: "https", hostname: "*.cefis.com.br" },
      { protocol: "https", hostname: "cdn.cefis.com.br" },
      { protocol: "https", hostname: "cdn2.cefis.com.br" },
      { protocol: "https", hostname: "api-v3.cefis.com.br" },
      { protocol: "https", hostname: "s3.cefis.cloud" },
      { protocol: "https", hostname: "cdn.cefis.cloud" },
      { protocol: "https", hostname: "*.cefis.cloud" },
    ],
  },
};

export default nextConfig;
