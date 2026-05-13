const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
  getMyWins,
  getDashboardStats
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const auctionValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('startingPrice').isNumeric().isFloat({ min: 1 }).withMessage('Starting price must be at least $1'),
  body('endTime').isISO8601().withMessage('Valid end time is required')
];

// Public routes
router.get('/', getAuctions);
router.get('/my/listings', protect, getMyAuctions);
router.get('/my/wins', protect, getMyWins);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/:id', getAuction);

// Protected routes
router.post('/', protect, upload.single('image'), auctionValidation, createAuction);
router.put('/:id', protect, updateAuction);
router.delete('/:id', protect, deleteAuction);

module.exports = router;
