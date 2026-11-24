# PyFolio — Learn Python in a Living Notebook

An interactive, zero-build Python learning website designed around the **"living notebook"** aesthetic: editorial typography, wide margins, Jupyter-style `In [n]` / `Out [n]` code cells powered in-browser by **Pyodide** (WebAssembly Python via jsDelivr CDN), common-mistake margin notes, debugging challenges, and quizzes.

## Features

- **8 Progressive Lessons**: Variables & Strings, Control Flow, Functions & Scope, Core Data Structures, Error Handling, Files & JSON, Classes & Dataclasses, and an Expense Ledger mini-project.
- **In-Browser Python Runner**: Edit and execute real Python 3 code with `Ctrl/Cmd + Enter` or `Shift + Enter` — no backend or local Python install needed.
- **Try Breaking It**: Every lesson includes a buggy code cell to diagnose and fix, with a toggleable hint and working solution.
- **Playground, Cheat Sheet & Glossary**: Free scratchpad with starter snippets, syntax-highlighted reference cards, and searchable Python definitions.
- **`Ctrl/Cmd + K` Command Palette**: Jump instantly to any lesson, snippet, or term.
- **Dark Ink & Light Paper Themes**: Accessible high-contrast palettes respecting `prefers-reduced-motion`.
- **Memory-Only Progress**: Sidebar progress ring tracks completed lessons in memory without touching `localStorage` or cookies.

## Running Locally

Serve the repository root over HTTP (required so `fetch()` can load `content/*.json`):

```bash
python -m http.server 8422
```

Then open `http://localhost:8422`.

## Hosting on GitHub & GitHub Pages

1. Create a new empty repository on GitHub (for example `pyfolio`).
2. Push this folder from your terminal:

```bash
git init -b main
git add .
git commit -m "Initial PyFolio Python notebook site"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. Enable GitHub Pages in **Settings -> Pages**:
   - Under **Build and deployment -> Source**, select **GitHub Actions** (this repository already includes `.github/workflows/pages.yml` and `.nojekyll`).
   - Or choose **Deploy from a branch** (`main` / `/ (root)`).
4. Your site will be live at `https://<your-username>.github.io/<your-repo>/`. Because routing uses hash URLs (`#/lessons/...`) and relative `./content/...` fetches, subpath hosting works out of the box.

### Also Works On
- **Vercel / Netlify**: Connect the GitHub repo with an empty build command and publish directory `.`.

## Customizing Content

All text and code live in `content/`:

- `content/site.json` — site title, hero copy, and live hero code cell.
- `content/playground.json` — starter snippets for the Playground.
- `content/cheatsheet.json` — cheat sheet categories and snippets.
- `content/glossary.json` — glossary terms and definitions.

## How to Add a New Lesson

1. Create a new JSON file in `content/lessons/` following `NN-your-slug.json` (for example `09-iterators-generators.json`) with fields `slug`, `number`, `title`, `readTime`, `subtitle`, `sections`, `marginNote`, `mainCell`, `breakIt`, and `quiz` (3 questions).
2. Add the lesson entry to `content/lessons/index.json` in order.
3. Reload the browser — the sidebar, Home overview grid, Next/Previous buttons, and `Ctrl/Cmd + K` command palette update automatically.
