---
"blocky-ui": minor
---

- Fix TypeScript error in `next.config.js` by removing the deprecated `appIsrStatus` property from `devIndicators`.
- Add a new GitHub Action workflow for Docker preview releases. This workflow builds and pushes multi-platform Docker images to GHCR for every Pull Request and manual dispatch.
