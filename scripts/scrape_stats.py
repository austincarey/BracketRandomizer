import urllib.request
import re
import json
import os

def scrape_seed_stats():
    url = "https://mcubed.net/ncaab/seeds.shtml"
    print(f"Fetching data from {url}...")
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('latin-1')
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # Split by the bold headers for each seed
    sections = re.split(r"Overall tournament record of #(\d+) seeds", html)
    
    stats = {}
    
    # sections[0] is everything before the first seed header
    # Then it's [seed1, content1, seed2, content2, ...]
    for i in range(1, len(sections), 2):
        main_seed = sections[i]
        content = sections[i+1]
        
        # Find all "vs. #X ... Y.Y%"
        # Matches both linked and unlinked versions
        # <span class="hovl"><a href="seed1v16.shtml">vs. #16</a>    (158-2)   98.8%</span>
        # <span class="hovl">vs. #14      (0-0)    0.0%</span>
        matches = re.findall(r"vs\.\s+#(\d+).*?([\d\.]+)%", content)
        
        for vs_seed, pct in matches:
            # We want to store the higher seed (smaller number) first in the key
            s1 = int(main_seed)
            s2 = int(vs_seed)
            
            # Since the table is from the perspective of main_seed
            # If main_seed is 1 and vs_seed is 16, pct is prob of 1 beating 16.
            # If main_seed is 16 and vs_seed is 1, pct is prob of 16 beating 1 (which would be 1.2%)
            
            # We will always store as "HigherSeed_vs_LowerSeed" = Prob(HigherSeed wins)
            if s1 < s2:
                stats[f"{s1}_vs_{s2}"] = round(float(pct) / 100.0, 3)
            elif s1 > s2:
                # If we are looking at #16 vs #1, and pct is 1.2%, 
                # then #1 vs #16 should be 100 - 1.2 = 98.8%
                # But we likely already processed #1 vs #16. 
                # Let's just ensure we don't overwrite with less accurate data 
                # or just use the s1 < s2 path.
                key = f"{s2}_vs_{s1}"
                if key not in stats:
                    stats[key] = round(1.0 - (float(pct) / 100.0), 3)
            else:
                # 1 vs 1, 2 vs 2, etc.
                stats[f"{s1}_vs_{s2}"] = round(float(pct) / 100.0, 3)

    if not stats:
        print("No stats found. The site layout might have changed.")
        return

    # Sort stats by key for readability
    sorted_stats = dict(sorted(stats.items(), key=lambda x: [int(i) for i in x[0].split('_vs_')]))

    output_path = os.path.join("src", "data", "seed_stats.json")
    with open(output_path, "w") as f:
        json.dump(sorted_stats, f, indent=2)
    
    print(f"Successfully updated {output_path} with {len(stats)} entries.")

if __name__ == "__main__":
    scrape_seed_stats()
