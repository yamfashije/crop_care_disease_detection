const db = require("../db");

const getHistory = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to fetch history." });
  }
};

const getHistoryById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM history WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "History record not found." });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch history record." });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM history WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "History record not found." });
    }

    res.json({ success: true, message: "History record deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete history." });
  }
};

const clearHistory = async (req, res) => {
  try {
    await db.execute("DELETE FROM history WHERE user_id = ?", [req.user.id]);

    res.json({ success: true, message: "History cleared successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear history." });
  }
};

module.exports = { getHistory, getHistoryById, deleteHistory, clearHistory };