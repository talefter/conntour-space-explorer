# Conntour Space Explorer

NASA image search application with natural language queries and confidence scoring.

## Quick Start

```bash
docker compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
conntour-space-explorer/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── models/
│   │   │   └── schemas.py   # Pydantic data models
│   │   ├── routes/
│   │   │   └── api.py       # API endpoints
│   │   └── services/
│   │       ├── nasa_service.py    # NASA API integration
│   │       ├── search_service.py  # BM25 search algorithm
│   │       └── history_service.py # Search history management
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── ImageModal.tsx
│   │   │   ├── HistoryModal.tsx
│   │   │   ├── Paginator.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts    # Component exports
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useDebounce.ts
│   │   │   └── useAsyncOperation.ts
│   │   ├── pages/          # Page components
│   │   │   └── BrowsePage.tsx
│   │   ├── services/       # API client
│   │   │   └── api.ts
│   │   ├── styles/         # SCSS stylesheets
│   │   │   ├── main.scss
│   │   │   ├── _SearchBar.scss
│   │   │   ├── _ImageGrid.scss
│   │   │   ├── _Modals.scss
│   │   │   ├── _Paginator.scss
│   │   │   └── _Spinner.scss
│   │   ├── types/          # TypeScript definitions
│   │   │   └── index.ts
│   │   ├── utils/          # Utility functions
│   │   │   └── dateUtils.ts
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite build configuration
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
└── README.md
```