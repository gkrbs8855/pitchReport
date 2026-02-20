"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight, Sparkles, Star, Mic, ArrowLeft, Settings as SettingsIcon, Globe, Mail, ExternalLink, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [academyName, setAcademyName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                router.push("/login");
                return;
            }

            const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            const { data: cpData } = await supabase
                .from("company_profiles")
                .select("company_name")
                .eq("user_id", userId)
                .maybeSingle();

            if (userData) setUser(userData);
            if (cpData?.company_name) setAcademyName(cpData.company_name);

            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        router.push("/login");
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name.slice(0, 2).toUpperCase();
    };

    const menuItems = [
        {
            icon: <MessageSquareText size={20} />,
            label: "문의 및 피드백 (카카오톡)",
            sub: "개발 팀과 실시간 상담하기",
            action: () => window.open("https://open.kakao.com/o/snbGnrhi", "_blank")
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050506]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] relative">
            <div className="absolute top-0 right-0 w-full h-[30%] bg-primary/5 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-10 sticky top-0 bg-[#050506]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <button onClick={() => router.push("/dashboard")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 premium-border hover:text-white transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-[15px] font-bold text-white tracking-tight uppercase">Settings</h1>
                <div className="w-10" />
            </header>

            <main className="p-8 pb-32 z-10 flex flex-col gap-10">
                {/* User Card */}
                <section className="flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 premium-gradient rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-bold shadow-[0_20px_50px_rgba(99,102,241,0.3)] border-4 border-[#050506]">
                            {getInitials(academyName || "U")}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 glass-card rounded-xl flex items-center justify-center text-primary shadow-xl border border-white/10">
                            <Star size={16} className="fill-primary" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-1">{academyName || "사업자 미지정"}</h2>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">{user?.email || "email@example.com"}</p>

                    <div className="mt-5 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                        <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">{user?.plan || "PRO"} PLAN</span>
                    </div>
                </section>

                {/* Menu List */}
                <section className="flex flex-col gap-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-1">General</p>
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={item.action}
                            className="group glass-card p-5 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer premium-border"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-white tracking-tight mb-0.5">{item.label}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.sub}</p>
                                </div>
                            </div>
                            <ExternalLink size={18} className="text-slate-700 group-hover:text-white transition-all" />
                        </div>
                    ))}

                    <div className="mt-8">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-4">Account Actions</p>
                        <button
                            onClick={handleLogout}
                            className="p-5 glass-card border-rose-500/20 rounded-[2rem] flex items-center justify-between group hover:bg-rose-500/5 transition-all w-full premium-border"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20">
                                    <LogOut size={20} />
                                </div>
                                <h3 className="text-[15px] font-bold text-rose-500 tracking-tight uppercase">Logout</h3>
                            </div>
                            <ChevronRight size={18} className="text-rose-900 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </section>

                <div className="mt-10 pt-10 border-t border-white/5 text-center px-4">
                    <p className="text-[10px] text-slate-800 font-bold tracking-[0.4em] uppercase mb-4 italic">
                        Powered by Antigravity Engine
                    </p>
                    <p className="text-[9px] text-slate-900 font-bold uppercase tracking-widest">Version 2.0.0-PRO</p>
                </div>
            </main>
        </div>
    );
}
