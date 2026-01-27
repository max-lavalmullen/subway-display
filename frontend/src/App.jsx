import { useState, useEffect, useCallback } from 'react'
import StationCard from './components/StationCard'
import AddStationModal from './components/AddStationModal'

function App() {
  const [stations, setStations] = useState([])
  const [arrivals, setArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch configured stations
  const fetchStations = useCallback(async () => {
    try {
      const response = await fetch('/api/stations')
      if (!response.ok) throw new Error('Failed to fetch stations')
      const data = await response.json()
      setStations(data)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // Fetch arrivals for all stations
  const fetchArrivals = useCallback(async () => {
    try {
      const response = await fetch('/api/arrivals')
      if (!response.ok) throw new Error('Failed to fetch arrivals')
      const data = await response.json()
      setArrivals(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchStations()
    fetchArrivals()
  }, [fetchStations, fetchArrivals])

  // Poll for arrivals every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchArrivals, 10000)
    return () => clearInterval(interval)
  }, [fetchArrivals])

  // Add a new station
  const handleAddStation = async (stationData) => {
    try {
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationData)
      })

      if (response.status === 409) {
        throw new Error('Station already added')
      }
      if (!response.ok) throw new Error('Failed to add station')

      await fetchStations()
      await fetchArrivals()
      setIsModalOpen(false)
    } catch (err) {
      throw err
    }
  }

  // Remove a station
  const handleRemoveStation = async (stationUuid) => {
    try {
      const response = await fetch(`/api/stations/${stationUuid}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove station')

      await fetchStations()
      setArrivals(prev => prev.filter(a => a.uuid !== stationUuid))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">NYC Subway Dashboard</h1>
              {lastUpdated && (
                <p className="text-xs text-slate-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Station
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : arrivals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-slate-300 mb-2">No stations added</h2>
            <p className="text-slate-500 mb-6">Add a subway station to start tracking arrivals</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Station
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arrivals.map((station) => (
              <StationCard
                key={station.uuid}
                station={station}
                onRemove={() => handleRemoveStation(station.uuid)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Station Modal */}
      <AddStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStation}
      />
    </div>
  )
}

export default App
