# Loomboard Frontend — SPMS student/mentor/admin app

Vite + React 19 single-page app for the Student Project Management System: marketing landing, auth, student/mentor profile setup with photo upload, group browsing + join requests, realtime team and mentor chat, progress submission, a notification center, and an admin dashboard. Neo-brutalist paper design, zero webfonts, route-split bundles.

Backend companion: `../SPMS-BACKEND` (must run on `:5000`).

---

## Features

### Landing (`/`)

- Sticky nav, hero with corkboard-grid panel (mentor + group pin cards, SVG threads, gold note), features, 4-step how-it-works, mentor/student audience cards, testimonials, CTA, footer
- Instant render — no scroll-reveal gating, no webfonts, no blur

### Auth (`/login`, `/register`)

- Student/mentor role toggle (no admin signup exists anywhere), show/hide password, confirm-password check
- Live API wiring: `POST /api/auth/register|login`, token persisted + `Authorization: Bearer` fallback alongside the httpOnly cookie
- Smart redirects: students → profile setup, mentors → profile setup, admins → `/admin`, deep-link `from` preserved

### Profiles (`/profile/student`, `/profile/mentor`)

- Student: roll number, branch, section, semester (+ email prefilled, readonly)
- Mentor: designation, department, bio (220 chars) + "awaiting approval" badge
- Square photo upload (`multipart/form-data` field `photo`, ≤ 5 MB, preview) → Cloudinary via backend; edit path uses `PUT /me`
- Route guards force completion before groups (`RequireProfile`)

### Groups hub (`/groups`, students & mentors)

- **Browse**: paginated group cards (mentor, occupancy, status), search, detail drawer, request-to-join (one-group/duplicate/full errors surfaced)
- **My group** (students): team roster, realtime group chat (socket + older-message paging), progress submit + feedback feed
- **Mentor chat**: paginated approved-mentor directory + direct socket chat with quick chips
- Pending mentors see an approval wall; admins are redirected out (no chat for admin)

### Notifications (all roles)

- Header bell with unread badge, dropdown panel (labels per type, relative times, unread highlighting), mark-one / mark-all-read, older paging
- Realtime socket `notify` prepend + 30s polling fallback; type-aware navigation (requests → Groups, reviews → My group)

### Admin (`/admin`, `role === "admin"` only)

- Metrics wall with **registered-vs-verified splits** (`6 registered · 1 verified · 5 unverified` style), pending queue, projects stats
- Approve / reject mentors (reject with reason), all-users tables (incl. profile-less accounts) with verification pills, All/Verified/Unverified tabs, block/unblock
- Group progress viewer with mentor feedback + private remarks (admin sees `remark`; students never do)

---

## Tech stack

| Layer | Choice |
|---|---|
| Build / framework | Vite 8, React 19, React Router 7 (all routes lazy except landing) |
| Data | Hand-rolled `fetch` wrapper (`src/lib/api.js`, axios-shaped errors, `credentials: "include"`) |
| Realtime | `socket.io-client` 4, lazy-imported on first chat/notification use |
| Icons | 30 hand-drawn inline SVGs (`src/components/Icon.jsx`) — no icon library |
| Design | Neo-brutalism: paper `#fbf7ed`, ink `#23303d`, red/teal/gold; 3px borders, hard offset shadows, square corners; system fonts only (`Arial Black` display, `system-ui` body, `ui-monospace` labels) |

---

## Project structure

```text
spms-frontend/
├── index.html                # title, meta, no webfonts
├── vite.config.js            # dev port 3000 (matches backend CLIENT_URL)
├── .env                      # VITE_API_URL=http://localhost:5000
└── src/
    ├── main.jsx              # root render
    ├── App.jsx               # router + Suspense + lazy route chunks
    ├── index.css             # tokens, buttons, cards, pager, alerts
    ├── lib/
    │   ├── api.js            # fetch wrapper (get/post/put/patch/delete + setToken)
    │   └── socket.js         # lazy socket.io singleton
    ├── context/
    │   └── AuthContext.jsx   # user, student/mentor profiles, guards data, login/logout
    ├── components/
    │   ├── Guards.jsx        # RequireAuth, RequireProfile (admin→/admin), RequireAdmin
    │   ├── Icon.jsx          # inline SVG set
    │   └── NotificationBell.jsx/.css
    └── pages/
        ├── Landing.jsx/.css  # marketing page
        ├── Auth.jsx/.css     # login + register
        ├── StudentProfile.jsx / MentorProfile.jsx / Profile.css
        ├── GroupsHub.jsx/.css# browse, my group, mentor chat
        └── Admin.jsx/.css    # metrics, approvals, users, group progress
```

---

## Getting started

### Prerequisites

- Node.js ≥ 20, npm; the backend running (see `../SPMS-BACKEND/README.md`), seeded admin for `/admin`

### Install & run

```bash
cd spms-frontend
npm install
```



```bash
npm run dev      # http://localhost:3000 (backend CLIENT_URL must allow it)
npm run build    # production bundle → dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

### Click-through (backend on `:5000`)

1. Register a student → complete profile (+ photo) → browse groups → request to join.
2. Register a mentor → complete profile → (admin approves in `/admin`) → create group (via API/Postman) → approve request → review progress with feedback + remark.
3. Log in as admin → metrics → approve mentor → block/unblock → inspect group progress remarks.
4. Open two browsers for realtime chat + notification badges.

---

## Performance (measured `npm run build`)

| Chunk | JS | CSS |
|---|---|---|
| Initial (landing + shell) | ~248 KB / ~78 KB gzip (React + Router floor) | ~11.6 KB / ~2.9 KB gzip |
| Auth | ~8.6 KB | ~6.1 KB |
| Profiles | ~6 KB each | ~6.1 KB shared |
| GroupsHub + socket vendor | ~22.8 KB + ~41 KB (on demand) | ~15.7 KB |
| Admin | ~14.4 KB | ~7.7 KB |
| Shared (icons, bell) | ~9.5 KB total | — |

How it stays light: no webfonts (0 requests), no icon/UI framework, route-level `React.lazy`, socket.io dynamic `import()`, cursor/paged lists everywhere, no scroll-animation JS, no backdrop blur.

---

## Backend contract assumed

- Base `VITE_API_URL`, cookies + `Bearer` fallback, errors shaped `{ success, message }`
- Photo upload: `multipart/form-data`, field name **`photo`**
- Lists: `?page&limit` (≤ 50); chat history: `?limit&before=ISO-date`; admin users: `?role&verified&search`
- Roles: `student | mentor | admin` (admin seeded, never registered); remark visibility enforced server-side

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Blank page after pull | Rebuild (`npm run build`) or restart dev — new lazy chunks hashed per build |
| `Network error. Is the backend running?` | Backend down — start `SPMS-BACKEND` (`npm run dev`, `:5000`) |
| Logged out on refresh / 401s | Third-party cookies blocked (backend cookie is `SameSite=strict`); token fallback covers API but chat needs storage access — allow the site or use Bearer flow |
| Socket doesn't connect | Missing/expired token — log in again; check backend `JWT_SECRET` matches the signer |
| Redirect loop login → profile | `profileCompleted` false — finish the profile form (required fields + photo optional) |
| Admin sees `/groups` | Update the frontend — admins route to `/admin` via `RequireAdmin`; old builds predate it |
| CORS errors | Backend `CLIENT_URL` must include `http://localhost:3000` |

---

## Further improvements

- Error boundaries per route + offline banner with retry; PWA installability
- Chat file attachments + read receipts; optimistic message send with rollback
- Avatar lazy-loading + Cloudinary responsive transforms (`w_`/auto-format)
- Vitest unit tests (guards, api wrapper) + Playwright flows (register → profile → join → chat)
- TypeScript migration, stricter oxlint set, bundle-size CI gate
- i18n scaffolding; dark brutalist theme toggle

---

## License

ISC — developed for educational purposes; free to extend for institutional use.
