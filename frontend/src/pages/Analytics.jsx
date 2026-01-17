import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { predictLoad } from '../services/api';
import StatsCard from '../components/StatsCard';
import { TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch a representative week for analytics
                const startDate = '2024-01-15';
                const endDate = '2024-01-21';
                const result = await predictLoad(startDate, endDate);

                if (!result || !result.loads_lightgbm || !result.loads_delhi) {
                    throw new Error("Invalid data format received from API");
                }
                setData(result);
            } catch (error) {
                console.error("Failed to load analytics data", error);
                setError(error.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-violet-400 animate-pulse">
            <Activity className="w-8 h-8 mr-3" /> Loading Analytics Engine...
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-500/80">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics Unavailable</h3>
            <p className="text-slate-400 max-w-md text-center">{error || "No data could be generated."}</p>
        </div>
    );

    // Safe aggregation
    const safeReduce = (arr) => arr.reduce((a, b) => a + (b || 0), 0);
    const lgbTotal = safeReduce(data.loads_lightgbm);
    const delhiTotal = safeReduce(data.loads_delhi);

    // Avoid division by zero
    const avgLoad = (lgbTotal + delhiTotal) / (Math.max(1, data.loads_lightgbm.length + data.loads_delhi.length));

    // Deviation calc
    const diff = Math.abs(lgbTotal - delhiTotal);
    const deviation = avgLoad > 0 ? (diff / (lgbTotal + delhiTotal) * 200) : 0; // Simplified % diff

    // Find Extremes
    const findExtremes = (loads, timestamps) => {
        let maxVal = -Infinity, minVal = Infinity;
        let maxTime = 'N/A', minTime = 'N/A';

        loads.forEach((load, i) => {
            if (load > maxVal) { maxVal = load; maxTime = timestamps[i]; }
            if (load < minVal) { minVal = load; minTime = timestamps[i]; }
        });

        if (maxVal === -Infinity) maxVal = 0;
        if (minVal === Infinity) minVal = 0;

        return { maxVal, maxTime, minVal, minTime };
    };

    const lgbExtremes = findExtremes(data.loads_lightgbm, data.timestamps);
    const delhiExtremes = findExtremes(data.loads_delhi, data.timestamps);

    // Chart Data Sampling (Every 4th hour for readability)
    const hourlyComparison = data.timestamps.map((ts, i) => ({
        hour: ts.split(' ')[1]?.substring(0, 5) || ts, // HH:MM
        LightGBM: Math.round(data.loads_lightgbm[i] || 0),
        Delhi: Math.round(data.loads_delhi[i] || 0)
    })).filter((_, i) => i % 4 === 0);

    const pieData = [
        { name: 'LGBM_LOAD', value: Math.round(data.loads_lightgbm.reduce((a, b) => a + b, 0)) },
        { name: 'DELHI_LOAD', value: Math.round(data.loads_delhi.reduce((a, b) => a + b, 0)) },
    ];

    // Electric Cyan, Neon Magenta, Neon Yellow
    const COLORS = ['#00FFF6', '#FF2A6D'];

    return (
        <div className="space-y-8 font-mono relative min-h-screen">
            <div className="absolute inset-0 bg-scanner pointer-events-none opacity-10 fixed z-0" />

            <header className="border-b border-[#00FFF6]/30 pb-6 relative animate-in slide-in-from-top duration-700 fade-in z-10">
                <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-[#00FFF6] shadow-[0_0_10px_#00FFF6]" />
                <h2 className="text-3xl font-bold text-[#00FFF6] mb-2 flex items-center gap-3 uppercase tracking-wider hover-glitch cursor-default">
                    <Zap className="w-8 h-8 animate-pulse" />
                    SYSTEM_ANALYTICS
                </h2>
                <p className="text-[#8A8F98] max-w-2xl text-xs tracking-widest uppercase">
                    // PERF_ANALYSIS_WINDOW__JAN_2024
                </p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 relative">
                {/* LightGBM Stats */}
                <div className="bg-[#0B0F1A] p-6 border border-[#00FFF6]/30 hover:border-[#00FFF6] hover:shadow-[0_0_20px_rgba(0,255,246,0.1)] transition-all group relative animate-in zoom-in-50 duration-500 delay-100">
                    <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 bg-[#00FFF6]/50 animate-ping" />
                    </div>
                    <h3 className="text-[#00FFF6] font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-sm">
                        <TrendingUp className="w-4 h-4" /> LGBM_MODEL
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#8A8F98] uppercase">Peak_Load</span>
                                <span className="text-[#EAEAEA] font-bold animate-neon-pulse">{lgbExtremes.maxVal.toFixed(0)} MW</span>
                            </div>
                            <div className="text-[10px] text-[#00FFF6]/50 text-right">{lgbExtremes.maxTime}</div>
                        </div>
                        <div className="border-t border-dashed border-[#1e293b] pt-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#8A8F98] uppercase">Min_Load</span>
                                <span className="text-[#EAEAEA] font-bold">{lgbExtremes.minVal.toFixed(0)} MW</span>
                            </div>
                            <div className="text-[10px] text-[#00FFF6]/50 text-right">{lgbExtremes.minTime}</div>
                        </div>
                    </div>
                </div>

                {/* Delhi Prophet Stats */}
                <div className="bg-[#0B0F1A] p-6 border border-[#FF2A6D]/30 hover:border-[#FF2A6D] hover:shadow-[0_0_20px_rgba(255,42,109,0.1)] transition-all group relative animate-in zoom-in-50 duration-500 delay-200">
                    <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 bg-[#FF2A6D]/50 animate-ping" />
                    </div>
                    <h3 className="text-[#FF2A6D] font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-sm">
                        <Activity className="w-4 h-4" /> PROPHET_DELHI
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#8A8F98] uppercase">Peak_Load</span>
                                <span className="text-[#EAEAEA] font-bold animate-neon-pulse">{delhiExtremes.maxVal.toFixed(0)} MW</span>
                            </div>
                            <div className="text-[10px] text-[#FF2A6D]/50 text-right">{delhiExtremes.maxTime}</div>
                        </div>
                        <div className="border-t border-dashed border-[#1e293b] pt-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#8A8F98] uppercase">Min_Load</span>
                                <span className="text-[#EAEAEA] font-bold">{delhiExtremes.minVal.toFixed(0)} MW</span>
                            </div>
                            <div className="text-[10px] text-[#FF2A6D]/50 text-right">{delhiExtremes.minTime}</div>
                        </div>
                    </div>
                </div>

                <div className="animate-in zoom-in-50 duration-500 delay-300">
                    <StatsCard
                        title="MODEL_DEVIATION"
                        value={`${deviation.toFixed(1)}%`}
                        icon={Activity}
                        color="text-[#F9F871]" /* Neon Yellow Accent */
                    />
                </div>
                <div className="animate-in zoom-in-50 duration-500 delay-500">
                    <StatsCard
                        title="SYS_AVG_LOAD"
                        value={`${avgLoad.toFixed(0)} MW`}
                        icon={Zap}
                        color="text-[#8A8F98]"
                    />
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative">
                {/* Hourly Comparison */}
                <div className="lg:col-span-2 bg-[#0B0F1A] border border-[#00FFF6]/30 p-6 h-[400px] relative animate-in slide-in-from-left duration-700 delay-300">
                    {/* Tech Corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00FFF6]/50" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00FFF6]/50" />

                    <h3 className="text-sm font-bold text-[#8A8F98] mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4 text-[#00FFF6]" /> HOURLY_LOAD_COMP
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={hourlyComparison} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="hour"
                                stroke="#8A8F98"
                                tick={{ fill: '#8A8F98', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#8A8F98"
                                tick={{ fill: '#8A8F98', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                unit=" MW"
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#00FFF6', color: '#00FFF6', fontFamily: 'monospace' }}
                                cursor={{ fill: '#00FFF6', opacity: 0.1 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '10px' }} />
                            <Bar dataKey="LightGBM" fill="#00FFF6" maxBarSize={40} />
                            <Bar dataKey="Delhi" fill="#FF2A6D" maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribution Pie */}
                <div className="lg:col-span-1 bg-[#0B0F1A] border border-[#FF2A6D]/30 p-6 h-[400px] relative animate-in slide-in-from-right duration-700 delay-500">
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#FF2A6D]/50" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#FF2A6D]/50" />

                    <h3 className="text-sm font-bold text-slate-400 mb-6 text-center uppercase tracking-widest">LOAD_SHARE_DIST</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#050510', borderColor: '#bc13fe', color: '#bc13fe', fontFamily: 'monospace' }}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                                TOTAL_MW
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
