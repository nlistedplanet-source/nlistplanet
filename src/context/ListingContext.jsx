import React, { createContext, useState, useEffect } from 'react';

export const ListingContext = createContext();

export function ListingProvider({ children }) {
  // Load from localStorage or initialize empty
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Sell Listings - Users/Admin want to SELL shares
  const [sellListings, setSellListings] = useState(() => loadFromStorage('sellListings', []));

  // Buy Requests - Users/Admin want to BUY shares
  const [buyRequests, setBuyRequests] = useState(() => loadFromStorage('buyRequests', []));

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('sellListings', JSON.stringify(sellListings));
  }, [sellListings]);

  useEffect(() => {
    localStorage.setItem('buyRequests', JSON.stringify(buyRequests));
  }, [buyRequests]);

  // Create Sell Listing
  const createSellListing = (data) => {
    const newListing = { 
      id: Date.now(), 
      ...data, 
      type: 'sell',
      status: 'active',
      bids: [],
      createdAt: new Date().toISOString()
    };
    setSellListings([...sellListings, newListing]);
    return newListing;
  };

  // Create Buy Request
  const createBuyRequest = (data) => {
    const newRequest = { 
      id: Date.now(), 
      ...data, 
      type: 'buy',
      status: 'active',
      offers: [],
      createdAt: new Date().toISOString()
    };
    setBuyRequests([...buyRequests, newRequest]);
    return newRequest;
  };

  // Place Bid on Sell Listing
  const placeBid = (listingId, bidData) => {
    setSellListings(sellListings.map(listing => {
      if (listing.id === listingId) {
        const newBid = {
          id: Date.now(),
          ...bidData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return { ...listing, bids: [...listing.bids, newBid] };
      }
      return listing;
    }));
  };

  // Make Offer on Buy Request
  const makeOffer = (requestId, offerData) => {
    setBuyRequests(buyRequests.map(request => {
      if (request.id === requestId) {
        const newOffer = {
          id: Date.now(),
          ...offerData,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return { ...request, offers: [...request.offers, newOffer] };
      }
      return request;
    }));
  };

  // Accept Bid (Seller accepts bid)
  const acceptBid = (listingId, bidId) => {
    setSellListings(sellListings.map(listing => {
      if (listing.id === listingId) {
        const updatedBids = listing.bids.map(bid => 
          bid.id === bidId ? { ...bid, status: 'accepted' } : { ...bid, status: 'rejected' }
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
      if (request.id === requestId) {
        const updatedOffers = request.offers.map(offer => 
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
        listing.id === id ? { ...listing, status: 'approved' } : listing
      ));
    } else {
      setBuyRequests(buyRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      ));
    }
  };

  // Admin Close Transaction
  const adminClose = (id, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => 
        listing.id === id ? { ...listing, status: 'closed', closedAt: new Date().toISOString() } : listing
      ));
    } else {
      setBuyRequests(buyRequests.map(request => 
        request.id === id ? { ...request, status: 'closed', closedAt: new Date().toISOString() } : request
      ));
    }
  };

  // Counter Offer (Negotiation)
  const counterOffer = (listingId, bidId, newPrice, type) => {
    if (type === 'sell') {
      setSellListings(sellListings.map(listing => {
        if (listing.id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid.id === bidId ? { 
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
        if (request.id === listingId) {
          const updatedOffers = request.offers.map(offer => 
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
        if (listing.id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid.id === bidId ? { 
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
        if (request.id === listingId) {
          const updatedOffers = request.offers.map(offer => 
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
        if (listing.id === listingId) {
          const updatedBids = listing.bids.map(bid => 
            bid.id === bidId ? { ...bid, status: 'rejected' } : bid
          );
          return { ...listing, bids: updatedBids };
        }
        return listing;
      }));
    } else {
      setBuyRequests(buyRequests.map(request => {
        if (request.id === listingId) {
          const updatedOffers = request.offers.map(offer => 
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
      rejectCounterOffer
    }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  return React.useContext(ListingContext);
}
