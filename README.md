# FleetFlow - Fleet Management System

A modern fleet management platform built with Next.js, Supabase, and Leaflet for real-time vehicle tracking, driver assignments, and analytics.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL, Auth)
- React Leaflet (OpenStreetMap)
- Recharts (Analytics)
- Tailwind CSS
- shadcn/ui

## Features

- User authentication (driver, manager, admin roles)
- Vehicle fleet management with live tracking
- Driver assignment with completion tracking
- Real-time vehicle status (online/offline with geolocation)
- Trip history and analytics dashboard
- Maintenance scheduling and logs
- Fuel consumption tracking
- Driver performance metrics
- Route optimization data

## Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account with configured database
- Git

## Environment Setup

Copy the required environment variables to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_URL
POSTGRES_HOST
POSTGRES_DATABASE
POSTGRES_USER
POSTGRES_PASSWORD
```

See `.env.example` for full list.

## Local Development

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Building for Production

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Database Schema

Key tables:
- `profiles` - User accounts with roles
- `vehicles` - Fleet inventory
- `drivers` - Driver records
- `assignments` - Vehicle-to-driver assignments
- `vehicle_status` - Real-time GPS and online status
- `trip_history` - Trip records with distance, fuel, duration
- `maintenance_logs` - Service records
- `fuel_logs` - Fuel consumption records

## API Routes

#### Assignments
- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create new assignment
- `PATCH /api/assignments/[id]` - Complete assignment

#### Vehicle Status
- `GET /api/vehicle-status` - Get vehicle GPS and online status
- `PUT /api/vehicle-status` - Update vehicle location and status

#### Drivers
- `GET /api/drivers` - List all drivers

#### Vehicles
- `GET /api/vehicles` - List all vehicles

## Deployment

### Deploy to Vercel

1. Commit and push to Git:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Select Next.js framework
5. Add environment variables from `.env.local` to Vercel settings
6. Click Deploy

The application will be available at your Vercel URL.

## User Roles

### Driver
- View assigned vehicles
- Toggle online/offline status (with geolocation capture)
- Complete assignments when done
- View trip history and performance metrics

### Manager
- Assign vehicles to drivers
- Complete driver assignments
- View all assignments and their status
- Access fleet analytics and reports

### Admin
- Full access to all features
- User and role management

## Maps

Uses OpenStreetMap with Leaflet. No API keys required. Live map shows online vehicles (green markers) and offline vehicles (gray markers).
