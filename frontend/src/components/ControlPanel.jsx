import { useState } from 'react';
import { Calendar, Clock, ArrowRight, Activity } from 'lucide-react';

const ControlPanel = ({ onPredict, loading }) => {
    const [date, setDate] = useState('2025-01-20');
    const [horizon, setHorizon] = useState(24);
    const [modelType, setModelType] = useState('lightgbm');

    const handleSubmit = (e) => {
        e.preventDefault();
        onPredict(date, horizon, modelType);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-slate-300">Configuration</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Target Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Horizon (Hours)
                    </label>
                    <select
                        value={horizon}
                        onChange={(e) => setHorizon(Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    >
                        {[12, 24, 48, 72].map(h => (
                            <option key={h} value={h}>{h} Hours</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Model
                    </label>
                    <select
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    >
                        <option value="lightgbm">LightGBM Hybrid</option>
                        <option value="delhi">Delhi Hybrid (Prophet)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                    {loading ? 'Processing...' : (
                        <>
                            Generate Forecast <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ControlPanel;
