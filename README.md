# Habit Tracker API

A TypeScript-based REST API for managing users, habits, and tags. The project is built with Express, Drizzle ORM, PostgreSQL, and JWT-based authentication.

## Features

- User registration and login
- JWT authentication and authorization
- Habit creation, reading, updating, and deletion
- Tag management for organizing habits
- Health check endpoint
- Automated tests with Vitest

## Tech Stack

- Node.js + TypeScript
- Express.js
- Drizzle ORM
- PostgreSQL
- Zod for validation
- JWT via Jose
- Vitest + Supertest for testing

## Project Structure

- src/controllers - request handlers for auth, users, habits, and tags
- src/routes - API route definitions
- src/middleware - authentication, authorization, and validation middleware
- src/db - database schema, connection, and seed logic
- tests - integration tests for authentication and setup flows

## Prerequisites

- Node.js 18+
- PostgreSQL database

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create environment files

Create a `.env` file in the project root with values similar to:

```env
APP_STAGE=dev
NODE_ENV=development
PORT=3000
HOST=localhost
DATABASE_URL=postgresql://username:password@localhost:5432/habittracker
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_secret_key
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

3. Run database migrations

```bash
npm run db:push
```

4. Seed the database (optional)

```bash
npm run db:seed
```

5. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

## API Endpoints

### Health

- `GET /health` - returns server health status

### Authentication

- `POST /auth/register` - create a new user
- `POST /auth/login` - log in a user
- `POST /auth/logout` - log out a user
- `POST /auth/refresh` - refresh an access token

### Users

- `GET /users` - list users (admin only)
- `GET /users/profile` - get current user profile
- `PUT /users/profile` - update current user profile
- `POST /users/change-password` - change password
- `DELETE /users/:id` - delete a user (admin only)

### Habits

- `GET /habits` - list habits for the authenticated user
- `GET /habits/:id` - get a specific habit
- `POST /habits` - create a habit
- `PUT /habits/:id` - update a habit
- `DELETE /habits/:id` - delete a habit

### Tags

- `POST /tags` - create a tag
- `GET /tags` - list tags
- `GET /tags/:id` - get a tag by ID
- `PUT /tags/:id` - update a tag
- `DELETE /tags/:id` - delete a tag

## Testing

Run the test suite with:

```bash
npm test
```

## License

This project is licensed under the ISC License.
