const AppError = require("../utils/AppError");
const teamModel = require("../models/team.model");
const { toTeam } = require("../utils/serializers");

const MAX_TEAM_NAME_LENGTH = 100;

async function getTeams(req, res, next) {
  try {
    const teams = await teamModel.findAll();
    res.status(200).json(teams.map(toTeam));
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const body = req.body || {};
    // A non-string name is treated the same as a missing one.
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      throw new AppError("Team name is required", 400);
    }
    if (name.length > MAX_TEAM_NAME_LENGTH) {
      throw new AppError(`Team name must be at most ${MAX_TEAM_NAME_LENGTH} characters`, 400);
    }
    if (await teamModel.findByName(name)) {
      throw new AppError("A team with this name already exists", 409);
    }

    let team;
    try {
      team = await teamModel.create(name);
    } catch (err) {
      // Two requests racing past the check above hit the UNIQUE constraint.
      if (err.code === "ER_DUP_ENTRY") {
        throw new AppError("A team with this name already exists", 409);
      }
      throw err;
    }

    res.status(201).json(toTeam(team));
  } catch (err) {
    next(err);
  }
}

module.exports = { getTeams, createTeam };
