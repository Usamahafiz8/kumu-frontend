'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumAmount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  status: 'active' | 'inactive' | 'expired';
  influencerName?: string;
  influencerEmail?: string;
  influencerSocialHandle?: string;
  influencerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    minimumAmount: 0,
    maxUses: 100,
    validFrom: '',
    validUntil: '',
    influencerName: '',
    influencerEmail: '',
    influencerSocialHandle: '',
    influencerNotes: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3005/promo-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (err) {
      console.error('Error fetching promo codes:', err);
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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCode = await response.json();
        setPromoCodes([newCode, ...promoCodes]);
        setShowCreateForm(false);
        resetForm();
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

  const updatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3005/promo-codes/${editingCode.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCode = await response.json();
        setPromoCodes(promoCodes.map(code => 
          code.id === editingCode.id ? updatedCode : code
        ));
        setEditingCode(null);
        resetForm();
        alert('✅ Promo code updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error updating promo code:', err);
      alert('Error updating promo code');
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3005/promo-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPromoCodes(promoCodes.filter(code => code.id !== id));
        alert('✅ Promo code deleted successfully!');
      } else {
        alert('Error deleting promo code');
      }
    } catch (err) {
      console.error('Error deleting promo code:', err);
      alert('Error deleting promo code');
    }
  };

  const syncToStripe = async () => {
    setSyncing(true);
    setSyncMessage('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3005/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: 'kumu-coaching-subscription' }),
      });

      if (response.ok) {
        setSyncMessage('✅ Promo codes synced to Stripe successfully!');
      } else {
        setSyncMessage('❌ Failed to sync promo codes to Stripe');
      }
    } catch (err) {
      console.error('Error syncing to Stripe:', err);
      setSyncMessage('❌ Error syncing to Stripe');
    } finally {
      setSyncing(false);
    }
  };

  const createQuickPromoCode = async (code: string, name: string, type: 'percentage' | 'fixed_amount', value: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3005/promo-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          name,
          type,
          value,
          maxUses: 100,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        const newCode = await response.json();
        setPromoCodes([newCode, ...promoCodes]);
        alert(`✅ Promo code "${code}" created successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error creating quick promo code:', err);
      alert('Error creating promo code');
    }
  };

  const testPromoCode = async (code: string) => {
    try {
      const response = await fetch(`http://localhost:3005/promo-codes/validate/${code}?amount=20.99`);
      const result = await response.json();
      
      if (result.valid) {
        alert(`✅ Promo code "${code}" is valid!\nDiscount: $${result.discount.toFixed(2)}\nFinal amount: $${(20.99 - result.discount).toFixed(2)}`);
      } else {
        alert(`❌ Promo code "${code}" is invalid: ${result.error}`);
      }
    } catch (err) {
      console.error('Error testing promo code:', err);
      alert('Error testing promo code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumAmount: 0,
      maxUses: 100,
      validFrom: '',
      validUntil: '',
      influencerName: '',
      influencerEmail: '',
      influencerSocialHandle: '',
      influencerNotes: '',
    });
  };

  const openEditForm = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      name: code.name,
      description: code.description || '',
      type: code.type,
      value: code.value,
      minimumAmount: code.minimumAmount || 0,
      maxUses: code.maxUses || 100,
      validFrom: code.validFrom ? new Date(code.validFrom).toISOString().slice(0, 16) : '',
      validUntil: code.validUntil ? new Date(code.validUntil).toISOString().slice(0, 16) : '',
      influencerName: code.influencerName || '',
      influencerEmail: code.influencerEmail || '',
      influencerSocialHandle: code.influencerSocialHandle || '',
      influencerNotes: code.influencerNotes || '',
    });
    setShowCreateForm(true);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingCode(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promo codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-orange-600">
            <h1 className="text-xl font-bold text-white">Kumu Admin</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
              </svg>
              Dashboard
            </Link>
            
            <Link href="/promo-codes" className="flex items-center px-4 py-2 text-orange-600 bg-orange-50 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              Promo Codes
            </Link>
            
            <Link href="/influencers" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Influencers
            </Link>
            
            <Link href="/users" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              Users
            </Link>
            
            <Link href="/subscriptions" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Subscriptions
            </Link>
          </nav>
          
          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
            <p className="text-gray-600">Manage promotional codes and discounts</p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  + Create New Code
                </button>
                
                <button
                  onClick={() => createQuickPromoCode('QUICK20', 'Quick 20% Off', 'percentage', 20)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Quick: 20% Off
                </button>
                
                <button
                  onClick={() => createQuickPromoCode('SAVE10', 'Save $10', 'fixed_amount', 10)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Quick: $10 Off
                </button>
              </div>
              
              <button
                onClick={syncToStripe}
                disabled={syncing}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync to Stripe'}
              </button>
            </div>
            
            {syncMessage && (
              <div className={`mt-4 p-3 rounded-lg ${syncMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {syncMessage}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Codes</p>
                  <p className="text-2xl font-semibold text-gray-900">{promoCodes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {promoCodes.filter(code => code.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Uses</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {promoCodes.reduce((sum, code) => sum + code.usedCount, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Influencer</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {promoCodes.filter(code => code.influencerName).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Codes Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Promo Codes</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{code.name}</div>
                        {code.description && (
                          <div className="text-sm text-gray-500">{code.description}</div>
                        )}
                      </td>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                          {code.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => testPromoCode(code.code)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Test
                          </button>
                          <button 
                            onClick={() => openEditForm(code)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deletePromoCode(code.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create/Edit Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCode ? 'Edit Promo Code' : 'Create New Promo Code'}
                    </h3>
                    <button
                      onClick={closeForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <form onSubmit={editingCode ? updatePromoCode : createPromoCode} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., SUMMER20"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., Summer Sale 20% Off"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={2}
                      placeholder="Optional description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed_amount'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder={formData.type === 'percentage' ? '20' : '10'}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                      <input
                        type="number"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="100"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                      <input
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                      <input
                        type="datetime-local"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Influencer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Influencer Name</label>
                        <input
                          type="text"
                          value={formData.influencerName}
                          onChange={(e) => setFormData({...formData, influencerName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.influencerEmail}
                          onChange={(e) => setFormData({...formData, influencerEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Social Handle</label>
                        <input
                          type="text"
                          value={formData.influencerSocialHandle}
                          onChange={(e) => setFormData({...formData, influencerSocialHandle: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="@johndoe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={formData.influencerNotes}
                          onChange={(e) => setFormData({...formData, influencerNotes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          rows={2}
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      {editingCode ? 'Update Code' : 'Create Code'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}