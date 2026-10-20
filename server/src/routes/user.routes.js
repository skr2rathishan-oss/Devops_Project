const express = require("express");
const { getUsers, createUser, updateUser } = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", authorize("admin", "team_leader"), getUsers);
router.post("/", authorize("admin"), createUser);
router.put("/:id", authorize("admin"), updateUser);

module.exports = router;
