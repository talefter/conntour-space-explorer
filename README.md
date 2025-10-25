# Conntour Space Explorer

A full-stack web application for exploring and searching NASA images with natural language queries, confidence scoring, and search history with exact snapshot replay.

## Features

- **Browse Images**: View all NASA images with metadata (title, date, keywords)
- **Natural Language Search**: Search with free-text queries and see confidence scores
- **Search History**: Revisit past searches with exact snapshot replay
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Backend**: FastAPI with clean architecture (services, routes, models)
- **Frontend**: React + TypeScript + Vite + SCSS with component-based architecture
- **Search**: BM25 algorithm with title boost and score normalization
- **Data**: JSON file persistence (no external database required)

## Quick Start (Docker - Recommended)

1. **Clone and start the application**:
   ```bash
   git clone <repository-url>
   cd conntour-space-explorer
   docker compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/docs

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `GET /sources` - Get all NASA images
- `GET /search?q=<query>` - Search images with confidence scores
- `GET /history?page=<int>&page_size=<int>` - Get paginated search history
- `GET /history/{id}/results` - Get exact snapshot of historical search
- `DELETE /history/{id}` - Delete history entry

## Technical Details

### Backend Architecture
```
backend/
├── src/
│   ├── models/          # Pydantic schemas
│   ├── services/        # Business logic
│   │   ├── nasa_service.py      # NASA API integration
│   │   ├── search_service.py    # BM25 search algorithm
│   │   └── history_service.py   # Search history management
│   └── routes/          # API endpoints
└── app.py              # FastAPI application
```

### Frontend Architecture
```
frontend/src/
├── components/         # Reusable UI components
├── pages/             # Route-specific components
├── hooks/             # Custom React hooks
├── services/          # API client
├── styles/            # SCSS styles with variables/mixins
├── types/             # TypeScript definitions
└── utils/             # Utility functions
```

### Search Algorithm
- **BM25 scoring** over title, description, and keywords
- **Title boost** (20%) for exact query matches in titles
- **Score normalization** to 0-1 range for consistent UI display
- **Debounced search** (350ms) with request cancellation

### Data Persistence
- NASA images cached in `backend/data/cache.json`
- Search history stored in `backend/data/history.json`
- Cache refreshes every 24 hours
- History limited to 500 most recent entries

### Performance Features
- **Request cancellation** prevents stale responses
- **Delayed spinner** (200ms threshold) avoids flicker
- **Fixed aspect ratios** prevent layout shift
- **Lazy loading** for image previews
- **Component-based architecture** for maintainability

## Development Best Practices

### Backend
- **Clean Architecture**: Separation of concerns with services, routes, and models
- **Type Safety**: Pydantic models for request/response validation
- **Error Handling**: Consistent HTTP error responses
- **Async/Await**: Non-blocking I/O operations

### Frontend
- **TypeScript**: Full type safety with strict configuration
- **SCSS**: Organized styles with variables, mixins, and BEM methodology
- **Custom Hooks**: Reusable logic for async operations and debouncing
- **Path Aliases**: Clean imports with @ prefix
- **Component Structure**: Each component in its own directory with styles

### Code Quality
- **ESLint**: Code linting with TypeScript rules
- **Modular Design**: Small, focused modules
- **Consistent Naming**: Descriptive, boring names
- **No Dead Code**: Clean, production-ready codebase

## Usage

1. **Browse**: View all available NASA images with metadata
2. **Search**: Enter natural language queries like "mars rover" or "solar flares"
3. **History**: View past searches, re-run them, or see exact snapshots
4. **Confidence**: Each search result shows a confidence percentage

## Development Notes

- Search results are cached as exact snapshots for historical replay
- BM25 parameters: k1=1.2, b=0.75 with 20% title boost
- Frontend uses AbortController for proper request cancellation
- All timestamps are in Unix epoch seconds
- Images are fetched from NASA's official Images API
- SCSS follows BEM methodology for maintainable styles
- Components are organized with co-located styles and exports

## Testing

Run the setup validation:
```bash
# Windows
test-setup.bat

# Manual validation
cd backend && python -m py_compile app.py
cd ../frontend && npm install && npx tsc --noEmit
```