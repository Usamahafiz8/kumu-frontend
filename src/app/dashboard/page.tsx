'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { 
  Users, 
  Tag, 
  TrendingUp, 
  Activity,
  Eye,
  UserCheck,
  BarChart3,
  LogOut,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Banknote,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
// Advanced components temporarily removed for stability

// Types
interface User {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}


interface PromoCode {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  usedCount: number;
  maxUses?: number;
  status: 'active' | 'inactive' | 'expired';
  influencerName?: string;
  createdAt: string;
  expiresAt?: string;
}

interface WithdrawalRequest {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerEmail: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankAccount: string;
  bankName: string;
  accountHolderName: string;
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  stripeTransferId?: string;
}

interface PendingInfluencer {
  id: string;
  name: string;
  email: string;
  socialHandle?: string;
  bankAccount?: string;
  bankName?: string;
  accountHolderName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  totalPromoUses: number;
  totalInfluencers: number;
  pendingInfluencers: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  totalWithdrawalAmount: number;
}

// Utility functions
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();
const formatDateTime = (dateString: string): string => new Date(dateString).toLocaleString();
const getInitials = (text: string): string => text.charAt(0).toUpperCase();

// Status badge component
const StatusBadge = ({ status, type }: { status: string; type: 'user' | 'subscription' | 'promo' }) => {
  const getBadgeClass = () => {
    if (type === 'user') {
      return status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (type === 'promo') {
      return status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
             status === 'inactive' ? 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass()}`}>
      {status}
    </span>
  );
};

// Stats card component
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  changeType,
  color,
  subtitle 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
  subtitle?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {change && (
        <div className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-emerald-600' : 
          changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {change}
        </div>
      )}
    </div>
  </div>
);

// Modern table component
const DataTable = <T,>({ 
  headers, 
  data, 
  renderRow,
  loading = false,
  emptyMessage = "No data available"
}: { 
  headers: string[]; 
  data: T[]; 
  renderRow: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Search and filter component
const SearchFilter = ({ 
  searchValue, 
  onSearchChange, 
  placeholder = "Search...",
  showFilters = false,
  onFilterClick 
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
}) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    {showFilters && (
      <button
        onClick={onFilterClick}
        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </button>
    )}
  </div>
);

// Notification interface removed for stability

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [pendingInfluencers, setPendingInfluencers] = useState<PendingInfluencer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showInfluencerModal, setShowInfluencerModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<PendingInfluencer | null>(null);
  // Advanced features temporarily disabled
  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    maxUses: 100,
    influencerName: '',
    influencerId: '',
    commissionPercentage: 10, // Default 10% commission
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAllData(token);
    
    // Sample notifications removed for stability
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData(token);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async (token: string) => {
    try {
      const [usersRes, promoCodesRes, withdrawalsRes, pendingInfluencersRes] = await Promise.all([
        fetch(API_ENDPOINTS.ADMIN_USERS, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(API_ENDPOINTS.PROMO_CODES, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(API_ENDPOINTS.ADMIN_WITHDRAWALS, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ json: () => Promise.resolve([]) })),
        fetch(`${API_ENDPOINTS.ADMIN_INFLUENCERS || 'http://localhost:3005/admin/influencers'}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch((error) => {
          console.error('Error fetching influencers:', error);
          return { json: () => Promise.resolve([]) };
        })
      ]);

      const usersData = await usersRes.json();
      const promoCodesData = await promoCodesRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const pendingInfluencersData = await pendingInfluencersRes.json();

      console.log('Fetched data:', {
        users: usersData,
        promoCodes: promoCodesData,
        withdrawals: withdrawalsData,
        pendingInfluencers: pendingInfluencersData
      });
      
      // Debug influencers specifically
      console.log('All influencers:', pendingInfluencersData);
      console.log('Approved influencers:', pendingInfluencersData?.filter((inf: any) => inf.status === 'approved'));
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPromoCodes(Array.isArray(promoCodesData) ? promoCodesData : []);
      setWithdrawalRequests(Array.isArray(withdrawalsData) ? withdrawalsData : []);
      setPendingInfluencers(Array.isArray(pendingInfluencersData) ? pendingInfluencersData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Set fallback empty arrays on error
      setUsers([]);
      setPromoCodes([]);
      setWithdrawalRequests([]);
      setPendingInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.PROMO_CODES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promoForm),
      });

      if (response.ok) {
        const newCode = await response.json();
        setPromoCodes([newCode, ...promoCodes]);
        setShowCreatePromo(false);
        setPromoForm({
          code: '',
          name: '',
          type: 'percentage',
          value: 0,
          maxUses: 100,
          influencerName: '',
          influencerId: '',
          commissionPercentage: 10,
        });
        alert('✅ Promo code created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error creating promo code:', err);
      alert('Error creating promo code');
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PROMO_CODES}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPromoCodes(promoCodes.filter(code => code.id !== id));
        alert('✅ Promo code deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting promo code:', err);
      alert('Error deleting promo code');
    }
  };

  const approveWithdrawal = async (id: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal request?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_WITHDRAWALS}/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setWithdrawalRequests(withdrawalRequests.map(req => 
          req.id === id ? updatedRequest : req
        ));
        alert('✅ Withdrawal request approved!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      alert('Error approving withdrawal');
    }
  };

  const rejectWithdrawal = async (id: string, reason: string) => {
    if (!confirm('Are you sure you want to reject this withdrawal request?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_WITHDRAWALS}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setWithdrawalRequests(withdrawalRequests.map(req => 
          req.id === id ? updatedRequest : req
        ));
        alert('✅ Withdrawal request rejected!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
      alert('Error rejecting withdrawal');
    }
  };

  const processWithdrawal = async (id: string) => {
    if (!confirm('Are you sure you want to process this withdrawal payment via Stripe?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_WITHDRAWALS}/${id}/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setWithdrawalRequests(withdrawalRequests.map(req => 
          req.id === id ? updatedRequest : req
        ));
        alert('✅ Withdrawal payment processed successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      alert('Error processing withdrawal');
    }
  };

  const approveInfluencer = async (id: string) => {
    if (!confirm('Are you sure you want to approve this influencer?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_INFLUENCERS || 'http://localhost:3005/admin/influencers'}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        setPendingInfluencers(pendingInfluencers.filter(inf => inf.id !== id));
        alert('✅ Influencer approved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error approving influencer:', err);
      alert('Error approving influencer');
    }
  };

  const rejectInfluencer = async (id: string) => {
    if (!confirm('Are you sure you want to reject this influencer?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_INFLUENCERS || 'http://localhost:3005/admin/influencers'}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setPendingInfluencers(pendingInfluencers.filter(inf => inf.id !== id));
        alert('✅ Influencer rejected successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error rejecting influencer:', err);
      alert('Error rejecting influencer');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  const refreshData = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setLoading(true);
      fetchAllData(token);
    }
  };

  // Advanced handlers temporarily removed for stability

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive stats
  const safeWithdrawalRequests = Array.isArray(withdrawalRequests) ? withdrawalRequests : [];
  const safePendingInfluencers = Array.isArray(pendingInfluencers) ? pendingInfluencers : [];
  const stats: Stats = {
    totalUsers: users.length,
    totalPromoCodes: promoCodes.length,
    activePromoCodes: promoCodes.filter(code => code.status === 'active').length,
    totalPromoUses: promoCodes.reduce((sum, code) => sum + code.usedCount, 0),
    totalInfluencers: new Set(promoCodes.filter(code => code.influencerName).map(code => code.influencerName)).size,
    pendingInfluencers: safePendingInfluencers.length,
    pendingWithdrawals: safeWithdrawalRequests.filter(req => req.status === 'pending').length,
    totalWithdrawals: safeWithdrawalRequests.length,
    totalWithdrawalAmount: safeWithdrawalRequests.reduce((sum, req) => sum + req.amount, 0),
  };

  // Filter data based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const filteredPromoCodes = promoCodes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (code.influencerName && code.influencerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: `Users (${stats.totalUsers})`, icon: Users },
    { id: 'promocodes', label: `Promo Codes (${stats.totalPromoCodes})`, icon: Tag },
    { id: 'influencers', label: `Influencers (${stats.totalInfluencers})`, icon: UserCheck },
    { id: 'influencer-approvals', label: `Pending Approvals (${stats.pendingInfluencers})`, icon: UserCheck },
    { id: 'withdrawals', label: `Withdrawals (${stats.pendingWithdrawals})`, icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kumu Admin</h1>
                <p className="text-sm text-gray-600">Professional coaching platform management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* NotificationSystem component temporarily removed */}
              <button
                onClick={refreshData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
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
        {/* Modern Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                title="Total Users"
                value={stats.totalUsers}
                change="+12%"
                changeType="positive"
                color="bg-blue-100"
                subtitle="Registered users"
              />

              <StatsCard
                icon={<Tag className="w-6 h-6 text-emerald-600" />}
                title="Promo Codes"
                value={stats.totalPromoCodes}
                change="+8%"
                changeType="positive"
                color="bg-emerald-100"
                subtitle={`${stats.activePromoCodes} active`}
              />

              <StatsCard
                icon={<Activity className="w-6 h-6 text-purple-600" />}
                title="Promo Uses"
                value={stats.totalPromoUses}
                change="+15%"
                changeType="positive"
                color="bg-purple-100"
                subtitle="Total redemptions"
              />

              <StatsCard
                icon={<UserCheck className="w-6 h-6 text-orange-600" />}
                title="Influencers"
                value={stats.totalInfluencers}
                change="+2.1%"
                changeType="positive"
                color="bg-orange-100"
                subtitle="Active partners"
              />
            </div>


            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(user.email)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Promo Codes</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {promoCodes
                      .sort((a, b) => b.usedCount - a.usedCount)
                      .slice(0, 5)
                      .map((code) => (
                        <div key={code.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{code.code}</p>
                            <p className="text-xs text-gray-500">{code.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{code.usedCount} uses</p>
                            <p className="text-xs text-gray-500">
                              {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Charts component temporarily removed */}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* BulkOperations component temporarily removed */}

            <div className="flex items-center space-x-4 mb-6">
              <SearchFilter
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search users by email or role..."
                showFilters={true}
              />
              {/* AdvancedFilters component temporarily removed */}
            </div>

            <DataTable
              headers={['User', 'Role', 'Joined', 'Actions']}
              data={filteredUsers}
              loading={loading}
              renderRow={(user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(user.email)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        )}


        {/* Promo Codes Tab */}
        {activeTab === 'promocodes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Promo Code Management</h2>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowCreatePromo(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Code
                </button>
              </div>
            </div>

            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search promo codes by code, name, or influencer..."
              showFilters={true}
            />

            <DataTable
              headers={['Code', 'Name', 'Type', 'Value', 'Uses', 'Status', 'Influencer', 'Created', 'Actions']}
              data={filteredPromoCodes}
              loading={loading}
              renderRow={(code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {code.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{code.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.usedCount} / {code.maxUses || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={code.status} type="promo" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.influencerName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(code.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deletePromoCode(code.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* Influencers Tab */}
        {activeTab === 'influencers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Influencer Management</h2>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            <DataTable
              headers={['Influencer', 'Codes', 'Total Uses', 'Performance', 'Revenue', 'Actions']}
              data={Array.from(new Set(promoCodes.filter(code => code.influencerName).map(code => code.influencerName)))
                .map(influencerName => {
                  const influencerCodes = promoCodes.filter(code => code.influencerName === influencerName);
                  const totalUses = influencerCodes.reduce((sum, code) => sum + code.usedCount, 0);
                  const estimatedRevenue = totalUses * 50; // Assuming $50 average order value
                  return { influencerName, codes: influencerCodes.length, totalUses, estimatedRevenue };
                })}
              loading={loading}
              renderRow={(influencer) => {
                const performance = influencer.totalUses >= 10 ? 'Top Performer' : 
                                  influencer.totalUses >= 5 ? 'Good' : 'Needs Improvement';
                return (
                  <tr key={influencer.influencerName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(influencer.influencerName || 'Unknown')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{influencer.influencerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{influencer.codes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{influencer.totalUses}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        performance === 'Top Performer' ? 'bg-emerald-100 text-emerald-800' :
                        performance === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {performance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(influencer.estimatedRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }}
            />
          </div>
        )}

        {/* Influencer Approvals Tab */}
        {activeTab === 'influencer-approvals' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Influencer Approvals</h2>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Approval Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingInfluencers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search influencers by name or email..."
              showFilters={true}
            />

            <DataTable
              headers={['Influencer', 'Social Handle', 'Banking Info', 'Status', 'Applied', 'Actions']}
              data={safePendingInfluencers.filter(inf => 
                inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inf.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inf.socialHandle && inf.socialHandle.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              loading={loading}
              renderRow={(influencer) => (
                <tr key={influencer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(influencer.name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{influencer.name}</div>
                        <div className="text-sm text-gray-500">{influencer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {influencer.socialHandle || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{influencer.bankName || 'Not provided'}</div>
                      <div className="text-gray-500">{influencer.bankAccount || '-'}</div>
                      <div className="text-gray-500">{influencer.accountHolderName || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {influencer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(influencer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedInfluencer(influencer);
                          setShowInfluencerModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => approveInfluencer(influencer.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => rejectInfluencer(influencer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Withdrawal Management</h2>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Withdrawal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {safeWithdrawalRequests.filter(req => req.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Banknote className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalWithdrawalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalWithdrawals}</p>
                  </div>
                </div>
              </div>
            </div>

            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search withdrawals by influencer name or amount..."
              showFilters={true}
            />

            <DataTable
              headers={['Influencer', 'Amount', 'Bank Details', 'Status', 'Requested', 'Actions']}
              data={safeWithdrawalRequests.filter(req => 
                req.influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.influencerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.amount.toString().includes(searchTerm)
              )}
              loading={loading}
              renderRow={(request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(request.influencerName)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.influencerName}</div>
                        <div className="text-sm text-gray-500">{request.influencerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(request.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{request.bankName}</div>
                      <div className="text-gray-500">{request.bankAccount}</div>
                      <div className="text-gray-500">{request.accountHolderName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status}
                    </span>
                    {request.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.requestedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => approveWithdrawal(request.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) rejectWithdrawal(request.id, reason);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button 
                          onClick={() => processWithdrawal(request.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Process Payment"
                        >
                          <Banknote className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedWithdrawal(request);
                          setShowWithdrawalModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* Create Promo Code Modal */}
        {showCreatePromo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Create Promo Code</h3>
                  <button
                    onClick={() => setShowCreatePromo(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={createPromoCode} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({...promoForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SUMMER20"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={promoForm.name}
                    onChange={(e) => setPromoForm({...promoForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Summer Sale 20% Off"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={promoForm.type}
                      onChange={(e) => setPromoForm({...promoForm, type: e.target.value as 'percentage' | 'fixed_amount'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="number"
                      value={promoForm.value}
                      onChange={(e) => setPromoForm({...promoForm, value: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={promoForm.type === 'percentage' ? '20' : '10'}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={promoForm.maxUses}
                    onChange={(e) => setPromoForm({...promoForm, maxUses: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Influencer *</label>
                  <select
                    value={promoForm.influencerId}
                    onChange={(e) => {
                      const selectedInfluencer = pendingInfluencers.find(inf => inf.id === e.target.value);
                      setPromoForm({
                        ...promoForm, 
                        influencerId: e.target.value,
                        influencerName: selectedInfluencer?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an influencer</option>
                    {pendingInfluencers.filter(inf => inf.status === 'approved').map(influencer => (
                      <option key={influencer.id} value={influencer.id}>
                        {influencer.name} ({influencer.email})
                      </option>
                    ))}
                    {pendingInfluencers.length === 0 && (
                      <option disabled>No approved influencers found</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={promoForm.commissionPercentage}
                    onChange={(e) => setPromoForm({...promoForm, commissionPercentage: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of discount amount that goes to influencer</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePromo(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdrawal Details Modal */}
        {showWithdrawalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Withdrawal Details</h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Influencer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Influencer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.influencerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.influencerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Withdrawal Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedWithdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedWithdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedWithdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Requested</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedWithdrawal.requestedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Processed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedWithdrawal.processedAt ? formatDate(selectedWithdrawal.processedAt) : 'Not processed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Bank Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.bankAccount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Account Holder</p>
                      <p className="text-sm font-medium text-gray-900">{selectedWithdrawal.accountHolderName}</p>
                    </div>
                  </div>
                </div>

                {/* Stripe Transfer Info */}
                {selectedWithdrawal.stripeTransferId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Stripe Transfer</h4>
                    <p className="text-sm text-blue-800">Transfer ID: {selectedWithdrawal.stripeTransferId}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedWithdrawal.rejectionReason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-sm text-red-800">{selectedWithdrawal.rejectionReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedWithdrawal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          approveWithdrawal(selectedWithdrawal.id);
                          setShowWithdrawalModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) {
                            rejectWithdrawal(selectedWithdrawal.id, reason);
                            setShowWithdrawalModal(false);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedWithdrawal.status === 'approved' && (
                    <button
                      onClick={() => {
                        processWithdrawal(selectedWithdrawal.id);
                        setShowWithdrawalModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Process Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Influencer Details Modal */}
        {showInfluencerModal && selectedInfluencer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Influencer Details</h3>
                  <button
                    onClick={() => setShowInfluencerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Social Handle</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.socialHandle || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {selectedInfluencer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Banking Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.bankName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.bankAccount || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Account Holder</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.accountHolderName || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Application Date */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Application Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedInfluencer.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Application ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInfluencer.id}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowInfluencerModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      rejectInfluencer(selectedInfluencer.id);
                      setShowInfluencerModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveInfluencer(selectedInfluencer.id);
                      setShowInfluencerModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}