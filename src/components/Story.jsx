import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend,
  ScatterChart, Scatter, ComposedChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { capitalize, COLORS, TIER_COLORS, MODEL_COLORS, gdSign } from '../utils';

function Section({ id, number, title, subtitle, accent = 'cyan', children }) {
  const colors = {
    cyan: 'border-cyan-500/40 from-cyan-500/5',
    green: 'border-green-500/40 from-green-500/5',
    orange: 'border-orange-500/40 from-orange-500/5',
    purple: 'border-purple-500/40 from-purple-500/5',
    yellow: 'border-yellow-500/40 from-yellow-500/5',
    blue: 'border-blue-500/40 from-blue-500/5',
  };
  const textColor = {
    cyan: 'text-cyan-400', green: 'text-green-400', orange: 'text-orange-400',
    purple: 'text-purple-400', yellow: 'text-yellow-400', blue: 'text-blue-400',
  };
  return (
    <section id={id} className={`rounded-2xl border ${colors[accent]} bg-gradient-to-br to-transparent p-6 mb-6`}
      style={{ background: '#1a2736' }}>
      <div className="flex items-start gap-4 mb-4">
        <span className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${textColor[accent]} bg-slate-900 border border-slate-700 text-lg font-black`}>
          {number}
        </span>
        <div>
          <h2 className={`text-xl font-extrabold ${textColor[accent]}`}>{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Callout({ type = 'insight', children }) {
  const styles = {
    insight: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
    finding: 'border-green-500/30 bg-green-500/5 text-green-300',
    decision: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300',
  };
  const icons = { insight: '💡', finding: '✅', decision: '⚖️' };
  return (
    <div className={`rounded-xl border p-4 my-4 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      <span className="text-sm leading-relaxed">{children}</span>
    </div>
  );
}

function Metric({ label, value, sub, color = '#00d4ff' }) {
  return (
    <div className="rounded-xl border border-slate-700 p-3 text-center" style={{ background: '#0f1923' }}>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function Why({ children }) {
  return (
    <div className="flex items-start gap-2 my-2">
      <span className="shrink-0 text-yellow-500 font-black text-sm mt-0.5">WHY?</span>
      <span className="text-sm text-slate-400 leading-relaxed">{children}</span>
    </div>
  );
}

function How({ children }) {
  return (
    <div className="flex items-start gap-2 my-2">
      <span className="shrink-0 text-cyan-500 font-black text-sm mt-0.5">HOW?</span>
      <span className="text-sm text-slate-400 leading-relaxed">{children}</span>
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 p-2.5 text-xs" style={{ background: '#1a2736' }}>
      <div className="font-bold text-slate-200 mb-1">{label || payload[0]?.payload?.name}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-slate-400">
          <span style={{ color: p.color }}>{p.name || p.dataKey}:</span>{' '}
          <span className="font-semibold text-slate-200">{typeof p.value === 'number' ? p.value.toFixed?.(2) ?? p.value : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Story({ data }) {
  const overview = data.overview;
  const rankings = data.powerRankings;
  const disparity = data.disparity;
  const models = data.modelComparison;
  const predictions = data.matchupPredictions;
  const stats = data.disparityStats;
  const radarData = data.radarData;

  const top5 = rankings.slice(0, 5);

  const vizData = useMemo(() =>
    disparity.map(d => ({
      name: capitalize(d.team), team: d.team,
      ratio: d.disparityRatio, power: d.powerScore,
      winPct: d.winPct, powerRank: d.powerRank,
      tierLabel: d.tierLabel,
      first: d.firstLineXg60, second: d.secondLineXg60,
    })), [disparity]);

  const trendLine = useMemo(() => {
    const { slope, intercept } = stats;
    const xs = vizData.map(d => d.ratio);
    const xMin = Math.min(...xs) - 0.02, xMax = Math.max(...xs) + 0.02;
    return Array.from({ length: 40 }, (_, i) => {
      const x = xMin + (xMax - xMin) * i / 39;
      return { ratio: +x.toFixed(4), trend: +(slope * x + intercept).toFixed(4) };
    });
  }, [vizData, stats]);

  const mlModels = models.filter(m => m.cvAccuracy != null);
  const modelChartData = mlModels.map(m => ({
    name: m.shortName,
    'CV Acc': +(m.cvAccuracy * 100).toFixed(1),
    'AUC': m.auc ? +(m.auc * 100).toFixed(1) : 0,
    color: MODEL_COLORS[m.shortName],
  }));

  const top10disp = [...disparity].sort((a, b) => b.disparityRatio - a.disparityRatio).slice(0, 10)
    .map(d => ({ name: capitalize(d.team), '1st Line': d.firstLineXg60, '2nd Line': d.secondLineXg60, ratio: d.disparityRatio }));

  const radarColors = ['#00d4ff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];

  return (
    <div className="max-w-4xl mx-auto">

      {/* HERO */}
      <div className="text-center py-8 mb-6">
        <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          WHL Season Analytics Report
        </div>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          A comprehensive analytics story for the World Hockey League commissioner &mdash;
          6-model ensemble, K-Means clustering, and deep statistical analysis.
        </p>
        <div className="flex justify-center gap-6 mt-6 text-xs text-slate-500">
          <span>WHSDSC 2026</span>
          <span>&bull;</span>
          <span>32 Teams &middot; {overview.totalGames.toLocaleString()} Games &middot; {overview.totalRows.toLocaleString()} Records</span>
          <span>&bull;</span>
          <span>6-Model Ensemble &middot; Phase 1</span>
        </div>
      </div>

      {/* TABLE OF CONTENTS */}
      <div className="rounded-xl border border-slate-700 p-4 mb-6" style={{ background: '#1a2736' }}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Table of Contents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { n: '1', label: 'The Challenge', href: '#challenge' },
            { n: '2', label: 'Our Data', href: '#data' },
            { n: '3', label: 'League Table', href: '#league' },
            { n: '4', label: 'Ensemble Rankings', href: '#power' },
            { n: '5', label: '6-Model Framework', href: '#models' },
            { n: '6', label: 'Matchup Predictions', href: '#matchups' },
            { n: '7', label: 'Team Tiers', href: '#tiers' },
            { n: '8', label: 'Line Disparity', href: '#disparity' },
            { n: '9', label: 'Visualization', href: '#viz' },
            { n: '10', label: 'Conclusions', href: '#conclusions' },
          ].map(t => (
            <a key={t.n} href={t.href}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors">
              <span className="text-cyan-400 font-black text-sm">{t.n}</span>
              <span className="text-xs text-slate-400">{t.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* 1. THE CHALLENGE */}
      <Section id="challenge" number="1" title="The Challenge" subtitle="What the WHL Commissioner asked us to do" accent="cyan">
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          The World Hockey League commissioner has tasked our analytics group with three objectives:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-cyan-500/20 p-3" style={{ background: '#0f1923' }}>
            <div className="text-cyan-400 font-bold text-sm mb-1">Phase 1a</div>
            <p className="text-xs text-slate-400">Rank all 32 teams and predict 16 first-round matchup winners with probabilities.</p>
          </div>
          <div className="rounded-lg border border-orange-500/20 p-3" style={{ background: '#0f1923' }}>
            <div className="text-orange-400 font-bold text-sm mb-1">Phase 1b</div>
            <p className="text-xs text-slate-400">Quantify offensive line quality disparity — rank the top 10 most imbalanced teams.</p>
          </div>
          <div className="rounded-lg border border-green-500/20 p-3" style={{ background: '#0f1923' }}>
            <div className="text-green-400 font-bold text-sm mb-1">Phase 1c + 1d</div>
            <p className="text-xs text-slate-400">Visualize disparity vs. team strength and provide a full methodology summary.</p>
          </div>
        </div>
        <Callout type="decision">
          Our approach: build a <span className="font-bold">6-model ensemble</span> combining ELO, Bradley-Terry, and 4 ML models
          for robust predictions that no single model can match.
        </Callout>
      </Section>

      {/* 2. OUR DATA */}
      <Section id="data" number="2" title="Understanding Our Data" subtitle={`${overview.totalRows.toLocaleString()} rows of WHL game data`} accent="blue">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Metric label="Teams" value="32" />
          <Metric label="Games" value={overview.totalGames.toLocaleString()} />
          <Metric label="Data Rows" value={overview.totalRows.toLocaleString()} color="#22c55e" />
          <Metric label="Home Win %" value={`${(overview.homeWinRate * 100).toFixed(1)}%`} color="#f59e0b" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Each game produces ~18-22 rows of data representing offensive line vs. defensive pairing matchups.
          The data includes goals, shots, expected goals (xG), time on ice, penalties, and overtime info.
        </p>
        <How>
          We aggregated {overview.totalRows.toLocaleString()} line-pairing rows into {overview.totalGames.toLocaleString()} game-level results,
          then computed 12 ML features per team: win%, GD/G, xGD/G, SD/G, SH%, SV%, PF/G, xG Over, xGA Over, GSAx, Pythagorean, Assists/G.
        </How>
        <Callout type="insight">
          Home teams win <span className="font-bold">{(overview.homeWinRate * 100).toFixed(1)}%</span> of games &mdash;
          a meaningful advantage that our ELO model captures via a {'{'}HOME_ADV=55{'}'} parameter.
        </Callout>
      </Section>

      {/* 3. LEAGUE TABLE */}
      <Section id="league" number="3" title="Building the League Table" subtitle="The foundation of our analysis" accent="green">
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs">
            <thead>
              <tr>
                {['#', 'Team', 'Tier', 'W', 'L', 'OTL', 'PTS', 'GD', 'xGD', 'ELO', 'B-T'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-cyan-400 uppercase px-2 py-1.5 border-b border-cyan-500/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankings.slice(0, 10).map(r => (
                <tr key={r.team} className="border-b border-slate-700/40">
                  <td className="px-2 py-1 font-bold text-cyan-400">{r.powerRank}</td>
                  <td className="px-2 py-1 font-semibold">{capitalize(r.team)}</td>
                  <td className="px-2 py-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: TIER_COLORS[r.tierLabel] + '30', color: TIER_COLORS[r.tierLabel] }}>
                      {r.tierLabel}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-green-500 font-semibold">{r.w}</td>
                  <td className="px-2 py-1 text-red-500">{r.l}</td>
                  <td className="px-2 py-1 text-yellow-500">{r.otl}</td>
                  <td className="px-2 py-1 font-extrabold">{r.pts}</td>
                  <td className={`px-2 py-1 font-semibold ${r.gd > 0 ? 'text-green-400' : 'text-red-400'}`}>{gdSign(r.gd)}</td>
                  <td className={`px-2 py-1 ${r.xgd > 0 ? 'text-green-400' : 'text-red-400'}`}>{gdSign(r.xgd.toFixed(1))}</td>
                  <td className="px-2 py-1 text-purple-400">{r.elo.toFixed(0)}</td>
                  <td className="px-2 py-1 text-pink-400">{r.bt.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] text-slate-600 mt-1 text-right">Top 10 of 32 teams by ensemble power score</div>
        </div>
        <Callout type="finding">
          <span className="font-bold">Brazil</span> dominates with 122 points, +87 GD, ELO 1662, and the highest
          Bradley-Terry strength (0.855). Their ensemble power score of <span className="font-bold">0.938</span> is
          well clear of #2 Peru (0.830).
        </Callout>
      </Section>

      {/* 4. POWER RANKINGS */}
      <Section id="power" number="4" title="Ensemble Power Rankings" subtitle="Phase 1a — 8-metric composite scoring" accent="yellow">
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Our <span className="text-yellow-400 font-bold">ensemble power score</span> combines 8 metrics with domain-expert weights:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {Object.entries(data.ensembleWeights.power).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-yellow-500/20 p-2 text-center" style={{ background: '#0f1923' }}>
              <div className="text-lg font-black text-yellow-400">{(v * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-slate-400 uppercase">{k}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 font-mono text-xs text-cyan-400 mb-4">
          Power = 25% ELO + 25% B-T + 15% norm(xGD/GP) + 12% norm(GD/GP) + 8% norm(Win%) + 5% norm(SD/GP) + 5% norm(GSAx) + 5% norm(Pyth)
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rankings.slice(0, 15).map(r => ({ name: capitalize(r.team), score: +r.powerScore.toFixed(3), tierLabel: r.tierLabel }))}
            margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fill: COLORS.textDim, fontSize: 10 }} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey="score" name="Power Score" radius={[6, 6, 0, 0]}>
              {rankings.slice(0, 15).map((r, i) => (
                <Cell key={i} fill={TIER_COLORS[r.tierLabel] || '#666'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <Why>
          No single metric captures team strength. ELO and Bradley-Terry handle sequential game dynamics.
          xGD measures shot quality. GSAx captures goaltending. Pythagorean expectation adjusts for luck.
          Together, they give a <span className="text-white font-semibold">robust, multi-dimensional ranking</span>.
        </Why>
      </Section>

      {/* 5. 6-MODEL FRAMEWORK */}
      <Section id="models" number="5" title="6-Model Prediction Framework" subtitle="Combining rating models with machine learning" accent="purple">
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          We trained and evaluated <span className="text-purple-400 font-bold">6 different models</span>:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {models.filter(m => m.shortName !== 'ENS').map(m => (
            <div key={m.shortName} className="rounded-lg border border-slate-700 p-2.5" style={{ background: '#0f1923' }}>
              <div className="font-bold text-sm" style={{ color: MODEL_COLORS[m.shortName] }}>{m.name}</div>
              <div className="text-[10px] text-slate-500">{m.roleInEnsemble}</div>
              <div className="text-xs text-slate-400 mt-1">
                Weight: <span className="text-cyan-400 font-bold">{(m.ensembleWeight * 100).toFixed(0)}%</span>
                {m.cvAccuracy && <> &middot; CV: {(m.cvAccuracy * 100).toFixed(1)}%</>}
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={modelChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 10 }} />
            <YAxis tick={{ fill: COLORS.textDim, fontSize: 10 }} domain={[50, 70]} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="CV Acc" name="CV Accuracy %" radius={[4, 4, 0, 0]}>
              {modelChartData.map((m, i) => <Cell key={i} fill={m.color} />)}
            </Bar>
            <Bar dataKey="AUC" name="AUC %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <Callout type="decision">
          <span className="font-bold">We use a weighted ensemble</span> (20% ELO + 20% B-T + 20% RF + 20% GBM + 10% LR + 10% MLP)
          because ensemble averaging reduces variance and produces more robust predictions than any single model.
        </Callout>
      </Section>

      {/* 6. MATCHUP PREDICTIONS */}
      <Section id="matchups" number="6" title="Tournament Matchup Predictions" subtitle="Phase 1a — 16 Round 1 games" accent="cyan">
        <How>
          For each matchup, all 6 models predict P(home win). The weighted ensemble average gives the final probability.
          ELO and Bradley-Terry use their rating differences; ML models use the 12-feature difference vector.
        </How>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {predictions.map(p => (
            <div key={p.game} className="flex items-center gap-2 rounded-lg border border-slate-700 p-2.5" style={{ background: '#0f1923' }}>
              <div className="flex-1 text-right">
                <span className="text-xs font-bold text-cyan-400">{capitalize(p.home)}</span>
              </div>
              <div className="w-24 h-5 rounded-full overflow-hidden flex bg-slate-700 shrink-0">
                <div className="h-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ width: `${p.pEnsemble * 100}%`, background: 'linear-gradient(90deg, #00d4ff, #3b82f6)' }}>
                  {(p.pEnsemble * 100).toFixed(0)}%
                </div>
                <div className="h-full flex-1 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: 'linear-gradient(90deg, #dc2626, #ff6b35)' }}>
                  {((1 - p.pEnsemble) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-orange-400">{capitalize(p.away)}</span>
              </div>
            </div>
          ))}
        </div>

        <Callout type="finding">
          The ensemble's predictions reflect both rating-based models (ELO, B-T) and feature-based ML models,
          producing calibrated probabilities that account for team quality differentials and home ice advantage.
        </Callout>
      </Section>

      {/* 7. TEAM TIERS */}
      <Section id="tiers" number="7" title="K-Means Team Tiers" subtitle="Unsupervised clustering reveals natural groupings" accent="blue">
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          K-Means clustering (K=4) on 6 normalized features reveals natural tier separation:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {['Elite', 'Contender', 'Competitive', 'Rebuilding'].map(tier => {
            const count = rankings.filter(r => r.tierLabel === tier).length;
            return (
              <div key={tier} className="rounded-lg border p-3 text-center" style={{ borderColor: TIER_COLORS[tier] + '60', background: '#0f1923' }}>
                <span className="w-3 h-3 rounded-full inline-block mb-1" style={{ background: TIER_COLORS[tier] }} />
                <div className="text-sm font-bold" style={{ color: TIER_COLORS[tier] }}>{tier}</div>
                <div className="text-xs text-slate-500">{count} teams</div>
              </div>
            );
          })}
        </div>

        {/* Radar charts for top 3 */}
        {radarData?.teams?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {radarData.teams.slice(0, 3).map((t, idx) => (
              <div key={t.team} className="rounded-lg border border-slate-700 p-3" style={{ background: '#0f1923' }}>
                <div className="text-center text-sm font-bold mb-1" style={{ color: radarColors[idx] }}>
                  #{t.rank} {capitalize(t.team)}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData.features.map((f, i) => ({ feature: f, value: +(t.values[i] * 100).toFixed(1) }))}>
                    <PolarGrid stroke={COLORS.border} />
                    <PolarAngleAxis dataKey="feature" tick={{ fill: COLORS.textDim, fontSize: 7 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke={radarColors[idx]} fill={radarColors[idx]} fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        <Callout type="insight">
          The K-Means tiers closely align with ensemble power scores, validating our ranking methodology.
          Elite teams excel across all dimensions; Rebuilding teams struggle universally.
        </Callout>
      </Section>

      {/* 8. LINE DISPARITY */}
      <Section id="disparity" number="8" title="Offensive Line Quality Disparity" subtitle="Phase 1b — Measuring team depth" accent="orange">
        <How>
          <span className="text-white font-semibold">Step 1:</span> Filter to even-strength play (1st/2nd off lines vs 1st/2nd def pairings).<br />
          <span className="text-white font-semibold">Step 2:</span> Calculate TOI-weighted xG/60 per line, adjusted for venue and opponent defense quality.<br />
          <span className="text-white font-semibold">Step 3:</span> Ratio = 1st line adj. xG/60 / 2nd line adj. xG/60.
        </How>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top10disp}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: COLORS.textDim, fontSize: 10 }}
              label={{ value: 'Adj. xG/60', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 11 }} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="1st Line" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2nd Line" fill="#ff6b35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="my-4 rounded-lg border border-orange-500/20 p-4" style={{ background: '#0f1923' }}>
          <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Submission: Top 10 Teams by Disparity</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {top10disp.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-sm">
                <span><span className="text-orange-400 font-bold mr-2">{i + 1}.</span> {t.name}</span>
                <span className="text-slate-500 font-mono text-xs">{t.ratio.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 9. VISUALIZATION */}
      <Section id="viz" number="9" title="Disparity vs. Team Strength" subtitle="Phase 1c — Does balanced depth drive success?" accent="green">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart margin={{ bottom: 20, right: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" dataKey="ratio" domain={['auto', 'auto']}
              tick={{ fill: COLORS.textDim, fontSize: 10 }}
              label={{ value: 'Offensive Line Disparity (1st / 2nd Line xG/60)', position: 'bottom', fill: COLORS.textDim, fontSize: 11, offset: 5 }} />
            <YAxis type="number" dataKey="power" domain={['auto', 'auto']}
              tick={{ fill: COLORS.textDim, fontSize: 10 }}
              label={{ value: 'Ensemble Power Score', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 11 }} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              if (!d?.name) return null;
              return (
                <div className="rounded-lg border border-slate-700 p-2.5 text-xs" style={{ background: '#1a2736' }}>
                  <div className="font-bold text-slate-200">{d.name} (#{d.powerRank})</div>
                  <div className="text-slate-400">Disparity: <span className="text-cyan-400">{d.ratio.toFixed(4)}</span></div>
                  <div className="text-slate-400">Power: <span className="text-green-400">{d.power.toFixed(4)}</span></div>
                  <div className="text-slate-400">Win%: {(d.winPct * 100).toFixed(1)}%</div>
                </div>
              );
            }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line data={trendLine} dataKey="trend" stroke="#94a3b8" strokeWidth={2}
              strokeDasharray="8 4" dot={false} type="monotone" name={`Trend (r = ${stats.r.toFixed(3)})`} />
            <Scatter data={vizData} dataKey="power" name="Teams">
              {vizData.map((entry, i) => (
                <Cell key={i} fill={TIER_COLORS[entry.tierLabel] || '#666'} r={Math.max(5, 6)} />
              ))}
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-3 my-4">
          <Metric label="Pearson r" value={stats.r.toFixed(3)} color="#ef4444" sub="Very weak negative" />
          <Metric label="p-value" value={stats.p.toFixed(3)} color="#f59e0b" sub="Not significant" />
          <Metric label="R²" value={(stats.r * stats.r * 100).toFixed(1) + '%'} color="#22c55e" sub="Variance explained" />
        </div>

        <Callout type="finding">
          There is <span className="font-bold">no statistically significant relationship</span> (r = {stats.r.toFixed(3)}, p = {stats.p.toFixed(3)})
          between offensive line disparity and team strength. Team success is driven by
          <span className="font-bold"> overall talent and systems</span>, not how evenly that talent is distributed.
        </Callout>
      </Section>

      {/* 10. CONCLUSIONS */}
      <Section id="conclusions" number="10" title="Conclusions & Strategic Insights" subtitle="What this means for the WHL Tournament" accent="cyan">
        <div className="space-y-4">
          <div className="rounded-xl border border-cyan-500/20 p-4" style={{ background: '#0f1923' }}>
            <h4 className="text-sm font-bold text-cyan-400 mb-2">Finding 1: Brazil is the clear #1</h4>
            <p className="text-sm text-slate-400">
              With the highest ensemble power score (0.938), best ELO (1662), highest B-T strength (0.855),
              and elite goaltending (GSAx +33.6), Brazil excels in every dimension. They are the most complete team in the WHL.
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/20 p-4" style={{ background: '#0f1923' }}>
            <h4 className="text-sm font-bold text-purple-400 mb-2">Finding 2: Ensemble &gt; single model</h4>
            <p className="text-sm text-slate-400">
              Our 6-model ensemble combines the strengths of rating-based approaches (ELO, B-T) with
              feature-rich ML models (RF, GBM, MLP). This reduces individual model bias and produces
              more calibrated probabilities than any single approach.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 p-4" style={{ background: '#0f1923' }}>
            <h4 className="text-sm font-bold text-yellow-400 mb-2">Finding 3: K-Means validates our rankings</h4>
            <p className="text-sm text-slate-400">
              Unsupervised K-Means clustering independently confirms our ensemble tiers. The 4-cluster structure
              (Elite, Contender, Competitive, Rebuilding) aligns closely with power score quartiles,
              providing statistical validation of our ranking methodology.
            </p>
          </div>

          <div className="rounded-xl border border-green-500/20 p-4" style={{ background: '#0f1923' }}>
            <h4 className="text-sm font-bold text-green-400 mb-2">Finding 4: Disparity doesn't determine success</h4>
            <p className="text-sm text-slate-400">
              With r = {stats.r.toFixed(3)} and p = {stats.p.toFixed(3)}, line disparity has no significant effect on team strength.
              Teams succeed through <span className="text-white font-semibold">total system quality</span> — goaltending,
              defensive structure, and coaching — not just offensive line balance.
            </p>
          </div>

          <div className="rounded-xl border border-orange-500/20 p-4" style={{ background: '#0f1923' }}>
            <h4 className="text-sm font-bold text-orange-400 mb-2">Finding 5: Hockey's inherent randomness</h4>
            <p className="text-sm text-slate-400">
              Even the best ML models achieve ~61% accuracy — because hockey is inherently stochastic.
              Our ensemble captures the <span className="text-white font-semibold">real signal</span> above
              the {(overview.homeWinRate * 100).toFixed(1)}% home-win baseline while respecting the sport's randomness.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl p-5 border-2 border-cyan-500/30" style={{ background: 'linear-gradient(135deg, #00d4ff08, #0f1923)' }}>
          <div className="text-center">
            <div className="text-xl font-black text-cyan-400 mb-2">The Bottom Line</div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Our 6-model ensemble framework combines ELO, Bradley-Terry, and 4 ML models with K-Means clustering
              to provide the most comprehensive WHL analytics possible. Brazil leads at #1, but the tournament's
              inherent randomness means upsets are always possible — which is what makes hockey great.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
