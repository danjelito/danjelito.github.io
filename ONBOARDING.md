# Onboarding Guide: danjelito.github.io

## Overview

Personal portfolio and blog site for Devan Anjelito, a data scientist. Built with Jekyll using the Academic Pages theme. Hosted on GitHub Pages at [danjelito.github.io](https://danjelito.github.io). Contains blog posts, portfolio projects, CV, and book reviews.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Ruby | 3.2+ |
| Static site generator | Jekyll | via github-pages gem |
| Template language | Liquid | (bundled with Jekyll) |
| Stylesheets | SCSS | (compiled by Jekyll sass plugin) |
| JavaScript | jQuery, FitVids | via npm |
| JS bundler | UglifyJS | ^3.17.4 |
| Python scripts | Python | 3.9+ |
| Containerization | Docker / Docker Compose | — |
| Hosting | GitHub Pages | — |

## Architecture

Static site generator: Markdown + YAML frontmatter → Jekyll → static HTML in `_site/`.

No database, no server-side runtime. All content is authored as files in content directories. GitHub Pages auto-deploys on push to the default branch.

## Key Entry Points

- `_config.yml:1` - Master config: site metadata, collections, plugins, defaults, sass, markdown settings
- `_pages/about.md:1` - Homepage (permalink: `/`)
- `_layouts/default.html:1` - Root layout wrapping every page (head, masthead, content, footer, scripts)
- `_layouts/single.html:1` - Layout for individual posts/projects/teachings (extends default)
- `_layouts/archive.html:1` - Layout for listing pages (blog archive, portfolio index, etc.)
- `_data/navigation.yml:1` - Site header navigation links
- `assets/css/main.scss:1` - SCSS entry point, imports from `_sass/`
- `assets/js/_main.js:1` - Unminified JS source (theme toggle, nav, etc.)
- `Gemfile:1` - Ruby dependencies (jekyll, plugins, github-pages)
- `package.json:1` - JS dependencies and npm scripts

## Directory Map

| Directory | Purpose |
|-----------|---------|
| `_config.yml` | Jekyll site configuration (metadata, plugins, collections, defaults) |
| `_data/` | YAML/JSON data files: navigation, authors, CV, UI text labels |
| `_layouts/` | Liquid layout templates (default, archive, single, talk, cv-layout) |
| `_includes/` | Reusable Liquid partials (head, masthead, sidebar, footer, analytics, comments, scripts) |
| `_pages/` | Standalone pages: about, CV, portfolio index, blog archive, 404, sitemap, etc. |
| `_posts/` | Blog posts and book reviews (Markdown with YAML frontmatter, date-prefixed filenames) |
| `_portfolio/` | Portfolio project pages (Markdown, `collection: portfolio` in frontmatter) |
| `_talks/` | Talk/presentation entries (currently placeholder content) |
| `_teaching/` | Teaching experience entries (currently placeholder content) |
| `_publications/` | Publication entries (currently placeholder content) |
| `_drafts/` | Draft posts excluded from build |
| `_sass/` | SCSS partials: themes, layout, mixins, utilities, vendor (breakpoint, font-awesome, susy) |
| `assets/` | Static assets: `css/`, `js/`, `fonts/`, `webfonts/` |
| `images/` | Site images (profile photo, project screenshots, theme images) |
| `files/` | Downloadable files (sample PDFs, BibTeX) |
| `markdown_generator/` | Python scripts + Jupyter notebooks: generate markdown from TSV/ORCID/BibTeX |
| `scripts/` | Utility scripts: CV markdown-to-JSON converter |
| `.github/` | GitHub Actions workflow (talk location scraper) and issue templates |
| `_site/` | Jekyll build output (gitignored; served by GitHub Pages) |

## Content Flow

```
Author writes Markdown in _posts/, _portfolio/, _talks/, etc.
  ↓
YAML frontmatter specifies layout, title, collection, permalink, tags
  ↓
Jekyll applies collection defaults from _config.yml
  ↓
Layout chain: post layout → single.html → default.html
  ↓
Liquid includes pull in sidebar, nav, footer, analytics, etc.
  ↓
SCSS in _sass/ compiles to assets/css/main.scss (via Jekyll's built-in Sass)
  ↓
JS in assets/js/_main.js is minified to main.min.js via uglify-js (npm run build:js)
  ↓
Static HTML/CSS/JS output in _site/
  ↓
GitHub Pages serves _site/ on push to main branch
```

## Rendering Chain

```
default.html (layout: compress)
  ├── head.html → head/custom.html
  ├── browser-upgrade.html
  ├── masthead.html (navigation from _data/navigation.yml)
  ├── {{ content }} (child layout output)
  ├── footer/custom.html → footer.html
  └── scripts.html

archive.html (layout: default)
  └── sidebar.html + page content (loops through collection items)

single.html (layout: default)
  ├── sidebar.html
  ├── page__hero.html (optional)
  ├── breadcrumbs.html
  ├── page content + metadata + taxonomy
  ├── social-share.html
  ├── post_pagination.html
  └── comments.html
```

## Content Types & Frontmatter

### Blog Posts (`_posts/`)
```yaml
---
title: "Post Title"
date: YYYY-MM-DD
permalink: /posts/YYYY/slug/
tags: - tag1 - tag2
---
```

### Portfolio Items (`_portfolio/`)
```yaml
---
title: "Project Title"
excerpt: "Short description with optional <img> tag"
collection: portfolio
---
```

### Markdown Pages (`_pages/`)
```yaml
---
layout: archive          # or single
title: "Page Title"
permalink: /page-url/
author_profile: true
---
```

## Conventions

- **Filenames**: `YYYY-MM-DD-slug.md` for posts, portfolio, talks, teaching
- **SCSS partials**: Prefixed with `_` (Jekyll/Sass convention)
- **Tags**: Space-separated in YAML frontmatter (e.g. `tags: - book - horror`)
- **Navigation**: Active links defined in `_data/navigation.yml`; hidden sections commented out
- **Collection defaults**: Defined in `_config.yml` under `defaults:` by collection type
- **Git commits**: Short, conventional style (`c337d55 Add article on Jakarta's traffic...`)
- **Content**: Mixed English/Indonesian; blog includes book reviews, technical essays, data analysis
- **Layout inheritance**: `single.html` for individual items, `archive.html` for listing pages, both extend `default.html` which extends `compress.html`

## Common Tasks

- **Install Ruby deps**: `bundle install`
- **Run dev server**: `bundle exec jekyll serve` (serves at `http://localhost:4000`)
- **Run via Docker**: `docker compose up` (serves at `http://localhost:4000`)
- **Install JS deps**: `npm install`
- **Build/minify JS**: `npm run build:js`
- **Watch JS for changes**: `npm run watch:js`
- **Add blog post**: Create `_posts/YYYY-MM-DD-slug.md` with frontmatter
- **Add portfolio project**: Create `_portfolio/YYYY-MM-DD-slug.md` with `collection: portfolio`
- **Update navigation**: Edit `_data/navigation.yml`
- **Update site config**: Edit `_config.yml` (requires server restart)

## Where to Look

| I want to... | Look at... |
|--------------|------------|
| Change site title or author info | `_config.yml:12` (title), `_config.yml:22` (author) |
| Add/remove nav links | `_data/navigation.yml:10` |
| Change page layout | `_layouts/`; assign layout in page frontmatter |
| Edit homepage content | `_pages/about.md:9` |
| Add social/analytics | `_config.yml:50` (social), `_config.yml:153` (analytics) |
| Modify sidebar profile | `_includes/author-profile.html` |
| Change styling (colors, fonts) | `_sass/_themes.scss`, `_sass/theme/` |
| Change JS behavior | `assets/js/_main.js` (then run `npm run build:js`) |
| Generate talks from TSV | `markdown_generator/talks.py` |
| Convert CV to JSON | `scripts/cv_markdown_to_json.py` |
| Add downloadable files | Drop in `files/` directory |

## Important Notes

- Jekyll plugins are constrained by GitHub Pages safe mode. The `whitelist` in `_config.yml:314` must match what GitHub Pages supports.
- `_site/` is gitignored — never commit it. GitHub Pages builds it automatically.
- The `Gemfile` pins `connection_pool` to `2.5.0` (workaround for Ruby 3.3+ compatibility).
- The `_drafts/` directory is excluded from the build by default (Jekyll behavior).
- Portfolio items are displayed in reverse chronological order via `site.portfolio reversed` in `_pages/portfolio.html:11`.
- Theme supports dark mode: `site_theme` option in `_config.yml:11`, activated via `assets/js/_main.js` theme toggle logic.

## Unknowns

- No test suite exists. This is a content-only site with no application logic to test.
- No CI/CD for site deployment is configured (GitHub Pages auto-deploys natively from the default branch).
- The `_talks/`, `_teaching/`, and `_publications/` collections contain placeholder content from the upstream Academic Pages template. Their nav links are commented out in `navigation.yml`.
