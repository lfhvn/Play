# 🌊 Whitewater Rapids Community App

A modern, full-stack application for the whitewater community - think MountainProject for rapids! Share beta, discuss conditions, upload photos, and discover rapids on an interactive map.

## 🚀 Features

- **Interactive Map** - Explore rapids on a beautiful Leaflet map with difficulty-coded markers
- **Detailed Rapid Information** - Flow data, difficulty ratings, hazards, access notes, and more
- **Community Forums** - Per-rapid discussion threads for beta sharing and trip reports
- **Photo Uploads** - Share photos of rapids at different flow levels
- **User Authentication** - Secure login and registration system
- **Geospatial Search** - Find rapids by location, difficulty, or river name
- **Flow Data Integration** - Current flow conditions and optimal flow ranges

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **PostgreSQL** + **PostGIS** - Database with geospatial extensions
- **JWT** - Authentication
- **Multer** - File uploads
- **Axios** - HTTP client

### Frontend (Web)
- **React** + **Vite** - Fast, modern UI framework
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **Context API** - State management

### Mobile (iOS & Android)
- **React Native** + **Expo** - Cross-platform mobile development
- **React Navigation** - Native navigation
- **React Native Maps** - Native map components
- **AsyncStorage** - Persistent local storage

## 📱 Mobile Apps

Native iOS and Android apps built with React Native! See the [mobile README](./mobile/README.md) for details.

**Quick Start:**
```bash
cd mobile
npm install
npm start  # Scan QR code with Expo Go app
```

**Features:**
- Interactive maps with native performance
- Browse 100+ rapids with search and filters
- View detailed rapid information
- Read and post community discussions
- Works on both iPhone and Android devices

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher) with **PostGIS** extension
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Play
```

### 2. Database Setup

First, install PostgreSQL and PostGIS:

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib postgis
```

**macOS (Homebrew):**
```bash
brew install postgresql postgis
```

**Create the Database:**
```bash
# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE whitewater_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE whitewater_db TO your_user;
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=whitewater_db
# DB_USER=your_user
# DB_PASSWORD=your_password
# JWT_SECRET=your-secret-key

# Initialize database (creates tables and PostGIS extension)
npm run init-db

# Seed with sample rapid data
npm run seed
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (default: http://localhost:5000/api)
# VITE_API_URL=http://localhost:5000/api
```

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

## 🗺️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile

### Rapids
- `GET /api/rapids` - Get all rapids (with filters)
- `GET /api/rapids/:id` - Get rapid details
- `GET /api/rapids/search/:query` - Search rapids

### Discussions
- `GET /api/discussions/rapid/:rapidId` - Get discussions for a rapid
- `GET /api/discussions/:id` - Get single discussion with replies
- `POST /api/discussions` - Create new discussion (auth required)
- `POST /api/discussions/:id/reply` - Reply to discussion (auth required)
- `DELETE /api/discussions/:id` - Delete discussion (auth required)

### Photos
- `GET /api/photos/rapid/:rapidId` - Get photos for a rapid
- `POST /api/photos` - Upload photo (auth required)
- `DELETE /api/photos/:id` - Delete photo (auth required)

## 📁 Project Structure

```
Play/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config and schema
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # Utility functions (data seeding)
│   │   └── server.js        # Main server file
│   ├── public/uploads/      # Uploaded photos
│   └── package.json
│
├── frontend/                # Web app
│   ├── src/
│   │   ├── components/      # React components (Map, Header)
│   │   ├── pages/           # Page components (Home, RapidDetail, Auth)
│   │   ├── context/         # React context (AuthContext)
│   │   ├── services/        # API service layer
│   │   ├── styles/          # CSS files
│   │   └── App.jsx          # Main App component
│   └── package.json
│
├── mobile/                  # iOS & Android app
│   ├── src/
│   │   ├── screens/         # App screens (Map, RapidDetail, Auth)
│   │   ├── navigation/      # Navigation configuration
│   │   ├── context/         # React context (AuthContext)
│   │   ├── services/        # API service layer
│   │   └── components/      # Reusable components
│   ├── App.js               # Root component
│   ├── app.json             # Expo configuration
│   └── package.json
│
└── README.md
```

## 🌟 Sample Data

The application comes with **100 top whitewater rapids** pre-seeded from across North America:

**Famous Rapids Include:**
- **Lava Falls** (Colorado River, Grand Canyon) - Class V
- **Crystal Rapid** (Colorado River, Grand Canyon) - Class IV-V
- **Pillow Rock** (Gauley River, West Virginia) - Class V
- **Clavey Falls** (Tuolumne River, California) - Class V
- **Husum Falls** (White Salmon River, Washington) - Class V
- **Big Drop 2** (Cataract Canyon, Utah) - Class IV-V
- **Gorilla** (Green River, North Carolina) - Class V+
- And 93 more rapids spanning Class I through Class V+

**Geographic Coverage:**
- Grand Canyon (Colorado River)
- West Virginia (Gauley, New, Cheat Rivers)
- Idaho (Payette, Middle Fork Salmon, Lochsa)
- California (Tuolumne, American, Kern Rivers)
- Colorado, Oregon, Washington
- Southeast (Chattooga, Ocoee, Green River)
- Northeast, Montana, Wyoming, Utah
- Canada (Ottawa River)
- Plus international destinations (Chile's Futaleufú)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection protection via parameterized queries
- CORS enabled for API security
- File upload validation (images only, 10MB limit)

## 🚧 Future Enhancements

- [ ] USGS real-time flow data integration
- [ ] User profiles with activity history
- [ ] Rating and review system
- [ ] Mobile app (React Native)
- [ ] Social features (follow users, notifications)
- [ ] Advanced search filters (by state, permits, etc.)
- [ ] Export trip plans to PDF
- [ ] Weather integration
- [ ] Offline mode for mobile app

## 🤝 Contributing

This is a community-driven project! Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

- American Whitewater for whitewater conservation and river access
- OpenStreetMap contributors for map data
- The whitewater community for inspiration

---

**Built with ❤️ for the paddling community**
