"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, ArrowRight, Loader2, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: user, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .eq("password_hash", password)
                .single();

            if (error || !user) {
                alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            } else {
                localStorage.setItem("user_id", user.id);
                router.push("/dashboard");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] p-8 pt-24 relative overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-primary/10 rounded-[100%] blur-[120px] -z-10" />

            <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-8 premium-border">
                    <Mic size={28} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">Welcome Back</h1>
                <p className="text-sm text-slate-500 font-medium">관리자 계정으로 접속하여 분석을 시작하세요.</p>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Work Email</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-slate-700 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-slate-700 text-white"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full premium-gradient text-white py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 btn-hover-effect disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="ml-1" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/[0.05] text-center">
                    <p className="text-xs text-slate-500 font-medium tracking-tight">
                        Don't have an account?
                        <Link href="/onboarding" className="text-primary font-bold ml-2 hover:text-primary/80 transition-colors">Get Started</Link>
                    </p>
                </div>
            </div>

            <div className="mt-auto py-12 text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05]">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold tracking-[0.1em] uppercase">System Operational</span>
                </div>
            </div>

            <style jsx>{`
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div>
    );
}
