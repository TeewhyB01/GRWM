# GRWM Admin

Next.js App Router shell for the GRWM admin dashboard.

The current shell uses TypeScript, a placeholder protected layout, and privacy-aware operational views. Firebase Authentication and role-based access control will replace the local placeholder session in the next backend phase.

## Routes

- `/login`
- `/dashboard`
- `/users`
- `/ai-monitoring`
- `/moderation`
- `/subscriptions`
- `/affiliate`
- `/settings`

## Commands

```bash
pnpm --filter admin dev
pnpm --filter admin typecheck
pnpm --filter admin lint
pnpm --filter admin test
```
