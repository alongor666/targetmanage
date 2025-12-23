/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/targetmanage' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/targetmanage' : '',
  webpack: (config, { isServer }) => {
    // 在服务器端打包时不排除fs模块
    if (!isServer) {
      // 在客户端打包时排除Node.js内置模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};
export default nextConfig;
