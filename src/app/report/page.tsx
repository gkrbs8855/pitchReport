"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, Star, Award, ChevronLeft, Target, Zap, Waves, BrainCircuit, ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MonthlyReportPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("user_id");
            if (!userId) { router.push("/login"); return; }

            const { data } = await supabase
                .from("sessions")
                .select("*")
                .eq("user_id", userId)
                .eq("is_valid", true)
                .not("feedback", "is", null)
                .order("created_at", { ascending: false });

            if (data) setSessions(data);
            setLoading(false);
        };
        fetchData();
    }, [router]);

    // 실제 데이터 집계
    const totalSessions = sessions.length;

    // 전체 루브릭 점수 평균 집계
    const scoreAverages: Record<string, { total: number; count: number }> = {};
    sessions.forEach((s) => {
        if (!s.scores) return;
        Object.entries(s.scores).forEach(([key, data]: [string, any]) => {
            if (data?.insufficient_data || !data?.score) return;
            if (!scoreAverages[key]) scoreAverages[key] = { total: 0, count: 0 };
            scoreAverages[key].total += data.score;
            scoreAverages[key].count += 1;
        });
    });

    const skills = Object.entries(scoreAverages).map(([name, { total, count }]) => ({
        name,
        score: Math.round(total / count),
    }));

    const avgScore = skills.length > 0
        ? Math.round(skills.reduce((acc, s) => acc + s.score, 0) / skills.length)
        : 0;

    const skillColors = [
        "bg-blue-500", "bg-primary", "bg-rose-500",
        "bg-orange-500", "bg-emerald-500", "bg-yellow-500"
    ];

    // 최근 달 계산
    const now = new Date();
    const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050506]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Loading Report...</p>
                </div>
            </div>
        );
    }

    if (totalSessions === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-[#050506]">
                <header className="p-6 flex items-center justify-between z-10 sticky top-0 bg-[#050506]/80 backdrop-blur-xl border-b border-white/5">
                    <button onClick={() => router.push("/dashboard")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 premium-border">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-sm font-black text-white italic tracking-tighter uppercase">Evolution Report</h1>
                    <div className="w-10" />
                </header>
                <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
                    <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center text-slate-600 premium-border">
                        <BarChart3 size={36} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white mb-2">아직 분석 데이터가 없어요</h2>
                        <p className="text-[12px] text-slate-500 leading-relaxed">
                            상담을 녹음하고 AI 분석을 완료하면<br />
                            이곳에 성장 리포트가 생성됩니다.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/upload")}
                        className="mt-4 px-8 py-4 premium-gradient rounded-[1.5rem] text-sm font-bold text-white shadow-lg shadow-primary/30"
                    >
                        첫 상담 분석 시작하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] relative">
            <div className="absolute top-0 right-0 w-full h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />

            <header className="p-6 flex items-center justify-between z-10 sticky top-0 bg-[#050506]/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => router.push("/dashboard")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 premium-border">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-black text-white italic tracking-tighter uppercase">Evolution Report</h1>
                <div className="w-10" />
            </header>

            <main className="p-8 pb-32 z-10 flex flex-col gap-10">
                {/* 현재 달 총평 */}
                <section className="text-center pt-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3 animate-pulse">{monthLabel}</p>
                    <h2 className="text-4xl font-black italic tracking-tight text-white mb-6">
                        KEEP<br /><span className="text-gradient">GROWING</span>
                    </h2>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-white">{totalSessions}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sessions</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-emerald-400">{avgScore}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Avg Score</span>
                        </div>
                    </div>
                </section>

                {/* 루브릭별 평균 점수 차트 */}
                {skills.length > 0 && (
                    <section className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden premium-border">
                        <div className="absolute top-0 right-0 p-6 opacity-30">
                            <BarChart3 size={40} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-black text-white italic tracking-tight mb-8">SKILL DISTRIBUTION</h3>
                        <div className="flex flex-col gap-6">
                            {skills.map((skill, i) => (
                                <div key={skill.name} className="flex flex-col gap-2.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{skill.name}</span>
                                        <span className="text-sm font-black text-white italic">{skill.score}pts</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${skillColors[i % skillColors.length]}`}
                                            style={{ width: `${skill.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 최근 상담 목록 */}
                <section>
                    <div className="flex items-center gap-2.5 mb-6 px-1">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary premium-border"><BookOpen size={16} /></div>
                        <h2 className="text-lg font-bold text-white tracking-tight">최근 분석 상담</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {sessions.slice(0, 5).map((session) => (
                            <div
                                key={session.id}
                                onClick={() => router.push(`/sessions/${session.id}`)}
                                className="group glass-card p-5 rounded-[2rem] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-all premium-border"
                            >
                                <div>
                                    <p className="text-[13px] font-bold text-white truncate max-w-[200px]">{session.summary || "상담 분석"}</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Star size={16} className="text-primary fill-primary/20" />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
