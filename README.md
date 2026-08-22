# DocuMind Backend

Fastify API for DocuMind - auth, document upload, and the RAG chat endpoint.
Part of the [DocuMind platform](https://github.com/qezman/DocuMind-Infrastructure);
see that repo's README for the full system overview and architecture.

## Stack

Fastify + TypeScript on Node 22, PostgreSQL with `pgvector`, S3 for file
storage, Gemini for embeddings and chat completions.

## What's here

- **modules/** - `auth` (JWT login/register), `documents` (upload metadata,
  status), `chunks` (chunking + embeddings), `chats` (RAG question
  answering), `uploads` (S3 presigned URLs)
- **lib/** - `gemini.ts` (embeddings + chat completion calls),
  `s3.ts` (presigned URL generation)
- **plugins/** - Fastify plugins for CORS, JWT, and an `authenticate`
  decorator used across protected routes
- **utils/** - `chunker.ts` (splits documents into overlapping token
  chunks), `extractor.ts` (PDF/DOCX text extraction)
- **prisma/** - plain SQL migrations (`000_users.sql`, `001_documind.sql`),
  run by hand with `pnpm migrate`; not wired into CI yet

## How a document gets answered

Upload → text extracted → split into chunks → each chunk embedded via
Gemini and stored in `pgvector` → a question embeds the same way, finds the
nearest chunks by cosine similarity, and Gemini answers grounded in those
chunks (with the source chunks returned alongside the answer).

## Local dev

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, AWS creds, GEMINI_API_KEY
pnpm migrate
pnpm dev                # tsx watch
pnpm test
```

## Deploy

`.github/workflows/deploy.yml` builds the Docker image on every push to
`main`, authenticates to AWS via GitHub OIDC (no stored credentials), pushes
to ECR, then patches the image tag into `documind-gitops`'s
`manifests/backend/rollout.yaml`. ArgoCD picks that up and rolls it out via
Argo Rollouts' canary strategy.
