import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { customAlphabet } from 'https://esm.sh/nanoid@5'

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const MAX_TOTAL_BYTES = 500 * 1024 * 1024 // 500 MB
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = new Date()
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS)

  const { data: rl } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('ip', ip)
    .single()

  if (rl && new Date(rl.window_start) > windowStart) {
    if (rl.count >= RATE_LIMIT) {
      return json({ error: 'Too many uploads. Try again later.' }, 429)
    }
    await supabase.from('rate_limits').update({ count: rl.count + 1 }).eq('ip', ip)
  } else {
    await supabase.from('rate_limits').upsert({ ip, count: 1, window_start: now.toISOString() })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return json({ error: 'Invalid form data' }, 400)
  }

  const files = formData.getAll('files') as File[]
  if (files.length === 0) {
    return json({ error: 'No files provided' }, 400)
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_BYTES) {
    return json({ error: 'Total upload size exceeds 500 MB' }, 413)
  }

  const code = nanoid()
  const filePaths: string[] = []

  for (const file of files) {
    const safeName = file.name.replace(/\s+/g, '_')
    const path = `${code}/${safeName}`
    const buffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('transfers')
      .upload(path, buffer, { contentType: file.type })

    if (error) {
      return json({ error: `Storage upload failed: ${error.message}` }, 500)
    }

    filePaths.push(path)
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { error: dbError } = await supabase
    .from('transfers')
    .insert({ code, file_paths: filePaths, expires_at: expiresAt })

  if (dbError) {
    return json({ error: `DB insert failed: ${dbError.message}` }, 500)
  }

  return json({ code }, 200)
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
