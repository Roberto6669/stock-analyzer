# Deploy en Render.com

## Paso 1: Render Web Service

1. Ir a render.com y crear Web Service
2. Conectar repo: `stock-analyzer`
3. Configurar:
   - **Build Command**: `chmod +x build.sh && ./build.sh && pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**:
     - `FMP_API_KEY`: tu clave de FMP
     - `FLASK_ENV`: production

4. Click "Create" → Esperar 2-3 min hasta "Live"

## Obtener FMP_API_KEY

1. financialmodelingprep.com
2. Sign up (free: 250 req/día)
3. Copy API key
4. Pegar en Render

## Test

```bash
curl https://stock-analyzer-xxxx.onrender.com/api/health
```
