
const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getCrops,
  createCrop,
  getCropById,
  updateCrop,
  deleteCrop,
  detectCrop
} = require("../controllers/cropController");

const { protect } = require("../middleware/authMiddleware");

// Store uploaded images in memory temporarily
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// All crop routes require login
router.use(protect);

// AI detection route - keep before /:id
router.post(
  "/detect",
  upload.single("image"),
  detectCrop
);

// Normal crop CRUD routes
router.get("/", getCrops);

router.post("/", createCrop);

router.get("/:id", getCropById);

router.put("/:id", updateCrop);

router.delete("/:id", deleteCrop);

module.exports = router;
