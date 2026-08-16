# Devan's Portfolio Website

Personal portfolio and blog, built with [Jekyll](https://jekyllrb.com/) and hosted on GitHub Pages.

## What You'll Find Here

- **Work** (`/portfolio/`) — ML, data analysis, computer vision, and visualization projects
- **Writing** (`/posts/`) — essays, tutorials, and notes on tech, data, and learning
- **Reading** (`/book-reviews/`) — book reviews (sci-fi, horror, fiction)
- **Résumé** (`/resume/`)

## Run Locally

### Prerequisites

Choose one:

**Option A — Docker (recommended)**

1. Install Docker Engine + Compose plugin:
   - Fedora: `sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin`
   - Ubuntu: `sudo apt install docker.io docker-compose-v2`
2. Start the daemon: `sudo systemctl enable --now docker`

**Option B — Native Ruby** (skip if using Docker)

Install Ruby 3.2 or 3.3 via a version manager (Ruby 4.x is **not** compatible with the `github-pages` gem):

```
mise use ruby@3.3          # or: rbenv install 3.3.6 && rbenv local 3.3.6
gem install bundler
```

### Start the Site

**With Docker:**

```
docker compose up
```

- First run installs gems into `vendor/bundle/` (gitignored) — takes ~2–5 minutes. Subsequent runs start in seconds.
- When you see `Server running... press ctrl-c to stop`, open **http://localhost:4000**

**With native Ruby:**

```
bundle install
bundle exec jekyll serve
```

Then open **http://localhost:4000**

### While Developing

- File edits auto-reload — just refresh the browser (Jekyll `-w` watch mode).
- Changes to `_config.yml` require a restart: Ctrl+C, then run the start command again.
- To stop the server: Ctrl+C (`docker compose down` if using Docker).
- JS changes: edit `assets/js/_main.js`, then `npm run build:js` — the site serves the committed `assets/js/main.min.js`.
- Don't commit `_site/`, `Gemfile.lock`, `node_modules/`, or `vendor/` (all gitignored).

## Deploy

Push to the `master` branch — GitHub Pages builds and publishes automatically. No other steps needed.

## Content Structure

| Path | Purpose |
|------|---------|
| `_portfolio/` | Project pages (frontmatter: `title`, `category`, `image`, `excerpt`, `tools`) |
| `_posts/` | Blog posts (`title`, `date`, `image`, `permalink`, `tags`) |
| `_book_reviews/` | Book reviews (`title`, `date`, `image`, `tags`) |
| `_pages/` | Static pages (home, work index, writing index, reading index, résumé, 404) |
| `_data/navigation.yml` | Header navigation links |
| `_layouts/`, `_includes/` | Liquid templates |
| `_sass/` | SCSS design system (tokens, base, layout, components, syntax) |
| `assets/css/main.scss` | CSS entry point |
| `assets/js/` | `_main.js` source + committed `main.min.js` |
| `images/` | All images |
