# Fast Files

A minimalist ephemeral file transfer app. Upload files, get an 8-character code, enter the code on any other device to download. No account needed. Files auto-delete after download or after 5 minutes.

## Stack

- React + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage + Edge Functions)
- Vite

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Run the dev server:
   ```
   npm run dev
   ```

## Pages

- `/` — Upload page: drag & drop files → get a code + QR code
- `/download` — Download page: enter code → download files
