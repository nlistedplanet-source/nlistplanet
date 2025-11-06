// Sample Sell Listings and Buy Requests for Testing
export const sampleSellListings = [
  {
    id: 1701234567890,
    company: "OYO Rooms",
    isin: "INE803A01015",
    price: 870,
    shares: 100,
    seller: "priya@example.com",
    sellerName: "Priya Sharma",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567891,
        bidder: "rahul@example.com",
        bidderName: "Rahul Kumar",
        price: 850,
        quantity: 100,
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567892,
    company: "Unacademy",
    isin: "INE902A01017",
    price: 650,
    shares: 200,
    seller: "vikram@example.com",
    sellerName: "Vikram Patel",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567893,
        bidder: "anjali@example.com",
        bidderName: "Anjali Desai",
        price: 630,
        quantity: 150,
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 1701234567894,
        bidder: "admin@example.com",
        bidderName: "Admin User",
        price: 640,
        quantity: 200,
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567895,
    company: "Byju's",
    isin: "INE903A01018",
    price: 780,
    shares: 150,
    seller: "anjali@example.com",
    sellerName: "Anjali Desai",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567896,
    company: "Swiggy",
    isin: "INE904A01019",
    price: 600,
    shares: 300,
    seller: "rahul@example.com",
    sellerName: "Rahul Kumar",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567897,
        bidder: "priya@example.com",
        bidderName: "Priya Sharma",
        price: 590,
        quantity: 250,
        status: "counter_offered",
        counterPrice: 595,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        counterAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567898,
    company: "Zomato",
    isin: "INE905A01020",
    price: 740,
    shares: 250,
    seller: "admin@example.com",
    sellerName: "Admin User",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567899,
        bidder: "vikram@example.com",
        bidderName: "Vikram Patel",
        price: 720,
        quantity: 250,
        status: "pending",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567900,
    company: "PharmEasy",
    isin: "INE906A01021",
    price: 450,
    shares: 400,
    seller: "priya@example.com",
    sellerName: "Priya Sharma",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567901,
    company: "Ola Cabs",
    isin: "INE907A01022",
    price: 920,
    shares: 180,
    seller: "vikram@example.com",
    sellerName: "Vikram Patel",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567902,
        bidder: "rahul@example.com",
        bidderName: "Rahul Kumar",
        price: 900,
        quantity: 180,
        status: "pending",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 1701234567903,
        bidder: "anjali@example.com",
        bidderName: "Anjali Desai",
        price: 910,
        quantity: 150,
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567904,
    company: "Urban Company",
    isin: "INE908A01023",
    price: 500,
    shares: 220,
    seller: "anjali@example.com",
    sellerName: "Anjali Desai",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567905,
    company: "Dream11",
    isin: "INE909A01024",
    price: 680,
    shares: 160,
    seller: "rahul@example.com",
    sellerName: "Rahul Kumar",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567906,
        bidder: "admin@example.com",
        bidderName: "Admin User",
        price: 670,
        quantity: 160,
        status: "pending",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567907,
    company: "Nykaa",
    isin: "INE910A01025",
    price: 570,
    shares: 320,
    seller: "priya@example.com",
    sellerName: "Priya Sharma",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567908,
    company: "Razorpay",
    isin: "INE911A01026",
    price: 950,
    shares: 120,
    seller: "vikram@example.com",
    sellerName: "Vikram Patel",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567909,
        bidder: "priya@example.com",
        bidderName: "Priya Sharma",
        price: 940,
        quantity: 120,
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567910,
    company: "Lenskart",
    isin: "INE912A01027",
    price: 530,
    shares: 280,
    seller: "admin@example.com",
    sellerName: "Admin User",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567911,
    company: "OYO Rooms",
    isin: "INE803A01015",
    price: 860,
    shares: 190,
    seller: "anjali@example.com",
    sellerName: "Anjali Desai",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567912,
    company: "Unacademy",
    isin: "INE902A01017",
    price: 640,
    shares: 240,
    seller: "rahul@example.com",
    sellerName: "Rahul Kumar",
    type: "sell",
    status: "active",
    bids: [
      {
        id: 1701234567913,
        bidder: "vikram@example.com",
        bidderName: "Vikram Patel",
        price: 625,
        quantity: 200,
        status: "pending",
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234567914,
    company: "Swiggy",
    isin: "INE904A01019",
    price: 595,
    shares: 350,
    seller: "priya@example.com",
    sellerName: "Priya Sharma",
    type: "sell",
    status: "active",
    bids: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export const sampleBuyRequests = [
  {
    id: 1701234568000,
    company: "Byju's",
    isin: "INE903A01018",
    price: 740,
    shares: 200,
    buyer: "rahul@example.com",
    buyerName: "Rahul Kumar",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568001,
        seller: "priya@example.com",
        sellerName: "Priya Sharma",
        price: 750,
        quantity: 200,
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568002,
    company: "Zomato",
    isin: "INE905A01020",
    price: 710,
    shares: 180,
    buyer: "priya@example.com",
    buyerName: "Priya Sharma",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568003,
    company: "PharmEasy",
    isin: "INE906A01021",
    price: 430,
    shares: 300,
    buyer: "vikram@example.com",
    buyerName: "Vikram Patel",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568004,
        seller: "anjali@example.com",
        sellerName: "Anjali Desai",
        price: 440,
        quantity: 300,
        status: "pending",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 1701234568005,
        seller: "admin@example.com",
        sellerName: "Admin User",
        price: 445,
        quantity: 250,
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568006,
    company: "Ola Cabs",
    isin: "INE907A01022",
    price: 880,
    shares: 150,
    buyer: "anjali@example.com",
    buyerName: "Anjali Desai",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568007,
        seller: "rahul@example.com",
        sellerName: "Rahul Kumar",
        price: 895,
        quantity: 150,
        status: "counter_offered",
        counterPrice: 890,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        counterAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568008,
    company: "Urban Company",
    isin: "INE908A01023",
    price: 470,
    shares: 200,
    buyer: "admin@example.com",
    buyerName: "Admin User",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568009,
    company: "Dream11",
    isin: "INE909A01024",
    price: 660,
    shares: 140,
    buyer: "rahul@example.com",
    buyerName: "Rahul Kumar",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568010,
        seller: "vikram@example.com",
        sellerName: "Vikram Patel",
        price: 670,
        quantity: 140,
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568011,
    company: "Nykaa",
    isin: "INE910A01025",
    price: 540,
    shares: 280,
    buyer: "priya@example.com",
    buyerName: "Priya Sharma",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568012,
    company: "Razorpay",
    isin: "INE911A01026",
    price: 910,
    shares: 100,
    buyer: "vikram@example.com",
    buyerName: "Vikram Patel",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568013,
        seller: "priya@example.com",
        sellerName: "Priya Sharma",
        price: 925,
        quantity: 100,
        status: "pending",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568014,
    company: "Lenskart",
    isin: "INE912A01027",
    price: 520,
    shares: 250,
    buyer: "anjali@example.com",
    buyerName: "Anjali Desai",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568015,
    company: "OYO Rooms",
    isin: "INE803A01015",
    price: 840,
    shares: 170,
    buyer: "admin@example.com",
    buyerName: "Admin User",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568016,
        seller: "rahul@example.com",
        sellerName: "Rahul Kumar",
        price: 855,
        quantity: 170,
        status: "pending",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568017,
    company: "Unacademy",
    isin: "INE902A01017",
    price: 610,
    shares: 220,
    buyer: "rahul@example.com",
    buyerName: "Rahul Kumar",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568018,
    company: "Swiggy",
    isin: "INE904A01019",
    price: 570,
    shares: 310,
    buyer: "priya@example.com",
    buyerName: "Priya Sharma",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568019,
        seller: "vikram@example.com",
        sellerName: "Vikram Patel",
        price: 585,
        quantity: 300,
        status: "pending",
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568020,
    company: "Byju's",
    isin: "INE903A01018",
    price: 760,
    shares: 190,
    buyer: "vikram@example.com",
    buyerName: "Vikram Patel",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568021,
    company: "Zomato",
    isin: "INE905A01020",
    price: 730,
    shares: 230,
    buyer: "anjali@example.com",
    buyerName: "Anjali Desai",
    type: "buy",
    status: "active",
    offers: [
      {
        id: 1701234568022,
        seller: "admin@example.com",
        sellerName: "Admin User",
        price: 735,
        quantity: 230,
        status: "pending",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 1701234568023,
    company: "PharmEasy",
    isin: "INE906A01021",
    price: 440,
    shares: 260,
    buyer: "rahul@example.com",
    buyerName: "Rahul Kumar",
    type: "buy",
    status: "active",
    offers: [],
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  }
];

// Function to load sample data into localStorage
export function loadSampleData() {
  const existingSellListings = JSON.parse(localStorage.getItem('sellListings') || '[]');
  const existingBuyRequests = JSON.parse(localStorage.getItem('buyRequests') || '[]');
  
  // Only add if there are fewer than 5 items (avoid duplicates on multiple loads)
  if (existingSellListings.length < 5) {
    localStorage.setItem('sellListings', JSON.stringify([...existingSellListings, ...sampleSellListings]));
  }
  
  if (existingBuyRequests.length < 5) {
    localStorage.setItem('buyRequests', JSON.stringify([...existingBuyRequests, ...sampleBuyRequests]));
  }
  
  console.log('✅ Sample data loaded!');
  console.log(`📊 Sell Listings: ${sampleSellListings.length}`);
  console.log(`🛒 Buy Requests: ${sampleBuyRequests.length}`);
}

// Function to clear all data
export function clearAllData() {
  localStorage.removeItem('sellListings');
  localStorage.removeItem('buyRequests');
  console.log('🗑️ All data cleared!');
}
