import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeSalesConversation } from "@/lib/ai/analyzer";

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        // 1. 세션 정보 및 기존 텍스트(STT 결과) 조회
        const { data: session, error: sessionError } = await supabase
            .from("sessions")
            .select("*, users(*), customers(*)")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) throw new Error("Session not found");
        if (!session.transcript) throw new Error("No transcript found to re-analyze. Please upload again.");

        // 2. 화자 분리 및 병합 (STT 데이터 기반)
        const { getSpeakerLabels, groupDialogueBySpeaker } = await import("@/lib/ai/analyzer");
        let transcription;
        try {
            transcription = JSON.parse(session.transcript);
        } catch (e) {
            transcription = { segments: [] };
        }
        const segments = transcription.segments || [];
        const diarizedSegments = await getSpeakerLabels(segments);
        const mergedDialogue = groupDialogueBySpeaker(diarizedSegments);

        // 3. 회사 및 유저 프로필 최신 정보 조회
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

        // 4. GPT-4o 재분석 (평가 전용)
        const analysisResult = await analyzeSalesConversation(
            mergedDialogue,
            userProfile || { strengths: [], weaknesses: [] },
            companyProfile || { product_name: "미지정", product_strengths: [], common_objections: [] }
        );

        // 4. DB 업데이트
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
                mentor_summary: analysisResult.summary || "", // AI 요약을 별도로 보존
            },
            action_items: analysisResult.action_items || [],
            summary: session.summary || analysisResult.summary, // 기존 제목(사용자 지정 이름 또는 시간) 최우선 유지
            is_valid: analysisResult.is_valid ?? true,
            transcript_with_timestamps: analysisResult.dialogue || [],
            follow_up: analysisResult.follow_up || null,
        };

        const { error: updateError } = await supabase
            .from("sessions")
            .update(updateData)
            .eq("id", sessionId);

        if (updateError) throw updateError;

        // 5. 유저 프로필(성향, 강점, 약점) 업데이트
        if (analysisResult.updated_profile) {
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("user_id", session.user_id)
                .maybeSingle();

            const profileData = {
                user_id: session.user_id,
                personality: analysisResult.updated_profile.personality,
                strengths: analysisResult.updated_profile.new_strengths,
                weaknesses: analysisResult.updated_profile.new_weaknesses,
                updated_at: new Date().toISOString()
            };

            if (existingProfile) {
                await supabase
                    .from("user_profiles")
                    .update(profileData)
                    .eq("user_id", session.user_id);
            } else {
                await supabase
                    .from("user_profiles")
                    .insert(profileData);
            }
        }

        return NextResponse.json({ success: true, result: analysisResult });
    } catch (error: any) {
        console.error("Re-analysis API error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
