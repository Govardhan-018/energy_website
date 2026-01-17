const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-slate-900/50 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-lg font-bold text-slate-100">{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
