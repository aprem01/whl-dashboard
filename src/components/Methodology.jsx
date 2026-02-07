export default function Methodology() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 p-5" style={{ background: '#1a2736' }}>
        <h2 className="text-base font-bold text-slate-200 mb-4">Phase 1d: Methodology Summary</h2>
        <p className="text-xs text-slate-500 mb-4">
          Crafted for the WHL commissioner &mdash; detailed enough for another analytics group to replicate.
        </p>
      </div>

      {/* Section 1: Process */}
      <div className="rounded-xl border border-slate-700 p-5" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">1. Process</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Data Cleaning &amp; Transformation</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              We aggregated 25,827 line-pairing rows into 1,312 game-level results by summing goals, expected goals,
              shots, and penalties per game. We computed goalie-level GSAx (Goals Saved Above Expected) from shot-level
              xG data. We separated even-strength lines (first_off, second_off) from special teams (PP, PK, empty net)
              for line disparity analysis. No missing values or anomalies required imputation.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Additional Variables Created</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              12 ML features per team: win_pct, gd_pg, xgd_pg, sd_pg, shooting_pct, save_pct, pf_pg, xg_over, xga_over,
              goalie_gsax, pyth_exp (exponent=2.37), assists_pg. ELO ratings (200 shuffles, K=28, HOME_ADV=55,
              margin-of-victory adjusted). Bradley-Terry MLE strengths via scipy.optimize.minimize.
              Composite ensemble power score from 8 weighted metrics. K-Means cluster tiers with PCA visualization.
              Venue-adjusted, TOI-weighted, opponent-quality-adjusted xG/60 for line disparity.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Tools */}
      <div className="rounded-xl border border-slate-700 p-5" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">2. Tools &amp; Techniques</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Software</h4>
            <div className="flex flex-wrap gap-2">
              {['Python', 'pandas', 'NumPy', 'scikit-learn', 'SciPy', 'React', 'Recharts', 'Tailwind CSS', 'Vite'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-semibold border border-cyan-400/20">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Software Usage</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Python (pandas, NumPy) for data manipulation, aggregation, and feature engineering.
              scikit-learn for Logistic Regression, Random Forest (300 trees, max_depth=6),
              Gradient Boosting (200 estimators, max_depth=3, lr=0.05), MLP Neural Network (32→16 hidden layers),
              K-Means clustering (K=4), PCA, and 5-fold stratified cross-validation.
              SciPy for Bradley-Terry MLE optimization and Pearson correlation testing.
              React with Recharts for the interactive dashboard. Tailwind CSS for styling.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Statistical Methods</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <span className="text-slate-200 font-semibold">6-Model Ensemble Prediction Framework:</span> We combine
              ELO (rating-based, 200-shuffle averaged, MOV-adjusted), Bradley-Terry (MLE pairwise comparison),
              Logistic Regression, Random Forest, Gradient Boosting, and MLP Neural Network via weighted averaging
              (20% ELO + 20% B-T + 20% RF + 20% GBM + 10% LR + 10% MLP). Each ML model is trained on 12 team-level
              feature differentials (home - away) with StandardScaler normalization and evaluated via 5-fold stratified
              cross-validation, Brier scores, log loss, and AUC-ROC.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700 mt-2">
              <span className="text-slate-200 font-semibold">Ensemble Power Ranking:</span> Teams are ranked by a
              composite score: 25% normalized ELO + 25% normalized B-T + 15% normalized xGD/GP + 12% normalized GD/GP
              + 8% normalized Win% + 5% normalized SD/GP + 5% normalized GSAx + 5% normalized Pythagorean Expectation.
              All metrics are min-max normalized to [0, 1] before weighting.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700 mt-2">
              <span className="text-slate-200 font-semibold">K-Means Clustering:</span> 4-cluster K-Means on 6 normalized
              team features (win%, GD/G, xGD/G, SV%, GSAx, Pythagorean) assigns teams to Elite/Contender/Competitive/Rebuilding
              tiers. PCA reduces to 2D for visualization, explaining ~90% of variance.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700 mt-2">
              <span className="text-slate-200 font-semibold">Line Disparity:</span> Even-strength only (1st/2nd off vs 1st/2nd def).
              TOI-weighted xG/60 with venue adjustment (home/away factor) and opponent defensive quality normalization
              (league avg xGA/60 / opponent def pairing xGA/60). Pearson correlation with p-value tests relationship
              between disparity and ensemble power score.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Predictions */}
      <div className="rounded-xl border border-slate-700 p-5" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">3. Your Predictions</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">1a: Power Rankings &amp; Matchup Probabilities</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Teams ranked by an 8-metric ensemble power score combining ELO (25%), Bradley-Terry (25%),
              xGD/GP (15%), GD/GP (12%), Win% (8%), SD/GP (5%), GSAx (5%), and Pythagorean (5%).
              Matchup probabilities from a 6-model weighted ensemble: ELO and B-T provide rating-based
              probabilities; LR, RF, GBM, and MLP provide feature-based ML probabilities.
              The ensemble average (20/20/20/20/10/10) produces calibrated win probabilities.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">1b: Offensive Line Quality Disparity</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Computed venue-adjusted, TOI-weighted, opponent-quality-adjusted xG/60 for first and second
              offensive lines using even-strength data only (excluding PP/PK/empty net). Calculated the ratio
              of first-to-second line performance. Top 10 teams by disparity ratio represent the most
              offensively imbalanced squads in the WHL.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">1c: Visualization Design</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Scatter plot of disparity ratio (x-axis) vs ensemble power score (y-axis), colored by K-Means tier.
              Includes regression trend line with Pearson r and p-value. Result: r = -0.049, p = 0.789 —
              no statistically significant relationship. Interactive tooltips provide team-level detail on demand.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Insights */}
      <div className="rounded-xl border border-slate-700 p-5" style={{ background: '#1a2736' }}>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">4. Your Insights</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Model Performance Assessment</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Our best individual ML model (MLP) achieves 61.3% CV accuracy, while the ensemble combines
              complementary strengths. ELO and Bradley-Terry capture sequential game dynamics; ML models capture
              multi-feature interactions. Hockey's inherent randomness limits individual game prediction to ~60%,
              but our ensemble reliably outperforms the 56.4% home-win baseline. K-Means clustering independently
              validates our power rankings, confirming robust tier separation.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1">Generative AI Usage</h4>
            <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              Claude (Anthropic) assisted with code generation for the data pipeline, ensemble model framework,
              and interactive React dashboard development. All statistical methods, model selection decisions,
              ensemble weight choices, and analytical interpretations were designed and validated by the team.
              AI was used as a development accelerator, not as the analytical decision-maker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
