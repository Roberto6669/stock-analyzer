import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import ChartView from './components/ChartView'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [picks, setPicks] = useState([])
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopPicks()
  }, [])

  const fetchTopPicks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/top-picks')
      setPicks(response.data.picks)
      setError(null)
    } catch (err) {
      setError('Error al cargar los datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary">
      <header className="border-b border-secondary/50 sticky top-0 z-50 backdrop-blur bg-primary/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent">Stock Analyzer</h1>
            <p className="text-xs text-gray-400">Análisis Técnico en Tiempo Real</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="bg-danger/10 border border-danger/30 rounded p-4 mb-6 text-danger text-sm">{error}</div>}
        {view === 'dashboard' && <Dashboard picks={picks} loading={loading} onSelectTicker={(t) => { setSelectedTicker(t); setView('chart') }} onRefresh={fetchTopPicks} />}
        {view === 'chart' && selectedTicker && <ChartView ticker={selectedTicker} onBack={() => setView('dashboard')} />}
      </main>
    </div>
  )
}