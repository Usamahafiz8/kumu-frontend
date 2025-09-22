'use client';

import { API_ENDPOINTS } from '@/config/api';

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <p>NEXT_PUBLIC_API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}</p>
        <p>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</p>
        
        <h2 className="text-lg font-semibold mb-2 mt-4">API Endpoints:</h2>
        <p>ADMIN_INFLUENCERS: {API_ENDPOINTS.ADMIN_INFLUENCERS || 'undefined'}</p>
        <p>PENDING ENDPOINT: {`${API_ENDPOINTS.ADMIN_INFLUENCERS || 'undefined'}/pending`}</p>
        
        <h2 className="text-lg font-semibold mb-2 mt-4">Test API Call:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`${API_ENDPOINTS.ADMIN_INFLUENCERS || 'http://localhost:3005/admin/influencers'}/pending`);
              const data = await response.text();
              alert(`Response: ${response.status} - ${data}`);
            } catch (error) {
              alert(`Error: ${error.message}`);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test API Call
        </button>
      </div>
    </div>
  );
}
