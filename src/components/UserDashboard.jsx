import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListing } from '../context/ListingContext';
import { useCompany } from '../context/CompanyContext';
import { usePortfolio } from '../context/PortfolioContext';
import UserProfile from './UserProfile';
import { motion } from 'framer-motion';
import { CheckCircle, Building2, Share2, User, Info, CalendarDays } from 'lucide-react';
import ChangePassword from './ChangePassword';
import Notification from './Notification';
import { toPng } from 'html-to-image';

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
	both_accepted: { icon: '🎉', label: 'Both Accepted', classes: 'bg-green-100 text-green-700 border border-green-300' },
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

// Compact quantity formatter (e.g., 1.8 Lakh, 2.5 Cr) - no trailing zeros
const formatQty = (value) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	
	// Helper to remove trailing zeros after decimal
	const formatNum = (num) => {
		const formatted = num.toFixed(2);
		return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted.replace(/\.?0+$/, '');
	};
	
	if (n >= 1e7) return `${formatNum(n / 1e7)} Cr`;
	if (n >= 1e5) return `${formatNum(n / 1e5)} Lakh`;
	if (n >= 1e3) return `${formatNum(n / 1e3)} K`;
	return n.toLocaleString('en-IN');
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
	const { user, logout, getUserDisplayName, updateUserProfile } = useAuth();
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
		reCounterOffer,
		finalAcceptByParty,
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
	// Removed showProfileModal state
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [confirmationData, setConfirmationData] = useState(null);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [shareCardData, setShareCardData] = useState(null);
	const shareCardRef = useRef(null);
	
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

	const handleShareListing = async (listing, company) => {
		const sellerUsername = listing.userId?.username || listing.sellerName || 'Unknown';
		const listingDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
		
		setShareCardData({
			company: listing.company,
			sector: company?.sector || 'Manufacturing',
			seller: sellerUsername,
			verified: true,
			askPrice: listing.price,
			quantity: listing.shares,
			date: listingDate,
			isin: listing.isin
		});

		// Wait for component to render
		setTimeout(async () => {
			try {
				if (shareCardRef.current) {
					const dataUrl = await toPng(shareCardRef.current, {
						quality: 1.0,
						pixelRatio: 2,
						backgroundColor: '#fef3c7'
					});
					
					// Convert to blob for sharing
					const blob = await (await fetch(dataUrl)).blob();
					const file = new File([blob], `${listing.company}-Share.png`, { type: 'image/png' });
					
					// Create caption with company link
					const companySlug = listing.company.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
					const shareUrl = `${window.location.origin}/share/${companySlug}`;
					const caption = `🚀 Check out this unlisted share of *${listing.company}* listed on *Nlist Planet*!

📊 *Ask Price:* ₹${listing.price.toFixed(2)}
📦 *Quantity:* ${(listing.shares / 100000).toFixed(2)} Lakh
🏭 *Sector:* ${company?.sector || 'Manufacturing'}
📅 *Listed:* ${listingDate}

💰 Explore more unlisted shares and make your offer now!

🔗 ${shareUrl}

#UnlistedShare #NlistPlanet #${listing.company.replace(/\s+/g, '')}`;
					
					// Try native share
					if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
						await navigator.share({
							title: `${listing.company} - Unlisted Share`,
							text: caption,
							files: [file]
						});
					} else {
						// Fallback: Copy caption to clipboard and download image
						try {
							await navigator.clipboard.writeText(caption);
							showNotification('success', 'Caption Copied!', 'Share text copied to clipboard. Image will download now.');
						} catch (clipErr) {
							console.log('Clipboard copy failed:', clipErr);
						}
						
						const link = document.createElement('a');
						link.download = `${listing.company}-Share.png`;
						link.href = dataUrl;
						link.click();
						showNotification('success', 'Ready to Share!', 'Image downloaded. Caption is copied - paste it with the image!');
					}
				}
			} catch (error) {
				console.error('Share error:', error);
				showNotification('error', 'Share Failed', 'Could not generate share card. Please try again.');
			} finally {
				setShareCardData(null);
			}
		}, 100);
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
			request.userId,
			request?.buyer?.id,
			request?.buyer?.email,
			request?.buyer?.name,
			request?.user?.id,
			request?.user?._id,
			request?.user?.email,
			request?.userId?._id,
			request?.userId?.id,
			request?.userId?.email
		];
		return candidateValues.some(matchesCurrentUser);
	}, [matchesCurrentUser]);

	const myListings = useMemo(
		() => sellListings.filter(listingBelongsToUser),
		[sellListings, listingBelongsToUser]
	);
	const myRequests = useMemo(
		() => {
			const filtered = buyRequests.filter(requestBelongsToUser);
			console.log('=== BUY REQUESTS DEBUG ===');
			console.log('Total buyRequests:', buyRequests.length);
			console.log('All buyRequests:', buyRequests);
			console.log('Current user:', user);
			console.log('User email:', user?.email);
			console.log('User _id:', user?._id);
			console.log('User id:', user?.id);
			console.log('Filtered myRequests:', filtered.length);
			console.log('myRequests:', filtered);
			
			// Debug each request to see why it's not matching
			buyRequests.forEach((req, idx) => {
				const matches = requestBelongsToUser(req);
				console.log(`Request ${idx} (${req.company}):`, {
					matches,
					buyer: req.buyer,
					buyerEmail: req.buyerEmail,
					buyerId: req.buyerId,
					buyerName: req.buyerName,
					requestedBy: req.requestedBy,
					requestedById: req.requestedById,
					createdBy: req.createdBy,
					createdById: req.createdById,
					accountId: req.accountId,
					userId: req.userId,
					user: req.user
				});
			});
			console.log('========================');
			return filtered;
		},
		[buyRequests, requestBelongsToUser, user]
	);

	// Derived counts for buy submenu
	const buyOffersCount = useMemo(() => {
		return myRequests.reduce((acc, r) => acc + (r.offers?.length || 0), 0);
	}, [myRequests]);

	const buyCounterOffersCount = useMemo(() => {
		return myRequests.reduce((acc, r) => acc + (r.offers?.filter(o => o.status === 'counter_offered').length || 0), 0);
	}, [myRequests]);

	const buyCompletedCount = useMemo(() => myRequests.filter(r => r.status === 'approved' || r.status === 'closed').length, [myRequests]);
	
	// Derived counts for sell submenu
	const sellListCount = useMemo(() => {
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
		return myListings.filter((l) => openSellStatuses.includes(getStatusKey(l.status))).length;
	}, [myListings]);
	
	const sellBidsCount = useMemo(() => {
		return myListings.reduce((acc, l) => acc + (l.bids?.length || 0), 0);
	}, [myListings]);
	
	const sellCounterOffersCount = useMemo(() => {
		return myListings.filter(l => 
			l.bids?.some(b => b.status === 'counter_offered' || b.status === 'counter_accepted_by_bidder')
		).length;
	}, [myListings]);
	
	const sellCompletedCount = useMemo(() => {
		return myListings.filter(l => l.status === 'approved' || l.status === 'closed').length;
	}, [myListings]);
	
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

	// My Bids data - bids placed by user on sell listings (marketplace buy posts)
	const myBidsOnSellListings = useMemo(() => {
		const bids = [];
		sellListings.forEach(listing => {
			if (listing.bids && listing.bids.length > 0) {
				listing.bids.forEach(bid => {
					// Check if this bid belongs to current user
					if (bid.bidder === user.email || bid.bidderName === user.name || bid.bidderId === user._id || bid.bidderId === user.id) {
						bids.push({
							...bid,
							listingId: listing._id || listing.id,
							company: listing.company,
							isin: listing.isin,
							askingPrice: listing.price,
							totalShares: listing.shares,
							seller: listing.sellerName || listing.seller,
							listingStatus: listing.status,
							type: 'bid'
						});
					}
				});
			}
		});
		return bids;
	}, [sellListings, user]);

	// My Offers data - offers made by user on buy requests (marketplace sell posts)
	const myOffersOnBuyRequests = useMemo(() => {
		const offers = [];
		buyRequests.forEach(request => {
			if (request.offers && request.offers.length > 0) {
				request.offers.forEach(offer => {
					// Check if this offer belongs to current user
					if (offer.seller === user.email || offer.sellerName === user.name || offer.sellerId === user._id || offer.sellerId === user.id) {
						offers.push({
							...offer,
							requestId: request._id || request.id,
							company: request.company,
							isin: request.isin,
							requestedPrice: request.price,
							totalShares: request.shares,
							buyer: request.buyerName || request.buyer,
							requestStatus: request.status,
							type: 'offer'
						});
					}
				});
			}
		});
		return offers;
	}, [buyRequests, user]);

	useEffect(() => {
		if (!user) {
			setPage('signin');
		}
	}, [user, setPage]);

	if (!user) {
		return null;
	}

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
		// Show confirmation modal first
		setAcceptedTerms(false); // Reset checkbox
		setConfirmationData({
			type: 'sell',
			data: { ...formData, seller: user.email, sellerName: user.name }
		});
		setShowConfirmation(true);
	};

	const handleCreateBuyRequest = async (e) => {
		e.preventDefault();
		// Show confirmation modal first
		setAcceptedTerms(false); // Reset checkbox
		setConfirmationData({
			type: 'buy',
			data: { ...formData, buyer: user.email, buyerName: user.name }
		});
		setShowConfirmation(true);
	};

	const confirmSubmit = async () => {
		if (!acceptedTerms) {
			showNotification('error', 'Terms not accepted', 'Please accept the terms and conditions to proceed.');
			return;
		}
		
		try {
			if (confirmationData.type === 'sell') {
				await createSellListing(confirmationData.data);
				showNotification('success', 'Shares listed! 🎉', `Your ${formData.shares} shares of ${formData.company} are now live.`);
			} else {
				await createBuyRequest(confirmationData.data);
				showNotification('success', 'Buy request posted! 🎉', `Looking to buy ${formData.shares} shares of ${formData.company}.`);
			}
			setFormData({ company: '', isin: '', price: '', shares: '' });
			setFormType(null);
			setShowConfirmation(false);
			setConfirmationData(null);
			setAcceptedTerms(false); // Reset checkbox
		} catch (error) {
			console.error('Failed to create listing:', error);
			showNotification('error', 'Failed to submit', 'Please try again later.');
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
		{
			id: 'buy',
			label: 'Buy',
			icon: '🛒',
			counter: myRequests.length,
			children: [
				{ id: 'buy_list', label: 'Buy List', counter: myRequests.length },
				{ id: 'buy_offers', label: 'Offers Received', counter: buyOffersCount },
				{ id: 'buy_counter', label: 'Counter Offers', counter: buyCounterOffersCount },
				{ id: 'buy_completed', label: 'Completed', counter: buyCompletedCount }
			]
		},
		{
			id: 'sell',
			label: 'Sell',
			icon: '📈',
			counter: myListings.length,
			children: [
				{ id: 'sell_list', label: 'Sell List', counter: sellListCount },
				{ id: 'sell_bids', label: 'Bids Received', counter: sellBidsCount },
				{ id: 'sell_counter', label: 'Counter Offers', counter: sellCounterOffersCount },
				{ id: 'sell_completed', label: 'Completed', counter: sellCompletedCount }
			]
		},
		{ id: 'my_bids', label: 'My Bids', icon: '🎯' },
		{ id: 'orders', label: 'Orders', icon: '📋' },
		{ id: 'portfolio', label: 'Portfolio', icon: '💼' },
		{ id: 'faq', label: 'FAQ', icon: '❓' },
		{ id: 'support', label: 'Support', icon: '💬' },
		{ id: 'profile', label: 'Profile', icon: '👤' }
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
						<h3 className="text-lg font-semibold text-gray-900 mb-4">📋 My Buy Requests - Manage & Track</h3>
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
								{myOpenRequests.map((request) => {
									const hasOffers = request.offers && request.offers.length > 0;
									const pendingOffers = request.offers?.filter(o => o.status === 'pending').length || 0;
									const counterOffers = request.offers?.filter(o => o.status === 'counter_offered').length || 0;
									const acceptedOffers = request.offers?.filter(o => o.status === 'accepted' || o.bothAccepted).length || 0;
									
									return (
										<div key={request._id || request.id} className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
											{/* Header with Status */}
											<div className="flex items-start justify-between mb-4">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h4 className="font-bold text-xl text-gray-900">{request.company}</h4>
														<StatusBadge status={request.status} size="sm" />
													</div>
													<p className="text-xs text-gray-600">ISIN: {request.isin || 'N/A'}</p>
													<p className="text-xs text-gray-500 mt-1">Posted on {formatDate(request.createdAt)}</p>
												</div>
											</div>
											
											{/* Price & Quantity Info */}
											<div className="grid grid-cols-2 gap-3 mb-4">
												<div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
													<p className="text-xs text-blue-600 font-semibold mb-1">Target Price</p>
													<p className="text-lg font-bold text-blue-700">{formatCurrency(request.price)}</p>
												</div>
												<div className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm">
													<p className="text-xs text-gray-600 font-semibold mb-1">Quantity</p>
													<p className="text-lg font-bold text-gray-800">{formatShares(request.shares)}</p>
												</div>
											</div>
											
											{/* Offer Activity Summary */}
											<div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
												<div className="flex items-center justify-between mb-2">
													<p className="text-xs font-bold text-gray-700">📊 Activity Status</p>
													<span className="text-xs font-bold text-gray-600">{request.offers?.length || 0} Total Offers</span>
												</div>
												{hasOffers ? (
													<div className="flex flex-wrap gap-2">
														{pendingOffers > 0 && (
															<span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
																⏳ {pendingOffers} New
															</span>
														)}
														{counterOffers > 0 && (
															<span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
																🔄 {counterOffers} Negotiating
															</span>
														)}
														{acceptedOffers > 0 && (
															<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
																✅ {acceptedOffers} Accepted
															</span>
														)}
													</div>
												) : (
													<p className="text-xs text-gray-500">No offers received yet</p>
												)}
											</div>
											
											{/* Action Buttons */}
											<div className="space-y-2">
												{/* Primary Actions */}
												<div className="grid grid-cols-2 gap-2">
													<button
														onClick={() => {
															// Edit functionality - open edit modal with prefilled data
															setFormData({
																company: request.company,
																isin: request.isin,
																price: request.price,
																shares: request.shares
															});
															setFormType('buy');
															showNotification('info', 'Edit Mode', 'Modify your request details');
														}}
														className="px-4 py-2 rounded-lg font-semibold text-blue-700 bg-blue-100 border-2 border-blue-300 hover:bg-blue-200 transition flex items-center justify-center gap-2"
													>
														<span>✏️</span>
														<span className="text-sm">Edit</span>
													</button>
													<button
														onClick={() => {
															if (window.confirm(`Are you sure you want to delete this buy request for ${request.company}?`)) {
																// Delete functionality
																showNotification('success', 'Request Deleted', `${request.company} buy request removed`);
																// TODO: Add actual delete API call here
															}
														}}
														className="px-4 py-2 rounded-lg font-semibold text-red-700 bg-red-100 border-2 border-red-300 hover:bg-red-200 transition flex items-center justify-center gap-2"
													>
														<span>🗑️</span>
														<span className="text-sm">Delete</span>
													</button>
												</div>
												
												{/* View Offers / Share */}
												<div className="grid grid-cols-2 gap-2">
													{hasOffers ? (
														<button
															onClick={() => setBuySubTab('offers')}
															className="col-span-2 px-4 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition flex items-center justify-center gap-2"
														>
															<span>📥</span>
															<span>View All Offers ({request.offers.length})</span>
														</button>
													) : (
														<button
															onClick={() => {
																const shareText = `🛒 Looking to buy ${request.shares} shares of ${request.company} at ₹${request.price}. ISIN: ${request.isin}`;
																if (navigator.share) {
																	navigator.share({ text: shareText });
																} else {
																	navigator.clipboard.writeText(shareText);
																	showNotification('success', 'Copied!', 'Request details copied to clipboard');
																}
															}}
															className="col-span-2 px-4 py-2 rounded-lg font-semibold text-green-700 bg-green-100 border-2 border-green-300 hover:bg-green-200 transition flex items-center justify-center gap-2"
														>
															<span>📤</span>
															<span>Share Request</span>
														</button>
													)}
												</div>
											</div>
										</div>
									);
								})}
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
									<div key={request._id || request.id} className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-md">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h4 className="font-bold text-xl text-gray-900">{request.company}</h4>
												<p className="text-sm text-gray-600 mt-1">Your request: {formatCurrency(request.price)} for {formatShares(request.shares)}</p>
												<p className="text-xs text-gray-500 mt-1">ISIN: {request.isin || 'N/A'}</p>
											</div>
											<StatusBadge status={request.status} size="lg" />
										</div>
										<div className="space-y-3">
											<p className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">📥 Received Offers ({request.offers?.length || 0}):</p>
											{request.offers?.map((offer) => {
												const isPending = offer.status === 'pending';
												const isCountered = offer.status === 'counter_offered';
												const isBothAccepted = offer.bothAccepted || offer.status === 'both_accepted';
												const buyerAccepted = offer.buyerAccepted || false;
												const sellerAccepted = offer.sellerAccepted || false;
												
												return (
													<div key={offer._id || offer.id} className={`rounded-xl p-4 border-2 ${
														isBothAccepted ? 'bg-green-50 border-green-300' :
														isCountered ? 'bg-orange-50 border-orange-300' :
														'bg-gray-50 border-gray-300'
													}`}>
														<div className="flex items-start justify-between mb-3">
															<div className="flex-1">
																<p className="text-sm font-bold text-gray-900">
																	{offer.sellerName || offer.seller}
																</p>
																<div className="mt-2 flex items-center gap-3">
																	<div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
																		<p className="text-xs text-gray-500">Price</p>
																		<p className="text-base font-bold text-blue-600">{formatCurrency(offer.counterPrice || offer.price)}</p>
																	</div>
																	<div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
																		<p className="text-xs text-gray-500">Quantity</p>
																		<p className="text-base font-bold text-gray-700">{formatShares(offer.quantity)}</p>
																	</div>
																</div>
															</div>
															<InteractionBadge status={offer.status} />
														</div>
														
														{/* Acceptance Status */}
														{isCountered && (
															<div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
																<p className="text-xs font-semibold text-gray-600 mb-2">Acceptance Status:</p>
																<div className="flex gap-3 text-xs">
																	<span className={`px-2 py-1 rounded-full font-semibold ${
																		buyerAccepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
																	}`}>
																		🛒 Buyer {buyerAccepted ? '✅' : '⏳'}
																	</span>
																	<span className={`px-2 py-1 rounded-full font-semibold ${
																		sellerAccepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
																	}`}>
																		📈 Seller {sellerAccepted ? '✅' : '⏳'}
																	</span>
																</div>
															</div>
														)}
														
														{/* Action Buttons */}
														<div className="flex flex-wrap gap-2 mt-3">
															{isBothAccepted ? (
																<div className="w-full bg-green-100 border border-green-300 rounded-lg p-3 text-center">
																	<p className="text-sm font-bold text-green-700">🎉 Both parties accepted! Awaiting admin approval.</p>
																</div>
															) : isPending ? (
																<>
																	<button
																		onClick={() => {
																			acceptOffer(request._id || request.id, offer.id);
																			showNotification('success', 'Offer Accepted! ✅', 'The seller will be notified.');
																		}}
																		className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition"
																	>
																		✅ Accept
																	</button>
																	<button
																		onClick={() => {
																			const newPrice = prompt(`Current offer: ₹${offer.price}. Enter your counter price:`);
																			if (newPrice && !isNaN(newPrice)) {
																				counterOffer(request._id || request.id, offer.id, parseFloat(newPrice), 'buy', 'buyer');
																				showNotification('info', 'Counter Sent! 🔄', `New price: ₹${newPrice}`);
																			}
																		}}
																		className="flex-1 px-4 py-2 rounded-lg font-semibold text-orange-700 bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition"
																	>
																		🔄 Counter
																	</button>
																	<button
																		onClick={() => {
																			rejectCounterOffer(request._id || request.id, offer.id, 'buy');
																			showNotification('warning', 'Offer Rejected ❌', 'The seller will be notified.');
																		}}
																		className="px-4 py-2 rounded-lg font-semibold text-red-700 bg-red-100 border-2 border-red-300 hover:bg-red-200 transition"
																	>
																		❌
																	</button>
																</>
															) : isCountered && !buyerAccepted ? (
																<>
																	<button
																		onClick={() => {
																			finalAcceptByParty(request._id || request.id, offer.id, 'buy', 'buyer');
																			showNotification('success', sellerAccepted ? 'Deal Finalized! 🎉' : 'Accepted! ✅', sellerAccepted ? 'Both parties agreed!' : 'Waiting for seller...');
																		}}
																		className="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition"
																	>
																		✅ Accept Counter
																	</button>
																	<button
																		onClick={() => {
																			const newPrice = prompt(`Current counter: ₹${offer.counterPrice}. Enter your re-counter price:`);
																			if (newPrice && !isNaN(newPrice)) {
																				reCounterOffer(request._id || request.id, offer.id, parseFloat(newPrice), 'buy', 'buyer');
																				showNotification('info', 'Re-Counter Sent! 🔄', `New price: ₹${newPrice}`);
																			}
																		}}
																		className="flex-1 px-4 py-2 rounded-lg font-semibold text-orange-700 bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition"
																	>
																		🔄 Re-Counter
																	</button>
																	<button
																		onClick={() => {
																			rejectCounterOffer(request._id || request.id, offer.id, 'buy');
																			showNotification('warning', 'Counter Rejected ❌', 'Negotiation ended.');
																		}}
																		className="px-4 py-2 rounded-lg font-semibold text-red-700 bg-red-100 border-2 border-red-300 hover:bg-red-200 transition"
																	>
																		❌
																	</button>
																</>
															) : buyerAccepted ? (
																<div className="w-full bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
																	<p className="text-sm font-semibold text-blue-700">⏳ You accepted. Waiting for seller to accept...</p>
																</div>
															) : null}
														</div>
													</div>
												);
											})}
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
				<div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
							const listingDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
							
							return (
								<div key={listing.id || listing._id} className="bg-white border border-green-100 rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
									{/* Green accent bar */}
									<div className="h-1.5 bg-green-500"></div>
									
									<div className="p-3">
										{/* Date and BUY tag on same line */}
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-1 text-gray-500 text-[10px]">
												<span>📅</span>
												<span>{listingDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
											</div>
											<span className="bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">BUY</span>
										</div>
										
										{/* Company name with logo */}
										<div className="flex items-center gap-2 mb-2">
											<div className="w-8 h-8 rounded bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center flex-shrink-0 border border-green-200">
												<span className="text-sm font-bold text-green-600">{listing.company.charAt(0)}</span>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1">
													<h3 className="text-sm font-bold text-gray-800 truncate relative group">
														{listing.company}
														<Info className="w-3 h-3 text-gray-400 cursor-pointer inline ml-1" />
														<div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded p-1.5 shadow-lg z-10 whitespace-nowrap">
															<p>ISIN: {listing.isin || 'N/A'}</p>
														</div>
													</h3>
												</div>
												<div className="flex items-center gap-1 text-gray-500">
													<Building2 className="w-3 h-3 text-green-600" />
													<span className="text-[10px] truncate">{company?.sector || 'Financial Services'}</span>
												</div>
												<div className="flex items-center gap-1 text-gray-500 text-[10px] mt-0.5">
													<User className="w-3 h-3 text-gray-400" />
													<span className="truncate">@{sellerUsername}</span>
													<CheckCircle className="w-3 h-3 text-green-600" />
												</div>
											</div>
										</div>
										
										{/* Price and Quantity */}
										<div className="bg-green-50 rounded p-2 mb-2">
											<div className="grid grid-cols-2 gap-2">
												<div>
													<p className="text-gray-500 text-[9px]">Ask Price</p>
													<h4 className="text-sm font-semibold text-green-700">{formatCurrency(listing.price)}</h4>
												</div>
												<div className="text-right">
													<p className="text-gray-500 text-[9px]">Quantity</p>
													<h4 className="text-sm font-bold text-gray-800">{formatQty(listing.shares)}</h4>
												</div>
											</div>
										</div>
										
										{/* Action buttons - removed download */}
										<div className="flex items-center gap-2">
											<button
												onClick={() => {
													setTradeContext({ type: 'bid', item: listing });
													setBidOfferData({ price: listing.price, quantity: listing.shares });
												}}
												className="flex-1 px-3 py-1.5 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
											>
												{myBid ? 'Update' : 'Bid'}
											</button>
											<button
												onClick={() => setSelectedItem({ item: listing, type: 'sell' })}
												className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-2 py-1.5 rounded text-xs transition"
											>
												Details
											</button>
											<button
												onClick={() => handleShareListing(listing, company)}
												className="text-gray-500 hover:text-gray-700 transition p-1"
												title="Share"
											>
												<Share2 className="w-4 h-4" />
											</button>
										</div>
								</div>
							</div>
							);
						})
					)}
				</div>
			) : (
				<div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{availableRequests.length === 0 ? (
						<EmptyState
							icon=""
							title="No open requests from others"
							description="List your shares for sale and reach serious buyers faster."
							actionLabel="Create listing"
							onAction={() => setFormType('sell')}
						/>
					) : (
						availableRequests.map((request, index) => {
							const company = companies.find((c) => c.isin === request.isin || c.name.toLowerCase() === request.company.toLowerCase());
							const myOffer = request.offers?.find((offer) => offer.seller === user.name || offer.seller === user.email);
							const buyerUsername = request.userId?.username || request.buyerName || 'Unknown';
							const requestDate = request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
							
							return (
								<motion.div 
									key={request.id}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
								>
									<div className="bg-white border border-yellow-100 rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
										{/* Orange accent bar */}
										<div className="h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
										
										<div className="p-3">
											{/* Date and SELL tag on same line */}
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-1 text-gray-500 text-[10px]">
													<CalendarDays className="w-3 h-3 text-gray-400" />
													<span>{requestDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
												</div>
												<span className="bg-orange-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">SELL</span>
											</div>
											
											{/* Company logo and info */}
											<div className="flex items-center gap-2 mb-2">
												<div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-200">
													<span className="text-sm font-bold text-orange-600">{request.company.charAt(0)}</span>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-1">
														<h3 className="text-sm font-bold text-gray-800 truncate relative group">
															{request.company}
															<Info className="w-3 h-3 text-gray-400 cursor-pointer inline ml-1" />
															<div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded p-1.5 shadow-lg z-10 whitespace-nowrap">
																<p>ISIN: {request.isin || 'N/A'}</p>
															</div>
														</h3>
													</div>
													<div className="flex items-center gap-1 text-gray-500">
														<Building2 className="w-3 h-3 text-orange-600" />
														<span className="text-[10px] truncate">{company?.sector || 'Financial Services'}</span>
													</div>
													<div className="flex items-center gap-1 text-gray-500 text-[10px] mt-0.5">
														<User className="w-3 h-3 text-gray-400" />
														<span className="truncate">{buyerUsername}</span>
														<CheckCircle className="w-3 h-3 text-orange-600" />
													</div>
												</div>
											</div>
											
											{/* Price and Quantity */}
											<div className="bg-yellow-50 rounded p-2 mb-2">
												<div className="grid grid-cols-2 gap-2">
													<div>
														<p className="text-gray-500 text-[9px]">Ask Price</p>
														<h4 className="text-sm font-semibold text-orange-700">{formatCurrency(request.price)}</h4>
													</div>
													<div className="text-right">
														<p className="text-gray-500 text-[9px]">Quantity</p>
														<h4 className="text-sm font-bold text-gray-800">{formatQty(request.shares)}</h4>
													</div>
												</div>
											</div>
											
											{/* Action buttons */}
											<div className="flex items-center gap-2">
												<button
													onClick={() => {
														setTradeContext({ type: 'offer', item: request });
														setBidOfferData({ price: request.price, quantity: request.shares });
													}}
													className="flex-1 px-3 py-1.5 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition"
												>
													{myOffer ? 'Update' : 'Offer'}
												</button>
												<button
													onClick={() => setSelectedItem({ item: request, type: 'buy' })}
													className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-2 py-1.5 rounded text-xs transition"
												>
													Details
												</button>
												<button
													onClick={() => {
														const shareText = `Check out this ${request.company} unlisted share post on Nlist Planet!`;
														if (navigator.share) {
															navigator.share({
																title: 'Nlist Planet',
																text: shareText,
																url: window.location.href,
															});
														} else {
															navigator.clipboard.writeText(shareText);
															alert('Link copied!');
														}
													}}
													className="text-gray-500 hover:text-gray-700 transition p-1"
												>
													<Share2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								</motion.div>
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

	const renderMyBids = () => {
		const getStatusMeta = (status) => {
			const meta = {
				pending: { icon: '⏳', label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
				accepted: { icon: '✅', label: 'Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
				rejected: { icon: '❌', label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
				counter_offered: { icon: '🔄', label: 'Counter Offered', color: 'text-blue-600 bg-blue-50 border-blue-200' },
				counter_accepted_by_bidder: { icon: '🤝', label: 'Counter Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
				counter_accepted_by_offerer: { icon: '🤝', label: 'Counter Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
			};
			return meta[status] || { icon: '❓', label: status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
		};

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">🎯 My Bids & Offers</h2>
						<p className="text-sm text-gray-500 mt-1">Track all your bids on buy posts and offers on sell posts</p>
					</div>
				</div>

				{/* Bids Section - Bids placed on Sell Listings (Buy Posts) */}
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
							<span>🛒</span>
							<span>My Bids on Buy Posts</span>
							<span className="ml-2 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">{myBidsOnSellListings.length}</span>
						</h3>
						<p className="text-sm text-gray-600 mt-1">Bids you placed on marketplace sell listings</p>
					</div>
					<div className="p-6">
						{myBidsOnSellListings.length === 0 ? (
							<div className="text-center py-12">
								<div className="text-6xl mb-4">🎯</div>
								<p className="text-gray-500 text-lg">No bids placed yet</p>
								<p className="text-gray-400 text-sm mt-2">Browse the marketplace and place bids on sell listings</p>
							</div>
						) : (
							<div className="space-y-4">
								{myBidsOnSellListings.map((bid, idx) => {
									const statusMeta = getStatusMeta(bid.status);
									return (
										<div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<h4 className="font-bold text-lg text-gray-900">{bid.company}</h4>
													<p className="text-xs text-gray-500 mt-1">ISIN: {bid.isin || 'N/A'}</p>
												</div>
												<span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusMeta.color} flex items-center gap-1`}>
													<span>{statusMeta.icon}</span>
													<span>{statusMeta.label}</span>
												</span>
											</div>
											
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
												<div>
													<p className="text-xs text-gray-500">Your Bid Price</p>
													<p className="text-sm font-bold text-blue-600">₹{bid.price}</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Asking Price</p>
													<p className="text-sm font-semibold text-gray-700">₹{bid.askingPrice}</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Quantity</p>
													<p className="text-sm font-semibold text-gray-700">{bid.quantity} shares</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Seller</p>
													<p className="text-sm font-semibold text-gray-700">{bid.seller}</p>
												</div>
											</div>

											{bid.counterPrice && (
												<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
													<p className="text-xs font-semibold text-orange-700">Counter Offer: ₹{bid.counterPrice} for {bid.counterQuantity} shares</p>
												</div>
											)}

											<div className="flex items-center justify-between pt-3 border-t border-gray-100">
												<p className="text-xs text-gray-400">
													Bid placed on {bid.timestamp ? new Date(bid.timestamp).toLocaleDateString() : 'N/A'}
												</p>
												<p className="text-xs text-gray-500">Listing Status: {bid.listingStatus || 'Active'}</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Offers Section - Offers made on Buy Requests (Sell Posts) */}
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
							<span>📈</span>
							<span>My Offers on Sell Posts</span>
							<span className="ml-2 px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">{myOffersOnBuyRequests.length}</span>
						</h3>
						<p className="text-sm text-gray-600 mt-1">Offers you made on marketplace buy requests</p>
					</div>
					<div className="p-6">
						{myOffersOnBuyRequests.length === 0 ? (
							<div className="text-center py-12">
								<div className="text-6xl mb-4">📊</div>
								<p className="text-gray-500 text-lg">No offers made yet</p>
								<p className="text-gray-400 text-sm mt-2">Browse the marketplace and make offers on buy requests</p>
							</div>
						) : (
							<div className="space-y-4">
								{myOffersOnBuyRequests.map((offer, idx) => {
									const statusMeta = getStatusMeta(offer.status);
									return (
										<div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<h4 className="font-bold text-lg text-gray-900">{offer.company}</h4>
													<p className="text-xs text-gray-500 mt-1">ISIN: {offer.isin || 'N/A'}</p>
												</div>
												<span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusMeta.color} flex items-center gap-1`}>
													<span>{statusMeta.icon}</span>
													<span>{statusMeta.label}</span>
												</span>
											</div>
											
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
												<div>
													<p className="text-xs text-gray-500">Your Offer Price</p>
													<p className="text-sm font-bold text-emerald-600">₹{offer.price}</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Requested Price</p>
													<p className="text-sm font-semibold text-gray-700">₹{offer.requestedPrice}</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Quantity</p>
													<p className="text-sm font-semibold text-gray-700">{offer.quantity} shares</p>
												</div>
												<div>
													<p className="text-xs text-gray-500">Buyer</p>
													<p className="text-sm font-semibold text-gray-700">{offer.buyer}</p>
												</div>
											</div>

											{offer.counterPrice && (
												<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
													<p className="text-xs font-semibold text-orange-700">Counter Offer: ₹{offer.counterPrice} for {offer.counterQuantity} shares</p>
												</div>
											)}

											<div className="flex items-center justify-between pt-3 border-t border-gray-100">
												<p className="text-xs text-gray-400">
													Offer made on {offer.timestamp ? new Date(offer.timestamp).toLocaleDateString() : 'N/A'}
												</p>
												<p className="text-xs text-gray-500">Request Status: {offer.requestStatus || 'Active'}</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
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
			case 'my_bids':
				return renderMyBids();
			case 'orders':
				return renderOrders();
			case 'portfolio':
				return renderPortfolio();
			case 'faq':
				return renderFAQ();
			case 'support':
				return renderSupport();
			case 'profile':
				console.log('[UserDashboard] Passing user to UserProfile:', user);
				return <UserProfile currentUser={user} />;
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

		// Direct accept for pending bids/offers (no counter yet)
		const onAccept = (interactionId) => {
			if (type === 'sell') {
				acceptBid(item.id, interactionId);
				showNotification('success', 'Bid accepted ✅', 'We have notified the bidder. Await admin approval.');
			} else {
				acceptOffer(item.id, interactionId);
				showNotification('success', 'Offer accepted ✅', 'Seller will be notified immediately.');
			}
			setSelectedItem(null);
		};

		// Send initial counter offer
		const onCounter = (interactionId, interaction) => {
			const newPrice = prompt('Enter your counter price');
			if (!newPrice || isNaN(newPrice)) return;
			const counterBy = type === 'sell' ? 'seller' : 'buyer';
			counterOffer(item.id, interactionId, parseFloat(newPrice), type, counterBy);
			showNotification('info', 'Counter submitted 🔄', `Proposed new price: ₹${newPrice}`);
			setSelectedItem(null);
		};

		// Send re-counter offer (multiple rounds)
		const onReCounter = (interactionId, interaction) => {
			const newPrice = prompt(`Current counter: ₹${interaction.counterPrice || interaction.price}. Enter your re-counter price:`);
			if (!newPrice || isNaN(newPrice)) return;
			// Determine who is countering
			const counterBy = type === 'sell' 
				? (interaction.counterBy === 'seller' ? 'buyer' : 'seller')
				: (interaction.counterBy === 'buyer' ? 'seller' : 'buyer');
			reCounterOffer(item.id, interactionId, parseFloat(newPrice), type, counterBy);
			showNotification('info', 'Re-counter submitted 🔄', `New proposed price: ₹${newPrice}`);
			setSelectedItem(null);
		};

		// Accept counter offer (final acceptance by one party)
		const onAcceptFinal = (interactionId, interaction) => {
			const party = type === 'sell' ? 'buyer' : 'seller';
			finalAcceptByParty(item.id, interactionId, type, party);
			
			const otherPartyAccepted = type === 'sell' ? interaction.sellerAccepted : interaction.buyerAccepted;
			if (otherPartyAccepted) {
				showNotification('success', 'Deal Finalized! 🎉', 'Both parties agreed. Admin will review now.');
			} else {
				showNotification('success', 'Accepted ✅', 'Waiting for other party to accept.');
			}
			setSelectedItem(null);
		};

		// Owner accepts their own counter (when other party already accepted)
		const onOwnerAccept = (interactionId, interaction) => {
			const party = type === 'sell' ? 'seller' : 'buyer';
			finalAcceptByParty(item.id, interactionId, type, party);
			
			const otherPartyAccepted = type === 'sell' ? interaction.buyerAccepted : interaction.sellerAccepted;
			if (otherPartyAccepted) {
				showNotification('success', 'Deal Finalized! 🎉', 'Both parties agreed. Admin will review now.');
			} else {
				showNotification('success', 'Accepted ✅', 'Waiting for other party to accept.');
			}
			setSelectedItem(null);
		};

		const onRejectCounter = (interactionId) => {
			rejectCounterOffer(item.id, interactionId, type);
			showNotification('warning', 'Counter rejected ❌', 'Let them know what price works for you.');
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
								const displayPrice = interaction.counterPrice || interaction.price;
								
								// Determine current state and available actions
								const isPending = interaction.status === 'pending';
								const isCounterOffered = interaction.status === 'counter_offered';
								const isBothAccepted = interaction.status === 'both_accepted' || interaction.bothAccepted;
								
								// Check acceptance status
								const buyerAccepted = interaction.buyerAccepted || false;
								const sellerAccepted = interaction.sellerAccepted || false;
								const myPartyAccepted = type === 'sell' ? sellerAccepted : buyerAccepted;
								
								// Available actions
								const canDirectAccept = isPending && isOwner;
								const canInitialCounter = isPending && isOwner;
								const canReCounter = isCounterOffered && !myPartyAccepted;
								const canAcceptCounter = isCounterOffered && !myPartyAccepted;
								const canReject = (isPending || isCounterOffered) && !isBothAccepted;
								
								return (
									<div key={interaction.id} className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
										<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-gray-900">
													{getUserDisplayName(interactionOwner, interactionOwner)}
												</p>
												<p className="text-xs text-gray-500 mt-1">Submitted {formatDateTime(interaction.counterAt || interaction.createdAt)}</p>
											</div>
											<InteractionBadge status={interaction.status} />
										</div>

										{/* Counter Offer History */}
										{interaction.counterHistory && interaction.counterHistory.length > 0 && (
											<div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
												<p className="text-xs font-semibold text-blue-700 mb-2">📜 Negotiation History</p>
												<div className="space-y-1">
													{interaction.counterHistory.map((h, idx) => (
														<p key={idx} className="text-xs text-blue-600">
															{h.by === 'seller' ? '🏷️ Seller' : '🛒 Buyer'}: ₹{h.price} - {formatDateTime(h.at)}
														</p>
													))}
												</div>
											</div>
										)}

										{/* Acceptance Status */}
										{isCounterOffered && (
											<div className="mt-3 grid grid-cols-2 gap-2">
												<div className={`p-2 rounded-lg border ${sellerAccepted ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
													<p className="text-xs font-semibold text-gray-700">🏷️ Seller</p>
													<p className="text-xs">{sellerAccepted ? '✅ Accepted' : '⏳ Pending'}</p>
												</div>
												<div className={`p-2 rounded-lg border ${buyerAccepted ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
													<p className="text-xs font-semibold text-gray-700">🛒 Buyer</p>
													<p className="text-xs">{buyerAccepted ? '✅ Accepted' : '⏳ Pending'}</p>
												</div>
											</div>
										)}

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
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Value</p>
												<p className="mt-1 text-base font-semibold text-gray-900">{formatCurrency(displayPrice * (interaction.quantity || interaction.shares))}</p>
											</div>
										</div>

										{/* Action Buttons */}
										{!isBothAccepted && (
											<div className="mt-4 flex flex-wrap gap-3">
												{/* Direct Accept (for pending bids/offers) */}
												{canDirectAccept && (
													<button
														onClick={() => onAccept(interaction.id)}
														className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow hover:shadow-lg transition"
													>
														<span>✅</span>
														<span>Accept</span>
													</button>
												)}
												
												{/* Initial Counter */}
												{canInitialCounter && (
													<button
														onClick={() => onCounter(interaction.id, interaction)}
														className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-orange-600 border border-orange-200 bg-orange-50/40 hover:bg-orange-50 transition"
													>
														<span>🔄</span>
														<span>Counter Offer</span>
													</button>
												)}

												{/* Accept Counter Offer */}
												{canAcceptCounter && isCounterOffered && (
													<button
														onClick={() => isOwner ? onOwnerAccept(interaction.id, interaction) : onAcceptFinal(interaction.id, interaction)}
														className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow hover:shadow-lg transition"
													>
														<span>✅</span>
														<span>Accept ₹{displayPrice}</span>
													</button>
												)}

												{/* Re-Counter */}
												{canReCounter && (
													<button
														onClick={() => onReCounter(interaction.id, interaction)}
														className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-blue-600 border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition"
													>
														<span>🔄</span>
														<span>Re-Counter</span>
													</button>
												)}

												{/* Reject */}
												{canReject && (
													<button
														onClick={() => onRejectCounter(interaction.id)}
														className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-rose-600 border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition"
													>
														<span>❌</span>
														<span>Reject</span>
													</button>
												)}
											</div>
										)}

										{/* Both Accepted Message */}
										{isBothAccepted && (
											<div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
												<p className="text-green-700 font-semibold flex items-center gap-2">
													<span>🎉</span>
													<span>Deal Finalized! Both parties agreed on ₹{displayPrice}</span>
												</p>
												<p className="text-xs text-green-600 mt-1">Waiting for admin approval to complete transaction.</p>
											</div>
										)}
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
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white flex">
			<Notification
				show={notification.show}
				type={notification.type}
				title={notification.title}
				message={notification.message}
				onClose={() => setNotification({ ...notification, show: false })}
			/>

			{/* Left Sidebar Navigation */}
			<aside className="hidden lg:flex lg:flex-col w-56 bg-gradient-to-b from-purple-200 via-purple-100 to-indigo-50 shadow-2xl fixed h-screen overflow-y-auto sidebar-scroll">
				{/* Logo & User Info */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl shadow-lg">
							👤
						</div>
						<div className="flex-1">
							<h3 className="text-purple-900 font-bold text-base truncate">{user.name}</h3>
							<div className="flex items-center gap-1 mt-1">
								<p className="text-purple-600 text-xs truncate">{currentUsername}</p>
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
							<p className="text-purple-600 text-xs mt-1">ID: {user.userId || 'N/A'}</p>
						</div>
					</div>
				</div>

				{/* Navigation Menu */}
				<nav className="flex-1 p-4 space-y-1">
					{navItems.map((nav) => (
						<div key={nav.id}>
							<button
								onClick={() => setActiveTab(nav.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-normal transition-all duration-200 ${
									activeTab === nav.id
										? 'bg-purple-100/80 text-purple-800'
										: 'text-purple-700 hover:bg-white/20'
								}`}
							>
								<span className="text-lg">{nav.icon}</span>
								<span className="flex-1 text-left">{nav.label}</span>
								{typeof nav.counter === 'number' && nav.counter > 0 && (
									<span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold ${
										activeTab === nav.id 
											? 'bg-purple-200 text-purple-800' 
											: 'bg-white/60 text-purple-700 border border-white/30'
									}`}>
										{nav.counter}
									</span>
								)}
							</button>
							
							{/* Render submenu right under parent if it has children and is active */}
							{nav.children && activeTab === nav.id && (
								<div className="pl-8 pr-4 mt-1 space-y-1">
									{nav.children.map((child) => (
										<button
											key={child.id}
											onClick={() => { 
												setActiveTab(nav.id);
												if (child.id.startsWith('buy_')) {
													setBuySubTab(child.id.replace('buy_', ''));
												} else if (child.id.startsWith('sell_')) {
													setSellSubTab(child.id.replace('sell_', ''));
												}
											}}
											className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-normal transition ${
												(child.id.startsWith('buy_') && buySubTab === child.id.replace('buy_', '')) ||
												(child.id.startsWith('sell_') && sellSubTab === child.id.replace('sell_', ''))
													? 'bg-purple-200/70 text-purple-900'
													: 'text-purple-700 hover:bg-white/10'
											}`}
										>
											<span className="text-sm">{child.label}</span>
											{typeof child.counter === 'number' && child.counter > 0 && (
												<span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-semibold bg-white/60 text-purple-700 border border-white/30">
													{child.counter}
												</span>
											)}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</nav>

				{/* Bottom Actions */}
				<div className="p-4 border-t border-white/10 space-y-2">
					   {/* Profile button removed: now handled as a sidebar tab */}
					<button
						onClick={() => setShowPasswordModal(true)}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-purple-900 bg-white/80 hover:bg-white transition-all shadow-sm border border-white/30"
					>
						<span className="text-lg">🔐</span>
						<span>Password</span>
					</button>
					<button
						onClick={() => {
							logout();
							setPage('home');
						}}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md"
					>
						<span className="text-lg">🚪</span>
						<span>Logout</span>
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 lg:ml-56">
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

			{/* Profile modal removed; now a dashboard page */}

			{showPasswordModal && (
				<ChangePassword onClose={() => setShowPasswordModal(false)} />
			)}

			{/* Confirmation Modal */}
			{showConfirmation && confirmationData && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
						<div className="text-center mb-6">
							<div className="text-5xl mb-4">
								{confirmationData.type === 'sell' ? '📈' : '🛒'}
							</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								{confirmationData.type === 'sell' 
									? `Do you want to list your "${formData.company}" for sell?`
									: `Do you want to post buy request for "${formData.company}"?`
								}
							</h2>
							<p className="text-sm text-gray-500">
								Please review your details before submitting
							</p>
						</div>

						<div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-6 space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-gray-600">Company</span>
								<span className="text-base font-bold text-gray-900">{formData.company}</span>
							</div>
							<div className="h-px bg-gray-200"></div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-gray-600">ISIN</span>
								<span className="text-base font-semibold text-gray-700 font-mono">{formData.isin}</span>
							</div>
							<div className="h-px bg-gray-200"></div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-gray-600">Price per Share</span>
								<span className="text-lg font-bold text-green-600">₹{Number(formData.price).toLocaleString('en-IN')}</span>
							</div>
							<div className="h-px bg-gray-200"></div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-gray-600">Number of Shares</span>
								<span className="text-lg font-bold text-blue-600">{Number(formData.shares).toLocaleString('en-IN')}</span>
							</div>
							<div className="h-px bg-gray-200"></div>
							<div className="flex justify-between items-center pt-2">
								<span className="text-base font-semibold text-gray-800">Total Value</span>
								<span className="text-xl font-bold text-purple-600">
									₹{(Number(formData.price) * Number(formData.shares)).toLocaleString('en-IN')}
								</span>
							</div>
						</div>

						{/* Terms & Conditions Checkbox */}
						<div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={acceptedTerms}
									onChange={(e) => setAcceptedTerms(e.target.checked)}
									className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
								/>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-800 mb-1">
										⚠️ Terms & Conditions
									</p>
									<p className="text-xs text-gray-600 leading-relaxed">
										I confirm that all information provided is accurate and complete. I understand that {confirmationData.type === 'sell' ? 'my shares will be listed publicly' : 'my buy request will be visible to all sellers'} and I accept full responsibility for this transaction. I agree to the platform's terms of service and trading policies.
									</p>
								</div>
							</label>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowConfirmation(false);
									setConfirmationData(null);
									setAcceptedTerms(false);
								}}
								className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								onClick={confirmSubmit}
								disabled={!acceptedTerms}
								className={`flex-1 px-5 py-3 rounded-xl font-semibold transition ${
									acceptedTerms
										? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								✅ Confirm & Submit
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Hidden Share Card for Image Generation */}
			{shareCardData && (
				<div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
					<div
						ref={shareCardRef}
						style={{
							width: '560px',
							background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
							borderRadius: '24px',
							padding: '32px',
							boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
							fontFamily: 'system-ui, -apple-system, sans-serif'
						}}
					>
						{/* Border with gradient */}
						<div style={{
							background: 'white',
							borderRadius: '16px',
							border: '3px solid #f59e0b',
							padding: '24px',
							position: 'relative'
						}}>
							{/* Date and Hashtag */}
							<div style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '20px',
								fontSize: '13px'
							}}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280' }}>
									<span>📅</span>
									<span>{shareCardData.date}</span>
								</div>
								<span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>#UnlistedShare</span>
							</div>

							{/* Company Name */}
							<div style={{ marginBottom: '16px' }}>
								<h2 style={{
									fontSize: '28px',
									fontWeight: 'bold',
									color: '#111827',
									margin: '0 0 8px 0'
								}}>
									{shareCardData.company}
								</h2>
							</div>

							{/* Sector */}
							<div style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								marginBottom: '12px',
								color: '#f59e0b',
								fontSize: '14px'
							}}>
								<span>🏭</span>
								<span style={{ fontWeight: '500' }}>{shareCardData.sector}</span>
							</div>

							{/* Seller Info */}
							<div style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								marginBottom: '20px',
								fontSize: '14px',
								color: '#4b5563'
							}}>
								<span>👤</span>
								<span>@{shareCardData.seller}</span>
								{shareCardData.verified && <span style={{ color: '#f59e0b' }}>✓ Verified</span>}
							</div>

							{/* Price and Quantity Box */}
							<div style={{
								background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%)',
								borderRadius: '12px',
								padding: '16px',
								marginBottom: '20px'
							}}>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<div>
										<div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Ask Price</div>
										<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
											₹{shareCardData.askPrice.toFixed(2)}
										</div>
									</div>
									<div style={{ textAlign: 'right' }}>
										<div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Quantity</div>
										<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
											{(shareCardData.quantity / 100000).toFixed(2)} Lakh
										</div>
									</div>
								</div>
							</div>

							{/* Call to Action */}
							<div style={{
								borderTop: '1px solid #e5e7eb',
								paddingTop: '16px',
								fontSize: '14px',
								lineHeight: '1.6',
								color: '#4b5563'
							}}>
								<p style={{ margin: '0 0 8px 0' }}>
									Check out this unlisted share of <strong style={{ color: '#111827' }}>{shareCardData.company}</strong> listed on <strong style={{ color: '#f59e0b' }}>Nlist Planet</strong>. Explore more and make your offer now!
								</p>
							</div>

							{/* Footer */}
							<div style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginTop: '16px',
								fontSize: '12px',
								color: '#9ca3af'
							}}>
								<span>nlistplanet.com/share/{shareCardData.company.toLowerCase().replace(/\s+/g, '-')}</span>
								<span>{shareCardData.date}</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}



