import { useState } from 'react';
import clsx from 'clsx';
import { predictLoad } from '../services/api';
import ForecastChart from '../components/ForecastChart';
import ControlPanel from '../components/ControlPanel';
import StatsCard from '../components/StatsCard';
import { Activity, Zap, TrendingUp, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [error, setError] = useState(null);

    const handlePredict = async (startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            const result = await predictLoad(startDate, endDate);
            setData(result);
        } catch (err) {
            console.error("Prediction Error:", err);
            let errorMessage = "Failed to fetch forecast. Ensure backend is running.";

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map(e => e.msg).join(', ');
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-slate-400">Real-time energy load forecasting and grid analytics.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-8 animate-in slide-in-from-left duration-700 fade-in delay-100">
                    <ControlPanel onPredict={handlePredict} loading={loading} />

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    {data && (
                        <div className="grid gap-4">
                            <div className="animate-in zoom-in-50 duration-500 delay-300">
                                <StatsCard
                                    title="PEAK_LOAD"
                                    value={`${data.max_load.toFixed(2)} MW`}
                                    icon={TrendingUp}
                                    color="text-[#00FFF6] animate-neon-pulse"
                                />
                            </div>
                            <div className="animate-in zoom-in-50 duration-500 delay-500">
                                <StatsCard
                                    title="MIN_LOAD"
                                    value={`${data.min_load.toFixed(2)} MW`}
                                    icon={Activity}
                                    color="text-[#FF2A6D]"
                                />
                            </div>
                            <div className="animate-in zoom-in-50 duration-500 delay-700">
                                <StatsCard
                                    title="AVG_LOAD"
                                    value={`${data.mean_load.toFixed(2)} MW`}
                                    icon={Zap}
                                    color="text-[#8A8F98]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={clsx(
                    "animate-in slide-in-from-right duration-1000 fade-in delay-200 transaction-all duration-500",
                    isFullScreen ? "fixed inset-0 z-50 p-4 bg-[#0B0F1A]" : "lg:col-span-3"
                )}>
                    <div className={clsx(
                        "bg-[#0B0F1A] border border-[#1e293b] p-6 relative overflow-hidden group transition-all duration-500",
                        isFullScreen ? "h-full w-full" : "h-[600px]"
                    )}>
                        {/* Grid & Scanner Background Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <div className="absolute inset-0 bg-scanner pointer-events-none opacity-20" />

                        {/* Full Screen Toggle */}
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="absolute top-4 right-4 z-20 p-2 bg-[#0B0F1A]/80 border border-[#00FFF6]/30 text-[#00FFF6] hover:bg-[#00FFF6]/10 hover:border-[#00FFF6] transition-all rounded-sm group-hover:opacity-100 opacity-0"
                            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>

                        {data ? (
                            <ForecastChart data={data} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#8A8F98] space-y-4 font-mono uppercase tracking-widest text-xs animate-pulse">
                                <div className="p-4 bg-[#131b2d] border border-[#1e293b] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                    <Zap className="w-8 h-8 text-[#8A8F98]" />
                                </div>
                                <p>AWAITING_INPUT_PARAMETERS...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
