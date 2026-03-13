import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Round, Matchup, ROUND_NAMES } from '../data/engine';

interface BracketViewProps {
  rounds: Round[];
}

const MatchupCard: React.FC<{ matchup: Matchup }> = ({ matchup }) => {
  const p1 = matchup.winProbability ? Math.round(matchup.winProbability * 100) : (matchup.winner ? (matchup.winner === matchup.team1 ? 100 : 0) : 50);
  const p2 = 100 - p1;

  const isT1Winner = matchup.winner === matchup.team1;
  const isT2Winner = matchup.winner === matchup.team2;

  return (
    <div className="flex flex-col w-52 border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-lg">
      <div className={`p-2 border-b border-gray-700 flex justify-between items-center ${isT1Winner ? 'bg-orange-900/30 text-orange-400 font-bold' : (matchup.winner ? 'text-gray-600' : 'text-gray-400')}`}>
        <div className="flex items-center flex-1 truncate">
          <span className="text-[10px] font-mono mr-2 opacity-50 w-4">{matchup.team1.seed}</span>
          <span className="truncate text-xs uppercase tracking-tight">{matchup.team1.name}</span>
        </div>
        <span className="text-[10px] font-mono opacity-40 ml-2">{p1}%</span>
      </div>
      <div className={`p-2 flex justify-between items-center ${isT2Winner ? 'bg-orange-900/30 text-orange-400 font-bold' : (matchup.winner ? 'text-gray-600' : 'text-gray-400')}`}>
        <div className="flex items-center flex-1 truncate">
          <span className="text-[10px] font-mono mr-2 opacity-50 w-4">{matchup.team2.seed}</span>
          <span className="truncate text-xs uppercase tracking-tight">{matchup.team2.name}</span>
        </div>
        <span className="text-[10px] font-mono opacity-40 ml-2">{p2}%</span>
      </div>
    </div>
  );
};

const PlaceholderCard: React.FC = () => (
  <div className="flex flex-col w-52 border border-dashed border-gray-800 rounded-lg overflow-hidden bg-transparent h-[65px] items-center justify-center">
    <span className="text-[10px] text-gray-800 font-black tracking-widest uppercase">Pending</span>
  </div>
);

const BracketView: React.FC<BracketViewProps> = ({ rounds }) => {
  const bracketRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!bracketRef.current) return;
    const dataUrl = await toPng(bracketRef.current, { backgroundColor: '#111827', pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'bracket-randomizer.png';
    link.href = dataUrl;
    link.click();
  };

  const exportAsPDF = async () => {
    if (!bracketRef.current) return;
    const dataUrl = await toPng(bracketRef.current, { backgroundColor: '#111827', pixelRatio: 2 });
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('bracket-randomizer.pdf');
  };

  if (rounds.length === 0) return null;

  // Helper to get matchups for a region in a round
  const getRegionMatchups = (roundIndex: number, regionIndex: number) => {
    if (!rounds[roundIndex]) return [];
    const totalMatchups = rounds[roundIndex].matchups.length;
    const matchupsPerRegion = totalMatchups / 4;
    if (roundIndex >= 4) return [];
    
    const start = regionIndex * matchupsPerRegion;
    const end = (regionIndex + 1) * matchupsPerRegion;
    return rounds[roundIndex].matchups.slice(start, end);
  };

  const RegionSection = ({ regionIndex, title, side }: { regionIndex: number, title: string, side: 'left' | 'right' }) => (
    <div className="flex flex-col gap-2">
      <h2 className={`text-orange-500 font-black italic text-sm mb-1 ${side === 'right' ? 'text-right' : 'text-left'}`}>
        {title} REGION
      </h2>
      <div className={`flex gap-4 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        {[0, 1, 2, 3].map((rIdx) => {
          const matchups = getRegionMatchups(rIdx, regionIndex);
          const expectedCount = rIdx === 0 ? 8 : (rIdx === 1 ? 4 : (rIdx === 2 ? 2 : 1));
          
          return (
            <div key={rIdx} className="flex flex-col justify-around gap-2">
              <span className="text-[9px] text-gray-600 font-bold uppercase text-center">
                {ROUND_NAMES[rIdx].replace('Round of ', 'R')}
              </span>
              <div className="flex flex-col justify-around h-full gap-2">
                {matchups.length > 0 ? (
                  matchups.map((m, mIdx) => <MatchupCard key={mIdx} matchup={m} />)
                ) : (
                  Array.from({ length: expectedCount }).map((_, i) => <PlaceholderCard key={i} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const finalFourMatchups = rounds[4]?.matchups || [];
  const championshipMatchup = rounds[5]?.matchups[0];
  const champion = championshipMatchup?.winner;

  return (
    <div className="flex flex-col items-center gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
        <button onClick={exportAsImage} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base">
          Export PNG
        </button>
        <button onClick={exportAsPDF} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:py-2 rounded-full font-bold transition-all shadow-lg shadow-green-500/20 text-sm sm:text-base">
          Export PDF
        </button>
      </div>

      <div className="md:hidden text-gray-500 text-[10px] uppercase tracking-widest animate-pulse">
        ← Swipe to view full bracket →
      </div>

      <div ref={bracketRef} className="p-4 md:p-8 bg-gray-900 border border-gray-800 rounded-[1.5rem] md:rounded-[2rem] min-w-max relative shadow-2xl overflow-hidden">
        <div className="relative z-10 flex items-center gap-10">
          <div className="flex flex-col gap-8">
            <RegionSection regionIndex={0} title="East" side="left" />
            <RegionSection regionIndex={1} title="West" side="left" />
          </div>

          <div className="flex flex-col items-center gap-6 py-10">
            <div className="text-center">
               <h3 className="text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-2">Final Four</h3>
               <div className="flex gap-6">
                 {finalFourMatchups[0] ? <MatchupCard matchup={finalFourMatchups[0]} /> : <PlaceholderCard />}
                 {finalFourMatchups[1] ? <MatchupCard matchup={finalFourMatchups[1]} /> : <PlaceholderCard />}
               </div>
            </div>

            <div className="text-center transform scale-110">
               <h3 className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] mb-3">Championship</h3>
               {championshipMatchup ? <MatchupCard matchup={championshipMatchup} /> : <PlaceholderCard />}
            </div>

            <div className={`w-72 p-8 rounded-[2rem] shadow-2xl text-center border-4 transition-all duration-500 ${champion ? 'bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 border-white/20' : 'bg-gray-800 border-gray-700 opacity-50'}`}>
              <p className="text-white/80 uppercase text-[10px] font-black tracking-widest mb-2">2026 National Champion</p>
              {champion ? (
                <>
                  <p className="text-3xl font-black text-white leading-tight drop-shadow-lg animate-in fade-in zoom-in duration-500">
                    {champion.name}
                  </p>
                  <div className="inline-block mt-3 px-3 py-0.5 bg-white/20 rounded-full">
                    <p className="text-white font-mono text-xs font-bold">SEED #{champion.seed}</p>
                  </div>
                </>
              ) : (
                <p className="text-xl font-black text-gray-500 uppercase tracking-tighter">Waiting...</p>
              )}
            </div>

            <div className="mt-6 opacity-20">
               <p className="text-lg font-bold text-white tracking-widest">bracketrandomizer.com</p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <RegionSection regionIndex={2} title="South" side="right" />
            <RegionSection regionIndex={3} title="Midwest" side="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
