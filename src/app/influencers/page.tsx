'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/config/api';

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
  influencerEmail?: string;
  influencerSocialHandle?: string;
  influencerNotes?: string;
  createdAt: string;
}

interface InfluencerStats {
  name: string;
  email: string;
  socialHandle: string;
  totalCodes: number;
  activeCodes: number;
  totalUses: number;
  totalRevenue: number;
  averageDiscount: number;
  topPerformingCode: string;
  conversionRate: number;
  promoCodes: PromoCode[];
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<InfluencerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInfluencerStats();
  }, []);

  const fetchInfluencerStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.PROMO_CODES, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const promoCodes = await response.json();
        const influencerMap = new Map<string, InfluencerStats>();
        
        // Group promo codes by influencer
        promoCodes.forEach((code: PromoCode) => {
          if (code.influencerName) {
            const key = code.influencerName.toLowerCase();
            
            if (!influencerMap.has(key)) {
              influencerMap.set(key, {
                name: code.influencerName,
                email: code.influencerEmail || '',
                socialHandle: code.influencerSocialHandle || '',
                totalCodes: 0,
                activeCodes: 0,
                totalUses: 0,
                totalRevenue: 0,
                averageDiscount: 0,
                topPerformingCode: '',
                conversionRate: 0,
                promoCodes: []
              });
            }
            
            const influencer = influencerMap.get(key)!;
            influencer.totalCodes++;
            influencer.totalUses += code.usedCount;
            influencer.promoCodes.push(code);
            
            if (code.status === 'active') {
              influencer.activeCodes++;
            }
            
            // Calculate revenue (assuming $20.99 base price)
            const basePrice = 20.99;
            const discount = code.type === 'percentage' 
              ? (basePrice * code.value / 100) 
              : code.value;
            influencer.totalRevenue += discount * code.usedCount;
            
            // Track top performing code
            if (code.usedCount > (influencer.promoCodes.find(c => c.code === influencer.topPerformingCode)?.usedCount || 0)) {
              influencer.topPerformingCode = code.code;
            }
          }
        });
        
        // Calculate additional metrics
        const influencerStats = Array.from(influencerMap.values()).map(influencer => {
          const totalDiscounts = influencer.promoCodes.reduce((sum, code) => {
            const basePrice = 20.99;
            const discount = code.type === 'percentage' 
              ? (basePrice * code.value / 100) 
              : code.value;
            return sum + discount;
          }, 0);
          
          influencer.averageDiscount = influencer.promoCodes.length > 0 
            ? totalDiscounts / influencer.promoCodes.length 
            : 0;
          
          influencer.conversionRate = influencer.totalCodes > 0 
            ? (influencer.totalUses / (influencer.totalCodes * 100)) * 100 
            : 0;
          
          return influencer;
        });
        
        // Sort by total uses (performance)
        influencerStats.sort((a, b) => b.totalUses - a.totalUses);
        setInfluencers(influencerStats);
      }
    } catch (err) {
      console.error('Error fetching influencer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const openInfluencerDetails = (influencer: InfluencerStats) => {
    setSelectedInfluencer(influencer);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInfluencer(null);
  };

  const getPerformanceColor = (uses: number) => {
    if (uses >= 50) return 'text-green-600';
    if (uses >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (uses: number) => {
    if (uses >= 50) return 'bg-green-100 text-green-800';
    if (uses >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading influencer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2 px-1">
                Dashboard
              </Link>
              <Link href="/promo-codes" className="text-gray-500 hover:text-gray-700 pb-2 px-1">
                Promo Codes
              </Link>
              <Link href="/influencers" className="text-orange-600 border-b-2 border-orange-600 pb-2 px-1">
                Influencers
              </Link>
              <Link href="/users" className="text-gray-500 hover:text-gray-700 pb-2 px-1">
                Users
              </Link>
              <Link href="/subscriptions" className="text-gray-500 hover:text-gray-700 pb-2 px-1">
                Subscriptions
              </Link>
            </div>
            <button
              onClick={() => window.location.href = '/login'}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Influencer Performance</h1>
          <p className="mt-1 text-gray-600">Track and analyze influencer performance metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Influencers</p>
                <p className="text-2xl font-semibold text-gray-900">{influencers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${influencers.reduce((sum, inf) => sum + inf.totalRevenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {influencers.reduce((sum, inf) => sum + inf.totalUses, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {influencers.reduce((sum, inf) => sum + inf.activeCodes, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Influencers Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Influencer Performance</h3>
            <p className="text-sm text-gray-600">Click on any influencer to view detailed performance</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Uses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {influencers.map((influencer, index) => (
                  <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => openInfluencerDetails(influencer)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-orange-600">
                              {influencer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{influencer.name}</div>
                          <div className="text-sm text-gray-500">{influencer.email}</div>
                          {influencer.socialHandle && (
                            <div className="text-sm text-gray-500">{influencer.socialHandle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{influencer.totalCodes}</div>
                      <div className="text-sm text-gray-500">{influencer.activeCodes} active</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPerformanceColor(influencer.totalUses)}`}>
                        {influencer.totalUses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${influencer.totalRevenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${influencer.averageDiscount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceBadge(influencer.totalUses)}`}>
                        {influencer.totalUses >= 50 ? 'Top Performer' : 
                         influencer.totalUses >= 20 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openInfluencerDetails(influencer);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Influencer Details Modal */}
        {showDetails && selectedInfluencer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedInfluencer.name}</h3>
                    <p className="text-sm text-gray-600">{selectedInfluencer.email}</p>
                    {selectedInfluencer.socialHandle && (
                      <p className="text-sm text-gray-600">{selectedInfluencer.socialHandle}</p>
                    )}
                  </div>
                  <button
                    onClick={closeDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedInfluencer.totalCodes}</div>
                    <div className="text-sm text-gray-600">Total Codes</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedInfluencer.totalUses}</div>
                    <div className="text-sm text-gray-600">Total Uses</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">${selectedInfluencer.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedInfluencer.conversionRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>

                {/* Promo Codes */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Promo Codes</h4>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInfluencer.promoCodes.map((code) => (
                          <tr key={code.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {code.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {code.name}
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                code.status === 'active' ? 'bg-green-100 text-green-800' :
                                code.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {code.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
