import Navigation from '../components/Navigation';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-inter selection:bg-cyan-500/30">
            <Navigation />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="max-w-7xl mx-auto animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
