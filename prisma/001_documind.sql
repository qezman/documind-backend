-- Enable once per database:
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  filename    TEXT        NOT NULL,
  s3_key      TEXT        NOT NULL,
  mime_type   TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'processing',
  chunk_count INT,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id            UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID   NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content       TEXT   NOT NULL,
  chunk_index   INT    NOT NULL,
  token_count   INT,
  embedding     vector(3072) NOT NULL
);

-- Create HNSW index
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  chunks_used JSONB,   -- stores { sourceNumber, chunkIndex, similarity, excerpt }[]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks (document_id);
CREATE INDEX IF NOT EXISTS chats_document_id_idx ON chats (document_id);
