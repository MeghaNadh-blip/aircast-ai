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


## Notes

- The live prediction mode uses public environmental data sources and does not require a personal API key.
- If MongoDB is not configured, the backend continues in a functional degraded mode.

## License

This project is intended for educational and demo use unless otherwise stated by the repository owner.
