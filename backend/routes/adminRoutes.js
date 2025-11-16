const router = require("express").Router();
const { loginAdmin, createInitialAdmin } = require("../controllers/adminController");

router.post("/login", loginAdmin);
router.post("/create-initial", createInitialAdmin); // Run only once manually

module.exports = router;
