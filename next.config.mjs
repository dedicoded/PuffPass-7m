// Force complete clean build - no Stripe code allowed
import { generateCSP } from './lib/csp.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds to avoid config conflicts
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
  generateBuildId: async () => {
    return 'puffpass-clean-build-' + Date.now() + '-' + Math.random().toString(36).substring(7)
  },
  distDir: '.next-clean-' + Date.now(),
  allowedDevOrigins: [
    '127.0.0.1:5000',
    'localhost:5000',
    '*.replit.dev',
  ],
  webpack: (config, { isServer }) => {
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push(
        'hardhat',
        './hardhat.config.ts',
        './hardhat.config.js',
        // Aggressively exclude all Stripe packages
        'stripe',
        '@stripe/stripe-js',
        '@stripe/react-stripe-js',
        // Block any Stripe API routes from being built
        /^.*\/api\/stripe\//,
        /stripe/,
      )
    }
    
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Allow crypto for Web3 but use browser-compatible version
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        // Block server-only modules
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        // Block problematic crypto modules that cause MIME issues
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        '@stablelib/random': false,
        '@stablelib/x25519': false,
        '@stablelib/chacha20poly1305': false,
        '@stablelib/hkdf': false,
        '@stablelib/sha256': false,
        '@noble/curves': false,
        '@noble/hashes': false,
        'node:crypto': false,
        'node:buffer': false,
        'node:process': false,
        'node:util': false,
        'stripe': false,
        '@stripe/stripe-js': false,
        '@stripe/react-stripe-js': false,
      }
      
      config.resolve.alias = {
        ...config.resolve.alias,
        '@stablelib/random': false,
        '@stablelib/x25519': false,
        '@stablelib/chacha20poly1305': false,
        '@stablelib/hkdf': false,
        '@stablelib/sha256': false,
        'stripe': false,
        '@stripe/stripe-js': false,
        '@stripe/react-stripe-js': false,
      }
    }
    
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push(
      {
        test: /node_modules\/(stripe|@stripe)/,
        loader: 'ignore-loader'
      },
      {
        test: /\/api\/stripe\//,
        loader: 'ignore-loader'
      }
    )
    
    if (isServer) {
      config.externals.push({
        'crypto': 'crypto'
      })
    }
    
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
