# Conntour Space Explorer

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
│   │   ├── components/     # UI components
│   │   │   ├── SearchBar.tsx      # Search with autocomplete
│   │   │   ├── ImageGrid.tsx      # Responsive image grid
│   │   │   ├── ImageCard.tsx      # Image cards with confidence
│   │   │   ├── ImageModal.tsx     # Image detail popup
│   │   │   ├── HistoryModal.tsx   # Search history table
│   │   │   ├── Paginator.tsx      # Pagination controls
│   │   │   └── Spinner.tsx        # Loading indicators
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useDebounce.ts     # Input debouncing
│   │   │   └── useAsyncOperation.ts # Async state management
│   │   ├── pages/
│   │   │   └── BrowsePage.tsx     # Main application page
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── styles/         # SCSS stylesheets
│   │   │   ├── main.scss          # Global styles & variables
│   │   │   ├── _SearchBar.scss    # Search component styles
│   │   │   ├── _ImageGrid.scss    # Grid & card styles
│   │   │   ├── _Modals.scss       # Modal popup styles
│   │   │   ├── _Paginator.scss    # Pagination styles
│   │   │   └── _Spinner.scss      # Loading spinner styles
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── dateUtils.ts       # Date formatting utilities
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite build configuration
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Technologies

- **BM25 Search Algorithm** with confidence scoring (0-100%)
- **Docker containerization** for easy deployment
