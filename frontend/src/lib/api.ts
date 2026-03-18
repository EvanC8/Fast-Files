const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function uploadFiles(files: File[]): Promise<{ code: string }> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const res = await fetch(`${FUNCTIONS_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Upload failed')
  }

  return res.json()
}

export async function downloadFiles(code: string): Promise<{
  signedUrls: string[]
  filenames: string[]
}> {
  const res = await fetch(`${FUNCTIONS_URL}/download/${code}`, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Download failed')
  }

  return res.json()
}
