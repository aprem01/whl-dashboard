import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
         ScatterChart, Scatter, Legend } from 'recharts';
import { capitalize, COLORS } from '../utils';

export default function GoalieAnalysis({ goalies }) {
  const sorted = useMemo(() =>
    [...goalies].sort((a, b) => b.gsax - a.gsax).map(g => ({
      ...g, name: g.goalie, teamName: capitalize(g.team),
    })), [goalies]);

  const top15 = sorted.slice(0, 15);
  const bottom10 = sorted.slice(-10).reverse();

  const scatterData = sorted.map(g => ({
    name: g.goalie,
    team: capitalize(g.team),
    savePct: +(g.savePct * 100).toFixed(2),
    gsax: +g.gsax.toFixed(1),
    games: g.games,
    gsaxPg: +g.gsaxPg.toFixed(3),
  }));

  return (
    <div>
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h2 className="text-base font-bold text-slate-200 mb-1">Goalie Analysis — Goals Saved Above Expected (GSAx)</h2>
        <p className="text-xs text-slate-500">
          GSAx = Expected Goals Against − Actual Goals Against. Positive = saving more than expected.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Top 15 GSAx */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-3">Top 15 Goalies by GSAx (Season Total)</h3>
          <ResponsiveContainer width="100%" height={440}>
            <BarChart data={top15} layout="vertical" margin={{ left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 9 }} width={85} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
                formatter={(v, name, props) => {
                  const d = props.payload;
                  return [`GSAx: ${d.gsax.toFixed(1)} | SV%: ${(d.savePct * 100).toFixed(1)}% | GP: ${d.games} | Team: ${capitalize(d.team)}`, ''];
                }} />
              <Bar dataKey="gsax" radius={[0, 4, 4, 0]}>
                {top15.map((g, i) => (
                  <Cell key={i} fill={g.gsax > 30 ? '#22c55e' : g.gsax > 15 ? '#3b82f6' : '#00d4ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Save % vs GSAx scatter */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-1">Save % vs. GSAx</h3>
          <p className="text-xs text-slate-500 mb-3">Size = Games played</p>
          <ResponsiveContainer width="100%" height={440}>
            <ScatterChart margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" dataKey="savePct" name="Save %" domain={['auto', 'auto']}
                tick={{ fill: COLORS.textDim, fontSize: 11 }}
                label={{ value: 'Save %', position: 'bottom', fill: COLORS.textDim, fontSize: 12, offset: 5 }} />
              <YAxis type="number" dataKey="gsax" name="GSAx"
                tick={{ fill: COLORS.textDim, fontSize: 11 }}
                label={{ value: 'GSAx (season)', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
                formatter={(v, name) => [typeof v === 'number' ? v.toFixed(2) : v, name]}
                labelFormatter={(_, payload) => {
                  const d = payload?.[0]?.payload;
                  return d ? `${d.name} (${d.team})` : '';
                }} />
              <Scatter data={scatterData} name="Goalies">
                {scatterData.map((g, i) => (
                  <Cell key={i}
                    fill={g.gsax > 0 ? '#22c55e' : '#ef4444'}
                    r={Math.max(4, g.games / 15)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom 10 */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Bottom 10 Goalies (Worst GSAx)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bottom10} layout="vertical" margin={{ left: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 9 }} width={85} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v, name, props) => {
                const d = props.payload;
                return [`GSAx: ${d.gsax.toFixed(1)} | SV%: ${(d.savePct * 100).toFixed(1)}% | Team: ${capitalize(d.team)}`, ''];
              }} />
            <Bar dataKey="gsax" radius={[4, 0, 0, 4]}>
              {bottom10.map((g, i) => (
                <Cell key={i} fill={g.gsax < -30 ? '#ef4444' : g.gsax < -15 ? '#f97316' : '#eab308'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">All Goalies — Full Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['#', 'Goalie', 'Team', 'GP', 'Shots', 'GA', 'xGA', 'SV%', 'GSAx', 'GSAx/G'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-cyan-400 uppercase px-2 py-2 border-b border-cyan-500/30 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((g, i) => (
                <tr key={g.goalie} className="hover:bg-cyan-400/5 border-b border-slate-700/50">
                  <td className="px-2 py-1.5 text-slate-500">{i + 1}</td>
                  <td className="px-2 py-1.5 font-semibold">{g.goalie}</td>
                  <td className="px-2 py-1.5 text-slate-400">{capitalize(g.team)}</td>
                  <td className="px-2 py-1.5 text-slate-400">{g.games}</td>
                  <td className="px-2 py-1.5 text-slate-400">{g.shotsFaced}</td>
                  <td className="px-2 py-1.5 text-red-400">{g.goalsAllowed}</td>
                  <td className="px-2 py-1.5 text-slate-400">{g.xgFaced.toFixed(1)}</td>
                  <td className="px-2 py-1.5">{(g.savePct * 100).toFixed(1)}%</td>
                  <td className={`px-2 py-1.5 font-bold ${g.gsax > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {g.gsax > 0 ? '+' : ''}{g.gsax.toFixed(1)}
                  </td>
                  <td className={`px-2 py-1.5 ${g.gsaxPg > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {g.gsaxPg > 0 ? '+' : ''}{g.gsaxPg.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-cyan-500/30 p-5" style={{ background: '#00d4ff08' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-3">Understanding GSAx</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p><span className="text-slate-200 font-semibold">What is GSAx?</span> Goals Saved Above Expected measures how many goals a goalie prevented compared to what an average goalie would allow given the same shots.</p>
          <p><span className="text-slate-200 font-semibold">Positive GSAx:</span> The goalie saved more goals than expected — they're performing above average.</p>
          <p><span className="text-slate-200 font-semibold">Negative GSAx:</span> The goalie allowed more goals than expected — below-average performance.</p>
          <p><span className="text-slate-200 font-semibold">Why it matters:</span> GSAx is included in our ensemble power score (5% weight) because elite goaltending is a real competitive advantage that traditional stats like save % don't fully capture.</p>
        </div>
      </div>
    </div>
  );
}
