const express = require("express");
const router = express.Router();

const {
  getHistory,
  getHistoryById,
  deleteHistory,
  clearHistory,
} = require("../controllers/historyController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getHistory);
router.get("/:id", getHistoryById);
router.delete("/", clearHistory);
router.delete("/:id", deleteHistory);

module.exports = router;