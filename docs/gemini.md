# Gemini AI Assistant Guide

> Instructions for Google Gemini when working with the FlashFusion Creative Hub codebase.

---

## Project Summary

**FlashFusion Creative Hub** is an AI-powered learning platform for flashcard-based education.

### Tech Stack at a Glance

```
Frontend:    React 18 + TypeScript + Vite + Tailwind CSS
Backend:     Supabase (PostgreSQL + Edge Functions + Auth)
AI:          OpenAI API (GPT-4o-mini for text, DALL-E for images)
UI Library:  shadcn/ui (30+ Radix-based components)
```

---

## Project Map

```
flashfusion-creative-hub/
│
├── src/                          # Frontend source
│   ├── components/               # 12 main + 30 UI components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── DeckManager.tsx       # Deck CRUD
│   │   ├── FlashcardEditor.tsx   # Card editing + AI
│   │   ├── StudySession.tsx      # Interactive study
│   │   ├── Analytics.tsx         # Performance charts
│   │   └── ...
│   │
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Auth state management
│   │
│   ├── lib/                      # Utilities
│   │   └── security.ts           # Validation & security (414 lines)
│   │
│   └── pages/                    # Route components
│       ├── Index.tsx             # / (home)
│       ├── Auth.tsx              # /auth (login/signup)
│       ├── Creator.tsx           # /creator (AI tools)
│       └── Owner.tsx             # /owner (business)
│
├── supabase/
│   ├── functions/                # Edge functions (Deno)
│   │   ├── generate-flashcard/   # GPT-4o-mini
│   │   └── generate-image/       # DALL-E
│   └── migrations/               # SQL schema
│
└── docs/                         # Documentation
    ├── AUDIT.md                  # Security audit
    ├── ROADMAP.md                # Product roadmap
    └── ...
```

---

## Core Concepts

### 1. Data Model

```
User (auth.users)
  │
  ├── Profile (1:1) - display_name, email, avatar
  │
  ├── Roles (1:many) - admin, moderator, creator
  │
  └── Decks (1:many) - title, description, category, is_public
        │
        └── Flashcards (1:many) - question, answer, difficulty (1-5)
              │
              └── Performance (1:many) - is_correct, response_time_ms
                    │
                    └── Sessions (many:1) - started_at, ended_at, scores
```

### 2. Security Layers

| Layer | Where | What |
|-------|-------|------|
| Input Validation | `lib/security.ts` | XSS, SQL injection, length limits |
| Authentication | Supabase Auth | JWT tokens, session management |
| Authorization | PostgreSQL RLS | Row-level access control |
| Rate Limiting | Edge Functions | 10 requests/minute |
| Audit Logging | Database Triggers | All deck/role changes logged |

### 3. Categories

Education, Language, Science, Technology, Business, History, Art, Music, Sports, Other

---

## Coding Patterns

### Standard Component Structure

```tsx
// 1. Imports
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateTitle } from "@/lib/security";

// 2. Interface
interface Props {
  deckId?: string;
  onAction?: (id: string) => void;
}

// 3. Component
const ComponentName = ({ deckId, onAction }: Props) => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();

  // Effects
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Handlers
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("table")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      setData(data || []);
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) return <div>Loading...</div>;

  // Render
  return (
    <Card>
      <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      <CardContent>{/* content */}</CardContent>
    </Card>
  );
};

export default ComponentName;
```

### Security Validation

```tsx
// Always validate user input before saving
import { validateTitle, validateDescription, rateLimiter } from "@/lib/security";

const handleSave = async () => {
  // Validate
  const titleResult = validateTitle(formData.title, user?.id);
  if (!titleResult.isValid) {
    toast({ title: "Invalid", description: titleResult.error, variant: "destructive" });
    return;
  }

  // Rate limit
  if (!rateLimiter.canAttempt(`save-${user?.id}`, 5, 60000)) {
    toast({ title: "Rate Limited", description: "Wait before retrying", variant: "destructive" });
    return;
  }

  // Use sanitized content
  await supabase.from("decks").insert({
    title: titleResult.sanitized!,
    user_id: user?.id,
  });
};
```

### Database Queries

```tsx
// Select with join
const { data } = await supabase
  .from("study_sessions")
  .select(`*, decks(title)`)
  .eq("user_id", user?.id)
  .order("started_at", { ascending: false })
  .limit(50);

// Insert
await supabase.from("flashcards").insert([{
  deck_id,
  question,
  answer,
  difficulty_level: 3,
  card_order: cards.length + 1,
}]);

// Update
await supabase.from("decks")
  .update({ title, description })
  .eq("id", deckId);

// Delete
await supabase.from("flashcards")
  .delete()
  .eq("id", cardId);
```

---

## Edge Functions

### generate-flashcard

| Property | Value |
|----------|-------|
| Runtime | Deno |
| Auth | Required (JWT) |
| Rate Limit | 10/minute |
| AI Model | gpt-4o-mini |
| Input | `{ deckTitle: string }` (3-200 chars) |
| Output | `{ question, answer, difficulty }` |

**Security Features:**
- Prompt injection detection
- Input length validation
- Output sanitization

### generate-image

| Property | Value |
|----------|-------|
| Runtime | Deno |
| Auth | NOT REQUIRED (bug) |
| AI Model | gpt-image-1 (DALL-E) |
| Input | `{ prompt, size?, quality? }` |
| Output | `{ success, imageData, prompt }` |
| Sizes | 1024x1024, 1536x1024, 1024x1536 |

---

## Known Issues

### Security Gaps

| Issue | Severity | Location |
|-------|----------|----------|
| No auth on image generation | HIGH | `generate-image/index.ts` |
| CORS allows all origins | MEDIUM | Both edge functions |
| Rate limit resets on cold start | MEDIUM | Edge functions |

### Technical Debt

| Issue | Impact |
|-------|--------|
| TypeScript not strict | Type safety reduced |
| No database indexes | Slower queries |
| No tests | No coverage |
| Components > 400 lines | Hard to maintain |

---

## Development Commands

```bash
npm run dev      # Start dev server (localhost:8080)
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

---

## Import Shortcuts

```typescript
// Components
import { Component } from "@/components/Component";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Hooks
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Utilities
import { supabase } from "@/integrations/supabase/client";
import { validateTitle, validateQuestion, rateLimiter } from "@/lib/security";

// Icons
import { Plus, Edit, Trash2, Brain, ArrowLeft } from "lucide-react";
```

---

## Database Schema Quick Reference

| Table | Key Columns | Constraints |
|-------|-------------|-------------|
| profiles | user_id, display_name, email | user_id UNIQUE |
| decks | user_id, title, is_public, total_cards | title max 200 |
| flashcards | deck_id, question, answer, difficulty_level | question max 2000, answer max 5000, difficulty 1-5 |
| study_sessions | user_id, deck_id, started_at, ended_at, correct/incorrect | - |
| flashcard_performance | user_id, flashcard_id, session_id, is_correct | UNIQUE(session_id, flashcard_id) |
| user_roles | user_id, role | role ENUM (admin, moderator, creator) |
| audit_log | user_id, action, table_name, old/new_values | admin read-only |

---

## Content Limits

| Field | Max Length | Validation |
|-------|------------|------------|
| Title | 255 (client), 200 (DB) | Client + DB constraint |
| Description | 1000 | Client + DB constraint |
| Question | 2000 | Client + DB constraint |
| Answer | 2000 (client), 5000 (DB) | Client + DB constraint |
| Category | 100 | Client only |
| Display Name | 100 | Client only |

---

## Task Checklist

When making changes, verify:

- [ ] Security validation for user inputs
- [ ] Error handling with toast notifications
- [ ] Loading states
- [ ] TypeScript types
- [ ] RLS policies for new tables
- [ ] Rate limiting for expensive operations
- [ ] Documentation updates if needed

---

## Related Files

| Topic | File |
|-------|------|
| Project overview | `README.md` |
| Version history | `CHANGELOG.md` |
| Security audit | `docs/AUDIT.md` |
| Product roadmap | `docs/ROADMAP.md` |
| Multi-agent guide | `docs/agents.md` |
| Claude-specific | `docs/claude.md` |

---

*Last updated: December 30, 2025*
