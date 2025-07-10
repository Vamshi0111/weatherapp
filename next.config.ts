import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/weatherapp' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/weatherapp' : '',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_CUSTOM_IMAGE_BASE_PATH: process.env.NODE_ENV === 'production' ? '/weatherapp' : '',
    NEXT_PUBLIC_BASE_PATH_CITIES: process.env.NODE_ENV === 'production' ? '/weatherapp' : '',
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/weatherapp' : ''
  },
}
export default nextConfig;