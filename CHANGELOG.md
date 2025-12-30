# Changelog

All notable changes to FlashFusion Creative Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Multi-factor authentication (MFA) support
- OAuth providers (Google, GitHub, Apple)
- Spaced repetition system (SRS)
- Multiple study modes (Quiz, Match, Write)
- Mobile PWA support
- Comprehensive test suite

---

## [1.1.0] - 2025-12-30

### Added
- Comprehensive technical audit report (`docs/AUDIT.md`)
- Product roadmap with 12 development phases (`docs/ROADMAP.md`)
- AI assistant documentation (`docs/claude.md`, `docs/agents.md`, `docs/gemini.md`)
- Enhanced README with architecture diagrams
- This CHANGELOG file

### Changed
- Improved documentation structure
- Updated README with comprehensive project information

---

## [1.0.0] - 2025-12-21

### Added

#### Security Enhancements
- **SECURITY DEFINER Functions**: All database functions now include `SET search_path = public` to prevent privilege escalation
  - `update_updated_at_column()`
  - `update_deck_card_count()`
  - `handle_new_user()`
  - `has_role()`
  - `get_current_user_role()`
  - `audit_trigger()`

- **Role-Based Access Control (RBAC)**
  - New `app_role` ENUM type: `admin`, `moderator`, `creator`
  - New `user_roles` table for secure role management
  - Secure role checking with `has_role()` function
  - Admin-only role management policies

- **Audit Logging**
  - New `audit_log` table for tracking sensitive operations
  - Audit triggers on `decks` and `user_roles` tables
  - JSONB storage for old/new values
  - Admin-only audit log access

- **Database Constraints**
  - `flashcard_question_length`: Max 2000 chars
  - `flashcard_answer_length`: Max 5000 chars
  - `deck_title_length`: Max 200 chars
  - `deck_description_length`: Max 1000 chars

- **Client-Side Security (`src/lib/security.ts`)**
  - XSS pattern detection (script, iframe, object, embed tags)
  - SQL injection pattern detection
  - Enhanced content validation (Base64, SVG, CSS expressions)
  - Rate limiting class (`ClientRateLimiter`)
  - Security monitoring class (`SecurityMonitor`)
  - Suspicious activity detection

- **Edge Function Security**
  - JWT authentication verification
  - Prompt injection pattern detection
  - Rate limiting (10 requests/minute per user)
  - Output validation and sanitization

- **Security Debug Panel**
  - Development-only security event monitoring UI
  - Real-time event display
  - Last 100 events stored

#### Core Features
- **Flashcard System**
  - Create, read, update, delete flashcards
  - Organize flashcards into decks
  - 10 category types supported
  - Difficulty levels 1-5
  - Card ordering system

- **Study Sessions**
  - Interactive flip-card interface
  - Session timing and tracking
  - Correct/incorrect answer recording
  - Response time measurement (milliseconds)

- **Analytics Dashboard**
  - Study session history (last 50)
  - Per-deck performance metrics
  - Accuracy rate calculation
  - Study streak tracking (current & longest)
  - Bar, line, and pie charts (Recharts)

- **AI Integration**
  - GPT-4o-mini flashcard generation
  - DALL-E image generation
  - WebP output format (85% compression)
  - Multiple size options

- **Multi-Role Dashboards**
  - Creator Dashboard with AI Studio
  - Owner Dashboard with business analytics
  - Platform integration placeholders (Shopify, Etsy, etc.)

- **Authentication**
  - Supabase Auth integration
  - Email/password authentication
  - JWT token management
  - Protected routes

### Fixed
- Function search_path vulnerabilities (security fix)
- RLS policy improvements for authenticated users
- Profile role column removed (migrated to user_roles table)

### Security
- Removed `role` column from `profiles` table (security vulnerability)
- All RLS policies now specify `TO authenticated`
- SECURITY DEFINER functions have explicit search_path

---

## [0.2.0] - 2025-07-21

### Added
- Initial database schema
  - `profiles` table
  - `decks` table
  - `flashcards` table
  - `study_sessions` table
  - `flashcard_performance` table
- Row Level Security (RLS) on all tables
- Automatic timestamp updates via triggers
- Deck card count maintenance via triggers
- New user profile creation on signup

### Infrastructure
- Supabase project setup
- Edge functions for AI generation
- Vite development server configuration

---

## [0.1.0] - 2025-07-20

### Added
- Project initialization
- React 18 with TypeScript
- Vite build configuration
- Tailwind CSS styling
- shadcn/ui component library (30+ components)
- TanStack Query for state management
- React Router for navigation
- Basic page structure (Index, Auth, Creator, Owner, NotFound)

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.1.0 | 2025-12-30 | Documentation overhaul, AI guides |
| 1.0.0 | 2025-12-21 | Security hardening, audit logging |
| 0.2.0 | 2025-07-21 | Database schema, RLS, edge functions |
| 0.1.0 | 2025-07-20 | Initial project setup |

---

## Migration Notes

### Upgrading to 1.0.0

1. **Database Migration Required**
   - Run security fixes SQL migration
   - The `role` column in `profiles` has been removed
   - User roles now managed via `user_roles` table

2. **Environment Variables**
   - Ensure `OPENAI_API_KEY` is set in Supabase secrets

3. **Breaking Changes**
   - Profile role queries should use `user_roles` table
   - Use `has_role()` function for role checking

### Upgrading to 0.2.0

1. **Database Setup Required**
   - Run initial schema migration
   - Supabase project must be configured

---

## Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

*For detailed roadmap, see [ROADMAP.md](./docs/ROADMAP.md)*
