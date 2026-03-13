import { useState, useCallback } from 'react'
import { 
  generateInitialTeams, 
  simulateTournament, 
  simulateMatchup, 
  getInitialMatchups,
  Round, 
  Matchup, 
  ROUND_NAMES 
} from './data/engine'
import BracketView from './components/BracketView'
import './App.css'

function App() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const resetBracket = useCallback(() => {
    setRounds([]);
    setIsSimulating(false);
  }, []);

  const simulateEntire = () => {
    const teams = generateInitialTeams();
    const results = simulateTournament(teams);
    setRounds(results);
    setIsSimulating(true);
  };

  const startStepByStep = () => {
    const teams = generateInitialTeams();
    const initialMatchups = getInitialMatchups(teams);
    setRounds([{ name: ROUND_NAMES[0], matchups: initialMatchups }]);
    setIsSimulating(true);
  };

  const simulateNextRound = () => {
    if (rounds.length === 0) return;
    
    const currentRoundIdx = rounds.length - 1;
    const currentRound = rounds[currentRoundIdx];
    
    // Ensure current round is fully simulated
    const allWinners = currentRound.matchups.every(m => m.winner);
    if (!allWinners) {
      // Finish current round first
      const newMatchups = currentRound.matchups.map(m => {
        if (m.winner) return m;
        const { winner, prob1 } = simulateMatchup(m.team1, m.team2);
        return { ...m, winner, winProbability: prob1 };
      });
      const newRounds = [...rounds];
      newRounds[currentRoundIdx] = { ...currentRound, matchups: newMatchups };
      setRounds(newRounds);
      return;
    }

    if (rounds.length >= ROUND_NAMES.length) return;

    // Create next round matchups
    const winners = currentRound.matchups.map(m => m.winner!);
    const nextMatchups: Matchup[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextMatchups.push({ team1: winners[i], team2: winners[i+1] });
    }

    setRounds([...rounds, { name: ROUND_NAMES[rounds.length], matchups: nextMatchups }]);
  };

  const simulateNextGame = () => {
    let currentRounds = [...rounds];
    
    if (currentRounds.length === 0) {
      const teams = generateInitialTeams();
      const initialMatchups = getInitialMatchups(teams);
      currentRounds = [{ name: ROUND_NAMES[0], matchups: initialMatchups }];
      setRounds(currentRounds);
      setIsSimulating(true);
      return;
    }

    const currentRoundIdx = currentRounds.length - 1;
    const currentRound = currentRounds[currentRoundIdx];
    const nextMatchupIdx = currentRound.matchups.findIndex(m => !m.winner);

    if (nextMatchupIdx !== -1) {
      // Simulate next game in current round
      const matchup = currentRound.matchups[nextMatchupIdx];
      const { winner, prob1 } = simulateMatchup(matchup.team1, matchup.team2);
      const newMatchups = [...currentRound.matchups];
      newMatchups[nextMatchupIdx] = { ...matchup, winner, winProbability: prob1 };
      currentRounds[currentRoundIdx] = { ...currentRound, matchups: newMatchups };
      setRounds(currentRounds);
    } else {
      // Current round finished, start next round
      if (currentRounds.length < ROUND_NAMES.length) {
        const winners = currentRound.matchups.map(m => m.winner!);
        const nextMatchups: Matchup[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          nextMatchups.push({ team1: winners[i], team2: winners[i+1] });
        }
        const nextRound = { name: ROUND_NAMES[currentRounds.length], matchups: nextMatchups };
        
        // Simulate first game of next round immediately for better UX
        const firstMatchup = nextRound.matchups[0];
        const { winner, prob1 } = simulateMatchup(firstMatchup.team1, firstMatchup.team2);
        nextRound.matchups[0] = { ...firstMatchup, winner, winProbability: prob1 };
        
        setRounds([...currentRounds, nextRound]);
      }
    }
  };

  const isComplete = rounds.length === ROUND_NAMES.length && rounds[5].matchups[0].winner;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
          Bracket<span className="text-orange-500">Randomizer</span>
        </h1>
        <div className="flex gap-4">
          <a
            href="https://ko-fi.com/austincarey"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#29abe2] hover:bg-[#1f8fb5] px-6 py-2 rounded-full font-semibold transition-colors text-sm md:text-base"
          >
            Donate to this Site
          </a>
        </div>
      </header>

      <main className="text-center">
        {!isSimulating ? (
          <div className="mb-12 max-w-7xl mx-auto">
            <p className="text-lg md:text-xl text-gray-400 mb-8">
              Choose your simulation mode for the 2026 Tournament.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch max-w-4xl mx-auto">
              <button
                onClick={simulateEntire}
                className="flex-1 bg-white text-gray-900 hover:bg-gray-200 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black">Full Bracket</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">One Click Chaos</span>
              </button>
              
              <button
                onClick={startStepByStep}
                className="flex-1 bg-orange-600 text-white hover:bg-orange-700 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black">Round by Round</span>
                <span className="text-xs text-orange-200 font-medium uppercase tracking-wider">Watch it Unfold</span>
              </button>

              <button
                onClick={simulateNextGame}
                className="flex-1 bg-gray-800 text-white hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black">Game by Game</span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Precision Control</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {!isComplete && (
              <>
                <button
                  onClick={simulateNextRound}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  Simulate Next Round
                </button>
                <button
                  onClick={simulateNextGame}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold border border-gray-700 transition-all"
                >
                  Next Game
                </button>
              </>
            )}
            <button
              onClick={resetBracket}
              className="bg-red-900/40 hover:bg-red-900/60 text-red-400 px-6 py-3 rounded-xl font-bold border border-red-900/50 transition-all"
            >
              Reset
            </button>
          </div>
        )}

        {rounds.length > 0 ? (
          <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide flex justify-center lg:justify-start">
            <div className="inline-block mx-auto min-w-min">
              <BracketView rounds={rounds} />
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500 text-base md:text-lg">Select a mode above to start your simulation.</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; 2026 Austin Carey / BracketRandomizer.com. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
