import React from 'react'
import { TrendingUp, TrendingDown, ChevronRight, RefreshCw } from 'lucide-react'

export default function Dashboard({ picks, loading, onSelectTicker, onRefresh }) {
  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Analizando mercado...</div></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Top Picks Técnicos</h2>
          <p className="text-gray-400 text-sm">Basado en RSI, MACD, SMA y Bollinger Bands</p>
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent"><RefreshCw className="w-4 h-4" /><span className="text-sm">Actualizar</span></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {picks.map((pick, idx) => (
          <div key={pick.ticker} onClick={() => onSelectTicker(pick.ticker)} className="group relative overflow-hidden rounded-xl border border-secondary/50 bg-gradient-to-br from-secondary/50 to-primary/50 hover:border-accent/50 hover:shadow-lg cursor-pointer p-6">
            <div className="absolute top-4 right-4 text-xs font-bold text-gray-600">#{idx + 1}</div>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-accent">{pick.ticker}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-white">${pick.precio}</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${pick.cambio_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                    {pick.cambio_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {pick.cambio_pct > 0 ? '+' : ''}{pick.cambio_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Score</span>
                  <span className={`text-lg font-bold ${pick.score >= 65 ? 'text-success' : pick.score <= 35 ? 'text-danger' : 'text-accent'}`}>{pick.score}/100</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2"><div className="h-full bg-gradient-to-r from-danger via-accent to-success" style={{ width: `${Math.min(pick.score, 100)}%` }} /></div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${pick.recomendacion === 'COMPRA' ? 'bg-success/10 border-success/30 text-success' : pick.recomendacion === 'VENTA' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-secondary/50 border-secondary text-gray-400'}`}>{pick.recomendacion}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}