"use client";

import { useState, useRef } from "react";
import { Mic, Square, Upload, Loader2, ChevronRight, CheckCircle2, ChevronLeft, Disc, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [sessionType, setSessionType] = useState("new");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 지원하는 MIME 타입을 순서대로 확인
            const types = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/aac'
            ];

            let selectedType = '';
            for (const type of types) {
                if (MediaRecorder.isTypeSupported(type)) {
                    selectedType = type;
                    break;
                }
            }

            const recorder = new MediaRecorder(stream, { mimeType: selectedType });
            mediaRecorderRef.current = recorder;

            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const extension = selectedType.includes('mp4') || selectedType.includes('aac') ? 'mp4' : 'webm';
                const blob = new Blob(chunks, { type: selectedType || 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("마이크 접근 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return;
        setIsUploading(true);

        try {
            const userId = localStorage.getItem("user_id");

            // user_id 유효성 검사 (UUID 형식이 아니면 오류 발생 가능성 높음)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!userId || !uuidRegex.test(userId)) {
                console.error("Invalid or missing user_id:", userId);
                alert("사용자 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
                router.push("/login");
                return;
            }

            const isMp4 = audioBlob.type.includes('mp4') || audioBlob.type.includes('aac');
            const fileExt = isMp4 ? 'mp4' : 'webm';
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("audio_buckets")
                .upload(fileName, audioBlob, {
                    contentType: audioBlob.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const now = new Date();
            const defaultSummary = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분 상담`;

            const { data: sessionData, error: sessionError } = await supabase
                .from("sessions")
                .insert({
                    user_id: userId,
                    audio_url: uploadData.path,
                    session_type: sessionType,
                    recorded_at: now.toISOString(),
                    duration_sec: recordingTime,
                    summary: customerName ? `${customerName}님과의 상담` : defaultSummary,
                })
                .select()
                .single();

            if (sessionError) throw sessionError;
            router.push(`/sessions/${sessionData.id}/analyzing`);
        } catch (err: any) {
            console.error("Upload process error details:", err);

            let errorMessage = "업로드 중 오류가 발생했습니다.";
            if (err.message?.includes("UUID")) {
                errorMessage = "인증 정보 오류가 발생했습니다. 다시 로그인해 주세요.";
            } else if (err.status === 413) {
                errorMessage = "파일 크기가 너무 큽니다.";
            }

            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0C] relative">
            <div className="absolute top-[-5%] left-[-10%] w-[120%] h-[30%] bg-primary/10 rounded-full blur-[80px] -z-10" />

            {/* Header */}
            <header className="p-6 flex items-center justify-between z-10">
                <button onClick={() => router.back()} className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-slate-400">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-black tracking-widest text-white uppercase italic">Record Session</h1>
                <div className="w-10" />
            </header>

            <main className="p-8 flex flex-col gap-10 pb-32 z-10">
                {/* 녹음 상태 비주얼라이저 (가공) */}
                <div className="flex flex-col items-center justify-center pt-10 pb-10">
                    <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'scale-110' : ''}`}>
                        <div className={`absolute inset-0 rounded-full premium-gradient opacity-10 animate-pulse ${isRecording ? 'scale-150' : 'scale-100'}`} />
                        <div className={`absolute inset-0 rounded-full border-2 border-white/5 ${isRecording ? 'animate-spin-slow' : ''}`} />

                        {isRecording ? (
                            <button
                                onClick={stopRecording}
                                className="w-32 h-32 bg-rose-500 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(244,63,94,0.4)] active:scale-95 transition-all z-20"
                            >
                                <Square className="fill-white mb-2" size={32} />
                                <span className="text-xl font-black font-mono tracking-tighter">{formatTime(recordingTime)}</span>
                            </button>
                        ) : audioBlob ? (
                            <div className="flex flex-col items-center gap-4 z-20">
                                <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                    <CheckCircle2 size={48} />
                                </div>
                                <button onClick={() => setAudioBlob(null)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white underline underline-offset-4">Retry recording</button>
                            </div>
                        ) : (
                            <button
                                onClick={startRecording}
                                className="w-32 h-32 premium-gradient rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(124,58,237,0.4)] active:scale-95 transition-all z-20"
                            >
                                <Mic size={40} className="mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Start</span>
                            </button>
                        )}
                    </div>
                    <p className="mt-12 text-center text-sm text-slate-400 font-medium">
                        {isRecording ? "상담 내용을 AI가 경청하고 있습니다..." : audioBlob ? "녹음이 완료되었습니다. 분석을 시작할까요?" : "버튼을 눌러 음성 녹음을 시작하세요"}
                    </p>
                </div>

                {/* 파일 업로드 대안 */}
                {!isRecording && !audioBlob && (
                    <div className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-primary transition-all">
                                <Upload size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white mb-0.5">파일 업로드</h3>
                                <p className="text-[11px] text-slate-500 font-medium">MP3, WAV, M4A 지원</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-600 group-hover:text-white" />
                    </div>
                )}

                {/* 상담 상세 정보 */}
                <div className={`flex flex-col gap-6 transition-all duration-500 ${isRecording ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Customer Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700"
                                placeholder="누구와 상담하셨나요? (미입력 시 시간으로 저장)"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Perspective</label>
                            <div className="flex gap-3">
                                {["신규 상담", "재방문 상담"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSessionType(type === '신규 상담' ? 'new' : 'existing')}
                                        className={`flex-1 py-4 px-2 rounded-2xl text-xs font-bold border transition-all ${sessionType === (type === '신규 상담' ? 'new' : 'existing') ? 'premium-gradient border-transparent text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 분석 시작 버튼 (고정 하단) */}
            <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/90 to-transparent z-20">
                <button
                    disabled={!audioBlob || isUploading}
                    onClick={handleUpload}
                    className="w-full h-16 premium-gradient text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            분석 엔진 준비 중...
                        </>
                    ) : (
                        <>
                            상담 내용 분석 시작
                            <ChevronRight size={22} className="opacity-70" />
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
        </div>
    );
}
