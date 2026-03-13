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
  winProbability?: number; // Probability of team1 beating team2
};

export type Round = {
  name: string;
  matchups: Matchup[];
};

export const ROUND_NAMES = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite Eight",
  "Final Four",
  "Championship"
];

const seedStats = seedStatsRaw as Record<string, number>;
const teams2026 = teams2026Raw as Record<string, Team[]>;

export function simulateMatchup(team1: Team, team2: Team): { winner: Team; prob1: number } {
  const higherSeed = Math.min(team1.seed, team2.seed);
  const lowerSeed = Math.max(team1.seed, team2.seed);
  
  const key = `${higherSeed}_vs_${lowerSeed}`;
  const winProb = seedStats[key] ?? 0.5; // Prob of higher seed beating lower seed
  
  const rng = Math.random();

  let winner: Team;
  let prob1: number; // Probability of team1 winning

  if (team1.seed === team2.seed) {
    prob1 = 0.5;
    winner = rng < 0.5 ? team1 : team2;
  } else {
    // Determine probability for team1 specifically
    prob1 = team1.seed === higherSeed ? winProb : (1 - winProb);
    winner = rng < prob1 ? team1 : team2;
  }

  return { winner, prob1 };
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

export function getInitialMatchups(initialTeams: Team[]): Matchup[] {
  const order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
  const matchups: Matchup[] = [];
  
  for (let reg = 0; reg < 4; reg++) {
    const regionTeams = initialTeams.slice(reg * 16, (reg + 1) * 16);
    for (let i = 0; i < order.length; i += 2) {
      const t1 = regionTeams.find(t => t.seed === order[i])!;
      const t2 = regionTeams.find(t => t.seed === order[i+1])!;
      matchups.push({ team1: t1, team2: t2 });
    }
  }
  
  return matchups;
}

export function simulateTournament(initialTeams: Team[]): Round[] {
  const rounds: Round[] = [];
  let currentTeams = [...initialTeams];

  for (let r = 0; r < ROUND_NAMES.length; r++) {
    const matchups: Matchup[] = [];
    const nextRoundTeams: Team[] = [];

    // Special handling for Round of 64 seeding
    if (r === 0) {
      const order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
      for (let reg = 0; reg < 4; reg++) {
        const regionTeams = currentTeams.slice(reg * 16, (reg + 1) * 16);
        for (let i = 0; i < order.length; i += 2) {
          const t1 = regionTeams.find(t => t.seed === order[i])!;
          const t2 = regionTeams.find(t => t.seed === order[i+1])!;
          const { winner, prob1 } = simulateMatchup(t1, t2);
          matchups.push({ team1: t1, team2: t2, winner, winProbability: prob1 });
          nextRoundTeams.push(winner);
        }
      }
    } else {
      for (let i = 0; i < currentTeams.length; i += 2) {
        const { winner, prob1 } = simulateMatchup(currentTeams[i], currentTeams[i+1]);
        matchups.push({ team1: currentTeams[i], team2: currentTeams[i+1], winner, winProbability: prob1 });
        nextRoundTeams.push(winner);
      }
    }

    rounds.push({ name: ROUND_NAMES[r], matchups });
    currentTeams = nextRoundTeams;
  }

  return rounds;
}
