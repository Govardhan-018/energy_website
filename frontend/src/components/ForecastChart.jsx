import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

const ForecastChart = ({ data }) => {
    const chartData = data.timestamps.map((ts, i) => ({
        time: ts, // Full timestamp for tooltip
        lightgbm: data.loads_lightgbm[i],
        delhi: data.loads_delhi[i]
    }));

    return (
        <div className="w-full h-full">
            <h3 className="text-xl font-semibold mb-4 text-slate-300">Load Forecast</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorLGBM" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FFF6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00FFF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDelhi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF2A6D" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#FF2A6D" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
                    <XAxis
                        dataKey="time"
                        stroke="#8A8F98"
                        tick={{ fill: '#8A8F98', fontFamily: 'monospace', fontSize: 10 }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                    />
                    <YAxis
                        stroke="#8A8F98"
                        tick={{ fill: '#8A8F98', fontFamily: 'monospace', fontSize: 10 }}
                        domain={['auto', 'auto']}
                        unit=" MW"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#00FFF6', color: '#00FFF6', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#EAEAEA' }}
                        labelStyle={{ color: '#8A8F98' }}
                    />
                    <Brush
                        dataKey="time"
                        height={30}
                        stroke="#00FFF6"
                        fill="#0B0F1A"
                        tickFormatter={() => ''}
                        travellerWidth={10}
                    />
                    <Area
                        type="monotone"
                        dataKey="lightgbm"
                        name="LGBM_MODEL"
                        stroke="#00FFF6"
                        fillOpacity={1}
                        fill="url(#colorLGBM)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="delhi"
                        name="PROPHET_DELHI"
                        stroke="#FF2A6D"
                        fillOpacity={1}
                        fill="url(#colorDelhi)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastChart;
