# GrowPDF

A Next.js (App Router) book platform — readers, publishers, and admins.

## Deploy to Vercel

1. Push to GitHub (or any Git provider)
2. Import repo into Vercel
3. Set environment variable: `JWT_SECRET=<your-secret>`
4. Deploy — the single `npm run build` command handles both frontend and API

## Local dev

```
npm install
npm run dev   → localhost:3000
```

## Tech stack

- Next.js 15 (App Router), React 19
- Tailwind CSS v4, framer-motion, lucide-react
- pdfjs-dist for in-browser PDF reader
- File‑based JSON DB (swap for Vercel Postgres/KV for production)

## Auth

- Email/password + Google (demo) login
- Roles: reader, publisher, admin
- Disposable email & invalid phone blocked on register

## API routes (all under `/api`)

- `/auth/{register,login,google,me,logout}`
- `/books` — list, featured, new-releases, bestsellers, categories, upload, `[id]`, `[id]/pdf`
- `/files/{thumbnail,pdf}/[filename]`
- `/users/{library,profile}`
- `/admin/{pending,stats,approve/[id],reject/[id]}`
- `/payment/{create-intent,confirm,validate-coupon}`

## Data

`data/database.json` at project root. On Vercel serverless, this resets on cold starts — replace with a real database for production.
