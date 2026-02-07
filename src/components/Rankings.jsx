import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { capitalize, gdSign, getRankBadgeColor, COLORS, getTierColor, TIER_BG } from '../utils';

export default function Rankings({ rankings }) {
  const [sortCol, setSortCol] = useState('powerRank');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'team' ? 'asc' : 'desc'); }
  };

  const sorted = useMemo(() => {
    let items = [...rankings];
    if (search) items = items.filter(r => r.team.includes(search.toLowerCase()));
    items.sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? (va ?? 0) - (vb ?? 0) : (vb ?? 0) - (va ?? 0);
    });
    return items;
  }, [rankings, sortCol, sortDir, search]);

  const barData = [...rankings].slice(0, 15).map(r => ({
    name: capitalize(r.team), score: r.powerScore, tier: r.tierLabel,
  }));

  const arrow = (col) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const cols = [
    { key: 'powerRank', label: '#' },
    { key: 'tierLabel', label: 'Tier' },
    { key: 'team', label: 'Team' },
    { key: 'gp', label: 'GP' },
    { key: 'w', label: 'W' },
    { key: 'l', label: 'L' },
    { key: 'otl', label: 'OTL' },
    { key: 'pts', label: 'PTS' },
    { key: 'gd', label: 'GD' },
    { key: 'xgd', label: 'xGD' },
    { key: 'elo', label: 'ELO' },
    { key: 'bt', label: 'B-T' },
    { key: 'powerScore', label: 'Power Score' },
  ];

  return (
    <div>
      {/* Top 15 bar chart */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h2 className="text-base font-bold text-slate-200 mb-1">Ensemble Power Rankings</h2>
        <p className="text-xs text-slate-500 mb-4">Top 15 teams — Colored by K-Means tier</p>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={barData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fill: COLORS.textDim, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v) => [v.toFixed(4), 'Power Score']} labelStyle={{ color: COLORS.text }} />
            <Bar dataKey="score" name="Power Score" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={getTierColor(entry.tier)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Formula */}
      <div className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 font-mono text-sm text-cyan-400 mb-4">
        Power = 25% ELO + 25% B-T + 15% norm(xGD/GP) + 12% norm(GD/GP) + 8% norm(Win%) + 5% norm(SD/GP) + 5% norm(GSAx) + 5% norm(Pyth)
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Full League Table (32 Teams)</h3>
            <p className="text-xs text-slate-500">Click column headers to sort</p>
          </div>
          <input type="text" placeholder="Search team..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 w-48
                       focus:outline-none focus:border-cyan-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {cols.map(c => (
                  <th key={c.key} onClick={() => handleSort(c.key)}
                    className="text-left text-[11px] font-bold text-cyan-400 uppercase tracking-wide px-2 py-2
                               border-b-2 border-cyan-500/50 cursor-pointer hover:text-white select-none whitespace-nowrap">
                    {c.label}{arrow(c.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.team} className="hover:bg-cyan-400/5 transition-colors">
                  <td className="px-2 py-1.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${getRankBadgeColor(r.powerRank)}`}>
                      {r.powerRank}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TIER_BG[r.tierLabel] || ''}`}>
                      {r.tierLabel}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-bold">{capitalize(r.team)}</td>
                  <td className="px-2 py-1.5 text-slate-400">{r.gp}</td>
                  <td className="px-2 py-1.5 font-semibold text-green-500">{r.w}</td>
                  <td className="px-2 py-1.5 font-semibold text-red-500">{r.l}</td>
                  <td className="px-2 py-1.5 font-semibold text-yellow-500">{r.otl}</td>
                  <td className="px-2 py-1.5 font-extrabold">{r.pts}</td>
                  <td className={`px-2 py-1.5 font-semibold ${r.gd > 0 ? 'text-green-500' : r.gd < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                    {gdSign(r.gd)}
                  </td>
                  <td className={`px-2 py-1.5 font-semibold ${r.xgd > 0 ? 'text-green-500' : r.xgd < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                    {gdSign(typeof r.xgd === 'number' ? r.xgd.toFixed(1) : r.xgd)}
                  </td>
                  <td className="px-2 py-1.5 text-slate-400">{r.elo?.toFixed(0)}</td>
                  <td className="px-2 py-1.5 text-slate-400">{r.bt?.toFixed(3)}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{r.powerScore.toFixed(4)}</span>
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.powerScore * 100}%`, background: getTierColor(r.tierLabel) }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
