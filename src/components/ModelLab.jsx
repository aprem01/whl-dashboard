import { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import {
  capitalize, COLORS, TIER_COLORS, TIER_BG, MODEL_COLORS,
  DEFAULT_POWER_WEIGHTS, DEFAULT_PREDICTION_WEIGHTS,
  POWER_NORM_FIELDS, PREDICTION_PROB_FIELDS,
  POWER_WEIGHT_LABELS, PREDICTION_WEIGHT_LABELS,
} from '../utils';

/* ---------- Slider sub-component ---------- */
function WeightSlider({ label, value, color, onChange }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-32 text-xs font-semibold text-slate-300 truncate">{label}</span>
      <input
        type="range" min={0} max={100} step={1}
        value={Math.round(value * 100)}
        onChange={e => onChange(parseInt(e.target.value) / 100)}
        className="flex-1 cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${value * 100}%, #334155 ${value * 100}%)` }}
      />
      <span className="w-12 text-right text-xs font-bold tabular-nums" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

/* ---------- Stat card ---------- */
function Stat({ value, label, color = COLORS.accent }) {
  return (
    <div className="rounded-lg p-3 text-center border border-slate-700" style={{ background: '#1a2736' }}>
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

/* ---------- Prediction weight key → MODEL_COLORS key ---------- */
const PRED_COLOR_MAP = { elo: 'ELO', bt: 'B-T', lr: 'LR', rf: 'RF', gbm: 'GBM', mlp: 'MLP' };

/* ================================================================ */
export default function ModelLab({ data }) {
  const { powerRankings, matchupPredictions } = data;

  const [powerWeights, setPowerWeights] = useState({ ...DEFAULT_POWER_WEIGHTS });
  const [predWeights, setPredWeights] = useState({ ...DEFAULT_PREDICTION_WEIGHTS });

  /* --- proportional rebalance: move one slider, scale the rest --- */
  const handleWeight = useCallback((obj, setFn, key, raw) => {
    const v = Math.max(0, Math.min(1, raw));
    const others = Object.keys(obj).filter(k => k !== key);
    const othersSum = others.reduce((s, k) => s + obj[k], 0);
    const remainder = 1 - v;
    const updated = { ...obj, [key]: v };
    if (othersSum > 0) {
      const scale = remainder / othersSum;
      others.forEach(k => { updated[k] = Math.max(0, obj[k] * scale); });
    } else {
      others.forEach(k => { updated[k] = remainder / others.length; });
    }
    setFn(updated);
  }, []);

  /* --- detect modifications --- */
  const isModified = useMemo(() => {
    const pw = Object.keys(DEFAULT_POWER_WEIGHTS).some(k => Math.abs(powerWeights[k] - DEFAULT_POWER_WEIGHTS[k]) > 0.001);
    const pr = Object.keys(DEFAULT_PREDICTION_WEIGHTS).some(k => Math.abs(predWeights[k] - DEFAULT_PREDICTION_WEIGHTS[k]) > 0.001);
    return pw || pr;
  }, [powerWeights, predWeights]);

  const resetAll = useCallback(() => {
    setPowerWeights({ ...DEFAULT_POWER_WEIGHTS });
    setPredWeights({ ...DEFAULT_PREDICTION_WEIGHTS });
  }, []);

  /* --- recompute power rankings --- */
  const customRankings = useMemo(() => {
    const totalW = Object.values(powerWeights).reduce((a, b) => a + b, 0) || 1;
    const recomputed = powerRankings.map(team => {
      let score = 0;
      for (const [key, w] of Object.entries(powerWeights)) {
        score += (w / totalW) * (team[POWER_NORM_FIELDS[key]] ?? 0);
      }
      return { ...team, customScore: score, name: capitalize(team.team) };
    });
    recomputed.sort((a, b) => b.customScore - a.customScore);
    recomputed.forEach((t, i) => {
      t.customRank = i + 1;
      t.rankDelta = t.powerRank - t.customRank; // positive = moved UP
    });
    return recomputed;
  }, [powerRankings, powerWeights]);

  /* --- recompute matchup predictions --- */
  const customPredictions = useMemo(() => {
    const totalW = Object.values(predWeights).reduce((a, b) => a + b, 0) || 1;
    return matchupPredictions.map(p => {
      let prob = 0;
      for (const [key, w] of Object.entries(predWeights)) {
        prob += (w / totalW) * (p[PREDICTION_PROB_FIELDS[key]] ?? 0.5);
      }
      const winner = prob >= 0.5 ? p.home : p.away;
      return {
        ...p,
        customEnsemble: prob,
        customWinner: winner,
        winnerChanged: winner !== p.predictedWinner,
      };
    });
  }, [matchupPredictions, predWeights]);

  /* --- summary stats --- */
  const summary = useMemo(() => {
    const up = customRankings.filter(t => t.rankDelta > 0).length;
    const down = customRankings.filter(t => t.rankDelta < 0).length;
    const avgShift = (customRankings.reduce((s, t) => s + Math.abs(t.rankDelta), 0) / customRankings.length).toFixed(1);
    const maxShift = Math.max(...customRankings.map(t => Math.abs(t.rankDelta)));
    const flipped = customPredictions.filter(p => p.winnerChanged).length;
    return { up, down, avgShift, maxShift, flipped };
  }, [customRankings, customPredictions]);

  const top15 = customRankings.slice(0, 15);

  return (
    <div>
      {/* HEADER */}
      <div className="rounded-xl border border-cyan-500/30 p-5 mb-4" style={{ background: '#00d4ff08' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-cyan-400">Model Lab</h2>
            <p className="text-xs text-slate-500 mt-1">
              Adjust ensemble weights in real-time &mdash; see how different model configurations change power rankings and matchup predictions
            </p>
          </div>
          <button onClick={resetAll} disabled={!isModified}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all
              ${isModified
                ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer'
                : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}>
            Reset to Defaults
          </button>
        </div>
        {isModified && (
          <div className="mt-3 text-xs text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
            Weights modified &mdash; results below reflect your custom configuration
          </div>
        )}
      </div>

      {/* SLIDERS — two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Power Score Weights */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-200 mb-1">Power Score Weights</h3>
          <p className="text-[10px] text-slate-500 mb-3">8 metrics &mdash; auto-normalized to 100%</p>
          {Object.entries(POWER_WEIGHT_LABELS).map(([key, label]) => (
            <WeightSlider key={key} label={label} value={powerWeights[key]}
              color={COLORS.accent}
              onChange={v => handleWeight(powerWeights, setPowerWeights, key, v)} />
          ))}
          <div className="text-[10px] text-slate-600 mt-2 text-right">
            Sum: {(Object.values(powerWeights).reduce((a, b) => a + b, 0) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Prediction Weights */}
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-200 mb-1">Prediction Ensemble Weights</h3>
          <p className="text-[10px] text-slate-500 mb-3">6 models &mdash; auto-normalized to 100%</p>
          {Object.entries(PREDICTION_WEIGHT_LABELS).map(([key, label]) => (
            <WeightSlider key={key} label={label} value={predWeights[key]}
              color={MODEL_COLORS[PRED_COLOR_MAP[key]]}
              onChange={v => handleWeight(predWeights, setPredWeights, key, v)} />
          ))}
          <div className="text-[10px] text-slate-600 mt-2 text-right">
            Sum: {(Object.values(predWeights).reduce((a, b) => a + b, 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <Stat value={summary.up} label="Teams Moved Up" color={COLORS.green} />
        <Stat value={summary.down} label="Teams Moved Down" color={COLORS.red} />
        <Stat value={summary.avgShift} label="Avg Rank Shift" />
        <Stat value={summary.maxShift} label="Max Rank Shift" color={COLORS.yellow} />
        <Stat value={summary.flipped} label="Winners Flipped" color={summary.flipped > 0 ? COLORS.yellow : COLORS.accent} />
      </div>

      {/* POWER RANKINGS — bar chart + table */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Custom Power Rankings — Top 15</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={top15} layout="vertical" margin={{ left: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} domain={[0, 'auto']} />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 10, fontWeight: 600 }} width={85} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v, name, props) => {
                const d = props.payload;
                return [`${v.toFixed(4)} (Default: ${d.powerScore.toFixed(4)}) | #${d.customRank} (was #${d.powerRank})`, 'Score'];
              }} />
            <Bar dataKey="customScore" radius={[0, 4, 4, 0]}>
              {top15.map((entry, i) => (
                <Cell key={i} fill={TIER_COLORS[entry.tierLabel] || '#666'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FULL RANKINGS TABLE */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4 overflow-x-auto" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">All 32 Teams — Rank Comparison</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="py-2 text-left w-12">New #</th>
              <th className="py-2 text-left w-12">Old #</th>
              <th className="py-2 text-center w-14">Change</th>
              <th className="py-2 text-left">Team</th>
              <th className="py-2 text-left w-20">Tier</th>
              <th className="py-2 text-right w-20">Default</th>
              <th className="py-2 text-right w-20">Custom</th>
              <th className="py-2 text-right w-16">Diff</th>
            </tr>
          </thead>
          <tbody>
            {customRankings.map(t => {
              const diff = t.customScore - t.powerScore;
              const highlight = Math.abs(t.rankDelta) >= 5;
              return (
                <tr key={t.team}
                  className={`border-b border-slate-800 ${highlight ? (t.rankDelta > 0 ? 'bg-green-500/5' : 'bg-red-500/5') : ''}`}>
                  <td className="py-1.5 font-bold text-cyan-400">{t.customRank}</td>
                  <td className="py-1.5 text-slate-500">{t.powerRank}</td>
                  <td className="py-1.5 text-center font-bold">
                    {t.rankDelta > 0 && <span className="text-green-500">&#9650;{t.rankDelta}</span>}
                    {t.rankDelta < 0 && <span className="text-red-500">&#9660;{Math.abs(t.rankDelta)}</span>}
                    {t.rankDelta === 0 && <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="py-1.5 font-semibold text-slate-200">{t.name}</td>
                  <td className="py-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TIER_BG[t.tierLabel] || ''}`}>
                      {t.tierLabel}
                    </span>
                  </td>
                  <td className="py-1.5 text-right text-slate-400 font-mono">{t.powerScore.toFixed(4)}</td>
                  <td className="py-1.5 text-right text-cyan-400 font-mono font-bold">{t.customScore.toFixed(4)}</td>
                  <td className={`py-1.5 text-right font-mono ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MATCHUP PREDICTIONS TABLE */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4 overflow-x-auto" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Matchup Predictions — Custom Ensemble</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="py-2 text-left w-10">#</th>
              <th className="py-2 text-left">Home</th>
              <th className="py-2 text-left">Away</th>
              <th className="py-2 text-right w-20">Default %</th>
              <th className="py-2 text-right w-20">Custom %</th>
              <th className="py-2 text-right w-16">Shift</th>
              <th className="py-2 text-left w-28">Predicted Winner</th>
            </tr>
          </thead>
          <tbody>
            {customPredictions.map(p => {
              const shift = (p.customEnsemble - p.pEnsemble) * 100;
              return (
                <tr key={p.game}
                  className={`border-b border-slate-800 ${p.winnerChanged ? 'bg-yellow-500/5 border-l-2 border-l-yellow-500' : ''}`}>
                  <td className="py-1.5 text-slate-500">{p.game}</td>
                  <td className="py-1.5 font-semibold text-slate-200">{capitalize(p.home)}</td>
                  <td className="py-1.5 font-semibold text-slate-200">{capitalize(p.away)}</td>
                  <td className="py-1.5 text-right text-slate-400 font-mono">{(p.pEnsemble * 100).toFixed(1)}%</td>
                  <td className="py-1.5 text-right text-cyan-400 font-mono font-bold">{(p.customEnsemble * 100).toFixed(1)}%</td>
                  <td className={`py-1.5 text-right font-mono ${shift > 0 ? 'text-green-500' : shift < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                    {shift > 0 ? '+' : ''}{shift.toFixed(1)}
                  </td>
                  <td className="py-1.5">
                    {p.winnerChanged ? (
                      <span>
                        <span className="line-through text-slate-600 mr-1">{capitalize(p.predictedWinner)}</span>
                        <span className="text-yellow-400 font-bold">{capitalize(p.customWinner)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 font-semibold">{capitalize(p.predictedWinner)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* METHODOLOGY NOTE */}
      <div className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-slate-500">
        <span className="text-slate-300 font-semibold">How it works:</span> Power scores are recalculated as the
        weighted sum of min-max normalized metrics. Matchup probabilities are recalculated as the weighted average of
        individual model outputs. Sliders auto-normalize so weights always sum to 100%. Tier assignments remain fixed
        (from K-Means clustering on original data).
      </div>
    </div>
  );
}
