# ITAC Student/Alumni Portal

Frontend application for current and former ITAC students and alumni. The portal supports account access, profile management, student directory browsing, assessment reporting, certificate requests, FAQs, and job-posting information.

## Tech Stack

- React 19 with TypeScript
- Vite 6 for development and production builds
- React Router for client-side routing
- TanStack React Query for server-state fetching and caching
- Radix Themes for accessible UI primitives and theming
- Tailwind CSS 4 through `@tailwindcss/vite`
- Lucide React for icons
- Firebase Hosting for static deployment

## Requirements

- Node.js 18 or newer
- npm
- Access to the student-service API for authenticated and data-backed flows

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file when the API is not available at the default URL:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

`VITE_API_BASE_URL` defaults to `http://localhost:3000/api` when it is not set. Vite exposes variables prefixed with `VITE_` to the browser, so do not place secrets in this file.

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run lint` | Run ESLint across the repository |
| `npm run preview` | Serve the production build locally |

## Application Routes

- `/` - Login
- `/register` - Registration request
- `/password/reset` - Password reset
- `/account/password-setup` - Account password setup
- `/profile` - Current student profile
- `/:studentSlug/profile/detail` - Profile detail
- `/edit-profile` - Edit profile
- `/center-students` - Student directory
- `/students/:studentId` - Peer student profile
- `/assessments/metrics/:mode` - Assessment metrics
- `/certificate-request` - Certificate request
- `/faq` - Frequently asked questions

Unknown routes redirect to the profile route.

## Project Structure

```text
src/
	components/  Shared application and UI components
	data/        Navigation, survey, and branding data
	hooks/       Reusable React hooks
	pages/       Route-level page components
	services/    API and React Query configuration
	styles/      Shared style and typography helpers
	types/       Shared TypeScript types
	utils/       API, cookie, date, rich-text, and toast utilities
```

The `@/*` alias resolves to `src/*`.

## API Integration

Requests are made by `src/services/auth-service.ts`. Authentication tokens and a small student profile snapshot are stored in browser `localStorage`. Authenticated requests send a bearer token and include credentials for cookie-based API support.

The production hosting configuration proxies `/api/**` requests to the Firebase Cloud Run service `student-service` in `us-east1`. During local development, configure `VITE_API_BASE_URL` to point to the running API.
