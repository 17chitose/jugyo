# LearnFlow API

NestJS backend scaffold for the online lecture video platform.

## What is included

- Health endpoint
- Demo login endpoint
- Users, courses, progress, and upload presign endpoints
- Prisma schema for PostgreSQL

## Run locally

```bash
pnpm install
pnpm --dir api start:dev
```

The API runs on `http://localhost:3001/api` by default.

## Database setup

This package uses Prisma with PostgreSQL.

1. Copy [api/.env.example](./.env.example) to [api/.env](./.env).
2. Start PostgreSQL locally with `docker compose up -d postgres` from the repository root.
3. Run `pnpm --dir api db:generate` to generate the Prisma client.
4. Run `pnpm --dir api db:migrate` to create and apply migrations.
5. Run `pnpm --dir api db:seed` to load the demo data.

For AWS production, point `DATABASE_URL` at RDS and keep S3 credentials outside the repo.

## API order to implement next

1. Auth and session handling
2. Users CRUD
3. Courses and curriculum
4. Progress tracking
5. S3 upload presigning
6. Real PostgreSQL persistence through Prisma