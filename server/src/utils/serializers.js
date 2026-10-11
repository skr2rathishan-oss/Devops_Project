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

module.exports = { toPublicUser, toTeam };
