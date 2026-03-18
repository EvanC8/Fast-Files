import { useCallback, useState } from 'react'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  files: File[]
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DropZone({ onFilesSelected, files }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = Array.from(e.dataTransfer.files)
      if (dropped.length > 0) onFilesSelected(dropped)
    },
    [onFilesSelected]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
      className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100/40 dark:bg-zinc-800/40 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
      }`}
    >
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? [])
          if (selected.length > 0) onFilesSelected(selected)
        }}
      />
      {files.length === 0 ? (
        <div className="flex items-center justify-center gap-2.5 py-8 px-6">
          <svg
            className={`w-4 h-4 shrink-0 transition-colors ${dragging ? 'text-indigo-400' : 'text-zinc-500'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className={`text-sm transition-colors ${dragging ? 'text-indigo-300' : 'text-zinc-400'}`}>
            Drop files here or <span className="text-zinc-700 dark:text-zinc-300">click to browse</span>
          </p>
          <span className="text-zinc-400 dark:text-zinc-700 text-xs">· 500 MB max</span>
        </div>
      ) : (
        <div className="p-3 space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-200 truncate flex-1">{f.name}</span>
              <span className="text-xs text-zinc-500 shrink-0">{formatSize(f.size)}</span>
            </div>
          ))}
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center pt-1 pb-1">Click to add more files</p>
        </div>
      )}
    </div>
  )
}
