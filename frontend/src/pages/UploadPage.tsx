import { useState } from 'react'
import { Link } from 'react-router-dom'
import DropZone from '../components/DropZone'
import CodeDisplay from '../components/CodeDisplay'
import CountdownTimer from '../components/CountdownTimer'
import { uploadFiles } from '../lib/api'
import { useTheme } from '../hooks/useTheme'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const { isDark, toggle } = useTheme()

  const handleUpload = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const result = await uploadFiles(files)
      setCode(result.code)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadUrl = code ? `${window.location.origin}/download?code=${code}` : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <span className="text-zinc-900 dark:text-white font-semibold tracking-tight">Transfer</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            title="Toggle theme"
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          <Link to="/download" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            Receive files →
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {code ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6">
              {expired ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">These files have expired.</p>
                  <button
                    onClick={() => { setCode(null); setFiles([]); setExpired(false) }}
                    className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Send new files
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-zinc-900 dark:text-white font-semibold">Ready to share</h2>
                    <CountdownTimer seconds={300} onExpired={() => setExpired(true)} />
                  </div>
                  <CodeDisplay code={code} downloadUrl={downloadUrl} />
                  <button
                    onClick={() => { setCode(null); setFiles([]); setExpired(false) }}
                    className="mt-6 w-full text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors py-2"
                  >
                    Send more files
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6">
              <h1 className="text-zinc-900 dark:text-white font-semibold text-lg mb-1">Send files</h1>
              <p className="text-zinc-500 text-sm mb-5">
                Files are deleted after download or 5 minutes — no account needed.
              </p>
              <DropZone files={files} onFilesSelected={setFiles} />
              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || loading}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Uploading…' : `Upload${files.length > 1 ? ` ${files.length} files` : files.length === 1 ? ` ${files[0].name.length > 20 ? 'file' : files[0].name}` : ''}`}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
