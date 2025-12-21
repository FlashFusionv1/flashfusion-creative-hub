# FlashFusion Creative Hub

A modern, AI-powered learning and creative platform combining intelligent flashcard study systems with generative AI tools.

[![Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security](#security)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FlashFusion Creative Hub is a full-stack web application designed for:

- **Learners**: Study with intelligent flashcards, track progress, and leverage AI for content generation
- **Educators**: Create and share educational content with analytics insights
- **Business Owners**: Embed learning widgets and track engagement metrics

### Live Demo

Visit the [Lovable Project](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb) for a live demo.

---

## Features

### Core Learning Features

- **Flashcard Management**: Create, edit, and organize flashcards into decks
- **Study Sessions**: Interactive flip-card study experience with timing
- **Performance Tracking**: Track correct/incorrect answers and response times
- **Categories**: Organize by Education, Language, Science, Technology, Business, History, Art, Music, Sports
- **Difficulty Levels**: 5-tier difficulty system (1-5) for progressive learning

### AI-Powered Features

- **Flashcard Generation**: Automatically generate flashcards from deck titles using GPT-4o-mini
- **Image Generation**: Create custom images using OpenAI DALL-E for visual learning aids

### Analytics & Insights

- **Study Analytics**: Visualize learning progress with charts
- **Performance Metrics**: Accuracy rates, response times, and study streaks
- **Session History**: Track all study sessions and outcomes

### Multi-Role System

- **Creator Dashboard**: AI studio for content creation
- **Owner Dashboard**: Business analytics and embed widget management
- **Admin Tools**: Audit logs and user management (via database)

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18.3 | UI Framework |
| TypeScript 5.5 | Type Safety |
| Vite 5.4 | Build Tool |
| Tailwind CSS 3.4 | Styling |
| shadcn/ui | Component Library |
| TanStack Query 5.56 | Server State Management |
| React Router 6.26 | Routing |
| React Hook Form 7.53 | Form Handling |
| Zod 3.23 | Schema Validation |
| Recharts 2.12 | Data Visualization |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Deno | Edge Functions Runtime |
| OpenAI API | AI Generation |

---

## Getting Started

### Prerequisites

- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager
- Supabase account (for database and auth)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

```bash
git clone <YOUR_GIT_URL>
cd flashfusion-creative-hub
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

3. **Configure environment**

The Supabase client is pre-configured in `src/integrations/supabase/client.ts`. For edge functions, configure secrets in the Supabase dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

4. **Start development server**

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## Project Structure

```
flashfusion-creative-hub/
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui primitives (30+ components)
│   │   ├── Analytics.tsx     # Study performance charts
│   │   ├── CreatorDashboard.tsx  # AI tools interface
│   │   ├── DeckManager.tsx   # Deck CRUD operations
│   │   ├── FlashcardEditor.tsx   # Card creation/editing
│   │   ├── ImageGenerator.tsx    # AI image generation
│   │   ├── Landing.tsx       # Homepage
│   │   ├── Navigation.tsx    # Top navigation
│   │   ├── OwnerDashboard.tsx    # Business analytics
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   ├── SecurityDebugPanel.tsx # Security monitoring
│   │   ├── SessionResults.tsx    # Study results display
│   │   └── StudySession.tsx  # Interactive study mode
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state
│   ├── hooks/
│   │   ├── use-mobile.tsx    # Mobile detection
│   │   └── use-toast.ts      # Toast notifications
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client
│   │       └── types.ts      # Auto-generated types
│   ├── lib/
│   │   ├── security.ts       # Security utilities
│   │   └── utils.ts          # General utilities
│   ├── pages/
│   │   ├── Index.tsx         # Home page (/)
│   │   ├── Auth.tsx          # Login/signup (/auth)
│   │   ├── Creator.tsx       # Creator dashboard (/creator)
│   │   ├── Owner.tsx         # Owner dashboard (/owner)
│   │   └── NotFound.tsx      # 404 page
│   ├── App.tsx               # Root component
│   ├── App.css               # Global styles
│   ├── index.css             # Tailwind setup
│   └── main.tsx              # Entry point
├── supabase/
│   ├── functions/
│   │   ├── generate-flashcard/   # AI flashcard generation
│   │   └── generate-image/       # AI image generation
│   └── migrations/           # Database migrations
├── docs/
│   ├── AUDIT.md              # Technical audit report
│   └── ROADMAP.md            # Product roadmap
└── public/                   # Static assets
```

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `decks` | Flashcard deck metadata |
| `flashcards` | Individual flashcard content |
| `study_sessions` | Study session records |
| `flashcard_performance` | Per-card performance data |
| `user_roles` | Role-based access control |
| `audit_log` | Security audit trail |

### Entity Relationships

```
auth.users (Supabase Auth)
    │
    ├── profiles (1:1)
    ├── user_roles (1:many)
    ├── decks (1:many)
    │       └── flashcards (1:many)
    │               └── flashcard_performance (1:many)
    └── study_sessions (1:many)
            └── flashcard_performance (1:many)
```

### Row Level Security

All tables have RLS enabled with policies enforcing:
- Users can only access their own data
- Public decks are viewable by all authenticated users
- Admins have full access for management

---

## API Reference

### Edge Functions

#### Generate Flashcard

**Endpoint:** `supabase.functions.invoke('generate-flashcard')`

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "deckTitle": "Introduction to Biology"
}
```

**Response:**
```json
{
  "question": "What is the powerhouse of the cell?",
  "answer": "The mitochondria is the powerhouse of the cell...",
  "difficulty": 2
}
```

**Rate Limit:** 10 requests/minute per user

---

#### Generate Image

**Endpoint:** `supabase.functions.invoke('generate-image')`

**Request:**
```json
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

---

## Security

FlashFusion implements comprehensive security measures:

### Client-Side Security

- **Input Validation**: XSS and SQL injection pattern detection
- **Content Sanitization**: HTML entity encoding for safe display
- **Rate Limiting**: Client-side request throttling
- **Security Monitoring**: Event logging and suspicious activity detection

### Server-Side Security

- **Authentication**: JWT-based with Supabase Auth
- **Row Level Security**: Database-level access control
- **Secure Functions**: SECURITY DEFINER with explicit search_path
- **Audit Logging**: All sensitive operations logged
- **Prompt Injection Protection**: Pattern detection for AI inputs

### Configuration

Security limits are defined in `src/lib/security.ts`:

| Field | Max Length |
|-------|------------|
| Title | 255 chars |
| Description | 1000 chars |
| Question | 2000 chars |
| Answer | 2000 chars |
| Category | 100 chars |

---

## Documentation

### Available Documents

| Document | Description |
|----------|-------------|
| [AUDIT.md](./docs/AUDIT.md) | Technical audit report with security findings |
| [ROADMAP.md](./docs/ROADMAP.md) | Product roadmap with 12 development phases |

### Audit Highlights

- **Security Score**: Good foundation with recent enhancements
- **Critical Issues**: None identified
- **High Priority**: 3 items (addressed in roadmap Phase 1)
- **Code Quality**: Clean architecture, room for TypeScript strict mode

### Roadmap Overview

12-phase development plan covering:
1. Security Hardening
2. Performance Optimization
3. Testing Infrastructure
4. Enhanced Study Features
5. AI Capabilities Expansion
6. Social & Collaboration
7. Mobile Experience
8. Monetization & Business
9. Analytics & Insights
10. Enterprise Features
11. Accessibility & i18n
12. Platform Ecosystem

---

## Deployment

### Via Lovable

1. Open [Lovable Project](https://lovable.dev/projects/fd43398b-2c66-4f6d-8f24-d120f38a4ceb)
2. Click **Share > Publish**

### Custom Domain

1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the [custom domain guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

### Self-Hosted

For self-hosting, you'll need:
- Supabase project with configured edge functions
- OpenAI API key as secret
- Static hosting (Vercel, Netlify, etc.)

---

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code patterns and conventions
- Write meaningful commit messages
- Update documentation as needed
- Ensure no TypeScript errors before submitting

---

## License

This project is private and proprietary. All rights reserved.

---

## Support

For questions or issues:
- Open an issue in this repository
- Visit the [Lovable documentation](https://docs.lovable.dev)

---

*Built with [Lovable](https://lovable.dev) - AI-powered web development*
