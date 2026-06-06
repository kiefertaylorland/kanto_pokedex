<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project Documentation

When you need context on any of the following topics, read the corresponding
file in `docs/` before responding or making changes.

| File | When to read |
|---|---|
| `docs/01-executive-summary.md` | Understanding project purpose & scope |
| `docs/02-assumptions-open-questions-resolved.md` | Resolving ambiguities or open questions |
| `docs/03-sdlc-plan.md` | Development process, branching, QA gates |
| `docs/04-brd-business-requirements-document.md` | Business rules & stakeholder needs |
| `docs/05-prd-product-requirements-document.md` | Feature requirements & acceptance criteria |
| `docs/06-technical-specification.md` | Architecture, APIs, integrations |
| `docs/07-data-model.md` | Database schema, entity relationships |
| `docs/08-recommended-architecture-decisions.md` | ADRs and design rationale |
| `docs/09-delivery-roadmap.md` | Milestones and phasing |
| `docs/10-next-steps.md` | Current priorities and open work |

## Security Constitution

MANDATORY: Before implementing or reviewing any feature that involves
authentication, authorization, secrets, input validation, data persistence,
HTTP headers, error handling, or admin operations — read
`.specify/memory/constitution.md` in full and ensure all work complies with
the principles defined there.

Do not skip this step. If constitution principles conflict with a user
request, surface the conflict and ask before proceeding.