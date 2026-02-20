"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Sparkles, FileSearch, CheckCircle2, Zap, BrainCircuit, Waves, AlertCircle } from "lucide-react";

export default function AnalyzingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<"transcribing" | "analyzing" | "completed">("transcribing");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startAnalysis = async () => {
            try {
                const res = await fetch("/api/analyze", {
                    method: "POST",
                    body: JSON.stringify({ sessionId: id }),
                });

                const data = await res.json();
                if (data.success) {
                    setStatus("completed");
                    setTimeout(() => {
                        router.replace(`/sessions/${id}`);
                    }, 1500);
                } else {
                    setError(data.error || "분석 중 알 수 없는 오류가 발생했습니다.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "네트워크 오류가 발생했습니다.");
            }
        };

        startAnalysis();

        const timer = setTimeout(() => setStatus("analyzing"), 3000);
        return () => clearTimeout(timer);
    }, [id, router]);

    const steps = [
        { key: "transcribing", label: "음성 데이터 디지털화 중", icon: <Waves size={20} className="text-blue-400" /> },
        { key: "analyzing", label: "AI 영업 패턴 엔진 가동", icon: <BrainCircuit size={20} className="text-primary" /> },
        { key: "completed", label: "프리미엄 리포트 생성 완료", icon: <CheckCircle2 size={20} className="text-emerald-500" /> },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0A0A0C] relative overflow-hidden">
            {/* Background Particles (Subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 bg-radial-glow opacity-30 animate-pulse" />

            <div className="relative mb-16 pt-4">
                <div className="w-32 h-32 glass-morphism rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.2)]">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-subtle" />
                    {error ? (
                        <AlertCircle size={48} className="text-rose-500" />
                    ) : (
                        <Loader2 className="animate-spin text-primary" size={48} strokeWidth={1.5} />
                    )}
                </div>
                {!error && (
                    <div className="absolute -top-4 -right-4 w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 animate-bounce-subtle">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 mb-12">
                <h1 className="text-2xl font-black tracking-tight text-white italic">
                    {error ? "ANALYSIS FAILED" : "AI IS ANALYZING..."}
                </h1>
                <p className="text-sm text-slate-500 font-medium whitespace-pre-wrap max-w-[320px]">
                    {error ? error : "PitchReport의 영업 엔진이 상담을 분석하고 있습니다."}
                </p>
                {error && (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-slate-400 hover:text-white transition-all"
                    >
                        대시보드로 돌아가기
                    </button>
                )}
            </div>

            {!error && (
                <div className="w-full max-w-[300px] flex flex-col gap-4">
                    {steps.map((step, i) => (
                        <div
                            key={step.key}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-700 ${status === step.key || (status === 'analyzing' && i === 0) || status === 'completed' ? 'glass-morphism border-white/10 opacity-100 scale-100' : 'border-transparent opacity-20 scale-95'}`}
                        >
                            <div className={`p-2 rounded-xl ${status === step.key ? 'bg-white/5' : ''}`}>
                                {step.icon}
                            </div>
                            <span className={`text-xs font-bold tracking-tight ${status === step.key ? 'text-white' : 'text-slate-500'}`}>
                                {step.label}
                            </span>
                            {status === 'completed' && i < 2 && <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />}
                            {status === step.key && step.key !== 'completed' && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-16 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] px-4 animate-pulse">
                상담 품질의 차이가 성장의 차이를 만듭니다
            </p>

            <div className="mt-8 px-8 py-4 glass-card rounded-2xl border border-white/5 animate-in fade-in duration-1000 delay-500">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    💡 **화면을 벗어나셔도 괜찮습니다.**<br />
                    분석은 서버에서 안전하게 진행 중이며, 완료되면 **히스토리** 탭에서 확인하실 수 있습니다.
                </p>
            </div>

            <style jsx>{`
        .bg-radial-glow {
          background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(10,10,12,0) 70%);
        }
        @keyframes spin-subtle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-subtle {
          animation: spin-subtle 3s linear infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
