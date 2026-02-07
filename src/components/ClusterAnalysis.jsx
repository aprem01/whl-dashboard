import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend,
         RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { capitalize, COLORS, TIER_COLORS, TIER_BG } from '../utils';
import data from '../data/analysisData.json';

const TIER_ORDER = ['Elite', 'Contender', 'Competitive', 'Rebuilding'];

export default function ClusterAnalysis({ clusterData, rankings }) {
  const { teams: clusterTeams, pcaVariance } = clusterData;
  const radarData = data.radarData;

  const tierGroups = useMemo(() => {
    const groups = {};
    TIER_ORDER.forEach(t => { groups[t] = []; });
    clusterTeams.forEach(ct => {
      const r = rankings.find(rk => rk.team === ct.team);
      groups[ct.tierLabel]?.push({ ...ct, ...r, name: capitalize(ct.team) });
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.powerRank - b.powerRank));
    return groups;
  }, [clusterTeams, rankings]);

  const radarCharts = useMemo(() => {
    if (!radarData?.teams?.length) return [];
    return radarData.teams.slice(0, 5).map(t => {
      const r = rankings.find(rk => rk.team === t.team);
      return {
        team: capitalize(t.team),
        rank: t.rank,
        data: radarData.features.map((f, i) => ({
          feature: f,
          value: +(t.values[i] * 100).toFixed(1),
        })),
        tierLabel: r?.tierLabel || 'Unknown',
      };
    });
  }, [radarData, rankings]);

  const radarColors = ['#00d4ff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];

  return (
    <div>
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h2 className="text-base font-bold text-slate-200 mb-1">K-Means Cluster Analysis — Team Tiers</h2>
        <p className="text-xs text-slate-500">
          4-cluster K-Means on normalized team stats, visualized via PCA (explains {pcaVariance ? (pcaVariance[0] * 100 + pcaVariance[1] * 100).toFixed(1) : '?'}% variance)
        </p>
      </div>

      {/* PCA Scatter */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-1">PCA Cluster Visualization</h3>
        <p className="text-xs text-slate-500 mb-3">
          PC1 ({(pcaVariance[0] * 100).toFixed(1)}% var) vs PC2 ({(pcaVariance[1] * 100).toFixed(1)}% var) — color = K-Means tier
        </p>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ bottom: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" dataKey="pca1" name="PC1"
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: `Principal Component 1 (${(pcaVariance[0] * 100).toFixed(1)}%)`, position: 'bottom', fill: COLORS.textDim, fontSize: 12, offset: 5 }} />
            <YAxis type="number" dataKey="pca2" name="PC2"
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: `PC2 (${(pcaVariance[1] * 100).toFixed(1)}%)`, angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v, name) => [typeof v === 'number' ? v.toFixed(3) : v, name]}
              labelFormatter={(_, payload) => {
                const d = payload?.[0]?.payload;
                return d ? `${capitalize(d.team)} (#${d.powerRank}) — ${d.tierLabel}` : '';
              }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {TIER_ORDER.map(tier => (
              <Scatter key={tier} name={tier}
                data={clusterTeams.filter(t => t.tierLabel === tier)}
                fill={TIER_COLORS[tier]}>
                {clusterTeams.filter(t => t.tierLabel === tier).map((t, i) => (
                  <Cell key={i} r={6} />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {TIER_ORDER.map(tier => (
          <div key={tier} className={`rounded-xl border p-4 ${TIER_BG[tier]}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ background: TIER_COLORS[tier] }} />
              <h3 className="text-sm font-bold">{tier}</h3>
              <span className="text-[10px] opacity-70 ml-auto">{tierGroups[tier]?.length} teams</span>
            </div>
            <div className="space-y-1">
              {tierGroups[tier]?.map(t => (
                <div key={t.team} className="flex items-center justify-between text-xs">
                  <span>
                    <span className="font-bold text-white mr-1">#{t.powerRank}</span>
                    {t.name}
                  </span>
                  <span className="font-mono opacity-70">{t.powerScore?.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Radar charts for top 5 */}
      {radarCharts.length > 0 && (
        <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-1">Top 5 Team Radar Profiles</h3>
          <p className="text-xs text-slate-500 mb-3">Normalized 0-100 across all 32 teams for each metric</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {radarCharts.map((rc, idx) => (
              <div key={rc.team} className="rounded-lg border border-slate-700 p-3" style={{ background: '#0f1923' }}>
                <div className="text-center mb-1">
                  <span className="text-sm font-bold" style={{ color: radarColors[idx] }}>#{rc.rank} {rc.team}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{rc.tierLabel}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={rc.data}>
                    <PolarGrid stroke={COLORS.border} />
                    <PolarAngleAxis dataKey="feature" tick={{ fill: COLORS.textDim, fontSize: 8 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke={radarColors[idx]} fill={radarColors[idx]} fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="rounded-xl border border-cyan-500/30 p-5" style={{ background: '#00d4ff08' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-3">K-Means Clustering Methodology</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p><span className="text-slate-200 font-semibold">Why K-Means?</span> Unsupervised clustering reveals natural groupings in multi-dimensional team data without requiring pre-defined labels.</p>
          <p><span className="text-slate-200 font-semibold">Features used:</span> Win %, Goal Diff/G, xG Diff/G, Save %, Goalie GSAx, Pythagorean Expectation — all normalized to [0, 1].</p>
          <p><span className="text-slate-200 font-semibold">Why 4 clusters?</span> Hockey naturally segments into tiers (elite contenders, playoff teams, middle-of-pack, rebuilders). K=4 matches domain knowledge.</p>
          <p><span className="text-slate-200 font-semibold">PCA:</span> Principal Component Analysis reduces 6 features to 2 dimensions for visualization while preserving {pcaVariance ? (pcaVariance[0] * 100 + pcaVariance[1] * 100).toFixed(1) : '?'}% of total variance.</p>
        </div>
      </div>
    </div>
  );
}
