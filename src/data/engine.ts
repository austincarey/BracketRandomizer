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

export function getWinProbability(team1: Team, team2: Team, chaosFactor: number = 0): number {
  if (team1.seed === team2.seed) return 0.5;

  const higherSeed = Math.min(team1.seed, team2.seed);
  const lowerSeed = Math.max(team1.seed, team2.seed);
  
  const key = `${higherSeed}_vs_${lowerSeed}`;
  let winProb = seedStats[key] ?? 0.5; // Prob of higher seed beating lower seed

  if (chaosFactor < 0) {
    const targetProb = winProb >= 0.5 ? 1.0 : 0.0;
    winProb = winProb + (targetProb - winProb) * Math.abs(chaosFactor);
  } else if (chaosFactor > 0) {
    const targetProb = winProb >= 0.5 ? 0.0 : 1.0;
    winProb = winProb + (targetProb - winProb) * chaosFactor;
  }

  return team1.seed === higherSeed ? winProb : (1 - winProb);
}

export function simulateMatchup(team1: Team, team2: Team, chaosFactor: number = 0): { winner: Team; prob1: number } {
  const prob1 = getWinProbability(team1, team2, chaosFactor);
  const winner = Math.random() < prob1 ? team1 : team2;
  return { winner, prob1 };
}

export function generateInitialTeams(): Team[] {
  const regions = ['East', 'South', 'West', 'Midwest'];
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

export function simulateTournament(initialTeams: Team[], chaosFactor: number = 0): Round[] {
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
          const { winner, prob1 } = simulateMatchup(t1, t2, chaosFactor);
          matchups.push({ team1: t1, team2: t2, winner, winProbability: prob1 });
          nextRoundTeams.push(winner);
        }
      }
    } else {
      for (let i = 0; i < currentTeams.length; i += 2) {
        const { winner, prob1 } = simulateMatchup(currentTeams[i], currentTeams[i+1], chaosFactor);
        matchups.push({ team1: currentTeams[i], team2: currentTeams[i+1], winner, winProbability: prob1 });
        nextRoundTeams.push(winner);
      }
    }

    rounds.push({ name: ROUND_NAMES[r], matchups });
    currentTeams = nextRoundTeams;
  }

  return rounds;
}

export function calculateChaosScore(rounds: Round[]): number {
  let totalUnlikeliness = 0;
  let maxMatchups = 0;

  rounds.forEach(round => {
    round.matchups.forEach(matchup => {
      if (matchup.winner) {
        // Always calculate "chaos" based on historical baseline (chaosFactor = 0)
        const historicalProb1 = getWinProbability(matchup.team1, matchup.team2, 0);
        const winnerProb = matchup.winner === matchup.team1 ? historicalProb1 : (1 - historicalProb1);
        
        // Unlikeliness is 1 - the historical probability of that team winning
        totalUnlikeliness += (1 - winnerProb);
        maxMatchups++;
      }
    });
  });

  if (maxMatchups === 0) return 0;
  
  // Normalize to 0-100 scale based on average unlikeliness
  return Math.round((totalUnlikeliness / maxMatchups) * 100); 
}

export function bulkSimulate(initialTeams: Team[], iterations: number = 100): Record<string, number[]> {
  const teamResults: Record<string, number[]> = {};

  initialTeams.forEach(team => {
    teamResults[team.name] = new Array(ROUND_NAMES.length + 1).fill(0);
  });

  for (let i = 0; i < iterations; i++) {
    const rounds = simulateTournament(initialTeams);
    
    rounds.forEach((round, roundIdx) => {
      round.matchups.forEach(matchup => {
        if (matchup.winner) {
          teamResults[matchup.winner.name][roundIdx + 1]++;
        }
      });
    });
  }

  return teamResults;
}

export function propagateOverride(rounds: Round[], roundIdx: number, matchupIdx: number, newWinner: Team, chaosFactor: number = 0): Round[] {
  // Deep clone to avoid mutation
  const newRounds: Round[] = JSON.parse(JSON.stringify(rounds));
  const oldWinner = newRounds[roundIdx].matchups[matchupIdx].winner;
  
  if (!oldWinner || oldWinner.name === newWinner.name) return rounds;

  // Update current matchup
  const currentMatchup = newRounds[roundIdx].matchups[matchupIdx];
  currentMatchup.winner = newWinner;
  // Re-calculate winProbability for current matchup as well, just in case
  currentMatchup.winProbability = getWinProbability(currentMatchup.team1, currentMatchup.team2, chaosFactor);

  let currentOldTeam = oldWinner;
  let currentNewTeam = newWinner;

  for (let r = roundIdx + 1; r < newRounds.length; r++) {
    const currentRoundMatchups = newRounds[r].matchups;
    const affectedMatchup = currentRoundMatchups.find(m => 
      m.team1.name === currentOldTeam.name || m.team2.name === currentOldTeam.name
    );

    if (affectedMatchup) {
      if (affectedMatchup.team1.name === currentOldTeam.name) {
        affectedMatchup.team1 = currentNewTeam;
      } else {
        affectedMatchup.team2 = currentNewTeam;
      }

      // Re-calculate probability for the NEW matchup
      affectedMatchup.winProbability = getWinProbability(affectedMatchup.team1, affectedMatchup.team2, chaosFactor);

      if (affectedMatchup.winner?.name === currentOldTeam.name) {
        affectedMatchup.winner = currentNewTeam;
      } else {
        // Stop propagating winner change if the old team wasn't winning this round
        break; 
      }
    } else {
      break;
    }
  }

  return newRounds;
}
