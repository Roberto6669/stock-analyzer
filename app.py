import os
import requests
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

FMP_API_KEY = os.getenv('FMP_API_KEY')
BASE_URL = "https://financialmodelingprep.com/api/v3"
TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOG', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'JNJ', 'V', 'WMT', 'JPM', 'MA', 'PG', 'KO', 'HD', 'MCD', 'NFLX', 'CSCO', 'ADBE', 'CRM', 'INTC', 'AMD', 'QCOM', 'AVGO', 'ASML', 'MCHP', 'MRVL', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'ICE', 'CME', 'AXP', 'UNH', 'LLY', 'MRK', 'ABBV', 'PFE', 'XOM', 'CVX', 'TJX', 'LOW', 'MKS', 'NKE', 'CL', 'BA', 'CAT', 'GE', 'LUV', 'DAL', 'SPY', 'QQQ', 'IWM', 'EEM', 'GLD', 'TLT', 'USO', 'DBC']
CACHE_EXPIRY_HOURS = 4

class CacheManager:
    def __init__(self):
        self.data = {}
        self.timestamps = {}
    def get(self, key):
        if key in self.data:
            timestamp = self.timestamps.get(key)
            if timestamp and (datetime.now() - timestamp).total_seconds() < CACHE_EXPIRY_HOURS * 3600:
                return self.data[key]
        return None
    def set(self, key, value):
        self.data[key] = value
        self.timestamps[key] = datetime.now()

cache = CacheManager()

def fetch_historical_data(ticker):
    cached = cache.get(f"hist_{ticker}")
    if cached:
        return cached
    try:
        url = f"{BASE_URL}/historical-price-full/{ticker}?from=2023-06-04&to=2024-06-04&apikey={FMP_API_KEY}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'historical' in data:
                historical = sorted(data['historical'], key=lambda x: x['date'])
                cache.set(f"hist_{ticker}", historical)
                return historical
    except Exception as e:
        print(f"Error: {e}")
    return []

def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return None
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    seed = deltas[:period]
    up = sum([x for x in seed if x > 0]) / period
    down = -sum([x for x in seed if x < 0]) / period
    rs_list = [100.0 if down == 0 else 100.0 - (100.0 / (1.0 + up / down))]
    for delta in deltas[period:]:
        if delta > 0:
            up = (up * (period - 1) + delta) / period
            down = (down * (period - 1) + 0) / period
        else:
            up = (up * (period - 1) + 0) / period
            down = (down * (period - 1) + -delta) / period
        rs = up / down if down != 0 else 100
        rsi = 100.0 - (100.0 / (1.0 + rs))
        rs_list.append(rsi)
    return rs_list[-1] if rs_list else None

def calculate_macd(prices, fast=12, slow=26, signal=9):
    if len(prices) < slow:
        return None, None, None
    ema_fast = _ema(prices, fast)
    ema_slow = _ema(prices, slow)
    macd_line = [ema_fast[i] - ema_slow[i] for i in range(len(ema_fast))]
    signal_line = _ema(macd_line, signal)
    histogram = [macd_line[i] - signal_line[i] for i in range(len(signal_line))]
    return macd_line[-1], signal_line[-1], histogram[-1]

def _ema(prices, period):
    multiplier = 2 / (period + 1)
    ema = [sum(prices[:period]) / period]
    for price in prices[period:]:
        ema.append((price * multiplier) + (ema[-1] * (1 - multiplier)))
    return ema

def calculate_sma(prices, period):
    if len(prices) < period:
        return None
    return sum(prices[-period:]) / period

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    if len(prices) < period:
        return None, None, None
    sma = sum(prices[-period:]) / period
    variance = sum([(p - sma) ** 2 for p in prices[-period:]]) / period
    std = variance ** 0.5
    return sma + (std * std_dev), sma, sma - (std * std_dev)

def analyze_ticker(ticker):
    historical = fetch_historical_data(ticker)
    if not historical or len(historical) < 30:
        return None
    prices = [h['close'] for h in historical]
    current_price = prices[-1]
    prev_price = prices[-2] if len(prices) > 1 else current_price
    change_pct = ((current_price - prev_price) / prev_price * 100) if prev_price else 0
    rsi = calculate_rsi(prices)
    macd, signal, histogram = calculate_macd(prices)
    sma_50 = calculate_sma(prices, 50)
    sma_200 = calculate_sma(prices, 200)
    upper_bb, middle_bb, lower_bb = calculate_bollinger_bands(prices)
    rsi_signal = 'oversold' if rsi and rsi < 30 else ('overbought' if rsi and rsi > 70 else 'neutral')
    macd_signal = 'bullish' if macd and signal and histogram and macd > signal else 'bearish'
    trend = 'uptrend' if sma_50 and sma_200 and sma_50 > sma_200 else 'downtrend'
    score = 0
    if rsi:
        score += 30 if rsi < 30 else (20 if rsi < 50 else (0 if rsi > 70 else 15))
    if macd and signal and histogram:
        score += 20 if macd > signal else 5
    if sma_50 and sma_200:
        score += 25 if sma_50 > sma_200 else 5
    if upper_bb and lower_bb:
        band_range = upper_bb - lower_bb
        if band_range > 0:
            position = (current_price - lower_bb) / band_range
            score += 15 if position < 0.3 else (2 if position > 0.7 else 8)
    recommendation = 'COMPRA' if score > 65 else ('VENTA' if score < 35 else 'NEUTRAL')
    return {'ticker': ticker, 'precio': round(current_price, 2), 'cambio_pct': round(change_pct, 2), 'score': round(score, 1), 'recomendacion': recommendation, 'indicadores': {'rsi': round(rsi, 2) if rsi else None, 'rsi_signal': rsi_signal, 'macd': round(macd, 4) if macd else None, 'macd_signal': round(signal, 4) if signal else None, 'macd_histogram': round(histogram, 4) if histogram else None, 'macd_direction': macd_signal, 'sma_50': round(sma_50, 2) if sma_50 else None, 'sma_200': round(sma_200, 2) if sma_200 else None, 'trend': trend, 'bb_upper': round(upper_bb, 2) if upper_bb else None, 'bb_middle': round(middle_bb, 2) if middle_bb else None, 'bb_lower': round(lower_bb, 2) if lower_bb else None}}

@app.route('/api/top-picks', methods=['GET'])
def get_top_picks():
    results = []
    for ticker in TICKERS[:50]:
        try:
            analysis = analyze_ticker(ticker)
            if analysis:
                results.append(analysis)
        except Exception as e:
            print(f"Error: {e}")
    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'timestamp': datetime.now().isoformat(), 'picks': results[:15]})

@app.route('/api/analyze/<ticker>', methods=['GET'])
def analyze_single(ticker):
    ticker = ticker.upper()
    analysis = analyze_ticker(ticker)
    if not analysis:
        return jsonify({'error': 'No data'}), 404
    historical = fetch_historical_data(ticker)
    chart_data = []
    for h in historical[-60:]:
        prices = [x['close'] for x in historical[:historical.index(h)+1]]
        rsi = calculate_rsi(prices)
        macd, signal, _ = calculate_macd(prices)
        sma_50 = calculate_sma(prices, 50)
        sma_200 = calculate_sma(prices, 200)
        chart_data.append({'date': h['date'], 'open': h['open'], 'high': h['high'], 'low': h['low'], 'close': h['close'], 'volume': h['volume'], 'rsi': round(rsi, 2) if rsi else None, 'macd': round(macd, 4) if macd else None, 'macd_signal': round(signal, 4) if signal else None, 'sma_50': round(sma_50, 2) if sma_50 else None, 'sma_200': round(sma_200, 2) if sma_200 else None})
    return jsonify({'analysis': analysis, 'chart_data': chart_data})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/')
def serve_root():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        return {'error': 'Not found'}, 404
    if os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
