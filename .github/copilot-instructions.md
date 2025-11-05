## AI assistant quick playbook — UnlistedHub (concise)

This repo is a small Create‑React‑App single-page UI for a P2P unlisted‑shares marketplace. Entry: `public/index.html` → `src/index.js` → `src/App.jsx`.

## Big picture (must-know)
- Providers order in `src/App.jsx`: AuthProvider → BidProvider → ListingProvider → CompanyProvider. Use those Contexts as the runtime sources of truth.
- Context responsibilities:
  - `src/context/AuthContext.jsx`: in‑memory users, roles, functions: `signup`, `signin`, `logout`, `switchRole`, `getUserDisplayName`.
  - `src/context/ListingContext.jsx`: stores `sellListings` and `buyRequests` in localStorage (`sellListings`, `buyRequests` keys). Exposes creation, bidding, counter offers, admin approve/close flows.
  - `src/context/BidContext.jsx`: separate top‑level `bids` and `transactions` (note overlap with ListingContext's per‑listing bids).
  - `src/context/CompanyContext.jsx`: authoritative companies list at runtime; `src/data/companies.json` is seed/demo data.

## Key patterns & repo-specific gotchas
- No router: navigation is handled by `setPage('home'|'marketplace'|'sell'|'admin'|'user'|'buy'...)`. Look for `setPage(` usage to follow navigation.
- Data mismatch: some components read `src/data/companies.json` while a runtime `CompanyContext` also exists. Prefer `useCompany()` or `CompanyContext` as single source of truth when changing UI.
- Local persistence: listings use `localStorage` — changes persist per browser and are loaded on start (see `ListingContext.jsx`).
- Styling mismatch: many components use Tailwind‑style utility classes but `tailwindcss` is not in `package.json`. Either add Tailwind properly or convert classes to plain CSS.
- Auth is fully in‑memory (no backend). Converting to a server requires making `signup/signin` async and updating callers.

## Developer workflows (quick)
- Install: `npm install`
- Dev: `npm start` (CRA)
- Build: `npm run build`
- Test: `npm test` (none provided currently)

## Debugging & common edits (actionable)
- To change listing/marketplace behavior: update `src/context/ListingContext.jsx` and then update consumers in `src/components/Marketplace.jsx` or switch Marketplace to `useListing()`.
- To find where navigation or a view is triggered: search for `setPage(`.
- Inspect runtime data in browser DevTools: check `localStorage.sellListings` and `localStorage.buyRequests`.

## Bite‑size examples (copy/paste)
- Navigate programmatically: `setPage('marketplace')` — see `src/components/Header.jsx`, `src/App.jsx`.
- Create a sell listing: `const { createSellListing } = useListing(); createSellListing({ company: 'X', isin: 'INE...', price: 100, shares: 10 });` — see `src/context/ListingContext.jsx` and `src/components/SellPage.jsx`.
- Use companies list at runtime: `const { companies, getCompanyByISIN } = useCompany();` — see `src/context/CompanyContext.jsx`.

## Where to look (short list)
- App & entry: `src/App.jsx`, `src/index.js`
- Contexts (state & flows): `src/context/*.jsx` (Auth, Listing, Bid, Company)
- UI: `src/components/*.jsx` (Header, HomePage, Marketplace, SellPage, AdminDashboard)
- Seed data: `src/data/companies.json`
- Persistence: `localStorage` keys `sellListings`, `buyRequests`

If you'd like, I can (pick one):
- Convert `Marketplace.jsx` to use `ListingContext`/`CompanyContext` as a single source of truth, or
- Add a short developer script in `package.json` for cleaning localStorage used by this app.

Please review and tell me which additions or clarifications you'd like (examples, commands, or more file references).
## Quick context for AI agents

- Purpose: This is a small React single-page app (no backend) implementing a P2P marketplace for unlisted shares. The app uses React 18, the Context API for global state, and simple in-memory data stores.
- Entry points: `public/index.html` -> `src/index.js` -> `src/App.jsx` (App comp manages navigation via a local `page` state and passes `setPage` to components).

## Architecture & data flow (what to know first)

- Providers: `App.jsx` wraps the UI with three context providers in this order: `AuthProvider` -> `ListingProvider` -> `BidProvider`. These expose hooks `useAuth()`, `useListing()`, `useBid()`.
- Single-account, multi-role: `AuthContext.jsx` maintains `user`, `currentRole`, and `users` in memory. Roles affect visible UI and permissions (e.g., admin sees Admin Dashboard). See `Header.jsx` for role-switch UI.
- Listings vs Marketplace data: There is an important mismatch to be aware of:
  - `src/context/ListingContext.jsx` contains an in-memory `listings` array and `createListing()` used by `SellPage.jsx`.
  - `src/components/Marketplace.jsx` currently imports `src/data/companies.json` and renders `companiesData.companies`. Creating a listing via `createListing()` will NOT automatically update `companies.json` nor the Marketplace listing view unless you modify Marketplace to consume `ListingContext`.

## Key patterns & conventions

- Navigation: There is no router; components change view by calling `setPage('marketplace'|'sell'|'signin'|'signup'|'home'|'mybids'|'admin')`. See `App.jsx` and `Header.jsx` for examples.
- Context hooks: Each context exposes a hook for consumers:
  - `useAuth()` — provides `{ user, currentRole, switchRole, signup, signin, logout }` (see `SignIn.jsx`, `SignUp.jsx`, `Header.jsx`).
  - `useListing()` — provides `{ listings, createListing }` (see `SellPage.jsx`).
  - `useBid()` — provides `{ bids, transactions, placeBid, makeCounterOffer, confirmPriceAgreement, approveTransaction }` (see `Marketplace.jsx` and admin flow).
- UI styling: Components use Tailwind-like utility classes (e.g., `bg-gray-900`, `rounded-lg`). However, repository `package.json` does not include `tailwindcss` and `src/index.css` is plain CSS (no Tailwind directives). Verify styling setup before adding Tailwind-dependent code or classes.
- Files: Components are JSX files under `src/components/*.jsx`. Contexts live in `src/context/*.jsx`. Keep this layout when adding new features.

## Build, run, and debug

- Install and run (standard CRA scripts found in `package.json`):
  - Install: `npm install`
  - Dev server: `npm start` (runs react-scripts start)
  - Build: `npm run build`
  - Test: `npm test` (no tests currently provided)
- Debugging tips:
  - The app is single-page and navigates via `setPage`. If you can't reach a screen, search where `setPage` is invoked.
  - Global state is in Contexts — inspect `AuthContext`, `ListingContext`, `BidContext` for expected data shapes.

## Project-specific gotchas & recommended starting edits

- Data mismatch (high priority): If you add or edit listing creation flows, either: (A) change `Marketplace.jsx` to read from `ListingContext.listings` (recommended), or (B) update `companies.json` at build-time (less recommended). See `ListingContext.jsx` and `Marketplace.jsx` for the two data sources.
- Styling mismatch: README mentions Tailwind, but Tailwind isn't configured. If you introduce Tailwind, add it to `package.json` and the PostCSS configuration, or convert utility classes to your CSS framework.
- Auth is in-memory: `AuthContext` stores users in `users` state and uses simple email/password checks. Persisting or replacing with a backend will require refactoring signin/signup and possibly adding async/await HTTP calls.
- Alerts and UX: Many flows use `alert()` for feedback (e.g., bid posted). Replace with a centralized notification component when improving UX.

## Small code examples (copy/paste references)

- Navigate to marketplace from code: `setPage('marketplace')` — see `Header.jsx` and `App.jsx`.
- Create a listing programmatically: `const { createListing } = useListing(); createListing({ company: 'X', isin: 'IN...', price: 100, shares: 10 });` — see `SellPage.jsx` and `ListingContext.jsx`.
- Place a bid (example flow): `const { placeBid } = useBid(); placeBid({ listingId, userId, price, quantity });` — see `Marketplace.jsx` and `BidContext.jsx`.

## Where to look for common changes

- Add a new page/view: create a new component in `src/components/`, accept `setPage` prop if it needs navigation, then add a conditional render in `App.jsx`.
- Global data: prefer adding/updating logic in the matching Context (`src/context/*`) rather than passing props deep into the tree.
- Replace demo data: `src/data/companies.json` and initial arrays in contexts (`ListingContext.jsx`, `ListingContext` initial listings) are the seeds used by the UI.

## Lint, tests, and quality

- There are no tests or lint configs beyond CRA defaults. Keep changes small and run `npm start` locally to validate UI flows. If you add new dependencies or build steps, update `package.json` scripts accordingly.

## Quick checklist for PRs

- Does the change keep data flows consistent? (If you modify listings, update both the source of truth and consumers.)
- Does the change preserve the simple synchronous Context API, or intentionally converts it to async with clear reason? Document any async flows.
- Is styling approach consistent (plain CSS vs Tailwind)? Note any added dependency.

---

If any section is unclear or you'd like the instructions to include additional examples (e.g., how to persist auth, or how to convert Marketplace to use ListingContext), tell me which area and I'll iterate. 
