"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react";

interface TimestampPlayerProps {
    audioUrl: string;
    onTimeUpdate?: (time: number) => void;
    seekTime?: { time: number, nonce: number };
}

export default function TimestampPlayer({ audioUrl, onTimeUpdate, seekTime }: TimestampPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (seekTime?.time !== undefined && audioRef.current) {
            // 강제로 시간 설정 (nonce가 매번 바뀌므로 동일 시간이라도 실행됨)
            audioRef.current.currentTime = seekTime.time;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    }, [seekTime]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);
            onTimeUpdate?.(time);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="glass-morphism p-5 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Dynamic Background (Pulse) */}
            <div className={`absolute top-0 right-0 w-32 h-32 premium-gradient opacity-10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-1000 ${isPlaying ? 'scale-150' : 'scale-100'}`} />

            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />

            {/* 타임라인 */}
            <div className="flex flex-col gap-3 mb-6 relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black font-mono text-primary tracking-widest">{formatTime(currentTime)}</span>
                    <span className="text-[10px] font-black font-mono text-slate-600 tracking-widest">{formatTime(duration)}</span>
                </div>
                <div
                    className="h-2 bg-white/5 rounded-full cursor-pointer relative group-hover:h-3 transition-all"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const clickedTime = (x / rect.width) * duration;
                        if (audioRef.current) audioRef.current.currentTime = clickedTime;
                    }}
                >
                    <div
                        className="absolute h-full premium-gradient rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-primary shadow-lg" />
                    </div>
                </div>
            </div>

            {/* 컨트롤러 */}
            <div className="flex items-center justify-between px-2 relative">
                <button className="text-slate-500 hover:text-white transition-colors"><RotateCcw size={18} /></button>
                <div className="flex items-center gap-8">
                    <button className="text-slate-500 hover:text-white transition-all active:scale-90"><SkipBack size={22} /></button>
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-90 transition-all border border-white/10"
                    >
                        {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" className="ml-1" size={24} />}
                    </button>
                    <button className="text-slate-500 hover:text-white transition-all active:scale-90"><SkipForward size={22} /></button>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors"><Volume2 size={18} /></button>
            </div>
        </div>
    );
}
