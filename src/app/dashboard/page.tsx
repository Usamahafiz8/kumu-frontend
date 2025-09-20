'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface Subscription {
  id: string;
  status: string;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
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
}

interface Stats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  totalPromoUses: number;
  totalInfluencers: number;
}

// Utility functions
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();
const getInitials = (text: string): string => text.charAt(0).toUpperCase();

// Status badge component
const StatusBadge = ({ status, type }: { status: string; type: 'user' | 'subscription' | 'promo' }) => {
  const getBadgeClass = () => {
    if (type === 'user') {
      return status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    if (type === 'subscription') {
      return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    }
    if (type === 'promo') {
      return status === 'active' ? 'bg-green-100 text-green-800' :
             status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass()}`}>
      {status}
    </span>
  );
};

// Stats card component
const StatsCard = ({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className={`p-3 ${color} rounded-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Table component
const DataTable = <T,>({ 
  headers, 
  data, 
  renderRow 
}: { 
  headers: string[]; 
  data: T[]; 
  renderRow: (item: T, index: number) => React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    maxUses: 100,
    influencerName: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAllData(token);
  }, []);

  const fetchAllData = async (token: string) => {
    try {
      const [usersRes, subscriptionsRes, promoCodesRes] = await Promise.all([
        fetch('http://localhost:3005/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3005/admin/subscriptions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3005/promo-codes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const subscriptionsData = await subscriptionsRes.json();
      const promoCodesData = await promoCodesRes.json();

      setUsers(usersData);
      setSubscriptions(subscriptionsData);
      setPromoCodes(promoCodesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3005/promo-codes', {
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
      const response = await fetch(`http://localhost:3005/promo-codes/${id}`, {
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

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats: Stats = {
    totalUsers: users.length,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(sub => sub.status === 'ACTIVE').length,
    totalRevenue: subscriptions.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0),
    totalPromoCodes: promoCodes.length,
    activePromoCodes: promoCodes.filter(code => code.status === 'active').length,
    totalPromoUses: promoCodes.reduce((sum, code) => sum + code.usedCount, 0),
    totalInfluencers: new Set(promoCodes.filter(code => code.influencerName).map(code => code.influencerName)).size,
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: `Users (${stats.totalUsers})` },
    { id: 'subscriptions', label: `Subscriptions (${stats.totalSubscriptions})` },
    { id: 'promocodes', label: `Promo Codes (${stats.totalPromoCodes})` },
    { id: 'influencers', label: `Influencers (${stats.totalInfluencers})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Kumu Admin</h1>
              <p className="text-sm text-gray-600">Complete management dashboard</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                }
                title="Total Users"
                value={stats.totalUsers}
                color="bg-blue-100"
              />

              <StatsCard
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                title="Active Subscriptions"
                value={stats.activeSubscriptions}
                color="bg-green-100"
              />

              <StatsCard
                icon={
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                }
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                color="bg-purple-100"
              />

              <StatsCard
                icon={
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                }
                title="Promo Uses"
                value={stats.totalPromoUses}
                color="bg-orange-100"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
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

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Promo Codes</h3>
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
                            <p className="text-sm font-medium text-gray-900">{code.usedCount} uses</p>
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
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <DataTable
            headers={['User', 'Role', 'Status', 'Joined']}
            data={users}
            renderRow={(user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {getInitials(user.email)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user.isEmailVerified ? 'Verified' : 'Pending'} type="user" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            )}
          />
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <DataTable
            headers={['ID', 'Status', 'Amount', 'Period', 'Created']}
            data={subscriptions}
            renderRow={(sub) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sub.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={sub.status} type="subscription" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sub.amount)} {sub.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(sub.createdAt)}
                </td>
              </tr>
            )}
          />
        )}

        {/* Promo Codes Tab */}
        {activeTab === 'promocodes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Promo Codes</h3>
              <button
                onClick={() => setShowCreatePromo(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Create Promo Code
              </button>
            </div>

            <DataTable
              headers={['Code', 'Name', 'Type', 'Value', 'Uses', 'Status', 'Actions']}
              data={promoCodes}
              renderRow={(code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deletePromoCode(code.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* Influencers Tab */}
        {activeTab === 'influencers' && (
          <DataTable
            headers={['Influencer', 'Codes', 'Total Uses', 'Performance']}
            data={Array.from(new Set(promoCodes.filter(code => code.influencerName).map(code => code.influencerName)))
              .map(influencerName => {
                const influencerCodes = promoCodes.filter(code => code.influencerName === influencerName);
                const totalUses = influencerCodes.reduce((sum, code) => sum + code.usedCount, 0);
                return { influencerName, codes: influencerCodes.length, totalUses };
              })}
            renderRow={(influencer) => {
              const performance = influencer.totalUses >= 10 ? 'Top Performer' : 
                                influencer.totalUses >= 5 ? 'Good' : 'Needs Improvement';
              return (
                <tr key={influencer.influencerName}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {getInitials(influencer.influencerName || 'Unknown')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{influencer.influencerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{influencer.codes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{influencer.totalUses}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      performance === 'Top Performer' ? 'bg-green-100 text-green-800' :
                      performance === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {performance}
                    </span>
                  </td>
                </tr>
              );
            }}
          />
        )}

        {/* Create Promo Code Modal */}
        {showCreatePromo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Create Promo Code</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Influencer Name</label>
                  <input
                    type="text"
                    value={promoForm.influencerName}
                    onChange={(e) => setPromoForm({...promoForm, influencerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePromo(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  >
                    Create Code
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