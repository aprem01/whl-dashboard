export function capitalize(s) {
  return (s || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function gdSign(v) {
  if (v > 0) return `+${v}`;
  return `${v}`;
}

export function pct(v) {
  return `${(v * 100).toFixed(1)}%`;
}

export function getTeamColor(powerScore) {
  const r = Math.round(255 * (1 - powerScore));
  const g = Math.round(60 + 180 * powerScore);
  const b = Math.round(80 + 100 * powerScore);
  return `rgb(${r},${g},${b})`;
}

export function getRankBadgeColor(rank) {
  if (rank === 1) return 'bg-yellow-500 text-black';
  if (rank === 2) return 'bg-gray-400 text-black';
  if (rank === 3) return 'bg-amber-600 text-white';
  return 'bg-slate-700 text-slate-400';
}

// Tier system from K-Means clustering
export const TIER_COLORS = {
  Elite: '#1a5276',
  Contender: '#2980b9',
  Competitive: '#f39c12',
  Rebuilding: '#c0392b',
};

export const TIER_BG = {
  Elite: 'bg-blue-900/30 border-blue-800/50 text-blue-300',
  Contender: 'bg-blue-600/20 border-blue-500/40 text-blue-400',
  Competitive: 'bg-yellow-600/20 border-yellow-500/40 text-yellow-400',
  Rebuilding: 'bg-red-600/20 border-red-500/40 text-red-400',
};

export function getTierColor(tierLabel) {
  return TIER_COLORS[tierLabel] || '#666';
}

export const COLORS = {
  accent: '#00d4ff',
  accent2: '#ff6b35',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a855f7',
  card: '#1a2736',
  border: '#2d3f52',
  textDim: '#94a3b8',
  text: '#e2e8f0',
  bg: '#0f1923',
};

export const MODEL_COLORS = {
  'ELO': '#a855f7',
  'B-T': '#ec4899',
  'LR': '#00d4ff',
  'RF': '#22c55e',
  'GBM': '#f59e0b',
  'MLP': '#ef4444',
  'ENS': '#3b82f6',
};

// Model Lab defaults & mappings
export const DEFAULT_POWER_WEIGHTS = {
  elo: 0.25, bt: 0.25, xgd: 0.15, gd: 0.12,
  winPct: 0.08, sd: 0.05, gsax: 0.05, pyth: 0.05,
};

export const DEFAULT_PREDICTION_WEIGHTS = {
  elo: 0.20, bt: 0.20, rf: 0.20, gbm: 0.20,
  lr: 0.10, mlp: 0.10,
};

export const POWER_NORM_FIELDS = {
  elo: 'eloNorm', bt: 'btNorm', xgd: 'xgdPgNorm', gd: 'gdPgNorm',
  winPct: 'winPctNorm', sd: 'sdPgNorm', gsax: 'goalieGsaxNorm', pyth: 'pythExpNorm',
};

export const PREDICTION_PROB_FIELDS = {
  elo: 'pElo', bt: 'pBt', lr: 'pLr', rf: 'pRf', gbm: 'pGbm', mlp: 'pMlp',
};

export const POWER_WEIGHT_LABELS = {
  elo: 'ELO Rating', bt: 'Bradley-Terry', xgd: 'xG Diff/GP', gd: 'Goal Diff/GP',
  winPct: 'Win %', sd: 'Shot Diff/GP', gsax: 'Goalie GSAx', pyth: 'Pythagorean',
};

export const PREDICTION_WEIGHT_LABELS = {
  elo: 'ELO', bt: 'Bradley-Terry', lr: 'Logistic Regression',
  rf: 'Random Forest', gbm: 'Gradient Boosting', mlp: 'MLP Neural Net',
};
