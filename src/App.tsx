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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Bracket<span className="text-orange-500">Randomizer</span>
        </h1>
        <div className="flex gap-4">
          <a
            href="https://www.patreon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Support on Patreon
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto text-center">
        <div className="mb-12">
          <p className="text-xl text-gray-400 mb-8">
            Statistically accurate 2026 March Madness predictions.
          </p>
          <button
            onClick={handleRandomize}
            className="bg-white text-gray-900 hover:bg-gray-200 px-8 py-4 rounded-xl text-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-white/10"
          >
            {rounds.length > 0 ? 'Randomize Again' : 'Randomize Bracket'}
          </button>
        </div>

        {rounds.length > 0 ? (
          <BracketView rounds={rounds} />
        ) : (
          <div className="bg-gray-800 rounded-3xl p-12 border border-gray-700 min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500 text-lg">Click the button to generate your 2026 bracket.</p>
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
