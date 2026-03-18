# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimalist ephemeral file transfer web app. Upload files → get an 8-character code → enter code on another device to download. No auth. Files auto-delete after download or after 5 minutes.

## Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Supabase (Postgres + Storage + Edge Functions)
- **Libraries:** `nanoid` (code generation), `JSZip` (client-side multi-file zipping), `qrcode.js` (QR codes)

## Architecture

### Two frontend pages only
- `/` — Upload page: drag & drop → POST /upload → display code + QR + countdown timer
- `/download` — Download page: enter code → GET /download/:code → show files → download

### Two Supabase Edge Functions
- `POST /upload` — receives multipart files, generates `nanoid(8)` code, uploads to private Storage at `transfers/{code}/{filename}`, inserts into `transfers` table with `expires_at = now() + 5min`
- `GET /download/:code` — validates code (exists + not downloaded + not expired), generates 60s signed URLs, marks `downloaded = true`, returns signed URLs to client

### Database
Single table in Supabase Postgres with RLS enabled (no direct client access):
```sql
CREATE TABLE transfers (
  code         TEXT PRIMARY KEY,
  file_paths   TEXT[],
  expires_at   TIMESTAMPTZ NOT NULL,
  downloaded   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage
Private bucket named `transfers`. Files stored at `transfers/{code}/{filename}`. Never publicly accessible — only via server-generated signed URLs.

### Cleanup
Cron job (every 2 minutes) queries rows where `expires_at < now() OR downloaded = true`, explicitly deletes files from Storage (Supabase does NOT auto-delete storage files when DB rows are deleted), then deletes the DB rows.

## Security Model

- Files only accessible via signed URLs (60s expiry) — never direct
- Rate limit `/download` to 10 req/min per IP to prevent brute force
- 500MB cap per transfer
- nanoid(8) = ~57 quintillion combinations

## Build Order (from plan.md)

1. **Phase 1 (MVP):** Supabase setup → /upload endpoint → /download endpoint → minimal UI
2. **Phase 2 (Polish):** QR code, countdown timer, JSZip multi-file download, mobile responsive
3. **Phase 3 (Hardening):** Rate limiting, server-side file validation, reliable cron, full error states

## Explicitly Out of Scope

No accounts, no file previews, no download history, no password-protected transfers, no analytics.
