import React, { createContext, useState, useEffect } from 'react';
import { listingAPI, tradeAPI } from '../services/api';

export const ListingContext = createContext();

export function ListingProvider({ children }) {
  // Sell Listings - Users/Admin want to SELL shares
  const [sellListings, setSellListings] = useState([]);

  // Buy Requests - Users/Admin want to BUY shares
  const [buyRequests, setBuyRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  // Fetch all listings from MongoDB on mount
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getAllListings();
      const listings = response.data;
      
      // Separate sell and buy listings
      setSellListings(listings.filter(l => l.type === 'sell'));
      setBuyRequests(listings.filter(l => l.type === 'buy'));
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeDisplayValue = (basePrice) => {
    let display = Number((basePrice * 1.02).toFixed(2));
    if (basePrice >= 10) display = Math.ceil(display);
    return display;
  };

  // Create Sell Listing
  const createSellListing = async (data) => {
    try {
      const response = await listingAPI.createSellListing(data);
      const newListing = response.data.listing;
      
      // Force refresh to ensure latest data from server
      await fetchListings();
      
      return newListing;
    } catch (error) {
      console.error('Failed to create sell listing:', error);
      throw error;
    }
  };

  // Create Buy Request
  const createBuyRequest = async (data) => {
    try {
      const response = await listingAPI.createBuyRequest(data);
      const newRequest = response.data.listing;
      
      // Force refresh to ensure latest data from server
      await fetchListings();
      
      return newRequest;
    } catch (error) {
      console.error('Failed to create buy request:', error);
      throw error;
    }
  };

  // Place Bid on Sell Listing
  const placeBid = async (listingId, bidData) => {
    try {
      const response = await listingAPI.placeBid(listingId, bidData);
      const updatedListing = response.data.listing;
      setSellListings(sellListings.map(listing => 
        listing._id === listingId ? updatedListing : listing
      ));
    } catch (error) {
      console.error('Failed to place bid:', error);
      throw error;
    }
  };

  // Make Offer on Buy Request (Local state for now - TODO: Backend endpoint)
  const makeOffer = (requestId, offerData) => {
    setBuyRequests(buyRequests.map(request => {
      if (request._id === requestId) {
        const newOffer = {
          id: Date.now(),
          ...offerData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return { ...request, offers: [...(request.offers || []), newOffer] };
      }
      return request;
    }));
  };

  // Helper function to create Trade when both parties accept
  const createTradeFromAcceptedBid = async (listing, bid) => {
    try {
      const tradeData = {
        bidId: bid._id,
        buyerId: bid.userId,
        price: bid.counterPrice || bid.price,
        quantity: bid.quantity
      };
      
      const response = await listingAPI.createTrade(listing._id, tradeData);
      console.log('Trade created successfully:', response.data.trade);
      
      // Refresh listings to get updated status
      await fetchListings();
      return response.data.trade;
    } catch (error) {
      console.error('Failed to create trade:', error);
      return null;
    }
  };

  // Accept Bid (Seller accepts bid)
  const acceptBid = (listingId, bidId) => {
    setSellListings(sellListings.map(listing => {
      if (listing._id === listingId) {
        const updatedBids = listing.bids.map(bid => 
          bid._id === bidId ? { ...bid, status: 'accepted' } : { ...bid, status: 'rejected' }
        );
        return { 
          ...listing, 
          bids: updatedBids,
          status: 'pending_admin_approval',
          acceptedBid: bidId
        };
      }
      return listing;
    }));
  };

  // Accept Offer (Buyer accepts offer)
  const acceptOffer = (requestId, offerId) => {
    setBuyRequests(buyRequests.map(request => {
      if (request._id === requestId) {
        const updatedOffers = (request.offers || []).map(offer => 
          offer.id === offerId ? { ...offer, status: 'accepted' } : { ...offer, status: 'rejected' }
        );
        return { 
          ...request, 
          offers: updatedOffers,
          status: 'pending_admin_approval',
          acceptedOffer: offerId
        };
      }
      return request;
    }));
  };

  // Admin Approve Transaction
  const adminApprove = (id, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => 
        listing._id === id ? { ...listing, status: 'approved' } : listing
      ));
    } else {
      setBuyRequests(buyRequests.map(request => 
        request._id === id ? { ...request, status: 'approved' } : request
      ));
    }
  };

  // Admin Close Transaction
  const adminClose = (id, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => 
        listing._id === id ? { ...listing, status: 'closed', closedAt: new Date().toISOString() } : listing
      ));
    } else {
      setBuyRequests(buyRequests.map(request => 
        request._id === id ? { ...request, status: 'closed', closedAt: new Date().toISOString() } : request
      ));
    }
  };

  // Counter Offer (Negotiation) - Enhanced with acceptance tracking
  const counterOffer = (listingId, bidId, newPrice, type, counterBy = 'seller') => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
              const updatedBids = listing.bids.map(bid => 
            bid._id === bidId ? { 
              ...bid, 
              counterPrice: newPrice,
              counterDisplayPrice: computeDisplayValue(newPrice),
              status: 'counter_offered',
              counterBy: counterBy, // 'seller' or 'buyer'
              buyerAccepted: false,
              sellerAccepted: false,
              bothAccepted: false,
              counterAt: new Date().toISOString()
            } : bid
          );
          return { ...listing, bids: updatedBids };
        }
        return listing;
      }));
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request._id === listingId) {
          const updatedOffers = (request.offers || []).map(offer => 
            offer.id === bidId ? { 
              ...offer, 
              counterPrice: newPrice,
              counterDisplayPrice: computeDisplayValue(newPrice),
              status: 'counter_offered',
              counterBy: counterBy, // 'buyer' or 'seller'
              buyerAccepted: false,
              sellerAccepted: false,
              bothAccepted: false,
              counterAt: new Date().toISOString()
            } : offer
          );
          return { ...request, offers: updatedOffers };
        }
        return request;
      }));
    }
  };

  // Re-Counter Offer - Allow multiple rounds of negotiation
  const reCounterOffer = (listingId, bidId, newPrice, type, counterBy) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
            const updatedBids = listing.bids.map(bid => 
            bid._id === bidId ? { 
              ...bid, 
              counterPrice: newPrice,
              counterDisplayPrice: computeDisplayValue(newPrice),
              status: 'counter_offered',
              counterBy: counterBy,
              buyerAccepted: false,
              sellerAccepted: false,
              bothAccepted: false,
              counterHistory: [...(bid.counterHistory || []), {
                price: bid.counterPrice || bid.price,
                by: bid.counterBy || 'initial',
                at: new Date().toISOString()
              }],
              counterAt: new Date().toISOString()
            } : bid
          );
          return { ...listing, bids: updatedBids };
        }
        return listing;
      }));
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request._id === listingId) {
            const updatedOffers = (request.offers || []).map(offer => 
            offer.id === bidId ? { 
              ...offer, 
              counterPrice: newPrice,
              counterDisplayPrice: computeDisplayValue(newPrice),
              status: 'counter_offered',
              counterBy: counterBy,
              buyerAccepted: false,
              sellerAccepted: false,
              bothAccepted: false,
              counterHistory: [...(offer.counterHistory || []), {
                price: offer.counterPrice || offer.price,
                by: offer.counterBy || 'initial',
                at: new Date().toISOString()
              }],
              counterAt: new Date().toISOString()
            } : offer
          );
          return { ...request, offers: updatedOffers };
        }
        return request;
      }));
    }
  };

  // Final Accept - Track which party accepted
  const finalAcceptByParty = async (listingId, bidId, type, party) => {
    try {
      if (type === 'sell') {
        const response = await listingAPI.acceptBid(listingId, bidId, party);
        // response returns listing and maybe trade when both accepted
        const updatedListing = response.data.listing || response.data.success?.listing || response.data;
        const trade = response.data.trade || response.data.success?.trade;
        if (updatedListing) {
          setSellListings(sellListings.map(l => l._id === updatedListing._id ? updatedListing : l));
        }
        if (trade) {
          // fetched trade; we can refresh listing and trades
          await fetchListings();
          return trade;
        }
        return null;
      } else {
        const response = await listingAPI.acceptBid(listingId, bidId, party); // same endpoint supported
        const updatedRequest = response.data.listing || response.data;
        await fetchListings();
        return response.data.trade || null;
      }
    } catch (error) {
      console.error('Failed to accept via API:', error);
      // fallback to local state update in case of network issues
    }
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
          const updatedBids = listing.bids.map(bid => {
            if (bid._id === bidId) {
              const buyerAccepted = party === 'buyer' ? true : bid.buyerAccepted || false;
              const sellerAccepted = party === 'seller' ? true : bid.sellerAccepted || false;
              const bothAccepted = buyerAccepted && sellerAccepted;
              
              // If both accepted, create Trade in backend and return it
              // This local path is a fallback if API call fails; usually backend will handle this
              let createdTrade = null;
              if (bothAccepted) {
                createdTrade = await createTradeFromAcceptedBid(listing, bid);
              }
              
              return {
                ...bid,
                buyerAccepted,
                sellerAccepted,
                bothAccepted,
                status: bothAccepted ? 'both_accepted' : 'counter_offered',
                [`${party}AcceptedAt`]: new Date().toISOString()
              };
            }
            return bid;
          });
          
          // If both accepted, mark listing as pending_closure (ready for proof upload)
          const bothAcceptedBid = updatedBids.find(b => b.bothAccepted);
          return { 
            ...listing, 
            bids: updatedBids,
            status: bothAcceptedBid ? 'pending_closure' : listing.status,
            acceptedBid: bothAcceptedBid ? bidId : listing.acceptedBid
          };
        }
        return listing;
      }));
      // When called for sell type, if both parties accepted and createdTrade exists return it.
      // Because createTradeFromAcceptedBid is async we need to detect it by fetching trades (handled by createTradeFromAcceptedBid). Return null for now.
      return null;
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request._id === listingId) {
          const updatedOffers = (request.offers || []).map(offer => {
            if (offer.id === bidId) {
              const buyerAccepted = party === 'buyer' ? true : offer.buyerAccepted || false;
              const sellerAccepted = party === 'seller' ? true : offer.sellerAccepted || false;
              const bothAccepted = buyerAccepted && sellerAccepted;
              
              return {
                ...offer,
                buyerAccepted,
                sellerAccepted,
                bothAccepted,
                status: bothAccepted ? 'both_accepted' : 'counter_offered',
                [`${party}AcceptedAt`]: new Date().toISOString()
              };
            }
            return offer;
          });
          
          // If both accepted, mark request for admin approval
          const bothAcceptedOffer = updatedOffers.find(o => o.bothAccepted);
          // If both accepted, create trade and update
          if (bothAcceptedOffer) {
            createTradeFromAcceptedBid(request, bothAcceptedOffer);
          }
          return { 
            ...request, 
            offers: updatedOffers,
            status: bothAcceptedOffer ? 'pending_admin_approval' : request.status,
            acceptedOffer: bothAcceptedOffer ? bidId : request.acceptedOffer
          };
        }
        return request;
      }));
      return null;
    }
  };

  // Accept Counter Offer (Bidder/Offerer accepts counter price)
  const acceptCounterOffer = (listingId, bidId, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid._id === bidId ? { 
              ...bid, 
              status: 'counter_accepted_by_bidder',
              acceptedAt: new Date().toISOString()
            } : { ...bid, status: 'rejected' }
          );
          return { 
            ...listing, 
            bids: updatedBids,
            status: 'pending_admin_approval',
            acceptedBid: bidId
          };
        }
        return listing;
      }));
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request._id === listingId) {
          const updatedOffers = (request.offers || []).map(offer => 
            offer.id === bidId ? { 
              ...offer, 
              status: 'counter_accepted_by_offerer',
              acceptedAt: new Date().toISOString()
            } : { ...offer, status: 'rejected' }
          );
          return { 
            ...request, 
            offers: updatedOffers,
            status: 'pending_admin_approval',
            acceptedOffer: bidId
          };
        }
        return request;
      }));
    }
  };

  // Reject Counter Offer
  const rejectCounterOffer = (listingId, bidId, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid._id === bidId ? { ...bid, status: 'rejected' } : bid
          );
          return { ...listing, bids: updatedBids };
        }
        return listing;
      }));
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request._id === listingId) {
          const updatedOffers = (request.offers || []).map(offer => 
            offer.id === bidId ? { ...offer, status: 'rejected' } : offer
          );
          return { ...request, offers: updatedOffers };
        }
        return request;
      }));
    }
  };

  return (
    <ListingContext.Provider value={{ 
      sellListings,
      buyRequests,
      loading,
      createSellListing,
      createBuyRequest,
      placeBid,
      makeOffer,
      acceptBid,
      acceptOffer,
      adminApprove,
      adminClose,
      counterOffer,
      reCounterOffer,
      finalAcceptByParty,
      acceptCounterOffer,
      rejectCounterOffer,
      fetchListings
    }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  return React.useContext(ListingContext);
}
