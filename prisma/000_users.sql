-- User table: id is TEXT 
CREATE TABLE IF NOT EXISTS "User" (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  "passwordHash" TEXT       NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);