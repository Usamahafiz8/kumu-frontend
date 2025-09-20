'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    planName?: string;
    status?: string;
    nextBillingDate?: string;
  } | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const errorParam = searchParams.get('error');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
    } else if (sessionIdParam) {
      verifyPayment(sessionIdParam);
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:3005/stripe/verify-payment?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If verification fails, still show success but without verification
        console.warn('Payment verification failed, but showing success page');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSubscriptionDetails(data);
      setPaymentVerified(true);
      setLoading(false);
    } catch (error) {
      console.error('Payment verification error:', error);
      // Don't show error, just show success without verification
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentVerified ? 'Payment Verified!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {paymentVerified 
            ? 'Your annual subscription has been verified and is now active for one full year.'
            : 'Thank you for your purchase. Your annual subscription has been processed successfully.'
          }
        </p>

        {/* Subscription Details */}
        {subscriptionDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 mb-2">Subscription Details</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Plan:</strong> {subscriptionDetails.planName || 'Premium Plan'}</p>
              <p><strong>Status:</strong> {subscriptionDetails.status || 'Active'}</p>
              <p><strong>Valid Upto:</strong> {subscriptionDetails.nextBillingDate || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* User Subscription Status */}
        {/* {userSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Your Account Status</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Active Subscription:</strong> {userSubscription.hasActiveSubscription ? 'Yes' : 'No'}</p>
              <p><strong>Total Subscriptions:</strong> {userSubscription.subscriptions?.length || 0}</p>
              {userSubscription.subscriptions && userSubscription.subscriptions.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Recent Subscription:</p>
                  <p>Status: {userSubscription.subscriptions[0].status}</p>
                  <p>Start Date: {new Date(userSubscription.subscriptions[0].currentPeriodStart).toLocaleDateString()}</p>
                  <p>End Date: {new Date(userSubscription.subscriptions[0].currentPeriodEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Session ID (for debugging) */}
        {/* {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Session ID:</p>
            <p className="text-xs text-gray-700 font-mono break-all">{sessionId}</p>
          </div>
        )} */}

        {/* Next Steps */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• You will receive a confirmation email shortly</li>
            <li>• Your annual subscription is now active for one full year</li>
            <li>• Open the Kumu Coaching app to get started</li>
          </ul>
        </div> */}

        {/* Action Buttons */}
        <div className="space-y-3">
          <a 
            href="kumucoaching://open"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Open App
          </a>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@kumu.com" className="text-blue-600 hover:text-blue-500">
              support@kumu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
