import React, { useState } from 'react';
import { useListing } from '../context/ListingContext';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import Notification from './Notification';

export default function AdminDashboard({ setPage }) {
  const { user, logout } = useAuth();
  const { sellListings, buyRequests, createSellListing, createBuyRequest, placeBid, makeOffer, acceptBid, acceptOffer, adminApprove, adminClose } = useListing();
  const { companies, addCompany, updateCompany, deleteCompany, searchCompany } = useCompany();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({ company: '', isin: '', price: '', shares: '' });
  const [bidOfferData, setBidOfferData] = useState({ price: '', quantity: '' });
  const [browseSubTab, setBrowseSubTab] = useState('shares');
  const [companySubTab, setCompanySubTab] = useState('view');
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
  const [companyFormData, setCompanyFormData] = useState({ 
    name: '', 
    isin: '', 
    logo: '', 
    currentPrice: '', 
    analysisReport: '', 
    sector: '', 
    founded: '', 
    description: '' 
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [companySuggestions, setCompanySuggestions] = useState([]);

  // Show notification helper
  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
  };

  const allListings = [...sellListings, ...buyRequests];
  const pendingApprovals = allListings.filter(item => item.status === 'pending_admin_approval');
  const approvedItems = allListings.filter(item => item.status === 'approved');
  const closedItems = allListings.filter(item => item.status === 'closed');

  // Admin's own listings and requests (for trading section)
  const myListings = sellListings.filter(l => l.seller === user?.name || l.seller === user?.email);
  const myRequests = buyRequests.filter(r => r.buyer === user?.name || r.buyer === user?.email);

  // Available listings/requests from others
  const availableListings = sellListings.filter(l => l.status === 'active' && l.seller !== user?.name && l.seller !== user?.email);
  const availableRequests = buyRequests.filter(r => r.status === 'active' && r.buyer !== user?.name && r.buyer !== user?.email);

  // Bids/Offers admin has placed
  const myBids = sellListings.filter(l => l.bids?.some(b => b.bidder === user?.name || b.bidder === user?.email));
  const myOffers = buyRequests.filter(r => r.offers?.some(o => o.seller === user?.name || o.seller === user?.email));

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

  const handleApprove = (id, type) => {
    adminApprove(id, type);
    showNotification('success', 'Transaction Approved! ✅', 'The transaction has been verified and approved successfully');
    setSelectedItem(null);
  };

  const handleClose = (id, type) => {
    adminClose(id, type);
    showNotification('info', 'Transaction Closed! 🔒', 'The transaction has been marked as closed and completed');
    setSelectedItem(null);
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

  const getFilteredItems = () => {
    let items = activeTab === 'sell' ? sellListings : buyRequests;
    if (filterStatus === 'all') return items;
    return items.filter(item => item.status === filterStatus);
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl fixed h-screen overflow-y-auto">
        {/* Logo & User Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl shadow-lg">
              ⚙️
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base truncate">{user.name}</h3>
              <p className="text-purple-200 text-xs truncate">Admin Panel</p>
              <p className="text-purple-300 text-xs mt-1">ID: {user.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="mb-4">
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider px-4 mb-2">Trading</p>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="flex-1 text-left">My Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-left">Browse Market</span>
            </button>

            <button
              onClick={() => setActiveTab('post')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'post'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-left">Post Listing</span>
            </button>

            <button
              onClick={() => setActiveTab('mybids')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'mybids'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-left">My Bids/Offers</span>
            </button>
          </div>

          <div>
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider px-4 mb-2">Admin Controls</p>
            <button
              onClick={() => setActiveTab('sell')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'sell'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="flex-1 text-left">Manage Sell</span>
            </button>

            <button
              onClick={() => setActiveTab('buy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'buy'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-left">Manage Buy</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'companies'
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-left">Company DB</span>
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => { logout(); setPage('home'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-500/20 hover:bg-red-500 transition-all border border-red-400/30"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ⚙️ Welcome, Admin!
                </h1>
                <p className="text-sm text-purple-600 font-medium mt-1">
                  Manage all listings, approvals, and platform transactions
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              {/* OVERVIEW TAB - Admin's own trading overview */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Section */}
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-2xl shadow-lg text-white">
                      <div className="text-3xl font-bold mb-2">{myListings.length}</div>
                      <p className="text-emerald-100 font-medium">My Sell Listings</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-lg text-white">
                      <div className="text-3xl font-bold mb-2">{myRequests.length}</div>
                      <p className="text-blue-100 font-medium">My Buy Requests</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
                      <div className="text-3xl font-bold mb-2">{myBids.length}</div>
                      <p className="text-purple-100 font-medium">Active Bids</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-2xl shadow-lg text-white">
                      <div className="text-3xl font-bold mb-2">{myOffers.length}</div>
                      <p className="text-orange-100 font-medium">Active Offers</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
              {/* My Sell Listings */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📈 My Sell Listings</h3>
                {myListings.length > 0 ? (
                  <div className="space-y-3">
                    {myListings.slice(0, 3).map(listing => (
                      <div key={listing.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-gray-800">{listing.company}</h4>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-gray-600">₹{listing.price} × {listing.shares}</span>
                          <span className={`font-semibold ${listing.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                            {listing.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No sell listings yet</p>
                )}
              </div>

              {/* My Buy Requests */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 My Buy Requests</h3>
                {myRequests.length > 0 ? (
                  <div className="space-y-3">
                    {myRequests.slice(0, 3).map(request => (
                      <div key={request.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-gray-800">{request.company}</h4>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-gray-600">₹{request.price} × {request.shares}</span>
                          <span className={`font-semibold ${request.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No buy requests yet</p>
                )}
                  </div>
                </div>
              </>
            )}

            {/* BROWSE TAB - Browse market */}
            {activeTab === 'browse' && (
              <>
                <div className="flex gap-4 mb-6">
              <button
                onClick={() => setBrowseSubTab('shares')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  browseSubTab === 'shares'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
                }`}
              >
                📈 Available Shares ({availableListings.length})
              </button>
              <button
                onClick={() => setBrowseSubTab('requests')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  browseSubTab === 'requests'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                🛒 Buy Requests ({availableRequests.length})
              </button>
            </div>

            {browseSubTab === 'shares' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableListings.length > 0 ? (
                  availableListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{listing.company}</h3>
                      <p className="text-gray-600 text-sm mb-4">Seller: {listing.seller}</p>
                      <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-emerald-600">₹{listing.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shares:</span>
                          <span className="font-bold text-gray-800">{listing.shares}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedItem(listing)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition"
                      >
                        Place Bid
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">No shares available</p>
                  </div>
                )}
              </div>
            )}

            {browseSubTab === 'requests' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRequests.length > 0 ? (
                  availableRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{request.company}</h3>
                      <p className="text-gray-600 text-sm mb-4">Buyer: {request.buyer}</p>
                      <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Desired Price:</span>
                          <span className="font-bold text-blue-600">₹{request.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shares Needed:</span>
                          <span className="font-bold text-gray-800">{request.shares}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedItem(request)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition"
                      >
                        Make Offer
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">No buy requests available</p>
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {/* POST TAB - Create new listing */}
            {activeTab === 'post' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setFormType('sell')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  formType === 'sell'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
                }`}
              >
                📈 Sell Shares
              </button>
              <button
                onClick={() => setFormType('buy')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  formType === 'buy'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                🛒 Post Buy Request
              </button>
            </div>

            {formType && (
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {formType === 'sell' ? 'List Shares for Sale' : 'Post Buy Request'}
                </h2>
                <form onSubmit={formType === 'sell' ? handleCreateSellListing : handleCreateBuyRequest} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name</label>
                    <input
                      type="text"
                      placeholder="Type to search company..."
                      value={formData.company}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      required
                    />
                    {companySuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {companySuggestions.map((company) => (
                          <div
                            key={company.id}
                            onClick={() => selectCompany(company)}
                            className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-900">{company.name}</p>
                                <p className="text-xs text-gray-600">{company.isin}</p>
                              </div>
                              <span className="text-xs text-purple-600 font-bold">₹{company.currentPrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">ISIN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. INE123456789"
                      value={formData.isin}
                      onChange={(e) => setFormData({...formData, isin: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {formType === 'sell' ? 'Selling Price (₹)' : 'Your Desired Price (₹)'}
                    </label>
                    <input
                      type="number"
                      placeholder="₹500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {formType === 'sell' ? 'Number of Shares' : 'Number of Shares Needed'}
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={formData.shares}
                      onChange={(e) => setFormData({...formData, shares: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-lg font-bold text-white hover:shadow-lg transition ${
                      formType === 'sell'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                  >
                    {formType === 'sell' ? '📈 List for Sale' : '🛒 Post Request'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

            {/* MYBIDS TAB - My bids and offers */}
            {activeTab === 'mybids' && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
              {/* My Bids */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 My Bids on Shares</h3>
                {myBids.length > 0 ? (
                  <div className="space-y-4">
                    {myBids.map((listing) => (
                      <div key={listing.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">{listing.company}</h4>
                        <p className="text-sm text-gray-600 mb-3">Seller: {listing.seller}</p>
                        <div className="space-y-2">
                          {listing.bids?.filter(b => b.bidder === user?.name || b.bidder === user?.email).map((bid, idx) => (
                            <div key={idx} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Your Bid:</span>
                                <span className="font-bold text-emerald-600">₹{bid.price} × {bid.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active bids</p>
                )}
              </div>

              {/* My Offers */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 My Offers on Requests</h3>
                {myOffers.length > 0 ? (
                  <div className="space-y-4">
                    {myOffers.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">{request.company}</h4>
                        <p className="text-sm text-gray-600 mb-3">Buyer: {request.buyer}</p>
                        <div className="space-y-2">
                          {request.offers?.filter(o => o.seller === user?.name || o.seller === user?.email).map((offer, idx) => (
                            <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Your Offer:</span>
                                <span className="font-bold text-blue-600">₹{offer.price} × {offer.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active offers</p>
                )}
              </div>
            </div>
              </>
            )}

            {/* ADMIN RIGHTS - Manage Sell Listings */}
            {activeTab === 'sell' && (
              <>
                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{allListings.length}</div>
                <p className="text-yellow-100 font-medium">Total Listings</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{pendingApprovals.length}</div>
                <p className="text-orange-100 font-medium">Pending Approval</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{approvedItems.length}</div>
                <p className="text-emerald-100 font-medium">Approved</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{closedItems.length}</div>
                <p className="text-blue-100 font-medium">Closed</p>
              </div>
            </div>

            {/* Filter Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button 
            onClick={() => setFilterStatus('all')} 
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'}`}>
            All ({filteredItems.length})
          </button>
          <button 
            onClick={() => setFilterStatus('active')} 
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'active' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'}`}>
            🟢 Active
          </button>
          <button 
            onClick={() => setFilterStatus('pending_admin_approval')} 
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'pending_admin_approval' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'}`}>
            ⏳ Pending Approval
          </button>
          <button 
            onClick={() => setFilterStatus('approved')} 
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'approved' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'}`}>
            ✅ Approved
          </button>
          <button 
            onClick={() => setFilterStatus('closed')} 
            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'closed' ? 'bg-gray-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
            🔒 Closed
          </button>
        </div>

            {/* Listings Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.company}</h3>
                    <p className="text-gray-600 text-sm">ISIN: {item.isin}</p>
                    <p className="text-gray-600 text-sm">
                      {item.type === 'sell' ? `Seller: ${item.seller}` : `Buyer: ${item.buyer}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'active' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending_admin_approval' ? 'bg-orange-100 text-orange-700' :
                    item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status === 'active' ? '🟢 Active' :
                     item.status === 'pending_admin_approval' ? '⏳ Pending' :
                     item.status === 'approved' ? '✅ Approved' :
                     '🔒 Closed'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-lg text-emerald-600">₹{item.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shares:</span>
                    <span className="font-bold text-gray-800">{item.shares} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {item.type === 'sell' ? 'Bids Received:' : 'Offers Received:'}
                    </span>
                    <span className="font-bold text-blue-600">
                      {item.type === 'sell' ? item.bids?.length || 0 : item.offers?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.closedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closed:</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(item.closedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition"
                >
                  📋 View Details
                </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No sell listings found</p>
                </div>
              )}
            </div>
              </>
            )}

            {/* ADMIN RIGHTS - Manage Buy Requests */}
            {activeTab === 'buy' && (
              <>
                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{allListings.length}</div>
                <p className="text-yellow-100 font-medium">Total Listings</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{pendingApprovals.length}</div>
                <p className="text-orange-100 font-medium">Pending Approval</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{approvedItems.length}</div>
                <p className="text-emerald-100 font-medium">Approved</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-3xl font-bold mb-2">{closedItems.length}</div>
                <p className="text-blue-100 font-medium">Closed</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="mb-8 flex gap-2 flex-wrap">
              <button 
                onClick={() => setFilterStatus('all')} 
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'}`}>
                All ({buyRequests.length})
              </button>
              <button 
                onClick={() => setFilterStatus('active')} 
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'active' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'}`}>
                🟢 Active
              </button>
              <button 
                onClick={() => setFilterStatus('pending_admin_approval')} 
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'pending_admin_approval' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'}`}>
                ⏳ Pending Approval
              </button>
              <button 
                onClick={() => setFilterStatus('approved')} 
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'approved' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'}`}>
                ✅ Approved
              </button>
              <button 
                onClick={() => setFilterStatus('closed')} 
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'closed' ? 'bg-gray-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'}`}>
                🔒 Closed
              </button>
            </div>

            {/* Buy Requests Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {(filterStatus === 'all' ? buyRequests : buyRequests.filter(item => item.status === filterStatus)).length > 0 ? (
                (filterStatus === 'all' ? buyRequests : buyRequests.filter(item => item.status === filterStatus)).map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{item.company}</h3>
                        <p className="text-gray-600 text-sm">ISIN: {item.isin}</p>
                        <p className="text-gray-600 text-sm">Buyer: {item.buyer}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' :
                        item.status === 'pending_admin_approval' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status === 'active' ? '🟢 Active' :
                         item.status === 'pending_admin_approval' ? '⏳ Pending' :
                         item.status === 'approved' ? '✅ Approved' :
                         '🔒 Closed'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-lg text-blue-600">₹{item.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shares:</span>
                        <span className="font-bold text-gray-800">{item.shares} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Offers Received:</span>
                        <span className="font-bold text-blue-600">{item.offers?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition"
                    >
                      📋 View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No buy requests found</p>
                </div>
              )}
            </div>
              </>
            )}

            {/* ADMIN RIGHTS - Company Database Management */}
            {activeTab === 'companies' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">🏢 Company Database</h1>
              <p className="text-gray-600">Manage unlisted companies data - logos, ISIN, analysis reports</p>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setCompanySubTab('view')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  companySubTab === 'view'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                📋 View All ({companies.length})
              </button>
              <button
                onClick={() => { setCompanySubTab('add'); setEditingCompany(null); setCompanyFormData({ name: '', isin: '', logo: '', currentPrice: '', analysisReport: '', sector: '', founded: '', description: '' }); }}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  companySubTab === 'add'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                }`}
              >
                ➕ Add New Company
              </button>
              <button
                onClick={() => setCompanySubTab('update')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  companySubTab === 'update'
                    ? 'bg-gradient-to-r from-orange-600 to-yellow-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                }`}
              >
                ✏️ Update Company
              </button>
            </div>

            {/* View All Companies */}
            {companySubTab === 'view' && (
              <div className="grid md:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <div key={company.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-600">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{company.name}</h3>
                        <p className="text-xs text-gray-500">{company.sector}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ISIN:</span>
                        <span className="font-semibold text-gray-800">{company.isin}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-bold text-emerald-600">₹{company.currentPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Founded:</span>
                        <span className="text-gray-700">{company.founded}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">{company.description}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCompany(company);
                          setCompanyFormData(company);
                          setCompanySubTab('update');
                        }}
                        className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${company.name}?`)) {
                            deleteCompany(company.id);
                            showNotification('warning', 'Company Deleted! 🗑️', `${company.name} has been removed from the database`);
                          }
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Company */}
            {companySubTab === 'add' && (
              <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Add New Company</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  addCompany(companyFormData);
                  showNotification('success', 'Company Added! 🎉', `${companyFormData.name} has been successfully added to the database`);
                  setCompanyFormData({ name: '', isin: '', logo: '', currentPrice: '', analysisReport: '', sector: '', founded: '', description: '' });
                  setCompanySubTab('view');
                }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name *</label>
                      <input
                        type="text"
                        value={companyFormData.name}
                        onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="e.g. Swiggy"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">ISIN Number *</label>
                      <input
                        type="text"
                        value={companyFormData.isin}
                        onChange={(e) => setCompanyFormData({...companyFormData, isin: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="e.g. INE123456789"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Current Price (₹) *</label>
                      <input
                        type="number"
                        value={companyFormData.currentPrice}
                        onChange={(e) => setCompanyFormData({...companyFormData, currentPrice: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Sector *</label>
                      <input
                        type="text"
                        value={companyFormData.sector}
                        onChange={(e) => setCompanyFormData({...companyFormData, sector: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="e.g. Technology"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Founded Year</label>
                      <input
                        type="text"
                        value={companyFormData.founded}
                        onChange={(e) => setCompanyFormData({...companyFormData, founded: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="2014"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Logo URL</label>
                      <input
                        type="text"
                        value={companyFormData.logo}
                        onChange={(e) => setCompanyFormData({...companyFormData, logo: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        placeholder="/images/companies/logo.png"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Analysis Report PDF URL</label>
                    <input
                      type="text"
                      value={companyFormData.analysisReport}
                      onChange={(e) => setCompanyFormData({...companyFormData, analysisReport: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                      placeholder="/reports/company-analysis.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                    <textarea
                      value={companyFormData.description}
                      onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                      rows="3"
                      placeholder="Company description..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCompanySubTab('view')}
                      className="flex-1 border-2 border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                    >
                      ➕ Add Company
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Company */}
            {companySubTab === 'update' && (
              <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Update Company</h2>
                {editingCompany ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateCompany(editingCompany.id, companyFormData);
                    showNotification('success', 'Company Updated! ✏️', `${companyFormData.name} information has been successfully updated`);
                    setEditingCompany(null);
                    setCompanyFormData({ name: '', isin: '', logo: '', currentPrice: '', analysisReport: '', sector: '', founded: '', description: '' });
                    setCompanySubTab('view');
                  }} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Company Name *</label>
                        <input
                          type="text"
                          value={companyFormData.name}
                          onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">ISIN Number *</label>
                        <input
                          type="text"
                          value={companyFormData.isin}
                          onChange={(e) => setCompanyFormData({...companyFormData, isin: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Current Price (₹) *</label>
                        <input
                          type="number"
                          value={companyFormData.currentPrice}
                          onChange={(e) => setCompanyFormData({...companyFormData, currentPrice: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Sector *</label>
                        <input
                          type="text"
                          value={companyFormData.sector}
                          onChange={(e) => setCompanyFormData({...companyFormData, sector: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Founded Year</label>
                        <input
                          type="text"
                          value={companyFormData.founded}
                          onChange={(e) => setCompanyFormData({...companyFormData, founded: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Logo URL</label>
                        <input
                          type="text"
                          value={companyFormData.logo}
                          onChange={(e) => setCompanyFormData({...companyFormData, logo: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Analysis Report PDF URL</label>
                      <input
                        type="text"
                        value={companyFormData.analysisReport}
                        onChange={(e) => setCompanyFormData({...companyFormData, analysisReport: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                      <textarea
                        value={companyFormData.description}
                        onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none"
                        rows="3"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompany(null);
                          setCompanySubTab('view');
                        }}
                        className="flex-1 border-2 border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                      >
                        ✏️ Update Company
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Select a company from "View All" to update</p>
                    <button
                      onClick={() => setCompanySubTab('view')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                      Go to View All
                    </button>
                  </div>
                )}
              </div>
            )}
              </>
            )}
            </div>
          </div>

        {/* Details Modal - For Admin Rights and Trading */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedItem.company}</h2>
                  <p className="text-gray-600">ISIN: {selectedItem.isin}</p>
                  <p className="text-gray-600">
                    {selectedItem.type === 'sell' ? `Seller: ${selectedItem.seller}` : `Buyer: ${selectedItem.buyer}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl mb-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Price per Share</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{selectedItem.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Shares</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedItem.shares}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {selectedItem.type === 'sell' ? '💰 Bids Received' : '📊 Offers Received'}
                </h3>
                {((selectedItem.type === 'sell' && selectedItem.bids?.length > 0) || 
                  (selectedItem.type === 'buy' && selectedItem.offers?.length > 0)) ? (
                  <div className="space-y-3">
                    {(selectedItem.type === 'sell' ? selectedItem.bids : selectedItem.offers).map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800">
                              {selectedItem.type === 'sell' ? item.bidder : item.seller}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            item.status === 'countered' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-bold text-emerald-600">₹{item.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Quantity</p>
                            <p className="font-bold text-gray-800">{item.quantity} shares</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No {selectedItem.type === 'sell' ? 'bids' : 'offers'} received yet
                  </p>
                )}
              </div>

              {/* Admin Rights Actions */}
              {(activeTab === 'sell' || activeTab === 'buy') && (
                <div className="flex gap-3">
                  {selectedItem.status === 'pending_admin_approval' && (
                    <button
                      onClick={() => handleApprove(selectedItem.id, selectedItem.type)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      ✅ Approve Transaction
                    </button>
                  )}
                  {selectedItem.status === 'approved' && (
                    <button
                      onClick={() => handleClose(selectedItem.id, selectedItem.type)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      🔒 Close Transaction
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 border-2 border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Trading Actions - Place Bid/Offer */}
              {activeTab === 'browse' && (
                <form onSubmit={selectedItem.type === 'sell' ? handlePlaceBid : handleMakeOffer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {selectedItem.type === 'sell' ? 'Your Bid Price (₹)' : 'Your Offer Price (₹)'}
                    </label>
                    <input
                      type="number"
                      value={bidOfferData.price}
                      onChange={(e) => setBidOfferData({...bidOfferData, price: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      placeholder={`₹${selectedItem.price}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={bidOfferData.quantity}
                      onChange={(e) => setBidOfferData({...bidOfferData, quantity: e.target.value})}
                      max={selectedItem.shares}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-400 outline-none transition"
                      placeholder={selectedItem.shares}
                      required
                    />
                  </div>
                  {bidOfferData.price && bidOfferData.quantity && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-gray-600">Total Amount:</p>
                      <p className="text-2xl font-bold text-emerald-600">₹{(bidOfferData.price * bidOfferData.quantity).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setSelectedItem(null); setBidOfferData({ price: '', quantity: '' }); }}
                      className="flex-1 border-2 border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 text-white py-3 rounded-lg font-bold hover:shadow-lg transition ${
                        selectedItem.type === 'sell'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                    >
                      {selectedItem.type === 'sell' ? '💰 Place Bid' : '📊 Make Offer'}
                    </button>
                  </div>
                </form>
              )}

              {/* Close button for overview/mybids tabs */}
              {(activeTab === 'overview' || activeTab === 'mybids') && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ⚙️ Admin Control Panel - Manage platform with confidence
            </p>
          </div>
        </main>
      </div>
      
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
