# GEMINI.md - Bracket Randomizer

This document provides foundational context and instructions for the Bracket Randomizer project, an automated NCAA March Madness bracket generator for the 2026 tournament.

## Project Overview

**Bracket Randomizer** is a functional web application that generates statistically accurate NCAA tournament brackets using historical "seed vs. seed" win percentages (sourced from [mcubed.net](https://mcubed.net/ncaab/seeds.shtml)).

### Core Features:
- **Statistical RNG Simulation:** Uses historical data for any matchup (e.g., #1 vs #16) to determine winners.
- **Interactive Bracket UI:** A React-based visualization of the tournament bracket with path highlighting.
- **Advanced Simulation Modes:**
  - **Chaos Factor:** Adjust simulation to favor favorites or underdogs.
  - **Round-by-Round:** Progress through the tournament one round at a time.
  - **Bulk Simulation:** Run 1000x simulations to see statistical overlays on matchups.
- **Chaos Score:** Calculates a "chaos" rating for generated brackets based on the historical unlikeliness of results.
- **Manual Overrides:** Users can click on any team to force them as a winner; changes propagate automatically.
- **Export & Sharing:**
  - Save brackets as watermark-protected PNG images or PDFs.
  - Shareable bracket URLs using Base64-encoded bitstrings.
- **Monetization:** Integrated Ko-fi donation link.

## Architecture & Tech Stack

- **Frontend:** React 18 with Vite (TypeScript).
- **Styling:** Tailwind CSS with `tailwind-merge` and `clsx`.
- **Logic:** Custom simulation engine (`engine.ts`) using historical JSON stats.
- **Exporting:** `html-to-image` and `jspdf`.
- **Hosting/Deployment:** Cloudflare Pages (BracketRandomizer.com) managed via `wrangler`.
- **Testing:** Vitest for engine logic and component testing.

## Project State: Prototype/MVP Complete

The core application is fully functional and deployed. Remaining work primarily involves updating the `teams_2026.json` data once the official field is announced on Selection Sunday (March 15, 2026).

## Development Conventions

- **Shell Environment:** Developed in **Windows PowerShell**. Use PowerShell syntax for command chaining (e.g., `;` instead of `&&`).
- **Planning:** Refer to `plan.md` for the detailed roadmap and task tracking.
- **Branding:** All exported assets must feature the `bracketrandomizer.com` watermark.
- **Verification:** Always run `npm run build` and `npm run test` (if applicable) before deploying.

## Key Files
- `plan.md`: The roadmap and progress tracker.
- `src/data/engine.ts`: Core simulation and override logic.
- `src/data/seed_stats.json`: Historical seed matchup win percentages.
- `src/data/teams_2026.json`: Placeholder for tournament teams.
- `src/components/BracketView.tsx`: Main UI component for the bracket.
- `scripts/scrape_stats.py`: Python script for refreshing `seed_stats.json` from mcubed.net.
- `wrangler.jsonc`: Cloudflare configuration.
