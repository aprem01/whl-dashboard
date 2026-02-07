import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, Cell } from 'recharts';
import { capitalize, COLORS, getTeamColor, TIER_COLORS } from '../utils';

function StatCard({ value, label, color = COLORS.accent }) {
  return (
    <div className="rounded-xl p-4 text-center border border-slate-700" style={{ background: '#1a2736' }}>
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export default function Overview({ data }) {
  const { overview, powerRankings: rankings } = data;

  const barData = [...rankings].sort((a, b) => b.pts - a.pts).map(r => ({
    ...r, name: capitalize(r.team),
  }));

  const scatterData = rankings.map(r => ({
    name: capitalize(r.team),
    pts: r.pts,
    power: +(r.powerScore.toFixed(3)),
    wins: r.w,
    rank: r.powerRank,
    tierLabel: r.tierLabel,
  }));

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        <StatCard value={overview.totalTeams} label="Teams" />
        <StatCard value={overview.totalGames.toLocaleString()} label="Games" />
        <StatCard value={`${(overview.homeWinRate * 100).toFixed(1)}%`} label="Home Win Rate" />
        <StatCard value={overview.otGames} label="OT Games" />
        <StatCard value={overview.avgGoalsPerGame} label="Avg Goals/Game" />
        <StatCard value={overview.totalRows.toLocaleString()} label="Data Rows" color={COLORS.green} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Points bar chart */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-3">Season Points by Team</h3>
          <ResponsiveContainer width="100%" height={600}>
            <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 10 }} width={75} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
                formatter={(v, name, props) => {
                  const d = props.payload;
                  return [`${v} pts | ${d.w}W-${d.l}L-${d.otl}OTL | ${d.tierLabel}`, 'Points'];
                }}
                labelStyle={{ color: COLORS.text }} />
              <Bar dataKey="pts" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={TIER_COLORS[entry.tierLabel] || '#666'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter: Points vs Power */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-1">Points vs Ensemble Power Score</h3>
          <p className="text-xs text-slate-500 mb-3">Color = K-Means tier | Size = Wins</p>
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" dataKey="pts" name="Points" tick={{ fill: COLORS.textDim, fontSize: 11 }}
                label={{ value: 'Season Points', position: 'bottom', fill: COLORS.textDim, fontSize: 12 }} />
              <YAxis type="number" dataKey="power" name="Power" tick={{ fill: COLORS.textDim, fontSize: 11 }}
                label={{ value: 'Ensemble Power Score', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
                formatter={(v, name) => [typeof v === 'number' ? v.toFixed(3) : v, name]}
                labelFormatter={(_, payload) => {
                  const d = payload?.[0]?.payload;
                  return d ? `${d.name} (#${d.rank}) — ${d.tierLabel}` : '';
                }} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={TIER_COLORS[entry.tierLabel] || '#666'} r={Math.max(4, entry.wins / 4)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
