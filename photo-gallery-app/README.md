# Rohit Photostudio

The repository is organized into a `frontend/` Vite app and a `backend/` Express API.

## MongoDB setup

1. Create a MongoDB Atlas cluster and copy its connection string.
2. Copy `.env.example` to `.env` and replace `MONGODB_URI` with your connection string.
3. Set unique, strong values for `JWT_SECRET`, `ADMIN_SECRET_KEY`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Never use development credentials in production.
4. Start the frontend and API together:

```bash
npm run dev:full
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

The API creates the administrator specified in `.env` when the database is empty. Public registration only creates contributor accounts; additional administrators must be provisioned by the site owner.

The gallery stores image URLs and metadata in MongoDB; image files are not uploaded to this app. It currently has no checkout, payments, or photo-license purchase flow.

## Available scripts

- `npm run dev`: start the Vite frontend from `frontend/`
- `npm run server`: start the Express API
- `npm run dev:full`: start both frontend and API
- `npm run build`: create a production frontend build

## Original Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
