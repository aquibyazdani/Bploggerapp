# BP Logger - Blood Pressure Tracking App

A modern, full-stack web application for tracking blood pressure readings with user authentication and data visualization.

## Features

- 🔐 User authentication (register/login)
- 📊 Dashboard with BP statistics
- 📝 Add, edit, delete BP readings
- 📈 Trends and data visualization
- 📋 CSV export functionality
- 📱 Mobile-responsive design
- ☁️ Cloud database (MongoDB Atlas)

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite (build tool)
- Lucide React (icons)
- Custom CSS-in-JS styling

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Express Validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bploggerapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Environment Setup**

   **Frontend (.env)**

   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

   **Backend (backend/.env)**

   ```bash
   cd backend
   # The .env file is already configured with MongoDB Atlas
   # Update JWT_SECRET for production
   ```

4. **Start the Backend**

   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5001
   ```

5. **Start the Frontend**
   ```bash
   # In a new terminal, from project root
   npm run dev
   # App runs on http://localhost:3000 (or next available port)
   ```

## Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### Backend (backend/.env)

```env
PORT=5001
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=development
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Readings

- `GET /api/readings` - Get user's readings
- `POST /api/readings` - Create new reading
- `PUT /api/readings/:id` - Update reading
- `DELETE /api/readings/:id` - Delete reading

## Project Structure

```
bploggerapp/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth)
│   ├── vite-env.d.ts   # TypeScript declarations
│   └── App.tsx         # Main app component
├── backend/
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── server.js       # Express server
├── public/             # Static assets
├── .env.example        # Environment template
└── package.json
```

## Development

### Available Scripts

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**

- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## Deployment

### Frontend (Netlify)

1. Build command: `npm run build`
2. Publish directory: `build`
3. Set environment variables in Netlify dashboard

### Backend (Heroku/Railway/Vercel)

1. Set environment variables
2. Deploy from `backend/` directory
3. Update frontend `.env` with production API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ for health-conscious individuals**
