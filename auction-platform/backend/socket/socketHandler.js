const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow unauthenticated connections for viewing
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email');

      if (!user) {
        socket.user = null;
        return next();
      }

      socket.user = user;
      next();
    } catch (error) {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | User: ${socket.user?.name || 'Guest'}`);

    // ─── JOIN AUCTION ROOM ────────────────────────────────────────
    socket.on('joinAuction', async (auctionId) => {
      try {
        socket.join(auctionId);
        const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;

        // Send current auction state to the new user
        const auction = await Auction.findById(auctionId)
          .populate('highestBidder', 'name');

        if (auction) {
          socket.emit('auctionState', {
            auctionId,
            currentBid: auction.currentBid,
            highestBidder: auction.highestBidderName,
            totalBids: auction.totalBids,
            status: auction.status,
            endTime: auction.endTime
          });
        }

        // Notify room of viewer count
        io.to(auctionId).emit('viewerCount', { count: roomSize });

        console.log(`📡 User ${socket.user?.name || 'Guest'} joined auction room: ${auctionId} (${roomSize} viewers)`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join auction room' });
      }
    });

    // ─── LEAVE AUCTION ROOM ───────────────────────────────────────
    socket.on('leaveAuction', (auctionId) => {
      socket.leave(auctionId);
      const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
      io.to(auctionId).emit('viewerCount', { count: roomSize });
      console.log(`📡 User left auction room: ${auctionId}`);
    });

    // ─── PLACE BID ────────────────────────────────────────────────
    socket.on('placeBid', async ({ auctionId, amount }) => {
      try {
        // Must be authenticated
        if (!socket.user) {
          return socket.emit('bidError', { message: 'Please login to place a bid' });
        }

        const auction = await Auction.findById(auctionId);

        if (!auction) {
          return socket.emit('bidError', { message: 'Auction not found' });
        }

        if (auction.status !== 'active') {
          return socket.emit('bidError', { message: 'Auction is not active' });
        }

        // Check if auction has expired
        if (new Date() > new Date(auction.endTime)) {
          auction.status = 'ended';
          if (auction.highestBidder) {
            auction.winner = auction.highestBidder;
            const winner = await User.findByIdAndUpdate(
              auction.highestBidder,
              { $inc: { totalWins: 1 } },
              { new: true }
            );
          }
          await auction.save();

          io.to(auctionId).emit('auctionEnded', {
            auctionId,
            winner: auction.highestBidderName || 'No winner',
            finalBid: auction.currentBid,
            message: `Auction ended! Winner: ${auction.highestBidderName || 'No bids placed'}`
          });

          return socket.emit('bidError', { message: 'Auction has already ended' });
        }

        // Check seller can't bid on own auction
        if (auction.seller.toString() === socket.user._id.toString()) {
          return socket.emit('bidError', { message: 'You cannot bid on your own auction' });
        }

        // Validate bid amount
        const minBid = auction.currentBid + 1;
        if (Number(amount) < minBid) {
          return socket.emit('bidError', {
            message: `Bid must be at least $${minBid.toLocaleString()}`
          });
        }

        // Create bid record
        const bid = await Bid.create({
          auction: auctionId,
          bidder: socket.user._id,
          bidderName: socket.user.name,
          amount: Number(amount)
        });

        // Update auction
        auction.currentBid = Number(amount);
        auction.highestBidder = socket.user._id;
        auction.highestBidderName = socket.user.name;
        auction.totalBids += 1;
        await auction.save();

        // Update user stats
        await User.findByIdAndUpdate(socket.user._id, { $inc: { totalBids: 1 } });

        const bidData = {
          auctionId,
          currentBid: auction.currentBid,
          highestBidder: socket.user.name,
          highestBidderId: socket.user._id,
          totalBids: auction.totalBids,
          bid: {
            _id: bid._id,
            amount: bid.amount,
            bidderName: bid.bidderName,
            bidderId: socket.user._id,
            createdAt: bid.createdAt
          }
        };

        // Broadcast to ALL users in the auction room
        io.to(auctionId).emit('highestBidUpdate', bidData);

        // Confirm to the bidder
        socket.emit('bidSuccess', {
          message: `Bid of $${Number(amount).toLocaleString()} placed successfully!`,
          ...bidData
        });

        console.log(`💰 Bid: $${amount} by ${socket.user.name} on auction ${auctionId}`);

      } catch (error) {
        console.error('Bid error:', error);
        socket.emit('bidError', { message: 'Failed to place bid. Please try again.' });
      }
    });

    // ─── AUCTION ENDED CHECK ──────────────────────────────────────
    socket.on('checkAuctionEnd', async (auctionId) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return;

        if (auction.status === 'active' && new Date() > new Date(auction.endTime)) {
          auction.status = 'ended';
          if (auction.highestBidder) {
            auction.winner = auction.highestBidder;
            await User.findByIdAndUpdate(auction.highestBidder, { $inc: { totalWins: 1 } });
          }
          await auction.save();

          io.to(auctionId).emit('auctionEnded', {
            auctionId,
            winner: auction.highestBidderName || 'No winner',
            finalBid: auction.currentBid,
            message: auction.highestBidderName
              ? `Auction ended! 🎉 Winner: ${auction.highestBidderName} with $${auction.currentBid.toLocaleString()}`
              : 'Auction ended with no bids'
          });
        }
      } catch (error) {
        console.error('Check auction end error:', error);
      }
    });

    // ─── TYPING / ACTIVITY INDICATOR ─────────────────────────────
    socket.on('userTyping', ({ auctionId }) => {
      socket.to(auctionId).emit('userActivity', {
        user: socket.user?.name || 'Someone',
        action: 'is typing a bid...'
      });
    });

    // ─── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
