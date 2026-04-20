const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getDashboard } = require("../controllers/userController");

const router = express.Router();

router.get("/dashboard", requireAuth, getDashboard);

module.exports = router;

