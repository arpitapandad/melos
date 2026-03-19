-- ============================================================
-- Melos — PostgreSQL Schema
-- Run: psql -U postgres -f schema.sql
-- ============================================================

-- Create database (run separately if needed)
-- CREATE DATABASE melos_db;
-- \c melos_db;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  username      VARCHAR(50)  UNIQUE,
  password_hash VARCHAR(255),
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login    TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);

-- ── Rooms ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  theme       VARCHAR(50)  DEFAULT 'melos',
  theme_color VARCHAR(20),
  owner_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Room Members ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_members (
  room_id   INTEGER REFERENCES rooms(id)  ON DELETE CASCADE,
  user_id   INTEGER REFERENCES users(id)  ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);
