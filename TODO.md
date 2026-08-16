# TODO — Web Design Review

Findings from a `/web-design-reviewer` audit of the Jekyll site (served at `http://localhost:4000`). Static analysis of served HTML (`_site/`), SCSS (`_sass/`), Liquid (`_includes/`, `_layouts/`, `_pages/`), and frontmatter; live asset/URL checks with curl.

**Do not fix these all at once.** Fix one item, verify, then move on. Keep changes minimal and follow existing conventions.

## High

## Medium

### 2. Three blog posts have `.md` in their permalinks

- [x] **Completed: 2026-08-16**
  - Permalinks changed to `/posts/2026/democracy/`, `/posts/2025/why-i-hate-windows/`, `/posts/2025/salary-and-corruption/`.
  - `redirect_from:` added for each old URL; `jekyll-redirect-from` emits redirects (`_site/redirects.json` verified; old URLs return 301-style redirect pages). No internal links to old URLs (only TODO.md mentioned them).
  - Constraint honored: source files not renamed; other posts untouched.

- **What**: Frontmatter permalinks contain a literal `.md` segment, producing URLs like `/posts/2026/democracy.md/`:
  - `_posts/2026-03-28-democracy.md:6` → `permalink: /posts/2026/democracy.md/`
  - `_posts/2025-08-31-windows.md:6` → `permalink: /posts/2025/why-i-hate-windows.md/`
  - `_posts/2025-08-25-salary-and-corruption.md:6` → `permalink: /posts/2025/salary-and-corruption.md/`
- **Why**: Ugly URLs, look like raw files, hurt sharing/SEO; all other posts use clean slugs (`/posts/2025/switching-to-linux/`).
- **Files**: the three `_posts/` files above.
- **Implementation**: Change permalinks to `/posts/2026/democracy/`, `/posts/2025/why-i-hate-windows/`, `/posts/2025/salary-and-corruption/`. Check whether the old URLs are linked anywhere or indexed externally; if in doubt, add `redirect_from:` entries in each post's frontmatter (the `jekyll-redirect-from` plugin is already enabled in `_config.yml`). Links inside the site (cards, tag archive) are generated from `post.url`, so they update automatically.
- **Constraints**: Do not rename the source files; only the permalink/redirects matter. Do not touch other posts' permalinks.
- **Verify**: `bundle exec jekyll serve` → visit the three URLs; old URLs (if redirects added) return 301; check `_site/redirects.json`.

### 3. Missing explicit keyboard focus styles

- [x] **Completed: 2026-08-16**
  - Added global `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` in `_sass/base.scss`. Covers brand, nav links, theme toggle, chips, buttons, footer links in both themes. `.skip-link:focus` untouched. Verified in compiled `assets/css/main.css`.

- **What**: The only focus style in the codebase is `.skip-link:focus` (`_sass/utilities.scss:28`). All links and buttons rely on the browser default outline. Nothing guarantees a visible focus indicator on the brand, nav links, theme toggle, cards, chips, or footer links — especially in dark mode where the default outline can be low-contrast against `--bg: #12100d`.
- **Why**: WCAG 2.4.7 (focus visible); keyboard users need a consistent, visible indicator.
- **Files**: add rules to `_sass/` (suggest `_sass/base.scss` or `_sass/utilities.scss`). Design tokens available in `_sass/tokens.scss` (`--accent`, `--accent-hover`, `--ink`).
- **Implementation**: Add a global `:focus-visible` rule, e.g. `outline: 2px solid var(--accent); outline-offset: 2px;`, and remove/override nothing else. Verify it covers `.nav__link`, `.nav__theme`, `.nav__toggle`, `.card__title a`, `.chip--link`, `.btn`, footer links.
- **Constraints**: Do not remove the existing `.skip-link:focus` behavior. Avoid heavy `:focus` styles that show on mouse clicks (prefer `:focus-visible`).
- **Verify**: Tab through the homepage and a post page in both light and dark themes; every interactive element shows a visible indicator.

### 4. Mobile nav state can desync on resize

- [x] **Completed: 2026-08-16**
  - `assets/js/_main.js`: `sync()` now resets `aria-expanded` and button label ("Menu"/"Close") whenever the nav is force-hidden at mobile width or force-shown at desktop. Click handler uses the same `setState()`. `npm run build:js` run; `main.min.js` committed. `MOBILE_BP` (700) unchanged.

- **What**: In `assets/js/_main.js:48-68`, resizing from mobile to desktop removes the `hidden` attribute, but `aria-expanded` on the `.nav__toggle` button is not reset. Conversely, resizing to mobile hides the menu without resetting `aria-expanded`. Result: a hidden menu can still report `aria-expanded="true"`, and the button label "Menu" never changes.
- **Why**: Screen readers get wrong state; confusing for keyboard users.
- **Files**: `assets/js/_main.js` (then run `npm run build:js`; `assets/js/main.min.js` is what's served and must be committed).
- **Implementation**: Inside the `sync()` function (or the resize handler), after hiding/showing the nav, also call `toggle.setAttribute('aria-expanded', ...)` matching the new state (e.g. set `'false'` whenever the menu is force-hidden at desktop width). Optionally update the button text to "Menu"/"Close".
- **Constraints**: Do not change the 700px breakpoint (`MOBILE_BP`) — it must stay in sync with `@media (max-width: 700px)` in `_sass/layout.scss:215`. Do not introduce dependencies (JS is dependency-free by design).
- **Verify**: Open mobile viewport, open menu (`aria-expanded=true`), resize to desktop, confirm attribute is `false` and menu visible; also run `npm run build:js` and confirm `assets/js/main.min.js` changed and is staged.

### 5. Nav has no active state on article/detail pages

- [x] **Completed: 2026-08-16**
  - `_includes/nav.html`: link is now active on exact URL match OR when `link.url != '/'` and `page.url contains link.url`. Kept `aria-current="page"` for both cases so existing `.nav__link[aria-current="page"]` CSS styling applies. Verified: post → Writing, portfolio item → Work, book review → Reading, homepage → Home. Nav data untouched.

- **What**: `_includes/nav.html:10` sets `aria-current="page"` only on exact URL match (`page.url == link.url`). On `/posts/.../`, `/portfolio/.../`, `/book-reviews/.../` article pages, no nav item is marked active.
- **Why**: Wayfinding — users on a deep page cannot tell which section they are in.
- **Files**: `_includes/nav.html` (optionally small helper logic there).
- **Implementation**: Match section prefixes instead of exact equality — e.g. treat a link as active when `page.url == link.url` OR (`link.url != '/'` and `page.url` starts with `link.url`). `aria-current="page"` is technically for the current page; consider `aria-current="true"` for section matches, or keep `"page"` — pick one and keep it consistent.
- **Constraints**: Do not change navigation data (`_data/navigation.yml`) or add new nav items. Homepage `/` must not match everything (exclude `link.url == '/'` from the prefix rule).
- **Verify**: Visit a post, a portfolio item, and a book review; the correct nav item (Writing / Work / Reading) is highlighted and `aria-current` is set.

### 6. Tag chips on book reviews link to anchors that don't exist

- [x] **Completed: 2026-08-16**
  - Fix A applied: `_pages/tag-archive.html` now passes `site.posts | concat: site.book_reviews` to `group-by-array`. `/tags/` now has sections for review-only tags (`sci-fi`, `horror`, `fantasy`, etc.), so chips resolve. Posts archive layout unchanged (same `post-item.html` include). Verified: `Sci-Fi` chip on Hyperion review → `/tags/#sci-fi` section containing that review; post chips still resolve.

- **What**: `_layouts/single.html:28-31` renders tag chips as links to `{{ site.tag_archive.path }}#{{ tag | slugify }}`. The tag archive (`_pages/tag-archive.html` via `group-by-array`) only indexes `site.posts` — book review tags (`Book`, `Sci-Fi`, `Horror`, etc.) have no matching heading on `/tags/`. Clicking a chip from a review lands on a page with no `#sci-fi` target.
- **Why**: Dead-end links — user clicks a tag and arrives nowhere relevant.
- **Files**: `_pages/tag-archive.html` (fix A) or `_layouts/single.html` (fix B).
- **Implementation**: Either (A) include book reviews in the tag archive — extend `group-by-array` usage to `site.posts | concat: site.book_reviews`, or build two grouped sections (posts, reviews); or (B) render book-review chips as plain non-link `<span class="chip">` (like `page.tools` chips) while keeping post tags linked. Fix A is more useful to readers.
- **Constraints**: Do not break the existing `/tags/` layout for posts. The `group-by-array` include is shared; test any change against the posts archive.
- **Verify**: Click a `Sci-Fi` chip on a book review; it lands on a section containing that review. Post chips still resolve.

## Low

### 7. Hero photo is oversized (673 KB)

- [x] **Completed: 2026-08-16**
  - Re-encoded `images/main-photo.jpeg` to 400×400 JPEG, quality 85, stripped: 673 KB → 36.7 KB. Same filename (`_config.yml:25` and `_layouts/home.html:7` untouched), same visual crop, `alt` unchanged. LCP above-the-fold image now tiny.

- **What**: `images/main-photo.jpeg` is 1200x1200 but 673 KB and displayed at 176px (`--text-5xl`-adjacent, `.hero__photo` = 11rem). It is above-the-fold on the homepage.
- **Why**: Meaningless weight on the most important page load; LCP is likely this image on mobile.
- **Files**: `images/main-photo.jpeg` (replace) — referenced from `_config.yml:25` and rendered in `_layouts/home.html:7`.
- **Implementation**: Re-encode to a ~400px web-sized JPEG (or WebP + JPEG fallback) targeting < 50 KB; keep the filename `main-photo.jpeg` or update `_config.yml` accordingly. Prefer quality ≥ 80.
- **Constraints**: Do not change the visual crop; the `alt` text stays `{{ site.author.name }}`.
- **Verify**: File size drops substantially; homepage renders the same image; run Lighthouse/mobile audit and confirm LCP improves.

### 8. No social-share preview image configured

- [x] **Completed: 2026-08-16**
  - `og_image: "main-photo.jpeg"` set in `_config.yml`. `seo.html` already emitted `twitter:image` + JSON-LD logo from it, but had no plain `og:image` meta fallback — added one (`{% elsif site.og_image %}` branch). Verified `<meta property="og:image" content="https://danjelito.github.io/images/main-photo.jpeg">` in `_site/index.html` head. Config change requires Jekyll restart (GitHub Pages picks up on push).

- **What**: `_config.yml:130` `og_image:` is blank, so pages emit no `og:image` / `twitter:image` (verified in served HTML).
- **Why**: Sharing links on social media shows no preview image.
- **Files**: `_config.yml` (set `og_image` to an existing image, e.g. `main-photo.jpeg`); `_includes/seo.html` already handles it.
- **Constraints**: `_config.yml` changes require a Jekyll restart; GitHub Pages picks it up on push.
- **Verify**: Build and check `<meta property="og:image">` appears in `_site/index.html` head.

### 9. External hot-linked book cover images

- [x] **Completed: 2026-08-16**
  - Downloaded all 7 external covers (6× Amazon/Goodreads JPEG + 1× Brave-hosted PNG) into `images/blog_posts/` with the `book-<slug>` naming; switched frontmatter `image:` and body `src` to the `relative_url` pattern. Goodreads `_Source:` attribution lines kept. `card--contain` display unchanged.
  - Note: naming deviates from the existing `.png` convention — JPEG sources were kept as `.jpg` (re-encoding photo covers to PNG would balloon sizes ~5–10×). `book-remembrance-of-earths-past.png` is the PNG one. All 16 frontmatter `image:` values in `_book_reviews/` now resolve to local files.
  - Also fixed 3 dead cross-links between reviews (pointed at nonexistent `/posts/...` URLs): `/posts/2026/hyperion/` → `/book-reviews/2026-04-17-hyperion/` (in the-fall-of-hyperion), `/posts/2026/book-remembrance-of-earths-past/` → `/book-reviews/2026-08-09-book-remembrance-of-earths-past/` (in the-three-body-problem), and `/posts/2026/the-three-body-problem/` → `/book-reviews/2026-04-17-the-three-body-problem/` (in remembrance-of-earths-past). Full-site internal-link audit now passes: no dead links.

- **What**: 7 book reviews use Amazon/Goodreads-hosted cover URLs (`m.media-amazon.com/...`) in frontmatter and body; the rest use local files in `images/blog_posts/`.
- **Why**: Dependency on third-party availability (one already broke — see #1), extra DNS requests, potential CLS/consistency issues. Not urgent while they return 200.
- **Files**: `_book_reviews/2026-04-17-the-sword-of-kaigen.md`, `2026-04-17-hyperion.md`, `2026-04-17-tender-is-the-flesh.md`, `2026-04-17-the-troop.md`, `2026-08-09-the-fall-of-hyperion.md`, `2026-04-17-the-three-body-problem.md` (and any others with `https://` in `image:`).
- **Implementation**: Download covers into `images/blog_posts/` (existing naming convention: `book-<title>.png`), switch frontmatter and body `src` to the `{{ '/images/...' | relative_url }}` pattern.
- **Constraints**: Respect the Goodreads attribution lines (`_Source: [Goodreads](...)`) already present. Keep the `card--contain` display behavior — local images inherit the same CSS.
- **Verify**: All images resolve locally; `curl -I` on every `image:` frontmatter value in `_book_reviews/` returns 200 or resolves to an existing file.

### 10. Clean up unused template assets (optional)

- [x] **Completed: 2026-08-16**
  - `grep -r` confirmed zero source references to all candidates (only TODO.md itself and a `_config.yml:82` comment about the teaser example). Deleted: `bio-photo.jpg`, `bio-photo-2.jpg`, `profile.png`, `homepage.png`, `foo-bar-identity*.jpg`, `image-alignment-*.jpg`, `500x300.png`, `paragraph-*.png`, `editing-talk.png`, `_includes/footer/custom.html` (never included; only `head/custom.html` is). `bundle exec jekyll build` succeeds after removal. `site-logo.png` and `3953273590_704e3899d5_m.jpg` left in place (not in the listed scope; zero refs, kept conservatively).

- **What**: Several leftover template images look unused: `images/bio-photo.jpg`, `images/bio-photo-2.jpg`, `images/profile.png`, `images/homepage.png`, `images/foo-bar-identity*.jpg`, `images/image-alignment-*.jpg`, `images/500x300.png`, `images/paragraph-*.png`, `images/editing-talk.png`, plus `_includes/footer/custom.html` (empty stub).
- **Why**: Repo hygiene only — no user-facing impact.
- **Files**: `images/`, `_includes/footer/custom.html`.
- **Implementation**: Verify with `grep -r` that nothing references each asset before deleting. Do this last, after other items.
- **Verify**: `bundle exec jekyll build` succeeds; grep shows no references to removed files.

## Needs Review

### 11. Author bio vs. hero role text

- [x] **Resolved: 2026-08-16** (user decision: "Remove bio")
  - Removed `author.bio` from `_config.yml`. Homepage hero (`_layouts/home.html:11`) keeps its hardcoded role text; no layout renders `site.author.bio`, so nothing contradicts anymore.

- **What**: `_config.yml:28` `author.bio` = "A Data Scientist." while the homepage hero (`_layouts/home.html:11`) says "Business Intelligence Lead @ Gentem Indonesia Lifelong Learning Group". The bio string appears unused on the homepage (no author-profile sidebar rendered in current layouts), so it may be stale.
- **Why**: If any layout ever renders `site.author.bio`, it will contradict the homepage. Needs an editorial decision, not an automated fix.
- **Ask the user**: Which title should be canonical ("Data Scientist" or "Business Intelligence Lead")? Update `_config.yml` `bio` to match (or remove it), and decide whether homepage hero should reference `_config.yml` instead of hardcoding.

### 12. Visual verification with a real browser (blocked in this session)

- **Extra fix found during review**: the responsive card grid had a real horizontal-overflow bug at ≤600px. `.work-grid` kept `repeat(12, 1fr)` with `gap: var(--space-6)` while cards switched to `span 12` — the 11 internal column gaps (32px each) inflated the full-width card ~25px past the viewport (verified live at 375px). Fixed in `_sass/components.scss` by switching the grid to a single column at ≤600px (`grid-template-columns: 1fr; .card { grid-column: auto }`). Verified no overflow at 375/768/1280/1920 across `/`, `/portfolio/`, `/posts/`, `/book-reviews/`, `/resume/`, `/tags/`, `/404.html`, a post, and a review. This supersedes the "Verified OK" claim that the grid was fine at 1-col ≤600px.

- **Partial browser verification (2026-08-16)**: installed Playwright chromium headless; ran DOM/computed-style checks (not visual — this model cannot view screenshots). Confirmed: focus-visible outlines (2px `var(--accent)`) on keyboard tab in both themes, mobile nav `aria-expanded`/label sync on resize, nav active states per section, tag-archive anchors, and no horizontal overflow on all routes at all four widths. Screenshots saved under `/tmp/opencode/final-*.png` for a human to eyeball.

- **What**: No browser automation was available during the review (no Playwright/Chrome DevTools endpoint), so layout was verified by code + served HTML only. Untested visually: 375px/768px/1280px/1920px rendering, dark mode appearance, mobile menu interaction, hover states, reveal animations, and any overflow in long posts.
- **Action**: An agent with browser access (or a human) should screenshot these routes at those four widths, in both themes: `/`, `/portfolio/`, `/posts/`, `/book-reviews/`, `/resume/`, one post, one portfolio item, one review, `/tags/`, `/404.html`.
- **What to check**: horizontal overflow, card grid breakpoints (12/6/1 columns), nav wrap at ~700px, sticky header behavior, theme toggle persistence, focus indicators after #3, contrast of `--muted` text in both themes, and the reveal animation not leaving cards invisible.

## Verified OK (no action needed)

- Responsive card grid: 12-col desktop → 6-col ≤900px → 1-col ≤600px (`_sass/components.scss:135-147`).
- Viewport meta present (`_includes/head.html:2`); `-webkit-text-size-adjust: 100%`.
- Semantic landmarks: `header`/`nav`/`main`/`footer` (`_layouts/default.html`), skip link to `#main`.
- All `<img>` elements have `alt` text; card images are `loading="lazy"`.
- `prefers-reduced-motion` handled (`_sass/utilities.scss:49`); reveal is progressive enhancement (`.js` gated).
- Light/dark design tokens and no-FOUC inline theme script (`_includes/head.html:8-15`); syntax highlighting adapts to theme.
- All local image references in post/review/portfolio frontmatter resolve to existing files.
- Favicon set complete (svg/ico/32/192/180/manifest).
- All main routes return 200: `/`, `/portfolio/`, `/posts/`, `/book-reviews/`, `/resume/`, `/404.html`.
- 404 page has proper title, `sitemap: false`, and narrow layout.
- Amazon-hosted cover images (except the Brave URL in #1) currently return HTTP 200.

## Cleanup

Findings from a full-repo unused/orphaned-file audit (2026-08-16). Every candidate was checked for references via grep across `_layouts/`, `_includes/`, `_pages/`, `_config.yml`, `_data/`, content collections, JS, and build tooling (excluding `_site/`, `.git`, `node_modules/`, `vendor/`). The built `_site/` (57 pages) was cross-checked against nav + internal links — all routes reachable, no orphaned pages.

- [x] **Completed: 2026-08-16** — Delete `images/3953273590_704e3899d5_m.jpg`, `images/site-logo.png`, `images/themes/homepage-dark.png`, `images/themes/homepage-light.png`
  - Reason: zero references anywhere in source; favicons handled via `_includes/head/custom.html` + `images/manifest.json`.
  - Checked: full-repo grep; head.html/custom.html; `_sass/theme/` no longer exists.
  - Confidence: High
  - Verification: `bundle exec jekyll build` succeeds; grep finds no refs.

- [x] **Completed: 2026-08-16** — Delete 24 unreferenced `images/projects/*.png` (alcohol_correlation, car_price, coffee_quality_regression, comparison_2, covid19_idn, covid_forecast, covid_sql, dashboard_supermarket, employee_attrition, fraud_detection, grades_residual, handwriting_recognition, happiness_report, house_price, housing, machiney, movie, movie_correlation, rmse, sales_data, spotify, top6, TS_wordcloud, year_per_year_asean)
  - Reason: no exact-path references; former consumer `markdown_generator/` no longer exists.
  - Checked: exact `images/projects/<name>.png` grep across `_portfolio/`, `_posts/`, `_book_reviews/`, `_pages/`, `_layouts/`, `_includes/`, `_config.yml`.
  - Confidence: High (static). If the user may regenerate portfolio items from these, keep them.
  - Verification: grep zero refs; build succeeds; every rendered card image still resolves.

- [x] **Completed: 2026-08-16** — Delete `files/` template samples (bibtex1.bib, paper1.pdf, paper2.pdf, paper3.pdf, slides1.pdf, slides2.pdf, slides3.pdf)
  - Reason: zero references; Academic Pages template sample downloads.
  - Checked: grep for each filename and `files/` across source.
  - Confidence: High
  - Verification: build succeeds.

- [x] **Completed: 2026-08-16** — Delete `_drafts/post-draft.md`
  - Reason: template lorem-ipsum draft; excluded from build (Jekyll default); references nonexistent `unsplash-gallery-image-2-th.jpg`.
  - Checked: frontmatter/body; Jekyll `_drafts` exclusion.
  - Confidence: High
  - Verification: `jekyll build` — draft not in `_site/`.

- [ ] Review: delete `CONTRIBUTING.md` + `.github/ISSUE_TEMPLATE/` (generic academicpages template text no longer accurate for a personal portfolio)
  - Reason: template boilerplate; only referenced by GitHub conventions.
  - Checked: file contents.
  - Confidence: Medium
  - Verification: `git status` shows expected deletions; build unaffected.

- [ ] Review: prune `_data/ui-text.yml` to `en` / `en-US` only
  - Reason: only ref is `seo.html:21` inside a disabled `{% if paginator %}` block (pagination commented out); `site.locale` is `en-US`.
  - Checked: grep across includes/layouts/config.
  - Confidence: Medium
  - Verification: build succeeds; served HTML unchanged.

- [ ] Review: remove dead `_config.yml` keys and unused gem
  - Reason: `site_theme` referenced nowhere; `comments:`/`staticman:` blocks unused; `include: [.htaccess]` and `exclude:` entries (`CHANGELOG`, `Capfile`, `Gruntfile.js`, `gulpfile.js`, `Rakefile`, `assets/js/plugins`, `assets/js/vendor`) point to files that do not exist; `jemoji` gem not in `plugins:`/`whitelist:`.
  - Checked: config vs filesystem vs Gemfile.
  - Confidence: Medium
  - Verification: build succeeds; keep `webrick` + `connection_pool` gems.

