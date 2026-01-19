import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Save, Volume2, VolumeX, Settings as SettingsIcon, Factory, Hash, Building2, Ticket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Settings = () => {
    const [config, setConfig] = useState({
        id: '', // Added ID
        machineName: 'Line-1 Extruder',
        serialNumber: 'SN-8821-X',
        department: 'Polymers',
        deptId: 'D-202',
        soundEnabled: true,
        volume: 50
    });

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            let loaded = false;
            try {
                // Try backend
                const res = await axios.get('/api/machines', { timeout: 1000 }); // Short timeout to fallback quickly
                if (res.data && res.data.length > 0) {
                    const machine = res.data[0];
                    setConfig(prev => ({
                        ...prev,
                        id: machine.id,
                        machineName: machine.name,
                        serialNumber: machine.serialNumber,
                        department: machine.department,
                        deptId: machine.departmentId
                    }));
                    loaded = true;
                }
            } catch (err) {
                console.warn("Backend unreachable, using local storage", err);
            }

            // Fallback if backend didn't yield result
            if (!loaded) {
                const stored = localStorage.getItem('factoryConfig');
                if (stored) {
                    setConfig(JSON.parse(stored));
                }
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setSaved(false);
    };

    const handleAutoFill = () => {
        const presets = [
            { name: 'Titan Forge X1', serial: 'SN-T99-A', dept: 'Heavy Metal', id: 'D-101' },
            { name: 'Quantum Assembler', serial: 'QA-552-Z', dept: 'Electronics', id: 'D-305' },
            { name: 'Hydra Press 5000', serial: 'HP-5K-00', dept: 'Hydraulics', id: 'D-404' },
            { name: 'Nano Weaver v2', serial: 'NW-002-B', dept: 'Textiles', id: 'D-202' },
            { name: 'Fusion Core R1', serial: 'FC-R1-01', dept: 'Energy', id: 'D-001' }
        ];
        const random = presets[Math.floor(Math.random() * presets.length)];
        setConfig(prev => ({
            ...prev,
            machineName: random.name,
            serialNumber: random.serial,
            department: random.dept,
            deptId: random.id
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        // 1. Save to LocalStorage (Always works)
        localStorage.setItem('factoryConfig', JSON.stringify(config));
        let backendSuccess = false;

        // 2. Try Backend
        try {
            const payload = {
                id: config.deptId || 'default-id',
                name: config.machineName,
                serialNumber: config.serialNumber,
                department: config.department,
                departmentId: config.deptId
            };
            await axios.post('/api/machines', payload, { timeout: 2000 });
            console.log("Settings saved to backend database");
            backendSuccess = true;
        } catch (err) {
            console.error("Failed to save to backend (Offline Mode)", err);
        }

        // 3. UI Feedback
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        if (config.soundEnabled) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(backendSuccess ? 440 : 880, audioContext.currentTime); // High pitch if local-only
            gain.gain.setValueAtTime(config.volume / 100 * 0.2, audioContext.currentTime);
            osc.start();
            osc.stop(audioContext.currentTime + 0.1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <SettingsIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">System Configuration</h1>
                    <p className="text-slate-400">Manage global settings, machine identity, and alert preferences.</p>
                </div>
            </div>

            <GlassCard>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Factory className="w-5 h-5 text-purple-400" />
                        Machine Identity
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAutoFill}
                        className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-purple-500/30 transition-colors border border-purple-500/20"
                    >
                        <Sparkles className="w-3 h-3" />
                        Auto-Suggest
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Machine Name</label>
                        <div className="relative">
                            <Factory className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="machineName"
                                value={config.machineName}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Serial Number</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="serialNumber"
                                value={config.serialNumber}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Department</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="department"
                                value={config.department}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Department ID</label>
                        <div className="relative">
                            <Ticket className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="deptId"
                                value={config.deptId}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    <Volume2 className="w-5 h-5 text-green-400" />
                    Audio & Alerts
                </h3>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="font-medium text-white">Enable Alert Sounds</h4>
                        <p className="text-sm text-slate-500">Play an audible beep when critical errors occur.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="soundEnabled"
                            checked={config.soundEnabled}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-slate-300">Alert Volume</label>
                        <span className="text-sm text-cyan-400">{config.volume}%</span>
                    </div>
                    <input
                        type="range"
                        name="volume"
                        min="0"
                        max="100"
                        value={config.volume}
                        onChange={handleChange}
                        disabled={!config.soundEnabled}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                </div>
            </GlassCard>

            <div className="flex justify-end pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${saved
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40'
                        }`}
                >
                    {saved ? <span className="flex items-center gap-2">Settings Saved!</span> : <><Save className="w-5 h-5" /> Save Changes</>}
                </motion.button>
            </div>
        </div>
    );
};

export default Settings;
