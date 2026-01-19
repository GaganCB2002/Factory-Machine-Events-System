import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />
            <Sidebar />
            <main className="pl-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
