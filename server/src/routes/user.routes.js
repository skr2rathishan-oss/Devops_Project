const express = require("express");
const { getUsers, createUser } = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", authorize("admin", "team_leader"), getUsers);
router.post("/", authorize("admin"), createUser);

module.exports = router;
