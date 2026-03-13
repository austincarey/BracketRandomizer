import { useState } from 'react'
import { generateInitialTeams, simulateTournament, Round } from './data/engine'
import BracketView from './components/BracketView'
import './App.css'

function App() {
  const [rounds, setRounds] = useState<Round[]>([]);

  const handleRandomize = () => {
    const teams = generateInitialTeams();
    const results = simulateTournament(teams);
    setRounds(results);
  };

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
            Support on Ko-fi
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto text-center">
        <div className="mb-8 md:mb-12">
          <p className="text-lg md:text-xl text-gray-400 mb-6 md:mb-8">
            Statistically accurate 2026 March Madness predictions.
          </p>
          <button
            onClick={handleRandomize}
            className="bg-white text-gray-900 hover:bg-gray-200 px-6 py-3 md:px-8 md:py-4 rounded-xl text-xl md:text-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-white/10 w-full max-w-sm md:max-w-none md:w-auto mx-auto"
          >
            {rounds.length > 0 ? 'Randomize Again' : 'Randomize Bracket'}
          </button>
        </div>

        {rounds.length > 0 ? (
          <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide">
            <BracketView rounds={rounds} />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500 text-base md:text-lg">Click the button to generate your 2026 bracket.</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; 2026 BracketRandomizer.com. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
