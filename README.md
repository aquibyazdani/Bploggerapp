# BP Tracker App

BP Tracker is a mobile-first blood pressure logging app. It lets users record systolic/diastolic readings, track trends, export data, and personalize the UI theme color. The interface is designed as a compact, modern single-page experience with bottom navigation.

## What This App Does

- Records blood pressure readings with systolic, diastolic, pulse, position, and notes.
- Classifies readings using Indian blood pressure guidelines with separate systolic/diastolic status.
- Shows Dashboard, Readings, Trends, and Summary views.
- Exports readings to CSV with optional date range filters.
- Supports a user-selected theme color stored in local storage.
- Works as a PWA with an “Add to Homescreen” prompt.

## App Pages

- Dashboard: overview cards, latest stats, and body position summary.
- Readings: list with edit/delete and systolic/diastolic status badges.
- Trends & Analysis: averages and insights with position distribution.
- Summary & Export: latest reading context + 7/30/90/all-time statistics and CSV export.
- Settings: pick a primary theme color and reset to default.

## Key UX Details

- Bottom navigation with center “+” action.
- Smooth scroll to top on page changes.
- Delete confirmation modal for readings.
- Color system based on CSS variables for theming.

## Tech Stack

- React 18 + TypeScript
- Vite
- Lucide React
- CSS-in-JS styles (inline style objects)

## Data & API

The frontend uses a REST API defined by `VITE_API_BASE_URL` and expects these endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/readings`
- `POST /api/readings`
- `PUT /api/readings/:id`
- `DELETE /api/readings/:id`

Note: The backend implementation is not included in this repo.

## Environment Variables

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  App.tsx                # App shell, routing, nav, theme logic
  components/
    DashboardPage.tsx
    ReadingsPage.tsx
    ReadingsList.tsx
    ReadingForm.tsx
    TrendsPage.tsx
    SummaryPage.tsx
    SettingsPage.tsx
    AddToHomescreenModal.tsx
  contexts/
    AuthContext.tsx       # Auth state (token + user storage)
  utils/
    bp.ts                 # BP category logic (Indian guidelines)
  styles/
    globals.css
  index.css               # Global CSS + theme tokens
```

## Notes

- Theme color is saved in `localStorage` and applied via CSS variables.
- BP category logic separates systolic and diastolic labels.
