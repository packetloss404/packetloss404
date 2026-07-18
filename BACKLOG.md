## Portfolio audit backlog — 2026-07-17
_Findings from a 2026-07-17 code audit, preserved for later._

### Later / deferred
- **[low/S]** No package.json (Node 22 build)
  - Fix: Add root package.json with {"private":true,"engines":{"node":">=22"},"scripts":{"build":"node scripts/daily-build.js"}}. Marginal — repo has zero npm deps (only fs/path/child_process), so mainly ergonomic (npm run build alias + engine pin).
- **[low/M]** No tests / no golden snapshot despite seed=42 byte-identical invariant
  - Fix: Add a snapshot test running generate-packet.js --seed=42 and diffing against a committed golden SVG. Low value for cosmetic profile art; only meaningful once package.json exists.
- **[low/S]** Duplicated loadJson helper across scripts
  - Fix: Extract loadJson into scripts/lib/util.js and require it from daily-build.js, fetch-commits.js, fetch-stars.js, build-readme.js (fetch-youtube.js deleted). Cosmetic DRY of a 3-line helper.
- **[low/S]** Duplicated dayOfYear helper across build-readme.js + daily-build.js
  - Fix: Move dayOfYear into the same scripts/lib/util.js as loadJson and import in both. Batch with the loadJson dedup.
- **[low/S]** Committed large generated artifact pixel-packet.svg (~2MB)
  - Fix: pixel-packet.svg is build output of generate-packet.js and is NOT referenced by README (README uses packetloss404.jpg + cards/*.svg). git rm --cached it and add to .gitignore. Keep packetloss404.jpg — it is the live displayed banner. 2MB is harmless bloat, not urgent; no history rewrite needed.

### Known limitations (deliberate — not planned)
- No lockfile
