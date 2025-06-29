# Cleanup Instructions for Test Scripts with Secrets

If you encounter errors related to secrets in the repository, particularly with test-live-subscription.js:

1. NEVER commit API keys, tokens, or secrets directly in code
2. Always use environment variables loaded from .env.local files
3. Follow these steps to clean up:

## Step 1: Replace hardcoded secrets
- Replace API keys with `process.env.VARIABLE_NAME`
- Ensure all environment variables are properly documented

## Step 2: Add affected files to .gitignore
- Test scripts with sensitive information should be listed in .gitignore

## Step 3: Set up GitHub Secret Scanning Alerts
- Enable Secret Scanning in repository settings
- Configure push protection to block commits with secrets

## Step 4: When a push is blocked
- Rewrite Git history to remove secrets:
  ```
  git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file/with/secrets" \
  --prune-empty --tag-name-filter cat -- --all
  ```
- Force push the changes:
  ```
  git push --force
  ```

## Step 5: Use safer testing alternatives
- Use test-webhook-debug.js which properly uses environment variables
- Always ensure test files are reading from .env.local
