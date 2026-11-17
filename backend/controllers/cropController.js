
const db = require("../db");

// GET ALL CROPS
exports.getCrops = async (req, res) => {
  try {
    const [crops] = await db.execute(
      "SELECT * FROM crops WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json({
      success: true,
      crops
    });
  } catch (error) {
    console.error("Get crops error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get crops."
    });
  }
};

// CREATE CROP
exports.createCrop = async (req, res) => {
  try {
    const {
      name,
      type,
      variety,
      description,
      scientificName,
      plantingDate,
      harvestDate,
      location,
      image,
      status,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO crops
      (user_id, name, type, variety, description,
       scientificName, plantingDate, harvestDate,
       location, image, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name.trim(),
        type || "Other",
        variety || null,
        description || null,
        scientificName || null,
        plantingDate || null,
        harvestDate || null,
        location || null,
        image || null,
        status || "Unknown",
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Crop created successfully.",
      cropId: result.insertId
    });
  } catch (error) {
    console.error("Create crop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create crop."
    });
  }
};

// GET ONE CROP
exports.getCropById = async (req, res) => {
  try {
    const [crops] = await db.execute(
      "SELECT * FROM crops WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found."
      });
    }

    res.json({
      success: true,
      crop: crops[0]
    });
  } catch (error) {
    console.error("Get crop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get crop."
    });
  }
};

// UPDATE CROP
exports.updateCrop = async (req, res) => {
  try {
    const {
      name,
      type,
      variety,
      description,
      scientificName,
      plantingDate,
      harvestDate,
      location,
      image,
      status,
      notes
    } = req.body;

    const [result] = await db.execute(
      `UPDATE crops SET
       name = ?, type = ?, variety = ?, description = ?,
       scientificName = ?, plantingDate = ?, harvestDate = ?,
       location = ?, image = ?, status = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        type || "Other",
        variety || null,
        description || null,
        scientificName || null,
        plantingDate || null,
        harvestDate || null,
        location || null,
        image || null,
        status || "Unknown",
        notes || null,
        req.params.id,
        req.user.id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Crop not found."
      });
    }

    res.json({
      success: true,
      message: "Crop updated successfully."
    });
  } catch (error) {
    console.error("Update crop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update crop."
    });
  }
};

// DELETE CROP
exports.deleteCrop = async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM crops WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Crop not found."
      });
    }

    res.json({
      success: true,
      message: "Crop deleted successfully."
    });
  } catch (error) {
    console.error("Delete crop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete crop."
    });
  }
};

// AI CROP DISEASE DETECTION
exports.detectCrop = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a crop image."
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG and WEBP images are allowed."
      });
    }

    // Send image to Python AI service
    const formData = new FormData();

    const imageBlob = new Blob(
      [req.file.buffer],
      { type: req.file.mimetype }
    );

    formData.append(
      "file",
      imageBlob,
      req.file.originalname
    );

    const aiResponse = await fetch(
      process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000)
      }
    );

    const aiResult = await aiResponse.json();

    if (!aiResponse.ok || !aiResult.success) {
      return res.status(aiResponse.status || 502).json({
        success: false,
        message: aiResult.detail || aiResult.message || "AI prediction failed."
      });
    }

    const {
      crop_name,
      disease,
      confidence,
      recommendation
    } = aiResult;

    // Save AI result in MySQL history
    const [historyResult] = await db.execute(
      `INSERT INTO history
      (user_id, crop_id, crop_name, disease,
       confidence, recommendation, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        null,
        crop_name,
        disease,
        confidence,
        recommendation,
        null
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Crop disease detection completed.",
      result: {
        id: historyResult.insertId,
        crop_name,
        disease,
        confidence,
        recommendation
      }
    });

  } catch (error) {
    console.error("AI detection error:", error);

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message: "AI service took too long to respond."
      });
    }

    if (error.cause || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "Python AI service is not running. Start AI service on port 8000."
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during disease detection."
    });
  }
};
