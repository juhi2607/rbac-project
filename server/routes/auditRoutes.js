const express = require('express');
const router = express.Router();

const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', authorize('Admin'), getAuditLogs);

module.exports = router;
