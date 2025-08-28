### Engineering Rules (Quick Reference)

- **Svelte 5**: use runes (`$state`, `$derived`, `$effect`, `$props`), `onclick` events, snippets, fragments, attachments.
- **Shadcn-Svelte**: use primitives from `src/lib/components/ui`; follow official docs for usage; keep components composable and accessible.
- **Supabase**: on server use `event.locals.supabase` + `locals.safeGetSession()`; prefer `auth.getUser()` over `auth.getSession()`; enforce RLS; check `{ data, error }`.

See detailed checklists in `.github/instructions/`:

- `svelte.instructions.md`
- `shadcn-svelte.instructions.md`
- `supabase.instructions.md`
