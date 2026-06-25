# 🤝 Contributing Guide — ChatCart

Thank you for contributing to ChatCart! This guide covers how to work on
the codebase, submit changes, and maintain code quality.

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [Branch Strategy](#3-branch-strategy)
4. [Commit Messages](#4-commit-messages)
5. [Code Style](#5-code-style)
6. [Frontend Guidelines](#6-frontend-guidelines)
7. [Backend Guidelines](#7-backend-guidelines)
8. [Testing](#8-testing)
9. [Pull Request Process](#9-pull-request-process)
10. [Issue Reporting](#10-issue-reporting)

---

## 1. Code of Conduct

- Be respectful and constructive in all interactions
- No discrimination based on gender, nationality, religion, or experience level
- Write code that is readable by others — code is for humans first
- Speak up if you see something wrong — security issues especially

---

## 2. Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/chatcart.git
cd chatcart

# 3. Add upstream remote
git remote add upstream https://github.com/your-org/chatcart.git

# 4. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 5. Set up environment
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 6. Create a feature branch
git checkout -b feature/add-map-search

# 7. Make changes, then commit
git add .
git commit -m "feat(search): add map-based listing search"

# 8. Push and open a Pull Request
git push origin feature/add-map-search
```

---

## 3. Branch Strategy

We use **Git Flow** with the following branches:

| Branch | Purpose | Deploy to |
|---|---|---|
| `main` | Production-ready code | Production |
| `develop` | Integration branch | Staging |
| `feature/*` | New features | — |
| `fix/*` | Bug fixes | — |
| `hotfix/*` | Critical production fixes | Production |
| `docs/*` | Documentation only | — |

### Branch Naming

```bash
# Features
git checkout -b feature/whatsapp-chatbot
git checkout -b feature/mtn-momo-payment
git checkout -b feature/map-search

# Bug fixes
git checkout -b fix/listing-image-upload
git checkout -b fix/otp-expiry-bug

# Documentation
git checkout -b docs/api-reference
git checkout -b docs/deployment-guide
```

---

## 4. Commit Messages

We follow **Conventional Commits**:

```
type(scope): short description (max 72 chars)

Optional longer description explaining WHY, not WHAT.

Closes #123
```

### Types

| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `refactor` | Code restructure (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build, CI, dependency updates |
| `revert` | Reverting a commit |

### Scopes

```
auth, listings, payments, whatsapp, admin, search,
notifications, upload, ui, api, db, deps
```

### Examples

```bash
feat(auth): add phone OTP login with Africa's Talking SMS
fix(listings): prevent duplicate WhatsApp lead tracking
docs(deployment): add Railway deployment instructions
perf(search): add Meilisearch result caching in Redis
chore(deps): upgrade React to 19.2.6
feat(payments)!: migrate from MTN sandbox to production API
```

> The `!` suffix marks breaking changes.

---

## 5. Code Style

### TypeScript Rules

```typescript
// ✅ Good — explicit types, clear naming
const formatPrice = (amount: number, currency: Currency): string => {
  return `${currency} ${amount.toLocaleString()}`;
};

// ❌ Bad — implicit any, unclear name
const fp = (a, c) => `${c} ${a}`;

// ✅ Good — descriptive interfaces
interface ListingCardProps {
  listing: Listing;
  onView: (id: string) => void;
  compact?: boolean;
}

// ✅ Good — early returns reduce nesting
function processListing(listing: Listing | null): string {
  if (!listing) return 'Not found';
  if (listing.status !== 'active') return 'Unavailable';
  return listing.title;
}
```

### General Rules

- **No `any`** — use `unknown` and narrow the type
- **No unused variables** — TypeScript enforces this (`noUnusedLocals`)
- **No console.log in production code** — use the logger service
- **Max line length: 100 chars** (enforced by Prettier)
- **No magic numbers** — use named constants
- **Prefer `const` over `let`**; never use `var`

### File Naming

```
Components:   PascalCase   → ListingCard.tsx
Hooks:        camelCase    → useListings.ts
Services:     camelCase    → listings.service.ts
Types:        camelCase    → types.ts
Pages:        PascalCase   → HomePage.tsx
Utils:        camelCase    → phone.util.ts
```

---

## 6. Frontend Guidelines

### Component Structure

```typescript
// Standard component template
import { useState, useEffect } from "react";
import { SomeIcon } from "lucide-react";
import { useHook } from "../lib/hooks";
import type { SomeType } from "../lib/types";

// ── Types ────────────────────────────────────────────────────────────────────
interface Props {
  requiredProp: string;
  optionalProp?: number;
  onAction: (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ComponentName({ requiredProp, optionalProp = 0, onAction }: Props) {
  // State
  const [localState, setLocalState] = useState(false);

  // Queries/mutations
  const { data, isLoading } = useHook();

  // Derived values
  const computedValue = data?.length ?? 0;

  // Handlers
  const handleClick = () => {
    onAction(requiredProp);
  };

  // Loading state
  if (isLoading) return <LoadingSkeleton />;

  // Render
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}
```

### Tailwind CSS Rules

```tsx
// ✅ Good — use design system classes
<button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition-colors">

// ❌ Bad — inline styles
<button style={{ backgroundColor: '#7c3aed', color: 'white' }}>

// ✅ Good — conditional classes
<div className={`p-4 rounded-xl ${isActive ? 'bg-purple-100 border-purple-500' : 'bg-gray-50 border-gray-200'}`}>

// ✅ Good — responsive design mobile-first
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### React Query Pattern

```typescript
// Always use the hooks in src/lib/hooks.ts
// Never call API functions directly in components

// ✅ Good
const { data, isLoading, error } = useListings({ category: 'Products' });

// ❌ Bad — breaks the data layer abstraction
const [data, setData] = useState(null);
useEffect(() => { listingsApi.getAll().then(setData); }, []);
```

### Accessibility

```tsx
// ✅ Always include aria labels on icon-only buttons
<button aria-label="Add to wishlist">
  <Heart className="w-4 h-4" />
</button>

// ✅ Use semantic HTML
<main>, <nav>, <header>, <section>, <article>

// ✅ Ensure color contrast (WCAG AA minimum)
// Purple on white: use purple-600 or darker
```

---

## 7. Backend Guidelines

### NestJS Conventions

```typescript
// ✅ Always validate DTOs
@Post()
async create(@Body() dto: CreateListingDto, @CurrentUser() user: User) {
  return this.listingsService.create(dto, user);
}

// ✅ Use services for business logic (not controllers)
// Controllers: routing + validation only
// Services: business logic + database calls

// ✅ Use repository pattern with TypeORM
@InjectRepository(Listing)
private listingRepo: Repository<Listing>;

// ✅ Never expose passwords or tokens in responses
// Use @Exclude() decorator on sensitive fields

// ✅ Use transactions for multi-step operations
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  await queryRunner.manager.save(order);
  await queryRunner.manager.save(payment);
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

### Security Checklist

```
□ All endpoints validate input with class-validator
□ Auth-required endpoints use @UseGuards(JwtAuthGuard)
□ Admin endpoints use @Roles(UserRole.ADMIN)
□ Rate limiting applied to auth endpoints
□ Passwords hashed with bcrypt (rounds: 12)
□ JWT secrets are random 256-bit strings
□ File uploads validate MIME type (not just extension)
□ SQL injection prevented by TypeORM parameterized queries
□ Sensitive data excluded from API responses
□ CORS configured to allowed origins only
```

---

## 8. Testing

### Frontend Tests

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Component test example
describe('ListingCard', () => {
  it('shows WhatsApp button', () => {
    render(<ListingCard listing={mockListing} onView={jest.fn()} />);
    expect(screen.getByText('Buy on WhatsApp')).toBeInTheDocument();
  });

  it('opens WhatsApp with pre-filled message', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation();
    render(<ListingCard listing={mockListing} onView={jest.fn()} />);
    fireEvent.click(screen.getByText('Buy on WhatsApp'));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank'
    );
  });
});
```

### Backend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test a specific module
npm run test -- --testPathPattern=auth
```

```typescript
// E2E test example
describe('POST /v1/auth/otp/send', () => {
  it('should send OTP successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/otp/send')
      .send({ phone: '+256700000000' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.sessionId).toBeDefined();
  });

  it('should reject invalid phone number', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/otp/send')
      .send({ phone: '12345' })
      .expect(400);
  });
});
```

---

## 9. Pull Request Process

### Before Opening a PR

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/develop

# 2. Run all checks
npm run build          # Must pass
npm run test           # Must pass
npx tsc --noEmit      # No type errors

# 3. Self-review your diff
git diff origin/develop
```

### PR Template

When opening a PR, include:

```markdown
## Summary
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Related Issues
Closes #123

## Changes Made
- Added X
- Modified Y
- Removed Z

## Screenshots (if UI changes)
[Before screenshot]
[After screenshot]

## Testing Done
- [ ] Unit tests pass
- [ ] Manual testing done
- [ ] Tested on mobile

## Checklist
- [ ] Code follows project style guide
- [ ] No console.log statements
- [ ] No sensitive data in code
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass (build, tests, lint)
2. **At least 1 approval** from a maintainer required
3. **No unresolved comments** before merging
4. Merging method: **Squash and merge** (keep history clean)

---

## 10. Issue Reporting

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Screenshots**
If applicable.

**Environment**
- OS: Ubuntu 22.04
- Browser: Chrome 120
- Node.js: 20.x
- App version: 1.0.0

**Logs**
```
Paste relevant console errors here
```
```

### Feature Request Template

```markdown
**Problem this solves**
Describe the problem your feature would solve.

**Proposed Solution**
Describe your solution.

**Alternatives Considered**
Other approaches you thought of.

**Additional Context**
Any other relevant information.
```

### Security Vulnerabilities

**Do NOT open a public GitHub issue for security bugs.**

Instead, email: **security@chatcart.africa**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We respond to security reports within 24 hours and aim to patch
within 72 hours.
