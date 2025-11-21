# EcoBuddy — Your Energy Saving Companion (v1.9)

This repository contains EcoBuddy, a full-featured energy-saving dashboard app with:
- React + Vite (Frontend)
- React Router for navigation
- Tailwind CSS (mobile-first)
- Chart.js with React Chart.js 2 for data visualization
- **Express.js + PostgreSQL Backend**
- **User Authentication & Data Persistence**
- **Seeds Currency System**
- **Streak Tracking**
- **Friends & Social Features**

## Features (v1.9)

### 📊 Analytics Page
- Real-time energy usage tracking based on completed tasks
- Weekly consumption charts
- Usage breakdown by category (heating, cooling, lighting, appliances)
- Key performance indicators (KPIs)
- Savings metrics and CO₂ impact
- **NEW:** Shows actual data only - zeros for new users

### 🏆 Social & Leaderboard
- Friends leaderboard showing completed tasks and seeds
- See friends' EcoBuddy mascots
- Track friends' streaks and progress
- **NEW:** No default friends - only real connections

### ⚡ Daily Tasks Page
- Simple task list with 15 eco-friendly tasks
- **NEW:** Mark tasks as complete to earn seeds
- Track completed tasks
- Earn seeds for each completion
- Tasks include activities like "Turn off 10 lights", "Bike to work", "Unplug unused devices"

### 🌱 EcoBuddy Home Page
- Interactive EcoBuddy mascot with transparent image
- **NEW:** Seeds-based economy (replaced points)
- Customizable accessories (sunglasses, top hat, crown, scarf)
- Accessories properly positioned on mascot
- **NEW:** Daily login streak tracking
- Level progression and XP system
- Feed and play with EcoBuddy using seeds

### 🧭 Navigation
- Mobile-optimized bottom navigation bar
- Smooth transitions between pages
- Active route highlighting

## Local Development

### Quick Diagnostic (Recommended First Step)

Before starting development, run the diagnostic tool to check your environment:

```bash
npm run diagnostic
```

This will check:
- Node.js version
- Environment variables
- Dependencies
- Configuration files

### Frontend Only (Client-side mode)

1. Install dependencies:
```bash
npm install
```

2. Run the dev server:
```bash
npm run dev
```

3. Build:
```bash
npm run build
```

4. Preview production build locally:
```bash
npm run preview
```

### Full Stack Development (Frontend + Backend)

#### Backend Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Set up PostgreSQL database:
```bash
createdb energyteen
```

3. Create `.env` file in `backend/` directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/energyteen
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

#### Frontend Setup

1. Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend dev server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

Now you can signup/login and all data will be saved to the database!

## Tech Stack

### Frontend
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js 4 + React Chart.js 2

### Backend (v1.4+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

## Project Structure

```
├── backend/                 # Backend API (v1.4+)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js  # PostgreSQL configuration
│   │   │   └── migrate.js   # Database migrations
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT authentication
│   │   ├── models/
│   │   │   └── User.js      # User data model
│   │   ├── routes/
│   │   │   ├── auth.js      # Auth endpoints
│   │   │   └── user.js      # User endpoints
│   │   └── server.js        # Express server
│   ├── package.json
│   └── README.md
│
├── src/                     # Frontend
│   ├── components/
│   │   ├── NavBottom.jsx    # Bottom navigation bar
│   │   ├── KpiCard.jsx      # Key performance indicator card
│   │   ├── ProgressBar.jsx  # Progress bar component
│   │   ├── ChartLine.jsx    # Line chart component
│   │   └── ChartPie.jsx     # Pie/doughnut chart component
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Signup page
│   │   ├── Home.jsx         # Home dashboard
│   │   ├── Analytics.jsx    # Analytics page
│   │   ├── Leaderboard.jsx  # Rankings page
│   │   ├── Tasks.jsx        # Daily tasks page
│   │   └── Profile.jsx      # User profile page
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
│
└── package.json
```

## Features (v1.4)

✅ **User Authentication**
- Secure signup and login with JWT
- Password hashing with bcrypt
- Session management

✅ **Data Persistence**
- PostgreSQL database
- User profiles saved permanently
- Progress tracking across sessions

✅ **Real Backend API**
- RESTful API endpoints
- User progress updates
- Task completion tracking
- Leaderboard functionality
- Energy usage tracking

✅ **Production Ready**
- Environment variable configuration
- CORS protection
- Input validation

## Design Reference

Design source: `Energy-Saving Teen App Prototype.make` (in repo root)

## Deployment

The application requires a full-stack deployment with:
- Frontend (React + Vite)
- Backend API (Node.js + Express)
- PostgreSQL Database

Configure environment variables as needed for your deployment platform.

## Contributing

This is a demonstration project for the Energy Saving Teen app. For contributions or questions, please open an issue or pull request.

## License

Private repository - All rights reserved
