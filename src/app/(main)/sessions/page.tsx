"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, Calendar as CalendarIcon, ArrowRight, Mic, Clock, ArrowLeft, Star, LayoutPanelLeft, Trash2 } from "lucide-react";

export default function SessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            const userId = localStorage.getItem("user_id");
            const { data } = await supabase
                .from("sessions")
                .select("*")
                .eq("user_id", userId)
                .order("recorded_at", { ascending: false });

            if (data) setSessions(data);
            setLoading(false);
        };
        fetchSessions();
    }, []);

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (!confirm("이 상담 기록과 음성 파일을 모두 삭제하시겠어요?")) return;

        const sessionToDelete = sessions.find(s => s.id === sessionId);

        // 1. Storage에서 음성 파일 삭제
        if (sessionToDelete?.audio_url) {
            const { error: storageError } = await supabase.storage
                .from("audio_buckets")
                .remove([sessionToDelete.audio_url]);

            if (storageError) {
                console.error("Storage delete error:", storageError);
            }
        }

        // 2. DB에서 데이터 삭제
        const { error: dbError } = await supabase.from("sessions").delete().eq("id", sessionId);

        if (!dbError) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } else {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displaySessions = filteredSessions;

    return (
        <div className="flex flex-col relative">
            <div className="absolute top-0 right-0 w-full h-[20%] bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div className="p-8 z-10 pb-40">
                <div className="flex items-center justify-between mb-8 px-1">
                    <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">Consultation <span className="text-primary not-italic">History</span></h2>
                    <button
                        onClick={() => setIsEditMode(p => !p)}
                        className={`text-[11px] font-bold px-4 py-1.5 rounded-full transition-all ${isEditMode
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                            }`}
                    >
                        {isEditMode ? '저장/완료' : '편집하기'}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group mb-10">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="상담 제목 또는 키워드 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-600 premium-border"
                    />
                </div>

                {/* List Items */}
                <div className="flex flex-col gap-5">
                    {displaySessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => {
                                if (isEditMode) return;
                                if (!session.feedback) {
                                    router.push(`/sessions/${session.id}/analyzing`);
                                } else {
                                    router.push(`/sessions/${session.id}`);
                                }
                            }}
                            className={`group glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col gap-5 hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden premium-border`}
                        >
                            {/* 삭제 버튼 (편집 모드일 때 표시) */}
                            {isEditMode && (
                                <button
                                    onClick={(e) => handleDelete(e, session.id)}
                                    className="absolute top-4 right-4 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-rose-600 transition-all z-10 animate-in fade-in zoom-in duration-200"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/5 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary`}>
                                        <Mic size={22} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[16px] font-bold text-white tracking-tight leading-tight">{session.summary}</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                                            <CalendarIcon size={12} className="text-slate-600" />
                                            {new Date(session.recorded_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 border-t border-white/5 pt-5">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                    <Clock size={14} className="text-slate-600" />
                                    {Math.floor(session.duration_sec / 60)}분 {session.duration_sec % 60}초
                                </div>

                                {!session.transcript ? (
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        음성 인식 대기 중
                                    </div>
                                ) : session.is_valid === false ? (
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-rose-500">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                        분석 불가 (데이터 부족)
                                    </div>
                                ) : !session.feedback ? (
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-blue-500">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        AI 패턴 분석 중
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-primary">
                                        <Star size={14} className="fill-primary/20" />
                                        AI 분석 완료
                                    </div>
                                )}

                                <div className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                    <ArrowRight size={16} className="text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {!loading && sessions.length === 0 && !searchQuery && (
                        <div className="mt-4 p-8 glass-card rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                <LayoutPanelLeft size={32} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">상담 기록이 아직 없네요</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    첫 번째 상담 분석을 시작하면<br />
                                    AI 코칭 리포트가 이곳에 쌓이게 됩니다.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/upload")}
                                className="mt-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                            >
                                지금 시작하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
