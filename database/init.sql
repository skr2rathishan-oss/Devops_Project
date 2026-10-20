-- STEP 2 of 3 - schema for the app (teams, users, tasks, notes, calendar_events).
-- Run after setup_local.sql, in MySQL Workbench or with:
--   mysql -u app_user -p app_db < database/init.sql

USE app_db;

SET NAMES utf8mb4;

-- Teams must exist before users, since users.team_id references them.
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- "Full Name" on the register page
  name VARCHAR(100) NOT NULL,
  -- "User ID" on the register page; login accepts this or the email
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  -- bcrypt hash, never the plain password
  password VARCHAR(255) NOT NULL,
  -- Matches the client's Role type. Register only offers team_member and
  -- team_leader; admins are created by another admin or seeded directly.
  role ENUM('admin', 'team_leader', 'team_member') NOT NULL DEFAULT 'team_member',
  team_id INT NULL,
  -- Password reset (forgot-password flow)
  reset_token_hash VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_team
    FOREIGN KEY (team_id) REFERENCES teams (id)
    ON DELETE SET NULL,
  INDEX idx_users_reset_token_hash (reset_token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks reference users twice: who it's assigned to, and who created it.
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  -- Match the client's TaskStatus / TaskPriority types
  status ENUM('pending', 'in_progress', 'review', 'completed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  -- NULL = unassigned; deleting the assignee un-assigns the task instead of losing it
  assigned_to INT NULL,
  -- RESTRICT: a user who created tasks can't be deleted until those tasks are removed or reassigned
  created_by INT NOT NULL,
  due_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_tasks_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT,
  INDEX idx_tasks_assigned_to (assigned_to),
  INDEX idx_tasks_created_by (created_by),
  INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard "Quick Notes": one note per user.
CREATE TABLE IF NOT EXISTS notes (
  user_id INT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal calendar events. Task deadlines on the calendar come from tasks.due_date.
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  -- NULL = all-day event
  event_time TIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_calendar_events_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  INDEX idx_calendar_events_user_date (user_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
