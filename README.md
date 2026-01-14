# FlashFusion Creative Hub

> AI-powered learning and creative platform combining intelligent flashcard study systems with generative AI tools for educators, learners, and content creators.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security](#security)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

FlashFusion Creative Hub is a full-stack web application designed for modern learning experiences. It combines traditional flashcard-based learning with AI-powered content generation to create an engaging educational platform.

### Target Users

| User Type | Description | Key Features |
|-----------|-------------|--------------|
| **Learners** | Students and self-learners | Study flashcards, track progress, performance analytics |
| **Educators** | Teachers and content creators | Create decks, share content, AI-assisted generation |
| **Business Owners** | Platform integrators | Embed widgets, track engagement, manage users |

### Live Demo

Access the [Lovable Project](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb) for a live demo.

---

## Features

### Core Learning System

| Feature | Description | Status |
|---------|-------------|--------|
| **Flashcard Management** | CRUD operations for flashcards with difficulty levels | Complete |
| **Deck Organization** | Create, organize, and categorize flashcard decks | Complete |
| **Study Sessions** | Interactive flip-card study experience | Complete |
| **Performance Tracking** | Track correct/incorrect answers and response times | Complete |
| **Analytics Dashboard** | Visualize learning progress with charts | Complete |

### AI-Powered Features

| Feature | Description | AI Model |
|---------|-------------|----------|
| **Flashcard Generation** | Auto-generate flashcards from deck titles | GPT-4o-mini |
| **Image Generation** | Create custom images for visual learning | DALL-E (gpt-image-1) |

### Categories Supported

Education, Language, Science, Technology, Business, History, Art, Music, Sports, Other

### Multi-Role System

```
Creator Dashboard
├── AI Studio
│   ├── AI Image Generator
│   ├── AI Idea Generator
│   ├── Style Combiner
│   └── Export Tools
├── Project Management
└── Publishing Tools

Owner Dashboard
├── Widget Embedding
├── Platform Integrations
│   ├── Shopify
│   ├── Etsy
│   ├── TikTok Shop
│   ├── eBay
│   ├── Facebook Marketplace
│   └── Printify
├── Business Analytics
└── Custom Branding
```

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │  TanStack   │  │   shadcn/ui │              │
│  │   Router    │  │   Query     │  │  Components │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │  Database   │  │    Edge     │              │
│  │   (JWT)     │  │ (PostgreSQL)│  │  Functions  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
│  ┌─────────────────────────────────────────────────┐            │
│  │                   OpenAI API                     │            │
│  │  ┌─────────────────┐  ┌─────────────────────┐   │            │
│  │  │   GPT-4o-mini   │  │   DALL-E (Images)   │   │            │
│  │  └─────────────────┘  └─────────────────────┘   │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → React Component → React Query → Supabase Client
                                     │
                                     ├── Database (RLS enforced)
                                     │
                                     └── Edge Function → OpenAI API
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Type Safety |
| Vite | 5.4.1 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.11 | Utility-First Styling |
| shadcn/ui | Latest | UI Component Library (30+ components) |
| TanStack Query | 5.56.2 | Server State Management |
| React Router | 6.26.2 | Client-Side Routing |
| React Hook Form | 7.53.0 | Form Management |
| Zod | 3.23.8 | Schema Validation |
| Recharts | 2.12.7 | Data Visualization |
| Lucide React | 0.462.0 | Icon Library |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Relational Database |
| Deno | Edge Functions Runtime |
| OpenAI API | AI Generation Services |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.9.0 | Code Linting |
| TypeScript ESLint | 8.0.1 | TypeScript Linting |
| PostCSS | 8.4.47 | CSS Transformation |
| Autoprefixer | 10.4.20 | CSS Vendor Prefixes |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun** package manager
- **Supabase** account (for database and auth)
- **OpenAI API** key (for AI features)

### Quick Start

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd flashfusion-creative-hub

# 2. Install dependencies
npm install
# or
bun install

# 3. Start development server
npm run dev

# 4. Open http://localhost:8080
```

### Environment Configuration

The Supabase client is pre-configured in `src/integrations/supabase/client.ts`.

For edge functions, configure secrets in the Supabase dashboard:

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build |

---

## Project Structure

```
flashfusion-creative-hub/
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui primitives (30+)
│   │   ├── Analytics.tsx     # Performance charts (406 lines)
│   │   ├── CreatorDashboard.tsx  # AI tools (237 lines)
│   │   ├── DeckManager.tsx   # Deck CRUD (403 lines)
│   │   ├── FlashcardEditor.tsx   # Card editing (424 lines)
│   │   ├── ImageGenerator.tsx    # AI images (229 lines)
│   │   ├── Landing.tsx       # Homepage (119 lines)
│   │   ├── Navigation.tsx    # Top nav (152 lines)
│   │   ├── OwnerDashboard.tsx    # Business tools (291 lines)
│   │   ├── ProtectedRoute.tsx    # Auth guard (26 lines)
│   │   ├── SecurityDebugPanel.tsx # Security UI (133 lines)
│   │   ├── SessionResults.tsx    # Results display (157 lines)
│   │   └── StudySession.tsx  # Study mode (325 lines)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state (84 lines)
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx    # Mobile detection
│   │   └── use-toast.ts      # Toast notifications
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client
│   │       └── types.ts      # Auto-generated types
│   │
│   ├── lib/
│   │   ├── security.ts       # Security utilities (414 lines)
│   │   └── utils.ts          # General utilities
│   │
│   ├── pages/
│   │   ├── Index.tsx         # Home (/)
│   │   ├── Auth.tsx          # Login/signup (/auth)
│   │   ├── Creator.tsx       # Creator dashboard (/creator)
│   │   ├── Owner.tsx         # Owner dashboard (/owner)
│   │   └── NotFound.tsx      # 404 page
│   │
│   ├── App.tsx               # Root component (48 lines)
│   ├── App.css               # Global styles
│   ├── index.css             # Tailwind setup
│   └── main.tsx              # Entry point
│
├── supabase/
│   ├── functions/
│   │   ├── generate-flashcard/   # AI flashcard (197 lines)
│   │   └── generate-image/       # AI image (83 lines)
│   ├── migrations/           # Database migrations (2)
│   └── config.toml           # Supabase config
│
├── docs/
│   ├── AUDIT.md              # Technical audit
│   ├── ROADMAP.md            # Product roadmap
│   ├── claude.md             # Claude AI guide
│   ├── agents.md             # AI agents guide
│   └── gemini.md             # Gemini AI guide
│
├── public/                   # Static assets
├── CHANGELOG.md              # Version history
└── Configuration files       # (vite, tailwind, tsconfig, etc.)
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐
│   auth.users     │     │     profiles     │
│   (Supabase)     │────▶│                  │
│                  │ 1:1 │  - display_name  │
└──────────────────┘     │  - email         │
        │                │  - avatar_url    │
        │                └──────────────────┘
        │
        │ 1:many
        ▼
┌──────────────────┐     ┌──────────────────┐
│    user_roles    │     │      decks       │
│                  │     │                  │
│  - role (enum)   │     │  - title         │
│  - assigned_at   │     │  - description   │
└──────────────────┘     │  - category      │
                         │  - is_public     │
                         │  - total_cards   │
                         └──────────────────┘
                                 │
                                 │ 1:many
                                 ▼
                         ┌──────────────────┐
                         │   flashcards     │
                         │                  │
                         │  - question      │
                         │  - answer        │
                         │  - difficulty    │
                         │  - card_order    │
                         └──────────────────┘
                                 │
                                 │ 1:many
                                 ▼
┌──────────────────┐     ┌──────────────────┐
│  study_sessions  │────▶│flashcard_perf    │
│                  │ 1:m │                  │
│  - started_at    │     │  - is_correct    │
│  - ended_at      │     │  - response_ms   │
│  - correct_cnt   │     │  - answered_at   │
│  - incorrect_cnt │     └──────────────────┘
└──────────────────┘

┌──────────────────┐
│    audit_log     │
│                  │
│  - action        │
│  - table_name    │
│  - old_values    │
│  - new_values    │
└──────────────────┘
```

### Tables Overview

| Table | Columns | RLS | Purpose |
|-------|---------|-----|---------|
| profiles | 6 | Yes | User profile data |
| decks | 8 | Yes | Flashcard collections |
| flashcards | 7 | Yes | Individual cards |
| study_sessions | 8 | Yes | Study session records |
| flashcard_performance | 7 | Yes | Per-card performance |
| user_roles | 5 | Yes | Role-based access |
| audit_log | 8 | Yes | Security audit trail |

### Role Types (ENUM)

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'creator');
```

---

## API Reference

### Frontend Routes

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | Index | No | Landing page |
| `/auth` | Auth | No | Login/signup |
| `/creator` | Creator | Yes | Creator dashboard |
| `/owner` | Owner | Yes | Owner dashboard |
| `*` | NotFound | No | 404 page |

### Edge Functions

#### Generate Flashcard

```http
POST supabase.functions.invoke('generate-flashcard')
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "deckTitle": "Introduction to Biology"
}
```

**Response:**
```json
{
  "question": "What is the powerhouse of the cell?",
  "answer": "The mitochondria...",
  "difficulty": 2
}
```

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| deckTitle | string | Yes | 3-200 chars |

**Rate Limit:** 10 requests/minute per user

#### Generate Image

```http
POST supabase.functions.invoke('generate-image')
Content-Type: application/json

{
  "prompt": "A colorful diagram of photosynthesis",
  "size": "1024x1024",
  "quality": "high"
}
```

**Response:**
```json
{
  "success": true,
  "imageData": "data:image/webp;base64,...",
  "prompt": "A colorful diagram of photosynthesis"
}
```

| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| prompt | string | - | Required |
| size | string | "1024x1024" | "1024x1024", "1536x1024", "1024x1536" |
| quality | string | "high" | "high", "standard" |

---

## Security

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Client-Side Validation                            │
│  ├── Input sanitization (XSS/SQL injection patterns)        │
│  ├── Content length limits                                  │
│  ├── Rate limiting (client-side)                            │
│  └── Security monitoring                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Network Security                                  │
│  ├── HTTPS enforcement                                      │
│  ├── Security headers (X-Content-Type-Options, etc.)        │
│  └── CORS configuration                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Authentication                                    │
│  ├── JWT-based auth (Supabase)                              │
│  ├── Session management                                     │
│  └── Protected routes                                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Authorization                                     │
│  ├── Row Level Security (RLS)                               │
│  ├── Role-based access (admin, moderator, creator)          │
│  └── SECURITY DEFINER functions                             │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Edge Function Security                            │
│  ├── JWT verification                                       │
│  ├── Rate limiting (10 req/min)                             │
│  ├── Prompt injection protection                            │
│  └── Output validation                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 6: Database Security                                 │
│  ├── RLS on all tables                                      │
│  ├── Input constraints (length limits)                      │
│  ├── Audit logging                                          │
│  └── Secure function search_path                            │
└─────────────────────────────────────────────────────────────┘
```

### Content Length Limits

| Field | Max Length |
|-------|------------|
| Title | 255 chars |
| Description | 1000 chars |
| Question | 2000 chars |
| Answer | 2000 chars (client) / 5000 chars (DB) |
| Category | 100 chars |
| Display Name | 100 chars |

### Dangerous Pattern Detection

```javascript
// XSS Patterns
/<script\b[^<]*>/, /<iframe\b[^<]*>/, /on\w+\s*=/, /javascript:/

// SQL Injection Patterns
/union\s+select/, /insert\s+into/, /delete\s+from/, /drop\s+table/

// Prompt Injection Patterns
/ignore\s+previous\s+instructions/, /system\s*:/, /\[INST\]/
```

---

## Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
```

### TypeScript Configuration

```json
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### Tailwind Configuration

- Dark mode support (class-based)
- Custom color scheme with CSS variables
- Extended sidebar styling
- Animation support

---

## Deployment

### Via Lovable (Recommended)

1. Open [Lovable Project](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb)
2. Click **Share > Publish**
3. Instant deployment with auto-hosting

### Custom Domain

1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow DNS configuration steps

### Self-Hosted Requirements

| Requirement | Description |
|-------------|-------------|
| Static hosting | Vercel, Netlify, AWS S3, etc. |
| Supabase project | With configured edge functions |
| OpenAI API key | Stored as Supabase secret |
| Node.js 18+ | For build process |

### Build Commands

```bash
# Production build
npm run build

# Output directory
dist/
├── index.html
├── assets/
│   ├── index-*.js
│   └── *.css
└── favicon.ico
```

---

## Testing

### Current Status

| Type | Coverage | Status |
|------|----------|--------|
| Unit Tests | 0% | Not implemented |
| Integration Tests | 0% | Not implemented |
| E2E Tests | 0% | Not implemented |

### Recommended Setup (Roadmap)

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

See [ROADMAP.md](./docs/ROADMAP.md) Phase 3 for testing infrastructure plans.

---

## Contributing

### Development Guidelines

1. Follow existing code patterns and conventions
2. Write meaningful commit messages
3. Update documentation as needed
4. Ensure no TypeScript errors before submitting

### Workflow

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and lint
npm run lint

# 4. Commit changes
git commit -m 'Add amazing feature'

# 5. Push and create PR
git push origin feature/amazing-feature
```

### Code Style

- Use TypeScript for all new files
- Follow React best practices (hooks, functional components)
- Use shadcn/ui components when possible
- Keep components under 300 lines when practical

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change port in `vite.config.ts` |
| Supabase connection failed | Check client configuration |
| AI generation fails | Verify OpenAI API key in Supabase secrets |
| Auth not working | Check Supabase Auth configuration |

### Debug Mode

Enable security debug panel in development:
- Security events logged to console
- Event monitoring UI available

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview (this file) |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [AUDIT.md](./docs/AUDIT.md) | Technical audit report |
| [ROADMAP.md](./docs/ROADMAP.md) | Product roadmap |
| [claude.md](./docs/claude.md) | Claude AI assistant guide |
| [agents.md](./docs/agents.md) | Multi-AI agents guide |
| [gemini.md](./docs/gemini.md) | Gemini AI assistant guide |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

---

## License

This project is private and proprietary. All rights reserved.

---

## Support

- **Issues**: Open an issue in this repository
- **Documentation**: [Lovable Docs](https://docs.lovable.dev)
- **Community**: Join the Lovable Discord

---

*Built with [Lovable](https://lovable.dev) - AI-powered web development*
