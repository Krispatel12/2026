import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ArrowLeft, Loader2, Workflow, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactiveCharacters, InteractionState } from "@/features/auth/components/ReactiveCharacters";

// --- Micro-Animation Components ---

const MotionInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            initial={false}
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("relative group", className)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <motion.div
                className="absolute inset-0 rounded-xl bg-amber-500/20 transition-opacity duration-300 blur-sm -z-10"
                animate={{ opacity: isFocused ? 1 : 0 }}
                layoutId="glow"
            />
            {children}
        </motion.div>
    );
};

const MorphingButton = ({
    loading,
    onClick,
    disabled,
    children,
    className
}: {
    loading: boolean;
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.button
            layout
            type="submit"
            onClick={onClick}
            disabled={disabled}
            initial={{ borderRadius: "0.75rem" }}
            animate={{
                width: loading ? "56px" : "100%",
                borderRadius: loading ? "50px" : "0.75rem",
                backgroundColor: loading ? "var(--primary)" : ""
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
                "relative h-14 overflow-hidden flex items-center justify-center font-bold text-lg text-white shadow-lg transition-all active:scale-[0.98]",
                !loading && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:scale-[1.01]",
                loading && "bg-amber-600 cursor-default",
                className
            )}
        >
            <AnimatePresence mode="popLayout">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// --- Project Login Component ---

const ProjectLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorShake, setErrorShake] = useState(0);

    // Character State
    const [charState, setCharState] = useState<InteractionState>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    const triggerShake = (msg?: string) => {
        setErrorShake(prev => prev + 1);
        setCharState('error');
        if (msg) setErrorMessage(msg);
        setTimeout(() => {
            setCharState('idle');
            setErrorMessage("");
        }, 2000);
    };

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setCharState('checking');

        if (!email || !password) {
            triggerShake("Missing Credentials");
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            // Strict Project Login (Context from Project Table)
            await apiClient.tenancyProjectLogin({ email: normalizedEmail, password });

            // Check for pending invite redirect
            const pendingInvite = localStorage.getItem('pending_invite_code');
            if (pendingInvite) {
                navigate(`/join-workspace?code=${pendingInvite}`);
            } else {
                setCharState('success');
                toast.success(`Welcome back, Crew Member.`);
                navigate("/app");
            }

        } catch (error: any) {
            triggerShake("Invalid Credentials");
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden selection:bg-amber-500/30 selection:text-amber-50 mesh-gradient-bg">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Deep Ambient Background Animation - Distinct for Project */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-600/5 blur-[120px] animate-fluid" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/5 blur-[100px] animate-fluid animation-delay-2000" />
            </div>

            {/* Left Panel - Visuals */}
            <div className="hidden lg:flex flex-col justify-center w-[45%] p-12 relative z-10 h-screen border-r border-white/5 bg-background/30 backdrop-blur-sm">
                <div className="absolute top-12 left-12 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/10">
                        <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-foreground">Cortexa Tactical</span>
                </div>

                <div className="relative w-full max-w-lg mb-12 self-center animate-float">
                    <ReactiveCharacters state={charState} errorMessage={errorMessage} />
                </div>

                <div className="text-center px-8 animate-slide-up">
                    <h2 className="text-3xl font-black mb-4 tracking-tight">Project Access</h2>
                    <p className="text-muted-foreground font-light leading-relaxed">
                        Access point for crew members, squad comms, and project artifacts.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
                <Button
                    variant="ghost"
                    className="absolute top-6 left-6 lg:left-auto lg:right-6 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => navigate('/welcome')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Hub
                </Button>

                <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold tracking-tighter text-white">Tactical Login</h2>
                        <p className="text-muted-foreground/80 font-light text-base">
                            Access your project workspace and mission data.
                        </p>
                    </div>

                    <motion.div
                        key={errorShake}
                        animate={{ x: [0, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="card-prism p-8 rounded-3xl border-t border-white/10"
                    >
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-muted-foreground font-medium text-xs ml-1">Crew Member Email</Label>
                                    <MotionInputContainer>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setCharState('email')}
                                            onBlur={() => setCharState('idle')}
                                            placeholder="crew@unit.com"
                                            className="h-14 pl-12 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-amber-500/50 rounded-xl transition-all text-sm"
                                            autoFocus
                                        />
                                    </MotionInputContainer>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor="password" className="text-muted-foreground font-medium text-xs">Password</Label>
                                        <span className="text-xs font-medium text-amber-500 cursor-pointer hover:text-amber-400">Forgot?</span>
                                    </div>
                                    <MotionInputContainer>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setCharState('password')}
                                            onBlur={() => setCharState('idle')}
                                            placeholder="••••••••"
                                            className="h-14 pl-12 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-amber-500/50 rounded-xl transition-all text-sm"
                                        />
                                    </MotionInputContainer>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <MorphingButton loading={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                                    Access Mission
                                </MorphingButton>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-mono uppercase tracking-widest"
                                    onClick={() => navigate('/register/project')}
                                >
                                    [ Initialize Project ]
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProjectLogin;
