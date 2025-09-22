import { env } from './env';

// DRY API Configuration
const createEndpoint = (path: string) => `${env.API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  // Admin
  ADMIN_LOGIN: createEndpoint('/admin/login'),
  ADMIN_USERS: createEndpoint('/admin/users'),
  ADMIN_SUBSCRIPTIONS: createEndpoint('/admin/subscriptions'),
  ADMIN_INFLUENCERS: createEndpoint('/admin/influencers'),
  ADMIN_WITHDRAWALS: createEndpoint('/admin/withdrawals'),
  
  // Promo codes
  PROMO_CODES: createEndpoint('/promo-codes'),
  
  // Influencer
  INFLUENCER_LOGIN: createEndpoint('/influencer/login'),
  INFLUENCER_REGISTER: createEndpoint('/influencer/register'),
  INFLUENCER_PROFILE: createEndpoint('/influencer/profile'),
  INFLUENCER_COMMISSIONS: createEndpoint('/influencer/commissions'),
  INFLUENCER_WITHDRAWALS: createEndpoint('/influencer/withdrawals'),
  INFLUENCER_PROMO_CODES: createEndpoint('/influencer/promo-codes'),
} as const;
