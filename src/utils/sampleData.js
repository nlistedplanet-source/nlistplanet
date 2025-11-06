// Sample data for testing
export const generateSampleData = () => {
  const sampleSellListings = [
    // OLA Electric
    { id: 1730900001, company: 'OLA Electric Mobility Pvt Ltd', isin: 'INE0LEC01010', price: 95, shares: 500, seller: 'priya@example.com', sellerName: 'Priya Sharma', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-05T10:30:00Z' },
    { id: 1730900002, company: 'OLA Electric Mobility Pvt Ltd', isin: 'INE0LEC01010', price: 98, shares: 1000, seller: 'vikram@example.com', sellerName: 'Vikram Singh', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-05T11:00:00Z' },
    { id: 1730900003, company: 'OLA Electric Mobility Pvt Ltd', isin: 'INE0LEC01010', price: 92, shares: 250, seller: 'anjali@example.com', sellerName: 'Anjali Patel', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-05T12:15:00Z' },
    
    // Swiggy
    { id: 1730900004, company: 'Swiggy Limited', isin: 'INESWG01015', price: 390, shares: 200, seller: 'priya@example.com', sellerName: 'Priya Sharma', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-05T09:45:00Z' },
    { id: 1730900005, company: 'Swiggy Limited', isin: 'INESWG01015', price: 395, shares: 150, seller: 'vikram@example.com', sellerName: 'Vikram Singh', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-05T14:20:00Z' },
    
    // PhonePe
    { id: 1730900006, company: 'PhonePe Pvt Ltd', isin: 'INEPHO01018', price: 850, shares: 100, seller: 'anjali@example.com', sellerName: 'Anjali Patel', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-04T16:30:00Z' },
    { id: 1730900007, company: 'PhonePe Pvt Ltd', isin: 'INEPHO01018', price: 870, shares: 75, seller: 'admin@nlist.com', sellerName: 'Admin', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-04T10:00:00Z' },
    
    // Zerodha
    { id: 1730900008, company: 'Zerodha Broking Ltd', isin: 'INEZER01012', price: 18000, shares: 10, seller: 'priya@example.com', sellerName: 'Priya Sharma', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-03T11:30:00Z' },
    { id: 1730900009, company: 'Zerodha Broking Ltd', isin: 'INEZER01012', price: 18500, shares: 5, seller: 'vikram@example.com', sellerName: 'Vikram Singh', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-03T15:45:00Z' },
    
    // Byju's
    { id: 1730900010, company: "Think and Learn Pvt Ltd (Byju's)", isin: 'INEBYU01013', price: 120, shares: 300, seller: 'anjali@example.com', sellerName: 'Anjali Patel', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-04T09:00:00Z' },
    { id: 1730900011, company: "Think and Learn Pvt Ltd (Byju's)", isin: 'INEBYU01013', price: 115, shares: 500, seller: 'admin@nlist.com', sellerName: 'Admin', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-04T13:20:00Z' },
    
    // Razorpay
    { id: 1730900012, company: 'Razorpay Software Pvt Ltd', isin: 'INERAZ01014', price: 7500, shares: 20, seller: 'priya@example.com', sellerName: 'Priya Sharma', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-02T10:15:00Z' },
    
    // CRED
    { id: 1730900013, company: 'Dreamplug Technologies Pvt Ltd (CRED)', isin: 'INECRE01016', price: 2200, shares: 50, seller: 'vikram@example.com', sellerName: 'Vikram Singh', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-03T08:30:00Z' },
    { id: 1730900014, company: 'Dreamplug Technologies Pvt Ltd (CRED)', isin: 'INECRE01016', price: 2150, shares: 30, seller: 'anjali@example.com', sellerName: 'Anjali Patel', type: 'sell', status: 'active', bids: [], createdAt: '2025-11-03T14:00:00Z' },
  ];

  const sampleBuyRequests = [
    // OLA Electric
    { id: 1730900101, company: 'OLA Electric Mobility Pvt Ltd', isin: 'INE0LEC01010', price: 90, shares: 600, buyer: 'test1@example.com', buyerName: 'Rahul Kumar', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-05T11:45:00Z' },
    { id: 1730900102, company: 'OLA Electric Mobility Pvt Ltd', isin: 'INE0LEC01010', price: 93, shares: 400, buyer: 'test2@example.com', buyerName: 'Amit Shah', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-05T13:00:00Z' },
    
    // Swiggy
    { id: 1730900103, company: 'Swiggy Limited', isin: 'INESWG01015', price: 385, shares: 250, buyer: 'test1@example.com', buyerName: 'Rahul Kumar', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-05T10:00:00Z' },
    { id: 1730900104, company: 'Swiggy Limited', isin: 'INESWG01015', price: 392, shares: 180, buyer: 'test3@example.com', buyerName: 'Neha Verma', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-05T15:30:00Z' },
    
    // PhonePe
    { id: 1730900105, company: 'PhonePe Pvt Ltd', isin: 'INEPHO01018', price: 840, shares: 120, buyer: 'test2@example.com', buyerName: 'Amit Shah', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-04T12:00:00Z' },
    { id: 1730900106, company: 'PhonePe Pvt Ltd', isin: 'INEPHO01018', price: 860, shares: 80, buyer: 'test3@example.com', buyerName: 'Neha Verma', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-04T16:45:00Z' },
    
    // Zerodha
    { id: 1730900107, company: 'Zerodha Broking Ltd', isin: 'INEZER01012', price: 17500, shares: 12, buyer: 'test1@example.com', buyerName: 'Rahul Kumar', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-03T10:30:00Z' },
    
    // Byju's
    { id: 1730900108, company: "Think and Learn Pvt Ltd (Byju's)", isin: 'INEBYU01013', price: 110, shares: 400, buyer: 'test2@example.com', buyerName: 'Amit Shah', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-04T11:00:00Z' },
    { id: 1730900109, company: "Think and Learn Pvt Ltd (Byju's)", isin: 'INEBYU01013', price: 118, shares: 350, buyer: 'test3@example.com', buyerName: 'Neha Verma', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-04T14:30:00Z' },
    
    // Razorpay
    { id: 1730900110, company: 'Razorpay Software Pvt Ltd', isin: 'INERAZ01014', price: 7400, shares: 25, buyer: 'test1@example.com', buyerName: 'Rahul Kumar', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-02T09:00:00Z' },
    
    // CRED
    { id: 1730900111, company: 'Dreamplug Technologies Pvt Ltd (CRED)', isin: 'INECRE01016', price: 2100, shares: 60, buyer: 'test2@example.com', buyerName: 'Amit Shah', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-03T09:15:00Z' },
    { id: 1730900112, company: 'Dreamplug Technologies Pvt Ltd (CRED)', isin: 'INECRE01016', price: 2180, shares: 40, buyer: 'test3@example.com', buyerName: 'Neha Verma', type: 'buy', status: 'active', offers: [], createdAt: '2025-11-03T12:45:00Z' },
  ];

  return { sellListings: sampleSellListings, buyRequests: sampleBuyRequests };
};

// Function to load sample data to localStorage
export const loadSampleData = () => {
  const { sellListings, buyRequests } = generateSampleData();
  localStorage.setItem('sellListings', JSON.stringify(sellListings));
  localStorage.setItem('buyRequests', JSON.stringify(buyRequests));
  console.log('✅ Sample data loaded successfully!');
  console.log(`📊 Sell Listings: ${sellListings.length}`);
  console.log(`🛒 Buy Requests: ${buyRequests.length}`);
  window.location.reload(); // Reload to show data
};

// Function to clear all data
export const clearAllData = () => {
  localStorage.removeItem('sellListings');
  localStorage.removeItem('buyRequests');
  console.log('🗑️ All data cleared!');
  window.location.reload(); // Reload to clear UI
};

// Make functions available in console
window.loadSampleData = loadSampleData;
window.clearAllData = clearAllData;
