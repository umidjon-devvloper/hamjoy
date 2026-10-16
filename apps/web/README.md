This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend (Firebase)

By default the app runs on **mock data** (seed jobs + localStorage). To connect Firebase:

1. Copy `env/production.env.example` → `.env.local` (or use `env/local.env.example` for mock)
2. Add your Firebase `NEXT_PUBLIC_FIREBASE_*` variables
3. In Firebase Console: enable **Email/Password** auth and create a **Firestore** database
4. Deploy security rules from `firebase/firestore.rules`
5. Set `NEXT_PUBLIC_AUTH_PROVIDER=firebase` and restart `npm run dev`

**Collections:** profiles, categories, jobs, favorites, chats (+ messages subcollection), reports, locations.

**Services:** jobs, categories, favorites, chats, auth/profile, reports — all fall back to mock when env vars are unset.

## Admin panel

Mock admin login: `admin@jobmarket.app` (any password).

Routes under `/admin` are protected — only users with `role: 'admin'` can access. Normal users are redirected to `/home`. The admin link appears in Settings for admins only (not in main navigation).

Features: dashboard stats, job moderation (approve/reject/delete), user blocking, reports queue, categories and locations management.

## Production checklist

- Set `NEXT_PUBLIC_SITE_URL` to your production domain
- Deploy Firestore security rules (`firebase/firestore.rules`)
- Set `NEXT_PUBLIC_AUTH_PROVIDER=firebase` for real auth
- Build: `npm run lint && npm run build`
- Start: `npm run start` (or deploy to Vercel)


To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
