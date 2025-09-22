// Environment configuration with fallbacks
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005',
} as const;
