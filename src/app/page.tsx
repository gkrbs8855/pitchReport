"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Mic, Target, BarChart3, ChevronRight, CheckCircle2, Zap, Quote, Star } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#050506]">
            {/* Elegant Background Lighting */}
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-primary/10 rounded-[100%] blur-[140px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-blue-600/5 rounded-[100%] blur-[100px] -z-10" />

            {/* Header */}
            <nav className="p-8 flex justify-between items-center z-10 animate-in fade-in duration-1000">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 premium-border">
                        <Mic size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-white uppercase italic">PITCH<span className="text-primary/90 not-italic">REPORT</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 mr-8">
                    <button className="text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">기능</button>
                    <button className="text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">가격</button>
                </div>
                <Link href="/login" className="text-[11px] font-bold text-slate-400 hover:text-white transition-all px-6 py-2.5 rounded-full border border-white/5 hover:bg-white/5 bg-white/[0.02] uppercase tracking-widest">
                    LOGIN
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-10 text-center pt-20 pb-32 z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">AI Sales Performance platform</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-10 tracking-tight text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    계약으로 이어지는<br />
                    <span className="text-gradient">확신을 기록합니다</span>
                </h1>

                <p className="text-[16px] text-slate-400 leading-relaxed mb-16 max-w-[400px] font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    당신의 학원 상담 대화를 AI가 정밀 분석하여<br />
                    놓치고 있던 <span className="text-white">성공의 포인트</span>를 짚어드립니다.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <Link
                        href="/onboarding"
                        className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-white transition-all bg-primary rounded-2xl shadow-[0_20px_40px_rgba(99,102,241,0.3)] btn-hover-effect overflow-hidden"
                    >
                        <div className="absolute inset-0 shimmer opacity-20" />
                        지금 무료로 시작하기
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <button className="px-10 py-5 text-[13px] font-bold text-slate-400 hover:text-white transition-all">
                        미리보기 영상 보기
                    </button>
                </div>
            </main>

            {/* Visual Proof / Mockup Section */}
            <section className="px-8 pb-40 z-10 flex flex-col items-center">
                <div className="w-full max-w-[600px] relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10" />
                    <div className="glass-card rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden premium-border">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Analysis Result</p>
                                    <p className="text-sm font-bold text-white">학부모 상담 피드백</p>
                                </div>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <span className="text-xl font-black text-primary italic">94<span className="text-xs ml-0.5 not-italic text-slate-500">점</span></span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Core Achievement</span>
                                </div>
                                <p className="text-[14px] text-white font-medium leading-relaxed">"학원의 커리큘럼뿐만 아니라 <span className="text-amber-500 underline underline-offset-4 decoration-amber-500/30">아이의 기질</span>을 먼저 언급하며 신뢰를 얻었습니다."</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Rapport</p>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[90%] bg-primary" />
                                    </div>
                                </div>
                                <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Closing</p>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[85%] bg-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements for more dynamic feel */}
                    <div className="absolute -right-8 top-1/2 glass-card p-4 rounded-2xl border border-white/10 shadow-xl animate-bounce duration-[4000ms] hidden md:block">
                        <Zap size={20} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="absolute -left-12 bottom-1/4 glass-card p-5 rounded-2xl border border-white/10 shadow-xl hidden md:block">
                        <Quote size={24} className="text-primary opacity-50" />
                    </div>
                </div>

                <p className="mt-12 text-[12px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-10 h-[1px] bg-slate-800" />
                    Trusted by 100+ Academies
                    <span className="w-10 h-[1px] bg-slate-800" />
                </p>
            </section>

            {/* Feature Cards */}
            <section className="px-8 pb-40 z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="grid gap-6 md:grid-cols-2 max-w-[900px] mx-auto">
                    <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group premium-border hover:bg-white/[0.04] transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
                            <Target size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">정밀한 상담 코칭</h3>
                        <p className="text-[15px] text-slate-400 leading-relaxed font-medium">단순 요약을 넘어, 어떤 타이밍에 어떤 멘트를 했어야 했는지 AI가 정밀 분석하여 행동 지침을 제시합니다.</p>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group premium-border hover:bg-white/[0.04] transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20">
                            <BarChart3 size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">데이터 중심 피드백</h3>
                        <p className="text-[15px] text-slate-400 leading-relaxed font-medium">성공적인 계약의 공통된 패턴을 발견하고, 우리 학원만의 필승 상담 시나리오를 데이터로 구축하세요.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-8 pb-32 z-10">
                <div className="max-w-[800px] mx-auto glass-card rounded-[4rem] p-16 text-center border border-white/10 relative overflow-hidden premium-border">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] -z-10" />
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tight">성장의 지표를 확인하세요</h2>
                    <p className="text-[16px] text-slate-400 mb-10 max-w-[400px] mx-auto font-medium leading-relaxed">
                        이미 많은 학원이 PITCHREPORT를 통해<br />
                        상담 전환율의 비약적인 상승을 경험하고 있습니다.
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center justify-center px-12 py-5 font-black text-[#050506] transition-all bg-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 duration-300"
                    >
                        지금 바로 시작하기
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="p-16 text-center border-t border-white/[0.03] bg-white/[0.01]">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 grayscale opacity-30">
                        <Mic size={18} className="text-white" />
                        <span className="text-sm font-bold tracking-tighter text-white uppercase italic">PITCH<span className="text-white not-italic">REPORT</span></span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase">
                        © 2026 PITCHREPORT. PLATFORM FOR GROWTH INTELLIGENCE.
                    </p>
                </div>
            </footer>
        </div>
    );
}
