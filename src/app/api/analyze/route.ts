import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transcribeAudio, analyzeSalesConversation } from "@/lib/ai/analyzer";

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        // 1. 세션 정보 조회
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("*, users(*), customers(*)")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) throw new Error("Session not found");

        // 2. 오디오 파일 가져오기 (Storage에서 다운로드)
        const { data: audioData, error: downloadError } = await supabase.storage
            .from("audio_buckets")
            .download(session.audio_url);

        if (downloadError) throw downloadError;

        // 3. STT 변환
        const audioBuffer = Buffer.from(await audioData.arrayBuffer());
        const transcription = await transcribeAudio(audioBuffer, "audio.webm");
        const segments = (transcription as any).segments || [];
        console.log("Transcription segments count:", segments.length);

        // 4. 화자 식별 (Speaker Labeling)
        const { getSpeakerLabels, groupDialogueBySpeaker } = await import("@/lib/ai/analyzer");
        const diarizedSegments = await getSpeakerLabels(segments);

        // 5. 동일 화자 대화 병합 (시스템 로직)
        const mergedDialogue = groupDialogueBySpeaker(diarizedSegments);

        // 6. 회사 및 유저 프로필 조회
        const { data: companyProfile } = await supabase
            .from("company_profiles")
            .select("*")
            .eq("user_id", session.user_id)
            .single();

        const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user_id)
            .single();

        // 7. GPT-4o 분석 (평가 전용)
        const analysisResult = await analyzeSalesConversation(
            mergedDialogue,
            userProfile || { strengths: [], weaknesses: [] },
            companyProfile || { product_name: "미지정", product_strengths: [], common_objections: [] }
        );
        console.log("Analysis Result dialogue check:", !!analysisResult.dialogue);

        // 6. DB 업데이트 (새로운 마스터 프롬프트 스키마 매핑)
        const updateData: any = {
            scores: analysisResult.scores || {},
            timeline: analysisResult.structure?.phases || [],
            timestamps: analysisResult.timestamps || [],
            speaker_ratio: analysisResult.structure?.speaker_ratio || {},
            feedback: {
                chronological_feedbacks: analysisResult.chronological_feedbacks || [],
                coaching: analysisResult.coaching || {},
                conversion: analysisResult.conversion_analysis || {},
                updated_profile: analysisResult.updated_profile || {},
                mentor_summary: analysisResult.summary || "" // AI 요약을 별도로 보존
            },
            action_items: analysisResult.action_items || [],
            is_valid: analysisResult.is_valid ?? true,
            transcript_with_timestamps: analysisResult.dialogue || [],
            follow_up: analysisResult.follow_up || null,
            duration_sec: Math.round((transcription as any).duration || 0),
        };

        // transcription 객체가 유효할 때만 저장
        if (transcription) {
            updateData.transcript = JSON.stringify(transcription);
        }

        const { error: updateError } = await supabase
            .from("sessions")
            .update(updateData)
            .eq("id", sessionId);

        if (updateError) {
            console.error("Supabase Update Error details:", updateError);
            throw new Error(`Update Failed: ${updateError.message}`);
        }

        // 7. 영업 DNA 프로필 자동 업데이트 (마스터 프롬프트 고도화)
        const updatedProfile = analysisResult.updated_profile;
        if (updatedProfile && session.is_valid !== false) {
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", session.user_id)
                .maybeSingle();

            const strengths = Array.from(new Set([...(existingProfile?.strengths || []), ...(updatedProfile.new_strengths || [])]));
            const weaknesses = Array.from(new Set([...(existingProfile?.weaknesses || []), ...(updatedProfile.new_weaknesses || [])]));

            const profileData = {
                user_id: session.user_id,
                personality: updatedProfile.personality,
                strengths,
                weaknesses,
                updated_at: new Date().toISOString()
            };

            if (existingProfile) {
                await supabase.from("user_profiles")
                    .update(profileData)
                    .eq("user_id", session.user_id);
            } else {
                await supabase.from("user_profiles")
                    .insert(profileData);
            }

            // Company Profile 업데이트 (패턴 등)
            if (companyProfile && updatedProfile.new_patterns?.length > 0) {
                const currentPatterns = companyProfile.common_objections || {};
                const newPatterns = { ...currentPatterns };
                updatedProfile.new_patterns.forEach((p: string) => {
                    if (!newPatterns[p]) newPatterns[p] = "신규 탐지된 패턴";
                });

                await supabase.from("company_profiles")
                    .update({ common_objections: newPatterns, updated_at: new Date().toISOString() })
                    .eq("user_id", session.user_id);
            }
        }

        return NextResponse.json({ success: true, result: analysisResult });
    } catch (error: any) {
        console.error("Analysis API full error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
