import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Round, Matchup, ROUND_NAMES, Team } from '../data/engine';

interface BracketViewProps {
  rounds: Round[];
  bulkResults?: Record<string, number[]> | null;
  onOverride?: (roundIdx: number, matchupIdx: number, newWinner: Team) => void;
  isComplete?: boolean;
}

const MatchupCard: React.FC<{ 
  matchup: Matchup; 
  roundIdx: number;
  matchupIdx: number;
  hoveredTeam: string | null; 
  onHover: (name: string | null) => void;
  bulkResults?: Record<string, number[]> | null;
  onOverride?: (roundIdx: number, matchupIdx: number, newWinner: Team) => void;
  isComplete?: boolean;
}> = ({ matchup, roundIdx, matchupIdx, hoveredTeam, onHover, bulkResults, onOverride }) => {
  const p1 = matchup.winProbability ? Math.round(matchup.winProbability * 100) : (matchup.winner ? (matchup.winner === matchup.team1 ? 100 : 0) : 50);
  const p2 = 100 - p1;

  const isT1Winner = matchup.winner === matchup.team1;
  const isT2Winner = matchup.winner === matchup.team2;

  const isT1Hovered = hoveredTeam === matchup.team1.name;
  const isT2Hovered = hoveredTeam === matchup.team2.name;

  const getBulkWinPct = (teamName: string) => {
    if (!bulkResults || !bulkResults[teamName]) return null;
    const wins = bulkResults[teamName][roundIdx + 1];
    return (wins / 10).toFixed(1) + '%';
  };

  const t1Bulk = getBulkWinPct(matchup.team1.name);
  const t2Bulk = getBulkWinPct(matchup.team2.name);

  const canOverrideT1 = matchup.winner && !isT1Winner;
  const canOverrideT2 = matchup.winner && !isT2Winner;

  return (
    <div className="flex flex-col w-52 border border-slate-300 overflow-hidden bg-white shadow-sm transition-all duration-200">
      <div 
        onMouseEnter={() => onHover(matchup.team1.name)}
        onMouseLeave={() => onHover(null)}
        onClick={() => canOverrideT1 && onOverride?.(roundIdx, matchupIdx, matchup.team1)}
        className={`px-3 py-1.5 border-b border-slate-200 flex justify-between items-center transition-colors relative group ${
          isT1Hovered ? 'bg-red-600 text-white' : (isT1Winner ? 'bg-slate-100 font-bold' : (matchup.winner ? 'text-slate-400' : 'text-slate-800'))
        } ${canOverrideT1 ? 'cursor-pointer hover:bg-red-50' : 'cursor-default'}`}
      >
        <div className="flex items-center flex-1 truncate">
          <span className={`text-[10px] font-bold mr-2 w-4 ${isT1Hovered ? 'text-white/80' : 'text-slate-500'}`}>{matchup.team1.seed}</span>
          <span className="truncate text-[11px] uppercase tracking-tight font-semibold">{matchup.team1.name}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[9px] font-bold ${isT1Hovered ? 'text-white/60' : 'text-slate-400'}`}>{p1}%</span>
          {t1Bulk && <span className="text-[7px] font-black text-purple-600">{t1Bulk} sim</span>}
        </div>
        {canOverrideT1 && (
          <div className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-widest">Override Winner?</span>
          </div>
        )}
      </div>
      <div 
        onMouseEnter={() => onHover(matchup.team2.name)}
        onMouseLeave={() => onHover(null)}
        onClick={() => canOverrideT2 && onOverride?.(roundIdx, matchupIdx, matchup.team2)}
        className={`px-3 py-1.5 flex justify-between items-center transition-colors relative group ${
          isT2Hovered ? 'bg-red-600 text-white' : (isT2Winner ? 'bg-slate-100 font-bold' : (matchup.winner ? 'text-slate-400' : 'text-slate-800'))
        } ${canOverrideT2 ? 'cursor-pointer hover:bg-red-50' : 'cursor-default'}`}
      >
        <div className="flex items-center flex-1 truncate">
          <span className={`text-[10px] font-bold mr-2 w-4 ${isT2Hovered ? 'text-white/80' : 'text-slate-500'}`}>{matchup.team2.seed}</span>
          <span className="truncate text-[11px] uppercase tracking-tight font-semibold">{matchup.team2.name}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[9px] font-bold ${isT2Hovered ? 'text-white/60' : 'text-slate-400'}`}>{p2}%</span>
          {t2Bulk && <span className="text-[7px] font-black text-purple-600">{t2Bulk} sim</span>}
        </div>
        {canOverrideT2 && (
          <div className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-widest">Override Winner?</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PlaceholderCard: React.FC = () => (
  <div className="flex flex-col w-52 border border-dashed border-slate-200 overflow-hidden bg-slate-50/50 h-[58px] items-center justify-center">
    <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">Pending</span>
  </div>
);

const BracketView: React.FC<BracketViewProps> = ({ rounds, bulkResults, onOverride, isComplete }) => {
  const bracketRef = useRef<HTMLDivElement>(null);
  const [hoveredTeam, setHoveredTeam] = React.useState<string | null>(null);

  const exportAsImage = async () => {
    if (!bracketRef.current) return;
    
    try {
      const node = bracketRef.current;
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          margin: '0',
          left: '0',
          top: '0',
        }
      });
      
      const link = document.createElement('a');
      link.download = 'bracket-randomizer.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  };

  const exportAsPDF = async () => {
    if (!bracketRef.current) return;

    try {
      const node = bracketRef.current;
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          margin: '0',
          left: '0',
          top: '0',
        }
      });

      const pxToMm = 0.264583;
      const widthMm = width * pxToMm;
      const heightMm = height * pxToMm;
      
      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? 'l' : 'p',
        unit: 'mm',
        format: [widthMm, heightMm]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm);
      pdf.save('bracket-randomizer.pdf');
    } catch (err) {
      console.error('Export PDF failed:', err);
    }
  };

  if (rounds.length === 0) return null;

  const getRegionMatchups = (roundIndex: number, regionIndex: number) => {
    if (!rounds[roundIndex]) return [];
    const totalMatchups = rounds[roundIndex].matchups.length;
    const matchupsPerRegion = totalMatchups / 4;
    if (roundIndex >= 4) return [];
    
    const start = regionIndex * matchupsPerRegion;
    const end = (regionIndex + 1) * matchupsPerRegion;
    return rounds[roundIndex].matchups.slice(start, end).map((m, i) => ({ ...m, originalIdx: start + i }));
  };

  const RegionSection = ({ regionIndex, title, side }: { regionIndex: number, title: string, side: 'left' | 'right' }) => (
    <div className="flex flex-col gap-2">
      <h2 className={`text-[#002d62] font-black italic text-xs mb-1 tracking-wider ${side === 'right' ? 'text-right' : 'text-left'}`}>
        {title.toUpperCase()} REGION
      </h2>
      <div className={`flex gap-6 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        {[0, 1, 2, 3].map((rIdx) => {
          const matchups = getRegionMatchups(rIdx, regionIndex);
          const expectedCount = rIdx === 0 ? 8 : (rIdx === 1 ? 4 : (rIdx === 2 ? 2 : 1));
          
          return (
            <div key={rIdx} className="flex flex-col justify-around gap-2">
              <span className="text-[8px] text-slate-400 font-bold uppercase text-center tracking-tighter">
                {ROUND_NAMES[rIdx].replace('Round of ', 'R')}
              </span>
              <div className="flex flex-col justify-around h-full gap-2">
                {matchups.length > 0 ? (
                  matchups.map((m: any, mIdx) => (
                    <MatchupCard 
                      key={mIdx} 
                      matchup={m} 
                      roundIdx={rIdx}
                      matchupIdx={m.originalIdx}
                      hoveredTeam={hoveredTeam} 
                      onHover={setHoveredTeam} 
                      bulkResults={bulkResults}
                      onOverride={onOverride}
                      isComplete={isComplete}
                    />
                  ))
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
        <button onClick={exportAsImage} className="bg-[#002d62] hover:bg-[#003d82] text-white px-6 py-2 rounded-full font-bold transition-all shadow-md text-sm">
          Export PNG
        </button>
        <button onClick={exportAsPDF} className="bg-white border-2 border-[#002d62] text-[#002d62] hover:bg-slate-50 px-6 py-2 rounded-full font-bold transition-all text-sm">
          Export PDF
        </button>
      </div>

      <div ref={bracketRef} className="p-8 bg-white border border-slate-200 rounded-xl min-w-max relative shadow-2xl">
        {/* Header Bar like the 2023 image */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-[#002d62] flex items-center px-8 justify-between">
            <h1 className="text-white font-black italic tracking-tighter text-xl">
                2026 NCAA DIVISION I MEN'S BASKETBALL CHAMPIONSHIP
            </h1>
            <div className="text-white/40 font-bold text-xs tracking-widest">BRACKETRANDOMIZER.COM</div>
        </div>

        <div className="relative z-10 flex items-center gap-12 mt-12">
          <div className="flex flex-col gap-12">
            <RegionSection regionIndex={0} title="East" side="left" />
            <RegionSection regionIndex={1} title="South" side="left" />
          </div>

          <div className="flex flex-col items-center gap-8 py-10">
            <div className="text-center">
               <div className="bg-[#002d62] text-white px-4 py-1 mb-4 inline-block transform -skew-x-12">
                    <h3 className="font-black italic uppercase text-[10px] tracking-widest">Final Four</h3>
               </div>
               <div className="flex gap-6">
                 {finalFourMatchups[0] ? (
                   <MatchupCard matchup={finalFourMatchups[0]} roundIdx={4} matchupIdx={0} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} bulkResults={bulkResults} onOverride={onOverride} isComplete={isComplete} />
                 ) : (
                   <PlaceholderCard />
                 )}
                 {finalFourMatchups[1] ? (
                   <MatchupCard matchup={finalFourMatchups[1]} roundIdx={4} matchupIdx={1} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} bulkResults={bulkResults} onOverride={onOverride} isComplete={isComplete} />
                 ) : (
                   <PlaceholderCard />
                 )}
               </div>
            </div>

            <div className="text-center transform scale-110">
               <div className="bg-red-600 text-white px-6 py-1 mb-4 inline-block transform -skew-x-12">
                    <h3 className="font-black italic uppercase text-[12px] tracking-widest">Championship</h3>
               </div>
               {championshipMatchup ? (
                 <MatchupCard matchup={championshipMatchup} roundIdx={5} matchupIdx={0} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} bulkResults={bulkResults} onOverride={onOverride} isComplete={isComplete} />
               ) : (
                 <PlaceholderCard />
               )}
            </div>

            <div 
              onMouseEnter={() => champion && setHoveredTeam(champion.name)}
              onMouseLeave={() => setHoveredTeam(null)}
              className={`w-72 p-8 rounded-xl shadow-xl text-center border-2 transition-all duration-500 cursor-default ${
                champion ? (hoveredTeam === champion.name ? 'bg-red-600 border-red-600' : 'bg-white border-[#002d62]') : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
              <p className={`uppercase text-[10px] font-black tracking-widest mb-2 ${hoveredTeam === champion?.name ? 'text-white/80' : 'text-[#002d62]'}`}>
                2026 National Champion
              </p>
              {champion ? (
                <>
                  <p className={`text-3xl font-black leading-tight uppercase italic ${hoveredTeam === champion.name ? 'text-white' : 'text-[#002d62]'}`}>
                    {champion.name}
                  </p>
                  <div className={`inline-block mt-3 px-3 py-0.5 rounded-full ${hoveredTeam === champion.name ? 'bg-white' : 'bg-[#002d62]'}`}>
                    <p className={`font-mono text-xs font-bold ${hoveredTeam === champion.name ? 'text-red-600' : 'text-white'}`}>SEED #{champion.seed}</p>
                  </div>
                  {bulkResults && bulkResults[champion.name] && (
                    <p className={`mt-2 text-[10px] font-black ${hoveredTeam === champion.name ? 'text-white' : 'text-purple-600'}`}>
                      {(bulkResults[champion.name][6] / 10).toFixed(1)}% SIM CHAMPION
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xl font-black text-slate-300 uppercase tracking-tighter italic">TBD</p>
              )}
            </div>

            <div className="mt-6 opacity-30">
               <p className="text-lg font-black text-[#002d62] tracking-tighter italic">BRACKETRANDOMIZER.COM</p>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <RegionSection regionIndex={2} title="West" side="right" />
            <RegionSection regionIndex={3} title="Midwest" side="right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
