# StreamBox - Prime Video Experience

StreamBox is an immersive streaming platform featuring responsive hero banners, multi-category carousels, dynamic subscription plans, and adaptive video playback.

## Beta Release
This is the `beta` branch featuring active UI enhancements, streaming optimizations, and robust offline mock fallbacks.

### Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Cloud PostgreSQL Database:**
   Copy `.env.example` to `.env` (or edit existing `.env`):
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<cloud-host>:5432/<database>?sslmode=require
   PORT=5000
   ```

3. **Run Migrations & Seed Data (Optional - also auto-runs on server start):**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run both Frontend & Backend:**
   ```bash
   npm run dev:all
   ```
   Or run them in separate terminals:
   ```bash
   npm run server:dev  # Starts Express API at http://localhost:5000
   npm run dev         # Starts Vite frontend at http://localhost:5173
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
