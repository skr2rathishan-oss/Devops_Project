const AppError = require("../utils/AppError");
const noteModel = require("../models/note.model");
const { toNote } = require("../utils/serializers");

// Well under the TEXT column's limit, matching task descriptions.
const MAX_NOTE_LENGTH = 5000;

// Users only ever see their own note; a user who never saved one gets an empty note.
async function getMyNote(req, res, next) {
  try {
    const note = await noteModel.findByUserId(req.user.id);
    res.status(200).json(note ? toNote(note) : { content: "", updatedAt: null });
  } catch (err) {
    next(err);
  }
}

async function saveMyNote(req, res, next) {
  try {
    const content = req.body?.content;
    if (typeof content !== "string") {
      throw new AppError("content must be text", 400);
    }
    if (content.length > MAX_NOTE_LENGTH) {
      throw new AppError(`Note must be at most ${MAX_NOTE_LENGTH} characters`, 400);
    }

    const note = await noteModel.upsert(req.user.id, content);
    res.status(200).json(toNote(note));
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyNote, saveMyNote };
