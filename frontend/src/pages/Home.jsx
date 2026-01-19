import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <GlassCard className="p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
    </GlassCard>
);

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 pb-10">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center text-center px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80')] bg-cover bg-center -z-10 opacity-20 mix-blend-overlay" />

                <div className="relative z-10 max-w-3xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                            Factory Solutions <span className="text-cyan-400">Inc.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 font-light">
                            Next-Generation Industrial IoT & Predictive Analytics
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-8 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center gap-2 mx-auto"
                        >
                            Launch Dashboard <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <h2 className="text-3xl font-bold text-center mb-10">Our Core Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Cpu}
                        title="Smart Sensors X1"
                        desc="High-frequency IoT sensors for real-time vibration, temperature, and acoustic monitoring."
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Pulse Analytics Suite"
                        desc="AI-driven platform that predicts machine failures before they happen, optimizing maintenance schedules."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Secure Gateway"
                        desc="Enterprise-grade edge computing gateway ensuring end-to-end encryption for your industrial data."
                    />
                </div>
            </div>

            {/* Company Info */}
            <GlassCard className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">About Factory Solutions</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Founded in 2020, Factory Solutions Inc. is a pioneer in Industry 4.0 technologies.
                            Our mission is to empower manufacturers with actionable insights derived from the chaos of raw machine data.
                            Interpreting over 10 million events daily, our systems ensure your production lines never sleep unexpectedly.
                        </p>
                        <div className="flex gap-8">
                            <div>
                                <h4 className="text-2xl font-bold text-white">500+</h4>
                                <p className="text-sm text-slate-500">Clients Worldwide</p>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-white">99.9%</h4>
                                <p className="text-sm text-slate-500">Uptime Guarantee</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-64 rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80"
                            alt="Factory Interior"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-cyan-900/20 mix-blend-multiply" />
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Home;
