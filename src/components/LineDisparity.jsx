import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { capitalize, COLORS, TIER_COLORS } from '../utils';

export default function LineDisparity({ disparity, stats }) {
  const [useAdjusted, setUseAdjusted] = useState(true);

  const sortedData = useMemo(() => {
    const items = disparity.map(d => ({
      ...d,
      name: capitalize(d.team),
      ratio: useAdjusted ? d.disparityRatio : d.disparityRatioRaw,
      first: useAdjusted ? d.firstLineXg60 : d.firstLineXg60Raw,
      second: useAdjusted ? d.secondLineXg60 : d.secondLineXg60Raw,
    }));
    items.sort((a, b) => b.ratio - a.ratio);
    return items;
  }, [disparity, useAdjusted]);

  const top10 = sortedData.slice(0, 10);

  return (
    <div>
      {/* Toggle */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-200">Offensive Line Quality Disparity (Phase 1b)</h2>
            <p className="text-xs text-slate-500">
              Venue-adjusted, TOI-weighted, opponent-quality-adjusted xG/60 ratio (1st / 2nd Line) &middot; Even strength only
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setUseAdjusted(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${useAdjusted ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              Adjusted
            </button>
            <button onClick={() => setUseAdjusted(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${!useAdjusted ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              Raw
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">All Teams — Disparity Ratio (colored by K-Means tier)</h3>
        <ResponsiveContainer width="100%" height={700}>
          <BarChart data={sortedData} layout="vertical" margin={{ left: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} domain={[0.8, 'auto']} />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 10, fontWeight: 600 }} width={85} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v, name, props) => {
                const d = props.payload;
                return [`Ratio: ${d.ratio.toFixed(4)} | 1st: ${d.first.toFixed(2)} | 2nd: ${d.second.toFixed(2)} | #${d.powerRank} ${d.tierLabel}`, ''];
              }} />
            <Bar dataKey="ratio" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, i) => (
                <Cell key={i} fill={TIER_COLORS[entry.tierLabel] || '#666'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 detail */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Top 10 — 1st vs 2nd Line xG/60</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={top10}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 10 }} />
            <YAxis tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'xG/60', angle: -90, position: 'insideLeft', fill: COLORS.textDim }} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="first" name="1st Line xG/60" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="second" name="2nd Line xG/60" fill="#ff6b35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Submission list */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Phase 1b Submission: Top 10 Most Imbalanced Teams</h3>
        <div className="space-y-2">
          {top10.map((t, i) => {
            const maxXg = Math.max(...top10.map(x => x.first));
            return (
              <div key={t.team} className="flex items-center gap-3">
                <span className="w-8 text-center text-lg font-extrabold text-cyan-400">{i + 1}</span>
                <span className="w-28 font-semibold text-sm">{t.name}</span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-3.5 rounded-sm flex items-center pl-1 text-[10px] font-semibold text-white"
                    style={{ width: `${(t.first / maxXg * 100)}%`, background: 'linear-gradient(90deg, #00d4ff, #3b82f6)' }}>
                    1st: {t.first.toFixed(2)}
                  </div>
                  <div className="h-3.5 rounded-sm flex items-center pl-1 text-[10px] font-semibold text-white"
                    style={{ width: `${(t.second / maxXg * 100)}%`, background: 'linear-gradient(90deg, #ff6b35, #f97316)' }}>
                    2nd: {t.second.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`w-16 font-bold text-sm ${t.ratio > 1.3 ? 'text-red-500' : t.ratio > 1.2 ? 'text-yellow-500' : 'text-cyan-400'}`}>
                    {t.ratio.toFixed(4)}
                  </span>
                  <div className="text-[10px] text-slate-600">{t.tierLabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlation summary */}
      {stats && (
        <div className="rounded-xl border border-yellow-500/30 p-4 mb-4" style={{ background: '#eab30808' }}>
          <h3 className="text-sm font-bold text-yellow-400 mb-2">Disparity vs. Team Strength</h3>
          <p className="text-sm text-slate-400">
            Pearson r = <span className="text-cyan-400 font-bold">{stats.r.toFixed(3)}</span>,
            p = <span className="text-yellow-400 font-bold">{stats.p.toFixed(3)}</span> —
            no statistically significant relationship between line disparity and ensemble power score.
            See the Visualization tab for the full scatter plot.
          </p>
        </div>
      )}

      {/* Formula */}
      <div className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 font-mono text-sm text-cyan-400 mb-4">
        Disparity = (1st Line Adj. xG/60) / (2nd Line Adj. xG/60)<br/>
        Adj. xG/60 = Raw xG/60 &times; venue_factor &times; (League Avg xGA/60) / (Opp Def xGA/60)
      </div>

      <div className="rounded-xl border border-cyan-500/30 p-5" style={{ background: '#00d4ff08' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-3">Methodology</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p><span className="text-slate-200 font-semibold">Even-strength only:</span> Filters to first_off and second_off lines against first_def and second_def pairings. Excludes PP, PK, and empty-net situations for fair comparison.</p>
          <p><span className="text-slate-200 font-semibold">Venue adjustment:</span> Home/away venue factor corrects for the systematic scoring advantage at home.</p>
          <p><span className="text-slate-200 font-semibold">Opponent quality:</span> Normalizes against opponent defensive pairing quality so a line facing weak defenses isn't artificially inflated.</p>
          <p><span className="text-slate-200 font-semibold">TOI-weighted:</span> xG/60 uses actual time-on-ice to normalize, accounting for different deployment patterns.</p>
        </div>
      </div>
    </div>
  );
}
