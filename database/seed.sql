-- STEP 3 of 3 (optional) - test data for local testing.
-- Every test account's password is:  Test@1234
-- Safe to run more than once: existing rows are left as they are.

USE app_db;

INSERT IGNORE INTO teams (id, name) VALUES
  (1, 'Development'),
  (2, 'Design');

-- Password hash below is bcrypt (10 rounds) of "Test@1234".
-- The admin can only be created here, since the register page doesn't offer that role.
INSERT IGNORE INTO users (name, username, email, password, role, team_id) VALUES
  ('Admin User',  'admin',  'admin@test.com',  '$2b$10$wtYfjNxHJGJl3i4v3bIHReTp/NmGeaTROhQu4C12UwA3Euy/01aEa', 'admin',       NULL),
  ('Leader User', 'leader', 'leader@test.com', '$2b$10$wtYfjNxHJGJl3i4v3bIHReTp/NmGeaTROhQu4C12UwA3Euy/01aEa', 'team_leader', 1),
  ('Member User', 'member', 'member@test.com', '$2b$10$wtYfjNxHJGJl3i4v3bIHReTp/NmGeaTROhQu4C12UwA3Euy/01aEa', 'team_member', 1);

SELECT id, name, username, email, role, team_id FROM users;
