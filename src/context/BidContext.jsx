import React, { createContext, useState } from 'react';

export const BidContext = createContext();

export function BidProvider({ children }) {
  const [bids, setBids] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const placeBid = (bidData) => {
    setBids([...bids, { id: Date.now(), ...bidData, status: 'pending' }]);
  };

  const makeCounterOffer = (bidId, price) => {
    setBids(bids.map(b => b.id === bidId ? { ...b, status: 'counter_offered', counterPrice: price } : b));
  };

  const confirmPriceAgreement = (bidId) => {
    const bid = bids.find(b => b.id === bidId);
    if (bid) {
      setTransactions([...transactions, { id: Date.now(), ...bid, status: 'pending_admin' }]);
    }
  };

  const approveTransaction = (txnId) => {
    setTransactions(transactions.map(t => t.id === txnId ? { ...t, status: 'completed' } : t));
  };

  return (
    <BidContext.Provider value={{ bids, transactions, placeBid, makeCounterOffer, confirmPriceAgreement, approveTransaction }}>
      {children}
    </BidContext.Provider>
  );
}

export function useBid() {
  return React.useContext(BidContext);
}
