import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { Zap, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

// Interaction States
export type InteractionState = 'idle' | 'email' | 'slug' | 'password' | 'success' | 'checking' | 'error';

interface ReactiveCharactersProps {
    state: InteractionState;
    className?: string;
    errorMessage?: string;
}

// --- Geometric Character Components ---

// 1. Cute Eye Component (White circle with dark pupil)
const CuteEye = ({
    state,
    mousePos,
    size = "md",
    isBlinking = false
}: {
    state: InteractionState,
    mousePos: { x: number, y: number },
    size?: 'sm' | 'md',
    isBlinking?: boolean
}) => {
    // Eye tracking logic
    const x = Math.min(Math.max(mousePos.x / 40, -3), 3);
    const y = Math.min(Math.max(mousePos.y / 40, -3), 3);

    const sizeClass = size === 'md' ? "w-3 h-3 md:w-4 md:h-4" : "w-2 h-2 md:w-3 md:h-3";

    return (
        <div className={cn("relative bg-white rounded-full flex items-center justify-center shadow-sm", sizeClass)}>
            <AnimatePresence>
                {!isBlinking ? (
                    <motion.div
                        initial={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.1 }}
                        className="relative w-full h-full rounded-full overflow-hidden"
                    >
                        {/* Pupil */}
                        <motion.div
                            className="absolute bg-slate-900 rounded-full w-[40%] h-[40%] top-[30%] left-[30%]"
                            animate={{
                                x: state === 'password' ? 0 : x,
                                y: state === 'password' ? 3 : y,
                                scale: state === 'checking' ? [1, 1.2, 1] : 1
                            }}
                        />
                        {/* Shine */}
                        <div className="absolute top-[20%] right-[20%] w-[25%] h-[25%] bg-white rounded-full opacity-70" />
                    </motion.div>
                ) : (
                    // Blink line
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="w-full h-[2px] bg-slate-800 rounded-full"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// 2. Simple Smile
const CuteSmile = ({ state }: { state: InteractionState }) => {
    return (
        <motion.div
            className="w-2 h-1 border-b-2 border-slate-900/40 rounded-[50%]"
            animate={{
                scaleX: state === 'success' ? 1.5 : 1,
                rotate: state === 'error' ? 10 : 0
            }}
        />
    );
};

export const ReactiveCharacters = ({ state, className, errorMessage }: ReactiveCharactersProps) => {
    // Mouse Tracking
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [blinkState, setBlinkState] = useState({ c1: false, c2: false, c3: false, c4: false });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - (rect.left + rect.width / 2),
                y: e.clientY - (rect.top + rect.height / 2)
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Random blinking logic
        const interval = setInterval(() => {
            const target = Math.floor(Math.random() * 4) + 1;
            setBlinkState(prev => ({ ...prev, [`c${target}`]: true }));
            setTimeout(() => {
                setBlinkState(prev => ({ ...prev, [`c${target}`]: false }));
            }, 200);
        }, 3000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    // Animation Config
    const hoverAnim = {
        y: [0, -5, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    };

    return (
        <div ref={containerRef} className={cn("relative w-full h-[280px] flex items-end justify-center perspective-1000 pb-12", className)}>

            {/* 
               layout from image: 
               Left: Orange Mound (Large)
               Back Left: Black Ghost (Tall)
               Back Right: Grey Monolith (Tall)
               Right: Yellow Arch (Short)
            */}

            {/* --- 1. BLACK GHOST (Back Left) --- */}
            <motion.div
                className="absolute z-10 left-[28%] bottom-[20%]"
                animate={state === 'error' ? { x: [-5, 5, -5, 5, 0] } : hoverAnim}
                style={{ translateX: mousePos.x / 60 }}
            >
                <div className={cn(
                    "w-28 h-44 bg-slate-900 rounded-t-[50px] rounded-b-[30px] shadow-2xl flex flex-col items-center pt-10 relative transition-colors duration-300",
                    state === 'error' && "bg-red-950",
                    state === 'success' && "bg-emerald-950"
                )}>
                    {/* Face */}
                    <div className="flex gap-3">
                        <CuteEye state={state} mousePos={mousePos} size="sm" isBlinking={blinkState.c1} />
                        <CuteEye state={state} mousePos={mousePos} size="sm" isBlinking={blinkState.c1} />
                    </div>
                    <div className="mt-2 text-blue-200">
                        <CuteSmile state={state} />
                    </div>
                </div>
            </motion.div>

            {/* --- 2. GREY MONOLITH (Center Back) --- */}
            <motion.div
                className="absolute z-10 left-[44%] bottom-[16%]"
                animate={{ ...hoverAnim, transition: { ...hoverAnim.transition, delay: 0.5 } }}
                style={{ translateX: mousePos.x / 70 }}
            >
                <div className={cn(
                    "w-24 h-48 bg-slate-600 rounded-[20px] shadow-xl flex flex-col items-center pt-8 border border-white/5 transition-colors duration-300",
                    state === 'error' && "bg-red-900",
                    state === 'success' && "bg-emerald-800"
                )}>
                    <div className="flex gap-4">
                        <CuteEye state={state} mousePos={mousePos} size="md" isBlinking={blinkState.c2} />
                        <CuteEye state={state} mousePos={mousePos} size="md" isBlinking={blinkState.c2} />
                    </div>
                    {/* Monolith has a serious line mouth */}
                    <div className="mt-4 w-3 h-0.5 bg-slate-800/50 rounded-full" />
                </div>
            </motion.div>

            {/* --- 3. ORANGE MOUND (Front Left) --- */}
            <motion.div
                className="absolute z-20 left-[22%] bottom-[8%]"
                animate={state === 'success' ? { y: [0, -20, 0] } : { ...hoverAnim, transition: { ...hoverAnim.transition, delay: 1 } }}
                style={{ translateX: mousePos.x / 40 }}
            >
                <div className={cn(
                    "w-44 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-[80px] rounded-b-[10px] shadow-lg flex flex-col items-center justify-center pt-4 border-b-4 border-orange-700/20 transition-all duration-300",
                    state === 'error' && "from-red-500 to-red-600 grayscale-[0.3]",
                    state === 'success' && "from-emerald-400 to-emerald-500"
                )}>
                    <div className="flex gap-8">
                        <CuteEye state={state} mousePos={mousePos} size="md" isBlinking={blinkState.c3} />
                        <CuteEye state={state} mousePos={mousePos} size="md" isBlinking={blinkState.c3} />
                    </div>
                    <div className="mt-2">
                        <CuteSmile state={state} />
                    </div>
                    {/* Blush */}
                    <div className="absolute top-[55%] left-[20%] w-3 h-1.5 bg-red-400/20 rounded-full blur-[2px]" />
                    <div className="absolute top-[55%] right-[20%] w-3 h-1.5 bg-red-400/20 rounded-full blur-[2px]" />
                </div>
            </motion.div>

            {/* --- 4. YELLOW ARCH (Front Right) --- */}
            <motion.div
                className="absolute z-20 left-[54%] bottom-[8%]"
                animate={{
                    rotate: state === 'email' ? 5 : 0,
                    y: state === 'success' ? [0, -10, 0] : 0
                }}
                style={{ translateX: mousePos.x / 50 }}
            >
                <div className={cn(
                    "w-28 h-36 bg-yellow-400 rounded-t-full rounded-b-[10px] shadow-lg flex flex-col items-center pt-8 border-b-4 border-yellow-600/20 transition-colors duration-300",
                    state === 'error' && "bg-red-400",
                    state === 'success' && "bg-emerald-300"
                )}>
                    <div className="flex gap-3">
                        <CuteEye state={state} mousePos={mousePos} size="sm" isBlinking={blinkState.c4} />
                        {/* This one maybe winks? */}
                        {state === 'success' ? (
                            <div className="w-3 h-1 bg-slate-800 rounded-full mt-1.5" />
                        ) : (
                            <CuteEye state={state} mousePos={mousePos} size="sm" isBlinking={blinkState.c4} />
                        )}
                    </div>
                    <div className="mt-3">
                        <CuteSmile state={state} />
                    </div>
                    {/* Arm */}
                    <div className="absolute -right-2 bottom-8 w-6 h-6 bg-yellow-500 rounded-full z-[-1]" />
                </div>
            </motion.div>

            {/* Message Bubble (Shared) */}
            {/* Holographic Status Pop-up */}
            <AnimatePresence mode="wait">
                {(state === 'error' || state === 'success' || state === 'checking' || state === 'email' || state === 'password') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.8, y: -20, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                            "absolute top-0 right-4 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 flex items-center gap-3 min-w-[180px]",
                            state === 'error' ? "bg-red-950/80 border-red-500/30 text-red-200" :
                                state === 'success' ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200" :
                                    "bg-slate-900/80 border-white/10 text-slate-200"
                        )}
                    >
                        {/* Status Icon */}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border bg-white/5",
                            state === 'error' ? "border-red-500/50" :
                                state === 'success' ? "border-emerald-500/50" :
                                    "border-white/10"
                        )}>
                            {state === 'error' && <Zap className="w-4 h-4 fill-current" />}
                            {state === 'success' && <CheckCircle2 className="w-4 h-4" />}
                            {state === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
                            {(state === 'email' || state === 'password') && <ShieldCheck className="w-4 h-4" />}
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-70 font-mono">
                                {state === 'error' ? "System Alert" :
                                    state === 'success' ? "Access Granted" :
                                        "System Status"}
                            </span>
                            <span className="text-sm font-bold whitespace-nowrap">
                                {state === 'error' ? (errorMessage || "Invalid Credentials") :
                                    state === 'success' ? "Welcome Back" :
                                        state === 'checking' ? "Verifying..." :
                                            state === 'email' ? "Identifying User..." :
                                                "Secure Connection"}
                            </span>
                        </div>

                        {/* Decor Elements */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
