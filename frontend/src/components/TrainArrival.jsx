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

function TrainArrival({ arrival, isFirst = false }) {
  const { line, time, destination } = arrival
  const colorClass = LINE_COLORS[line] || 'bg-slate-600'

  // Format time display
  const timeDisplay = time === 0 ? 'Now' : time === 1 ? '1 min' : `${time} mins`

  return (
    <div className={`flex items-center gap-3 py-2 ${isFirst ? '' : 'border-t border-slate-700/50'}`}>
      {/* Line Bullet */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${colorClass} ${!colorClass.includes('text-') ? 'text-white' : ''} flex-shrink-0`}
      >
        {line}
      </div>

      {/* Destination (if available) */}
      <div className="flex-grow min-w-0">
        {destination && (
          <span className="text-slate-400 text-sm truncate block">
            {destination}
          </span>
        )}
      </div>

      {/* Arrival Time */}
      <div className={`text-right flex-shrink-0 ${time <= 1 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
        <span className={`${isFirst ? 'text-lg' : 'text-base'}`}>
          {timeDisplay}
        </span>
      </div>
    </div>
  )
}

export default TrainArrival
