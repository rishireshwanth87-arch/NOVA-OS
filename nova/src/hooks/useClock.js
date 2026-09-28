import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export function useClock() {
  const clockFormat = useSettingsStore((s) => s.clockFormat)
  const showClockSeconds = useSettingsStore((s) => s.showClockSeconds)
  const [timeString, setTimeString] = useState('')
  const [dateString, setDateString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()

      let timeOpts = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: clockFormat === '12h',
      }
      if (showClockSeconds) {
        timeOpts.second = '2-digit'
      }

      setTimeString(now.toLocaleTimeString(undefined, timeOpts))
      setDateString(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [clockFormat, showClockSeconds])

  return { timeString, dateString }
}
