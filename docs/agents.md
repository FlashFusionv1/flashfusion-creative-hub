# AI Agents Guide

> Universal instructions for AI coding assistants working with FlashFusion Creative Hub.

This guide provides structured context for any AI coding assistant (Claude, GPT, Gemini, Copilot, etc.) to effectively work with this codebase.

---

## Project Identity

| Attribute | Value |
|-----------|-------|
| **Name** | FlashFusion Creative Hub |
| **Type** | Full-stack learning platform |
| **Primary Language** | TypeScript |
| **Framework** | React 18 (Vite) |
| **Backend** | Supabase (PostgreSQL + Deno Edge Functions) |
| **AI Integration** | OpenAI (GPT-4o-mini, DALL-E) |
| **Status** | MVP Complete, Active Development |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  React 18 + TypeScript + Tailwind + shadcn/ui   │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Auth   │  │ Database │  │ Edge Functions│  │
│  │  (JWT)   │  │  (PG+RLS)│  │    (Deno)     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  OpenAI API                      │
│         GPT-4o-mini + DALL-E (gpt-image-1)      │
└─────────────────────────────────────────────────┘
```

---

## Directory Structure

```
flashfusion-creative-hub/
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── DeckManager.tsx   # Deck CRUD (403 lines)
│   │   ├── FlashcardEditor.tsx  # Card editing (424 lines)
│   │   ├── StudySession.tsx  # Study mode (325 lines)
│   │   ├── Analytics.tsx     # Charts (406 lines)
│   │   ├── CreatorDashboard.tsx  # AI tools (237 lines)
│   │   ├── OwnerDashboard.tsx    # Business (291 lines)
│   │   └── ... (12 total main components)
│   │
│   ├── contexts/AuthContext.tsx  # Auth state
│   ├── hooks/                    # Custom hooks
│   ├── integrations/supabase/    # Supabase client
│   ├── lib/security.ts           # Security utilities
│   ├── pages/                    # Route components
│   └── App.tsx                   # Root component
│
├── supabase/
│   ├── functions/            # Edge functions
│   │   ├── generate-flashcard/
│   │   └── generate-image/
│   └── migrations/           # SQL migrations
│
├── docs/                     # Documentation
├── CHANGELOG.md              # Version history
└── package.json              # Dependencies
```

---

## Key Technical Decisions

### 1. State Management

| Layer | Solution |
|-------|----------|
| Server State | TanStack Query (React Query) |
| Auth State | React Context (AuthContext) |
| Form State | React Hook Form + Zod |
| UI State | Local useState |

### 2. Security Architecture

| Layer | Implementation |
|-------|----------------|
| Client Validation | `src/lib/security.ts` (XSS, SQL injection patterns) |
| Authentication | Supabase Auth (JWT) |
| Authorization | PostgreSQL RLS (Row Level Security) |
| Rate Limiting | Client-side + Edge function (10 req/min) |
| Audit Logging | Database triggers on sensitive tables |

### 3. Database Design

| Table | Purpose | RLS |
|-------|---------|-----|
| profiles | User data | Yes |
| decks | Flashcard collections | Yes |
| flashcards | Individual cards | Yes |
| study_sessions | Session records | Yes |
| flashcard_performance | Per-card metrics | Yes |
| user_roles | RBAC | Yes |
| audit_log | Security logging | Yes (admin only) |

### 4. API Design

| Endpoint | Auth | Rate Limit | Model |
|----------|------|------------|-------|
| generate-flashcard | Required | 10/min | GPT-4o-mini |
| generate-image | None* | None* | DALL-E |

*Security gap - needs fixing

---

## Code Patterns

### Component Pattern

```tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateTitle, rateLimiter } from "@/lib/security";

interface ComponentProps {
  itemId?: string;
  onComplete?: (data: any) => void;
}

const MyComponent = ({ itemId, onComplete }: ComponentProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("table")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>{/* Content */}</CardContent>
    </Card>
  );
};

export default MyComponent;
```

### Security Validation Pattern

```tsx
import { validateTitle, validateDescription, rateLimiter } from "@/lib/security";

const handleSave = async () => {
  // 1. Validate inputs
  const titleValidation = validateTitle(formData.title, user?.id);
  if (!titleValidation.isValid) {
    toast({ title: "Invalid", description: titleValidation.error, variant: "destructive" });
    return;
  }

  // 2. Check rate limit
  if (!rateLimiter.canAttempt(`action-${user?.id}`, 5, 60000)) {
    toast({ title: "Rate Limited", description: "Please wait", variant: "destructive" });
    return;
  }

  // 3. Use sanitized content
  const { error } = await supabase.from("table").insert({
    title: titleValidation.sanitized!,
  });
};
```

### Supabase Query Patterns

```tsx
// SELECT with joins
const { data } = await supabase
  .from("study_sessions")
  .select(`*, decks (title)`)
  .eq("user_id", user?.id)
  .order("started_at", { ascending: false })
  .limit(50);

// INSERT
const { error } = await supabase
  .from("flashcards")
  .insert([{ question, answer, deck_id, card_order }]);

// UPDATE
const { error } = await supabase
  .from("decks")
  .update({ title, description })
  .eq("id", deckId);

// DELETE
const { error } = await supabase
  .from("flashcards")
  .delete()
  .eq("id", cardId);
```

---

## Common Development Tasks

### Add New Feature

1. Create component in `src/components/`
2. Add route in `src/App.tsx` if needed
3. Use shadcn/ui components from `@/components/ui/`
4. Add security validation for user inputs
5. Handle errors with toast notifications

### Add Database Table

```sql
-- 1. Create table
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  column1 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view own data" ON public.new_table
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. Add constraints if needed
ALTER TABLE public.new_table
ADD CONSTRAINT column1_length CHECK (char_length(column1) <= 1000);
```

### Add Edge Function

```typescript
// supabase/functions/new-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // FIXME: Use specific origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) throw new Error('Authentication required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (error || !user) throw new Error('Invalid authentication');

    // Process request
    const body = await req.json();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Known Issues & Technical Debt

### Critical

| Issue | Location | Risk |
|-------|----------|------|
| No auth on image generation | `generate-image/index.ts` | API abuse |
| CORS wildcard | Both edge functions | Security |

### High

| Issue | Location | Impact |
|-------|----------|--------|
| In-memory rate limiting | Edge functions | Resets on cold start |
| TypeScript not strict | `tsconfig.json` | Type safety reduced |
| No database indexes | Migrations | Query performance |

### Medium

| Issue | Location | Impact |
|-------|----------|--------|
| Large component files | Components | Maintainability |
| No tests | Project-wide | Quality assurance |
| No error boundaries | React app | Crash recovery |

---

## Testing

```bash
# Currently no tests implemented

# Recommended setup:
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test

# Add to package.json:
# "test": "vitest",
# "test:e2e": "playwright test"
```

---

## Environment Variables

| Variable | Location | Required |
|----------|----------|----------|
| OPENAI_API_KEY | Supabase secrets | Yes |
| SUPABASE_URL | Client config | Yes (hardcoded) |
| SUPABASE_ANON_KEY | Client config | Yes (hardcoded) |

---

## Deployment

```bash
# Build
npm run build

# Preview
npm run preview

# Lovable deployment (recommended)
# Use Lovable dashboard: Share > Publish
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `CHANGELOG.md` | Version history |
| `docs/AUDIT.md` | Security audit |
| `docs/ROADMAP.md` | Product roadmap |
| `docs/claude.md` | Claude-specific guide |
| `docs/gemini.md` | Gemini-specific guide |

---

## Quick Reference

### Commands

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview build
```

### Import Aliases

```typescript
import { Component } from "@/components/Component";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { validateTitle } from "@/lib/security";
```

### UI Components (shadcn/ui)

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
```

---

*Last updated: December 30, 2025*
