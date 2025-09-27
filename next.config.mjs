import { generateCSP } from './lib/csp.js'
import ignoreLoader from 'ignore-loader'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    reactCompiler: false,
  },
  allowedDevOrigins: [
    '127.0.0.1:5000',
    'localhost:5000',
    '*.replit.dev',
  ],
  webpack: (config, { isServer }) => {
    // Exclude hardhat config and blockchain-related files from the build
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push({
        'hardhat': 'commonjs hardhat',
        './hardhat.config.ts': 'commonjs ./hardhat.config.ts',
        './hardhat.config.js': 'commonjs ./hardhat.config.js',
      })
    }
    
    // Ignore hardhat-related files during compilation
    config.module.rules.push({
      test: /hardhat\.config\.(ts|js)$/,
      use: ignoreLoader
    })
    
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? generateCSP()
              : `${generateCSP()}; report-uri /api/security/csp-report`,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
