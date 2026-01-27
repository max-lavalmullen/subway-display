import TrainArrival from './TrainArrival'

function StationCard({ station, onRemove }) {
  const { name, direction, arrivals } = station

  const directionLabel = direction === 'N' ? 'Uptown' : 'Downtown'

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <span className="text-sm text-slate-400">{directionLabel}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
          title="Remove station"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
        ) : (
          <div className="divide-y divide-slate-700/30">
            {arrivals.slice(0, 6).map((arrival, index) => (
              <TrainArrival
                key={`${arrival.line}-${arrival.time}-${index}`}
                arrival={arrival}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StationCard
