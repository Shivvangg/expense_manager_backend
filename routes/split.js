const express = require('express');
const router = express.Router();
const splitController = require('../controllers/split');

router.post('/splits', splitController.addSplit);
router.get('/splits/:userId', splitController.getSplits);
router.delete('/splits/:splitId', splitController.deleteSplit);

module.exports = router;
