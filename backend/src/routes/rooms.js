const express = require('express');
const { protect } = require('../middleware/auth');
const { getRooms, createRoom, getRoom, getMessages } = require('../controllers/roomController');

const router = express.Router();

router.use(protect);

router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoom);
router.get('/:id/messages', getMessages);

module.exports = router;
