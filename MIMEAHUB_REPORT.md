# MimeaHub — AI-Powered Plant Disease Detection & Community Agriculture Platform

## Executive Summary

MimeaHub is a full-stack web application that combines **on-device AI diagnosis**, **community outbreak reporting**, **market intelligence**, and **agrovet discovery** into a single mobile-first platform for Kenyan smallholder farmers. The app runs entirely in the browser, uses Teachable Machine/TensorFlow.js for offline-capable inference, and syncs all community data through Supabase for real-time cross-user visibility.

---

## Problem Statement

Smallholder farmers in Kenya lose up to **40% of their harvest** to undiagnosed crop diseases. Most cannot access plant pathologists or agro-vets quickly, and market price information is fragmented. MimeaHub solves this by putting instant AI diagnosis, community alerts, and market data in one place.

---

## Core Features

### 1. AI Leaf Scanner
- **On-device inference** using Teachable Machine + TensorFlow.js (no backend AI required)
- **Camera capture** or **image upload** for leaf analysis
- Supports **Tomato** and **Potato** disease classification:
  - Healthy / Late Blight / Early Blight / Mosaic Virus / Yellow Leaf Curl / Spider Mites / Septoria / Bacterial Spot
- Returns **confidence score**, **severity level**, and **likely cause**
- Provides **organic**, **chemical**, and **prevention** treatment recommendations
- **Demo mode** for judges/users without a physical leaf sample
- Export diagnosis as **copy-to-clipboard report**

### 2. Scan History & Analytics
- Stores every scan with timestamp, location, disease result, and confidence
- **History cards** with disease name, date, and location
- **Search/filter** by disease or location
- **Analytics dashboard** with:
  - Total scans, healthy vs diseased count, today's scans
  - Disease frequency bar chart
  - Most common finding summary

### 3. Community Disease Map
- **Interactive Leaflet map** centered on Kenya
- Displays **community-reported outbreaks** as color-coded pins
- Severity-based marker colors (high/medium/low risk)
- **Report an outbreak** directly from a diagnosis or the map
- Outbreaks saved to Supabase so **all users see the same data**
- Map summary panel with total outbreaks and nearby risk count

### 4. Market Prices
- **Live vegetable prices** across Kenyan counties (Nairobi, Kiambu, Nakuru, Kisumu, Mombasa, Eldoret, Nyeri, Meru, Kericho, Machakos, Garissa, Kajiado, Kilifi)
- Shows crop, variety, price (KES), unit, trend, change %, and market name
- **County filter** for localized pricing
- Data served from Supabase `market_prices` table

### 5. Certified Agrovets Directory
- **20+ verified agrovets** across Kenya with contact details, services, and ratings
- County filtering
- Displays certification status, phone, town, and service tags
- Data served from Supabase `agrovets` table

### 6. Admin Panel
- **PIN-protected** admin dashboard (default PIN: `1234`)
- Only accessible to the admin user account (`admin@mimeahub.com`)
- Full **CRUD** for:
  - Market prices (add, edit, delete)
  - Agrovet listings (add, edit, delete)
- Hidden from regular users; accessed via a discreet link on the dashboard

### 7. User Authentication
- Email/password **registration and login**
- Session persisted in browser
- Protected routes: dashboard redirects unauthenticated users to landing page
- User greeting on dashboard

### 8. Bilingual Support
- Full **English / Kiswahili** toggle
- All scan page labels, buttons, results, and treatments translate dynamically
- Landing page available in both languages

### 9. Remedies Database
- In-app **remedies tab** with organic, chemical, and prevention info
- Disease-specific treatment guidance
- Kenya availability tags

---

## Technical Architecture

### Frontend
| Layer | Technology |
|-------|-----------|
| UI Framework | Vanilla HTML/CSS/JS (no framework dependency) |
| AI Model | Teachable Machine Image + TensorFlow.js |
| Maps | Leaflet.js |
| Backend / DB | Supabase (PostgreSQL) |
| Hosting | Node.js static server (dev) / any static host (prod) |

### Data Flow
```
User captures/upload leaf
       ↓
TensorFlow.js inference (on-device)
       ↓
Result displayed + saved to Supabase `scans` table
       ↓
Map/history/analytics read from Supabase
       ↓
Outbreaks shared in real-time across all users
```

### Database Schema (Supabase)
- **scans** — user scan history
- **outbreaks** — community disease reports
- **market_prices** — vegetable prices by county/market
- **agrovets** — certified input supplier directory

All tables have **public RLS policies** for read/write access.

---

## Key Technical Decisions

1. **100% Online Mode** — Removed IndexedDB, service workers, and offline sync to eliminate caching bugs and ensure data consistency through Supabase.

2. **Client-Side AI** — Uses Teachable Machine models so inference runs in the browser without GPU servers or API costs.

3. **Supabase Realtime Ready** — Outbreak table supports live alerts via Postgres Changes (commented out by default).

4. **Mobile-First Design** — Bottom navigation, large touch targets, responsive grid, and camera-first UX.

---

## Impact & Use Case

| User | Value |
|------|-------|
| Smallholder Farmer | Instant disease diagnosis without waiting for an expert |
| Community | Real-time outbreak alerts help neighbors take preventive action |
| Farmer | Access to current market prices to maximize earnings |
| Farmer | Directory of certified input suppliers for quality seeds/fertilizer |

---

## Future Enhancements

1. **SMS/USSD integration** for feature-phone users
2. **More crop models** (maize, beans, cassava)
3. **Price trend charts** with historical data
4. **Weather API integration** for disease risk forecasting
5. ** multilingual expansion** (Kikuyu, Luo, Kalenjin)
6. **Photo verification** for agrovet listings

---

## Demo Flow for Judges

1. Open app → Browse landing page
2. Register / login
3. Go to **Scan** → upload a leaf image → view AI diagnosis with confidence score and treatments
4. View the same scan in **History** and **Stats**
5. Go to **Map** → see community outbreaks, report a new one
6. Go to **Market** → browse vegetable prices and agrovets by county
7. Login as `admin@mimeahub.com` → access hidden admin panel via dashboard footer → add/edit prices and agrovets

---

*Built with Supabase, TensorFlow.js, Teachable Machine, Leaflet, and Node.js.*
