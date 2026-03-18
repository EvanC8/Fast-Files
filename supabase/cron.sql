select cron.schedule(
  'cleanup-transfers',
  '*/2 * * * *',
  $$
  select net.http_post(
    url := 'https://pcweifcqhjcnngejvaql.supabase.co/functions/v1/cleanup',
    headers := '{}'::jsonb
  )
  $$
);
