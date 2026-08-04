/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Expose canonical origin to the client for Facebook share / OG URLs.
    NEXT_PUBLIC_APP_BASE_URL:
      process.env.NEXT_PUBLIC_APP_BASE_URL || process.env.APP_BASE_URL || "",
    NEXT_PUBLIC_BADGE_IMAGE_BASE_URL:
      process.env.NEXT_PUBLIC_BADGE_IMAGE_BASE_URL ||
      process.env.BADGE_IMAGE_BASE_URL ||
      "",
  },
};

export default nextConfig;
