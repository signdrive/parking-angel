declare module 'next/config' {
  interface NextConfig {
    experimental?: {
      optimizePackageImports?: string[]
      optimizeCss?: boolean
      swcMinify?: boolean
      optimizeFonts?: boolean
    }
    poweredByHeader?: boolean
    generateEtags?: boolean
    compress?: boolean
    assetPrefix?: string
    webpack?: (config: any, context: { dev: boolean; isServer: boolean }) => any
  }
}
