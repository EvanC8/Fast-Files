import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  seconds: number
  onExpired?: () => void
}

export default function CountdownTimer({ seconds, onExpired }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.()
      return
    }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remaining, onExpired])

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const urgent = remaining < 60

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
      urgent
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${urgent ? 'animate-pulse' : ''}`} />
      Expires in {mins}:{secs}
    </div>
  )
}
