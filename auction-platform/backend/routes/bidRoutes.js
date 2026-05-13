const express = require('express');
const router = express.Router();
const { placeBid, getAuctionBids, getUserBidHistory } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:auctionId', protect, placeBid);
router.get('/user/history', protect, getUserBidHistory);
router.get('/:auctionId', getAuctionBids);

module.exports = router;
