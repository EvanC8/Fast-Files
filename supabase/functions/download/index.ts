import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const url = new URL(req.url)
  // URL pattern: /download/:code
  const parts = url.pathname.split('/')
  const code = parts[parts.length - 1]?.toUpperCase()

  if (!code || code.length !== 8) {
    return json({ error: 'Invalid code' }, 400)
  }

  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) {
    return json({ error: 'Invalid or expired code' }, 404)
  }

  if (data.downloaded) {
    return json({ error: 'Invalid or expired code' }, 404)
  }

  if (new Date(data.expires_at) < new Date()) {
    return json({ error: 'Invalid or expired code' }, 404)
  }

  // Generate signed URLs (60 second expiry)
  const signedUrls: string[] = []
  const filenames: string[] = []

  for (const filePath of data.file_paths as string[]) {
    const { data: signed, error: signError } = await supabase.storage
      .from('transfers')
      .createSignedUrl(filePath, 60)

    if (signError || !signed) {
      return json({ error: 'Failed to generate download URL' }, 500)
    }

    signedUrls.push(signed.signedUrl)
    filenames.push(filePath.split('/').pop()!)
  }

  // Mark as downloaded and delete files from storage
  await supabase.from('transfers').update({ downloaded: true }).eq('code', code)
  await supabase.storage.from('transfers').remove(data.file_paths as string[])
  await supabase.from('transfers').delete().eq('code', code)

  return json({ signedUrls, filenames }, 200)
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
