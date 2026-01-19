import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GlassCard = ({ children, className, hoverEffect = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hoverEffect ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
            className={cn(
                "backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl",
                "text-white",
                className
            )}
        >
            {children}
        </motion.div>
    );
};
