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

## API order to implement next

1. Auth and session handling
2. Users CRUD
3. Courses and curriculum
4. Progress tracking
5. S3 upload presigning
6. Real PostgreSQL persistence through Prisma