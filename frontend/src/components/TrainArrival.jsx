// Line color mapping
const LINE_COLORS = {
  '1': 'bg-[#EE352E]',
  '2': 'bg-[#EE352E]',
  '3': 'bg-[#EE352E]',
  '4': 'bg-[#00933C]',
  '5': 'bg-[#00933C]',
  '6': 'bg-[#00933C]',
  '7': 'bg-[#B933AD]',
  'A': 'bg-[#0039A6]',
  'C': 'bg-[#0039A6]',
  'E': 'bg-[#0039A6]',
  'B': 'bg-[#FF6319]',
  'D': 'bg-[#FF6319]',
  'F': 'bg-[#FF6319]',
  'M': 'bg-[#FF6319]',
  'N': 'bg-[#FCCC0A] text-black',
  'Q': 'bg-[#FCCC0A] text-black',
  'R': 'bg-[#FCCC0A] text-black',
  'W': 'bg-[#FCCC0A] text-black',
  'G': 'bg-[#6CBE45]',
  'J': 'bg-[#996633]',
  'Z': 'bg-[#996633]',
  'L': 'bg-[#A7A9AC]',
  'S': 'bg-[#808183]',
  'SIR': 'bg-[#0039A6]',
}

// Hex colors for CompactArrival
const LINE_COLORS_HEX = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183',
  'SIR': '#0039A6',
}

function TrainArrival({ arrival, isFirst = false, direction, isLarge = false }) {
  const { line, time, destination, dir } = arrival
  const colorClass = LINE_COLORS[line] || 'bg-slate-600'

  // Format time display
  const timeDisplay = time === 0 ? 'Now' : time === 1 ? '1 min' : `${time} mins`

  // Direction label - use arrival's dir if station is set to "all"
  const actualDirection = direction === 'all' ? dir : direction
  const directionLabel = actualDirection === 'N' ? 'Uptown' : 'Downtown'

  if (isLarge) {
    return (
      <div className={`flex items-center gap-4 py-3 ${isFirst ? '' : ''}`}>
        {/* Line Bullet - larger */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${colorClass} ${!colorClass.includes('text-') ? 'text-white' : ''} flex-shrink-0`}
        >
          {line}
        </div>

        {/* Direction & Destination */}
        <div className="flex-grow min-w-0">
          <span className="text-white font-semibold text-lg block">
            {directionLabel}
          </span>
          {destination && (
            <span className="text-slate-400 text-sm truncate block">
              to {destination}
            </span>
          )}
        </div>

        {/* Arrival Time - larger */}
        <div className={`text-right flex-shrink-0 ${time <= 1 ? 'text-amber-400' : 'text-slate-200'}`}>
          <span className="text-3xl font-bold">
            {timeDisplay}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 py-3 ${isFirst ? '' : 'border-t border-slate-700/50'}`}>
      {/* Line Bullet */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${colorClass} ${!colorClass.includes('text-') ? 'text-white' : ''} flex-shrink-0`}
      >
        {line}
      </div>

      {/* Direction & Destination */}
      <div className="flex-grow min-w-0">
        <span className="text-white font-medium text-base block">
          {directionLabel}
        </span>
        {destination && (
          <span className="text-slate-400 text-sm truncate block">
            to {destination}
          </span>
        )}
      </div>

      {/* Arrival Time */}
      <div className={`text-right flex-shrink-0 ${time <= 1 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
        <span className={`${isFirst ? 'text-2xl' : 'text-lg'} font-semibold`}>
          {timeDisplay}
        </span>
      </div>
    </div>
  )
}

// Compact arrival for the right side of main station view
export function CompactArrival({ arrival, showDirection = false, stationDirection = null }) {
  const { line, time, dir } = arrival
  const bgColor = LINE_COLORS_HEX[line] || '#666'
  const textColor = ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'

  // Determine direction from arrival's dir (for "all" mode) or station direction
  const actualDir = stationDirection === 'all' ? dir : stationDirection
  const dirLabel = actualDir === 'N' ? 'Uptown' : 'Downtown'
  const timeText = time === 0 ? 'Now' : `${time} min`

  return (
    <div className="flex items-center py-1">
      {/* Bullet - close to divider */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {line}
      </div>

      {/* Text centered in remaining space */}
      <div className="flex-1 text-center">
        <span className={`text-base font-bold tracking-wide ${time <= 1 ? 'text-amber-400' : 'text-slate-200'}`}>
          {showDirection ? `${dirLabel} - ${timeText}` : timeText}
        </span>
      </div>
    </div>
  )
}

export default TrainArrival
