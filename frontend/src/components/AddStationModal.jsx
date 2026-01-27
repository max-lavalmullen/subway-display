import { useState, useEffect, useRef } from 'react'

// Line color mapping for display
const LINE_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'S': '#808183',
}

function AddStationModal({ isOpen, onClose, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [direction, setDirection] = useState('N')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSearchQuery('')
      setSearchResults([])
      setSelectedStation(null)
      setDirection('N')
      setError(null)
    }
  }, [isOpen])

  // Search stations
  useEffect(() => {
    const searchStations = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      try {
        const response = await fetch(`/api/stations/available?q=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setSearchResults(data)
      } catch (err) {
        console.error('Search error:', err)
      }
    }

    const debounce = setTimeout(searchStations, 200)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSubmit = async () => {
    if (!selectedStation) return

    setLoading(true)
    setError(null)

    try {
      await onAdd({
        id: selectedStation.id,
        direction,
        name: selectedStation.name
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">Add Station</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Station Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search Station
            </label>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedStation(null)
              }}
              placeholder="e.g., 96 St, Times Sq, Union Sq..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedStation && (
            <div className="max-h-48 overflow-y-auto bg-slate-900 rounded-lg border border-slate-600">
              {searchResults.map((station) => (
                <button
                  key={station.id}
                  onClick={() => {
                    setSelectedStation(station)
                    setSearchQuery(station.name)
                    setSearchResults([])
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between border-b border-slate-700/50 last:border-0"
                >
                  <span>{station.name}</span>
                  <div className="flex gap-1">
                    {station.lines?.map((line) => (
                      <span
                        key={line}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: LINE_COLORS[line] || '#666',
                          color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'
                        }}
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Station Display */}
          {selectedStation && (
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedStation.name}</p>
                  <p className="text-sm text-slate-400">ID: {selectedStation.id}</p>
                </div>
                <div className="flex gap-1">
                  {selectedStation.lines?.map((line) => (
                    <span
                      key={line}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: LINE_COLORS[line] || '#666',
                        color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Direction Selection */}
          {selectedStation && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDirection('N')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    direction === 'N'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Uptown / North
                </button>
                <button
                  onClick={() => setDirection('S')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    direction === 'S'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Downtown / South
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStation || loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? 'Adding...' : 'Add Station'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddStationModal
