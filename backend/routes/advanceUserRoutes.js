const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/advanceUserController");

// CREATE USER UNDER CITY
router.post("/:cityId", auth, createUser);

// GET USERS UNDER CITY
router.get("/:cityId", auth, getUsers);

// GET SINGLE USER
router.get("/single/:userId", auth, getUserById);

// UPDATE USER
router.put("/:userId", auth, updateUser);

// DELETE USER
router.delete("/:userId", auth, deleteUser);

module.exports = router;
