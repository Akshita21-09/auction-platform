const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Fashion', 'Art', 'Collectibles', 'Vehicles', 'Real Estate', 'Jewelry', 'Sports', 'Books', 'Other']
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [1, 'Starting price must be at least $1']
  },
  currentBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  highestBidderName: {
    type: String,
    default: null
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active'
  },
  totalBids: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: check if auction is expired
auctionSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.endTime);
});

// Virtual: time remaining in ms
auctionSchema.virtual('timeRemaining').get(function () {
  const remaining = new Date(this.endTime) - new Date();
  return remaining > 0 ? remaining : 0;
});

// Index for faster queries
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
