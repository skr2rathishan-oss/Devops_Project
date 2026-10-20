const AppError = require("../utils/AppError");
const taskModel = require("../models/task.model");
const userModel = require("../models/user.model");
const { toTask } = require("../utils/serializers");
const { parseId, parseOptionalId, parseOptionalDate } = require("../utils/validators");

// Match the ENUMs in database/init.sql and the client's TaskStatus / TaskPriority types.
const TASK_STATUSES = ["pending", "in_progress", "review", "completed"];
const TASK_PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 200;
// Well under the TEXT column's 65,535-byte limit even with 4-byte utf8mb4 characters.
const MAX_DESCRIPTION_LENGTH = 5000;
const STATUS_MESSAGE = "Status must be pending, in_progress, review or completed";

const CREATE_DEFAULTS = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  assignedTo: null,
  dueDate: null,
};

// Applies the fields present in the body on top of `current`, then validates the result.
function readTaskFields(body, current) {
  const fields = { ...current };
  if (body.title !== undefined) fields.title = typeof body.title === "string" ? body.title.trim() : "";
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      throw new AppError("Description must be text", 400);
    }
    fields.description = (body.description ?? "").trim();
  }
  if (body.status !== undefined) fields.status = body.status;
  if (body.priority !== undefined) fields.priority = body.priority;
  if (body.assignedTo !== undefined) fields.assignedTo = parseOptionalId(body.assignedTo, "assignedTo");
  if (body.dueDate !== undefined) fields.dueDate = parseOptionalDate(body.dueDate, "Due date");

  if (!fields.title) throw new AppError("Title is required", 400);
  if (fields.title.length > MAX_TITLE_LENGTH) {
    throw new AppError(`Title must be at most ${MAX_TITLE_LENGTH} characters`, 400);
  }
  if (fields.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new AppError(`Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`, 400);
  }
  if (!TASK_STATUSES.includes(fields.status)) throw new AppError(STATUS_MESSAGE, 400);
  if (!TASK_PRIORITIES.includes(fields.priority)) {
    throw new AppError("Priority must be low, medium or high", 400);
  }
  return fields;
}

function fieldsFromTask(task) {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assignedTo: task.assigned_to,
    dueDate: task.due_date,
  };
}

// Admins manage everything; leaders manage tasks they created/are assigned, or that belong to their team.
// Keep in sync with taskModel.findForLeader.
function canManageTask(user, task) {
  if (user.role === "admin") return true;
  if (user.role !== "team_leader") return false;
  if (task.created_by === user.id || task.assigned_to === user.id) return true;
  return user.team_id != null && (task.assigned_team_id === user.team_id || task.creator_team_id === user.team_id);
}

// Leaders may assign to themselves or anyone on their own team; admins to anyone.
async function assertCanAssign(user, assigneeId) {
  if (assigneeId === null) return;
  const assignee = await userModel.findById(assigneeId);
  if (!assignee) throw new AppError("Assigned user does not exist", 400);
  if (user.role === "team_leader") {
    const sameTeam = user.team_id != null && assignee.team_id === user.team_id;
    if (assignee.id !== user.id && !sameTeam) {
      throw new AppError("You can only assign tasks to members of your team", 403);
    }
  }
}

// The assignee can be deleted between assertCanAssign and the write.
function rethrowMissingAssignee(err) {
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    throw new AppError("Assigned user does not exist", 400);
  }
  throw err;
}

async function getTasks(req, res, next) {
  try {
    const tasks =
      req.user.role === "admin"
        ? await taskModel.findAll()
        : await taskModel.findForLeader(req.user.id, req.user.team_id);
    res.status(200).json(tasks.map(toTask));
  } catch (err) {
    next(err);
  }
}

async function getMyTasks(req, res, next) {
  try {
    const tasks = await taskModel.findAssignedTo(req.user.id);
    res.status(200).json(tasks.map(toTask));
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const body = req.body || {};
    const fields = readTaskFields(body, CREATE_DEFAULTS);
    await assertCanAssign(req.user, fields.assignedTo);

    let task;
    try {
      task = await taskModel.create({ ...fields, createdBy: req.user.id });
    } catch (err) {
      rethrowMissingAssignee(err);
    }

    res.status(201).json(toTask(task));
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const body = req.body || {};
    const id = parseId(req.params.id, "task id");
    const task = await taskModel.findById(id);
    if (!task) throw new AppError("Task not found", 404);

    if (req.user.role === "team_member") {
      if (task.assigned_to !== req.user.id) {
        throw new AppError("You can only update tasks assigned to you", 403);
      }
      if (Object.keys(body).some((key) => key !== "status")) {
        throw new AppError("Team members can only change the status of their tasks", 403);
      }
      if (body.status === undefined) throw new AppError("status is required", 400);
      if (!TASK_STATUSES.includes(body.status)) throw new AppError(STATUS_MESSAGE, 400);

      const updated = await taskModel.updateStatus(id, body.status);
      // A concurrent delete can remove the task between the check above and the re-read.
      if (!updated) throw new AppError("Task not found", 404);
      return res.status(200).json(toTask(updated));
    }

    if (!canManageTask(req.user, task)) {
      throw new AppError("You can only manage tasks for your team", 403);
    }
    const fields = readTaskFields(body, fieldsFromTask(task));
    if (fields.assignedTo !== task.assigned_to) {
      await assertCanAssign(req.user, fields.assignedTo);
    }

    let updated;
    try {
      updated = await taskModel.update(id, fields);
    } catch (err) {
      rethrowMissingAssignee(err);
    }
    if (!updated) throw new AppError("Task not found", 404);

    res.status(200).json(toTask(updated));
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = parseId(req.params.id, "task id");
    const task = await taskModel.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    if (!canManageTask(req.user, task)) {
      throw new AppError("You can only manage tasks for your team", 403);
    }

    await taskModel.remove(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getMyTasks, createTask, updateTask, deleteTask };
