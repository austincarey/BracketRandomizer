import { Round, Team, ROUND_NAMES } from './engine';

/**
 * Encodes the bracket results into a compact string.
 * Each game is 1 bit (0 for team1, 1 for team2).
 * Total 63 games.
 */
export function encodeBracket(rounds: Round[]): string {
  let bitString = '';
  rounds.forEach(round => {
    round.matchups.forEach(matchup => {
      if (matchup.winner === matchup.team1) {
        bitString += '0';
      } else {
        bitString += '1';
      }
    });
  });

  // Pad to multiple of 8 if necessary (though 63 is close to 64)
  while (bitString.length < 64) {
    bitString += '0';
  }

  // Convert bits to bytes
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = parseInt(bitString.substring(i * 8, (i + 1) * 8), 2);
  }

  // Convert bytes to Base64 (URL-safe)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a bracket string back into winners for each round.
 */
export function decodeBracket(encoded: string, initialTeams: Team[]): Round[] {
  // Restore Base64 padding and standard chars
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  let bitString = '';
  bytes.forEach(byte => {
    bitString += byte.toString(2).padStart(8, '0');
  });

  const rounds: Round[] = [];
  let currentTeams = [...initialTeams];
  let bitIndex = 0;

  for (let r = 0; r < ROUND_NAMES.length; r++) {
    const matchups: any[] = [];
    const nextRoundTeams: Team[] = [];

    // Round of 64 seeding order
    if (r === 0) {
      const order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
      for (let reg = 0; reg < 4; reg++) {
        const regionTeams = currentTeams.slice(reg * 16, (reg + 1) * 16);
        for (let i = 0; i < order.length; i += 2) {
          const t1 = regionTeams.find(t => t.seed === order[i])!;
          const t2 = regionTeams.find(t => t.seed === order[i+1])!;
          const winner = bitString[bitIndex++] === '0' ? t1 : t2;
          matchups.push({ team1: t1, team2: t2, winner });
          nextRoundTeams.push(winner);
        }
      }
    } else {
      for (let i = 0; i < currentTeams.length; i += 2) {
        const t1 = currentTeams[i];
        const t2 = currentTeams[i+1];
        const winner = bitString[bitIndex++] === '0' ? t1 : t2;
        matchups.push({ team1: t1, team2: t2, winner });
        nextRoundTeams.push(winner);
      }
    }

    rounds.push({ name: ROUND_NAMES[r], matchups });
    currentTeams = nextRoundTeams;
  }

  return rounds;
}
