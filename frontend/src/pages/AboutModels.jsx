import { Component, Network, Clock } from 'lucide-react';

const AboutModels = () => {
    const models = [
        {
            title: 'LightGBM Hybrid',
            description: 'A Gradient Boosting Machine optimized for speed and performance, combined with lag features for time-series forecasting.',
            features: [
                'Captures complex non-linear relationships',
                'Uses historical lag features (1h, 2h, 24h)',
                'Best for: Short-term forecasting with rich history'
            ],
            icon: Network,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            title: 'Delhi Hybrid (Prophet)',
            description: 'An additive regression model (Univariate) designed by Meta, specifically tuned for Delhi\'s load profile and Indian holidays.',
            features: [
                'Decomposes trends, seasonality, and holidays',
                'Robust to missing data and outliers',
                'Best for: Capturing strong seasonal effects (Daily/Weekly)'
            ],
            icon: Clock,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">About Our Models</h2>
                <p className="text-slate-400">Understanding the technologies powering our grid forecasts.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {models.map((model) => {
                    const Icon = model.icon;
                    return (
                        <div key={model.title} className={`p-6 rounded-2xl border ${model.border} ${model.bg} backdrop-blur-sm`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-lg bg-slate-900/50 ${model.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">{model.title}</h3>
                            </div>

                            <p className="text-slate-300 mb-6 leading-relaxed">
                                {model.description}
                            </p>

                            <ul className="space-y-3">
                                {model.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-slate-400 text-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full ${model.color.replace('text-', 'bg-')}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Component className="w-5 h-5 text-cyan-400" />
                    System Architecture
                </h3>
                <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
                    <p>
                        The backend API serves as an orchestration layer, routing requests to the appropriate model based on availability and user selection.
                        Both models run in inference mode using pre-trained weights serialized via Joblib/Pickle.
                    </p>
                    <p>
                        The frontend communicates via REST API, fetching forecasts asynchronously to ensure a responsive UI experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutModels;
