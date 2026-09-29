-- STEP 1 of 3 - run in MySQL Workbench while connected as root.
-- Creates the database and the user the server connects with.
-- These values must match DB_NAME / DB_USER / DB_PASSWORD in server/.env.
-- For local testing only: do not reuse this password anywhere real.

CREATE DATABASE IF NOT EXISTS app_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'app_password';

GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';

FLUSH PRIVILEGES;
