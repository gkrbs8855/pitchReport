"use client";

import { History, Mic, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomTabs() {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { id: "dashboard", icon: Sparkles, path: "/dashboard", label: "인사이트" },
        { id: "sessions", icon: History, path: "/sessions", label: "히스토리" }
    ];

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-fit z-50">
            <div className="glass-card rounded-[2.5rem] border border-white/10 p-2.5 flex items-center gap-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] premium-border">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => router.push(tab.path)}
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon size={isActive ? 22 : 20} />
                            <span className="text-[8px] font-bold mt-1 uppercase tracking-tighter">{tab.label}</span>
                        </button>
                    );
                })}

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <button
                    onClick={() => router.push("/upload")}
                    className="w-16 h-16 premium-gradient rounded-[2rem] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(99,102,241,0.4)] border-4 border-[#0F172A] btn-hover-effect overflow-hidden hover:scale-110 active:scale-95 transition-all"
                >
                    <Mic size={28} />
                </button>
            </div>
        </div>
    );
}
