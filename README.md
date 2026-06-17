<<<<<<< HEAD
# GitHub Profile Analyzer Backend

Node.js + Express backend for fetching GitHub profile data, storing normalized raw data in MySQL, and generating analytics dynamically through SQL views.

## Features

- Fetch GitHub profile, repositories, followers, and following data.
- Store only normalized raw data in `users` and `repository`.
- Compute insights dynamically using SQL views instead of storing redundant derived values.
- Uses MySQL foreign keys and indexes for cleaner relationships and faster analytics.
- Centralized Express error handling.

## Tech Stack

- Node.js
- Express.js
- MySQL
- `mysql2/promise`
- Axios
- Dotenv

## Project Structure

```text
.
|-- app.js
|-- server.js
|-- package.json
|-- controllers/
|   `-- githubController.js
|-- database/
|   |-- db.js
|   `-- schema.sql
|-- middleware/
|   `-- errorHandler.js
|-- models/
|   `-- githubModel.js
|-- routes/
|   `-- githubRoutes.js
|-- scripts/
|   |-- migrate.js
|   `-- test-db.js
`-- services/
    `-- githubService.js
```

## Prerequisites

- Node.js 18 or newer recommended.
- MySQL 8 or newer recommended.
- A GitHub Personal Access Token is recommended to avoid low unauthenticated rate limits.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=3001
GITHUB_TOKEN=your_github_token_here
DATABASE_URL=mysql://username:password@localhost:3306/github_profile_analyser
```

3. Create/apply the database schema:

```bash
npm run migrate
```

Important: the current `database/schema.sql` drops and recreates the project tables/views. Run it only when you are okay with resetting existing project data.

4. Test the database connection:

```bash
node scripts/test-db.js
```

Expected output includes:

```text
DB test result: [ { result: 2 } ]
Connected to database: github_profile_analyser
```

5. Start the server:

```bash
npm start
```

Server runs at:

```text
http://localhost:3001
```

## Environment Variables

| Variable       | Required    | Description                                                                                |
| -------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `PORT`         | No          | Server port. Defaults to `3001`.                                                           |
| `GITHUB_TOKEN` | Recommended | GitHub token used for authenticated API requests.                                          |
| `DATABASE_URL` | Yes         | MySQL connection URL. Example: `mysql://user:pass@localhost:3306/github_profile_analyser`. |

## Database Design

The database is normalized and intentionally avoids storing derived analytics.

### Tables

#### `users`

Stores raw GitHub profile information.

- `id`
- `github_id`
- `username`
- `name`
- `bio`
- `company`
- `location`
- `followers`
- `following`
- `public_repos`
- `created_at`
- `updated_at`

#### `repository`

Stores raw repository information.

- `repo_id`
- `user_id`
- `name`
- `language`
- `stars`
- `forks`
- `watchers`
- `is_private`
- `created_at`
- `updated_at`

`repository.user_id` references `users.id` with `ON DELETE CASCADE`.

### SQL Views

The following views compute analytics dynamically:

- `vw_user_repository_insights`
- `vw_user_language_stats`
- `vw_user_primary_language`
- `vw_user_repository_activity`

These views calculate values such as:

- Total stars
- Total forks
- Total watchers
- Average stars per repository
- Repository count
- Primary programming language
- Primary language percentage
- Follower-to-following ratio
- Account age
- Repository activity dates

## API Endpoints

Base URL:

```text
http://localhost:3001/api/github
```

### Health Check

```http
GET /
```

Returns:

```text
OK
```

### Get GitHub Profile

```http
GET /api/github/profile/:username
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21
```

Returns parsed GitHub profile data including username, GitHub ID, name, location, follower counts, following count, public repos, and timestamps.

### Get User Repositories

```http
GET /api/github/profile/:username/repos
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21/repos
```

Returns parsed repositories for the user.

### Get Single Repository

```http
GET /api/github/profile/:username/:repository
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21/my-repo
```

Returns parsed data for one repository.

### Get Followers

```http
GET /api/github/profile/:username/followers
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21/followers
```

Returns parsed follower user objects from GitHub.

### Get Following

```http
GET /api/github/profile/:username/following
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21/following
```

Returns parsed users that the GitHub account follows.

### Get Computed Insights

```http
GET /api/github/profile/:username/insights
```

Example:

```http
GET http://localhost:3001/api/github/profile/chethanGITHUB21/insights
```

This endpoint:

1. Fetches the latest GitHub profile and repository data.
2. Upserts raw data into `users` and `repository`.
3. Reads computed analytics from SQL views.
4. Returns dynamic insights without storing redundant derived values.

Example response shape:

```json
{
  "user_id": 1,
  "github_id": 180030249,
  "username": "chethanGITHUB21",
  "followers": 10,
  "following": 3,
  "public_repos": 9,
  "repository_count": 9,
  "total_stars": 245,
  "total_forks": 80,
  "total_watchers": 95,
  "average_stars_per_repo": "27.2222",
  "follower_following_ratio": "2.50",
  "account_age": 2,
  "primary_language": "JavaScript",
  "primary_language_percentage": "65.00",
  "latest_repository_created_at": "2026-06-01T10:30:00.000Z",
  "latest_repository_updated_at": "2026-06-15T09:05:17.000Z",
  "first_repository_created_at": "2024-09-01T14:23:33.000Z",
  "public_repository_count": 9,
  "private_repository_count": 0
}
```

## Useful Commands

```bash
npm install
npm start
npm run dev
npm run migrate
node scripts/test-db.js
```
