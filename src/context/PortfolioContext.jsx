import React, { createContext, useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';

export const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  // Portfolio Holdings - Completed purchases
  const [holdings, setHoldings] = useState([]);
  
  // Transaction History - All completed transactions
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  // Fetch portfolio from MongoDB on mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      const portfolio = response.data;
      setHoldings(portfolio.holdings || []);
      setTransactions(portfolio.transactions || []);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setHoldings([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new holding to portfolio (deprecated - use addTransaction instead)
  const addHolding = (holdingData) => {
    const newHolding = {
      id: Date.now(),
      ...holdingData,
      purchaseDate: new Date().toISOString(),
      currentPrice: holdingData.purchasePrice,
      lastUpdated: new Date().toISOString()
    };
    setHoldings([...holdings, newHolding]);
    return newHolding;
  };

  // Update current price of holding
  const updateCurrentPrice = async (holdingId, newPrice) => {
    try {
      const holding = holdings.find(h => h._id === holdingId);
      if (!holding) return;
      
      await portfolioAPI.updateHoldingPrice(holding.isin, newPrice);
      setHoldings(holdings.map(h => 
        h._id === holdingId 
          ? { ...h, currentPrice: newPrice, lastUpdated: new Date().toISOString() }
          : h
      ));
    } catch (error) {
      console.error('Failed to update price:', error);
      throw error;
    }
  };

  // Remove holding from portfolio (when sold completely)
  const removeHolding = (holdingId) => {
    setHoldings(holdings.filter(holding => holding._id !== holdingId));
  };

  // Update holding quantity
  const updateHoldingQuantity = (holdingId, newQuantity) => {
    if (newQuantity <= 0) {
      removeHolding(holdingId);
    } else {
      setHoldings(holdings.map(holding =>
        holding._id === holdingId
          ? { ...holding, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : holding
      ));
    }
  };

  // Add transaction to history
  const addTransaction = async (transactionData) => {
    try {
      const response = await portfolioAPI.addTransaction(transactionData);
      const portfolio = response.data.portfolio;
      
      setHoldings(portfolio.holdings || []);
      setTransactions(portfolio.transactions || []);
      
      return portfolio.transactions[0]; // Return the newly added transaction
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
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
      loading,
      addHolding,
      updateCurrentPrice,
      removeHolding,
      updateHoldingQuantity,
      addTransaction,
      getPortfolioSummary,
      fetchPortfolio
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return React.useContext(PortfolioContext);
}
