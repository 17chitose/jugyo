
  # オンライン授業動画プラットフォーム

  This is a code bundle for オンライン授業動画プラットフォーム. The original project is available at https://www.figma.com/design/atiVv2jL1HqxvLXlRvFagx/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E6%8E%88%E6%A5%AD%E5%8B%95%E7%94%BB%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend API

  The repository now includes a NestJS API in the `api/` workspace package.

  Run the API locally with:

  ```bash
  pnpm install
  pnpm dev:api
  ```

  The backend exposes demo endpoints for health, auth, users, courses, progress, and upload presigning.

## Database setup

This project uses PostgreSQL with Prisma. For local development, copy [api/.env.example](api/.env.example) to [api/.env](api/.env) and start the database with:

```bash
docker compose up -d postgres
```

Then set up Prisma and seed the demo data:

```bash
pnpm install
pnpm --dir api db:generate
pnpm --dir api db:migrate
pnpm --dir api db:seed
```

For AWS, the recommended production layout is:

- Amazon RDS for PostgreSQL as the primary database
- Amazon S3 for uploaded videos and thumbnails
- ECS Fargate or App Runner for the NestJS API
- Secrets Manager or SSM Parameter Store for `DATABASE_URL` and AWS credentials

Prisma migrations should be applied in deployment, not manually in the app container.
  