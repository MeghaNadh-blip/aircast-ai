# AeroPulse

AeroPulse is an air quality intelligence platform for AQI analysis, forecasting, and environmental decision support. The system combines a modern React dashboard with a Python FastAPI backend and machine learning pipeline for detecting pollution patterns, forecasting future air conditions, and exploring city-level atmospheric trends.

## Why this project exists

Air pollution is a complex, time-sensitive problem. AeroPulse helps users:

- analyze historical AQI and pollutant datasets,
- compare environmental signals across time ranges,
- simulate or inspect predictive forecasts,
- and understand how model features drive AQI behavior.

## Features

- CSV upload workflow for custom dataset exploration
- Live prediction mode for city-based AQI forecasting
- AQI, weather, and pollutant dashboards
- Forecasting and analytics endpoints via FastAPI
- Model diagnostics with feature importance and trend views
- Optional MongoDB persistence for prediction history and audit data

## Tech stack

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Visualization: Recharts, Lucide icons
- Backend: FastAPI, Pydantic
- ML: LightGBM, scikit-learn, pandas, numpy
- Data storage: MongoDB Atlas (optional)

## Project structure

```bash
.
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── model_loader.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── routes/
│   └── services/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── types/
│   └── utils/
├── generate_dataset.py
├── fetch_real_dataset.py
├── train.py
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── metadata.json
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm
- pip
- Optional: MongoDB Atlas connection for persistent data storage

## Quick start

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Install backend dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3) Start the backend

Run the API from the project root:

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API docs will be available at:

- http://localhost:8000/docs
- http://localhost:8000/redoc

### 4) Start the frontend

In a new terminal:

```bash
npm run dev
```

Then open:

- http://localhost:3000

## Environment variables

Create a `.env` file in the backend folder if you want to configure optional runtime settings:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DB_NAME=aqi_intelligence
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Notes:

- `MONGODB_URI` is optional; the app can run in transient mode without it.
- `ALLOWED_ORIGINS` controls frontend access to the API.

## Data and model workflows

### Generate synthetic AQI data

```bash
python generate_dataset.py
```

### Fetch external AQI data

```bash
python fetch_real_dataset.py
```

### Train the forecasting model

```bash
python train.py
```

This workflow builds time-series features such as lag values, rolling averages, and cyclical datetime patterns before training a model on AQI values.

## Useful commands

```bash
# Build the frontend production bundle
npm run build

# Run frontend type checks
npm run lint

# Check backend health
curl http://localhost:8000/health
```

## Notes

- The live prediction mode uses public environmental data sources and does not require a personal API key.
- If MongoDB is not configured, the backend continues in a functional degraded mode.

## License

This project is intended for educational and demo use unless otherwise stated by the repository owner.
