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
    createdBy: task.created_by,
    dueDate: task.due_date, // already 'YYYY-MM-DD' (DATE_FORMAT) or null
    createdAt: task.created_at,
  };
}

module.exports = { toPublicUser, toTeam, toTask };
