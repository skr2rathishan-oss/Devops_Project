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

-- Sample tasks so the dashboard isn't empty. Users are looked up by username since their ids aren't fixed.
SET @admin_id  = (SELECT id FROM users WHERE username = 'admin');
SET @leader_id = (SELECT id FROM users WHERE username = 'leader');
SET @member_id = (SELECT id FROM users WHERE username = 'member');

INSERT IGNORE INTO tasks (id, title, description, status, priority, assigned_to, created_by, due_date) VALUES
  (1, 'Set up project repository', 'Create the repo and add the initial README.',    'completed',   'high',   @member_id, @leader_id, CURRENT_DATE - INTERVAL 3 DAY),
  (2, 'Build the login page',      'Login with email or User ID.',                   'in_progress', 'medium', @member_id, @leader_id, CURRENT_DATE + INTERVAL 5 DAY),
  (3, 'Write API documentation',   'Document the tasks, teams and users endpoints.', 'pending',     'low',    NULL,       @admin_id,  NULL),
  (4, 'Review team workload',      'Check open tasks for the Development team.',     'pending',     'high',   @leader_id, @admin_id,  CURRENT_DATE + INTERVAL 10 DAY);

SELECT id, name, username, email, role, team_id FROM users;
SELECT id, title, status, assigned_to, created_by, due_date FROM tasks;
