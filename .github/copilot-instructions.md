## 1. Project Context

This repository contains a microblogging web application ("Microlog") inspired by Twitter, focused on public, short-form posts and replies.

**What this app is NOT:**  
- No direct/private messaging  
- No retweets or reposts  
- No follower/following graph (all posts are globally visible to all authenticated users)

**Tech Stack**

| Layer      | Technology      | Version | Purpose                                 |
|------------|----------------|---------|-----------------------------------------|
| Frontend   | Next.js        | 14      | SSR React app, routing, and UI          |
| Backend    | Next.js API    | 14      | RESTful API endpoints                   |
| Database   | PostgreSQL     | 15+     | Relational data, foreign keys           |
| ORM        | Prisma         | 5       | Type-safe DB access                     |
| Auth       | NextAuth.js    | 5       | Authentication/session management       |
| Styling    | Tailwind CSS   | 3       | Utility-first CSS framework             |
| Logging    | Winston        | 3       | Structured, production-grade logging    |
| Testing    | Jest + RTL     | 29+     | Unit/component testing                  |

---

## 2. Security Standards (apply to every review)
- SQL injection prevention: Use Prisma parameterized queries only — never use raw string interpolation.
- XSS prevention: Never use `dangerouslySetInnerHTML` unless content is sanitized.
- CSRF protection: NextAuth handles session tokens — do not bypass or reimplement.
- Input validation: All API routes must validate inputs before any DB call.

---

## 3. Correctness Standards
- All API routes must return typed responses matching the interfaces in `types/`.
- Feed must always be sorted by `createdAt DESC` — never trust client-provided sort order.
- Like toggle must use upsert or atomic transaction — never use separate insert + delete.
- Reply depth is capped at 1 — replies to replies are forbidden at the API layer.

---

## 4. Performance Standards
- Feed queries must use cursor-based pagination (`createdAt` + `id` cursor) — no OFFSET pagination.
- Do not add logging statements inside any loop or feed render path.
- All DB queries must use indexed columns — never filter on non-indexed fields.

---

## 5. Code Review Output Format
For every issue found, use this exact format:

- Line(s): [line numbers]
- Severity: [Blocking / Non-Blocking]
- Category: [Bug Fix / Enhancement / Documentation] — Priority: [P1 / P2 / P3]
- Issue: [one sentence]
- Proposed Fix: [exact code block]

---

## 6. What Copilot Must NOT Do
- Suggest redesigns outside the current PR scope
- Critique NextAuth internals — auth is handled externally
- Add `console.log` statements — use the Winston logger in `lib/logger.ts` only
- Suggest OFFSET-based pagination

---

## 7. Examples

**Good review comment:**
> - Line(s): [42-47]
> - Severity: Blocking
> - Category: Bug Fix — Priority: P1
> - Issue: Input validation is missing for the `content` field in the post creation API.
> - Proposed Fix:
>   ```typescript
>   if (!content || content.trim().length < 1 || content.length > 280) {
>     return NextResponse.json({ error: "Content must be 1–280 characters." }, { status: 400 });
>   }
>   ```

**Bad review comment:**
> "Consider switching to a different authentication provider for better security."

---
