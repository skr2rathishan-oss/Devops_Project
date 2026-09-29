-- STEP 2 of 3 - schema for login and register.
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
