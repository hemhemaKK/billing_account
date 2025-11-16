const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const {
  createYear,
  getYears,
  getYearById,
  updateYear,
  deleteYear
} = require("../controllers/yearController");

// CREATE YEAR
router.post("/", auth, createYear);

// GET ALL YEARS
router.get("/", auth, getYears);

// GET SINGLE YEAR
router.get("/:yearId", auth, getYearById);

// UPDATE YEAR
router.put("/:yearId", auth, updateYear);

// DELETE YEAR
router.delete("/:yearId", auth, deleteYear);

module.exports = router;
