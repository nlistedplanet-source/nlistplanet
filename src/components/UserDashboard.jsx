import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListing } from '../context/ListingContext';
import { useCompany } from '../context/CompanyContext';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import Notification from './Notification';

export default function UserDashboard({ setPage }) {
  const { user, logout, getUserDisplayName } = useAuth();
  const { sellListings, buyRequests, createSellListing, createBuyRequest, placeBid, makeOffer, acceptBid, acceptOffer, counterOffer, acceptCounterOffer, rejectCounterOffer } = useListing();
  const { companies, searchCompany, getCompanyByName } = useCompany();
  const [activeTab, setActiveTab] = useState('overview');
  const [browseSubTab, setBrowseSubTab] = useState('shares'); // 'shares' or 'requests'
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({ company: '', isin: '', price: '', shares: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidOfferData, setBidOfferData] = useState({ price: '', quantity: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });

  // Show notification helper
  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
  };

  // Daily motivational quotes
  const motivationalQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It always seems impossible until it's done.",
    "The secret of getting ahead is getting started.",
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "Opportunities don't happen. You create them.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done."
  ];

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get quote based on day of year for daily rotation
  const getDailyQuote = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  };

  if (!user) {
    setPage('signin');
    return null;
  }

  // User's own listings and requests
  const myListings = sellListings.filter(l => l.seller === user.name || l.seller === user.email);
  const myRequests = buyRequests.filter(r => r.buyer === user.name || r.buyer === user.email);

  // Available listings/requests from others
  const availableListings = sellListings.filter(l => l.status === 'active' && l.seller !== user.name && l.seller !== user.email);
  const availableRequests = buyRequests.filter(r => r.status === 'active' && r.buyer !== user.name && r.buyer !== user.email);

  // Bids I've placed on others' listings
  const myBids = sellListings.filter(l => l.bids?.some(b => b.bidder === user.name || b.bidder === user.email));

  // Offers I've made on others' requests
  const myOffers = buyRequests.filter(r => r.offers?.some(o => o.seller === user.name || o.seller === user.email));

  // Auto-search company when user types
  const handleCompanySearch = (value) => {
    setFormData({...formData, company: value});
    if (value.length >= 2) {
      const results = searchCompany(value);
      setCompanySuggestions(results);
    } else {
      setCompanySuggestions([]);
    }
  };

  // Select company from suggestions
  const selectCompany = (company) => {
    setFormData({
      ...formData,
      company: company.name,
      isin: company.isin
    });
    setCompanySuggestions([]);
  };

  const handleCreateSellListing = (e) => {
    e.preventDefault();
    createSellListing({ ...formData, seller: user.name });
    showNotification('success', 'Shares Listed! 🎉', `Your ${formData.shares} shares of ${formData.company} are now live for sale at ₹${formData.price}`);
    setFormData({ company: '', isin: '', price: '', shares: '' });
    setFormType(null);
  };

  const handleCreateBuyRequest = (e) => {
    e.preventDefault();
    createBuyRequest({ ...formData, buyer: user.name });
    showNotification('success', 'Buy Request Posted! 🚀', `Looking to buy ${formData.shares} shares of ${formData.company} at ₹${formData.price} per share`);
    setFormData({ company: '', isin: '', price: '', shares: '' });
    setFormType(null);
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    placeBid(selectedItem.id, { ...bidOfferData, bidder: user.name });
    showNotification('success', 'Bid Placed! 💰', `Your bid of ₹${bidOfferData.price} for ${bidOfferData.quantity} shares has been submitted`);
    setSelectedItem(null);
    setBidOfferData({ price: '', quantity: '' });
  };

  const handleMakeOffer = (e) => {
    e.preventDefault();
    makeOffer(selectedItem.id, { ...bidOfferData, seller: user.name });
    showNotification('success', 'Offer Submitted! 📊', `Offering ${bidOfferData.quantity} shares at ₹${bidOfferData.price} per share`);
    setSelectedItem(null);
    setBidOfferData({ price: '', quantity: '' });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen flex">
      {/* Left Sidebar Menu */}
      <div className="w-64 bg-white shadow-xl fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-gray-200">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 flex justify-center">
          <img 
            src="/images/logos/logo.png" 
            alt="Nlisted Logo" 
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="font-medium text-sm">Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('myListings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                activeTab === 'myListings' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">📈</span>
              <span className="font-medium text-sm">My Sell Listings</span>
              {myListings.length > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'myListings' ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-700'
                }`}>
                  {myListings.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('myRequests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                activeTab === 'myRequests' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">🛒</span>
              <span className="font-medium text-sm">My Buy Requests</span>
              {myRequests.length > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'myRequests' ? 'bg-white text-purple-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {myRequests.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                activeTab === 'browse' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">🔍</span>
              <span className="font-medium text-sm">Browse Market</span>
            </button>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button 
                onClick={() => setFormType('sell')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <span className="text-lg">➕</span>
                <span className="font-medium text-sm">New Listing</span>
              </button>

              <button 
                onClick={() => setFormType('buy')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-lg">📝</span>
                <span className="font-medium text-sm">New Buy Request</span>
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-sm">User Profile</span>
              </button>

              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="font-medium text-sm">Change Password</span>
              </button>

              <button 
                onClick={() => { logout(); setPage('home'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8 border border-blue-200">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">{getGreeting()}, {user.name}!</h1>
          <p className="text-indigo-600 italic text-lg font-medium">"<span className="font-semibold">{getDailyQuote()}</span>"</p>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📈</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{myListings.length}</div>
                <p className="text-gray-500 text-sm font-medium">Active Listings</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{myRequests.length}</div>
                <p className="text-gray-500 text-sm font-medium">Buy Requests</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{myBids.length}</div>
                <p className="text-gray-500 text-sm font-medium">Bids Placed</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{myOffers.length}</div>
                <p className="text-gray-500 text-sm font-medium">Offers Made</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition group" onClick={() => setFormType('sell')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    📊
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Sell Your Shares</h3>
                    <p className="text-gray-600 text-sm">List your unlisted shares for sale and receive bids from buyers</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition group" onClick={() => setFormType('buy')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    🛒
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Post Buy Request</h3>
                    <p className="text-gray-600 text-sm">Request specific shares and receive offers from sellers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Sell Listings Tab */}
        {activeTab === 'myListings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Sell Listings</h2>
              <button onClick={() => setFormType('sell')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition">
                + Add New Listing
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {myListings.length > 0 ? (
                myListings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{listing.company}</h3>
                        <p className="text-gray-600 text-sm">ISIN: {listing.isin}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        listing.status === 'active' ? 'bg-green-100 text-green-700' :
                        listing.status === 'pending_admin_approval' ? 'bg-orange-100 text-orange-700' :
                        listing.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Price:</span>
                        <span className="font-bold text-emerald-600">₹{listing.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Shares:</span>
                        <span className="font-bold text-gray-900">{listing.shares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Bids Received:</span>
                        <span className="font-bold text-blue-600">{listing.bids?.length || 0}</span>
                      </div>
                    </div>
                    {listing.bids?.length > 0 && (
                      <button onClick={() => setSelectedItem(listing)} className="w-full bg-purple-600 text-white py-2 rounded-xl font-bold hover:bg-purple-700 shadow transition">
                        View Bids
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                  <p className="text-gray-600 text-lg mb-4">You haven't listed any shares yet</p>
                  <button onClick={() => setFormType('sell')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition">
                    Create Your First Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Buy Requests Tab */}
        {activeTab === 'myRequests' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Buy Requests</h2>
              <button onClick={() => setFormType('buy')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition">
                + Post New Request
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {myRequests.length > 0 ? (
                myRequests.map(request => (
                  <div key={request.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.company}</h3>
                        <p className="text-gray-600 text-sm">ISIN: {request.isin}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === 'active' ? 'bg-green-100 text-green-700' :
                        request.status === 'pending_admin_approval' ? 'bg-orange-100 text-orange-700' :
                        request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Desired Price:</span>
                        <span className="font-bold text-blue-600">₹{request.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Shares Needed:</span>
                        <span className="font-bold text-gray-900">{request.shares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Offers Received:</span>
                        <span className="font-bold text-emerald-600">{request.offers?.length || 0}</span>
                      </div>
                    </div>
                    {request.offers?.length > 0 && (
                      <button onClick={() => setSelectedItem(request)} className="w-full bg-purple-600 text-white py-2 rounded-xl font-bold hover:bg-purple-700 shadow transition">
                        View Offers
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                  <p className="text-gray-600 text-lg mb-4">You haven't posted any buy requests yet</p>
                  <button onClick={() => setFormType('buy')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition">
                    Post Your First Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse Market Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Browse Sub-Tabs */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-1 flex gap-1 border border-gray-200">
              <button 
                onClick={() => setBrowseSubTab('shares')} 
                className={`flex-1 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                  browseSubTab === 'shares' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📈 Available Shares for Sale
              </button>
              <button 
                onClick={() => setBrowseSubTab('requests')} 
                className={`flex-1 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                  browseSubTab === 'requests' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🛒 Active Buy Requests
              </button>
            </div>
            
            {browseSubTab === 'shares' && (
            <div className="mb-10">
              <div className="grid md:grid-cols-3 gap-5">
                {availableListings.length > 0 ? (
                  availableListings.map(listing => {
                    const company = companies.find(c => c.name.toLowerCase() === listing.company.toLowerCase() || c.isin === listing.isin);
                    const myBid = listing.bids?.find(b => b.bidder === user.name || b.bidder === user.email);
                    return (
                    <div key={listing.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.company}</h3>
                          <p className="text-gray-500 text-sm">Seller: {getUserDisplayName(listing.seller, listing.seller)}</p>
                        </div>
                        {myBid && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            myBid.status === 'accepted' || myBid.status === 'counter_accepted_by_bidder' ? 'bg-green-100 text-green-700' :
                            myBid.status === 'counter_offered' ? 'bg-orange-100 text-orange-700' :
                            myBid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {myBid.status === 'accepted' ? '✅ Accepted' :
                             myBid.status === 'counter_offered' ? '🔄 Counter' :
                             myBid.status === 'counter_accepted_by_bidder' ? '🤝 Agreed' :
                             myBid.status === 'rejected' ? '❌ Rejected' :
                             '⏳ Pending'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Price:</span>
                          <span className="font-bold text-lg text-emerald-600">₹{listing.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Available:</span>
                          <span className="font-semibold text-gray-900">{listing.shares} shares</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedItem(listing); setFormType('placeBid'); }} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition">
                          💰 Place Bid
                        </button>
                        {company && company.analysisReport && (
                          <a 
                            href={company.analysisReport} 
                            download 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 block bg-indigo-100 text-indigo-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-200 transition text-center"
                          >
                            📄 Report
                          </a>
                        )}
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-base">No shares available for sale at the moment</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {browseSubTab === 'requests' && (
            <div>
              <div className="grid md:grid-cols-3 gap-5">
                {availableRequests.length > 0 ? (
                  availableRequests.map(request => {
                    const company = companies.find(c => c.name.toLowerCase() === request.company.toLowerCase() || c.isin === request.isin);
                    const myOffer = request.offers?.find(o => o.seller === user.name || o.seller === user.email);
                    return (
                    <div key={request.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{request.company}</h3>
                          <p className="text-gray-500 text-sm">Buyer: {getUserDisplayName(request.buyer, request.buyer)}</p>
                        </div>
                        {myOffer && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            myOffer.status === 'accepted' || myOffer.status === 'counter_accepted_by_offerer' ? 'bg-green-100 text-green-700' :
                            myOffer.status === 'counter_offered' ? 'bg-orange-100 text-orange-700' :
                            myOffer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {myOffer.status === 'accepted' ? '✅ Accepted' :
                             myOffer.status === 'counter_offered' ? '🔄 Counter' :
                             myOffer.status === 'counter_accepted_by_offerer' ? '🤝 Agreed' :
                             myOffer.status === 'rejected' ? '❌ Rejected' :
                             '⏳ Pending'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Desired Price:</span>
                          <span className="font-bold text-lg text-blue-600">₹{request.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Needed:</span>
                          <span className="font-semibold text-gray-900">{request.shares} shares</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedItem(request); setFormType('makeOffer'); }} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
                          📊 Make Offer
                        </button>
                        {company && company.analysisReport && (
                          <a 
                            href={company.analysisReport} 
                            download 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 block bg-indigo-100 text-indigo-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-200 transition text-center"
                          >
                            📄 Report
                          </a>
                        )}
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-base">No buy requests at the moment</p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* Create Sell Listing Modal */}
        {formType === 'sell' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">List Shares for Sale</h2>
              <form onSubmit={handleCreateSellListing} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Type to search company..." 
                    value={formData.company} 
                    onChange={(e) => handleCompanySearch(e.target.value)} 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" 
                    required 
                  />
                  {companySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-emerald-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {companySuggestions.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => selectCompany(company)}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{company.name}</p>
                              <p className="text-xs text-gray-600">{company.isin}</p>
                            </div>
                            <span className="text-xs text-emerald-600 font-bold">₹{company.currentPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">ISIN Number</label>
                  <input type="text" placeholder="e.g. INE123456789" value={formData.isin} onChange={(e) => setFormData({...formData, isin: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Price per Share (₹)</label>
                  <input type="number" placeholder="500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Number of Shares</label>
                  <input type="number" placeholder="100" value={formData.shares} onChange={(e) => setFormData({...formData, shares: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setFormType(null); setFormData({ company: '', isin: '', price: '', shares: '' }); }} className="flex-1 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 shadow-lg transition">
                    Create Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Buy Request Modal */}
        {formType === 'buy' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Post Buy Request</h2>
              <form onSubmit={handleCreateBuyRequest} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Type to search company..." 
                    value={formData.company} 
                    onChange={(e) => handleCompanySearch(e.target.value)} 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" 
                    required 
                  />
                  {companySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {companySuggestions.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => selectCompany(company)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{company.name}</p>
                              <p className="text-xs text-gray-600">{company.isin}</p>
                            </div>
                            <span className="text-xs text-blue-600 font-bold">₹{company.currentPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">ISIN Number</label>
                  <input type="text" placeholder="e.g. INE123456789" value={formData.isin} onChange={(e) => setFormData({...formData, isin: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Desired Price (₹)</label>
                  <input type="number" placeholder="500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Number of Shares</label>
                  <input type="number" placeholder="100" value={formData.shares} onChange={(e) => setFormData({...formData, shares: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setFormType(null); setFormData({ company: '', isin: '', price: '', shares: '' }); }} className="flex-1 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 shadow-lg transition">
                    Post Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Place Bid Modal */}
        {formType === 'placeBid' && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Place Your Bid</h2>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl mb-6 border-2 border-emerald-200">
                <h3 className="font-bold text-gray-900">{selectedItem.company}</h3>
                <p className="text-sm text-gray-700">Seller: {selectedItem.seller}</p>
                <p className="text-sm text-gray-700">Asking: ₹{selectedItem.price} per share</p>
              </div>
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Your Bid Price (₹)</label>
                  <input type="number" value={bidOfferData.price} onChange={(e) => setBidOfferData({...bidOfferData, price: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" placeholder={selectedItem.price} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
                  <input type="number" value={bidOfferData.quantity} onChange={(e) => setBidOfferData({...bidOfferData, quantity: e.target.value})} max={selectedItem.shares} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition" placeholder={selectedItem.shares} required />
                </div>
                {bidOfferData.price && bidOfferData.quantity && (
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-xl border-2 border-emerald-300">
                    <p className="text-sm text-gray-700 font-medium">Total Amount:</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{(bidOfferData.price * bidOfferData.quantity).toLocaleString()}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setSelectedItem(null); setFormType(null); setBidOfferData({ price: '', quantity: '' }); }} className="flex-1 border-2 border-gray-200 rounded-xl py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl py-2 font-semibold hover:bg-emerald-700 shadow-lg transition">
                    Submit Bid
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Make Offer Modal */}
        {formType === 'makeOffer' && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Make an Offer</h2>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl mb-6 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900">{selectedItem.company}</h3>
                <p className="text-sm text-gray-700">Buyer: {selectedItem.buyer}</p>
                <p className="text-sm text-gray-700">Desired: ₹{selectedItem.price} per share</p>
              </div>
              <form onSubmit={handleMakeOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Your Offer Price (₹)</label>
                  <input type="number" value={bidOfferData.price} onChange={(e) => setBidOfferData({...bidOfferData, price: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" placeholder={selectedItem.price} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity Available</label>
                  <input type="number" value={bidOfferData.quantity} onChange={(e) => setBidOfferData({...bidOfferData, quantity: e.target.value})} max={selectedItem.shares} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition" placeholder={selectedItem.shares} required />
                </div>
                {bidOfferData.price && bidOfferData.quantity && (
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-300">
                    <p className="text-sm text-gray-700 font-medium">Total Amount:</p>
                    <p className="text-2xl font-bold text-blue-700">₹{(bidOfferData.price * bidOfferData.quantity).toLocaleString()}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setSelectedItem(null); setFormType(null); setBidOfferData({ price: '', quantity: '' }); }} className="flex-1 border-2 border-gray-200 rounded-xl py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 shadow-lg transition">
                    Submit Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Bids/Offers Modal */}
        {selectedItem && !formType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.company}</h2>
                  <p className="text-gray-600">ISIN: {selectedItem.isin}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-900 text-2xl transition">✕</button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {selectedItem.type === 'sell' ? '💰 Received Bids' : '📊 Received Offers'}
                </h3>
                {((selectedItem.type === 'sell' && selectedItem.bids?.length > 0) || 
                  (selectedItem.type === 'buy' && selectedItem.offers?.length > 0)) ? (
                  <div className="space-y-3">
                    {(selectedItem.type === 'sell' ? selectedItem.bids : selectedItem.offers).map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-900">
                              {selectedItem.type === 'sell' ? item.bidder : item.seller}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-600 font-medium">
                              {item.counterPrice ? 'Current Price' : 'Price'}
                            </p>
                            <p className="font-bold text-emerald-600">
                              ₹{item.counterPrice || item.price}
                            </p>
                            {item.counterPrice && (
                              <p className="text-xs text-gray-500 line-through">₹{item.price}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Quantity</p>
                            <p className="font-bold text-gray-900">{item.quantity} shares</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Total</p>
                            <p className="font-bold text-blue-600">
                              ₹{((item.counterPrice || item.price) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Negotiation History */}
                        {item.counterPrice && (
                          <div className="bg-blue-50 p-2 rounded-lg mb-2 text-xs">
                            <p className="text-blue-700 font-semibold">📝 Negotiation:</p>
                            <p className="text-blue-600">Original: ₹{item.price} → Counter: ₹{item.counterPrice}</p>
                          </div>
                        )}
                        {item.status === 'pending' && selectedItem.status === 'active' && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (selectedItem.type === 'sell') {
                                    acceptBid(selectedItem.id, item.id);
                                    showNotification('success', 'Bid Accepted! ✅', 'Transaction sent to admin for approval. You will be notified once verified.');
                                  } else {
                                    acceptOffer(selectedItem.id, item.id);
                                    showNotification('success', 'Offer Accepted! ✅', 'Transaction sent to admin for approval. You will be notified once verified.');
                                  }
                                  setSelectedItem(null);
                                }}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                              >
                                ✅ Accept
                              </button>
                              <button 
                                onClick={() => {
                                  const counterPrice = prompt('Enter your counter price:');
                                  if (counterPrice) {
                                    counterOffer(selectedItem.id, item.id, counterPrice, selectedItem.type);
                                    showNotification('info', 'Counter Offer Sent! 🔄', `New price proposed: ₹${counterPrice}. Waiting for response.`);
                                  }
                                  setSelectedItem(null);
                                }}
                                className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition"
                              >
                                🔄 Counter
                              </button>
                            </div>
                          </div>
                        )}
                        {item.status === 'counter_offered' && (
                          <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200 mt-2">
                            <p className="text-sm text-orange-700 font-semibold mb-2">
                              🔄 Counter Price: ₹{item.counterPrice} 
                              <span className="text-xs ml-2">(Original: ₹{item.price})</span>
                            </p>
                            {/* Check if current user is the one who needs to respond */}
                            {((selectedItem.type === 'sell' && item.bidder !== user.name) || 
                              (selectedItem.type === 'buy' && item.seller !== user.name)) && (
                              <div className="text-xs text-orange-600 mb-2">You sent this counter offer. Waiting for response...</div>
                            )}
                            {((selectedItem.type === 'sell' && item.bidder === user.name) || 
                              (selectedItem.type === 'buy' && item.seller === user.name)) && (
                              <div className="space-y-2">
                                <p className="text-xs text-orange-700 font-semibold mb-2">Counter offer received! Your response:</p>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      acceptCounterOffer(selectedItem.id, item.id, selectedItem.type);
                                      showNotification('success', 'Deal Agreed! 🤝', 'Counter price accepted. Transaction sent to admin for approval.');
                                      setSelectedItem(null);
                                    }}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition text-sm"
                                  >
                                    ✅ Accept ₹{item.counterPrice}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const newCounter = prompt(`Current counter: ₹${item.counterPrice}\nEnter your counter price:`);
                                      if (newCounter) {
                                        counterOffer(selectedItem.id, item.id, newCounter, selectedItem.type);
                                        showNotification('info', 'New Counter Sent! 🔄', `Counter price: ₹${newCounter}. Negotiation continues...`);
                                      }
                                      setSelectedItem(null);
                                    }}
                                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition text-sm"
                                  >
                                    🔄 Counter Again
                                  </button>
                                  <button 
                                    onClick={() => {
                                      rejectCounterOffer(selectedItem.id, item.id, selectedItem.type);
                                      showNotification('warning', 'Counter Rejected ❌', 'You declined the counter offer. Negotiation ended.');
                                      setSelectedItem(null);
                                    }}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm"
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No {selectedItem.type === 'sell' ? 'bids' : 'offers'} received yet
                  </p>
                )}
              </div>

              <button onClick={() => setSelectedItem(null)} className="w-full border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && <UserProfile onClose={() => setShowProfileModal(false)} />}
      
      {/* Change Password Modal */}
      {showPasswordModal && <ChangePassword onClose={() => setShowPasswordModal(false)} />}
      
      {/* Notification */}
      <Notification 
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}
