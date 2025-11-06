import React, { createContext, useState, useEffect } from 'react';

export const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  // Load from localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Portfolio Holdings - Completed purchases
  const [holdings, setHoldings] = useState(() => loadFromStorage('portfolioHoldings', []));
  
  // Transaction History - All completed transactions
  const [transactions, setTransactions] = useState(() => loadFromStorage('transactionHistory', []));

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('portfolioHoldings', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('transactionHistory', JSON.stringify(transactions));
  }, [transactions]);

  // Add new holding to portfolio
  const addHolding = (holdingData) => {
    const newHolding = {
      id: Date.now(),
      ...holdingData,
      purchaseDate: new Date().toISOString(),
      currentPrice: holdingData.purchasePrice, // Initially same as purchase price
      lastUpdated: new Date().toISOString()
    };
    setHoldings([...holdings, newHolding]);
    return newHolding;
  };

  // Update current price of holding
  const updateCurrentPrice = (holdingId, newPrice) => {
    setHoldings(holdings.map(holding => 
      holding.id === holdingId 
        ? { ...holding, currentPrice: newPrice, lastUpdated: new Date().toISOString() }
        : holding
    ));
  };

  // Remove holding from portfolio (when sold completely)
  const removeHolding = (holdingId) => {
    setHoldings(holdings.filter(holding => holding.id !== holdingId));
  };

  // Update holding quantity
  const updateHoldingQuantity = (holdingId, newQuantity) => {
    if (newQuantity <= 0) {
      removeHolding(holdingId);
    } else {
      setHoldings(holdings.map(holding =>
        holding.id === holdingId
          ? { ...holding, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : holding
      ));
    }
  };

  // Add transaction to history
  const addTransaction = (transactionData) => {
    const newTransaction = {
      id: Date.now(),
      ...transactionData,
      completedAt: new Date().toISOString()
    };
    setTransactions([newTransaction, ...transactions]);
    
    // If it's a buy transaction, add to holdings
    if (transactionData.type === 'buy') {
      const existingHolding = holdings.find(h => 
        h.company === transactionData.company && h.isin === transactionData.isin
      );
      
      if (existingHolding) {
        // Update existing holding
        const totalQuantity = existingHolding.quantity + transactionData.quantity;
        const avgPrice = ((existingHolding.purchasePrice * existingHolding.quantity) + 
                         (transactionData.price * transactionData.quantity)) / totalQuantity;
        
        setHoldings(holdings.map(holding =>
          holding.id === existingHolding.id
            ? { 
                ...holding, 
                quantity: totalQuantity,
                purchasePrice: avgPrice,
                lastUpdated: new Date().toISOString()
              }
            : holding
        ));
      } else {
        // Add new holding
        addHolding({
          company: transactionData.company,
          isin: transactionData.isin,
          quantity: transactionData.quantity,
          purchasePrice: transactionData.price
        });
      }
    } else if (transactionData.type === 'sell') {
      // Reduce quantity from holdings
      const existingHolding = holdings.find(h => 
        h.company === transactionData.company && h.isin === transactionData.isin
      );
      
      if (existingHolding) {
        updateHoldingQuantity(existingHolding.id, existingHolding.quantity - transactionData.quantity);
      }
    }
    
    return newTransaction;
  };

  // Get portfolio summary
  const getPortfolioSummary = () => {
    const totalInvestment = holdings.reduce((sum, h) => sum + (h.purchasePrice * h.quantity), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);
    const totalGainLoss = currentValue - totalInvestment;
    const gainLossPercent = totalInvestment > 0 ? ((totalGainLoss / totalInvestment) * 100) : 0;
    
    return {
      totalHoldings: holdings.length,
      totalInvestment,
      currentValue,
      totalGainLoss,
      gainLossPercent
    };
  };

  return (
    <PortfolioContext.Provider value={{
      holdings,
      transactions,
      addHolding,
      updateCurrentPrice,
      removeHolding,
      updateHoldingQuantity,
      addTransaction,
      getPortfolioSummary
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return React.useContext(PortfolioContext);
}
