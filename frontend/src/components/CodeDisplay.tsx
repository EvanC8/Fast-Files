import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface CodeDisplayProps {
  code: string
  downloadUrl: string
}

export default function CodeDisplay({ code, downloadUrl }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, downloadUrl, { width: 160, margin: 2 })
    }
  }, [downloadUrl])

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Code row */}
      <div className="w-full flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-4">
        <span className="flex-1 text-center text-4xl font-bold tracking-[0.25em] font-mono text-white">
          {code}
        </span>
        <button
          onClick={copy}
          title="Copy code"
          className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          {copied ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
        </button>
      </div>

      {/* QR code */}
      <div className="flex flex-col items-center gap-2">
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <canvas ref={canvasRef} />
        </div>
        <p className="text-zinc-600 text-xs">Scan on another device</p>
      </div>
    </div>
  )
}
