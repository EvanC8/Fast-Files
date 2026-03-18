import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import JSZip from 'jszip'
import { downloadFiles } from '../lib/api'

export default function DownloadPage() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [result, setResult] = useState<{ signedUrls: string[]; filenames: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zipping, setZipping] = useState(false)

  const handleDownload = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await downloadFiles(code.trim().toUpperCase())
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const downloadAll = async () => {
    if (!result) return
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(
        result.signedUrls.map(async (url, i) => {
          const res = await fetch(url)
          const blob = await res.blob()
          zip.file(result.filenames[i], blob)
        })
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'transfer.zip'
      a.click()
    } finally {
      setZipping(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <span className="text-white font-semibold tracking-tight">Transfer</span>
        <Link to="/" className="text-zinc-400 text-sm hover:text-zinc-200 transition-colors">
          ← Send files
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h1 className="text-white font-semibold text-lg mb-1">Receive files</h1>
            <p className="text-zinc-500 text-sm mb-5">Enter the 8-character code to download.</p>

            {/* Code input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                placeholder="XXXXXXXX"
                maxLength={8}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[0.2em] text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors uppercase"
              />
              <button
                onClick={handleDownload}
                disabled={!code.trim() || loading}
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Get'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* File list */}
            {result && (
              <div className="mt-5">
                <p className="text-zinc-500 text-xs mb-3">
                  {result.filenames.length} file{result.filenames.length !== 1 ? 's' : ''} ready to download
                </p>
                <ul className="space-y-2">
                  {result.signedUrls.map((url, i) => (
                    <li key={i} className="flex items-center gap-3 bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-sm text-zinc-200 truncate flex-1">{result.filenames[i]}</span>
                      <a
                        href={url}
                        download={result.filenames[i]}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium shrink-0 transition-colors"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
                {result.filenames.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={zipping}
                    className="mt-3 w-full py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                  >
                    {zipping ? 'Zipping…' : 'Download all as ZIP'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
