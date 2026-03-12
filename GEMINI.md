# GEMINI.md - Bracket Randomizer

This document provides instructional context for the Bracket Randomizer project, an automated NCAA March Madness bracket generator for the 2026 tournament.

## Project Overview

The **Bracket Randomizer** is a web-based application designed to create statistically accurate NCAA tournament brackets. Instead of simple coin-flips, the simulation uses historical "seed vs. seed" win percentages to determine winners via a random number generator (RNG).

### Core Goals:
- **Statistical Accuracy:** Pull historical seed matchup data from [mcubed.net](https://mcubed.net/ncaab/seeds.shtml).
- **RNG Simulation:** For any matchup (e.g., #1 vs #16), if the #16 seed historically has a 1% win rate, generate a number between 1-100; if <1, the #16 seed wins.
- **Dynamic 2026 Data:** Incorporate actual 2026 tournament teams once they are announced.
- **Visual & Interactive UI:** A landing page featuring an empty bracket that fills dynamically upon clicking a "Randomize Bracket" button.
- **Exportability:** Generate a watermark-protected image or PDF of the completed bracket.
- **Monetization:** Include a Ko-fi link for donations.

### Intended Architecture:
- **Frontend:** Likely a modern web framework (React, Vue, or Vanilla JS) to handle the bracket visualization.
- **Hosting:** Cloudflare (BracketRandomizer.com).
- **Version Control:** [github.com/austincarey/BracketRandomizer](https://github.com/austincarey/BracketRandomizer).

## Building and Running

*Note: The project is currently in the initial planning phase. No code has been committed yet.*

- **TODO:** Initialize the web project (e.g., `npm init` or similar).
- **TODO:** Implement the data scraping or fetching logic for `mcubed.net`.
- **TODO:** Create the randomization script.
- **TODO:** Build the UI and export functionality.

## Development Conventions

- **Shell Environment:** This project is typically developed in **Windows PowerShell**. Ensure shell commands use PowerShell syntax (e.g., use `;` instead of `&&` for command chaining).
- **Planning:** Maintain a `plan.md` file to track infrastructure setup, data scripts, and UI progress.
- **Tracking:** Use the `plan.md` to keep a live TODO list, noting completed items and upcoming tasks.
- **Branding:** All exported brackets must include a `bracketrandomizer.com` watermark.
- **Documentation:** Provide clear instructions for Cloudflare deployment and team data updates.

## Key Files (Proposed)
- `plan.md`: The roadmap and task tracker.
- `src/`: Directory for application source code.
- `data/`: Stored seed win percentages and team listings.
- `scripts/`: Data fetching and simulation logic.
