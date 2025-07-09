import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Weather_App' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Weather_App/' : '',
  images:{
    unoptimized:true
  },
}
export default nextConfig;