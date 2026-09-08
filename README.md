# Café Emil Web Platform (Frontend & Backend)

Full-stack web application for **Café Emil** featuring a Next.js frontend, an isolated Node.js/Express backend server, and Supabase cloud persistence.

---

## Project Structure

```
cafe-emil-website/
├── frontend/                     # Next.js 14 Frontend Application
│   ├── app/                      # App router pages & API proxy routes
│   ├── components/               # UI components, CMS & Admin dashboard
│   ├── data/                     # Local seed data fallback
│   ├── lib/                      # Client utilities & CMS communication
│   ├── public/                   # Public static assets (images, audio, icons)
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                       # Node.js + Express + Supabase Backend
│   ├── data/                     # Standalone backend seed data
│   ├── index.js                  # Express API server (port 5001)
│   ├── supabase.js               # Supabase database & storage client
│   ├── schema.sql                # 1-click Supabase database schema
│   ├── seed.js                   # Database seeder (npm run seed)
│   ├── package.json
│   └── .env.example
│
├── package.json                  # Monorepo runner scripts
└── README.md
```

---

## Quick Start

### 1. Run the Express Backend
```bash
cd server
npm install
npm run dev      # or: npm start
```
*Backend runs on `http://localhost:5001`.*

### 2. Run the Next.js Frontend
```bash
cd frontend
npm install
npm run dev      # or: npm start
```
*Frontend runs on `http://localhost:3000` (or custom port).*

### 3. Run From the Root Folder
From the project root directory, you can also run:
```bash
npm run dev:frontend   # Starts Next.js frontend
npm run dev:server     # Starts Express backend
npm run build          # Builds frontend
```

---

## Supabase Cloud Setup (2 Minutes)

1. Open [supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings** &rarr; **API**, and copy your **Project URL** and **`service_role`** key.
3. In `server/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-key-here
   ```
4. In Supabase **SQL Editor**, paste and run the contents of `server/schema.sql`.
5. Seed the database with initial menu data and admin user:
   ```bash
   cd server && npm run seed
   ```

Default Admin Credentials:
- **Username**: `admin`
- **Password**: `CafeEmil2025!`
