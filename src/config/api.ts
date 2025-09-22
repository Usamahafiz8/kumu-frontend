import { env } from './env';

// API Configuration
export const API_BASE_URL = env.API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/admin/subscriptions`,
  ADMIN_WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
  
  // Promo codes
  PROMO_CODES: `${API_BASE_URL}/promo-codes`,
  
  // Influencer endpoints
  INFLUENCER_LOGIN: `${API_BASE_URL}/influencer/login`,
  INFLUENCER_PROFILE: `${API_BASE_URL}/influencer/profile`,
  INFLUENCER_COMMISSIONS: `${API_BASE_URL}/influencer/commissions`,
  INFLUENCER_WITHDRAWALS: `${API_BASE_URL}/influencer/withdrawals`,
} as const;
