import { useState, useEffect, useCallback } from 'react'

// Line colors matching the physical LED display
const LINE_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
}

const AMBER = '#FFB81C'
const GREY = '#646464'

function LedMatrixView({ isOpen, onClose }) {
  const [arrivals, setArrivals] = useState([])
  const [allArrivals, setAllArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [directionFilter, setDirectionFilter] = useState('all') // 'all', 'N', 'S'

  const fetchData = useCallback(async () => {
    try {
      // Fetch from arrivals endpoint to get direction info
      const res = await fetch('/api/arrivals')
      const data = await res.json()

      // Flatten all arrivals with their direction
      const flattened = []
      data.forEach(station => {
        station.arrivals.forEach(arrival => {
          flattened.push({
            ...arrival,
            direction: station.direction,
            stationName: station.name
          })
        })
      })

      // Sort by time
      flattened.sort((a, b) => a.time - b.time)
      setAllArrivals(flattened)
    } catch (err) {
      console.error('Failed to fetch LED data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter arrivals based on direction
  useEffect(() => {
    let filtered = allArrivals
    if (directionFilter !== 'all') {
      filtered = allArrivals.filter(a => a.direction === directionFilter)
    }
    // Add ranks
    const ranked = filtered.slice(0, 7).map((a, i) => ({ ...a, rank: i + 1 }))
    setArrivals(ranked)
  }, [allArrivals, directionFilter])

  useEffect(() => {
    if (isOpen) {
      fetchData()
      const interval = setInterval(fetchData, 10000)
      return () => clearInterval(interval)
    }
  }, [isOpen, fetchData])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const topTrains = arrivals.slice(0, 2)
  const listTrains = arrivals.slice(2, 6)

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar with close and direction filter */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Direction Filter */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm mr-2">Direction:</span>
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
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-white p-2 transition-colors"
          title="Close (ESC)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* LED Matrix Display */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* Physical frame */}
          <div
            className="bg-[#0a0a0a] rounded-sm"
            style={{
              padding: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
              border: '3px solid #222',
            }}
          >
            {/* LED Panel - 64x32 aspect ratio (2:1) */}
            <div
              className="relative bg-black"
              style={{
                width: 'min(85vw, 640px)',
                height: 'min(42.5vw, 320px)',
                imageRendering: 'pixelated',
              }}
            >
              {/* Pixel grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
                }}
              />

              {/* Content container */}
              <div className="absolute inset-0 flex font-mono">
                {/* LEFT SIDE - Top 2 trains (large) */}
                <div className="flex-1 flex flex-col justify-start" style={{ padding: '2%' }}>
                  {loading ? (
                    <div className="text-red-500 text-lg">Loading...</div>
                  ) : topTrains.length === 0 ? (
                    <div
                      className="font-bold"
                      style={{
                        color: '#FF0000',
                        fontSize: 'min(5vw, 32px)',
                        textShadow: '0 0 8px #FF0000',
                        marginTop: '25%',
                      }}
                    >
                      NO TRAINS
                    </div>
                  ) : (
                    topTrains.map((train, i) => (
                      <div
                        key={i}
                        className="flex items-center"
                        style={{
                          height: '50%',
                          gap: '3%',
                        }}
                      >
                        {/* Rank */}
                        <span
                          className="font-bold"
                          style={{
                            color: GREY,
                            fontSize: 'min(4vw, 24px)',
                            minWidth: '10%',
                          }}
                        >
                          {train.rank}.
                        </span>

                        {/* Line bullet */}
                        <div
                          className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                          style={{
                            width: 'min(8vw, 52px)',
                            height: 'min(8vw, 52px)',
                            backgroundColor: LINE_COLORS[train.line] || '#666',
                            color: ['N', 'Q', 'R', 'W'].includes(train.line) ? '#000' : '#fff',
                            fontSize: 'min(4vw, 24px)',
                            boxShadow: `0 0 10px ${LINE_COLORS[train.line] || '#666'}`,
                          }}
                        >
                          {train.line}
                        </div>

                        {/* Time */}
                        <div className="flex items-baseline">
                          <span
                            className="font-bold"
                            style={{
                              color: AMBER,
                              fontSize: 'min(5vw, 32px)',
                              textShadow: `0 0 8px ${AMBER}`,
                            }}
                          >
                            {train.time}
                          </span>
                          <span
                            style={{
                              color: AMBER,
                              fontSize: 'min(2.5vw, 16px)',
                              marginLeft: '4px',
                              textShadow: `0 0 6px ${AMBER}`,
                            }}
                          >
                            mins
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Divider line */}
                <div
                  className="self-stretch"
                  style={{
                    width: '1px',
                    backgroundColor: '#333',
                    margin: '2% 0',
                  }}
                />

                {/* RIGHT SIDE - List of next trains */}
                <div
                  className="flex flex-col justify-around"
                  style={{
                    width: '35%',
                    padding: '3% 2%',
                  }}
                >
                  {listTrains.map((train, i) => (
                    <div
                      key={i}
                      className="flex items-center"
                      style={{ gap: '6%' }}
                    >
                      {/* Rank */}
                      <span
                        style={{
                          color: GREY,
                          fontSize: 'min(3vw, 18px)',
                          minWidth: '15%',
                          fontWeight: 'bold',
                        }}
                      >
                        {train.rank}
                      </span>

                      {/* Full bullet (circle) - larger */}
                      <div
                        className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          width: 'min(6vw, 36px)',
                          height: 'min(6vw, 36px)',
                          backgroundColor: LINE_COLORS[train.line] || '#666',
                          color: ['N', 'Q', 'R', 'W'].includes(train.line) ? '#000' : '#fff',
                          fontSize: 'min(3vw, 18px)',
                          boxShadow: `0 0 8px ${LINE_COLORS[train.line] || '#666'}`,
                        }}
                      >
                        {train.line}
                      </div>

                      {/* Time */}
                      <span
                        style={{
                          color: AMBER,
                          fontSize: 'min(3.5vw, 20px)',
                          fontWeight: 'bold',
                          textShadow: `0 0 6px ${AMBER}`,
                        }}
                      >
                        {train.time}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="text-center mt-4 text-gray-500 text-sm font-mono">
            64×32 RGB LED Matrix Simulator
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className="text-center pb-6 text-gray-600 text-xs">
        This simulates the physical LED display on your Raspberry Pi • Press ESC to close
      </div>
    </div>
  )
}

export default LedMatrixView
