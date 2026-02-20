"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles, Building2, Briefcase, Target, CheckCircle2, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [pwError, setPwError] = useState("");

    const [formData, setFormData] = useState({
        industry: "",
        company_name: "",
        product_name: "",
        product_description: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const router = useRouter();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const checkEmail = async () => {
        if (!formData.email) return;
        setLoading(true);
        const { data, error } = await supabase.from("users").select("id").eq("email", formData.email).maybeSingle();
        setLoading(false);
        if (data) {
            setEmailError("이미 사용 중인 이메일입니다.");
        } else {
            setEmailError("");
            alert("사용 가능한 이메일입니다.");
        }
    };

    const handleSubmit = async () => {
        if (formData.password.length < 6) {
            alert("비밀번호는 6자리 이상이어야 합니다.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        try {
            // 1. 이메일 중복 최종 확인
            const { data: existing } = await supabase.from("users").select("id").eq("email", formData.email).maybeSingle();
            if (existing) {
                alert("이미 사용 중인 이메일입니다.");
                setStep(3);
                return;
            }

            const userId = crypto.randomUUID();

            // 2. 유저 생성
            const { error: userError } = await supabase.from("users").insert({
                id: userId,
                email: formData.email,
                password_hash: formData.password, // 개발 편의상 plaintext (실제 서비스는 해싱 필수)
                name: "원장님",
                plan: "FREE"
            });
            if (userError) throw userError;

            // 3. 회사 프로필 생성 (상담 분야, 주제, 학원명 저장)
            const { error: companyError } = await supabase.from("company_profiles").insert({
                user_id: userId,
                company_name: formData.company_name,
                industry: formData.industry,
                product_name: formData.product_name,
                product_strengths: [formData.product_description]
            });
            if (companyError) throw companyError;

            // 4. 유저 프로필 생성
            const { error: profileError } = await supabase.from("user_profiles").insert({
                user_id: userId,
                personality: "분석 중"
            });
            if (profileError) throw profileError;

            localStorage.setItem("user_id", userId);
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Sign up error:", error);
            alert("회원가입 중 오류가 발생했습니다: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const ProgressBanner = () => (
        <div className="flex gap-2.5 mb-12 px-8">
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-700 ${s <= step ? 'premium-gradient shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#050506] relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <header className="p-8 pb-4 flex items-center gap-5">
                <button
                    onClick={() => step > 1 ? handleBack() : router.push("/")}
                    className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all premium-border"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">Onboarding Ritual</h1>
                    <p className="text-sm font-bold text-white tracking-tight">Step {step} of 4</p>
                </div>
            </header>

            <ProgressBanner />

            <main className="flex-1 px-8 pb-32 max-w-[600px] mx-auto w-full">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 premium-border">
                            <Briefcase size={28} />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight text-white leading-[1.1]">상담 분야를<br /><span className="text-gradient">선택해 주세요</span></h2>
                        <div className="grid gap-4 mt-8">
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
                        <div className="flex flex-col gap-8 mt-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Business Name (사업자 이름 또는 학원명)</label>
                                <input
                                    type="text"
                                    placeholder="예: 피치 음악 학원"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white placeholder:text-slate-700"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Main Topic / Subject</label>
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
                                disabled={!formData.company_name || !formData.product_name}
                                className="w-full premium-gradient text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 btn-hover-effect disabled:opacity-50"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 premium-border">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight text-white leading-[1.1]">계정 정보를<br /><span className="text-gradient">완성해 주세요</span></h2>
                        <div className="flex flex-col gap-6 mt-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <button onClick={checkEmail} className="px-6 rounded-2xl bg-white/[0.05] text-[11px] font-bold text-slate-300 hover:bg-white/10 border border-white/10 transition-all">중복확인</button>
                                </div>
                                {emailError && <p className="text-xs text-red-400 ml-1">{emailError}</p>}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password (6+ chars)</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={!formData.email || !formData.password || formData.password !== formData.confirmPassword}
                                className="w-full premium-gradient text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 btn-hover-effect disabled:opacity-50"
                            >
                                Final Step <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center flex flex-col items-center pt-12">
                        <div className="w-24 h-24 premium-gradient rounded-full flex items-center justify-center text-white mb-12 shadow-[0_0_60px_rgba(99,102,241,0.4)] animate-pulse-subtle premium-border">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-4xl font-bold mb-5 tracking-tight text-white italic text-gradient">All Set!</h2>
                        <p className="text-[15px] text-slate-500 mb-14 leading-relaxed font-medium px-4">
                            당신만의 <span className="text-white">AI 세일즈 멘토</span>가 준비되었습니다.<br />
                            이제 모든 상담을 성장의 기회로 만드세요.
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full premium-gradient text-white py-6 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-primary/30 btn-hover-effect"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Start Analysis <ArrowRight size={22} /></>}
                        </button>
                    </div>
                )}
            </main>
            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
