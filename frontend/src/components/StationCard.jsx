import { useState } from 'react'
import TrainArrival, { CompactArrival } from './TrainArrival'

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

function StationCard({ station, onRemove, onSetMain, onSetDirection, isMainView = false }) {
  const { name, direction, arrivals, isMain } = station
  const [menuOpen, setMenuOpen] = useState(false)

  const directionLabel = direction === 'N' ? 'Uptown' : direction === 'S' ? 'Downtown' : 'All'

  return (
    <div className={`bg-slate-800/50 rounded-xl border overflow-hidden transition-colors ${
      isMain ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-slate-700/50 hover:border-slate-600'
    }`}>
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          {isMain && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">
              MAIN
            </span>
          )}
          <div>
            <h3 className={`font-bold ${isMainView ? 'text-xl' : 'text-lg'}`}>{name}</h3>
            <span className="text-sm text-slate-400">{directionLabel}</span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 mt-1 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-20 min-w-[160px]">
                {/* Direction toggles */}
                <div className="px-3 py-2 border-b border-slate-600">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Direction</span>
                  <div className="flex gap-1 mt-2">
                    {[
                      { value: 'N', label: 'N' },
                      { value: 'S', label: 'S' },
                      { value: 'all', label: 'Both' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onSetDirection(station.uuid, opt.value)
                          setMenuOpen(false)
                        }}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          direction === opt.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!isMain && (
                  <button
                    onClick={() => {
                      onSetMain(station.uuid)
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-600 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Set as Main
                  </button>
                )}
                {isMain && (
                  <button
                    onClick={() => {
                      onSetMain(null)
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-600 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Unset Main
                  </button>
                )}
                <button
                  onClick={() => {
                    onRemove()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-600 text-red-400 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Arrivals List */}
      <div className="px-4 py-2">
        {arrivals.length === 0 ? (
          <div className="py-6 text-center text-slate-500">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No trains scheduled</p>
          </div>
        ) : isMainView ? (
          // Main view: left side large (3 trains), right side compact list
          <div className="flex gap-4">
            {/* Left - Top 3 trains (larger) */}
            <div className="flex-1">
              {arrivals.slice(0, 3).map((arrival, index) => {
                const arrDirection = direction === 'all' ? arrival.dir : direction
                const dirLabel = arrDirection === 'N' ? 'Uptown' : 'Downtown'

                return (
                  <div key={`${arrival.line}-${arrival.time}-${index}`} className="flex items-center gap-4 py-2">
                    {/* Large bullet */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-3xl flex-shrink-0 ${
                        LINE_COLORS[arrival.line] || 'bg-slate-600'
                      } ${!(LINE_COLORS[arrival.line] || '').includes('text-') ? 'text-white' : ''}`}
                    >
                      {arrival.line}
                    </div>

                    {/* Direction & Destination */}
                    <div className="flex-grow min-w-0">
                      <span className="text-white font-bold text-xl block">
                        {dirLabel}
                      </span>
                      {arrival.destination && (
                        <span className="text-slate-400 text-base truncate block">
                          to {arrival.destination}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <div className={`text-right flex-shrink-0 ${arrival.time <= 1 ? 'text-amber-400' : 'text-slate-200'}`}>
                      <span className="text-3xl font-bold">
                        {arrival.time === 0 ? 'Now' : arrival.time === 1 ? '1 min' : `${arrival.time} mins`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Divider */}
            {arrivals.length > 3 && (
              <div className="w-px bg-slate-700/50 self-stretch" />
            )}

            {/* Right - Rest of trains (with direction) */}
            {arrivals.length > 3 && (
              <div className="w-72 flex flex-col justify-center gap-1">
                {arrivals.slice(3, 9).map((arrival, index) => (
                  <CompactArrival
                    key={`${arrival.line}-${arrival.time}-${index}`}
                    arrival={arrival}
                    showDirection={true}
                    stationDirection={direction}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {arrivals.slice(0, 6).map((arrival, index) => (
              <TrainArrival
                key={`${arrival.line}-${arrival.time}-${index}`}
                arrival={arrival}
                isFirst={index === 0}
                direction={direction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StationCard
