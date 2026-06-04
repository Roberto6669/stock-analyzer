import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'

export default function ChartView({ ticker, onBack }) {
  const [analysis, setAnalysis] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('price')

  useEffect(() => {
    axios.get(`/api/analyze/${ticker}`).then(r => {
      setAnalysis(r.data.analysis)
      setChartData(r.data.chart_data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [ticker])

  if (loading) return <div className="text-gray-400">Cargando...</div>
  if (!analysis) return <div className="text-danger">Error</div>

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4"><ArrowLeft className="w-4 h-4" /><span className="text-sm">Volver</span></button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-secondary/50 bg-secondary/30 p-6">
          <h1 className="text-4xl font-bold text-accent mb-4">{ticker}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">${analysis.precio}</span>
            <span className={`text-xl font-semibold flex items-center gap-1 ${analysis.cambio_pct >= 0 ? 'text-success' : 'text-danger'}`}>
              {analysis.cambio_pct >= 0 ? <TrendingUp /> : <TrendingDown />}
              {analysis.cambio_pct > 0 ? '+' : ''}{analysis.cambio_pct.toFixed(2)}%
            </span>
          </div>
          <div className="mt-4 border-t border-secondary/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Score Técnico</span>
              <span className="text-2xl font-bold text-accent">{analysis.score}/100</span>
            </div>
            <div className="w-full bg-primary/50 rounded-full h-3"><div className="h-full bg-gradient-to-r from-danger via-accent to-success" style={{ width: `${analysis.score}%` }} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-secondary/50 bg-secondary/30 p-4"><div className="text-xs text-gray-400 uppercase mb-2">RSI</div><div className="text-2xl font-bold text-accent">{analysis.indicadores.rsi?.toFixed(1)}</div></div>
          <div className="rounded-xl border border-secondary/50 bg-secondary/30 p-4"><div className="text-xs text-gray-400 uppercase mb-2">MACD</div><div className={`text-2xl font-bold ${analysis.indicadores.macd_direction === 'bullish' ? 'text-success' : 'text-danger'}`}>{analysis.indicadores.macd_direction === 'bullish' ? '↑' : '↓'}</div></div>
        </div>
      </div>
      <div className="mb-6 flex gap-2 border-b border-secondary/50">
        {['price', 'rsi', 'macd'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-gray-400'}`}>{tab === 'price' ? 'Precio' : tab.toUpperCase()}</button>)}
      </div>
      {chartData.length > 0 && (
        <div className="rounded-xl border border-secondary/50 bg-secondary/20 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              {activeTab === 'price' && <>
                <Line type="monotone" dataKey="sma_50" stroke="#fbbf24" dot={false} name="SMA 50" />
                <Line type="monotone" dataKey="sma_200" stroke="#10b981" dot={false} name="SMA 200" />
              </>}
              {activeTab === 'rsi' && <Line type="monotone" dataKey="rsi" stroke="#fbbf24" dot={false} name="RSI" />}
              {activeTab === 'macd' && <>
                <Line type="monotone" dataKey="macd" stroke="#fbbf24" dot={false} name="MACD" />
                <Line type="monotone" dataKey="macd_signal" stroke="#10b981" dot={false} name="Signal" />
              </>}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}