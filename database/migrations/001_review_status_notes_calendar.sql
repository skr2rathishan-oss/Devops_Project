-- Brings a database created from an older init.sql up to date.
-- New databases get all of this from init.sql; this is only for existing ones.
-- Safe to run more than once. Run after init.sql, e.g.:
--   mysql -u app_user -p app_db < database/migrations/001_review_status_notes_calendar.sql

USE app_db;

SET NAMES utf8mb4;

-- Adds the "review" task status (existing rows keep their status).
ALTER TABLE tasks
  MODIFY status ENUM('pending', 'in_progress', 'review', 'completed') NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS notes (
  user_id INT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_calendar_events_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  INDEX idx_calendar_events_user_date (user_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
