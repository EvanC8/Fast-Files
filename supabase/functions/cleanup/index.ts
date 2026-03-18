import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (_req) => {
  const { data: rows, error } = await supabase
    .from('transfers')
    .select('code, file_paths')
    .or(`expires_at.lt.${new Date().toISOString()},downloaded.eq.true`)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ deleted: 0 }), { status: 200 })
  }

  let deleted = 0
  for (const row of rows) {
    const paths = row.file_paths as string[]
    // Delete storage files
    if (paths.length > 0) {
      await supabase.storage.from('transfers').remove(paths)
    }
    // Delete DB row
    await supabase.from('transfers').delete().eq('code', row.code)
    deleted++
  }

  return new Response(JSON.stringify({ deleted }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
