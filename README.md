# OneDayGo — Local Tourist Day Visit Planner

## About

OneDayGo is a web application that helps tourists plan a memorable one-day visit to places of interest within **25 km of Deurumpitiya, Sri Lanka**. Users can browse destinations by category or distance, view detailed information including photos, opening hours, and entrance fees, explore all places on an interactive Google Map, and build a drag-and-drop itinerary with real travel time calculations powered by the Google Directions API.

---

## Features

- 🗺️ **Interactive Map** — Google Maps with category markers for all destinations
- 🔍 **Filter & Discover** — Filter places by category (Nature, Religious, Heritage, Leisure) and distance
- 📋 **Place Details** — Photos, opening hours, travel tips, safety warnings, and live LKR → USD fee conversion
- 📅 **Itinerary Builder** — Drag-and-drop up to 6 stops; calculates real travel times via Directions API
- 🔐 **User Authentication** — Register and login as a tourist; separate admin login
- 🛠️ **Admin Dashboard** — Manage places (CRUD), update exchange rate, view statistics
- 📸 **Photo Uploads** — Admins can upload place photos via Multer

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, Vanilla JavaScript, Tailwind CSS (CDN) |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Auth       | JWT (`jsonwebtoken`), bcrypt        |
| Maps       | Google Maps JavaScript API, Google Directions API |
| File Upload| Multer                              |
| Security   | Helmet, express-rate-limit, express-mongo-sanitize |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster
- A [Google Cloud](https://console.cloud.google.com/) project with the **Maps JavaScript API** and **Directions API** enabled
- VS Code with the **Live Server** extension (for the frontend)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/OneDayGo.git
cd OneDayGo
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
JWT_SECRET=your_strong_secret_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**4. Seed the database**
```bash
node server/seedData.js
```

**5. Start the backend server**
```bash
npx nodemon server/server.js
```

**6. Open the frontend**

Open `client/index.html` with the VS Code **Live Server** extension.

---

## Environment Variables

| Variable            | Description                                              |
|---------------------|----------------------------------------------------------|
| `PORT`              | Port the Express server runs on (default: 5000)          |
| `MONGO_URI`         | MongoDB Atlas connection string                          |
| `JWT_SECRET`        | Secret key used for signing JWT tokens                   |
| `GOOGLE_MAPS_API_KEY` | Google Cloud API key with Maps JS & Directions enabled |

---

## Project Structure

```
OneDayGo/
├── client/                     # Frontend (HTML + JS + CSS)
│   ├── index.html              # Home page — place listing & filters
│   ├── login.html              # Tourist login & register
│   ├── place-detail.html       # Individual place detail view
│   ├── map.html                # Google Maps view
│   ├── itinerary.html          # Drag-and-drop itinerary builder
│   ├── 404.html                # Not found page
│   ├── admin/
│   │   ├── admin-login.html    # Admin login portal
│   │   ├── dashboard.html      # Admin statistics dashboard
│   │   ├── manage-places.html  # Place CRUD management
│   │   └── settings.html       # Exchange rate settings
│   └── js/
│       ├── auth.js             # Shared auth helpers
│       ├── places.js           # Home page logic
│       ├── place-detail.js     # Place detail logic
│       ├── map.js              # Google Maps logic
│       ├── itinerary.js        # Itinerary builder logic
│       └── admin/
│           ├── admin-login.js
│           ├── dashboard.js
│           ├── manage-places.js
│           └── settings.js
├── server/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── placeController.js
│   │   ├── itineraryController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── adminOnly.js        # Role guard middleware
│   │   ├── upload.js           # Multer configuration
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Place.js
│   │   ├── Itinerary.js
│   │   └── Setting.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── placeRoutes.js
│   │   ├── itineraryRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── settingsRoutes.js
│   ├── uploads/                # Uploaded place photos (git-ignored)
│   ├── server.js               # Express app entry point
│   ├── seedData.js             # Database seeding script
│   └── create-admin.js         # Utility to create admin account
├── .env                        # Environment variables (git-ignored)
├── .gitignore
├── package.json
└── README.md
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path               | Auth     | Description               |
|--------|--------------------|----------|---------------------------|
| POST   | `/register`        | Public   | Register a new tourist    |
| POST   | `/login`           | Public   | Tourist login             |
| POST   | `/admin/login`     | Public   | Admin login               |

### Places — `/api/places`

| Method | Path        | Auth            | Description                          |
|--------|-------------|-----------------|--------------------------------------|
| GET    | `/`         | Public          | Get all published places (filterable)|
| GET    | `/all`      | Admin           | Get all places (incl. unpublished)   |
| GET    | `/:id`      | Public          | Get a single place by ID             |
| POST   | `/`         | Admin           | Create a new place                   |
| PUT    | `/:id`      | Admin           | Update a place                       |
| DELETE | `/:id`      | Admin           | Delete a place                       |

### Itinerary — `/api/itinerary`

| Method | Path | Auth    | Description                                       |
|--------|------|---------|---------------------------------------------------|
| GET    | `/`  | Tourist | Get the current user's saved itinerary            |
| POST   | `/`  | Tourist | Save/update itinerary and calculate travel times  |

### Settings — `/api/settings`

| Method | Path               | Auth   | Description               |
|--------|--------------------|--------|---------------------------|
| GET    | `/exchange-rate`   | Public | Get current exchange rate |
| PUT    | `/exchange-rate`   | Admin  | Update exchange rate      |

### Upload — `/api/upload`

| Method | Path | Auth  | Description              |
|--------|------|-------|--------------------------|
| POST   | `/`  | Admin | Upload a place photo     |

---

## Admin Setup

To create an admin account, run:
```bash
node server/create-admin.js
```

This will create (or promote) `admin@onedaygo.com` to the admin role. You can then modify the email and password inside the script as needed.

---

## Notes

- The geofence is enforced on the backend — any place coordinates more than **25 km** from Deurumpitiya `(6.8476, 80.3647)` will be rejected.
- The itinerary is capped at **6 stops** maximum.
- Uploaded photos are stored in `server/uploads/` and served statically at `/uploads/<filename>`.
- Rate limiting is applied to `/api/auth` routes: **20 requests per 15 minutes** per IP.
