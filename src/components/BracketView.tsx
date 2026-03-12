import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Round } from '../data/engine';

interface BracketViewProps {
  rounds: Round[];
}

const BracketView: React.FC<BracketViewProps> = ({ rounds }) => {
  const bracketRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!bracketRef.current) return;
    const dataUrl = await toPng(bracketRef.current, { backgroundColor: '#111827' });
    const link = document.createElement('a');
    link.download = 'my-bracket-randomizer.png';
    link.href = dataUrl;
    link.click();
  };

  const exportAsPDF = async () => {
    if (!bracketRef.current) return;
    const dataUrl = await toPng(bracketRef.current, { backgroundColor: '#111827' });
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('my-bracket-randomizer.pdf');
  };

  if (rounds.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-8 w-full overflow-x-auto pb-12">
      <div className="flex gap-4">
        <button 
          onClick={exportAsImage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Export as PNG
        </button>
        <button 
          onClick={exportAsPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Export as PDF
        </button>
      </div>

      <div 
        ref={bracketRef} 
        className="p-12 bg-gray-900 border border-gray-800 rounded-3xl min-w-max relative"
      >
        {/* Watermark */}
        <div className="absolute top-4 right-8 opacity-20 pointer-events-none">
          <p className="text-4xl font-bold text-white uppercase tracking-widest">
            bracketrandomizer.com
          </p>
        </div>

        <div className="flex gap-12">
          {rounds.map((round) => (
            <div key={round.name} className="flex flex-col justify-around gap-4">
              <h3 className="text-gray-500 font-bold uppercase text-xs mb-4 text-center">
                {round.name}
              </h3>
              <div className="flex flex-col justify-around h-full gap-8">
                {round.matchups.map((matchup, mIndex) => (
                  <div key={mIndex} className="flex flex-col w-48 border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-xl">
                    <div className={`p-2 border-b border-gray-700 flex justify-between items-center ${matchup.winner === matchup.team1 ? 'bg-orange-900/30 text-orange-400 font-bold' : 'text-gray-400'}`}>
                      <span className="text-xs font-mono mr-2 opacity-50">{matchup.team1.seed}</span>
                      <span className="truncate flex-1 text-left">{matchup.team1.name}</span>
                    </div>
                    <div className={`p-2 flex justify-between items-center ${matchup.winner === matchup.team2 ? 'bg-orange-900/30 text-orange-400 font-bold' : 'text-gray-400'}`}>
                      <span className="text-xs font-mono mr-2 opacity-50">{matchup.team2.seed}</span>
                      <span className="truncate flex-1 text-left">{matchup.team2.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Winner Display */}
          <div className="flex flex-col justify-center">
             <div className="w-64 p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl text-center transform scale-110">
                <p className="text-orange-100 uppercase text-xs font-bold mb-2">2026 Champion</p>
                <p className="text-3xl font-black text-white">
                  {rounds[rounds.length - 1].matchups[0].winner?.name}
                </p>
                <p className="text-white/80 font-mono mt-1">Seed #{rounds[rounds.length - 1].matchups[0].winner?.seed}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
