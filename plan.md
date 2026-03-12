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

---

## 4. UI Design & Development

### Landing Page Features
- **Empty Bracket:** A visual representation of the tournament bracket.
- **"Randomize Bracket" Button:** Triggers the simulation and populates the bracket.
- **Export Functionality:**
  - Save as Image (PNG/JPG) or PDF.
  - **Watermark:** Must include `bracketrandomizer.com` watermark.
- **Ko-fi Link:** Visible button for donations.

### Tech Stack Recommendation
- **Frontend:** React with Tailwind CSS for rapid UI development and bracket layout.
- **Exporting:** `html-to-image` or `jspdf` for generating the bracket files.

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

- [ ] **Infrastructure**
  - [x] Initialize Git repo.
  - [ ] Purchase `bracketrandomizer.com` on Cloudflare.
  - [ ] Connect GitHub repo to Cloudflare Pages.
- [x] **Data**
  - [x] Script to scrape `mcubed.net` seed stats.
  - [x] Create placeholder for 2026 teams.
- [x] **Core Logic**
  - [x] Implement simulation engine.
- [ ] **Frontend**
  - [x] Design bracket layout (Traditional Left-Right).
  - [x] Implement "Randomize" button.
  - [x] Implement Export to Image/PDF with watermark.
  - [x] Add seed win percentages to matchups.
  - [ ] Add real Ko-fi link.
- [ ] **Deployment**
  - [ ] Deploy initial site to Cloudflare Pages.
  - [ ] Update with real teams when available (March 2026).
