# Claude AI Assistant Guide

> Instructions for Claude (Anthropic) when working with the FlashFusion Creative Hub codebase.

---

## Project Overview

**FlashFusion Creative Hub** is a full-stack learning platform built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: OpenAI GPT-4o-mini + DALL-E

---

## Quick Context

### Project Structure

```
src/
├── components/     # React components (12 main + 30 UI)
├── contexts/       # AuthContext for auth state
├── hooks/          # use-toast, use-mobile
├── integrations/   # Supabase client and types
├── lib/            # security.ts, utils.ts
└── pages/          # Index, Auth, Creator, Owner, NotFound

supabase/
├── functions/      # Edge functions (generate-flashcard, generate-image)
└── migrations/     # SQL migrations (2 files)
```

### Key Files to Know

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/security.ts` | Input validation, XSS/SQL protection, rate limiting | 414 |
| `src/contexts/AuthContext.tsx` | Authentication state management | 84 |
| `src/components/DeckManager.tsx` | Deck CRUD operations | 403 |
| `src/components/FlashcardEditor.tsx` | Flashcard CRUD + AI generation | 424 |
| `src/components/StudySession.tsx` | Interactive study mode | 325 |
| `src/components/Analytics.tsx` | Performance charts | 406 |
| `supabase/functions/generate-flashcard/index.ts` | AI flashcard generation | 197 |

---

## Code Conventions

### TypeScript Patterns

```typescript
// Component interfaces
interface ComponentProps {
  onAction?: (id: string) => void;
  deckId?: string;
}

// Form state
const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: "",
  is_public: false,
});

// Supabase queries
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("column", value);
```

### Security Patterns

Always use these validation functions from `src/lib/security.ts`:

```typescript
import { validateTitle, validateDescription, validateQuestion, validateAnswer, rateLimiter } from "@/lib/security";

// Validate before saving
const titleValidation = validateTitle(formData.title, user?.id);
if (!titleValidation.isValid) {
  toast({ title: "Error", description: titleValidation.error, variant: "destructive" });
  return;
}

// Use sanitized content
const sanitizedData = {
  title: titleValidation.sanitized!,
  description: descriptionValidation.sanitized!,
};

// Rate limiting
if (!rateLimiter.canAttempt(`action-${userId}`, 5, 60000)) {
  toast({ title: "Rate Limit", description: "Please wait...", variant: "destructive" });
  return;
}
```

### Component Structure

```tsx
// Standard component structure
const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // 1. State hooks
  const [state, setState] = useState(initialValue);

  // 2. Context hooks
  const { user } = useAuth();
  const { toast } = useToast();

  // 3. Effects
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // 4. Handlers
  const handleAction = async () => { /* ... */ };

  // 5. Render
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

---

## Database Schema

### Tables

| Table | Key Columns |
|-------|-------------|
| profiles | id, user_id, display_name, email, avatar_url |
| decks | id, user_id, title, description, category, is_public, total_cards |
| flashcards | id, deck_id, question, answer, difficulty_level, card_order |
| study_sessions | id, user_id, deck_id, started_at, ended_at, correct_answers, incorrect_answers |
| flashcard_performance | id, user_id, flashcard_id, session_id, is_correct, response_time_ms |
| user_roles | id, user_id, role (ENUM: admin, moderator, creator) |
| audit_log | id, user_id, action, table_name, old_values, new_values |

### RLS Policies

All tables have Row Level Security enabled. Key patterns:
- Users can only see their own data
- Public decks are viewable by all authenticated users
- Admins can access audit logs and manage roles

### Constraints

| Table | Constraint |
|-------|------------|
| flashcards.question | Max 2000 chars |
| flashcards.answer | Max 5000 chars |
| flashcards.difficulty_level | 1-5 |
| decks.title | Max 200 chars |
| decks.description | Max 1000 chars |

---

## Edge Functions

### generate-flashcard

```typescript
// Location: supabase/functions/generate-flashcard/index.ts
// Auth: Required (JWT)
// Rate Limit: 10 req/min
// Model: gpt-4o-mini

// Input validation includes:
// - Deck title required (3-200 chars)
// - Prompt injection pattern detection
// - Output sanitization (question max 2000, answer max 5000)
```

### generate-image

```typescript
// Location: supabase/functions/generate-image/index.ts
// Auth: Not required (NEEDS FIX)
// Model: gpt-image-1 (DALL-E)
// Output: WebP base64

// Sizes: 1024x1024, 1536x1024, 1024x1536
```

---

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Use existing patterns from similar components
3. Import shadcn/ui components from `@/components/ui/`
4. Add security validation if handling user input
5. Use toast for user feedback

### Adding a New Page

1. Create file in `src/pages/`
2. Add route in `src/App.tsx`
3. Wrap with `<ProtectedRoute>` if auth required

### Adding a New Database Table

1. Create migration in `supabase/migrations/`
2. Enable RLS: `ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;`
3. Add appropriate policies
4. Update `src/integrations/supabase/types.ts` (auto-generated)

### Adding Security Validation

1. Define limits in `SECURITY_LIMITS` object
2. Create validation function using `validateAndSanitizeText`
3. Add to enhanced validation functions
4. Use in component with `securityMonitor.logEvent()` for failures

---

## Known Issues

### High Priority (Fix First)

1. **Image Generation No Auth** - `generate-image` function lacks JWT verification
2. **CORS Wildcard** - Both edge functions use `'Access-Control-Allow-Origin': '*'`
3. **In-Memory Rate Limiting** - Edge function rate limits reset on cold start

### Medium Priority

1. **TypeScript Strict Mode** - Currently disabled (`noImplicitAny: false`)
2. **No Database Indexes** - Missing indexes on foreign keys
3. **Client-Only Security Logging** - Events not persisted to server

### Low Priority

1. **Large Components** - Some exceed 400 lines
2. **No Unit Tests** - 0% coverage
3. **No Error Boundaries** - Missing crash recovery

---

## Testing Locally

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## Questions to Ask Before Changes

1. **Security Impact**: Does this change affect authentication, authorization, or user data?
2. **Database Impact**: Are there schema changes that need migrations?
3. **Breaking Changes**: Will this affect existing functionality?
4. **Performance Impact**: Are there N+1 queries or expensive operations?

---

## Helpful Commands

```bash
# View project structure
tree -I node_modules -L 3

# Search for patterns
grep -r "pattern" src/

# Check TypeScript errors
npx tsc --noEmit
```

---

## Contact Points

- **Documentation**: `/docs/` folder
- **Audit Report**: `/docs/AUDIT.md`
- **Roadmap**: `/docs/ROADMAP.md`

---

*Last updated: December 30, 2025*
