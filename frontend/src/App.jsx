import { useState, useEffect, useCallback } from 'react'
import StationCard from './components/StationCard'
import AddStationModal from './components/AddStationModal'
import AlertsPanel from './components/AlertsPanel'
import RouteExplorer from './components/RouteExplorer'
import LedMatrixView from './components/LedMatrixView'

function App() {
  const [stations, setStations] = useState([])
  const [arrivals, setArrivals] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)
  const [isLedViewOpen, setIsLedViewOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [directionFilter, setDirectionFilter] = useState('all') // 'all', 'N', 'S'

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

  // Fetch service alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchStations()
    fetchArrivals()
    fetchAlerts()
  }, [fetchStations, fetchArrivals, fetchAlerts])

  // Poll for arrivals every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchArrivals()
      fetchAlerts()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchArrivals, fetchAlerts])

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

  // Set or unset main station
  const handleSetMain = async (stationUuid) => {
    try {
      if (stationUuid) {
        // Set as main
        const response = await fetch(`/api/stations/${stationUuid}/main`, {
          method: 'POST'
        })
        if (!response.ok) throw new Error('Failed to set main station')
      } else {
        // Unset main - find current main and unset it
        const mainStation = arrivals.find(a => a.isMain)
        if (mainStation) {
          const response = await fetch(`/api/stations/${mainStation.uuid}/main`, {
            method: 'DELETE'
          })
          if (!response.ok) throw new Error('Failed to unset main station')
        }
      }
      await fetchArrivals()
    } catch (err) {
      setError(err.message)
    }
  }

  // Set station direction
  const handleSetDirection = async (stationUuid, direction) => {
    try {
      const response = await fetch(`/api/stations/${stationUuid}/direction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      if (!response.ok) throw new Error('Failed to set direction')
      await fetchArrivals()
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter by direction then separate main station from others
  const filteredArrivals = directionFilter === 'all'
    ? arrivals
    : arrivals.filter(a => a.direction === directionFilter)
  const mainStation = filteredArrivals.find(a => a.isMain)
  const otherStations = filteredArrivals.filter(a => !a.isMain)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

            {/* Direction Filter */}
            <div className="hidden sm:flex items-center gap-1 ml-4">
              {[
                { value: 'all', label: 'All' },
                { value: 'N', label: 'Uptown' },
                { value: 'S', label: 'Downtown' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDirectionFilter(opt.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    directionFilter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLedViewOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              title="LED Matrix View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">LED</span>
            </button>
            <button
              onClick={() => setIsExplorerOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="hidden sm:inline">Explore</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Station</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Service Alerts */}
        <AlertsPanel alerts={alerts} />

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
        ) : filteredArrivals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-slate-300 mb-2">
              No {directionFilter === 'N' ? 'Uptown' : 'Downtown'} stations
            </h2>
            <p className="text-slate-500 mb-6">Add a station with this direction or change the filter</p>
            <button
              onClick={() => setDirectionFilter('all')}
              className="bg-slate-600 hover:bg-slate-500 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Show All Directions
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Station - Full Width */}
            {mainStation && (
              <StationCard
                key={mainStation.uuid}
                station={mainStation}
                onRemove={() => handleRemoveStation(mainStation.uuid)}
                onSetMain={handleSetMain}
                onSetDirection={handleSetDirection}
                isMainView={true}
              />
            )}

            {/* Other Stations - Grid */}
            {otherStations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherStations.map((station) => (
                  <StationCard
                    key={station.uuid}
                    station={station}
                    onRemove={() => handleRemoveStation(station.uuid)}
                    onSetMain={handleSetMain}
                    onSetDirection={handleSetDirection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Station Modal */}
      <AddStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStation}
      />

      {/* Route Explorer Modal */}
      <RouteExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />

      {/* LED Matrix View */}
      <LedMatrixView
        isOpen={isLedViewOpen}
        onClose={() => setIsLedViewOpen(false)}
      />
    </div>
  )
}

export default App
