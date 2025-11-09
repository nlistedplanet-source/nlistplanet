import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListing } from '../context/ListingContext';
import { useCompany } from '../context/CompanyContext';
import { usePortfolio } from '../context/PortfolioContext';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import Notification from './Notification';

const STATUS_META = {
	active: { icon: '🟢', label: 'Active', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
	pending_admin_approval: { icon: '⏳', label: 'Pending Admin', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
	pending: { icon: '⏳', label: 'Pending', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
	under_review: { icon: '🔍', label: 'Under Review', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
	submitted: { icon: '📨', label: 'Submitted', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
	draft: { icon: '📝', label: 'Draft', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
	awaiting_admin: { icon: '⏳', label: 'Awaiting Admin', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
	approved: { icon: '✅', label: 'Approved', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
	closed: { icon: '🔒', label: 'Closed', classes: 'bg-slate-100 text-slate-600 border border-slate-200' }
};

const INTERACTION_META = {
	pending: { icon: '⏳', label: 'Pending', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
	accepted: { icon: '✅', label: 'Accepted', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
	counter_offered: { icon: '🔄', label: 'Countered', classes: 'bg-orange-100 text-orange-700 border border-orange-200' },
	counter_accepted_by_bidder: { icon: '🤝', label: 'Agreed', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
	counter_accepted_by_offerer: { icon: '🤝', label: 'Agreed', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
	rejected: { icon: '❌', label: 'Rejected', classes: 'bg-rose-100 text-rose-700 border border-rose-200' }
};

const getStatusMeta = (status) => {
	if (!status) return { icon: '❓', label: 'Unknown', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
	return STATUS_META[status] || { icon: '❓', label: status.replace(/_/g, ' '), classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
};

const getInteractionMeta = (status) => {
	if (!status) return { icon: '⏳', label: 'Pending', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
	return INTERACTION_META[status] || { icon: '❓', label: status.replace(/_/g, ' '), classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
};

const StatusBadge = ({ status, size = 'sm' }) => {
	const meta = getStatusMeta(status);
	const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';
	return (
		<span className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClasses} ${meta.classes}`}>
			<span>{meta.icon}</span>
			<span className="uppercase tracking-wide">{meta.label}</span>
		</span>
	);
};

const InteractionBadge = ({ status }) => {
	const meta = getInteractionMeta(status);
	return (
		<span className={`inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-1 text-[11px] ${meta.classes}`}>
			<span>{meta.icon}</span>
			<span>{meta.label}</span>
		</span>
	);
};

const EmptyState = ({ icon = '?', title, description, actionLabel, onAction }) => (
	<div className="flex flex-col items-center justify-center text-center bg-white border border-dashed border-gray-300 rounded-2xl py-12 px-6">
		<div className="text-4xl mb-4">{icon}</div>
		<h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
		{description && <p className="text-sm text-gray-500 max-w-md">{description}</p>}
		{actionLabel && onAction && (
			<button
				onClick={onAction}
				className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
			>
				<span>?</span>
				<span>{actionLabel}</span>
			</button>
		)}
	</div>
);

const SectionHeader = ({ title, subtitle, actionLabel, onAction, actionTone = 'primary' }) => (
	<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
		<div>
			<h2 className="text-2xl font-bold text-gray-900">{title}</h2>
			{subtitle && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{subtitle}</p>}
		</div>
		{actionLabel && onAction && (
			<button
				onClick={onAction}
				className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
					actionTone === 'secondary'
						? 'border border-gray-300 text-gray-700 hover:bg-gray-100'
						: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-lg'
				}`}
			>
				<span>?</span>
				<span>{actionLabel}</span>
			</button>
		)}
	</div>
);

const formatCurrency = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return `?${value}`;
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0
	}).format(numeric);
};

const formatShares = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return `${value} shares`;
	return `${numeric.toLocaleString('en-IN')} shares`;
};

const formatDate = (iso) => {
	if (!iso) return '�';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '�';
	return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (iso) => {
	if (!iso) return '�';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '�';
	return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function UserDashboard({ setPage }) {
	const { user, logout, getUserDisplayName, updateUserProfile, getKycStatus, submitKycDocuments } = useAuth();
	const {
		sellListings,
		buyRequests,
		createSellListing,
		createBuyRequest,
		placeBid,
		makeOffer,
		acceptBid,
		acceptOffer,
		counterOffer,
		acceptCounterOffer,
		rejectCounterOffer
	} = useListing();
	const { companies, searchCompany } = useCompany();
	const portfolio = usePortfolio();

	const [activeTab, setActiveTab] = useState('marketplace');
	const [buySubTab, setBuySubTab] = useState('list');
	const [sellSubTab, setSellSubTab] = useState('list');
	const [browseFilter, setBrowseFilter] = useState('sell');
	const [formType, setFormType] = useState(null);
	const [formData, setFormData] = useState({ company: '', isin: '', price: '', shares: '' });
	const [companySuggestions, setCompanySuggestions] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);
	const [tradeContext, setTradeContext] = useState(null);
	const [bidOfferData, setBidOfferData] = useState({ price: '', quantity: '' });
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
	// KYC banner state
	const kycStatus = getKycStatus(user);
	const [showKycForm, setShowKycForm] = useState(false);
	const [kycDocs, setKycDocs] = useState({ pan: '', addressProof: '', cmlCopy: '', bankDetails: '' });
	
	// Portfolio section states
	const [editingPrice, setEditingPrice] = useState(null);
	const [newPrice, setNewPrice] = useState('');
	
	// FAQ section state
	const [openFaqIndex, setOpenFaqIndex] = useState(null);
	
	// Support section states
	const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
	const [supportSubmitted, setSupportSubmitted] = useState(false);

	// Username generator state
	const [currentUsername, setCurrentUsername] = useState(user.username || user.userId);

	// Funny username generator
	const generateFunnyUsername = () => {
		const prefixes = [
			'ironman', 'batman', 'superman', 'spiderman', 'thor', 'hulk', 'captainamerica', 'blackwidow',
			'rajnikant', 'salmankhan', 'shahrukhkhan', 'amitabhbachchan', 'akshaykumar', 'hrithikroshan',
			'deepikapadukone', 'priyankachopra', 'katrinakaif', 'aliabhatt',
			'sherlock', 'jonsnow', 'tyrionlannister', 'tonystark', 'brucewayne',
			'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'goa',
			'wolf', 'tiger', 'lion', 'eagle', 'falcon', 'panther', 'cobra', 'dragon',
			'ninja', 'samurai', 'warrior', 'knight', 'viking', 'spartan',
			'einstein', 'newton', 'tesla', 'edison', 'darwin',
			'crypto', 'stock', 'trader', 'investor', 'whale', 'bull', 'bear',
			'rockstar', 'legend', 'champion', 'master', 'boss', 'king', 'queen',
			'pixel', 'byte', 'quantum', 'matrix', 'cyber', 'tech', 'digital'
		];
		
		const suffixes = [
			'trader', 'investor', 'pro', 'master', 'king', 'queen', 'boss', 'legend',
			'warrior', 'hero', 'star', 'genius', 'wizard', 'ninja', 'samurai',
			'returns', 'gains', 'profits', 'wealth', 'rich', 'millionaire',
			'hustler', 'grinder', 'player', 'gamer', 'winner', 'champion',
			'alpha', 'sigma', 'omega', 'prime', 'elite', 'supreme',
			'_001', '_247', '_360', '_007', '_420', '_786', '_999'
		];
		
		const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
		const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
		
		return `@${randomPrefix}_${randomSuffix}`;
	};

	const handleUsernameChange = async () => {
		const newUsername = generateFunnyUsername();
		
		try {
			// Update username in backend MongoDB
			await updateUserProfile({ username: newUsername });
			setCurrentUsername(newUsername);
			showNotification('success', 'Username Updated! 🎉', `Your new username is ${newUsername}`);
		} catch (error) {
			showNotification('error', 'Update Failed', error.message || 'Could not update username');
		}
	};

	const motivationalQuotes = useMemo(
		() => [
			'Success is not final, failure is not fatal: it is the courage to continue that counts.',
			'The only way to do great work is to love what you do.',
			"Believe you can and you're halfway there.",
			"Don't watch the clock; do what it does. Keep going.",
			'The future belongs to those who believe in the beauty of their dreams.',
			"It always seems impossible until it's done.",
			'The secret of getting ahead is getting started.',
			'Success is walking from failure to failure with no loss of enthusiasm.',
			"Opportunities don't happen. You create them.",
			"Your limitation�it's only your imagination.",
			'Great things never come from comfort zones.',
			'Dream it. Wish it. Do it.',
		"Success doesn't just find you. You have to go out and get it.",
		'The harder you work for something, the greater you\'ll feel when you achieve it.',
		"Don't stop when you're tired. Stop when you're done."
	],
	[]
);	const showNotification = (type, title, message) => {
		setNotification({ show: true, type, title, message });
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning';
		if (hour < 17) return 'Good Afternoon';
		return 'Good Evening';
	};

	const getDailyQuote = () => {
		const today = new Date();
		const start = new Date(today.getFullYear(), 0, 0);
		const diff = today - start;
		const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
		return motivationalQuotes[dayOfYear % motivationalQuotes.length];
	};

	const userIdentifiers = useMemo(() => {
		if (!user) return [];
		return [
			user.email,
			user.name,
			user.username,
			user.userId,
			user._id,
			user.id,
			user.profileId
		]
			.filter(Boolean)
			.map((value) => value.toString().trim().toLowerCase());
	}, [user]);

	const matchesCurrentUser = useCallback((value) => {
		if (!value || userIdentifiers.length === 0) return false;
		if (typeof value === 'object') {
			return Object.values(value).some((nested) => matchesCurrentUser(nested));
		}
		const normalized = value.toString().trim().toLowerCase();
		return userIdentifiers.includes(normalized);
	}, [userIdentifiers]);

	const listingBelongsToUser = useCallback((listing) => {
		if (!listing) return false;
		const candidateValues = [
			listing.seller,
			listing.sellerEmail,
			listing.sellerId,
			listing.sellerName,
			listing.owner,
			listing.ownerId,
			listing.ownerEmail,
			listing.userId,
			listing.user,
			listing.createdBy,
			listing.createdById,
			listing.createdByEmail,
			listing.accountId,
			listing?.seller?.id,
			listing?.seller?.email,
			listing?.seller?.name
		];
		return candidateValues.some(matchesCurrentUser);
	}, [matchesCurrentUser]);

	const requestBelongsToUser = useCallback((request) => {
		if (!request) return false;
		const candidateValues = [
			request.buyer,
			request.buyerEmail,
			request.buyerId,
			request.buyerName,
			request.requestedBy,
			request.requestedById,
			request.createdBy,
			request.createdById,
			request.accountId,
			request?.buyer?.id,
			request?.buyer?.email,
			request?.buyer?.name
		];
		return candidateValues.some(matchesCurrentUser);
	}, [matchesCurrentUser]);

	const myListings = useMemo(
		() => sellListings.filter(listingBelongsToUser),
		[sellListings, listingBelongsToUser]
	);
	const myRequests = useMemo(
		() => buyRequests.filter(requestBelongsToUser),
		[buyRequests, requestBelongsToUser]
	);
	const availableListings = useMemo(
		() => user ? sellListings.filter((listing) => 
			listing.status === 'active' && !listingBelongsToUser(listing)
		) : [],
		[sellListings, user, listingBelongsToUser]
	);
	const availableRequests = useMemo(
		() => user ? buyRequests.filter((request) => 
			request.status === 'active' && !requestBelongsToUser(request)
		) : [],
		[buyRequests, user, requestBelongsToUser]
	);

	useEffect(() => {
		if (!user) {
			setPage('signin');
		}
	}, [user, setPage]);

	if (!user) {
		return null;
	}

	const handleKycSubmit = async (e) => {
		e.preventDefault();
		try {
			await submitKycDocuments(kycDocs);
			showNotification('success', 'KYC Submitted', 'Your KYC is now under review.');
			setShowKycForm(false);
		} catch (err) {
			showNotification('error', 'Submission Failed', err.message || 'Please try again later');
		}
	};

	const handleCompanySearch = (value) => {
		setFormData({ ...formData, company: value });
		if (value.length >= 2) {
			const results = searchCompany(value);
			setCompanySuggestions(results);
		} else {
			setCompanySuggestions([]);
		}
	};

	const selectCompany = (company) => {
		setFormData({
			...formData,
			company: company.name,
			isin: company.isin,
			price: company.currentPrice || formData.price
		});
		setCompanySuggestions([]);
	};

	const handleCreateSellListing = async (e) => {
		e.preventDefault();
		try {
			await createSellListing({ ...formData, seller: user.email, sellerName: user.name });
			showNotification('success', 'Shares listed! 🎉', `Your ${formData.shares} shares of ${formData.company} are now live.`);
			setFormData({ company: '', isin: '', price: '', shares: '' });
			setFormType(null);
		} catch (error) {
			console.error('Failed to create listing:', error);
			showNotification('error', 'Failed to create listing', 'Please try again later.');
		}
	};

	const handleCreateBuyRequest = async (e) => {
		e.preventDefault();
		try {
			await createBuyRequest({ ...formData, buyer: user.email, buyerName: user.name });
			showNotification('success', 'Buy request posted! 🎉', `Looking to buy ${formData.shares} shares of ${formData.company}.`);
			setFormData({ company: '', isin: '', price: '', shares: '' });
			setFormType(null);
		} catch (error) {
			console.error('Failed to create buy request:', error);
			showNotification('error', 'Failed to create buy request', 'Please try again later.');
		}
	};

	const handlePlaceBid = async (e) => {
		e.preventDefault();
		if (!tradeContext) return;
		try {
			await placeBid(tradeContext.item._id || tradeContext.item.id, { ...bidOfferData, bidder: user.email, bidderName: user.name });
			showNotification('success', 'Bid submitted! 🎯', `Bid of ₹${bidOfferData.price} for ${bidOfferData.quantity} shares submitted.`);
			setTradeContext(null);
			setSelectedItem(null);
			setBidOfferData({ price: '', quantity: '' });
		} catch (error) {
			console.error('Failed to place bid:', error);
			showNotification('error', 'Failed to place bid', 'Please try again later.');
		}
	};

	const handleMakeOffer = async (e) => {
		e.preventDefault();
		if (!tradeContext) return;
		try {
			makeOffer(tradeContext.item._id || tradeContext.item.id, { ...bidOfferData, seller: user.email, sellerName: user.name });
			showNotification('success', 'Offer submitted! 🎯', `Offer of ₹${bidOfferData.price} for ${bidOfferData.quantity} shares submitted.`);
			setTradeContext(null);
			setSelectedItem(null);
			setBidOfferData({ price: '', quantity: '' });
		} catch (error) {
			console.error('Failed to make offer:', error);
			showNotification('error', 'Failed to make offer', 'Please try again later.');
		}
	};

	const navItems = [
		{ id: 'marketplace', label: 'Nlist Zone', icon: '🏪' },
		{ id: 'buy', label: 'Buy', icon: '🛒', counter: myRequests.length },
		{ id: 'sell', label: 'Sell', icon: '📈', counter: myListings.length },
		{ id: 'orders', label: 'Orders', icon: '📋' },
		{ id: 'portfolio', label: 'Portfolio', icon: '💼' },
		{ id: 'faq', label: 'FAQ', icon: '❓' },
		{ id: 'support', label: 'Support', icon: '💬' }
	];

	const renderMyListings = () => {
		// Filter sell listings based on sub-tab  
		const openSellStatuses = [
			'active',
			'pending_admin_approval',
			'pending',
			'under_review',
			'submitted',
			'awaiting_admin',
			'processing',
			'initiated',
			'draft'
		];
		const getStatusKey = (status) => (status ? status.toString().trim().toLowerCase() : 'pending_admin_approval');
		const myOpenListings = myListings.filter((l) => openSellStatuses.includes(getStatusKey(l.status)));
		const bidsReceived = myListings.filter(l => l.bids && l.bids.length > 0);
		const counterOfferListings = myListings.filter(l => 
			l.bids?.some(b => b.status === 'counter_offered' || b.status === 'counter_accepted_by_bidder')
		);
		const completedListings = myListings.filter(l => 
			l.status === 'approved' || l.status === 'closed'
		);

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">📈 Sell Management</h2>
						<p className="text-sm text-gray-500 mt-1">Manage your sell listings and received bids</p>
					</div>
					<button
						onClick={() => setFormType('sell')}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow hover:shadow-lg transition"
					>
						<span>➕</span>
						<span>New Sell Listing</span>
					</button>
				</div>

				{/* Sub-tabs */}
				<div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
					<button
						onClick={() => setSellSubTab('list')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							sellSubTab === 'list'
								? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
							📋 Sell List ({myOpenListings.length})
					</button>
					<button
						onClick={() => setSellSubTab('bids')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							sellSubTab === 'bids'
								? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						💰 Bids Received ({bidsReceived.length})
					</button>
					<button
						onClick={() => setSellSubTab('counter')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							sellSubTab === 'counter'
								? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						🔄 Counter Offers ({counterOfferListings.length})
					</button>
					<button
						onClick={() => setSellSubTab('completed')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							sellSubTab === 'completed'
								? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						✅ Completed ({completedListings.length})
					</button>
				</div>

				{/* Content based on sub-tab */}
				{sellSubTab === 'list' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Live & Pending Sell Listings</h3>
						{myOpenListings.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No live or pending sell listings yet</p>
								<button
									onClick={() => setFormType('sell')}
									className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
								>
									<span>➕</span>
									<span>Create your first listing</span>
								</button>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
								{myOpenListings.map((listing) => (
									<div key={listing._id || listing.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
										<div className="flex items-start justify-between">
											<div>
												<h4 className="font-semibold text-gray-900">{listing.company}</h4>
												<p className="text-xs text-gray-500 mt-1">ISIN: {listing.isin || 'N/A'}</p>
											</div>
											<StatusBadge status={listing.status} />
										</div>
										<div className="mt-4 grid grid-cols-2 gap-3">
											<div className="bg-emerald-50 rounded-lg p-3">
												<p className="text-xs text-emerald-600 font-semibold">Ask Price</p>
												<p className="text-sm font-bold text-emerald-700 mt-1">{formatCurrency(listing.price)}</p>
											</div>
											<div className="bg-gray-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 font-semibold">Quantity</p>
												<p className="text-sm font-bold text-gray-700 mt-1">{formatShares(listing.shares)}</p>
											</div>
										</div>
										<div className="mt-4 flex items-center justify-between text-xs">
											<span className="text-gray-500">Bids: {listing.bids?.length || 0}</span>
											<span className="text-gray-400">{formatDate(listing.createdAt)}</span>
										</div>
										<button
											onClick={() => setSelectedItem({ item: listing, type: 'sell' })}
											className="mt-4 w-full px-4 py-2 rounded-lg font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
										>
											View Details
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{sellSubTab === 'bids' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Bids Received from Buyers</h3>
						{bidsReceived.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No bids received yet</p>
							</div>
						) : (
							<div className="space-y-4">
								{bidsReceived.map((listing) => (
									<div key={listing._id || listing.id} className="bg-white border border-gray-200 rounded-xl p-5">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h4 className="font-semibold text-gray-900">{listing.company}</h4>
												<p className="text-sm text-gray-500">Your ask: {formatCurrency(listing.price)} for {formatShares(listing.shares)}</p>
											</div>
											<StatusBadge status={listing.status} />
										</div>
										<div className="space-y-2">
											<p className="text-sm font-semibold text-gray-700">Received Bids ({listing.bids?.length || 0}):</p>
											{listing.bids?.map((bid) => (
												<div key={bid._id || bid.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
													<div>
														<p className="text-sm font-semibold text-gray-900">
															{bid.bidderName || bid.bidder}
														</p>
														<p className="text-xs text-gray-600">
															{formatCurrency(bid.counterPrice || bid.price)} × {formatShares(bid.quantity)}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<InteractionBadge status={bid.status} />
														<button
															onClick={() => setSelectedItem({ item: listing, type: 'sell' })}
															className="px-3 py-1 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
														>
															Review
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{sellSubTab === 'counter' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Counter Offer Negotiations</h3>
						{counterOfferListings.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No counter offers in progress</p>
							</div>
						) : (
							<div className="space-y-4">
								{counterOfferListings.map((listing) => {
									const counterBids = listing.bids?.filter(b => 
										b.status === 'counter_offered' || b.status === 'counter_accepted_by_bidder'
									);
									return (
										<div key={listing._id || listing.id} className="bg-white border border-orange-200 rounded-xl p-5">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h4 className="font-semibold text-gray-900">{listing.company}</h4>
													<p className="text-sm text-gray-500">Original: {formatCurrency(listing.price)}</p>
												</div>
												<span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
													🔄 In Negotiation
												</span>
											</div>
											<div className="space-y-2">
												{counterBids?.map((bid) => (
													<div key={bid._id || bid.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
														<div className="flex items-start justify-between">
															<div>
																<p className="text-sm font-semibold text-gray-900">{bid.bidderName || bid.bidder}</p>
																<p className="text-xs text-gray-600 mt-1">
																	Counter: {formatCurrency(bid.counterPrice)} × {formatShares(bid.quantity)}
																</p>
																{bid.counterAt && (
																	<p className="text-xs text-gray-400 mt-1">{formatDate(bid.counterAt)}</p>
																)}
															</div>
															<button
																onClick={() => setSelectedItem({ item: listing, type: 'sell' })}
																className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition"
															>
																Respond
															</button>
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{sellSubTab === 'completed' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Transactions</h3>
						{completedListings.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No completed transactions yet</p>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								{completedListings.map((listing) => {
									const acceptedBid = listing.acceptedBid
										? listing.bids?.find((b) => b._id === listing.acceptedBid || b.id === listing.acceptedBid)
										: null;
									return (
										<div key={listing._id || listing.id} className="bg-white border border-green-200 rounded-xl p-5">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h4 className="font-semibold text-gray-900">{listing.company}</h4>
													<p className="text-xs text-gray-500">ISIN: {listing.isin || 'N/A'}</p>
												</div>
												<StatusBadge status={listing.status} />
											</div>
											{acceptedBid && (
												<div className="bg-green-50 rounded-lg p-4 border border-green-200">
													<p className="text-xs text-green-600 font-semibold mb-2">✅ Deal Closed</p>
													<div className="grid grid-cols-2 gap-3 text-sm">
														<div>
															<p className="text-xs text-gray-600">Buyer</p>
															<p className="font-semibold text-gray-900">{acceptedBid.bidderName || acceptedBid.bidder}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Final Price</p>
															<p className="font-semibold text-green-700">{formatCurrency(acceptedBid.counterPrice || acceptedBid.price)}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Quantity</p>
															<p className="font-semibold text-gray-900">{formatShares(acceptedBid.quantity)}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Status</p>
															<p className="font-semibold text-green-700 capitalize">{listing.status}</p>
														</div>
													</div>
												</div>
											)}
											{listing.closedAt && (
												<p className="text-xs text-gray-400 mt-3">Closed: {formatDate(listing.closedAt)}</p>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	const renderMyRequests = () => {
		// Filter buy requests based on sub-tab
		const openBuyStatuses = [
			'active',
			'pending_admin_approval',
			'pending',
			'under_review',
			'submitted',
			'awaiting_admin',
			'processing',
			'initiated',
			'draft'
		];
		const getStatusKey = (status) => (status ? status.toString().trim().toLowerCase() : 'pending_admin_approval');
		const myOpenRequests = myRequests.filter((r) => openBuyStatuses.includes(getStatusKey(r.status)));
		const offersReceived = myRequests.filter(r => r.offers && r.offers.length > 0);
		const counterOfferRequests = myRequests.filter(r => 
			r.offers?.some(o => o.status === 'counter_offered' || o.status === 'counter_accepted_by_offerer')
		);
		const completedRequests = myRequests.filter(r => 
			r.status === 'approved' || r.status === 'closed'
		);

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">🛒 Buy Management</h2>
						<p className="text-sm text-gray-500 mt-1">Manage your buy requests and received offers</p>
					</div>
					<button
						onClick={() => setFormType('buy')}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow hover:shadow-lg transition"
					>
						<span>➕</span>
						<span>New Buy Request</span>
					</button>
				</div>

				{/* Sub-tabs */}
				<div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
					<button
						onClick={() => setBuySubTab('list')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							buySubTab === 'list'
								? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
							📋 Buy List ({myOpenRequests.length})
					</button>
					<button
						onClick={() => setBuySubTab('offers')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							buySubTab === 'offers'
								? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						💰 Offers Received ({offersReceived.length})
					</button>
					<button
						onClick={() => setBuySubTab('counter')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							buySubTab === 'counter'
								? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						🔄 Counter Offers ({counterOfferRequests.length})
					</button>
					<button
						onClick={() => setBuySubTab('completed')}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
							buySubTab === 'completed'
								? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						✅ Completed ({completedRequests.length})
					</button>
				</div>

				{/* Content based on sub-tab */}
				{buySubTab === 'list' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Live & Pending Buy Requests</h3>
						{myOpenRequests.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No live or pending buy requests yet</p>
								<button
									onClick={() => setFormType('buy')}
									className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
								>
									<span>➕</span>
									<span>Create your first request</span>
								</button>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
								{myOpenRequests.map((request) => (
									<div key={request._id || request.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
										<div className="flex items-start justify-between">
											<div>
												<h4 className="font-semibold text-gray-900">{request.company}</h4>
												<p className="text-xs text-gray-500 mt-1">ISIN: {request.isin || 'N/A'}</p>
											</div>
											<StatusBadge status={request.status} />
										</div>
										<div className="mt-4 grid grid-cols-2 gap-3">
											<div className="bg-blue-50 rounded-lg p-3">
												<p className="text-xs text-blue-600 font-semibold">Target Price</p>
												<p className="text-sm font-bold text-blue-700 mt-1">{formatCurrency(request.price)}</p>
											</div>
											<div className="bg-gray-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 font-semibold">Quantity</p>
												<p className="text-sm font-bold text-gray-700 mt-1">{formatShares(request.shares)}</p>
											</div>
										</div>
										<div className="mt-4 flex items-center justify-between text-xs">
											<span className="text-gray-500">Offers: {request.offers?.length || 0}</span>
											<span className="text-gray-400">{formatDate(request.createdAt)}</span>
										</div>
										<button
											onClick={() => setSelectedItem({ item: request, type: 'buy' })}
											className="mt-4 w-full px-4 py-2 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
										>
											View Details
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{buySubTab === 'offers' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Offers Received from Sellers</h3>
						{offersReceived.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No offers received yet</p>
							</div>
						) : (
							<div className="space-y-4">
								{offersReceived.map((request) => (
									<div key={request._id || request.id} className="bg-white border border-gray-200 rounded-xl p-5">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h4 className="font-semibold text-gray-900">{request.company}</h4>
												<p className="text-sm text-gray-500">Your request: {formatCurrency(request.price)} for {formatShares(request.shares)}</p>
											</div>
											<StatusBadge status={request.status} />
										</div>
										<div className="space-y-2">
											<p className="text-sm font-semibold text-gray-700">Received Offers ({request.offers?.length || 0}):</p>
											{request.offers?.map((offer) => (
												<div key={offer._id || offer.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
													<div>
														<p className="text-sm font-semibold text-gray-900">
															{offer.sellerName || offer.seller}
														</p>
														<p className="text-xs text-gray-600">
															{formatCurrency(offer.counterPrice || offer.price)} × {formatShares(offer.quantity)}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<InteractionBadge status={offer.status} />
														<button
															onClick={() => setSelectedItem({ item: request, type: 'buy' })}
															className="px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200"
														>
															Review
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{buySubTab === 'counter' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Counter Offer Negotiations</h3>
						{counterOfferRequests.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No counter offers in progress</p>
							</div>
						) : (
							<div className="space-y-4">
								{counterOfferRequests.map((request) => {
									const counterOffers = request.offers?.filter(o => 
										o.status === 'counter_offered' || o.status === 'counter_accepted_by_offerer'
									);
									return (
										<div key={request._id || request.id} className="bg-white border border-orange-200 rounded-xl p-5">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h4 className="font-semibold text-gray-900">{request.company}</h4>
													<p className="text-sm text-gray-500">Original: {formatCurrency(request.price)}</p>
												</div>
												<span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
													🔄 In Negotiation
												</span>
											</div>
											<div className="space-y-2">
												{counterOffers?.map((offer) => (
													<div key={offer._id || offer.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
														<div className="flex items-start justify-between">
															<div>
																<p className="text-sm font-semibold text-gray-900">{offer.sellerName || offer.seller}</p>
																<p className="text-xs text-gray-600 mt-1">
																	Counter: {formatCurrency(offer.counterPrice)} × {formatShares(offer.quantity)}
																</p>
																{offer.counterAt && (
																	<p className="text-xs text-gray-400 mt-1">{formatDate(offer.counterAt)}</p>
																)}
															</div>
															<button
																onClick={() => setSelectedItem({ item: request, type: 'buy' })}
																className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition"
															>
																Respond
															</button>
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{buySubTab === 'completed' && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Transactions</h3>
						{completedRequests.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
								<p className="text-gray-500">No completed transactions yet</p>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								{completedRequests.map((request) => {
									const acceptedOffer = request.acceptedOffer 
										? request.offers?.find(o => o.id === request.acceptedOffer)
										: null;
									return (
										<div key={request.id} className="bg-white border border-green-200 rounded-xl p-5">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h4 className="font-semibold text-gray-900">{request.company}</h4>
													<p className="text-xs text-gray-500">ISIN: {request.isin || 'N/A'}</p>
												</div>
												<StatusBadge status={request.status} />
											</div>
											{acceptedOffer && (
												<div className="bg-green-50 rounded-lg p-4 border border-green-200">
													<p className="text-xs text-green-600 font-semibold mb-2">✅ Deal Closed</p>
													<div className="grid grid-cols-2 gap-3 text-sm">
														<div>
															<p className="text-xs text-gray-600">Seller</p>
															<p className="font-semibold text-gray-900">{acceptedOffer.sellerName || acceptedOffer.seller}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Final Price</p>
															<p className="font-semibold text-green-700">{formatCurrency(acceptedOffer.counterPrice || acceptedOffer.price)}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Quantity</p>
															<p className="font-semibold text-gray-900">{formatShares(acceptedOffer.quantity)}</p>
														</div>
														<div>
															<p className="text-xs text-gray-600">Status</p>
															<p className="font-semibold text-green-700 capitalize">{request.status}</p>
														</div>
													</div>
												</div>
											)}
											{request.closedAt && (
												<p className="text-xs text-gray-400 mt-3">Closed: {formatDate(request.closedAt)}</p>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	const renderBrowse = () => (
		<div className="space-y-8">
			<SectionHeader
				title="Explore Marketplace"
				subtitle="Discover fresh opportunities and respond instantly with bids or offers."
			/>
		<div className="flex flex-wrap items-center gap-3 border border-gray-200 bg-white rounded-2xl p-3">
			<button
				onClick={() => setBrowseFilter('sell')}
				className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
					browseFilter === 'sell'
						? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow'
						: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
				}`}
			>
				<span>📋</span>
				<span>Available Listings</span>
			</button>
			<button
				onClick={() => setBrowseFilter('buy')}
				className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
					browseFilter === 'buy'
						? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow'
						: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
				}`}
			>
				<span>🛒</span>
				<span>Open Buy Requests</span>
			</button>
		</div>			{browseFilter === 'sell' ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{availableListings.length === 0 ? (
						<EmptyState
							icon=""
							title="No active listings from others"
							description="Check back soon or post a buy request to let sellers know what you need."
							actionLabel="Post buy request"
							onAction={() => setFormType('buy')}
						/>
					) : (
						availableListings.map((listing) => {
							const company = companies.find((c) => c.isin === listing.isin || c.name.toLowerCase() === listing.company.toLowerCase());
							const myBid = listing.bids?.find((bid) => bid.bidder === user.name || bid.bidder === user.email);
							const sellerUsername = listing.userId?.username || listing.sellerName || 'Unknown';
							const listingDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
							
							return (
								<div key={listing.id || listing._id} className="bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 rounded-xl p-4 shadow-md hover:shadow-lg hover:border-emerald-200 transition-all duration-200">
									<div className="flex items-start justify-between gap-3 mb-2">
										<div className="flex-1">
											<h3 className="text-base font-bold text-gray-900 mb-1.5">{listing.company}</h3>
											<div className="flex flex-wrap items-center gap-1.5">
												<div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded-md">
													<span className="text-emerald-600 text-xs">👤</span>
													<span className="text-xs font-semibold text-emerald-700">{sellerUsername}</span>
												</div>
												{listingDate && (
													<div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
														<span className="text-blue-500 text-xs">📅</span>
														<span className="text-xs font-medium text-blue-700">{listingDate}</span>
													</div>
												)}
												{company?.sector && (
													<div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-100 rounded-md">
														<span className="text-purple-500 text-xs">🏢</span>
														<span className="text-xs font-medium text-purple-700">{company.sector}</span>
													</div>
												)}
											</div>
										</div>
										<StatusBadge status={listing.status} />
									</div>
									<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
										<div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-2.5">
											<p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-0.5">💰 Price</p>
											<p className="text-base font-bold text-emerald-700">{formatCurrency(listing.price)}</p>
										</div>
										<div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-2.5">
											<p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-0.5">📊 Shares</p>
											<p className="text-base font-bold text-slate-800">{formatShares(listing.shares)}</p>
										</div>
									</div>
									<div className="mt-3 flex gap-1.5">
										<button
											onClick={() => {
												setTradeContext({ type: 'bid', item: listing });
												setBidOfferData({ price: listing.price, quantity: listing.shares });
											}}
											className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow hover:shadow-md hover:scale-[1.02] transition-all duration-200"
										>
											<span>💰</span>
											<span>{myBid ? 'Update' : 'Bid'}</span>
										</button>
										<button
											onClick={() => {
												const shareText = `Check out ${listing.company} shares on Nlist!\n\n💰 Price: ${formatCurrency(listing.price)}\n📊 Shares: ${formatShares(listing.shares)}\n🔗 Visit: ${window.location.origin}`;
												if (navigator.share) {
													navigator.share({ title: `${listing.company} - Nlist`, text: shareText, url: window.location.href });
												} else {
													navigator.clipboard.writeText(shareText);
													alert('Link copied to clipboard!');
												}
											}}
											className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white bg-gradient-to-br from-blue-500 to-cyan-500 hover:shadow-md hover:scale-105 transition-all duration-200"
											title="Share"
										>
											<span className="text-sm">📤</span>
										</button>
										<button
											onClick={() => {
												const reportContent = `
===========================================
NLIST - RESEARCH REPORT
===========================================

Company: ${listing.company}
ISIN: ${listing.isin || 'N/A'}
Sector: ${company?.sector || 'N/A'}

LISTING DETAILS
--------------
Seller: ${sellerUsername}
Ask Price: ${formatCurrency(listing.price)}
Available Shares: ${formatShares(listing.shares)}
Listed Date: ${listingDate}
Status: ${listing.status}

Market Overview: ${company?.description || 'N/A'}

===========================================
Generated on: ${new Date().toLocaleString('en-IN')}
Report ID: ${listing._id || listing.id}
===========================================
												`.trim();
												
												const blob = new Blob([reportContent], { type: 'text/plain' });
												const url = URL.createObjectURL(blob);
												const a = document.createElement('a');
												a.href = url;
												a.download = `${listing.company}-Research-Report.txt`;
												a.click();
												URL.revokeObjectURL(url);
											}}
											className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white bg-gradient-to-br from-purple-500 to-pink-500 hover:shadow-md hover:scale-105 transition-all duration-200"
											title="Download"
										>
											<span className="text-sm">📥</span>
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{availableRequests.length === 0 ? (
						<EmptyState
							icon=""
							title="No open requests from others"
							description="List your shares for sale and reach serious buyers faster."
							actionLabel="Create listing"
							onAction={() => setFormType('sell')}
						/>
					) : (
						availableRequests.map((request) => {
							const company = companies.find((c) => c.isin === request.isin || c.name.toLowerCase() === request.company.toLowerCase());
							const myOffer = request.offers?.find((offer) => offer.seller === user.name || offer.seller === user.email);
							return (
								<div key={request.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
									<div className="flex items-start justify-between gap-4">
										<div>
											<h3 className="text-lg font-semibold text-gray-900">{request.company}</h3>
											<p className="text-xs text-gray-500 mt-1">Buyer: {getUserDisplayName(request.buyer, request.buyer)}</p>
											{company?.sector && <p className="text-xs text-gray-400 mt-1">Sector: {company.sector}</p>}
										</div>
										<StatusBadge status={request.status} />
									</div>
									<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
										<div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
											<p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Target price</p>
											<p className="mt-1 text-base font-semibold text-blue-700">{formatCurrency(request.price)}</p>
										</div>
										<div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
											<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Shares needed</p>
											<p className="mt-1 text-base font-semibold text-slate-700">{formatShares(request.shares)}</p>
										</div>
									</div>
									<div className="mt-5 flex flex-col gap-3">
										<button
											onClick={() => {
												setTradeContext({ type: 'offer', item: request });
												setBidOfferData({ price: request.price, quantity: request.shares });
											}}
											className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow hover:shadow-lg transition"
										>
											<span></span>
											<span>{myOffer ? 'Update offer' : 'Make offer'}</span>
										</button>
										<button
											onClick={() => setSelectedItem({ item: request, type: 'buy' })}
											className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-purple-600 border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition"
										>
											<span></span>
											<span>See offer history</span>
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);

	const renderOrders = () => {
		// Combine all active and previous orders
		const activeOrders = [
			...myListings.filter(l => l.status === 'active' || l.status === 'pending_admin_approval'),
			...myRequests.filter(r => r.status === 'active' || r.status === 'pending_admin_approval')
		];
		
		const previousOrders = [
			...myListings.filter(l => l.status === 'approved' || l.status === 'closed'),
			...myRequests.filter(r => r.status === 'approved' || r.status === 'closed')
		];

		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">📋 Orders & Transactions</h2>
					<p className="text-sm text-gray-500 mt-1">Track all your active and completed deals</p>
				</div>

				{/* Active Orders */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<span>⚡</span>
						<span>Active Orders ({activeOrders.length})</span>
					</h3>
					{activeOrders.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
							<p className="text-gray-500">No active orders</p>
						</div>
					) : (
						<div className="space-y-3">
							{activeOrders.map((order) => {
								const isSell = 'seller' in order || 'bids' in order;
								
								return (
									<div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3">
													<span className="text-2xl">{isSell ? '📈' : '🛒'}</span>
													<div>
														<h4 className="font-semibold text-gray-900">{order.company}</h4>
														<p className="text-xs text-gray-500">
															{isSell ? 'Sell Listing' : 'Buy Request'} • {formatDate(order.createdAt)}
														</p>
													</div>
												</div>
												<div className="mt-4 grid grid-cols-3 gap-4">
													<div>
														<p className="text-xs text-gray-600">Price</p>
														<p className="text-sm font-semibold text-gray-900">{formatCurrency(order.price)}</p>
													</div>
													<div>
														<p className="text-xs text-gray-600">Quantity</p>
														<p className="text-sm font-semibold text-gray-900">{formatShares(order.shares)}</p>
													</div>
													<div>
														<p className="text-xs text-gray-600">
															{isSell ? 'Bids' : 'Offers'}
														</p>
														<p className="text-sm font-semibold text-gray-900">
															{isSell ? (order.bids?.length || 0) : (order.offers?.length || 0)}
														</p>
													</div>
												</div>
											</div>
											<div className="flex flex-col items-end gap-2">
												<StatusBadge status={order.status} />
												<button
													onClick={() => setSelectedItem({ item: order, type: isSell ? 'sell' : 'buy' })}
													className="px-3 py-1 rounded-lg text-xs font-semibold text-purple-600 bg-purple-100 hover:bg-purple-200"
												>
													View Details
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Previous Orders */}
				<div className="pt-6 border-t border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<span>📜</span>
						<span>Previous Orders ({previousOrders.length})</span>
					</h3>
					{previousOrders.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
							<p className="text-gray-500">No previous orders</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{previousOrders.map((order) => {
								const isSell = 'seller' in order || 'bids' in order;
								const acceptedItem = isSell 
									? order.bids?.find(b => b.id === order.acceptedBid)
									: order.offers?.find(o => o.id === order.acceptedOffer);
								
								return (
									<div key={order.id} className="bg-white border border-green-200 rounded-xl p-4">
										<div className="flex items-start gap-3 mb-3">
											<span className="text-xl">{isSell ? '📈' : '🛒'}</span>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-900">{order.company}</h4>
												<p className="text-xs text-gray-500">{isSell ? 'Sell' : 'Buy'}</p>
											</div>
											<StatusBadge status={order.status} />
										</div>
										{acceptedItem && (
											<div className="bg-green-50 rounded-lg p-3 border border-green-200">
												<p className="text-xs text-green-600 font-semibold mb-2">✅ Deal Completed</p>
												<div className="grid grid-cols-2 gap-2 text-xs">
													<div>
														<p className="text-gray-600">{isSell ? 'Buyer' : 'Seller'}</p>
														<p className="font-semibold">
															{isSell ? (acceptedItem.bidderName || acceptedItem.bidder) : (acceptedItem.sellerName || acceptedItem.seller)}
														</p>
													</div>
													<div>
														<p className="text-gray-600">Final Price</p>
														<p className="font-semibold text-green-700">
															{formatCurrency(acceptedItem.counterPrice || acceptedItem.price)}
														</p>
													</div>
												</div>
											</div>
										)}
										{order.closedAt && (
											<p className="text-xs text-gray-400 mt-2">Closed: {formatDate(order.closedAt)}</p>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderPortfolio = () => {
		const { holdings, updateCurrentPrice } = portfolio;
		const summary = portfolio.getPortfolioSummary();

		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">💼 My Portfolio</h2>
					<p className="text-sm text-gray-500 mt-1">Track your unlisted share investments</p>
				</div>

				{/* Portfolio Summary */}
				<div className="grid gap-4 md:grid-cols-4">
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
						<p className="text-sm opacity-90">Total Holdings</p>
						<p className="text-3xl font-bold mt-2">{summary.totalHoldings}</p>
					</div>
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
						<p className="text-sm opacity-90">Invested</p>
						<p className="text-2xl font-bold mt-2">{formatCurrency(summary.totalInvestment)}</p>
					</div>
					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
						<p className="text-sm opacity-90">Current Value</p>
						<p className="text-2xl font-bold mt-2">{formatCurrency(summary.currentValue)}</p>
					</div>
					<div className={`bg-gradient-to-br rounded-xl p-5 text-white ${summary.totalGainLoss >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'}`}>
						<p className="text-sm opacity-90">Gain/Loss</p>
						<p className="text-2xl font-bold mt-2">
							{summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
						</p>
						<p className="text-xs opacity-75 mt-1">{summary.gainLossPercent >= 0 ? '+' : ''}{summary.gainLossPercent.toFixed(2)}%</p>
					</div>
				</div>

				{/* Holdings List */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h3>
					{holdings.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
							<p className="text-gray-500">No holdings yet. Complete a buy transaction to add shares to your portfolio.</p>
						</div>
					) : (
						<div className="space-y-3">
							{holdings.map((holding) => {
								const investment = holding.purchasePrice * holding.quantity;
								const currentVal = holding.currentPrice * holding.quantity;
								const gain = currentVal - investment;
								const gainPercent = ((gain / investment) * 100);

								return (
									<div key={holding.id} className="bg-white border border-gray-200 rounded-xl p-5">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h4 className="font-semibold text-gray-900">{holding.company}</h4>
												<p className="text-xs text-gray-500">ISIN: {holding.isin}</p>
												<p className="text-xs text-gray-400">Purchased: {formatDate(holding.purchaseDate)}</p>
											</div>
											<div className={`px-3 py-1 rounded-full text-xs font-semibold ${gain >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
												{gain >= 0 ? '↗' : '↘'} {gain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
											</div>
										</div>

										<div className="grid grid-cols-4 gap-4 mb-4">
											<div>
												<p className="text-xs text-gray-600">Quantity</p>
												<p className="text-sm font-semibold text-gray-900">{formatShares(holding.quantity)}</p>
											</div>
											<div>
												<p className="text-xs text-gray-600">Buy Price</p>
												<p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.purchasePrice)}</p>
											</div>
											<div>
												<p className="text-xs text-gray-600">Current Price</p>
												{editingPrice === holding.id ? (
													<input
														type="number"
														value={newPrice}
														onChange={(e) => setNewPrice(e.target.value)}
														className="w-full px-2 py-1 text-sm border rounded"
														autoFocus
														onBlur={() => {
															if (newPrice && parseFloat(newPrice) > 0) {
																updateCurrentPrice(holding.id, parseFloat(newPrice));
															}
															setEditingPrice(null);
															setNewPrice('');
														}}
													/>
												) : (
													<button
														onClick={() => {
															setEditingPrice(holding.id);
															setNewPrice(holding.currentPrice.toString());
														}}
														className="text-sm font-semibold text-blue-600 hover:text-blue-700"
													>
														{formatCurrency(holding.currentPrice)} ✏️
													</button>
												)}
											</div>
											<div>
												<p className="text-xs text-gray-600">Total Value</p>
												<p className={`text-sm font-semibold ${gain >= 0 ? 'text-green-700' : 'text-red-700'}`}>
													{formatCurrency(currentVal)}
												</p>
											</div>
										</div>

										<div className="flex gap-2">
											<button
												onClick={() => {
													setFormType('sell');
													setFormData({ company: holding.company, isin: holding.isin, price: holding.currentPrice.toString(), shares: holding.quantity.toString() });
												}}
												className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
											>
												📈 Sell
											</button>
											<button
												onClick={() => {
													setFormType('buy');
													setFormData({ company: holding.company, isin: holding.isin, price: holding.currentPrice.toString(), shares: '' });
												}}
												className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
											>
												🛒 Buy More
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderFAQ = () => {
		const faqs = [
			{
				q: "What are unlisted shares?",
				a: "Unlisted shares are equity shares of companies that are not listed on recognized stock exchanges like NSE or BSE. These shares can be bought and sold through private transactions."
			},
			{
				q: "How does the trading process work?",
				a: "1. Sellers list their shares with asking price. 2. Buyers either accept the price or place bids. 3. Sellers can counter-offer. 4. Once both parties agree, admin reviews and approves the transaction."
			},
			{
				q: "Is it safe to trade unlisted shares here?",
				a: "Yes! All transactions go through admin verification. We verify both buyers and sellers before finalizing any deal. However, please do your own due diligence before investing."
			},
			{
				q: "What documents do I need?",
				a: "For selling: Share certificates, PAN card, Demat account details. For buying: PAN card, Demat account, and payment proof after deal confirmation."
			},
			{
				q: "How long does transaction approval take?",
				a: "Typically 1-3 business days after both parties accept the deal. Admin verifies all documents before final approval."
			},
			{
				q: "Can I cancel my listing or request?",
				a: "Yes, you can cancel active listings/requests anytime before a bid/offer is accepted. Once accepted and pending admin approval, cancellation requires admin consent."
			},
			{
				q: "What fees do you charge?",
				a: "Platform fee details are shared during transaction approval. Generally, a small percentage of transaction value is charged to ensure quality service."
			},
			{
				q: "How do I update share prices in my portfolio?",
				a: "Click the edit icon (✏️) next to current price in your portfolio section. You can manually update prices based on latest valuations."
			}
		];

		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">❓ Frequently Asked Questions</h2>
					<p className="text-sm text-gray-500 mt-1">Everything you need to know about trading unlisted shares</p>
				</div>

				<div className="space-y-3">
					{faqs.map((faq, index) => (
						<div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
							<button
								onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
								className="w-full px-5 py-4 text-left flex items-start justify-between hover:bg-gray-50 transition"
							>
								<div className="flex-1">
									<h4 className="font-semibold text-gray-900">{faq.q}</h4>
								</div>
								<span className="text-xl ml-4">{openFaqIndex === index ? '−' : '+'}</span>
							</button>
							{openFaqIndex === index && (
								<div className="px-5 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
									<p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
					<h4 className="font-semibold text-blue-900 mb-2">Still have questions?</h4>
					<p className="text-sm text-blue-700 mb-4">Our support team is here to help you!</p>
					<button
						onClick={() => setActiveTab('support')}
						className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
					>
						Contact Support
					</button>
				</div>
			</div>
		);
	};

	const renderSupport = () => {
		const handleSubmit = (e) => {
			e.preventDefault();
			// In real app, this would send email to admin
			console.log('Support request:', supportForm);
			showNotification('success', 'Message Sent!', 'Our support team will get back to you within 24 hours.');
			setSupportSubmitted(true);
			setTimeout(() => {
				setSupportSubmitted(false);
				setSupportForm({ subject: '', message: '' });
			}, 3000);
		};

		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">💬 Support & Help</h2>
					<p className="text-sm text-gray-500 mt-1">Get assistance from our team</p>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
						<div className="text-3xl mb-3">📧</div>
						<h4 className="font-semibold mb-2">Email Support</h4>
						<p className="text-sm opacity-90">support@unlistedhub.com</p>
						<p className="text-xs opacity-75 mt-2">Response within 24 hours</p>
					</div>
					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
						<div className="text-3xl mb-3">📱</div>
						<h4 className="font-semibold mb-2">Phone Support</h4>
						<p className="text-sm opacity-90">+91 1234567890</p>
						<p className="text-xs opacity-75 mt-2">Mon-Fri, 9 AM - 6 PM</p>
					</div>
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
						<div className="text-3xl mb-3">💬</div>
						<h4 className="font-semibold mb-2">Live Chat</h4>
						<p className="text-sm opacity-90">Coming Soon</p>
						<p className="text-xs opacity-75 mt-2">Instant assistance</p>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h3>
					{supportSubmitted ? (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">✅</div>
							<h4 className="text-xl font-semibold text-green-700 mb-2">Message Sent Successfully!</h4>
							<p className="text-gray-600">We'll get back to you within 24 hours.</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
								<input
									type="text"
									value={supportForm.subject}
									onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="What do you need help with?"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
								<textarea
									value={supportForm.message}
									onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
									placeholder="Describe your issue or question in detail..."
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition"
							>
								Send Message
							</button>
						</form>
					)}
				</div>
			</div>
		);
	};

	const renderActiveTab = () => {
		switch (activeTab) {
			case 'marketplace':
				return renderBrowse();
			case 'buy':
				return renderMyRequests();
			case 'sell':
				return renderMyListings();
			case 'orders':
				return renderOrders();
			case 'portfolio':
				return renderPortfolio();
			case 'faq':
				return renderFAQ();
			case 'support':
				return renderSupport();
			default:
				return renderBrowse();
		}
	};

	const renderNegotiationModal = () => {
		if (!selectedItem) return null;
		const { item, type } = selectedItem;
		const interactions = type === 'sell' ? item.bids || [] : item.offers || [];
		const isOwner = type === 'sell'
			? item.seller === user.name || item.seller === user.email
			: item.buyer === user.name || item.buyer === user.email;

		const handleClose = () => setSelectedItem(null);

		const onAccept = (interactionId) => {
			if (type === 'sell') {
				acceptBid(item.id, interactionId);
				showNotification('success', 'Bid accepted ?', 'We have notified the bidder. Await admin approval.');
			} else {
				acceptOffer(item.id, interactionId);
				showNotification('success', 'Offer accepted ?', 'Seller will be notified immediately.');
			}
			setSelectedItem(null);
		};

		const onCounter = (interactionId) => {
			const newPrice = prompt('Enter your counter price');
			if (!newPrice) return;
			counterOffer(item.id, interactionId, newPrice, type);
			showNotification('info', 'Counter submitted ', `Proposed new price: ?${newPrice}`);
			setSelectedItem(null);
		};

		const onAcceptCounter = (interactionId) => {
			acceptCounterOffer(item.id, interactionId, type);
			showNotification('success', 'Counter accepted ', 'Admin will review the final terms.');
			setSelectedItem(null);
		};

		const onRejectCounter = (interactionId) => {
			rejectCounterOffer(item.id, interactionId, type);
			showNotification('warning', 'Counter rejected', 'Let them know what price works for you.');
			setSelectedItem(null);
		};

		return (
			<div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4 animate-fadeIn">
				<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
					<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{type === 'sell' ? 'Sell listing' : 'Buy request'}</p>
							<h3 className="text-2xl font-bold text-gray-900 mt-1">{item.company}</h3>
							<p className="text-sm text-gray-500 mt-1">{formatCurrency(item.price)} � {formatShares(item.shares)}</p>
						</div>
						<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="overflow-y-auto px-6 py-6 space-y-5">
						{interactions.length === 0 ? (
							<p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
								No negotiations yet. Encourage the other side to respond by sending an offer or bid.
							</p>
						) : (
							interactions.map((interaction) => {
								const interactionOwner = type === 'sell' ? interaction.bidder : interaction.seller;
								const canAcceptCounter = ['counter_offered'].includes(interaction.status) && !isOwner;
								const canCounter = ['pending', 'counter_offered'].includes(interaction.status) && isOwner;
								const canAccept = ['pending', 'counter_accepted_by_bidder', 'counter_accepted_by_offerer'].includes(interaction.status) && isOwner;
								const displayPrice = interaction.counterPrice || interaction.price;
								return (
									<div key={interaction.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
										<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-gray-900">
													{getUserDisplayName(interactionOwner, interactionOwner)}
												</p>
												<p className="text-xs text-gray-500 mt-1">Submitted {formatDateTime(interaction.counterAt || interaction.createdAt)}</p>
											</div>
											<InteractionBadge status={interaction.status} />
										</div>

										<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
											<div className="rounded-lg bg-white border border-gray-200 p-3">
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price per share</p>
												<p className="mt-1 text-base font-semibold text-gray-900">{formatCurrency(displayPrice)}</p>
											</div>
											<div className="rounded-lg bg-white border border-gray-200 p-3">
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</p>
												<p className="mt-1 text-base font-semibold text-gray-900">{formatShares(interaction.quantity || interaction.shares)}</p>
											</div>
											<div className="rounded-lg bg-white border border-gray-200 p-3">
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
												<p className="mt-1 text-base font-semibold text-gray-900">{getInteractionMeta(interaction.status).label}</p>
											</div>
										</div>

										<div className="mt-4 flex flex-wrap gap-3">
											{isOwner && canAccept && (
												<button
													onClick={() => onAccept(interaction.id)}
													className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow hover:shadow-lg transition"
												>
													<span>?</span>
													<span>Accept</span>
												</button>
											)}
											{isOwner && canCounter && (
												<button
													onClick={() => onCounter(interaction.id)}
													className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-orange-600 border border-orange-200 bg-orange-50/40 hover:bg-orange-50 transition"
												>
													<span></span>
													<span>Counter offer</span>
												</button>
											)}
											{!isOwner && canAcceptCounter && (
												<button
													onClick={() => onAcceptCounter(interaction.id)}
													className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow hover:shadow-lg transition"
												>
													<span></span>
													<span>Accept counter</span>
												</button>
											)}
											{!isOwner && canAcceptCounter && (
												<button
													onClick={() => onRejectCounter(interaction.id)}
													className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-rose-600 border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition"
												>
													<span>?</span>
													<span>Reject counter</span>
												</button>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		);
	};

	const renderFormModal = () => {
		if (!formType) return null;

		const closeModal = () => {
			setFormType(null);
			setFormData({ company: '', isin: '', price: '', shares: '' });
			setCompanySuggestions([]);
		};

		const isSell = formType === 'sell';
		const title = isSell ? 'List Shares for Sale' : 'Post Buy Request';
		const onSubmit = isSell ? handleCreateSellListing : handleCreateBuyRequest;

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4 animate-fadeIn">
				<div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-slideUp">
					<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
						<h2 className="text-2xl font-bold text-gray-900">{title}</h2>
						<button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
						<div className="relative">
							<label className="block text-sm font-semibold mb-2 text-gray-700">Company Name</label>
							<input
								type="text"
								value={formData.company}
								onChange={(e) => handleCompanySearch(e.target.value)}
								placeholder="Type to search company..."
								className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
								required
							/>
							{companySuggestions.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
									{companySuggestions.map((company) => (
										<button
											type="button"
											key={company.id}
											onClick={() => selectCompany(company)}
											className="w-full px-4 py-3 text-left hover:bg-purple-50 transition border-b border-gray-100 last:border-b-0"
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-semibold text-gray-900">{company.name}</p>
													<p className="text-xs text-gray-500">ISIN: {company.isin}</p>
												</div>
												{company.currentPrice && (
													<span className="text-xs font-semibold text-purple-600">{formatCurrency(company.currentPrice)}</span>
												)}
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						<div>
							<label className="block text-sm font-semibold mb-2 text-gray-700">ISIN</label>
							<input
								type="text"
								value={formData.isin}
								onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
								placeholder="e.g. INE123456789"
								className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
								required
							/>
						</div>

						<div className="grid sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold mb-2 text-gray-700">Price per share (?)</label>
								<input
									type="number"
									value={formData.price}
									onChange={(e) => setFormData({ ...formData, price: e.target.value })}
									min="1"
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold mb-2 text-gray-700">Number of shares</label>
								<input
									type="number"
									value={formData.shares}
									onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
									min="1"
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
									required
								/>
							</div>
						</div>

						<div className="flex flex-wrap gap-3 pt-4">
							<button
								type="button"
								onClick={closeModal}
								className="flex-1 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition"
							>
								{isSell ? 'Create listing' : 'Post request'}
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	const renderTradeModal = () => {
		if (!tradeContext) return null;
		const isBid = tradeContext.type === 'bid';
		const title = isBid ? 'Place bid' : 'Make offer';
		const submitHandler = isBid ? handlePlaceBid : handleMakeOffer;

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4 animate-fadeIn">
				<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
					<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{title}</h2>
							<p className="text-sm text-gray-500 mt-1">{tradeContext.item.company}</p>
						</div>
						<button onClick={() => { setTradeContext(null); setBidOfferData({ price: '', quantity: '' }); }} className="text-gray-400 hover:text-gray-600 transition">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<form onSubmit={submitHandler} className="px-6 py-6 space-y-4">
						<div>
							<label className="block text-sm font-semibold mb-2 text-gray-700">Price per share (?)</label>
							<input
								type="number"
								value={bidOfferData.price}
								onChange={(e) => setBidOfferData({ ...bidOfferData, price: e.target.value })}
								min="1"
								className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
							<input
								type="number"
								value={bidOfferData.quantity}
								onChange={(e) => setBidOfferData({ ...bidOfferData, quantity: e.target.value })}
								min="1"
								className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white outline-none transition"
								required
							/>
						</div>
						<div className="flex flex-wrap gap-3 pt-4">
							<button
								type="button"
								onClick={() => { setTradeContext(null); setBidOfferData({ price: '', quantity: '' }); }}
								className="flex-1 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition"
							>
								{isBid ? 'Submit bid' : 'Submit offer'}
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
			<Notification
				show={notification.show}
				type={notification.type}
				title={notification.title}
				message={notification.message}
				onClose={() => setNotification({ ...notification, show: false })}
			/>

			{/* Left Sidebar Navigation */}
			<aside className="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl fixed h-screen overflow-y-auto sidebar-scroll">
				{/* Logo & User Info */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl shadow-lg">
							👤
						</div>
						<div className="flex-1">
							<h3 className="text-white font-bold text-base truncate">{user.name}</h3>
							<div className="flex items-center gap-1 mt-1">
								<p className="text-purple-200 text-xs truncate">{currentUsername}</p>
								<button
									onClick={handleUsernameChange}
									className="text-purple-200 hover:text-white transition-colors"
									title="Change username"
								>
									<svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
								</button>
							</div>
							<p className="text-purple-300 text-xs mt-1">ID: {user.userId || 'N/A'}</p>
						</div>
					</div>
				</div>

				{/* Navigation Menu */}
				<nav className="flex-1 p-4 space-y-2">
					{navItems.map((nav) => (
						<button
							key={nav.id}
							onClick={() => setActiveTab(nav.id)}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
								activeTab === nav.id
									? 'bg-white text-purple-700 shadow-lg shadow-purple-500/50 scale-105'
									: 'text-white hover:bg-white/10 hover:scale-105'
							}`}
						>
							<span className="text-xl">{nav.icon}</span>
							<span className="flex-1 text-left">{nav.label}</span>
							{typeof nav.counter === 'number' && nav.counter > 0 && (
								<span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${
									activeTab === nav.id 
										? 'bg-purple-100 text-purple-700' 
										: 'bg-white/20 text-white border border-white/30'
								}`}>
									{nav.counter}
								</span>
							)}
						</button>
					))}
				</nav>

				{/* Bottom Actions */}
				<div className="p-4 border-t border-white/10 space-y-2">
					<button
						onClick={() => setShowProfileModal(true)}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all"
					>
						<span className="text-lg">👤</span>
						<span>Profile</span>
					</button>
					<button
						onClick={() => setShowPasswordModal(true)}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all"
					>
						<span className="text-lg">🔐</span>
						<span>Password</span>
					</button>
					<button
						onClick={() => {
							logout();
							setPage('home');
						}}
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
									{getGreeting()}, {user.name.split(' ')[0]}! 👋
								</h1>
								<p className="text-sm text-purple-600 font-medium mt-1 italic">
									✨ {getDailyQuote()}
								</p>
							</div>
							
							{/* Mobile Menu Button */}
							<button className="lg:hidden p-2 rounded-lg bg-purple-100 text-purple-700">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							</button>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="p-6">
					{/* KYC Banner */}
					{kycStatus !== 'verified' && (
						<div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-semibold text-amber-800">KYC Status: {kycStatus.replace(/_/g, ' ')}</p>
									<p className="text-xs text-amber-700 mt-1">Please complete your KYC to get a verified badge and faster approvals.</p>
								</div>
								<div className="flex items-center gap-2">
									{!showKycForm && (
										<button onClick={() => setShowKycForm(true)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700">Upload KYC</button>
									)}
								</div>
							</div>
							{showKycForm && (
								<form onSubmit={handleKycSubmit} className="mt-3 grid md:grid-cols-2 gap-3">
									<input type="text" placeholder="PAN" value={kycDocs.pan} onChange={(e) => setKycDocs({ ...kycDocs, pan: e.target.value })} className="px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required />
									<input type="text" placeholder="Address Proof" value={kycDocs.addressProof} onChange={(e) => setKycDocs({ ...kycDocs, addressProof: e.target.value })} className="px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required />
									<input type="text" placeholder="CML Copy" value={kycDocs.cmlCopy} onChange={(e) => setKycDocs({ ...kycDocs, cmlCopy: e.target.value })} className="px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required />
									<input type="text" placeholder="Bank Details" value={kycDocs.bankDetails} onChange={(e) => setKycDocs({ ...kycDocs, bankDetails: e.target.value })} className="px-3 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required />
									<div className="md:col-span-2 flex items-center gap-2">
										<button type="submit" className="px-4 py-2 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Submit</button>
										<button type="button" className="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" onClick={() => setShowKycForm(false)}>Cancel</button>
									</div>
								</form>
							)}
						</div>
					)}
					<div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
						<div className="p-6">
							<div className="animate-fadeIn">
								{renderActiveTab()}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="mt-8 text-center">
						<p className="text-sm text-gray-500">
							💼 Manage your unlisted shares portfolio with confidence
						</p>
					</div>
				</main>
			</div>

			{renderFormModal()}
			{renderTradeModal()}
			{renderNegotiationModal()}

			{showProfileModal && (
				<UserProfile onClose={() => setShowProfileModal(false)} />
			)}

			{showPasswordModal && (
				<ChangePassword onClose={() => setShowPasswordModal(false)} />
			)}
		</div>
	);
}



