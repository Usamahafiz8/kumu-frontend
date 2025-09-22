// DRY Environment Configuration
const getEnvVar = (key: string, fallback: string) => {
  const value = process.env[key];
  return value || fallback;
};

export const env = {
  API_BASE_URL: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3005'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;
