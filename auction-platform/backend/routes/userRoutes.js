const express = require('express');
const router = express.Router();
const { getUserProfile, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.get('/:id', getUserProfile);

module.exports = router;
