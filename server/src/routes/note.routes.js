const express = require("express");
const { getMyNote, saveMyNote } = require("../controllers/note.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/me", getMyNote);
router.put("/me", saveMyNote);

module.exports = router;
