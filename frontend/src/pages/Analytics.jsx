import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ComposedChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Activity, AlertTriangle, Cpu } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
    const [machineId, setMachineId] = useState('D-101');
    const [data, setData] = useState([]);
    const [systemLoad, setSystemLoad] = useState([]);
    const [stats, setStats] = useState({ total: 0, defects: 0, rate: 0 });

    // Mock initial data
    const initialData = Array.from({ length: 15 }, (_, i) => ({
        time: `10:${i + 10}`,
        count: 40 + Math.floor(Math.random() * 30),
        defects: Math.floor(Math.random() * 3),
    }));

    const initialLoad = Array.from({ length: 15 }, (_, i) => ({
        time: `10:${i + 10}`,
        cpu: 30 + Math.floor(Math.random() * 20),
        memory: 40 + Math.floor(Math.random() * 15),
    }));

    useEffect(() => {
        setData(initialData);
        setSystemLoad(initialLoad);

        const interval = setInterval(() => {
            const now = new Date();
            const timeLabel = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

            // Update Production Data
            setData(prev => {
                const next = [...prev.slice(1)];
                next.push({
                    time: timeLabel,
                    count: 40 + Math.floor(Math.random() * 40),
                    defects: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
                });
                return next;
            });

            // Update System Load
            setSystemLoad(prev => {
                const next = [...prev.slice(1)];
                next.push({
                    time: timeLabel,
                    cpu: 30 + Math.floor(Math.random() * 40), // Fluctuate between 30-70%
                    memory: 45 + Math.floor(Math.random() * 10),
                });
                return next;
            });

        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Calculate aggregate stats from current view
    useEffect(() => {
        const total = data.reduce((acc, curr) => acc + curr.count, 0);
        const defects = data.reduce((acc, curr) => acc + curr.defects, 0);
        const rate = total > 0 ? ((defects / total) * 100).toFixed(2) : 0;
        setStats({ total, defects, rate });
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Machine Analytics
                    </h1>
                    <p className="text-slate-400 text-sm">Deep dive into performance metrics and hardware health.</p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={machineId}
                        onChange={(e) => setMachineId(e.target.value)}
                        placeholder="Search Machine ID..."
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all w-64 text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">Total Output (1h)</p>
                        <h4 className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</h4>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Activity className="w-5 h-5" />
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">Defect Rate</p>
                        <h4 className={`text-2xl font-bold ${stats.rate > 2 ? 'text-red-400' : 'text-green-400'}`}>
                            {stats.rate}%
                        </h4>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.rate > 2 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">Avg CPU Load</p>
                        <h4 className="text-2xl font-bold text-purple-400">
                            {Math.round(systemLoad.reduce((a, b) => a + b.cpu, 0) / (systemLoad.length || 1))}%
                        </h4>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Production Chart */}
                <GlassCard className="min-h-[400px] flex flex-col">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                        Production Output vs Defects
                    </h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Production Output"
                                    fill="url(#colorCount)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="defects"
                                    name="Defects"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* System Load Chart */}
                <GlassCard className="min-h-[400px] flex flex-col">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full" />
                        System Load (CPU / Memory)
                    </h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={systemLoad}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cpu"
                                    name="CPU Usage %"
                                    stroke="#a855f7"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="memory"
                                    name="Memory Usage %"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Analytics;
