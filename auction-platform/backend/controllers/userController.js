const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const [activeListings, totalListings, totalBids] = await Promise.all([
    Auction.countDocuments({ seller: user._id, status: 'active' }),
    Auction.countDocuments({ seller: user._id }),
    Bid.countDocuments({ bidder: user._id })
  ]);

  res.json({
    success: true,
    user,
    stats: { activeListings, totalListings, totalBids }
  });
};

// @desc    Get all users (admin only in real app)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt').limit(50);
  res.json({ success: true, users });
};

module.exports = { getUserProfile, getUsers };
