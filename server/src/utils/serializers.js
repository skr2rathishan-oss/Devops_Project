// The shape the client stores as `User` — never includes the password hash.
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    teamId: user.team_id,
  };
}

function toTeam(team) {
  return { id: team.id, name: team.name };
}

// The shape the client uses as `Task`.
function toTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assignedTo: task.assigned_to,
    assignedToName: task.assigned_to_name ?? undefined,
    assignedTeamId: task.assigned_team_id ?? null,
    createdBy: task.created_by,
    dueDate: task.due_date, // already 'YYYY-MM-DD' (DATE_FORMAT) or null
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

function toNote(note) {
  return { content: note.content ?? "", updatedAt: note.updated_at };
}

// The shape the client uses as `CalendarEvent`.
function toCalendarEvent(event) {
  return {
    id: event.id,
    title: event.title,
    date: event.event_date, // already 'YYYY-MM-DD' (DATE_FORMAT)
    time: event.event_time ?? "", // 'HH:MM' (TIME_FORMAT) or '' for all-day
    notes: event.notes ?? "",
  };
}

module.exports = { toPublicUser, toTeam, toTask, toNote, toCalendarEvent };
