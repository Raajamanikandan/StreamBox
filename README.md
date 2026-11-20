# StreamBox - Prime Video Streaming Platform 🎬

StreamBox is a modern, high-performance video streaming web application designed with a Prime Video-inspired UI. It features adaptive video streaming, dynamic subscription tiers, role-based access control, and a full cloud PostgreSQL backend with automated seeding.

---

## ✨ Features

- **Responsive Prime Video UI**: Dynamic hero banners, multi-genre carousels, movie detail pages, and watch progress tracking.
- **Adaptive Video Playback**: Integrated HLS.js streaming with custom player controls, quality switching, and resume playback.
- **10-Digit Mobile Authentication**: Clean OTP-based sign-in with strict 10-digit input validation and keyboard locks.
- **Dynamic Subscription Plans**:
  - **Mobile**: $2.99/mo (720p HD, 1 Screen)
  - **Super**: $6.99/mo (1080p Full HD, 2 Screens)
  - **Premium 4K**: $11.99/mo (4K Ultra HD + Dolby Atmos, 4 Screens)
- **Admin Management Portal**: Create, edit, and delete movie catalog entries with real-time status updates.
- **Cloud PostgreSQL Database**: Connected via Node.js Express backend with connection pooling, automated migrations, and seeder scripts.
- **Local Network Streaming**: Configured to run on `0.0.0.0` so you can test streaming on your mobile phone, tablet, or TV over your local Wi-Fi.

---

## 📱 Pre-Configured Test Accounts

The database comes pre-seeded with 10 demo user accounts, each with its own active 1-year subscription:

| Mobile Number | Assigned Plan | Video Quality | Role | Demo OTP |
|:---:|:---:|:---:|:---:|:---:|
| `9876500001` | **Mobile** | 720p HD (1 Screen) | User | `123456` |
| `9876500002` | **Mobile** | 720p HD (1 Screen) | User | `123456` |
| `9876500003` | **Mobile** | 720p HD (1 Screen) | User | `123456` |
| `9876500004` | **Super** | 1080p Full HD (2 Screens) | User | `123456` |
| `9876500005` | **Super** | 1080p Full HD (2 Screens) | User | `123456` |
| `9876500006` | **Super** | 1080p Full HD (2 Screens) | User | `123456` |
| `9876500007` | **Super** | 1080p Full HD (2 Screens) | User | `123456` |
| `9876500008` | **Premium 4K** | 4K UHD + Atmos (4 Screens) | User | `123456` |
| `9876500009` | **Premium 4K** | 4K UHD + Atmos (4 Screens) | User | `123456` |
| `9876500010` | **Premium 4K** | 4K UHD + Atmos | **Admin** | `123456` |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (reference [.env.example](.env.example)):
```env
# Cloud PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=disable
PGSSL=false

PORT=5000
MEDIA_BASE_URL=https://test-streams.mux.dev
```

### 3. Initialize & Seed Database
Run the migration and seeder to create tables and populate plans, movies, and accounts:
```bash
npm run db:seed
```

### 4. Run Development Server (Frontend + Backend)
To run both the Vite client and Express API simultaneously:
```bash
npm run dev:all
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend API (Port 5000)
npm run server:dev

# Terminal 2: Frontend App (Port 5173)
npm run dev
```

### 5. Access Across Local Network / Devices
Once running, StreamBox is available at:
- **Local Browser**: `http://localhost:5173/`
- **Network / Mobile**: `http://<YOUR_LOCAL_IP>:5173/` (e.g., `http://10.142.125.254:5173/`)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Axios, HLS.js
- **Backend**: Node.js, Express, `pg` (node-postgres), CORS, Dotenv
- **Database**: PostgreSQL (Cloud / Selfmade Ninja / Neon / RDS)
- **Tooling**: Concurrently, Oxlint
