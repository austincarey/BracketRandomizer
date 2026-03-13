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
    <div className="min-h-screen bg-[#f1f5f9] text-[#002d62] p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic">
          BRACKET<span className="text-red-600">RANDOMIZER</span>
        </h1>
        <div className="flex gap-4">
          <a
            href="https://ko-fi.com/austincarey"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#29abe2] hover:bg-[#1f8fb5] text-white px-6 py-2 rounded-full font-bold transition-all shadow-md text-sm md:text-base"
          >
            Support on Ko-fi
          </a>
        </div>
      </header>

      <main className="text-center">
        {!isSimulating ? (
          <div className="mb-12 max-w-7xl mx-auto">
            <p className="text-lg md:text-xl text-slate-500 mb-8 font-medium">
              Choose your simulation mode for the 2026 Tournament.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch max-w-4xl mx-auto">
              <button
                onClick={simulateEntire}
                className="flex-1 bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black text-[#002d62]">Full Bracket</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">One Click Chaos</span>
              </button>
              
              <button
                onClick={startStepByStep}
                className="flex-1 bg-[#002d62] text-white hover:bg-[#003d82] p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black">Round by Round</span>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider">Watch it Unfold</span>
              </button>

              <button
                onClick={simulateNextGame}
                className="flex-1 bg-white text-[#002d62] hover:bg-slate-50 border-2 border-[#002d62] p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex flex-col items-center gap-2"
              >
                <span className="text-2xl font-black">Game by Game</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Precision Control</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {!isComplete && (
              <>
                <button
                  onClick={simulateNextRound}
                  className="bg-[#002d62] hover:bg-[#003d82] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
                >
                  Next Round
                </button>
                <button
                  onClick={simulateNextGame}
                  className="bg-white border-2 border-[#002d62] text-[#002d62] hover:bg-slate-50 px-8 py-3 rounded-xl font-bold transition-all"
                >
                  Next Game
                </button>
              </>
            )}
            <button
              onClick={resetBracket}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-8 py-3 rounded-xl font-bold border-2 border-red-200 transition-all"
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
          <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-xl min-h-[300px] md:min-h-[400px] flex items-center justify-center">
            <p className="text-slate-400 font-medium text-base md:text-lg">Select a mode above to start your simulation.</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400">
        <p>&copy; 2026 BracketRandomizer.com. All rights reserved.</p>
      </footer>
    </div>
  )
}
  )
}

export default App
