
Use the following rules for Git and commit messages:

1. **Conventional Commits**
   - All commit messages must follow Conventional Commits (type, optional scope, colon, short description).
   - Messages must be clear and understandable; they may be used to generate release notes but are not copied verbatim.

  commitTypes:
  - feat     # Commits, that add or remove a new feature to the API or UI
  - fix      # Commits, that fix a API or UI bug of a preceded feat commit
  - refactor # Commits, that rewrite/restructure your code, however do not change any API or UI behaviour
  - perf     # Commits are special `refactor` commits, that improve performance
  - style    # Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)
  - test     # Commits, that add missing tests or correcting existing tests
  - build    # Commits, that affect build components like build tool, ci pipeline, dependencies, project version, ...
  - ops      # Commits, that affect operational components like infrastructure, deployment, backup, recovery, ...
  - docs     # Commits, that affect documentation only 
  - chore    # Miscellaneous commits e.g. modifying `.gitignore`
  - docs
  - merge

2. **Tooling: git-conventional-commits**
   - Use `git-conventional-commits` from https://github.com/qoomon/git-conventional-commits.
   - Always assume **v1.x**, installed globally as:  
     `npm install --global git-conventional-commits@^1.0.0`  
     (v2.x is not compatible with tag suffixes like `-brewery` and `-vanilla`.)
   - Commands to rely on:
     - `git-conventional-commits init` – create config.
     - `git-conventional-commits version` – compute next version.
     - `git-conventional-commits changelog` – generate changelog.

3. **Git hook enforcement**
   - Assume a `commit-msg` hook exists and **blocks non‑conforming messages**.
   - It lives in `.git-hooks/commit-msg` and calls:  
     `git-conventional-commits commit-msg-hook "$1"`  
     after fixing PATH for Windows.
   - Hooks are shared via Git (`.git-hooks` committed) and activated per user with:  
     `git config core.hooksPath .git-hooks`.

4. **AI behavior**
   - Always produce commit messages that respect Conventional Commits.
   - Prefer meaningful types (e.g., feature, bugfix, chore) and concise descriptions.
   - When describing versioning or changelog automation, base it on the commands above and the Conventional Commits structure.

Sources:

https://cosmo-tech.atlassian.net/wiki/spaces/PRODUCTS/pages/12111316/20210629+-+FETA+-+s01e01+-+Git+conventional+commits