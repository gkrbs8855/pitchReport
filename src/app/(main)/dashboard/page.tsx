"use client";

import { useEffect, useState } from "react";
import { History, Mic, User, Settings, TrendingUp, ChevronRight, AlertCircle, Sparkles, Star, Zap, FileUp, BookOpen, Target, Heart, PhoneForwarded, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [userName, setUserName] = useState("영업 마스터");
    const [sessions, setSessions] = useState<any[]>([]);
    const [companyProfile, setCompanyProfile] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const router = useRouter();

    const handleUpdateProfile = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        try {
            // 1. 기존 데이터 존재 여부 확인
            const { data: existingData, error: fetchError } = await supabase
                .from("company_profiles")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            const payload = {
                user_id: userId,
                company_name: editData.company_name,
                product_name: editData.product_name,
                industry: editData.industry,
                product_strengths: editData.product_strengths?.split(',').map((s: string) => s.trim())
            };

            let resultError;
            if (existingData) {
                // 2. 데이터가 있으면 Update
                const { error } = await supabase
                    .from("company_profiles")
                    .update(payload)
                    .eq("user_id", userId);
                resultError = error;
            } else {
                // 3. 데이터가 없으면 Insert
                const { error } = await supabase
                    .from("company_profiles")
                    .insert(payload);
                resultError = error;
            }

            if (resultError) {
                console.error("Supabase Save Error:", resultError);
                alert(`저장 중 오류가 발생했습니다: ${resultError.message}`);
                return;
            }

            setCompanyProfile({
                ...companyProfile,
                ...editData,
                product_strengths: editData.product_strengths?.split(',').map((s: string) => s.trim())
            });
            setIsEditing(false);
            alert("학원 정보가 성공적으로 저장되었습니다.");
        } catch (error: any) {
            console.error("Update error:", error);
            alert("알 수 없는 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // ... 기존 페칭 로직 ...
                const { data: userData } = await supabase.from("users").select("name").eq("id", userId).single();
                if (userData?.name) setUserName(userData.name);

                const { data: cpData } = await supabase.from("company_profiles").select("*").eq("user_id", userId).single();
                setCompanyProfile(cpData);
                setEditData({
                    company_name: cpData?.company_name || "",
                    product_name: cpData?.product_name || "",
                    industry: cpData?.industry || "",
                    product_strengths: cpData?.product_strengths?.join(", ") || ""
                });

                const { data: upData } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single();
                setUserProfile(upData);

                const { data: sessionData } = await supabase.from("sessions").select("*").eq("user_id", userId).order('recorded_at', { ascending: false });
                if (sessionData) setSessions(sessionData);
            } catch (error) {
                console.error("Dashboard data fetching error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    return (
        <div className="flex flex-col bg-[#050506] relative">
            <div className="absolute top-[-5%] left-0 w-full h-[40%] bg-primary/10 rounded-full blur-[140px] -z-10" />

            <div className="px-8 py-6 flex flex-col gap-10 pb-40 z-10">

                {/* 1. AI Insight Profile (Read Only) */}
                <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 px-1">
                            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500 premium-border"><Sparkles size={16} /></div>
                            <h2 className="text-lg font-bold text-white tracking-tight italic uppercase">AI <span className="text-amber-500 not-italic">Insight Profile</span></h2>
                        </div>

                        <div className="glass-card p-7 rounded-[2.5rem] border border-amber-500/20 relative overflow-hidden premium-border bg-gradient-to-br from-amber-500/[0.05] to-transparent">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -z-10" />

                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">분석된 성향</p>
                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                        {userProfile?.personality || "아직 분석된 성향이 없습니다"}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Star size={10} className="fill-emerald-500" /> Strengths
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {userProfile?.strengths?.slice(0, 3).map((s: string, i: number) => (
                                                <span key={i} className="text-[10px] font-bold text-slate-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">#{s}</span>
                                            )) || <span className="text-[10px] text-slate-600 italic">분석 중...</span>}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <AlertCircle size={10} className="fill-rose-500" /> Weaknesses
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {userProfile?.weaknesses?.slice(0, 2).map((w: string, i: number) => (
                                                <span key={i} className="text-[10px] font-bold text-slate-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/10">#{w}</span>
                                            )) || <span className="text-[10px] text-slate-600 italic">분석 중...</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Academy Settings (Editable) */}
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary premium-border"><Target size={16} /></div>
                                <h2 className="text-lg font-bold text-white tracking-tight italic uppercase">Academy <span className="text-primary not-italic">Settings</span></h2>
                            </div>
                            <button
                                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                className={`text-[11px] font-bold py-1.5 px-4 rounded-full transition-all ${isEditing ? 'bg-emerald-500 text-white' : 'text-slate-500 bg-white/5 hover:bg-white/10'}`}
                            >
                                {isEditing ? '저장하기' : '수정하기'}
                            </button>
                        </div>

                        <div className="glass-card p-7 rounded-[2.5rem] border border-white/10 premium-border bg-white/[0.02]">
                            <div className="flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">학원명</label>
                                        {isEditing ? (
                                            <input
                                                value={editData.company_name}
                                                onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-white px-1">{companyProfile?.company_name || "미지정"}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">주요 과목</label>
                                        {isEditing ? (
                                            <input
                                                value={editData.product_name}
                                                onChange={(e) => setEditData({ ...editData, product_name: e.target.value })}
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-white px-1">{companyProfile?.product_name || "미지정"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">우리 학원의 핵심 강점 (쉼표로 구분)</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.product_strengths}
                                            onChange={(e) => setEditData({ ...editData, product_strengths: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 min-h-[80px]"
                                            placeholder="예: 1:1 맞춤형 코칭, 꼼꼼한 관리 시스템"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {companyProfile?.product_strengths?.map((s: string, i: number) => (
                                                <span key={i} className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/10">{s}</span>
                                            )) || <span className="text-[11px] text-slate-600 italic">등록된 강점이 없습니다</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 데이터가 없을 때의 온보딩 섹션 */}
                {sessions.length === 0 && !loading && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-white px-1">첫 상담을 분석해보세요 🚀</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push("/upload?mode=record")}
                                    className="glass-card p-6 rounded-[2rem] border border-primary/20 flex flex-col items-center gap-3 hover:bg-primary/5 transition-all premium-border group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Mic size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">현장 녹음</p>
                                        <p className="text-[10px] text-slate-500 mt-1">실시간 대화 분석</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => router.push("/upload")}
                                    className="glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3 hover:bg-white/5 transition-all premium-border group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                                        <FileUp size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">파일 업로드</p>
                                        <p className="text-[10px] text-slate-500 mt-1">녹음된 파일 분석</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </section>
                )}


            </div>
        </div>
    );
}
