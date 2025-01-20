# Mini Game Playground - Backend

Node.js/Express backend server with MongoDB database and Socket.IO integration.

## Features

- 🔐 JWT Authentication
- 🎮 Game Management
- 📊 Score Tracking
- 🔄 Real-time Updates
- 👥 User Management
- 🔒 Session Handling

## Tech Stack

- Node.js
- Express
- MongoDB/Mongoose
- Socket.IO
- JSON Web Tokens
- bcrypt

## Prerequisites

- Node.js 20.x or higher
- MongoDB 6.x or higher
- npm 9.x or higher

## Installation

1. Clone the repository:

   ```bash
   git clone [your-repo-url]
   cd mini-game-playground-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file:

   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

Create a new user account.

```json
{
  "username": "string",
  "password": "string",
  "avatar": "string",
  "rememberMe": "boolean"
}
```

#### POST /api/auth/login

Login with existing credentials.

```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```

#### POST /api/auth/guest

Create guest session.

```json
{
  "avatar": "string (optional)"
}
```

#### POST /api/auth/logout

End current session.

#### POST /api/auth/refresh-token

### Delete /api/users/(UserName)

Refresh access token using refresh token.

### Game Endpoints

#### GET /api/games

Get list of available games.

- Query Parameters:
  - category (optional)
  - page (default: 1)
  - limit (default: 20)

#### GET /api/games/:gameId

Get specific game details.

#### POST /api/games/init

Initialize games database.

### Score Endpoints

#### POST /api/scores

Submit new score.

```json
{
  "username": "string",
  "gameId": "string",
  "score": "number"
}
```

#### GET /api/scores/game/:gameId

Get leaderboard for specific game.

#### GET /api/scores/user/:username

Get user's score history.

### User Endpoints

#### GET /api/users/:username

Get user profile.

#### PUT /api/users/:username

Update user profile.

```json
{
  "newUsername": "string (optional)",
  "newAvatar": "string (optional)",
  "currentPassword": "string (required for password change)",
  "newPassword": "string (optional)"
}
```

## Socket.IO Events

### Server -> Client

- `score_update`: New score submitted
- `active_users`: Active user count update

### Client -> Server

- `join_game`: Join game room
- `leave_game`: Leave game room
- `auth_user`: Authenticate socket connection
- `new_score`: Submit new score

## Error Handling

Standard error response format:

```json
{
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

## Security Measures

- JWT-based authentication
- HTTP-only cookies
- Rate limiting
- CORS configuration
- Password hashing
- Input validation
- Error sanitization

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `ACCESS_TOKEN_EXPIRES_IN`: Access token lifetime
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token lifetime
- `PORT`: Server port
- `FRONTEND_URL`: Frontend application URL

## Available Scripts

- `npm run start`: Start production server
- `npm run dev`: Start development server

## License

[Pending...]
