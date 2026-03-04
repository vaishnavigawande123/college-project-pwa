import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist({
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // remove turbopack: {} — conflicts with --webpack flag
});