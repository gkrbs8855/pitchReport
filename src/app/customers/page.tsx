"use client";

import { useEffect, useState } from "react";
import { User, Search, Phone, ChevronRight, Star, Clock, MessageSquare, ArrowLeft, MoreHorizontal, Sparkles, AlertCircle, PhoneForwarded } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FollowUpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFollowUps = async () => {
            const userId = localStorage.getItem("user_id");
            const { data } = await supabase
                .from("sessions")
                .select("*")
                .eq("user_id", userId)
                .not("follow_up", "is", null)
                .order("recorded_at", { ascending: false });

            if (data) {
                // follow_up.needed가 true인 것들만 필터링
                const followUps = data.filter((s: any) => s.follow_up?.needed === true);
                setSessions(followUps);
            }
            setLoading(false);
        };
        fetchFollowUps();
    }, []);

    const filteredSessions = sessions.filter(s =>
        s.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.follow_up?.note?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-[-5%] left-[-10%] w-[100%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[80%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <header className="px-6 pt-10 pb-6 flex items-center justify-between z-10 sticky top-0 bg-[#050506]/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => router.push("/dashboard")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 premium-border hover:text-white transition-all">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-[13px] font-bold text-white tracking-widest uppercase">Follow-up List</h1>
                <div className="w-10" />
            </header>

            <div className="p-8 z-10 pb-40">
                <div className="flex flex-col gap-3 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                            <PhoneForwarded size={22} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Re-Contact</h2>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        AI가 상담 맥락을 분석하여 다시 연락이 필요한<br />
                        <span className="text-amber-500 font-bold">{sessions.length}명</span>의 고객을 선별했습니다.
                    </p>
                </div>

                {/* Search */}
                <div className="relative group mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="고객명 혹은 연락 사유 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all placeholder:text-slate-700 premium-border"
                    />
                </div>

                {/* List of Follow-ups */}
                <div className="flex flex-col gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-4 opacity-30">
                            <Clock className="animate-spin text-slate-500" size={32} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">분석 데이터 불러오는 중</p>
                        </div>
                    ) : filteredSessions.length > 0 ? (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => router.push(`/sessions/${session.id}`)}
                                className="group relative glass-card p-7 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer premium-border"
                            >
                                {/* Priority Indicator */}
                                <div className={`absolute top-6 right-8 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${session.follow_up?.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        session.follow_up?.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-slate-500/10 text-slate-500 border-white/5'
                                    }`}>
                                    {session.follow_up?.priority || 'normal'}
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5 group-hover:text-amber-500 transition-colors">
                                            <User size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-[17px] font-bold text-white tracking-tight mb-0.5">{session.summary}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={11} className="text-slate-600" />
                                                마지막 상담 · {new Date(session.recorded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-500/[0.03] p-5 rounded-2xl border border-amber-500/10 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                                        <p className="text-[9px] font-black text-amber-500 mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                            <Sparkles size={11} /> AI Follow-up Reason
                                        </p>
                                        <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                                            {session.follow_up?.note || "다시 연락하여 세부 내용을 조율해야 합니다."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-2 group/btn">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/btn:bg-primary/20 group-hover/btn:text-primary transition-all">
                                                    <Phone size={14} />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500 group-hover/btn:text-slate-300">연락하기</span>
                                            </button>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-700 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-5 opacity-40">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600 border border-dashed border-white/10">
                                <AlertCircle size={40} strokeWidth={1} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">No Follow-ups</h4>
                                <p className="text-[11px] font-medium text-slate-600">현재 다시 연락해야 할 고객이 없습니다.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Float Floating Tooltip */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
                <div className="bg-primary/95 backdrop-blur-xl rounded-[2.5rem] p-5 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(99,102,241,0.5)] premium-border">
                    <p className="text-[11px] font-bold text-white px-4">
                        💡 AI 팁: 우선순위가 높은(High) 고객부터 선점하세요!
                    </p>
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                        <ArrowLeft size={18} className="rotate-180" />
                    </div>
                </div>
            </div>
        </div>
    );
}
