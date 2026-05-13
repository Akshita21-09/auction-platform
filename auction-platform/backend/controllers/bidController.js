const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Place a bid (REST fallback - primary via Socket.IO)
// @route   POST /api/bids/:auctionId
// @access  Private
const placeBid = async (req, res) => {
  const { amount } = req.body;
  const { auctionId } = req.params;

  const auction = await Auction.findById(auctionId);

  if (!auction) {
    return res.status(404).json({ success: false, message: 'Auction not found' });
  }

  if (auction.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Auction is not active' });
  }

  if (new Date() > new Date(auction.endTime)) {
    auction.status = 'ended';
    await auction.save();
    return res.status(400).json({ success: false, message: 'Auction has ended' });
  }

  if (auction.seller.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Sellers cannot bid on their own auctions' });
  }

  const minBid = auction.currentBid + 1;
  if (Number(amount) < minBid) {
    return res.status(400).json({
      success: false,
      message: `Bid must be at least $${minBid}`
    });
  }

  const bid = await Bid.create({
    auction: auctionId,
    bidder: req.user._id,
    bidderName: req.user.name,
    amount: Number(amount)
  });

  auction.currentBid = Number(amount);
  auction.highestBidder = req.user._id;
  auction.highestBidderName = req.user.name;
  auction.totalBids += 1;
  await auction.save();

  await User.findByIdAndUpdate(req.user._id, { $inc: { totalBids: 1 } });

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(auctionId).emit('highestBidUpdate', {
      auctionId,
      currentBid: auction.currentBid,
      highestBidder: req.user.name,
      totalBids: auction.totalBids,
      bid: {
        _id: bid._id,
        amount: bid.amount,
        bidderName: bid.bidderName,
        createdAt: bid.createdAt
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Bid placed successfully',
    bid,
    auction: {
      currentBid: auction.currentBid,
      totalBids: auction.totalBids
    }
  });
};

// @desc    Get bids for an auction
// @route   GET /api/bids/:auctionId
// @access  Public
const getAuctionBids = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [bids, total] = await Promise.all([
    Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Bid.countDocuments({ auction: req.params.auctionId })
  ]);

  res.json({
    success: true,
    bids,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
  });
};

// @desc    Get user's bid history
// @route   GET /api/bids/user/history
// @access  Private
const getUserBidHistory = async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .populate({ path: 'auction', select: 'title image currentBid status endTime' })
    .sort('-createdAt')
    .limit(50);

  res.json({ success: true, bids });
};

module.exports = { placeBid, getAuctionBids, getUserBidHistory };
