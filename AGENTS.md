# AGENTS.md

Static Jekyll site (Academic Pages theme), hosted on GitHub Pages. Content-only — no tests, no lint, no build step for deploy. Deploy = push to `master` (the default branch is `master`, not `main`).

Repo overview and local setup live in `README.md`; this file only covers what's easy to get wrong.

## Commands

- Dev server: `bundle exec jekyll serve` (http://localhost:4000) or `docker compose up`
- `bundle install` first — `connection_pool` is pinned to `2.5.0` in `Gemfile` (Ruby 3.3+ workaround); don't bump it
- JS edits: `npm run build:js` minifies `assets/js/_main.js` into `assets/js/main.min.js`

## Gotchas

- `_config.yml` changes require restarting `jekyll serve` — the file is not hot-reloaded.
- JS: `main.min.js` is committed and is what's actually served. `assets/js/_main.js` is excluded from the build (`_config.yml` `exclude:`). Always edit `_main.js` then run `npm run build:js` and commit the regenerated `main.min.js`.
- `_site/` and `Gemfile.lock` are gitignored — never commit them. GitHub Pages builds `_site/` on push.
- `future: true` is set, so posts dated in the future are published, not suppressed.
- GitHub Pages safe mode restricts plugins — keep `_config.yml` `whitelist:` in sync with `plugins:`.

## Content conventions

- Blog posts (`_posts/YYYY-MM-DD-slug.md`) need an explicit `permalink: /posts/YYYY/slug/` in frontmatter; without it the global `/:categories/:title/` default applies. `date` + `tags` required.
- Book reviews (`_book_reviews/`) need only `title`, `date`, `tags` — permalink is auto-derived as `/book-reviews/:name/` from the filename slug (date prefix included, e.g. `2026-04-17-hyperion.md` → `/book-reviews/2026-04-17-hyperion/`). The `book-` prefix in some filenames (e.g. `book-piranesi.md`) leaks into the URL; new files should omit it.
- Portfolio items (`_portfolio/YYYY-MM-DD-slug.md`) require `collection: portfolio` in frontmatter; `title` + `excerpt` (excerpt can embed an `<img>`).
- Portfolio is rendered reverse-chronologically via `site.portfolio reversed` in `_pages/portfolio.html`.
- Navigation is hand-edited in `_data/navigation.yml`.
- Homepage is `_pages/about.md` (permalink `/`). The live resume is `_pages/resume.md` (plain Markdown).

## Style

- Commit messages are short and conventional-style ("Add article on Jakarta's traffic…").
- Content is mixed English/Indonesian.
