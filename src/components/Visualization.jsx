import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
         Cell, Legend, Line, ComposedChart } from 'recharts';
import { capitalize, COLORS, TIER_COLORS } from '../utils';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 p-3 text-xs" style={{ background: '#1a2736' }}>
      <div className="font-bold text-slate-200 mb-1">{d.name} (#{d.powerRank})</div>
      <div className="flex items-center gap-1 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: TIER_COLORS[d.tierLabel] }} />
        <span className="text-slate-500">{d.tierLabel}</span>
      </div>
      <div className="text-slate-400">Disparity: <span className="text-cyan-400 font-semibold">{d.ratio.toFixed(4)}</span></div>
      <div className="text-slate-400">Power Score: <span className="text-green-400 font-semibold">{d.power.toFixed(4)}</span></div>
      <div className="text-slate-400">Win %: <span className="text-yellow-400 font-semibold">{(d.winPct * 100).toFixed(1)}%</span></div>
      <div className="text-slate-400">1st Line: {d.first.toFixed(2)} | 2nd Line: {d.second.toFixed(2)}</div>
    </div>
  );
}

export default function Visualization({ disparity, stats }) {
  const { r, p, slope, intercept } = stats;

  const vizData = useMemo(() =>
    disparity.map(d => ({
      name: capitalize(d.team),
      team: d.team,
      ratio: d.disparityRatio,
      power: d.powerScore,
      winPct: d.winPct,
      powerRank: d.powerRank,
      tierLabel: d.tierLabel,
      first: d.firstLineXg60,
      second: d.secondLineXg60,
    })), [disparity]);

  const trendData = useMemo(() => {
    const xMin = Math.min(...vizData.map(d => d.ratio)) - 0.02;
    const xMax = Math.max(...vizData.map(d => d.ratio)) + 0.02;
    return Array.from({ length: 50 }, (_, i) => {
      const x = xMin + (xMax - xMin) * i / 49;
      return { ratio: +x.toFixed(4), trend: +(slope * x + intercept).toFixed(4) };
    });
  }, [vizData, slope, intercept]);

  return (
    <div>
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-200">Offensive Line Disparity vs. Team Strength</h2>
          <div className="text-right">
            <span className="text-sm font-mono font-bold text-cyan-400">r = {r.toFixed(3)}</span>
            <span className="text-xs text-slate-500 ml-2">p = {p.toFixed(3)}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Hover for team details &middot; Color = K-Means tier &middot; Dashed line = regression trend
        </p>

        <ResponsiveContainer width="100%" height={520}>
          <ComposedChart margin={{ bottom: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" dataKey="ratio" domain={['auto', 'auto']}
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'Offensive Line Disparity (1st / 2nd Line xG/60)', position: 'bottom', fill: COLORS.textDim, fontSize: 12, offset: 5 }} />
            <YAxis type="number" dataKey="power" domain={['auto', 'auto']}
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'Ensemble Power Score', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Trend line */}
            <Line data={trendData} dataKey="trend" stroke="#94a3b8" strokeWidth={2}
              strokeDasharray="8 4" dot={false} type="monotone" name={`Trend (r=${r.toFixed(3)}, p=${p.toFixed(3)})`}
              legendType="line" />
            {/* Scatter colored by tier */}
            <Scatter data={vizData} dataKey="power" name="Teams" legendType="circle">
              {vizData.map((entry, i) => (
                <Cell key={i}
                  fill={TIER_COLORS[entry.tierLabel] || '#666'}
                  r={6} />
              ))}
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Statistical summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-slate-700 p-3 text-center" style={{ background: '#1a2736' }}>
          <div className="text-2xl font-black text-cyan-400">{r.toFixed(3)}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Pearson r</div>
          <div className="text-[10px] text-slate-600">Very weak negative</div>
        </div>
        <div className="rounded-xl border border-slate-700 p-3 text-center" style={{ background: '#1a2736' }}>
          <div className="text-2xl font-black text-yellow-400">{p.toFixed(3)}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">p-value</div>
          <div className="text-[10px] text-slate-600">Not significant (p &gt; 0.05)</div>
        </div>
        <div className="rounded-xl border border-slate-700 p-3 text-center" style={{ background: '#1a2736' }}>
          <div className="text-2xl font-black text-green-400">{slope.toFixed(3)}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Slope</div>
          <div className="text-[10px] text-slate-600">Near zero effect</div>
        </div>
        <div className="rounded-xl border border-slate-700 p-3 text-center" style={{ background: '#1a2736' }}>
          <div className="text-2xl font-black text-purple-400">{(r * r * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">R-Squared</div>
          <div className="text-[10px] text-slate-600">Variance explained</div>
        </div>
      </div>

      {/* Key finding */}
      <div className="rounded-xl border border-green-500/30 p-5 mb-4" style={{ background: '#22c55e08' }}>
        <h3 className="text-sm font-bold text-green-400 mb-2">Key Finding</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          There is <span className="text-cyan-400 font-bold">essentially no linear relationship</span> (r = {r.toFixed(3)}, p = {p.toFixed(3)})
          between offensive line quality disparity and ensemble team strength.
          The correlation is <span className="text-yellow-400 font-bold">not statistically significant</span> (p = {p.toFixed(3)} &gt; 0.05),
          meaning we <span className="text-white font-semibold">cannot reject the null hypothesis</span> that disparity has no effect on team strength.
          This suggests that in the WHL, team success is driven by <span className="text-green-400 font-bold">overall talent and systems</span> rather
          than how evenly that talent is distributed across offensive lines.
        </p>
      </div>

      {/* Tier legend */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Tier Legend</h3>
        <div className="flex flex-wrap gap-4">
          {['Elite', 'Contender', 'Competitive', 'Rebuilding'].map(tier => (
            <div key={tier} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: TIER_COLORS[tier] }} />
              <span className="text-xs text-slate-400">{tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Design choices */}
      <div className="rounded-xl border border-cyan-500/30 p-5" style={{ background: '#00d4ff08' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-3">Visualization Design Choices</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p><span className="text-slate-200 font-semibold">Scatter plot:</span> Best chart type for showing the relationship between two continuous variables (disparity and power score)</p>
          <p><span className="text-slate-200 font-semibold">Color = K-Means tier:</span> Adds a third dimension showing how cluster membership relates to disparity — Elite teams cluster across various disparity levels</p>
          <p><span className="text-slate-200 font-semibold">Trend line + r + p:</span> Quantifies the direction, strength, and statistical significance of the relationship</p>
          <p><span className="text-slate-200 font-semibold">Hover tooltips:</span> Interactive detail on demand — the commissioner can explore individual teams without cluttering the plot</p>
        </div>
      </div>
    </div>
  );
}
