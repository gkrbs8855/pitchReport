"use client";

import { useState, useEffect } from "react";
import { Settings, History, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MainHeader() {
    const [userName, setUserName] = useState("영업 마스터");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            supabase.from("users").select("name").eq("id", userId).single()
                .then(({ data }) => {
                    if (data?.name) setUserName(data.name);
                });
        }
    }, []);

    const isSessionsPage = pathname?.includes("/sessions");

    return (
        <header className="px-8 pt-10 pb-6 flex justify-between items-center z-50 bg-[#050506]/80 backdrop-blur-xl sticky top-0">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
                    <h1 className="text-xl font-bold tracking-tighter text-white uppercase italic">PITCH<span className="text-primary/90 not-italic">REPORT</span></h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{userName} 님</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => router.push("/settings")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all premium-border">
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}
