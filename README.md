
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
  