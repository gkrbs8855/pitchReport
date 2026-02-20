"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TimestampPlayer from "@/components/audio/TimestampPlayer";
import { ChevronLeft, Target, AlertCircle, MessageCircle, Zap, ArrowRight, Share2, Sparkles, ChevronRight, BarChart3, Clock3, Users2, MessageSquareText, RefreshCcw, Loader2, Lightbulb, XCircle, CheckCircle2, ShieldCheck, Mic, User } from "lucide-react";

export default function SessionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [seekTime, setSeekTime] = useState<{ time: number, nonce: number } | undefined>(undefined);
    const [currentTime, setCurrentTime] = useState(0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [isFullReanalyzing, setIsFullReanalyzing] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.from("sessions").select("*").eq("id", id).single();
            if (data) {
                if (!data.feedback) {
                    router.push(`/sessions/${id}/analyzing`);
                    return;
                }
                setSession(data);
            }
        };
        fetchSession();
    }, [id]);

    if (!session) return null;

    const handleTimestampClick = (sec: number) => {
        setSeekTime({ time: sec, nonce: Math.random() });
    };

    const handleReanalyze = async () => {
        if (!confirm("현재 상담 내용을 바탕으로 AI 분석만 다시 요청하시겠습니까? (STT는 재사용됩니다)")) return;
        setIsReanalyzing(true);
        try {
            const res = await fetch("/api/analyze/reanalyze", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: id }),
            });
            const data = await res.json();
            if (data.success) {
                // Supabase에서 즉시 최신 데이터 가져오기 (캐시 방지)
                const { data: updatedData, error } = await supabase
                    .from("sessions")
                    .select("*")
                    .eq("id", id as string)
                    .single();

                if (error) throw error;
                if (updatedData) {
                    setSession(updatedData);
                    router.refresh(); // 레이아웃 및 서버 컴포넌트 데이터 동기화
                    alert("AI 분석이 성공적으로 업데이트되었습니다. 이제 상세 리포트와 전수 피드백을 확인하실 수 있습니다.");
                }
            } else {
                alert(data.error || "재분석 중 오류가 발생했습니다.");
            }
        } catch (err: any) {
            console.error("Reanalyze error:", err);
            alert(`요청 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsReanalyzing(false);
        }
    };

    const handleFullReanalyze = async () => {
        if (!confirm("음성 파일을 처음부터 다시 인식하고 분석하시겠습니까?\n(화자 구분이나 텍스트가 꼬였을 때 효과적입니다)")) return;
        setIsFullReanalyzing(true);
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                body: JSON.stringify({ sessionId: id as string }),
            });
            const data = await res.json();
            if (data.success) {
                const { data: updatedData } = await supabase.from("sessions").select("*").eq("id", id as string).single();
                if (updatedData) setSession(updatedData);
                alert("음성 인식 및 분석이 완전히 새로 완료되었습니다.");
            } else {
                alert(data.error || "전체 재분석 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("요청 중 오류가 발생했습니다.");
        } finally {
            setIsFullReanalyzing(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] pb-32 relative overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <header className="sticky top-0 z-20 bg-[#050506]/80 backdrop-blur-xl px-6 pt-10 pb-6 flex items-center justify-between border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/sessions")} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all premium-border">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-[15px] font-bold text-white tracking-tight truncate max-w-[200px]">{session.summary || "상담 분석 리포트"}</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                            {new Date(session.created_at).toLocaleDateString()} · {Math.floor(session.duration_sec / 60)}분 {(session.duration_sec % 60)}초
                        </p>
                    </div>
                </div>
            </header>

            {/* 재분석 알림 배너 */}
            {(isReanalyzing || isFullReanalyzing) && (
                <div className="mx-8 mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <p className="text-[11px] text-white font-medium">
                        {isFullReanalyzing ? "음성 파일 분석부터 전체 재분석 중입니다..." : "AI 전문가 모드로 재분석 중입니다..."} (화면을 이동하셔도 서버에서 완료됩니다)
                    </p>
                </div>
            )}

            <div className="p-8 flex flex-col gap-10">
                {/* 오디오 플레이어 */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                    <TimestampPlayer
                        audioUrl={`https://vlszyfcydvwvejrulqws.supabase.co/storage/v1/object/public/audio_buckets/${session.audio_url}`}
                        onTimeUpdate={setCurrentTime}
                        seekTime={seekTime}
                    />
                </div>

                {session.is_valid === false && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-rose-500/10 border border-rose-500/20 p-5 rounded-3xl flex gap-4 items-start">
                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">유효하지 않은 상담 데이터</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                {session.feedback?.suggestion || "상담 내용이 너무 짧거나 분석할 수 없는 소리입니다. 실제 영업 상담 내용을 10자 이상 포함하여 다시 녹음해 주세요."}
                            </p>
                        </div>
                    </div>
                )}


                {/* AI 핵심 분석 섹션 (잘한 점 vs 아쉬운 점) - 유효할 때만 표시 */}
                {session.is_valid !== false && (
                    <>
                        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <div className="flex items-center gap-2.5 mb-5 px-1">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary premium-border"><Target size={16} /></div>
                                <h2 className="text-lg font-bold text-white tracking-tight">AI 컨설팅 리포트</h2>
                            </div>

                            {/* AI Mentor's Summary (One-liner) */}
                            {session.feedback?.mentor_summary && (
                                <div className="mb-6 glass-card p-6 rounded-[2.5rem] border border-primary/30 bg-primary/5 relative overflow-hidden premium-border">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Sparkles size={40} className="text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Mentor's One-Line Insight</span>
                                        <p className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight italic">
                                            "{session.feedback.mentor_summary}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-5">
                                {/* 강점 분석 */}
                                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.06] to-transparent border border-emerald-500/10">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                                    <div className="p-7 pl-8">
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <span className="text-emerald-500 text-lg">✦</span>
                                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.15em]">핵심 강점 분석</span>
                                        </div>
                                        <p className="text-[13px] text-slate-200 leading-[1.8] font-medium whitespace-pre-line">
                                            {session.feedback?.coaching?.strength || session.feedback?.strength || "분석 데이터를 불러오는 중입니다."}
                                        </p>
                                    </div>
                                </div>

                                {/* 개선 분석 */}
                                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500/[0.06] to-transparent border border-amber-500/10">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-600" />
                                    <div className="p-7 pl-8">
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <span className="text-amber-500 text-lg">⚡</span>
                                            <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.15em]">핵심 개선 포인트</span>
                                        </div>
                                        <p className="text-[13px] text-slate-200 leading-[1.8] font-medium whitespace-pre-line">
                                            {session.feedback?.coaching?.weakness || session.feedback?.weakness || "분석 데이터를 불러오는 중입니다."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 100점 만점 평가 요약 (배지 형태) */}
                        <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <div className="flex items-center gap-2.5 mb-5 px-1">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary premium-border"><BarChart3 size={16} /></div>
                                <h2 className="text-lg font-bold text-white tracking-tight">상담 평가 요약 (100점 만점)</h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries(session.scores || {}).map(([key, score]: [string, any]) => {
                                    // total 항목을 맨 앞으로 빼거나 스타일을 다르게 줄 수 있지만 기본 렌더링
                                    const numScore = Number(score) || 0;
                                    const scoreColor = numScore >= 80 ? 'emerald' : numScore >= 60 ? 'orange' : 'rose';
                                    const labelMap: Record<string, string> = {
                                        total: "종합 점수",
                                        rapport: "라포 형성",
                                        needs: "니즈 파악",
                                        proposal: "제안 및 설명",
                                        price: "가격 안내",
                                        objection: "거절 처리",
                                        closing: "클로징",
                                        trust_language: "신뢰 언어"
                                    };

                                    if (key === 'total') return null; // total은 따로 크게 보여주기 위해 스킵

                                    return (
                                        <div key={key} className={`flex items-center justify-between p-4 rounded-2xl bg-${scoreColor}-500/10 border border-${scoreColor}-500/20`}>
                                            <span className="text-[12px] font-bold text-slate-300">{labelMap[key] || key}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-black text-${scoreColor}-400`}>{numScore}</span>
                                                <span className="text-[9px] text-slate-500 font-bold">점</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Total Score Card (Full width or prominent) */}
                                {session.scores?.total !== undefined && (
                                    <div className="col-span-2 lg:col-span-4 flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-primary/20 to-indigo-500/20 border border-primary/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg text-primary"><Sparkles size={18} /></div>
                                            <div>
                                                <span className="text-[11px] font-black text-primary uppercase tracking-widest block mb-1">OVERALL EVALUATION</span>
                                                <span className="text-sm font-bold text-white">이 상담의 종합 평가 점수</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-white">{session.scores.total}</span>
                                            <span className="text-sm text-primary/70 font-bold">/ 100</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 상담 흐름별 심층 분석 (Chronological Feedbacks) */}
                        {session.feedback?.chronological_feedbacks && session.feedback.chronological_feedbacks.length > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
                                <div className="flex items-center gap-2.5 mb-6 px-1">
                                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 premium-border"><Zap size={16} /></div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">상담 흐름별 심층 분석</h2>
                                </div>

                                <div className="flex flex-col gap-8 relative before:absolute before:top-0 before:bottom-0 before:left-[27px] before:w-[2px] before:bg-white/5">
                                    {session.feedback.chronological_feedbacks.map((item: any, idx: number) => {
                                        const typeColor = item.type === 'good' ? 'emerald' : item.type === 'missed' ? 'amber' : 'rose';

                                        return (
                                            <div key={idx} className="relative pl-16">
                                                {/* Timeline Node */}
                                                <div className={`absolute left-4 top-5 w-7 h-7 -translate-x-1/2 rounded-full border-4 border-[#0F172A] flex items-center justify-center bg-${typeColor}-500 text-[#0F172A]`}>
                                                    {item.type === 'good' ? <CheckCircle2 size={12} fill="currentColor" /> :
                                                        item.type === 'missed' ? <Lightbulb size={12} fill="currentColor" /> :
                                                            <XCircle size={12} fill="currentColor" />}
                                                </div>

                                                <div className={`glass-card rounded-[2rem] border border-${typeColor}-500/20 overflow-hidden transition-all hover:border-${typeColor}-500/40`}>
                                                    {/* Header: Phase & Categories */}
                                                    <div className={`bg-${typeColor}-500/10 px-6 py-4 border-b border-${typeColor}-500/10 flex flex-wrap items-center justify-between gap-3`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-${typeColor}-400 px-2.5 py-1 bg-${typeColor}-500/10 rounded-md border border-${typeColor}-500/20`}>
                                                                {item.phase || '상담 진행 중'}
                                                            </span>
                                                            {item.timestamp_sec !== undefined && (
                                                                <button
                                                                    onClick={() => handleTimestampClick(Math.max(0, item.timestamp_sec - 2))}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                                                >
                                                                    <Clock3 size={12} className="text-slate-500 group-hover:text-primary transition-colors" />
                                                                    <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-white">
                                                                        {Math.floor(item.timestamp_sec / 60)}:{(item.timestamp_sec % 60).toString().padStart(2, '0')}
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {item.categories && item.categories.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {item.categories.map((cat: string, cIdx: number) => (
                                                                    <span key={cIdx} className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                                        🏷️ {cat}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-6 flex flex-col gap-5">
                                                        {/* 대화 상황 (Context) */}
                                                        {item.dialog_context && (
                                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <MessageSquareText size={12} /> 당시 대화 흐름
                                                                </p>
                                                                <p className="text-[12px] sm:text-[13px] text-slate-300 leading-relaxed font-medium whitespace-pre-line italic">
                                                                    {item.dialog_context}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* 핵심 발언 하이라이트 */}
                                                        {item.highlighted_saying && (
                                                            <div className={`relative overflow-hidden rounded-xl border ${item.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} p-4`}>
                                                                <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'good' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                                                                    원장님의 발언
                                                                </p>
                                                                <p className={`text-[13px] font-bold leading-relaxed ${item.type === 'good' ? 'text-emerald-300' : 'text-rose-300 line-through decoration-rose-500/40'}`}>
                                                                    "{item.highlighted_saying}"
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* 멘토의 심층 코멘트 (Reason) */}
                                                        {item.reason && (
                                                            <div className="pl-2 border-l-2 border-primary/30">
                                                                <p className="text-[13px] text-slate-200 leading-relaxed">
                                                                    <span className="text-primary mr-1.5 align-text-bottom"><Sparkles size={14} className="inline" /></span>
                                                                    {item.reason}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* 대안 스크립트 (Correction) */}
                                                        {item.ai_correction && item.type !== 'good' && (
                                                            <div className="mt-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 rounded-xl border border-emerald-500/20">
                                                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                    <Target size={12} /> 1등 원장님의 완벽한 대안 멘트
                                                                </p>
                                                                <p className="text-[14px] text-white font-bold leading-relaxed">
                                                                    "{item.ai_correction}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* 전환 분석 (Emotional Flow & Conversion) */}
                        {session.feedback?.conversion && (
                            <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                <div className="flex items-center gap-2.5 mb-5 px-1">
                                    <div className="bg-primary/20 p-2 rounded-lg text-primary premium-border"><Zap size={16} /></div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">전환 포인트 분석</h2>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {/* 감정 흐름 */}
                                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-500/[0.04] to-transparent border border-violet-500/10">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-400 to-indigo-600" />
                                        <div className="p-7 pl-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-violet-400 text-sm">📊</span>
                                                <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.12em]">감정 흐름 & 사용 기법</span>
                                            </div>
                                            <p className="text-[13px] text-slate-200 leading-[1.8] font-medium whitespace-pre-line">
                                                {session.feedback.conversion.emotional_flow}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 터닝포인트 */}
                                    {session.feedback.conversion.turning_point_sec && (
                                        <button
                                            onClick={() => handleTimestampClick(session.feedback.conversion.turning_point_sec)}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20 group hover:bg-primary/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-[11px] font-bold text-primary px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 font-mono">
                                                    {Math.floor(session.feedback.conversion.turning_point_sec / 60)}:{(session.feedback.conversion.turning_point_sec % 60).toString().padStart(2, '0')}
                                                </div>
                                                <span className="text-xs font-bold text-white">🎯 결정적 터닝포인트 듣기</span>
                                            </div>
                                            <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}

                                    {/* 성공/실패 원인 */}
                                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-500/[0.04] to-transparent border border-cyan-500/10">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-600" />
                                        <div className="p-7 pl-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-cyan-400 text-sm">🔍</span>
                                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.12em]">핵심 성공/실패 원인</span>
                                            </div>
                                            <p className="text-[13px] text-slate-200 leading-[1.8] font-medium whitespace-pre-line">
                                                {session.feedback.conversion.why_conversion_succeeded_or_failed}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 대화 전문 보기 섹션 */}
                        <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <button
                                onClick={() => setShowTranscript(!showTranscript)}
                                className="w-full glass-card p-6 rounded-[2rem] border border-white/10 flex items-center justify-between hover:bg-white/5 transition-all premium-border group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/20 p-2.5 rounded-xl text-primary border border-primary/20">
                                        <MessageSquareText size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-base font-bold text-white tracking-tight">상담 대화 전문 보기</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                                                TOTAL {session.transcript_with_timestamps?.length || 0} LINES
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">•</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Stenographer Mode Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-500 ease-out p-2 rounded-full bg-white/5 ${showTranscript ? 'rotate-180 bg-primary/20 text-primary' : 'text-slate-500'}`}>
                                    <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
                                </div>
                            </button>

                            {showTranscript && (
                                <div className="mt-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500 px-1 bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
                                    {session.transcript_with_timestamps?.map((line: any, idx: number) => {
                                        const isDirector = line.speaker === '원장' || line.speaker === '상담원';
                                        return (
                                            <div key={idx} className={`flex flex-col ${isDirector ? 'items-end' : 'items-start'} gap-1`}>
                                                <div className={`flex items-center gap-2 mb-1 px-2 ${isDirector ? 'flex-row-reverse' : ''}`}>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDirector ? 'text-primary' : 'text-slate-500'}`}>
                                                        {isDirector ? '나 (원장)' : '학부모'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleTimestampClick(line.start)}
                                                        className="text-[9px] font-mono text-slate-600 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded-md"
                                                    >
                                                        {Math.floor(line.start / 60)}:{(line.start % 60).toString().padStart(2, '0')}
                                                    </button>
                                                </div>
                                                <div className={`relative group max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-lg transition-all hover:scale-[1.01] ${isDirector
                                                    ? 'bg-primary text-white rounded-tr-none border border-white/10 shadow-primary/10'
                                                    : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/10 shadow-black/20'}`}>
                                                    {line.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                    </>
                )}

            </div>


        </div >
    );
}
