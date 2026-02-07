import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
         LineChart, Line, Cell } from 'recharts';
import { COLORS, MODEL_COLORS } from '../utils';

export default function ModelComparison({ models, featureImportance }) {
  const mlModels = models.filter(m => m.cvAccuracy != null);
  const allModels = models.filter(m => m.shortName !== 'ENS');

  const accData = mlModels.map(m => ({
    name: m.shortName,
    'Train Acc': +(m.trainAccuracy * 100).toFixed(1),
    'CV Acc': +(m.cvAccuracy * 100).toFixed(1),
    'AUC': m.auc ? +(m.auc * 100).toFixed(1) : 0,
  }));

  const errData = mlModels.map(m => ({
    name: m.shortName,
    'Brier': +m.brier.toFixed(4),
    'Log Loss': +m.logLoss.toFixed(4),
  }));

  const fiData = [...featureImportance].reverse().map(f => ({
    name: f.niceName,
    importance: +(f.importance * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h2 className="text-base font-bold text-slate-200 mb-1">6-Model Ensemble Comparison</h2>
        <p className="text-xs text-slate-500 mb-3">ELO + Bradley-Terry + 4 ML models, combined via weighted ensemble</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Model', 'Type', 'Weight', 'Train Acc', 'CV Acc', 'Log Loss', 'Brier', 'AUC'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-cyan-400 uppercase px-2 py-2 border-b-2 border-cyan-500/30 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allModels.map(m => (
                <tr key={m.shortName} className="hover:bg-cyan-400/5 border-b border-slate-700/50">
                  <td className="px-2 py-2">
                    <span className="font-bold" style={{ color: MODEL_COLORS[m.shortName] }}>{m.name}</span>
                  </td>
                  <td className="px-2 py-2 text-slate-400 text-xs">{m.roleInEnsemble}</td>
                  <td className="px-2 py-2 font-bold text-cyan-400">{(m.ensembleWeight * 100).toFixed(0)}%</td>
                  <td className="px-2 py-2">{m.trainAccuracy ? (m.trainAccuracy * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-2 py-2 font-semibold">{m.cvAccuracy ? (m.cvAccuracy * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-2 py-2 text-slate-400">{m.logLoss?.toFixed(3) ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-400">{m.brier?.toFixed(4) ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-400">{m.auc?.toFixed(3) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-3">ML Model Accuracy & AUC</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 11 }} />
              <YAxis tick={{ fill: COLORS.textDim, fontSize: 11 }} domain={[50, 75]} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Train Acc" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CV Acc" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 p-4" style={{ background: '#1a2736' }}>
          <h3 className="text-sm font-bold text-slate-300 mb-3">Error Metrics (Lower = Better)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 11 }} />
              <YAxis tick={{ fill: COLORS.textDim, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Brier" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Log Loss" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROC Curves */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-3">ROC Curves (ML Models)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" dataKey="fpr" domain={[0, 1]}
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'False Positive Rate', position: 'bottom', fill: COLORS.textDim, fontSize: 12 }} />
            <YAxis type="number" domain={[0, 1]}
              tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: COLORS.textDim, fontSize: 12 }} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {mlModels.filter(m => m.roc).map(m => (
              <Line key={m.shortName} data={m.roc} dataKey="tpr"
                name={`${m.shortName} (AUC=${m.auc?.toFixed(3)})`}
                stroke={MODEL_COLORS[m.shortName]} strokeWidth={2} dot={false} type="monotone" />
            ))}
            <Line data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
              dataKey="tpr" name="Random" stroke="#666" strokeDasharray="5 5"
              strokeWidth={1} dot={false} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      <div className="rounded-xl border border-slate-700 p-4 mb-4" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-slate-300 mb-1">Random Forest Feature Importance</h3>
        <p className="text-xs text-slate-500 mb-3">Which stats best predict game outcomes? (12 features, Gini importance)</p>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={fiData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }}
              label={{ value: 'Importance (%)', position: 'bottom', fill: COLORS.textDim, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 10 }} width={115} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              formatter={(v) => [`${v.toFixed(1)}%`, 'Importance']} />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {fiData.map((entry, i) => (
                <Cell key={i} fill={entry.importance > 10 ? '#2471A3' : entry.importance > 6 ? '#5DADE2' : '#AED6F1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Justification */}
      <div className="rounded-xl border border-cyan-500/30 p-5" style={{ background: '#00d4ff08' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-3">Ensemble Model Justification</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p><span className="text-slate-200 font-semibold">Why an ensemble of 6 models?</span></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-slate-200">ELO + Bradley-Terry:</span> Rating-based models that process games sequentially and capture form</li>
            <li><span className="text-slate-200">Logistic Regression:</span> Well-calibrated probabilities, interpretable coefficients</li>
            <li><span className="text-slate-200">Random Forest + GBM:</span> Non-linear relationships and feature interactions</li>
            <li><span className="text-slate-200">MLP Neural Net:</span> Complex non-linear patterns, best CV accuracy (61.3%)</li>
            <li><span className="text-slate-200">Ensemble averaging:</span> Reduces variance, more robust predictions</li>
          </ul>
          <p className="mt-2 text-slate-300">
            Hockey is inherently noisy — even the best teams win only ~60% of games.
            Our ensemble captures real signal above the ~56.4% home-win baseline.
          </p>
        </div>
      </div>
    </div>
  );
}
