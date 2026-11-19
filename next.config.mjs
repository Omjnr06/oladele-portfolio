/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.0.0.163','192.168.31.156'],
  env: {
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
    NEXT_PUBLIC_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
  },
};

export default nextConfig;
