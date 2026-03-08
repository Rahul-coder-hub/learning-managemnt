# Learning Management System (LMS)

A production-ready Learning Management System built with Next.js 14, Node.js Express, and MySQL.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Course Management**: Browse and enroll in courses
- **Video Lessons**: YouTube video integration with iframe embedding
- **Progress Tracking**: Track video watch progress and completion status
- **Sequential Unlocking**: Lessons unlock only after completing previous ones
- **Responsive Design**: Clean, minimalistic UI with TailwindCSS

## Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- TailwindCSS
- Axios

### Backend
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- bcryptjs

### Database
- MySQL

## Project Structure

```
learning-management/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Database and JWT configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   └── services/        # Business logic
│   ├── database/
│   │   └── schema.sql       # MySQL schema with sample data
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients
│   │   └── types/           # TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE lms_database;
```

2. Run the schema script:
```bash
mysql -u root -p lms_database < backend/database/schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_database
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_different

PORT=5000
FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/refresh` - Refresh access token
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Courses
- `GET /api/subjects` - Get all courses
- `GET /api/subjects/:subjectId` - Get course details
- `GET /api/subjects/:subjectId/tree` - Get course with sections and videos

### Videos
- `GET /api/videos/:videoId` - Get video details with progress

### Progress
- `POST /api/progress/videos/:videoId` - Update video progress
- `GET /api/progress/videos/:videoId` - Get video progress
- `GET /api/progress/subjects/:subjectId` - Get course progress

### Enrollments
- `POST /api/enrollments/:subjectId` - Enroll in a course
- `GET /api/enrollments/my` - Get my enrollments
- `GET /api/enrollments/:subjectId/check` - Check enrollment status

## Application Flow

1. **Browse Courses**: Visit `/courses` to see available courses
2. **Enroll**: Click "Enroll Now" to join a course
3. **View Course**: Click on a course to see its sections and lessons
4. **Learn**: Click on a lesson to watch the video
5. **Progress**: Complete lessons to unlock the next ones

## Lesson Unlocking Logic

- First lesson in a course is always unlocked
- Subsequent lessons unlock only when the previous lesson is marked as completed
- Users can manually mark lessons as complete
- Progress is saved automatically

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15 minute expiry)
- JWT refresh tokens (7 day expiry, stored in database)
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- CORS configuration

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run lint
```

### Building for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database `lms_database` exists

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend is running on the correct port

### JWT Errors
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and different
- Secrets should be long random strings

## License

MIT
