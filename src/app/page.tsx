
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-orange-500">Kumu</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-orange-500">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-orange-500">Pricing</a>
              <a href="#reviews" className="text-gray-700 hover:text-orange-500">Reviews</a>
            </nav>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
              Download
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Unlock <span className="text-orange-500">Potential</span>
              </h1>
              <h2 className="text-2xl text-gray-700 mb-6">Learn from the best</h2>
              <p className="text-lg text-gray-600 mb-8">
                You&apos;re in control, learn at your own pace. Giving everyone, everywhere access to professional affordable coaching in the palm of your hand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <button className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors">
                  Free Trial
                </button> */}
                <button className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors">
                  Download the coaching app
                </button>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="bg-black text-white px-4 py-2 rounded-lg">
                  <span className="text-sm">Download on the</span>
                  <div className="font-bold">App Store</div>
                </div>
                <div className="bg-black text-white px-4 py-2 rounded-lg">
                  <span className="text-sm">Get it on</span>
                  <div className="font-bold">Google Play</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://static.wixstatic.com/media/a86b4b_49f627def69246518a472ea1d1b6b67a~mv2.png/v1/fill/w_376,h_754,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/batting.png"
                  alt="Kumu App Phone Mockup - Batting Training"
                  className="w-auto h-96 object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Putting you in control</h2>
            <p className="text-xl text-gray-600">Learn to play like the pros</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Coaching at your fingertips</h3>
              <p className="text-gray-600">
                Learn from the best players and coaches in the world, at your own pace. Combining easy to access coaching content and cutting edge technology.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🏏</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BATTING</h3>
              <p className="text-gray-600">
                Master the art of batting with professional techniques and step-by-step guidance from cricket legends.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Content</h3>
              <p className="text-gray-600">
                Access professional coaching content at the touch of a button with cutting edge technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">Start your cricket journey today</p>
          </div>
          
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">7 Day Free Trial</h3>
              <div className="text-4xl font-bold text-orange-500 mb-4">Then £7.99</div>
              <p className="text-gray-600 mb-8">on a monthly plan</p>
              <button className="w-full bg-orange-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ratings & Reviews</h2>
            <p className="text-xl text-gray-600">What our users say</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-600">5/5 Rating</span>
              </div>
              <p className="text-gray-700 mb-4">
                &ldquo;I love how you can move around the player, and see exactly what they are doing.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Ollie G.</div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-600">5/5 Rating</span>
              </div>
              <p className="text-gray-700 mb-4">
                &ldquo;The app is packed full of cool features to help you coach others. It gives you all the information you need to teach.&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Rahim A.</div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-600">5/5 Rating</span>
              </div>
              <p className="text-gray-700 mb-4">
                &ldquo;Amazing! This is the future of sports coaching. Kids will love to learn from their hero&apos;s&rdquo;
              </p>
              <div className="font-semibold text-gray-900">Paul D.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="ml-2 text-2xl font-bold text-orange-500">Kumu</span>
              </div>
              <p className="text-gray-400">
                Professional cricket coaching at your fingertips.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Download</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="/login" className="hover:text-white text-orange-400 font-medium">Admin Login</a></li>
                <li><a href="/success?session_id=test_123" className="hover:text-white text-green-400 font-medium">Test Success Page</a></li>
                <li><a href="/cancel" className="hover:text-white text-yellow-400 font-medium">Test Cancel Page</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms and Conditions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kumu Sports. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
