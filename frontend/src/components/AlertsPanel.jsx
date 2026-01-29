import { useState } from 'react'

// Line colors for subway bullets
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
  'S': '#808183',
  'SIR': '#0039A6',
}

// Severity styling
const SEVERITY_STYLES = {
  major: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: 'text-red-400',
    badge: 'bg-red-500',
  },
  minor: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    icon: 'text-amber-400',
    badge: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
    badge: 'bg-blue-500',
  },
}

function LineBullet({ line }) {
  const bgColor = LINE_COLORS[line] || '#808183'
  const textColor = ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff'

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {line}
    </span>
  )
}

function AlertCard({ alert, isExpanded, onToggle }) {
  const severity = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info

  return (
    <div className={`${severity.bg} border ${severity.border} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-white/5 transition-colors"
      >
        {/* Severity Icon */}
        <div className={`${severity.icon} mt-0.5 flex-shrink-0`}>
          {alert.severity === 'major' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : alert.severity === 'minor' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Line bullets */}
          <div className="flex flex-wrap gap-1 mb-2">
            {alert.routes.map(route => (
              <LineBullet key={route} line={route} />
            ))}
          </div>

          {/* Header text */}
          <p className="text-sm text-white font-medium leading-snug">
            {alert.header}
          </p>
        </div>

        {/* Expand/collapse indicator */}
        <div className="text-slate-400 flex-shrink-0">
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded description */}
      {isExpanded && alert.description && (
        <div className="px-4 pb-4 pt-0">
          <div className="pl-8 border-l-2 border-slate-600 ml-2">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {alert.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertsPanel({ alerts }) {
  const [expandedAlerts, setExpandedAlerts] = useState(new Set())
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (!alerts || alerts.length === 0) {
    return null
  }

  const toggleAlert = (alertId) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev)
      if (next.has(alertId)) {
        next.delete(alertId)
      } else {
        next.add(alertId)
      }
      return next
    })
  }

  // Count alerts by severity
  const majorCount = alerts.filter(a => a.severity === 'major').length
  const minorCount = alerts.filter(a => a.severity === 'minor').length
  const infoCount = alerts.filter(a => a.severity === 'info').length

  return (
    <div className="mb-6">
      {/* Panel Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3 mb-3 border border-slate-700/50 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="font-medium">Service Alerts</span>

          {/* Severity badges */}
          <div className="flex gap-2">
            {majorCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {majorCount}
              </span>
            )}
            {minorCount > 0 && (
              <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                {minorCount}
              </span>
            )}
            {infoCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {infoCount}
              </span>
            )}
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Alerts List */}
      {!isCollapsed && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isExpanded={expandedAlerts.has(alert.id)}
              onToggle={() => toggleAlert(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsPanel
