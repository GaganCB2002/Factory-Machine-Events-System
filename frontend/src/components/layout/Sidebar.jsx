import { Activity, BarChart2, Radio, Server, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: Activity, label: 'Dashboard', path: '/' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Radio, label: 'Live Events', path: '/ingestion' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Server className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        FactoryOS
                    </h1>
                    <p className="text-xs text-slate-500">v2.0.0</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                isActive
                                    ? "bg-white/10 text-white shadow-lg border border-white/5"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-cyan-400" : "group-hover:text-cyan-400")} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="absolute right-0 w-1 h-8 bg-cyan-500 rounded-l-full blur-[2px]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5">
                <p className="text-xs text-indigo-300 mb-2">System Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-white font-medium">Operational</span>
                </div>
            </div>
        </aside>
    );
};
