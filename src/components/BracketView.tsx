import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Round, Matchup } from '../data/engine';

interface BracketViewProps {
  rounds: Round[];
}

const MatchupCard: React.FC<{ matchup: Matchup }> = ({ matchup }) => {
  const p1 = matchup.winProbability ? Math.round(matchup.winProbability * 100) : 50;
  const p2 = 100 - p1;

  return (
    <div className="flex flex-col w-52 border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-lg">
      <div className={`p-2 border-b border-gray-700 flex justify-between items-center ${matchup.winner === matchup.team1 ? 'bg-orange-900/30 text-orange-400 font-bold' : 'text-gray-400'}`}>
        <div className="flex items-center flex-1 truncate">
          <span className="text-[10px] font-mono mr-2 opacity-50 w-4">{matchup.team1.seed}</span>
          <span className="truncate text-xs uppercase tracking-tight">{matchup.team1.name}</span>
        </div>
        <span className="text-[10px] font-mono opacity-40 ml-2">{p1}%</span>
      </div>
      <div className={`p-2 flex justify-between items-center ${matchup.winner === matchup.team2 ? 'bg-orange-900/30 text-orange-400 font-bold' : 'text-gray-400'}`}>
        <div className="flex items-center flex-1 truncate">
          <span className="text-[10px] font-mono mr-2 opacity-50 w-4">{matchup.team2.seed}</span>
          <span className="truncate text-xs uppercase tracking-tight">{matchup.team2.name}</span>
        </div>
        <span className="text-[10px] font-mono opacity-40 ml-2">{p2}%</span>
      </div>
    </div>
  );
};

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
    const totalMatchups = rounds[roundIndex].matchups.length;
    const matchupsPerRegion = totalMatchups / 4;
    // For Final Four and Championship, we handle separately
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
        {[0, 1, 2, 3].map((rIdx) => (
          <div key={rIdx} className="flex flex-col justify-around gap-2">
            <span className="text-[9px] text-gray-600 font-bold uppercase text-center">
              {rounds[rIdx].name.replace('Round of ', 'R')}
            </span>
            <div className="flex flex-col justify-around h-full gap-2">
              {getRegionMatchups(rIdx, regionIndex).map((m, mIdx) => (
                <MatchupCard key={mIdx} matchup={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full pb-10">
      <div className="flex gap-4">
        <button onClick={exportAsImage} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20">
          Export PNG
        </button>
        <button onClick={exportAsPDF} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-green-500/20">
          Export PDF
        </button>
      </div>

      <div ref={bracketRef} className="p-8 bg-gray-900 border border-gray-800 rounded-[2rem] min-w-max relative shadow-2xl overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none rotate-[-15deg]">
          <p className="text-[12rem] font-black text-white whitespace-nowrap">
            BRACKET RANDOMIZER
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-10">
          {/* Left Side: East & West */}
          <div className="flex flex-col gap-8">
            <RegionSection regionIndex={0} title="East" side="left" />
            <RegionSection regionIndex={1} title="West" side="left" />
          </div>

          {/* Center: Final Four & Championship */}
          <div className="flex flex-col items-center gap-6 py-10">
            <div className="text-center">
               <h3 className="text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px] mb-2">Final Four</h3>
               <div className="flex gap-6">
                 <MatchupCard matchup={rounds[4].matchups[0]} />
                 <MatchupCard matchup={rounds[4].matchups[1]} />
               </div>
            </div>

            <div className="text-center transform scale-110">
               <h3 className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] mb-3">Championship</h3>
               <MatchupCard matchup={rounds[5].matchups[0]} />
            </div>

            <div className="w-72 p-8 bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 rounded-[2rem] shadow-2xl text-center border-4 border-white/20">
              <p className="text-white/80 uppercase text-[10px] font-black tracking-widest mb-2">2026 National Champion</p>
              <p className="text-3xl font-black text-white leading-tight drop-shadow-lg">
                {rounds[5].matchups[0].winner?.name}
              </p>
              <div className="inline-block mt-3 px-3 py-0.5 bg-white/20 rounded-full">
                <p className="text-white font-mono text-xs font-bold">SEED #{rounds[5].matchups[0].winner?.seed}</p>
              </div>
            </div>

            <div className="mt-6 opacity-20">
               <p className="text-lg font-bold text-white tracking-widest">bracketrandomizer.com</p>
            </div>
          </div>

          {/* Right Side: South & Midwest */}
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
