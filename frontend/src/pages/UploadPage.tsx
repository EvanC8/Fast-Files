import { useState } from 'react'
import { Link } from 'react-router-dom'
import DropZone from '../components/DropZone'
import CodeDisplay from '../components/CodeDisplay'
import CountdownTimer from '../components/CountdownTimer'
import { uploadFiles } from '../lib/api'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

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
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <span className="text-white font-semibold tracking-tight">Transfer</span>
        <Link to="/download" className="text-zinc-400 text-sm hover:text-zinc-200 transition-colors">
          Receive files →
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {code ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {expired ? (
                <div className="text-center py-4">
                  <p className="text-zinc-400 text-sm mb-1">These files have expired.</p>
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
                    <h2 className="text-white font-semibold">Ready to share</h2>
                    <CountdownTimer seconds={300} onExpired={() => setExpired(true)} />
                  </div>
                  <CodeDisplay code={code} downloadUrl={downloadUrl} />
                  <button
                    onClick={() => { setCode(null); setFiles([]); setExpired(false) }}
                    className="mt-6 w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
                  >
                    Send more files
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h1 className="text-white font-semibold text-lg mb-1">Send files</h1>
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
