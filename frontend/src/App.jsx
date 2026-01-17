import { useState } from 'react'
import { predictLoad, checkHealth } from './services/api'
import ForecastChart from './components/ForecastChart'
import ControlPanel from './components/ControlPanel'
import StatsCard from './components/StatsCard'
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react'

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (date, horizon) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictLoad(date, horizon);
      setData(result);
    } catch (err) {
      setError("Failed to fetch forecast. ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center space-x-3 mb-8">
          <Zap className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Energy Grid Forecast
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel onPredict={handlePredict} loading={loading} />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <StatsCard
                  title="Peak Load"
                  value={`${data.max_load.toFixed(2)} MW`}
                  icon={TrendingUp}
                  color="text-emerald-400"
                />
                <StatsCard
                  title="Min Load"
                  value={`${data.min_load.toFixed(2)} MW`}
                  icon={Activity}
                  color="text-blue-400"
                />
                <StatsCard
                  title="Average Load"
                  value={`${data.mean_load.toFixed(2)} MW`}
                  icon={Zap}
                  color="text-purple-400"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 h-[600px] shadow-xl">
              {data ? (
                <ForecastChart data={data} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  {loading ? "Generating Forecast..." : "Select a date to generate forecast"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
