import { useState, useMemo } from 'react'

// Line colors
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

// Interesting destinations accessible by subway
const DESTINATIONS = [
  {
    name: "Central Park",
    description: "Iconic 843-acre park with lakes, gardens, and walking paths",
    lines: ["A", "B", "C", "D", "1", "2", "3", "N", "Q", "R", "W"],
    station: "59 St-Columbus Circle or 5 Av/59 St",
    neighborhood: "Midtown/Upper West Side",
    category: "park"
  },
  {
    name: "Brooklyn Bridge",
    description: "Walk across the historic bridge with stunning Manhattan views",
    lines: ["4", "5", "6", "J", "Z"],
    station: "Brooklyn Bridge-City Hall",
    neighborhood: "Lower Manhattan",
    category: "landmark"
  },
  {
    name: "Coney Island",
    description: "Beach, boardwalk, Luna Park amusement rides, and Nathan's hot dogs",
    lines: ["D", "F", "N", "Q"],
    station: "Coney Island-Stillwell Av",
    neighborhood: "Brooklyn",
    category: "beach"
  },
  {
    name: "The Met (Metropolitan Museum of Art)",
    description: "World-class art museum with 2 million works spanning 5,000 years",
    lines: ["4", "5", "6"],
    station: "86 St",
    neighborhood: "Upper East Side",
    category: "museum"
  },
  {
    name: "Times Square",
    description: "Bright lights, Broadway theaters, and iconic NYC energy",
    lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "S"],
    station: "Times Sq-42 St",
    neighborhood: "Midtown",
    category: "landmark"
  },
  {
    name: "Williamsburg",
    description: "Trendy neighborhood with vintage shops, cafes, and street art",
    lines: ["L", "G", "J", "M"],
    station: "Bedford Av or Lorimer St",
    neighborhood: "Brooklyn",
    category: "neighborhood"
  },
  {
    name: "DUMBO",
    description: "Cobblestone streets, waterfront parks, and Manhattan Bridge views",
    lines: ["F", "A", "C"],
    station: "York St or High St",
    neighborhood: "Brooklyn",
    category: "neighborhood"
  },
  {
    name: "Flushing",
    description: "Amazing Chinese and Asian food, vibrant markets",
    lines: ["7"],
    station: "Flushing-Main St",
    neighborhood: "Queens",
    category: "food"
  },
  {
    name: "Rockaway Beach",
    description: "NYC's only beach accessible by subway, great for surfing",
    lines: ["A"],
    station: "Rockaway Beach stations",
    neighborhood: "Queens",
    category: "beach"
  },
  {
    name: "The Cloisters",
    description: "Medieval art museum in Fort Tryon Park with Hudson River views",
    lines: ["A"],
    station: "190 St",
    neighborhood: "Washington Heights",
    category: "museum"
  },
  {
    name: "High Line",
    description: "Elevated park built on former railway with art installations",
    lines: ["A", "C", "E", "L", "1", "2", "3", "7"],
    station: "14 St or 34 St-Hudson Yards",
    neighborhood: "Chelsea",
    category: "park"
  },
  {
    name: "Chinatown",
    description: "Authentic dim sum, markets, and cultural landmarks",
    lines: ["J", "Z", "N", "Q", "R", "W", "6", "B", "D"],
    station: "Canal St",
    neighborhood: "Manhattan",
    category: "food"
  },
  {
    name: "Bronx Zoo",
    description: "One of the world's largest urban zoos with 6,000+ animals",
    lines: ["2", "5"],
    station: "East Tremont Av / West Farms Sq",
    neighborhood: "The Bronx",
    category: "attraction"
  },
  {
    name: "Prospect Park",
    description: "Brooklyn's 585-acre park with lakes, meadows, and a zoo",
    lines: ["B", "Q", "S", "2", "3", "F", "G"],
    station: "Prospect Park or Grand Army Plaza",
    neighborhood: "Brooklyn",
    category: "park"
  },
  {
    name: "Arthur Avenue (Little Italy of the Bronx)",
    description: "Authentic Italian delis, bakeries, and restaurants",
    lines: ["B", "D"],
    station: "Fordham Rd",
    neighborhood: "The Bronx",
    category: "food"
  },
  {
    name: "Greenwich Village",
    description: "Historic neighborhood with jazz clubs, comedy venues, and Washington Square Park",
    lines: ["A", "B", "C", "D", "E", "F", "M", "1"],
    station: "W 4 St-Washington Sq",
    neighborhood: "Manhattan",
    category: "neighborhood"
  },
  {
    name: "MoMA (Museum of Modern Art)",
    description: "World-renowned modern and contemporary art collection",
    lines: ["E", "M", "B", "D", "F"],
    station: "5 Av/53 St or 47-50 Sts-Rockefeller Ctr",
    neighborhood: "Midtown",
    category: "museum"
  },
  {
    name: "Smorgasburg",
    description: "Outdoor food market with 100+ vendors (weekends)",
    lines: ["L", "G"],
    station: "Bedford Av",
    neighborhood: "Williamsburg, Brooklyn",
    category: "food"
  },
]

const CATEGORY_ICONS = {
  park: "🌳",
  landmark: "🏛️",
  beach: "🏖️",
  museum: "🎨",
  neighborhood: "🏘️",
  food: "🍜",
  attraction: "🎡",
}

const ALL_LINES = ["1", "2", "3", "4", "5", "6", "7", "A", "B", "C", "D", "E", "F", "G", "J", "L", "M", "N", "Q", "R", "W", "Z"]

function LineBullet({ line, selected, onClick }) {
  const bgColor = LINE_COLORS[line] || '#808183'
  const textColor = ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
        selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'opacity-50 hover:opacity-75'
      }`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {line}
    </button>
  )
}

function DestinationCard({ destination, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{CATEGORY_ICONS[destination.category] || "📍"}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-white">{destination.name}</h4>
          <p className="text-slate-400 text-sm mb-2">{destination.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {destination.lines.slice(0, 6).map(line => (
              <span
                key={line}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: LINE_COLORS[line] || '#808183',
                  color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'
                }}
              >
                {line}
              </span>
            ))}
            {destination.lines.length > 6 && (
              <span className="text-slate-500 text-xs self-center ml-1">+{destination.lines.length - 6}</span>
            )}
          </div>
          <p className="text-slate-500 text-xs">
            📍 {destination.station} • {destination.neighborhood}
          </p>
        </div>
      </div>
    </button>
  )
}

function RouteExplorer({ isOpen, onClose }) {
  const [selectedLines, setSelectedLines] = useState(new Set())
  const [selectedDestination, setSelectedDestination] = useState(null)

  const toggleLine = (line) => {
    setSelectedLines(prev => {
      const next = new Set(prev)
      if (next.has(line)) {
        next.delete(line)
      } else {
        next.add(line)
      }
      return next
    })
    setSelectedDestination(null)
  }

  const matchingDestinations = useMemo(() => {
    if (selectedLines.size === 0) return DESTINATIONS

    return DESTINATIONS.filter(dest =>
      dest.lines.some(line => selectedLines.has(line))
    ).sort((a, b) => {
      // Sort by number of matching lines
      const aMatches = a.lines.filter(l => selectedLines.has(l)).length
      const bMatches = b.lines.filter(l => selectedLines.has(l)).length
      return bMatches - aMatches
    })
  }, [selectedLines])

  const suggestRandom = () => {
    const destinations = selectedLines.size > 0 ? matchingDestinations : DESTINATIONS
    const random = destinations[Math.floor(Math.random() * destinations.length)]
    setSelectedDestination(random)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Route Explorer</h2>
            <p className="text-slate-400 text-sm">Pick lines you want to ride, find somewhere to go</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Line Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-300">Select lines you want to ride</h3>
              {selectedLines.size > 0 && (
                <button
                  onClick={() => setSelectedLines(new Set())}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_LINES.map(line => (
                <LineBullet
                  key={line}
                  line={line}
                  selected={selectedLines.has(line)}
                  onClick={() => toggleLine(line)}
                />
              ))}
            </div>
          </div>

          {/* Random Button */}
          <div className="mb-6">
            <button
              onClick={suggestRandom}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Surprise Me!
            </button>
          </div>

          {/* Selected Destination */}
          {selectedDestination && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{CATEGORY_ICONS[selectedDestination.category]}</span>
                <h3 className="font-bold text-xl text-white">Go to {selectedDestination.name}!</h3>
              </div>
              <p className="text-slate-300 mb-3">{selectedDestination.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedDestination.lines.map(line => (
                  <span
                    key={line}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedLines.has(line) ? 'ring-2 ring-white' : ''
                    }`}
                    style={{
                      backgroundColor: LINE_COLORS[line] || '#808183',
                      color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <p><strong>Station:</strong> {selectedDestination.station}</p>
                <p><strong>Area:</strong> {selectedDestination.neighborhood}</p>
              </div>
            </div>
          )}

          {/* Destinations List */}
          <div>
            <h3 className="font-medium text-slate-300 mb-3">
              {selectedLines.size > 0
                ? `${matchingDestinations.length} destinations on your lines`
                : 'All destinations'}
            </h3>
            <div className="space-y-3">
              {matchingDestinations.map(dest => (
                <DestinationCard
                  key={dest.name}
                  destination={dest}
                  onSelect={() => setSelectedDestination(dest)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteExplorer
