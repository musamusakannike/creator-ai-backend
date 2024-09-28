const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getTitlesController,
  getWritingsController,
  getSeosController,
  saveContentController,
  deleteContentController,
} = require("../controllers/savesController");

const router = express.Router();

router.get("/titles", authMiddleware, getTitlesController);

router.get("/writing", authMiddleware, getWritingsController);

router.get("/seo", authMiddleware, getSeosController);

router.post("/:type", authMiddleware, saveContentController);

// DELETE ITEMS
router.delete("/:type/:id", authMiddleware, deleteContentController);

module.exports = router;
