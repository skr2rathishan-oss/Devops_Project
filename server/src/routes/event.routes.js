const express = require("express");
const { getMyEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/event.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getMyEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
