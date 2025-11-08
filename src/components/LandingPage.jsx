import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';

export default function LandingPage({ onLoginClick, setPage }) {
  const { companies } = useCompany();
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Sample stats
  const stats = {
    activeUsers: 2500,
    tradingVolume: '₹45.2 Cr',
    companies: companies?.length || 150,
    successRate: '98%'
  };

  // Sample public posts (mock data)
  const samplePosts = [
    {
      id: 1,
      type: 'sell',
      company: 'Swiggy',
      isin: 'INE336Q01018',
      price: 485,
      shares: 250,
      seller: 'User***123',
      status: 'active',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 2,
      type: 'buy',
      company: 'PharmEasy',
      isin: 'INE111A01017',
      price: 175,
      shares: 500,
      buyer: 'User***456',
      status: 'active',
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: 3,
      type: 'sell',
      company: 'Oyo Rooms',
      isin: 'INE222B01025',
      price: 320,
      shares: 180,
      seller: 'User***789',
      status: 'active',
      createdAt: Date.now() - 86400000 * 3
    }
  ];

  const howItWorksSteps = [
    {
      step: 1,
      icon: '👤',
      title: 'Sign Up & Complete KYC',
      description: 'Create your account and verify your identity with PAN, Address proof, and CML copy'
    },
    {
      step: 2,
      icon: '🔍',
      title: 'Browse Listings',
      description: 'Explore buy and sell requests from verified users. Find the best deals for unlisted shares'
    },
    {
      step: 3,
      icon: '💬',
      title: 'Place Bids & Negotiate',
      description: 'Make offers, receive counter-offers, and negotiate prices directly with other traders'
    },
    {
      step: 4,
      icon: '✅',
      title: 'Admin Verification',
      description: 'Once both parties agree, admin verifies the offline transaction and closes the deal'
    },
    {
      step: 5,
      icon: '💼',
      title: 'Update Portfolio',
      description: 'Your portfolio is automatically updated. Track all your unlisted holdings in one place'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                N
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Nlist Planet
              </h1>
            </div>
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              🚀 India's Trusted Unlisted Shares Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Buy & Sell <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Unlisted Shares</span>
            <br />at Your Price
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect directly with verified buyers and sellers. Negotiate prices, place bids, and trade unlisted shares of top Indian startups and unicorns with complete transparency.
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span>🎯</span>
            <span>Start Trading Now</span>
          </button>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.activeUsers.toLocaleString()}+</div>
              <p className="text-sm text-gray-600 font-medium">Active Traders</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.tradingVolume}</div>
              <p className="text-sm text-gray-600 font-medium">Trading Volume</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.companies}+</div>
              <p className="text-sm text-gray-600 font-medium">Companies Listed</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.successRate}</div>
              <p className="text-sm text-gray-600 font-medium">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Public Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🔥 Live Listings</h2>
            <p className="text-lg text-gray-600">See what's trading right now. Join to start bidding!</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samplePosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{post.company}</h3>
                    <p className="text-xs text-gray-500">ISIN: {post.isin}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.type === 'sell' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {post.type === 'sell' ? '📈 SELL' : '🛒 BUY'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Price per Share</p>
                      <p className="text-2xl font-bold text-purple-600">₹{post.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Quantity</p>
                      <p className="text-2xl font-bold text-gray-800">{post.shares}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {post.type === 'sell' ? 'Seller' : 'Buyer'}: {post.type === 'sell' ? post.seller : post.buyer}
                  </span>
                  <span className="text-gray-500">{Math.floor((Date.now() - post.createdAt) / 86400000)}d ago</span>
                </div>

                <button
                  onClick={onLoginClick}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  {post.type === 'sell' ? '💰 Place Bid' : '📊 Make Offer'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition"
            >
              <span>View All Listings</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">📚 How It Works</h2>
            <p className="text-lg text-gray-600">Simple, secure, and transparent trading process</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-4xl text-center mb-4">{step.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{step.title}</h3>
                  <p className="text-sm text-gray-600 text-center leading-relaxed">{step.description}</p>
                </div>
                {step.step < howItWorksSteps.length && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-3xl text-purple-300">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span>🚀</span>
              <span>Get Started Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of traders already buying and selling unlisted shares on Nlist Planet
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span>✨</span>
            <span>Create Free Account</span>
          </button>
          <p className="text-sm text-purple-200 mt-6">No credit card required • Free to join • Secure & verified</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  N
                </div>
                <h3 className="text-xl font-bold">Nlist Planet</h3>
              </div>
              <p className="text-gray-400 text-sm">
                India's trusted platform for trading unlisted shares with complete transparency and security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={onLoginClick} className="hover:text-white transition">Browse Listings</button></li>
                <li><button onClick={onLoginClick} className="hover:text-white transition">How It Works</button></li>
                <li><button onClick={onLoginClick} className="hover:text-white transition">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Nlist Planet. All rights reserved. Built with ❤️ for Indian traders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
