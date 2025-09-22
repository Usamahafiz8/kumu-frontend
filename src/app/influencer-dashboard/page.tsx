'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  User,
  Settings
} from 'lucide-react';

interface Commission {
  id: string;
  promoCodeId: string;
  promoCode: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  paidAt?: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankAccount: string;
  bankName: string;
  accountHolderName: string;
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

interface InfluencerProfile {
  id: string;
  name: string;
  email: string;
  socialHandle: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalCommissions: number;
  activeCommissions: number;
  bankAccount?: string;
  bankName?: string;
  accountHolderName?: string;
}

interface PromoCode {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  commissionPercentage?: number;
  totalCommissions?: number;
  usedCount?: number;
  maxUses?: number;
  status: string;
  createdAt: string;
}

export default function InfluencerDashboard() {
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccount: '',
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    accountType: 'checking'
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    socialHandle: '',
    bankAccount: '',
    bankName: '',
    accountHolderName: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('influencerToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      // Fetch influencer profile
      const profileRes = await fetch(API_ENDPOINTS.INFLUENCER_PROFILE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          socialHandle: profileData.socialHandle || '',
          bankAccount: profileData.bankAccount || '',
          bankName: profileData.bankName || '',
          accountHolderName: profileData.accountHolderName || ''
        });
      }

      // Fetch commissions
      const commissionsRes = await fetch(API_ENDPOINTS.INFLUENCER_COMMISSIONS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (commissionsRes.ok) {
        const commissionsData = await commissionsRes.json();
        setCommissions(commissionsData);
      }

      // Fetch withdrawal requests
      const withdrawalsRes = await fetch(API_ENDPOINTS.INFLUENCER_WITHDRAWALS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        setWithdrawalRequests(withdrawalsData);
      }

      // Fetch promo codes
      const promoCodesRes = await fetch(API_ENDPOINTS.INFLUENCER_PROMO_CODES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (promoCodesRes.ok) {
        const promoCodesData = await promoCodesRes.json();
        console.log('Fetched promo codes:', promoCodesData);
        setPromoCodes(Array.isArray(promoCodesData) ? promoCodesData : []);
      } else {
        console.error('Failed to fetch promo codes:', promoCodesRes.status);
        setPromoCodes([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateWithdrawalForm = (): boolean => {
    const isValidRouting = validateRoutingNumber(withdrawalForm.routingNumber);
    const isValidAccount = validateAccountNumber(withdrawalForm.bankAccount);
    const isValidBank = validateBankName(withdrawalForm.bankName);
    const isValidName = validateAccountHolderName(withdrawalForm.accountHolderName);
    const isValidAmount = parseFloat(withdrawalForm.amount) > 0 && parseFloat(withdrawalForm.amount) <= (profile?.pendingEarnings || 0);
    
    return isValidRouting && isValidAccount && isValidBank && isValidName && isValidAmount;
  };

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWithdrawalForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }
    
    try {
      const token = localStorage.getItem('influencerToken');
      const response = await fetch(API_ENDPOINTS.INFLUENCER_WITHDRAWALS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalForm),
      });

      if (response.ok) {
        const newRequest = await response.json();
        setWithdrawalRequests([newRequest, ...(Array.isArray(withdrawalRequests) ? withdrawalRequests : [])]);
        setShowWithdrawalModal(false);
        setWithdrawalForm({
          amount: '',
          bankAccount: '',
          bankName: '',
          accountHolderName: '',
          routingNumber: '',
          accountType: 'checking'
        });
        alert('✅ Withdrawal request submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      alert('Error requesting withdrawal');
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('influencerToken');
      const response = await fetch(API_ENDPOINTS.INFLUENCER_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setShowProfileModal(false);
        alert('✅ Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('influencerToken');
    window.location.href = '/login';
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return `$${Number(amount).toFixed(2)}`;
  };

  // Bank account validation functions
  const validateRoutingNumber = (routing: string): boolean => {
    // US routing numbers are 9 digits
    const routingRegex = /^\d{9}$/;
    return routingRegex.test(routing);
  };

  const validateAccountNumber = (account: string): boolean => {
    // Account numbers are typically 4-17 digits
    const accountRegex = /^\d{4,17}$/;
    return accountRegex.test(account);
  };

  const validateBankName = (bankName: string): boolean => {
    // Check against common US bank names
    const validBanks = [
      'chase', 'bank of america', 'wells fargo', 'citibank', 'us bank',
      'pnc', 'capital one', 'td bank', 'regions', 'suntrust',
      'huntington', 'keybank', 'comerica', 'm&t bank', 'bb&t'
    ];
    return validBanks.some(bank => bankName.toLowerCase().includes(bank));
  };

  const validateAccountHolderName = (name: string): boolean => {
    // Name should be at least 2 words (first and last name)
    const nameParts = name.trim().split(' ');
    return nameParts.length >= 2 && nameParts.every(part => part.length >= 2);
  };
  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();

  const getStatusBadge = (status: string, type: 'commission' | 'withdrawal') => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    if (type === 'commission') {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'approved':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'paid':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'approved':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'rejected':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'paid':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Influencer Dashboard</h1>
                <p className="text-sm text-gray-600">Track your commissions and earnings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profile Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.name || 'Influencer'}!</h2>
          <p className="text-gray-600">Here&apos;s your commission overview and earnings summary</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profile?.totalEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profile?.pendingEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profile?.paidEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Commissions</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.activeCommissions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage your earnings and profile</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!profile?.bankAccount}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Request Withdrawal
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Commissions</h3>
            <p className="text-sm text-gray-600">Track your commission earnings from promo codes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {commission.promoCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(commission.status, 'commission')}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(commission.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.paidAt ? formatDate(commission.paidAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Promo Codes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Promo Codes</h3>
            <p className="text-sm text-gray-600">Track your promo codes and commission earnings</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(promoCodes || []).map((promoCode) => (
                  <tr key={promoCode.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {promoCode.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promoCode.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promoCode.type === 'percentage' 
                        ? `${promoCode.value || 0}%` 
                        : formatCurrency(promoCode.value)
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promoCode.commissionPercentage || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promoCode.usedCount || 0} / {promoCode.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(promoCode.totalCommissions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        promoCode.status === 'active' ? 'bg-green-100 text-green-800' :
                        promoCode.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {promoCode.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(promoCodes || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No promo codes assigned to you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h3>
            <p className="text-sm text-gray-600">Track your withdrawal requests and payments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawalRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.bankAccount} ({request.bankName})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(request.status, 'withdrawal')}>
                        {request.status}
                      </span>
                      {request.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.processedAt ? formatDate(request.processedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Request Modal */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={requestWithdrawal} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={profile?.pendingEarnings || 0}
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount to withdraw"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatCurrency(profile?.pendingEarnings || 0)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number *</label>
                  <input
                    type="text"
                    value={withdrawalForm.routingNumber}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, routingNumber: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      withdrawalForm.routingNumber && !validateRoutingNumber(withdrawalForm.routingNumber) 
                        ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9-digit routing number"
                    maxLength={9}
                    required
                  />
                  {withdrawalForm.routingNumber && !validateRoutingNumber(withdrawalForm.routingNumber) && (
                    <p className="text-xs text-red-500 mt-1">Invalid routing number (must be 9 digits)</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={withdrawalForm.bankAccount}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, bankAccount: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      withdrawalForm.bankAccount && !validateAccountNumber(withdrawalForm.bankAccount) 
                        ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="4-17 digit account number"
                    required
                  />
                  {withdrawalForm.bankAccount && !validateAccountNumber(withdrawalForm.bankAccount) && (
                    <p className="text-xs text-red-500 mt-1">Invalid account number (must be 4-17 digits)</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={withdrawalForm.bankName}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, bankName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      withdrawalForm.bankName && !validateBankName(withdrawalForm.bankName) 
                        ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Chase, Bank of America, Wells Fargo"
                    required
                  />
                  {withdrawalForm.bankName && !validateBankName(withdrawalForm.bankName) && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid US bank name</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                  <select
                    value={withdrawalForm.accountType}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, accountType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={withdrawalForm.accountHolderName}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, accountHolderName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      withdrawalForm.accountHolderName && !validateAccountHolderName(withdrawalForm.accountHolderName) 
                        ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="First and Last Name (as it appears on bank account)"
                    required
                  />
                  {withdrawalForm.accountHolderName && !validateAccountHolderName(withdrawalForm.accountHolderName) && (
                    <p className="text-xs text-red-500 mt-1">Please enter your full name (first and last name)</p>
                  )}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>• Bank information will be verified before processing</p>
                        <p>• Withdrawals may take 3-5 business days to process</p>
                        <p>• You will receive email confirmation once processed</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Request Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Update Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={updateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Handle</label>
                  <input
                    type="text"
                    value={profileForm.socialHandle}
                    onChange={(e) => setProfileForm({...profileForm, socialHandle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input
                    type="text"
                    value={profileForm.bankAccount}
                    onChange={(e) => setProfileForm({...profileForm, bankAccount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bank account number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={profileForm.bankName}
                    onChange={(e) => setProfileForm({...profileForm, bankName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={profileForm.accountHolderName}
                    onChange={(e) => setProfileForm({...profileForm, accountHolderName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter account holder name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
