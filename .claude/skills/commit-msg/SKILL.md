---
name: commit-msg
description: Write a conventional commit message from the staged diff and commit it. Use when the user says "write a commit message", "generate a commit", "commit my changes", or runs /commit-msg.
---

# /commit-msg

Generate a conventional commit message from the currently staged changes and commit them.

## Workflow

### 1. Check for staged changes

```bash
git diff --staged --stat
```

If the output is empty, **stop immediately**. Do not stage anything, do not commit, do not
create a message. Tell the user:

> Nothing is staged. Stage the changes you want to commit (`git add <paths>`), then run
> /commit-msg again.

Never run `git add` on the user's behalf in this skill — the staged set is the user's
deliberate choice of what belongs in this commit.

### 2. Read the staged diff

```bash
git diff --staged
```

For a large diff, lead with `git diff --staged --stat` to see the shape, then read the full
diff. Base the message only on what is actually in the staged diff — not on unstaged work,
not on the conversation history, not on what you assume the user intended.

### 3. Write the message

Format:

```
type(scope): short subject

- bullet of what changed
- bullet of why
```

**Types** — pick exactly one:

| Type       | Use for                                             |
| ---------- | --------------------------------------------------- |
| `feat`     | New user-facing capability                          |
| `fix`      | Bug fix                                             |
| `refactor` | Restructuring with no behaviour change              |
| `chore`    | Tooling, deps, config, housekeeping                 |
| `docs`     | Documentation only                                  |
| `style`    | Formatting, whitespace, naming — no logic change    |
| `test`     | Tests only                                          |

**Subject line rules:**

- Under 60 characters, including the `type(scope):` prefix
- Imperative mood ("add", not "added" or "adds")
- Lowercase after the colon, no trailing period
- Scope is optional — use the feature or area touched (`items`, `auth`, `dashboard`,
  `mock-data`). Omit the parentheses entirely when the change spans the whole project.

**Body rules:**

- Bullets are optional but encouraged — include them whenever the subject alone doesn't
  explain the change
- Cover both *what* changed and *why*; the why matters more, since the diff already shows
  the what
- One concern per bullet, no wrapped paragraphs
- Skip the body only for changes that are genuinely self-explanatory (a typo fix, a version bump)

**Never include a `Co-Authored-By` trailer**, a "Generated with Claude" line, or any other AI
attribution. The message ends with the last bullet.

If the staged diff mixes unrelated concerns (e.g. a bug fix plus a dependency bump), say so
and suggest splitting into separate commits — but still write the best single message you can
and proceed unless the user says otherwise.

### 4. Commit

Use a heredoc so the multi-line message survives the shell:

```bash
git commit -m "$(cat <<'EOF'
type(scope): short subject

- bullet of what changed
- bullet of why
EOF
)"
```

In PowerShell, use a single-quoted here-string instead, with the closing `'@` at column 0:

```powershell
git commit -m @'
type(scope): short subject

- bullet of what changed
- bullet of why
'@
```

Never pass `--no-verify`. If a pre-commit hook fails, report the failure and fix the
underlying issue rather than bypassing it.

### 5. Report

Show the resulting commit — short SHA, branch, and files-changed summary:

```bash
git log -1 --stat --oneline
```

## Example

Staged diff: a new mock data module plus the type definitions it exports.

```
feat(mock-data): add dashboard mock data source

- Add src/lib/mock-data.ts exporting user, item types, collections and items
- Gives the dashboard UI a single import to build against until Prisma lands
```
