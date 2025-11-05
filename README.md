# UnlistedHub - P2P Marketplace for Unlisted Shares

A modern React application for trading unlisted shares with a single account and multiple roles.

## 🚀 Features

- **ONE Account, Multiple Roles**: No need for separate buyer/seller accounts
- **Role Switching**: Switch between Buyer, Seller, and Admin roles instantly
- **Marketplace**: Browse and bid on unlisted shares
- **Bidding System**: Place bids and negotiate prices
- **Admin Dashboard**: Approve transactions and collect fees
- **Responsive Design**: Works on desktop and mobile

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone or Extract the project**
```bash
cd UnlistedHub-React-Project
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🎯 How to Use

### Sign Up
1. Click "Sign Up" button
2. Fill in your details (Name, Email, Password)
3. Select account type (Regular User or Admin)
4. Click "Create Account"

### Switch Roles
1. Click your name in the header
2. Select role from dropdown:
   - 🛒 BUYER
   - 📤 SELLER
   - ⚙️ ADMIN (if enabled)

### Buyer Flow
1. Go to "Marketplace"
2. Browse listings
3. Click "Place Bid" on any listing
4. Enter bid price and quantity
5. Submit bid

### Seller Flow
1. Switch to SELLER role
2. Go to "Sell"
3. Fill listing details
4. Post listing
5. Go to "My Bids" → "Received" to manage bids
6. Make counter offers or accept prices

### Admin Flow
1. Switch to ADMIN role (if available)
2. Go to "Admin Dashboard"
3. View pending transactions
4. Approve deals to collect fees

## 📁 Project Structure

```
UnlistedHub-React-Project/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── HomePage.jsx
│   │   ├── SignUp.jsx
│   │   ├── SignIn.jsx
│   │   ├── Marketplace.jsx
│   │   ├── SellPage.jsx
│   │   ├── MyBids.jsx
│   │   └── AdminDashboard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ListingContext.jsx
│   │   └── BidContext.jsx
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
├── .gitignore
└── README.md
```

## 🛠️ Technologies Used

- **React 18**: UI framework
- **React Hooks**: State management (useState, useContext)
- **Context API**: Global state management
- **Tailwind CSS**: Styling
- **JavaScript (ES6+)**: Programming language

## 💡 Key Concepts

### Single Account with Multiple Roles
- Users create ONE account
- Can switch between Buyer, Seller, and Admin roles
- Same wallet balance across all roles
- Unified reputation system

### State Management
- **AuthContext**: Handles user authentication and role switching
- **ListingContext**: Manages listings (create, read, update)
- **BidContext**: Manages bids, counter offers, and transactions

### Features

#### Bidding Algorithm
- Buyer places initial bid
- Seller makes counter offer
- Both parties negotiate via counter offers
- When price agreed, sent to admin
- Admin approves and collects 10% fee

#### Admin Controls
- View all pending transactions
- Approve deals
- Collect administrative fees
- View transaction statistics

## 📝 Environment Variables

Currently, the app uses local state. For production, add:

```
REACT_APP_API_URL=your_api_url
REACT_APP_ENV=production
```

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## 🌐 Deployment

- **Frontend**: Vercel - `https://nlistplanet.vercel.app`
- **Backend**: Render - `https://nlistplanet-backend.onrender.com`

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for modern trading platforms**

Happy trading! 🚀📈
