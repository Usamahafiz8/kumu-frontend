// DRY API Utilities
import { API_ENDPOINTS } from '@/config/api';

// Types
type ApiData = Record<string, unknown>;

// DRY HTTP Methods
export const api = {
  get: (url: string, token?: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  post: (url: string, data: ApiData, token?: string) => fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  
  put: (url: string, data: ApiData, token?: string) => fetch(url, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  
  delete: (url: string, token?: string) => fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
};

// DRY Response Handler
export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// DRY API Calls
export const apiCalls = {
  // Admin
  adminLogin: (data: ApiData) => api.post(API_ENDPOINTS.ADMIN_LOGIN, data),
  getUsers: (token: string) => api.get(API_ENDPOINTS.ADMIN_USERS, token),
  getInfluencers: (token: string) => api.get(API_ENDPOINTS.ADMIN_INFLUENCERS, token),
  getWithdrawals: (token: string) => api.get(API_ENDPOINTS.ADMIN_WITHDRAWALS, token),
  
  // Promo codes
  getPromoCodes: (token: string) => api.get(API_ENDPOINTS.PROMO_CODES, token),
  createPromoCode: (data: ApiData, token: string) => api.post(API_ENDPOINTS.PROMO_CODES, data, token),
  
  // Influencer
  influencerLogin: (data: ApiData) => api.post(API_ENDPOINTS.INFLUENCER_LOGIN, data),
  influencerRegister: (data: ApiData) => api.post(API_ENDPOINTS.INFLUENCER_REGISTER, data),
  getInfluencerProfile: (token: string) => api.get(API_ENDPOINTS.INFLUENCER_PROFILE, token),
  getInfluencerCommissions: (token: string) => api.get(API_ENDPOINTS.INFLUENCER_COMMISSIONS, token),
  getInfluencerWithdrawals: (token: string) => api.get(API_ENDPOINTS.INFLUENCER_WITHDRAWALS, token),
  getInfluencerPromoCodes: (token: string) => api.get(API_ENDPOINTS.INFLUENCER_PROMO_CODES, token),
  requestWithdrawal: (data: ApiData, token: string) => api.post(API_ENDPOINTS.INFLUENCER_WITHDRAWALS, data, token),
};
