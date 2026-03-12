import seedStatsRaw from './seed_stats.json';
import teams2026Raw from './teams_2026.json';

export type Team = {
  name: string;
  seed: number;
};

export type Matchup = {
  team1: Team;
  team2: Team;
  winner?: Team;
};

export type Round = {
  name: string;
  matchups: Matchup[];
};

const seedStats = seedStatsRaw as Record<string, number>;
const teams2026 = teams2026Raw as Record<string, Team[]>;

export function simulateMatchup(team1: Team, team2: Team): Team {
  const higherSeed = Math.min(team1.seed, team2.seed);
  const lowerSeed = Math.max(team1.seed, team2.seed);
  
  const key = `${higherSeed}_vs_${lowerSeed}`;
  const winProb = seedStats[key] ?? 0.5; // Default to 50% if stat missing
  
  const rng = Math.random();
  const higherSeedTeam = team1.seed === higherSeed ? team1 : team2;
  const lowerSeedTeam = team1.seed === lowerSeed ? team1 : team2;

  // Handle cases where team1 and team2 have the same seed (e.g. 1 vs 1 in Final Four)
  if (team1.seed === team2.seed) {
    return rng < 0.5 ? team1 : team2;
  }

  return rng < winProb ? higherSeedTeam : lowerSeedTeam;
}

export function generateInitialTeams(): Team[] {
  const regions = ['East', 'West', 'South', 'Midwest'];
  const teams: Team[] = [];
  
  regions.forEach(region => {
    if (teams2026[region]) {
      teams.push(...teams2026[region]);
    } else {
      for (let i = 1; i <= 16; i++) {
        teams.push({ name: `${region} #${i}`, seed: i });
      }
    }
  });
  
  return teams;
}

export function simulateTournament(initialTeams: Team[]): Round[] {
  const rounds: Round[] = [];
  let currentTeams = [...initialTeams];

  const roundNames = [
    "Round of 64",
    "Round of 32",
    "Sweet 16",
    "Elite Eight",
    "Final Four",
    "Championship"
  ];

  for (let r = 0; r < roundNames.length; r++) {
    const matchups: Matchup[] = [];
    const nextRoundTeams: Team[] = [];

    // Special handling for Round of 64 seeding (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
    if (r === 0) {
      const order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
      // 4 regions
      for (let reg = 0; reg < 4; reg++) {
        const regionTeams = currentTeams.slice(reg * 16, (reg + 1) * 16);
        for (let i = 0; i < order.length; i += 2) {
          const t1 = regionTeams.find(t => t.seed === order[i])!;
          const t2 = regionTeams.find(t => t.seed === order[i+1])!;
          const winner = simulateMatchup(t1, t2);
          matchups.push({ team1: t1, team2: t2, winner });
          nextRoundTeams.push(winner);
        }
      }
    } else {
      for (let i = 0; i < currentTeams.length; i += 2) {
        const winner = simulateMatchup(currentTeams[i], currentTeams[i+1]);
        matchups.push({ team1: currentTeams[i], team2: currentTeams[i+1], winner });
        nextRoundTeams.push(winner);
      }
    }

    rounds.push({ name: roundNames[r], matchups });
    currentTeams = nextRoundTeams;
  }

  return rounds;
}
