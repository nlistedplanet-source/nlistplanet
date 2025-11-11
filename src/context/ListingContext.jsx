import React, { createContext, useState, useEffect } from 'react';
import { listingAPI } from '../services/api';

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
      // Debug: log server response to ensure we pick the right payload field
      console.log('createBuyRequest response:', response && response.data);
      const newRequest = (response && (response.data?.listing || response.data)) || data;
      
  // Optimistic UI: add the new request locally so it appears immediately
  setBuyRequests((prev) => [newRequest, ...(prev || [])]);

      // Force refresh to ensure latest data from server (will reconcile state)
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

  // Counter Offer (Negotiation)
  const counterOffer = (listingId, bidId, newPrice, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing._id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid._id === bidId ? { 
              ...bid, 
              counterPrice: newPrice,
              status: 'counter_offered',
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
              status: 'counter_offered',
              counterAt: new Date().toISOString()
            } : offer
          );
          return { ...request, offers: updatedOffers };
        }
        return request;
      }));
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
