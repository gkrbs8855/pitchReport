"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles, Building2, Briefcase, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        industry: "",
        years: "",
        product_name: "",
        product_description: "",
    });
    const router = useRouter();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        const userId = crypto.randomUUID();

        // 실제 유저 레코드 생성 (sessions 테이블의 외래키 제약조건 및 uuid 타입 일치를 위함)
        const { error } = await supabase.from("users").insert({
            id: userId,
            email: `guest_${userId.slice(0, 8)}@pitchreport.com`,
            password_hash: "guest",
            name: "방문자",
            plan: "PRO"
        });

        if (error) {
            console.error("User creation error:", error);
            alert("초기 설정 중 오류가 발생했습니다. 다시 시도해 주세요.");
            return;
        }

        localStorage.setItem("user_id", userId);
        router.push("/dashboard");
    };

    const ProgressBanner = () => (
        <div className="flex gap-2.5 mb-12 px-8">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-700 ${s <= step ? 'premium-gradient shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] relative overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <header className="p-8 pb-4 flex items-center gap-5">
                {step > 1 && (
                    <button onClick={handleBack} className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all premium-border">
                        <ChevronLeft size={20} />
                    </button>
                )}
                <div className="flex-1">
                    <h1 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">Onboarding Ritual</h1>
                    <p className="text-sm font-bold text-white tracking-tight">Step {step} of 3</p>
                </div>
            </header>

            <ProgressBanner />

            <main className="flex-1 px-8 pb-32">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 premium-border">
                            <Briefcase size={28} />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight text-white leading-[1.1]">상담 분야를<br /><span className="text-gradient">선택해 주세요</span></h2>
                        <p className="text-sm text-slate-500 mb-12 leading-relaxed font-medium">당신의 비즈니스 성격에 맞춘<br />전용 AI 분석 엔진을 활성화합니다.</p>

                        <div className="grid gap-4">
                            {["음악/예능 학원", "입시/보습 학원", "스포츠/체육 시설", "어학/외국어 학원", "기타 교육 사업"].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => { setFormData({ ...formData, industry: item }); handleNext(); }}
                                    className="w-full glass-card p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.05] transition-all text-left premium-border"
                                >
                                    <span className="text-[15px] font-bold text-slate-300 group-hover:text-white">{item}</span>
                                    <ChevronRight size={18} className="text-slate-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 premium-border">
                            <Building2 size={28} />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight text-white leading-[1.1]">주요 상담 주제를<br /><span className="text-gradient">입력해 주세요</span></h2>
                        <p className="text-sm text-slate-500 mb-12 leading-relaxed font-medium">상담의 목적을 AI가 사전에 학습하여<br />더 정교한 클로징 전략을 제시합니다.</p>

                        <div className="flex flex-col gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Topic Name</label>
                                <input
                                    type="text"
                                    placeholder="예: 신규 원생 등록 상담"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white placeholder:text-slate-700"
                                    value={formData.product_name}
                                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Core Values & Programs</label>
                                <textarea
                                    rows={4}
                                    placeholder="학원만의 특별한 커리큘럼이나 원생 관리 노하우를 적어주세요."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-none text-white placeholder:text-slate-700"
                                    value={formData.product_description}
                                    onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!formData.product_name}
                                className="w-full premium-gradient text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 btn-hover-effect mt-4 disabled:opacity-50"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center flex flex-col items-center pt-12">
                        <div className="w-24 h-24 premium-gradient rounded-full flex items-center justify-center text-white mb-12 shadow-[0_0_60px_rgba(99,102,241,0.4)] animate-pulse-subtle premium-border">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-4xl font-bold mb-5 tracking-tight text-white italic">Ready to Analyze</h2>
                        <p className="text-[15px] text-slate-500 mb-14 leading-relaxed font-medium px-4">
                            당신만의 <span className="text-white">AI 세일즈 인텔리전스</span>가 준비되었습니다.<br />
                            이제 모든 상담을 성장의 기회로 만드세요.
                        </p>

                        <div className="w-full glass-card p-8 rounded-[2.5rem] text-left mb-16 premium-border">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary"><Target size={18} /></div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Core Mission</span>
                            </div>
                            <p className="text-[15px] font-bold text-slate-200 leading-relaxed italic">"오늘의 데이터는 내일의 성공을 위한 가장 확실한 이정표가 될 것입니다."</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full premium-gradient text-white py-6 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-primary/30 btn-hover-effect"
                        >
                            Dashboard Start
                            <ArrowRight size={22} className="ml-1" />
                        </button>
                    </div>
                )}
            </main>

            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
