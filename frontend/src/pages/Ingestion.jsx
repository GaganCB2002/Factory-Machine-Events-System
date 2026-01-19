import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { UploadCloud, CheckCircle, AlertOctagon, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Ingestion = () => {
    const [status, setStatus] = useState('idle');
    const [logs, setLogs] = useState([]);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
    };

    const playErrorSound = () => {
        const config = JSON.parse(localStorage.getItem('factoryConfig') || '{"soundEnabled":true,"volume":50}');
        if (!config.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime); // Low freq "buzz"
        oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.1);

        const vol = (config.volume / 100) * 0.5;
        gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    };

    const handleSimulate = async () => {
        setStatus('uploading');
        addLog('Starting COMPREHENSIVE batch simulation...', 'info');

        // SCENARIO 1: Valid Events
        const validEvents = Array.from({ length: 5 }, (_, i) => ({
            id: `E-VALID-${i}`, type: 'Valid Event', status: 'valid', msg: "Processed successfully"
        }));

        // SCENARIO 2: Identical Duplicate (Dedupe)
        const dupEvent = { id: `E-DUPE-1`, type: 'Duplicate Event', status: 'dedupe', msg: "Ignored (Deduplicated)" };

        // SCENARIO 3: Update (Newer Payload)
        const updateEvent = { id: `E-UPDATE-1`, type: 'Update Event', status: 'update', msg: "Record Updated (Newer Payload)" };

        // SCENARIO 4: Out-of-Order (Older Payload) - ERROR
        const olderEvent = { id: `E-OLD-1`, type: 'Out-of-Order Event', status: 'error', msg: "Ignored: Received older timestamp" };

        // SCENARIO 5: Invalid Duration (Negative) - ERROR
        const negDuration = { id: `E-NEG-DUR`, type: 'Invalid Duration', status: 'error', msg: "Rejected: Negative Duration (-100ms)" };

        // SCENARIO 6: Future Timestamp - ERROR
        const futureEvent = { id: `E-FUTURE`, type: 'Future Event', status: 'error', msg: "Rejected: Event time is in the future" };

        // Feed all scenarios
        const batch = [
            ...validEvents,
            dupEvent,
            dupEvent, // Send dupe twice to trigger dedupe logic visualization
            updateEvent,
            olderEvent,
            negDuration,
            futureEvent
        ];

        addLog(`Processing batch of ${batch.length} mixed scenarios...`, 'info');

        // Simulate Processing Delay
        await new Promise(r => setTimeout(r, 1000));

        let errorTriggered = false;

        // Process Loop
        for (const event of batch) {
            await new Promise(r => setTimeout(r, 400)); // Step-by-step visualization

            if (event.status === 'valid') {
                addLog(`[${event.id}] ${event.msg}`, 'success');
            } else if (event.status === 'dedupe') {
                addLog(`[${event.id}] ${event.msg}`, 'warning');
            } else if (event.status === 'update') {
                addLog(`[${event.id}] ${event.msg}`, 'info');
            } else if (event.status === 'error') {
                addLog(`[${event.id}] ${event.msg}`, 'error');
                playErrorSound();
                errorTriggered = true;
                // Pop up error message
                // In a real app we might use a toast library, here we use standard alert or just log prominent error
                // alert(`Simulation Error: ${event.msg}`); // Alert might block UI, sticking to log + sound
            }
        }

        if (errorTriggered) {
            alert("Simulation detected CRITICAL ERRORS in batch! Check logs.");
            setStatus('error');
            addLog("Batch processed with ERRORS.", 'error');
        } else {
            setStatus('success');
            addLog("Batch processed cleanly.", 'success');
        }

        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    Event Ingestion
                </h1>
                <p className="text-slate-400">Simulate machine events with robust scenario testing.</p>
            </div>

            <GlassCard className="flex flex-col items-center justify-center py-16 gap-6 border-dashed border-2 border-white/10 bg-white/5">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <UploadCloud className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-medium mb-1">Run Scenario Simulation</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                        Inject a mix of valid, duplicate, invalid, and future events to test system robustness.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSimulate}
                        disabled={status === 'uploading'}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-colors ${status === 'success' ? 'bg-green-500/20 text-green-400' :
                            status === 'error' ? 'bg-red-500/20 text-red-400' :
                                'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                            }`}
                    >
                        {status === 'idle' && <><Play className="w-5 h-5" /> Start Scenario Test</>}
                        {status === 'uploading' && 'Processing...'}
                        {status === 'success' && <><CheckCircle className="w-5 h-5" /> Passed</>}
                        {status === 'error' && <><AlertOctagon className="w-5 h-5" /> Failed</>}
                    </motion.button>
                </div>
            </GlassCard>

            <GlassCard>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Ingestion Logs</h3>
                <div className="space-y-2 font-mono text-sm max-h-[400px] overflow-y-auto">
                    {logs.length === 0 && <p className="text-slate-600 italic">No activity yet...</p>}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-600 w-24 shrink-0">{log.time}</span>
                            <span className={
                                log.type === 'error' ? 'text-red-400 font-bold' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-amber-400' :
                                            'text-slate-300'
                            }>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default Ingestion;
