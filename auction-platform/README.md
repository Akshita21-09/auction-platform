# 🏷️ BidVerse — Real-Time Auction Platform

> A full-stack, production-ready real-time auction platform built for a university Full Stack Development Mini Project. Features live Socket.IO bidding, JWT authentication, MongoDB persistence, Docker support, and CI/CD via GitHub Actions.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/atlas)

---

## 📁 Project Structure

```
auction-platform/
├── backend/                     # Node.js / Express API
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── cloudinary.js        # Image upload config
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile
│   │   ├── auctionController.js # CRUD + dashboard stats
│   │   ├── bidController.js     # Place & fetch bids
│   │   └── userController.js    # User profiles
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT protect + generateToken
│   │   └── errorMiddleware.js   # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Auction.js           # Auction schema
│   │   └── Bid.js               # Bid schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── auctionRoutes.js
│   │   ├── bidRoutes.js
│   │   └── userRoutes.js
│   ├── socket/
│   │   └── socketHandler.js     # Real-time bidding engine
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── auction/
│   │   │   │   ├── AuctionCard.jsx
│   │   │   │   └── CountdownTimer.jsx
│   │   │   └── bid/
│   │   │       └── BidPanel.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state
│   │   │   ├── SocketContext.jsx# Socket.IO connection
│   │   │   └── ThemeContext.jsx # Dark/light mode
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AuctionListing.jsx
│   │   │   ├── AuctionDetails.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateAuction.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance
│   │   │   └── auctionService.js# API calls
│   │   ├── utils/
│   │   │   └── helpers.js       # formatCurrency, timers...
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
├── docker-compose.yml           # Production Docker stack
├── docker-compose.dev.yml       # Dev Docker stack with hot-reload
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local) OR MongoDB Atlas account
- Git
- VS Code (recommended)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/auction-platform.git
cd auction-platform
```

---

### Step 2 — Backend Setup

Open your VS Code integrated terminal (`` Ctrl + ` ``) and run:

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/auctiondb
JWT_SECRET=your_super_secret_key_minimum_32_characters_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary (sign up free at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

You should see:
```
╔══════════════════════════════════════╗
║   🏷️  Auction Platform Server        ║
║   Running on port 5000               ║
╚══════════════════════════════════════╝
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

### Step 3 — Frontend Setup

Open a **second terminal** in VS Code (`Ctrl + Shift + 5` to split):

```bash
cd frontend
npm install
```

Create frontend environment file:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=BidVerse
```

Start the frontend:

```bash
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## 🐳 Docker Setup (Recommended for Submission)

### Run entire stack with one command:

```bash
# Production mode
docker-compose up --build

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- MongoDB: localhost:27017

### Stop containers:
```bash
docker-compose down
# To also remove data volumes:
docker-compose down -v
```

---

## 🌐 Deployment

### Backend → Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node server.js`
7. Add Environment Variables (from `.env`):
   - `MONGO_URI` → your Atlas URI
   - `JWT_SECRET` → secure random string
   - `CLIENT_URL` → your Vercel URL
   - `NODE_ENV` → `production`
   - Cloudinary keys
8. Click **Deploy**

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Or via Vercel Dashboard:
1. Import GitHub repo
2. Set **Root Directory**: `frontend`
3. Add Environment Variables:
   - `VITE_API_URL` → `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` → `https://your-render-url.onrender.com`
4. Deploy!

### Database → MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user with username/password
4. Allow all IPs (0.0.0.0/0) in Network Access
5. Copy connection string and set as `MONGO_URI`

---

## 🔌 API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| PUT | `/api/auth/password` | Private | Change password |

### Auction Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auctions` | Public | List all auctions |
| GET | `/api/auctions/:id` | Public | Get one auction |
| POST | `/api/auctions` | Private | Create auction (multipart) |
| PUT | `/api/auctions/:id` | Private | Update auction |
| DELETE | `/api/auctions/:id` | Private | Delete auction |
| GET | `/api/auctions/my/listings` | Private | My listings |
| GET | `/api/auctions/my/wins` | Private | Won auctions |
| GET | `/api/auctions/stats/dashboard` | Private | Dashboard stats |

### Bid Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bids/:auctionId` | Private | Place bid (REST) |
| GET | `/api/bids/:auctionId` | Public | Get auction bids |
| GET | `/api/bids/user/history` | Private | My bid history |

---

## ⚡ Socket.IO Events

### Client → Server (emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `joinAuction` | `auctionId` | Join a bidding room |
| `leaveAuction` | `auctionId` | Leave a bidding room |
| `placeBid` | `{ auctionId, amount }` | Place a real-time bid |
| `checkAuctionEnd` | `auctionId` | Check if auction ended |
| `userTyping` | `{ auctionId }` | Show typing indicator |

### Server → Client (on)

| Event | Payload | Description |
|-------|---------|-------------|
| `auctionState` | Auction data | Current state on join |
| `highestBidUpdate` | Bid + auction data | New bid broadcast |
| `bidSuccess` | Confirmation | Your bid was accepted |
| `bidError` | `{ message }` | Bid rejected |
| `auctionEnded` | Winner data | Auction closed |
| `viewerCount` | `{ count }` | Live viewer count |

---

## 🧪 Postman API Testing

### 1. Health Check
```
GET http://localhost:5000/api/health
```

### 2. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
Copy the `token` from response.

### 4. Create Auction (with image)
```
POST http://localhost:5000/api/auctions
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

image: [file upload]
title: Vintage Watch
description: A beautiful vintage watch from 1965
category: Jewelry
startingPrice: 500
endTime: 2024-12-31T23:59:00
```

### 5. Get All Auctions
```
GET http://localhost:5000/api/auctions?page=1&limit=10&status=active
```

---

## 🗃️ MongoDB Schemas

### Users
```javascript
{
  name: String,          // 2-50 chars
  email: String,         // unique, lowercase
  password: String,      // hashed (bcrypt, salt 12)
  avatar: String,        // URL
  bio: String,           // max 200 chars
  totalWins: Number,
  totalBids: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Auctions
```javascript
{
  title: String,          // 3-100 chars
  description: String,    // 10-1000 chars
  image: String,          // Cloudinary URL
  category: String,       // enum
  startingPrice: Number,
  currentBid: Number,
  highestBidder: ObjectId (→ User),
  seller: ObjectId (→ User),
  endTime: Date,
  status: String,         // active | ended | cancelled
  totalBids: Number,
  winner: ObjectId (→ User)
}
```

### Bids
```javascript
{
  auction: ObjectId (→ Auction),
  bidder: ObjectId (→ User),
  bidderName: String,
  amount: Number,
  createdAt: Date
}
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` on MongoDB | DB not running | Start MongoDB or check Atlas URI |
| `JWT secret must be set` | Missing env var | Add `JWT_SECRET` to `.env` |
| `CORS error` in browser | Wrong `CLIENT_URL` | Set `CLIENT_URL=http://localhost:5173` |
| Image upload fails | Cloudinary not configured | Add Cloudinary keys to `.env` |
| Socket not connecting | Wrong `VITE_SOCKET_URL` | Set to `http://localhost:5000` |
| `Bid must be greater` | Amount too low | Bid > current highest bid |
| Port 5000 already in use | Another process running | Kill it: `lsof -ti:5000 \| xargs kill` |

---

## 🎓 Viva Questions & Answers

**Q1: What is Socket.IO and why did you use it?**
> Socket.IO is a library enabling real-time, bidirectional, event-based communication between the browser and server over WebSockets. I used it so multiple users can bid simultaneously and see live price updates without refreshing the page.

**Q2: How does JWT authentication work?**
> On login, the server signs a payload (user ID) with a secret key using HMAC-SHA256, creating a compact token. The client stores it and sends it in `Authorization: Bearer <token>` headers. The server verifies the signature on each protected route.

**Q3: How do you prevent bid manipulation?**
> Bids are validated server-side in the Socket.IO handler: amount must exceed current bid, auction must be active, sellers can't bid on their own items, and the JWT is verified to confirm identity.

**Q4: Explain the database schemas.**
> Three collections: Users (auth + stats), Auctions (item details, timer, status, current bid), and Bids (every bid event linked to auction and bidder for full history).

**Q5: What is bcrypt and why use it?**
> bcrypt is a password hashing algorithm that incorporates a salt and cost factor (we use 12 rounds). It's slow by design — brute force attacks are impractical. Even if the DB is breached, passwords remain secure.

**Q6: How does the countdown timer work?**
> The frontend `CountdownTimer` component runs a `setInterval` every second calculating `endTime - now`. When it reaches zero, it emits a `checkAuctionEnd` socket event. The server validates, marks the auction ended, and broadcasts `auctionEnded` to all room members.

**Q7: What is the purpose of Context API here?**
> Three contexts: `AuthContext` (user + token state, login/logout), `SocketContext` (shared Socket.IO instance across all components), and `ThemeContext` (dark/light mode preference persisted to localStorage).

**Q8: How does Cloudinary image upload work?**
> multer parses the multipart form data, multer-storage-cloudinary streams the file directly to Cloudinary's CDN (no temp files on server), and returns the CDN URL which is stored in MongoDB.

**Q9: Explain protected routes.**
> `ProtectedRoute` wraps pages requiring auth. It reads from `AuthContext` — if no user, it redirects to `/login` with the current path saved in `state`, so after login the user is redirected back.

**Q10: What is Docker and why use it?**
> Docker packages the app and all its dependencies into containers that run identically on any machine. `docker-compose.yml` orchestrates the three services (MongoDB, backend, frontend) with one command.

---

## 🛡️ Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens with expiry
- ✅ Input validation (express-validator)
- ✅ Protected API routes with middleware
- ✅ CORS configured to whitelist origins
- ✅ Seller cannot bid on own auction
- ✅ Server-side bid validation (not just client)
- ✅ Mongoose schema validation
- ✅ Duplicate email prevention
- ✅ File type + size validation on image upload

---

## 👥 Team & Acknowledgements

Built as a Full Stack Development Mini Project.

**Tech Credits:**
- [Socket.IO](https://socket.io) — Real-time engine
- [MongoDB Atlas](https://mongodb.com/atlas) — Cloud database
- [Cloudinary](https://cloudinary.com) — Image CDN
- [Vercel](https://vercel.com) — Frontend hosting
- [Render](https://render.com) — Backend hosting
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling

---

## 📜 License

MIT © 2024 BidVerse Team
