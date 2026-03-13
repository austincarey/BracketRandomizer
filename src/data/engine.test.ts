import { describe, it, expect } from 'vitest';
import { generateInitialTeams, simulateTournament, ROUND_NAMES } from './engine';

describe('Simulation Engine', () => {
  it('should generate exactly 64 teams', () => {
    const teams = generateInitialTeams();
    expect(teams).toHaveLength(64);
  });

  it('should simulate exactly 6 rounds', () => {
    const teams = generateInitialTeams();
    const rounds = simulateTournament(teams);
    expect(rounds).toHaveLength(ROUND_NAMES.length);
  });

  it('should have a winner for every matchup in a full simulation', () => {
    const teams = generateInitialTeams();
    const rounds = simulateTournament(teams);
    
    rounds.forEach(round => {
      round.matchups.forEach(matchup => {
        expect(matchup.winner).toBeDefined();
        expect(matchup.winProbability).toBeGreaterThanOrEqual(0);
        expect(matchup.winProbability).toBeLessThanOrEqual(1);
      });
    });
  });

  it('should have 32, 16, 8, 4, 2, 1 matchups in successive rounds', () => {
    const teams = generateInitialTeams();
    const rounds = simulateTournament(teams);
    
    expect(rounds[0].matchups).toHaveLength(32);
    expect(rounds[1].matchups).toHaveLength(16);
    expect(rounds[2].matchups).toHaveLength(8);
    expect(rounds[3].matchups).toHaveLength(4);
    expect(rounds[4].matchups).toHaveLength(2);
    expect(rounds[5].matchups).toHaveLength(1);
  });
});
