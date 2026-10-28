---
name: gh-public-challenge
description: Publish an approved MEGA course deliverable as a public GitHub repository and issues through an already authenticated gh CLI.
---

Ask before creating or changing anything on GitHub. State the account, repo
name, public audience, and intended writes. Approval for one Challenge does
not authorize another repo or unrelated account changes.

Check `command -v gh` and `gh auth status` without exposing credentials.
If authentication is missing, ask before `gh auth login`; the human completes
the sign-in. Read each subcommand's `--help` before choosing its flags.

Check whether the target exists with `gh repo view OWNER/REPO`. Do not assume
a failed request means it is absent: inspect authentication and network errors.
For an approved new repo, `gh repo create OWNER/REPO --public` creates it.
Publish only the isolated deliverable folder, never the parent course checkout,
local logs, .env, or unrelated work. Review staged paths before committing.

Create each approved issue with `gh issue create --repo OWNER/REPO --title TITLE
--body-file FILE`. Save the returned URL. Before retrying an uncertain write,
list existing issues to avoid duplicates. Verify issues and visibility by reading
them back. Stop for a new decision if the audience or target differs from approval.

To close a ticket when explicitly authorized, use `gh issue close NUMBER --repo
OWNER/REPO --reason completed` or `--reason 'not planned'` as appropriate, then
verify the state with `gh issue view`. Do not close issues merely to make a
Challenge submission look finished.
