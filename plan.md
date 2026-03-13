# Bracket Randomizer Project Plan

## Project Goal
To create a statistically correct March Madness bracket randomizer for the 2026 men's NCAA tournament, using historical seed vs. seed win percentages from [mcubed.net](https://mcubed.net/ncaab/seeds.shtml).

---

## 1. Infrastructure Setup

### GitHub Repo
- **URL:** [https://github.com/austincarey/BracketRandomizer](https://github.com/austincarey/BracketRandomizer)
- **Action:** Already initialized. Sync changes as we build.

### Domain & Hosting
- **URL:** `BracketRandomizer.com`
- **Action:** Purchase via Cloudflare.
- **Hosting:** Deploy via **Cloudflare Pages** for static frontend and **Cloudflare Workers** (if needed) for any backend logic.

---

## 2. Data Acquisition

### Scraping mcubed.net
- **Script:** Build a Python or Node.js script to scrape the "Seed vs. Seed Matchup" table.
- **Data Structure:** Save as `data/seed_stats.json` in a format like:
  ```json
  {
    "1_vs_16": 0.99,
    "8_vs_9": 0.50,
    ...
  }
  ```

### 2026 Team Data
- **Update Required:** Teams are not yet available.
- **Action:** Create a JSON file `data/teams_2026.json` as a placeholder to be populated when the field is announced.

---

## 3. Simulation Engine

### Logic
- **RNG:** For each matchup (Seed A vs Seed B):
  1. Look up historical win % of A beating B.
  2. Generate a random number between 1-100.
  3. If `random_number < win_%_A`, A wins. Otherwise, B wins.
- **Rounds:** Simulate from Play-In/Round of 64 through to the Championship.
- **Interactive Mode (Planned):**
  - **Round-by-Round Randomizer:** Allow users to randomize one round at a time (e.g., randomize only the Round of 64, then view results before randomizing the Round of 32).
  - **Manual Overrides:** Potential to let users pick specific winners and randomize the rest.

---

## 4. UI Design & Development

### Landing Page Features
- **Empty Bracket:** A visual representation of the tournament bracket.
- **"Randomize Bracket" Button:** Triggers the simulation and populates the bracket.
- **"Randomize Next Round" Button (Planned):** Progressively fills the bracket.
- **Export Functionality:**
  - Save as Image (PNG/JPG) or PDF.
  - **Watermark:** Must include `bracketrandomizer.com` watermark.
- **Ko-fi Link:** Visible button for donations.

### Tech Stack Recommendation
- **Frontend:** React with Tailwind CSS for rapid UI development and bracket layout.
- **Exporting:** `html-to-image` or `jspdf` for generating the bracket files.
- **Responsiveness:** 
  - Desktop: Full 4-region layout.
  - Mobile: Horizontal swipe-to-view container with navigation hints.

---

## 5. Cloudflare Setup Instructions

Once the website code is ready (likely in a `dist/` or `build/` folder):
1. **Login** to your Cloudflare Dashboard.
2. Go to **Workers & Pages** -> **Create application** -> **Pages**.
3. **Connect to Git:** Link your GitHub repo `austincarey/BracketRandomizer`.
4. **Build Settings:**
   - Framework preset: Choose (e.g., Vite/React).
   - Build command: `npm run build`.
   - Build output directory: `dist`.
5. **Custom Domain:** After deployment, go to the "Custom domains" tab in your Pages project and add `bracketrandomizer.com`.

---

## 6. Ko-fi Integration
- **Account:** Created at `ko-fi.com/austincarey`.
- **Button:** Add a Ko-fi branded button to the header or footer of the website.

---

## TODO List

- [x] **Infrastructure**
  - [x] Initialize Git repo.
  - [x] Configure `bracketrandomizer.com` in Wrangler.
  - [x] Connect and deploy to Cloudflare.
- [x] **Data**
  - [x] Script to scrape `mcubed.net` seed stats.
  - [x] Create placeholder for 2026 teams.
- [x] **Core Logic**
  - [x] Implement simulation engine.
- [x] **Frontend**
  - [x] Design bracket layout (Traditional Left-Right).
  - [x] Implement "Randomize" button.
  - [x] Implement Export to Image/PDF with watermark.
  - [x] Add seed win percentages to matchups.
  - [x] Add real Ko-fi link.
  - [x] Mobile-friendly responsive layout & horizontal swipe.
- [x] **Next Phase: Interactive Features**
  - [x] Implement Round-by-Round simulation logic.
  - [x] Update UI to support "Step-by-Step" randomization.
  - [x] Add "Reset" functionality to clear the bracket.
  - [x] Implement Game-by-Game simulation mode.
- [ ] **Deployment**
  - [x] Deploy initial site to Cloudflare.
  - [ ] Update with real teams when available (March 15, 2026).

---

## Ideas

### Social & Sharing Features
- **Unique URL Generation:** Save the bracket state to a simple database or encode it in the URL so users can share a direct link like `bracketrandomizer.com/b/XYZ123`.
- **"Rate My Bracket":** A fun UI element that gives the generated bracket a "Chaos Score" based on the number of upsets (e.g., "98/100 Chaos - You've got a 16-seed in the Final Four!").

### UX & Visual Polish
- **Live Odds Display:** On hover, show the percentage chance that team had to win that specific game (e.g., "UMBC had a 1.2% chance to win this game").
- **Enhanced Matchup Highlights:** Expand path highlighting to show more detailed stats on hover.

### Comparison & Analysis Tools
- **"The Expert vs. The RNG":** Allow users to manually pick a few games they are "sure" about, and let the Randomizer fill in the rest of the bracket.
- **Bulk Simulation (The 100x Filter):** A feature to simulate 100 (or 1000) brackets at once and show statistics on which team won the most often in those simulations.

### Monetization & Growth
- **Ad Placement:** Add a small, non-intrusive ad unit (like Carbon Ads or a simple banner) below the bracket once it's generated.
- **Newsletter/Reminder:** A "Remind me when the 2027 stats are live" email signup to build a returning user base.

