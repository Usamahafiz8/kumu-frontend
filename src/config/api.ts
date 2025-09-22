import { env } from './env';

// API Configuration with validation
export const API_BASE_URL = env.API_BASE_URL;

// Validate API_BASE_URL
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
  console.error('❌ API_BASE_URL is not properly configured!');
  console.error('Please set NEXT_PUBLIC_API_BASE_URL environment variable');
}

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API Configuration Debug:', {
    API_BASE_URL,
    env: env.API_BASE_URL,
    isValid: !!(API_BASE_URL && API_BASE_URL !== 'undefined')
  });
}

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/admin/subscriptions`,
  ADMIN_INFLUENCERS: `${API_BASE_URL}/admin/influencers`,
  ADMIN_WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
  
  // Promo codes
  PROMO_CODES: `${API_BASE_URL}/promo-codes`,
  
  // Influencer endpoints
  INFLUENCER_LOGIN: `${API_BASE_URL}/influencer/login`,
  INFLUENCER_REGISTER: `${API_BASE_URL}/influencer/register`,
  INFLUENCER_PROFILE: `${API_BASE_URL}/influencer/profile`,
  INFLUENCER_COMMISSIONS: `${API_BASE_URL}/influencer/commissions`,
  INFLUENCER_WITHDRAWALS: `${API_BASE_URL}/influencer/withdrawals`,
  INFLUENCER_PROMO_CODES: `${API_BASE_URL}/influencer/promo-codes`,
} as const;
