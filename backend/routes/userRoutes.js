const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

// CREATE USER UNDER YEAR
router.post("/:yearId", auth, createUser);

// GET USERS UNDER YEAR
router.get("/:yearId", auth, getUsers);

// GET SINGLE USER
router.get("/single/:userId", auth, getUserById);

// UPDATE USER
router.put("/:userId", auth, updateUser);

// DELETE USER
router.delete("/:userId", auth, deleteUser);

module.exports = router;
