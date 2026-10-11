const express = require("express");
const { getTeams, createTeam } = require("../controllers/team.controller");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getTeams);
router.post("/", authorize("admin"), createTeam);

module.exports = router;
