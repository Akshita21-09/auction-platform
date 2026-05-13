const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { cloudinary } = require('../config/cloudinary');
const { validationResult } = require('express-validator');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = async (req, res) => {
  const { category, status = 'active', search, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  const query = {};
  if (category && category !== 'All') query.category = category;
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  const [auctions, total] = await Promise.all([
    Auction.find(query)
      .populate('seller', 'name avatar')
      .populate('highestBidder', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Auction.countDocuments(query)
  ]);

  res.json({
    success: true,
    auctions,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit)
    }
  });
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
const getAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('seller', 'name avatar email createdAt')
    .populate('highestBidder', 'name')
    .populate('winner', 'name email');

  if (!auction) {
    return res.status(404).json({ success: false, message: 'Auction not found' });
  }

  // Auto-end auction if expired
  if (auction.status === 'active' && new Date() > new Date(auction.endTime)) {
    auction.status = 'ended';
    if (auction.highestBidder) {
      auction.winner = auction.highestBidder;
    }
    await auction.save();
  }

  const recentBids = await Bid.find({ auction: req.params.id })
    .populate('bidder', 'name')
    .sort('-createdAt')
    .limit(10);

  res.json({ success: true, auction, recentBids });
};

// @desc    Create auction
// @route   POST /api/auctions
// @access  Private
const createAuction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { title, description, category, startingPrice, endTime } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Auction image is required' });
  }

  const endDateTime = new Date(endTime);
  if (endDateTime <= new Date()) {
    return res.status(400).json({ success: false, message: 'End time must be in the future' });
  }

  const auction = await Auction.create({
    title,
    description,
    category,
    startingPrice: Number(startingPrice),
    currentBid: Number(startingPrice),
    endTime: endDateTime,
    image: req.file.path,
    imagePublicId: req.file.filename,
    seller: req.user._id
  });

  await auction.populate('seller', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Auction created successfully',
    auction
  });
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private
const updateAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ success: false, message: 'Auction not found' });
  }

  if (auction.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this auction' });
  }

  if (auction.totalBids > 0) {
    return res.status(400).json({ success: false, message: 'Cannot edit auction with existing bids' });
  }

  const { title, description, category } = req.body;
  auction.title = title || auction.title;
  auction.description = description || auction.description;
  auction.category = category || auction.category;

  await auction.save();

  res.json({ success: true, message: 'Auction updated', auction });
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private
const deleteAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ success: false, message: 'Auction not found' });
  }

  if (auction.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (auction.totalBids > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete auction with existing bids' });
  }

  // Delete image from Cloudinary
  if (auction.imagePublicId) {
    await cloudinary.uploader.destroy(auction.imagePublicId);
  }

  await Auction.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Auction deleted successfully' });
};

// @desc    Get user's auctions (seller)
// @route   GET /api/auctions/my/listings
// @access  Private
const getMyAuctions = async (req, res) => {
  const auctions = await Auction.find({ seller: req.user._id })
    .sort('-createdAt');

  res.json({ success: true, auctions });
};

// @desc    Get auctions user has won
// @route   GET /api/auctions/my/wins
// @access  Private
const getMyWins = async (req, res) => {
  const auctions = await Auction.find({
    winner: req.user._id,
    status: 'ended'
  }).populate('seller', 'name email').sort('-updatedAt');

  res.json({ success: true, auctions });
};

// @desc    Get dashboard stats
// @route   GET /api/auctions/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  const userId = req.user._id;

  const [
    activeAuctions,
    myListings,
    myWins,
    totalBidsPlaced,
    recentActivity
  ] = await Promise.all([
    Auction.countDocuments({ status: 'active' }),
    Auction.countDocuments({ seller: userId }),
    Auction.countDocuments({ winner: userId }),
    Bid.countDocuments({ bidder: userId }),
    Bid.find({ bidder: userId })
      .populate({ path: 'auction', select: 'title image currentBid status' })
      .sort('-createdAt')
      .limit(5)
  ]);

  // Bid activity over last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const bidActivity = await Bid.aggregate([
    { $match: { bidder: userId, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    stats: {
      activeAuctions,
      myListings,
      myWins,
      totalBidsPlaced,
      recentActivity,
      bidActivity
    }
  });
};

module.exports = {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
  getMyWins,
  getDashboardStats
};
