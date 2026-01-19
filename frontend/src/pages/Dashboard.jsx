import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, AlertTriangle, CheckCircle, Zap, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ALERT_RESOLUTIONS = {
    'red': {
        title: 'Critical Temperature Alert',
        steps: [
            'Immediately stop the machine to prevent overheating damage.',
            'Check coolant levels in the main reservoir.',
            'Inspect intake fans for blockages or dust buildup.',
            'Wait for core temperature to drop below 60°C before restart.'
        ]
    },
    'yellow': {
        title: 'Throughput Degradation',
        steps: [
            'Verify raw material feed rate is consistent.',
            'Inspect conveyor belt tension and alignment.',
            'Check output sensors for debris or misalignment.',
            'Calibrate motor speed controller (VFD) settings.'
        ]
    },
    'blue': {
        title: 'Network Latency',
        steps: [
            'Ping the local gateway to verify connectivity.',
            'Check switch port status and cable integrity.',
            'Restart the local edge router if uptime > 30 days.',
            'Contact IT support if packet loss exceeds 5%.'
        ]
    }
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <GlassCard hoverEffect className="relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/20 rounded-full group-hover:bg-${color}-500/30 transition-colors blur-xl`} />
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm text-slate-400 font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1 max-w-[120px] truncate">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className={change.startsWith('+') ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                {change}
            </span>
            <span className="text-slate-500">vs last hour</span>
        </div>
    </GlassCard>
);

const MOCK_ALERTS = [
    { id: 1, msg: "HIGH_TEMP_WARNING", time: "Just now", type: "red" }, // Placeholder key
    { id: 2, msg: "Line A Throughput Drop", time: "2 mins ago", type: "yellow" },
    { id: 3, msg: "Network Latency Spike", time: "5 mins ago", type: "blue" },
];

const Dashboard = () => {
    // Live Data Simulation State
    const [stats, setStats] = useState({
        activeMachines: 124,
        totalEvents: 84520,
        efficiency: 94.2,
        activeAlerts: 3
    });

    const [machineName, setMachineName] = useState('Machine D-204');
    const [selectedAlert, setSelectedAlert] = useState(null);

    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('factoryConfig'));
        if (config?.machineName) {
            setMachineName(config.machineName);
        }
    }, []);

    // Chart Data Simulation
    const [chartData, setChartData] = useState(
        Array.from({ length: 20 }, (_, i) => ({
            time: `${i}:00`,
            value: 4000 + Math.random() * 2000
        }))
    );

    useEffect(() => {
        // Simulate Real-time Updates (every 2 seconds)
        const interval = setInterval(() => {
            setStats(prev => ({
                activeMachines: 124 + Math.floor(Math.random() * 3) - 1, // Fluctuate +/- 1
                totalEvents: prev.totalEvents + Math.floor(Math.random() * 50) + 10, // Always increase
                efficiency: +(94.2 + (Math.random() * 0.4 - 0.2)).toFixed(1), // Micro variations
                activeAlerts: prev.activeAlerts
            }));

            // Update Chart: Shift left + add new point
            setChartData(prev => {
                const newData = [...prev.slice(1)];
                newData.push({
                    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    value: 4000 + Math.random() * 3000
                });
                return newData;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-slate-900/40 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center -z-10 opacity-30 mix-blend-overlay" />

                <div className="relative z-10 p-10 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium border border-cyan-500/20 mb-4 inline-block">
                            Real-time Monitoring
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Factory Pulse <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                Performance Overview
                            </span>
                        </h1>
                        <p className="text-slate-300 text-lg mb-8 max-w-lg">
                            Monitor machine health, track production defects, and ingest event streams in real-time with predictive analytics.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Machines"
                    value={stats.activeMachines}
                    change="+12%"
                    icon={Activity}
                    color="cyan"
                />
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents.toLocaleString()}
                    change="+5.2%"
                    icon={Zap}
                    color="purple"
                />
                <StatCard
                    title="Efficiency Rate"
                    value={`${stats.efficiency}%`}
                    change="+1.1%"
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Active Alerts"
                    value={stats.activeAlerts}
                    change="-2"
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Real-time Event Ingestion Load</h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-4">Recent System Alerts</h3>
                    <div className="space-y-4">
                        {MOCK_ALERTS.map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setSelectedAlert(alert)}
                                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                            >
                                <div className={`w-2 h-2 rounded-full bg-${alert.type === 'red' ? 'red' : alert.type === 'yellow' ? 'amber' : 'blue'}-500`} />
                                <div>
                                    <p className="text-sm font-medium">
                                        {alert.id === 1 ? `${machineName} High Temp` : alert.msg}
                                    </p>
                                    <p className="text-xs text-slate-500">{alert.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Resolution Modal */}
            <AnimatePresence>
                {selectedAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedAlert(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-full bg-${selectedAlert.type === 'red' ? 'red' : selectedAlert.type === 'yellow' ? 'amber' : 'blue'}-500/20 text-${selectedAlert.type === 'red' ? 'red' : selectedAlert.type === 'yellow' ? 'amber' : 'blue'}-400`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Issue Resolution</h3>
                                    <p className="text-slate-400 text-sm">{ALERT_RESOLUTIONS[selectedAlert.type]?.title || 'System Alert'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Detected Issue
                                    </h4>
                                    <p className="text-white">
                                        {selectedAlert.id === 1 ? `${machineName} High Temp` : selectedAlert.msg}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">Resolution Steps</h4>
                                    <div className="space-y-3">
                                        {(ALERT_RESOLUTIONS[selectedAlert.type]?.steps || []).map((step, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {index + 1}
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={() => setSelectedAlert(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
