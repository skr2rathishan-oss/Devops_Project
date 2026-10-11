const express = require("express");
const {
  getTasks,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", authorize("admin", "team_leader"), getTasks);
// Declared before the /:id routes so "mine" is never read as an id.
router.get("/mine", getMyTasks);
router.post("/", authorize("admin", "team_leader"), createTask);
// Members may update status only; the controller enforces per-role rules.
router.put("/:id", updateTask);
router.delete("/:id", authorize("admin", "team_leader"), deleteTask);

module.exports = router;
