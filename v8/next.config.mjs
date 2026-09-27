/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 'postgres' is kept out of the webpack bundle and copied as a real node_modules
  // package into the standalone output instead, so the plain `node scripts/run-migrations.js`
  // script (which isn't part of the Next.js app bundle) can still `require('postgres')`
  // inside the Docker image at container startup.
  serverExternalPackages: ['mysql2', 'postgres'], // Moved from experimental.serverComponentsExternalPackages
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Single-worker compilation — on memory-constrained build hosts (e.g. Chabokan's
    // ~1.7GB build containers), parallel webpack workers have caused the build process
    // to get OOM-killed mid-compile, which surfaces as spurious "Module not found"
    // errors on whatever file was compiling when the worker died. See Dockerfile.
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: '/widget/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/widget-loader.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Optimize build performance
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
