import { useState } from 'react';
import { capitalize, COLORS, MODEL_COLORS } from '../utils';

function MatchupCard({ pred, rankings, expanded, onToggle }) {
  const hr = rankings.find(r => r.team === pred.home);
  const ar = rankings.find(r => r.team === pred.away);
  const homeProb = pred.pEnsemble;
  const awayProb = 1 - homeProb;

  const models = [
    { label: 'ELO', prob: pred.pElo, color: MODEL_COLORS['ELO'] },
    { label: 'B-T', prob: pred.pBt, color: MODEL_COLORS['B-T'] },
    { label: 'LR', prob: pred.pLr, color: MODEL_COLORS['LR'] },
    { label: 'RF', prob: pred.pRf, color: MODEL_COLORS['RF'] },
    { label: 'GBM', prob: pred.pGbm, color: MODEL_COLORS['GBM'] },
    { label: 'MLP', prob: pred.pMlp, color: MODEL_COLORS['MLP'] },
  ];

  return (
    <div className="rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-all cursor-pointer"
      style={{ background: '#1a2736' }} onClick={onToggle}>
      <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-3">
        <span>Game {pred.game}</span>
        <span>Round 1</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-center flex-1">
          <div className="text-base font-bold text-cyan-400">{capitalize(pred.home)}</div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/15 text-cyan-400 font-semibold">
            HOME #{hr?.powerRank || '?'} &middot; {hr?.tierLabel}
          </span>
        </div>
        <div className="text-xs text-slate-600 font-bold px-2">VS</div>
        <div className="text-center flex-1">
          <div className="text-base font-bold text-orange-400">{capitalize(pred.away)}</div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-400/15 text-orange-400 font-semibold">
            AWAY #{ar?.powerRank || '?'} &middot; {ar?.tierLabel}
          </span>
        </div>
      </div>

      <div className="h-7 rounded-full overflow-hidden flex bg-slate-700">
        <div className="flex items-center justify-center text-xs font-bold text-white"
          style={{ width: `${homeProb * 100}%`, background: 'linear-gradient(90deg, #00d4ff, #3b82f6)' }}>
          {(homeProb * 100).toFixed(1)}%
        </div>
        <div className="flex items-center justify-center text-xs font-bold text-white flex-1"
          style={{ background: 'linear-gradient(90deg, #dc2626, #ff6b35)' }}>
          {(awayProb * 100).toFixed(1)}%
        </div>
      </div>

      <div className="text-center mt-2 text-xs text-green-500 font-semibold">
        Predicted: {capitalize(pred.predictedWinner)} (Ensemble)
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Individual Model Probabilities (Home Win)</div>
          <div className="space-y-1.5">
            {models.map(m => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-bold" style={{ color: m.color }}>{m.label}</span>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.prob * 100}%`, background: m.color, opacity: 0.8 }} />
                </div>
                <span className="w-12 text-right text-[10px] font-semibold text-slate-300">{(m.prob * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Matchups({ predictions, rankings }) {
  const [expandedGame, setExpandedGame] = useState(null);

  return (
    <div>
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-200">Round 1 Tournament Predictions</h2>
            <p className="text-xs text-slate-500">6-Model Ensemble &middot; Click cards to see individual model probabilities</p>
          </div>
          <div className="text-[10px] text-slate-400 bg-slate-900 rounded-lg px-3 py-2 border border-slate-700">
            <span className="font-bold text-cyan-400">Ensemble:</span> 20% ELO + 20% B-T + 20% RF + 20% GBM + 10% LR + 10% MLP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        {predictions.map(p => (
          <MatchupCard key={p.game} pred={p} rankings={rankings}
            expanded={expandedGame === p.game}
            onToggle={() => setExpandedGame(expandedGame === p.game ? null : p.game)} />
        ))}
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Full Predictions Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Game', 'Home', 'Away', 'ELO', 'B-T', 'LR', 'RF', 'GBM', 'MLP', 'Ensemble', 'Winner'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-cyan-400 uppercase px-2 py-2 border-b border-cyan-500/30 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map(p => (
                <tr key={p.game} className="hover:bg-cyan-400/5 border-b border-slate-700/50">
                  <td className="px-2 py-1.5 text-slate-400">{p.game}</td>
                  <td className="px-2 py-1.5 font-semibold">{capitalize(p.home)}</td>
                  <td className="px-2 py-1.5 font-semibold">{capitalize(p.away)}</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pElo * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pBt * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pLr * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pRf * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pGbm * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 text-slate-400">{(p.pMlp * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 font-bold text-cyan-400">{(p.pEnsemble * 100).toFixed(1)}%</td>
                  <td className="px-2 py-1.5 font-bold text-green-500">{capitalize(p.predictedWinner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
