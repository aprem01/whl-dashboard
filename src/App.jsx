import { useState } from 'react';
import data from './data/analysisData.json';
import Overview from './components/Overview';
import Rankings from './components/Rankings';
import Matchups from './components/Matchups';
import ModelComparison from './components/ModelComparison';
import LineDisparity from './components/LineDisparity';
import Visualization from './components/Visualization';
import Methodology from './components/Methodology';
import Story from './components/Story';
import GoalieAnalysis from './components/GoalieAnalysis';
import ClusterAnalysis from './components/ClusterAnalysis';
import ModelLab from './components/ModelLab';

const TABS = [
  { id: 'story', label: 'Full Story', icon: '📖' },
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'rankings', label: 'Power Rankings', icon: '🏆' },
  { id: 'matchups', label: 'Matchup Predictions', icon: '🎯' },
  { id: 'models', label: 'Model Comparison', icon: '📈' },
  { id: 'lab', label: 'Model Lab', icon: '🎛️' },
  { id: 'clusters', label: 'Team Tiers', icon: '🔬' },
  { id: 'goalies', label: 'Goalie Analysis', icon: '🥅' },
  { id: 'disparity', label: 'Line Disparity', icon: '⚖️' },
  { id: 'viz', label: 'Visualization', icon: '🎨' },
  { id: 'methodology', label: 'Methodology', icon: '📝' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('story');

  const rankings = data.powerRankings;

  const renderTab = () => {
    switch (activeTab) {
      case 'story': return <Story data={data} />;
      case 'overview': return <Overview data={data} />;
      case 'rankings': return <Rankings rankings={rankings} />;
      case 'matchups': return <Matchups predictions={data.matchupPredictions} rankings={rankings} />;
      case 'models': return <ModelComparison models={data.modelComparison} featureImportance={data.featureImportance} />;
      case 'lab': return <ModelLab data={data} />;
      case 'clusters': return <ClusterAnalysis clusterData={data.clusterData} rankings={rankings} />;
      case 'goalies': return <GoalieAnalysis goalies={data.goalieAnalysis} />;
      case 'disparity': return <LineDisparity disparity={data.disparity} stats={data.disparityStats} />;
      case 'viz': return <Visualization disparity={data.disparity} stats={data.disparityStats} />;
      case 'methodology': return <Methodology />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f1923' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-900/50"
        style={{ background: 'linear-gradient(135deg, #0c1520 0%, #162a3e 50%, #0c1520 100%)' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            WHL
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">World Hockey League Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">WHSDSC 2026 &middot; 6-Model Ensemble Framework</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-cyan-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              PHASE 1
            </span>
            <span className="text-[10px] text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">
              6 Models &middot; 4 Tiers &middot; 32 Teams
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen p-4 border-r border-slate-800 shrink-0 sticky top-[60px] self-start"
          style={{ background: '#131f2e' }}>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ensemble Models</h3>
          <div className="text-[10px] text-slate-400 space-y-1 mb-4">
            {data.modelComparison.filter(m => m.shortName !== 'ENS').map(m => (
              <div key={m.shortName} className="flex justify-between">
                <span>{m.shortName}: {m.name.split('(')[0].trim()}</span>
                <span className="text-cyan-400 font-semibold">{(m.ensembleWeight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700 pt-3 mt-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Power Score Formula</h3>
            <div className="text-[10px] text-slate-400 space-y-0.5">
              {Object.entries(data.ensembleWeights.power).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k.toUpperCase()}</span>
                  <span className="text-cyan-400 font-semibold">{(v * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Stats</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Games: <span className="text-cyan-400 font-bold">{data.overview.totalGames.toLocaleString()}</span></p>
              <p>Teams: <span className="text-cyan-400 font-bold">{data.overview.totalTeams}</span></p>
              <p>Rows: <span className="text-cyan-400 font-bold">{data.overview.totalRows.toLocaleString()}</span></p>
              <p>Home Win: <span className="text-cyan-400 font-bold">{(data.overview.homeWinRate * 100).toFixed(1)}%</span></p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Team Tiers (K-Means)</h3>
            <div className="text-[10px] space-y-1">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#1a5276'}} /> <span className="text-slate-400">Elite</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#2980b9'}} /> <span className="text-slate-400">Contender</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#f39c12'}} /> <span className="text-slate-400">Competitive</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#c0392b'}} /> <span className="text-slate-400">Rebuilding</span></div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Tab nav */}
          <nav className="flex overflow-x-auto border-b border-slate-800" style={{ background: '#131f2e' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}>
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>

          <div className="p-5">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}
