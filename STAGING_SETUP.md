# Staging Environment Setup (Gap #10 — manual Render dashboard task)

This file documents how to set up a staging environment for Wayfinder. Patch 84 cannot
do this in code — it requires Render dashboard configuration.

## Why this matters
Patches 82 and 83 broke the build at various points. Without staging, prod hung on the
previous deploy until a fix was pushed. A staging branch + preview deploy catches these
before prod sees them.

## Setup steps (Dan does this once in Render dashboard)

1. Create a new Render Web Service named "wayfinder-staging" pointing at the same GitHub repo.
2. Branch: `staging` (create the branch in GitHub: `git checkout -b staging && git push -u origin staging`)
3. Build command: same as production
4. Start command: same as production
5. Env vars: copy production env vars but with TEST Stripe keys + a separate JWT secret
6. Custom domain: staging.wayfinderai.org (or skip and use the *.onrender.com URL)

## Workflow after setup

- Push patch branches to `staging` first.
- Verify staging.wayfinderai.org loads cleanly + smoke-test the change.
- Then PR/merge to main → prod auto-deploys.
- For hotfixes that need to skip staging, push to main directly (current behavior).

## Notification of build failures

In Render → service settings → notifications, enable email/Slack on build failure and
deploy failure. Patch 82 + 83 incidents would have been caught the moment Render's build
log hit the parse5 error.

---

This is a 10-minute setup. Worth doing before the next major patch.
