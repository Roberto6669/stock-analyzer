# Stock Analyzer - Dashboard Técnico

Análisis técnico en tiempo real con RSI, MACD, SMA y Bollinger Bands. Top picks automáticos basados en criterios técnicos.

## Stack

- **Backend**: Python/Flask + FMP API
- **Frontend**: React 18 + Vite + Recharts + Tailwind CSS
- **Deploy**: Render (free tier)

## Setup Local

### Backend
\`\`\`bash
cd stock-analyzer
cp .env.example .env
# Editar .env y agregar tu FMP_API_KEY
pip install -r requirements.txt
python app.py
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
# Abre http://localhost:5173
\`\`\`

## Features

- **Top 15 Picks**: Ranked por score técnico (0-100)
- **RSI (14)**: Oversold (<30), Neutral, Overbought (>70)
- **MACD**: Bullish/bearish signal crossover
- **SMA 50/200**: Trend identification
- **Bollinger Bands**: Volatility

## API Endpoints

- `GET /api/top-picks` → Top 15 picks
- `GET /api/analyze/{ticker}` → Análisis detallado
