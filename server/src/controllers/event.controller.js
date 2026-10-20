const AppError = require("../utils/AppError");
const eventModel = require("../models/event.model");
const { toCalendarEvent } = require("../utils/serializers");
const { parseId, parseOptionalDate } = require("../utils/validators");

const MAX_TITLE_LENGTH = 200;
const MAX_NOTES_LENGTH = 2000;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// Calendar events are personal: every route is limited to the signed-in user's own events.
function readEventFields(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const time = typeof body?.time === "string" ? body.time : "";
  const date = parseOptionalDate(body?.date, "Date");

  if (!title) throw new AppError("Event title is required", 400);
  if (title.length > MAX_TITLE_LENGTH) {
    throw new AppError(`Event title must be at most ${MAX_TITLE_LENGTH} characters`, 400);
  }
  if (!date) throw new AppError("Date is required", 400);
  if (time && !TIME_PATTERN.test(time)) throw new AppError("Time must be HH:MM", 400);
  if (notes.length > MAX_NOTES_LENGTH) {
    throw new AppError(`Notes must be at most ${MAX_NOTES_LENGTH} characters`, 400);
  }
  return { title, date, time: time || null, notes };
}

async function findOwnEvent(req) {
  const id = parseId(req.params.id, "event id");
  const event = await eventModel.findById(id);
  // 404 rather than 403 so other users' event ids aren't revealed.
  if (!event || event.user_id !== req.user.id) throw new AppError("Event not found", 404);
  return event;
}

async function getMyEvents(req, res, next) {
  try {
    const events = await eventModel.findByUserId(req.user.id);
    res.status(200).json(events.map(toCalendarEvent));
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const fields = readEventFields(req.body);
    const event = await eventModel.create({ ...fields, userId: req.user.id });
    res.status(201).json(toCalendarEvent(event));
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await findOwnEvent(req);
    const fields = readEventFields(req.body);
    const updated = await eventModel.update(event.id, fields);
    if (!updated) throw new AppError("Event not found", 404);
    res.status(200).json(toCalendarEvent(updated));
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const event = await findOwnEvent(req);
    await eventModel.remove(event.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyEvents, createEvent, updateEvent, deleteEvent };
