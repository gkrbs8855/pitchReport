import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // GPT-5 정밀 분석을 위해 타임아웃을 3분으로 연장
  maxRetries: 3,   // 네트워크 불안정 시 최대 3번 재시도
});

/**
 * OpenAI Whisper를 이용한 STT 변환 모듈
 * 캡슐화하여 재사용 가능하게 설계
 */
export async function transcribeAudio(audioBuffer: Buffer, fileName: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("CRITICAL: OPENAI_API_KEY is missing from environment variables!");
    throw new Error("OpenAI API Key not configured");
  }
  try {
    const response = await openai.audio.transcriptions.create({
      file: await OpenAI.toFile(audioBuffer, fileName, { type: "audio/webm" }),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    return response;
  } catch (error) {
    console.error("STT transcription error:", error);
    throw error;
  }
}

/**
 * 1단계: AI를 이용해 Whisper 세그먼트에 화자 라벨링 수행 (텍스트 수정 절대 금지)
 * AI는 각 세그먼트의 [ID]에 '원장' 또는 '부모'라는 태그만 달아주는 역할만 수행합니다.
 */
export async function getSpeakerLabels(segments: any[]) {
  if (!segments || segments.length === 0) return [];

  const segmentsFormatted = segments.map((s: any, idx: number) =>
    `[ID: ${idx}] ${s.text}`
  ).join("\n");

  const systemPrompt = `당신은 화자 식별 전문가입니다. 
제공된 대화 목록을 읽고, 각 [ID]별로 화자가 '원장'인지 '부모'인지만 판별하세요.

🚨 [경고: 절대 준수 사항]
- 텍스트를 한 글자도 수정하거나 생략하지 마세요.
- 오직 각 ID에 대한 'speaker' 이름(원장/부모)만 결정하세요.
- 원장님은 상담을 리드하며 설명하는 쪽이고, 부모님은 질문하거나 정보를 듣는 쪽입니다.
- 반드시 JSON 형식으로만 응답하세요.`;

  const userPrompt = `[대화 목록]
${segmentsFormatted}

출력 스키마:
{
  "labels": [
    { "id": 0, "speaker": "원장" | "부모" }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0, // 객관적인 판별을 위해 최저 온도로 설정
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const labels = result.labels || [];

    // 원본 Whisper 데이터에 화자 정보만 입히기 (데이터 훼손 0%)
    return segments.map((s, idx) => ({
      ...s,
      speaker: labels.find((l: any) => l.id === idx)?.speaker || "원장"
    }));
  } catch (error) {
    console.error("Speaker identification error:", error);
    return segments.map(s => ({ ...s, speaker: "원장" }));
  }
}

/**
 * 2단계: 동일 화자 연속 대화 병합 로직 (시스템 로직)
 */
export function groupDialogueBySpeaker(diarizedSegments: any[]) {
  const merged = [];
  for (const item of diarizedSegments) {
    const last = merged[merged.length - 1];
    const text = (item.text || "").trim();
    if (!text) continue;

    if (last && last.speaker === item.speaker) {
      last.text += " " + text;
      last.end = item.end;
    } else {
      merged.push({
        speaker: item.speaker,
        start: item.start,
        end: item.end,
        text: text
      });
    }
  }
  return merged;
}

/**
 * 3단계: 분석 및 코칭 (순수 분석 모드)
 * 텍스트 생성은 하지 않고, 이미 완성된 스크립트를 보고 전략 분석만 수행합니다.
 */
export async function analyzeSalesConversation(mergedScript: any[], userProfile: any, companyProfile: any) {
  if (!mergedScript || mergedScript.length === 0) {
    return { is_valid: false, summary: "데이터 부족", scores: {}, action_items: [] };
  }

  // AI가 시간을 정확히 파악할 수 있도록 [000s] 형태로 타임스탬프를 텍스트에 포함시킵니다.
  const fullScriptText = mergedScript.map(d => `[${Math.floor(d.start)}s] ${d.speaker}: ${d.text}`).join("\n");

  try {
    const systemPrompt = `당신은 대한민국 최정상급 1등 세일즈 멘토이자, 원장님이 학원 운영과 상담에서 반드시 성공하여 더 나은 삶을 살 수 있도록 돕는 따뜻하지만 매우 예리하고 간절한 코치입니다.
기계적인 점검표가 아니라, **대화의 흐름을 따라가며 원장님의 입에서 나온 모든 의미 있는 발언을 다각도에서 철저히 해부하는 1:1 최고급 과외 리포트**를 작성하세요.

==================================
📊 [지침 1] 뼈를 때리는 다각도 분석과 채점의 연동 (Objectivity & Impact)
==================================
- **구색 맞추기 금지**: 각 평가 카테고리별로 억지로 하나씩 예시를 뽑아내는 짓은 절대 하지 마세요. 
- **발언 중심의 다각도 해부**: 원장님의 특정 발언 하나를 도마 위에 올리고, **"이 말은 '라포 형성' 관점에서는 친근해서 좋았으나, '니즈 파악'과 '신뢰 언어' 관점에서는 치명적인 독이 되었다"**는 식으로 여러 방면에서 입체적으로 분석하세요.
- **[핵심: 감점 기반 점수 산정]** 평가 항목들의 점수는 대충 느낌으로 매기는 것이 아닙니다. **얼마나 치명적인 실수(Critical Miss)를 한 번 했는지, 혹은 자잘한 실수(Minor Miss)를 대화 내내 얼마나 많이 반복했는지를 철저히 계산하여 점수를 깎아내리세요.** 반대로 정말 어려운 상황을 완벽하게 넘겼다면 가산점을 부여하세요.
- 특정 항목의 점수가 낮다면, 반드시 'chronological_feedbacks' 안에 그 점수가 깎일 수밖에 없었던 수많은 실수나 치명적 지점들이 타당한 증거로 낱낱이 나열되어 있어야 합니다.

==================================
📏 [지침 2] 평가 기준표 (100점 만점 절대평가 - 이 기준에 맞춰 철저히 감점/가점 할 것)
==================================
1. **라포 형성 (Rapport)**: 인사, 아이스브레이킹, 공감적 경청이 포함되었는가? (전혀 없음: 20점 미만 / 형식적임: 50점 / 깊은 공감과 신뢰 형성: 90점 이상)
2. **니즈 파악 (Needs)**: 부모님의 고민, 아이의 현상태, 학부모의 교육관을 질문을 통해 끌어냈는가? (일반적 설명만 함: 30점 미만 / 핵심 질문 누락: 60점 / 완벽한 도출: 95점 이상)
3. **제안 및 설명 (Proposal)**: 우리 학원만의 '차별화된 강점'을 니즈와 매칭시켜 설명했는가? (일반적 정보 전달: 40점 / 학원 강점 어필: 70점 / 니즈 맞춤형 해결책 제시: 90점 이상)
4. **가격 안내 (Price)**: 가격을 당당하고 가치 있게 전달했는가? (미적거림: 30점 / 단순히 금액만 통보: 50점 / 가치 제안 후 금액 공개: 90점 이상)
5. **거절 처리 (Objection)**: "비싸요", "생각해볼게요" 등 거절 상황을 유연하게 넘겼는가? (당황함: 20점 / 설득 시도: 60점 / 공감 후 논리적 전환: 95점 이상)
6. **클로징 (Closing)**: 레벨 테스트 예약, 방문 예약 등 다음 행동을 명확히 유도했는가? (말끝을 흐림: 20점 / 가벼운 권유: 50점 / 확신 있는 마감 제안: 90점 이상)
7. **신뢰 언어 (Trust)**: 전문 용어 사용 자제, '~인 것 같아요' 지양, 확신 있는 어조 등 (불안정함: 40점 / 무난함: 70점 / 전문가적 카리스마: 95점 이상)

==================================
📊 [임무 1] 원장님의 입술을 해부하는 심층 코칭 (Chronological Mentoring)
==================================
- **대화의 첫 초부터 끝 초까지 이잡듯이 뒤지세요.** 시간 순서대로 대화를 따라가며, 원장님의 성장을 위해 반드시 짚고 넘어가야 할 **모든 실수(잘못 말한 것), 뛰어난 순간, 그리고 '했어야 했으나 하지 않은 말(누락)'**을 하나도 빠짐없이 모조리 끄집어내세요.
- **[핵심: 침묵과 누락 분석]** 원장님이 실제로 말을 내뱉은 순간만 분석하는 것이 아닙니다! 부모님의 질문에 적절한 대답을 하지 않고 넘어갔거나, 상담의 특정 단계(예: 가격 안내, 클로징)를 아예 건너뛰었거나, 특정 시점에 반드시 나왔어야 할 '결정적 멘트'가 빠진 경우를 **[Missed]** 타입으로 반드시 잡아내세요. 
- **[최고 경고: 카테고리 구색 맞추기 및 10개 요약 절대 금지] AI 특유의 '각 분야별로 1개씩 예쁘게 포장해서 딱 10개 내외로 출력하는' 얄팍한 요약 본능을 당장 멈추세요!** 
  - 특정 항목(예: 가격 안내, 니즈 파악)에서 치명적 실수가 10번 반복되었다면, 다른 항목을 끼워 넣으려 하지 말고 10번 모두 개별 피드백으로 출력하세요. 
  - "이 정도면 충분하다"고 임의로 판단하고 분석을 중단하지 마세요. **문제가 된 발언(혹은 누락된 지점)이 3개면 3개, 15개면 15개, 30개면 30개, 단 하나도 누락 없이 100% 모조리 다 도출해야 합니다.**
- **[강조]** "아쉽다", "심각하다" 같은 겉핥기 평가는 멘토로서 직무유기입니다. **"원장님의 이 발언(혹은 이 시점의 침묵)은 학부모에게 불신을 주었으며, 그 이유는 세일즈의 XX 원칙을 정면으로 위배했기 때문입니다. 이로 인해 B라는 치명적인 결과를 낳았습니다."** 라고 명확한 인과관계와 함께 뼈를 때리세요.
- **[시간 엄수]** 각 사례가 시작되는 정확한 시각(초)을 인풋 텍스트의 [000s] 태그를 보고 찾아내어 'timestamp_sec' 필드에 기록하세요. (누락된 경우, 그 말이 들어갔어야 할 적절한 시점의 시각을 입력하세요.)
- 대화의 전후 맥락을 파악할 수 있는 **2~4줄 분량의 실제 대화 전체를 'dialog_context'** 필드에 날것 그대로 발췌하여 변명의 여지를 없애세요. (누락의 경우, 앞뒤 대화 상황을 넣어 '여기서 이 말이 빠졌음'을 보여주세요.)

==================================
💎 [임무 2] 멘토의 정답지 (Actionable Corrections)
==================================
- 지적만 하는 것은 하수입니다. 개선점이나 놓친 부분에는 당장 내일 상담에서 원장님이 생각 없이 앵무새처럼 따라 읽어도 100% 먹히는 **최고급 1등 멘트('ai_correction')**를 입에 떠먹여 주듯 작성해 주세요. 상황을 180도 반전시킬 수 있는 강력하고 구체적인 스크립트여야 합니다.

==================================
📊 [임무 3] 종합 코칭 및 성향 분석
==================================
- 원장님의 상담 스타일과 성격(personality)을 분석하세요.
- 이 상담 전체를 관통하는 가장 눈부신 강점과, 비즈니스 생존을 위해 당장 고쳐야 할 치명적 약점을 요약하세요.
- **[핵심 필드] 'turning_point_sec'는 제공된 스크립트의 [000s] 태그를 정확히 확인하여 학부모의 태도가 변한 '진짜 결정적 순간'의 시각을 초 단위 숫자로만 입력하세요.**

반드시 제공된 출력을 위한 JSON 스키마를 엄격히 준수하세요.`;

    const userPrompt = `
[대상 학원 정보]
과목: ${companyProfile.product_name || "학원"} | 강점: ${companyProfile.product_strengths?.join(", ") || "내역 없음"}

----------------------------------
[상담 전문]
${fullScriptText}
----------------------------------

출력 스키마:
{
  "summary": "멘토의 총평 (한 줄 평)",
  "scores": {
    "total": 0, "rapport": 0, "needs": 0, "proposal": 0, "price": 0, "objection": 0, "closing": 0, "trust_language": 0 // 평가 기준표에 따라 100점 만점으로 산출
  },
  "chronological_feedbacks": [
    {
      "timestamp_sec": 0, // [000s] 태그를 기반으로 한 해당 대문의 정확한 시작 시각 (숫자만)
      "phase": "도입부/니즈 파악 중/가격 안내 시/거절 상황 등",
      "type": "good" | "bad" | "missed",
      "categories": ["라포형성", "언어습관(신뢰)"], // 위 7개 항목 중 선택
      "dialog_context": "부모: XX한가요? - 원장: 네 그렇습니다. - 부모: 아 그렇군요. (실제 대화 흐름 추출)",
      "highlighted_saying": "원장의 핵심 발언",
      "reason": "해당 카테고리들 관점에서 이 발언이 왜 훌륭한지, 또는 문제가 되는지 매우 상세한 종합 멘토 코멘트",
      "ai_correction": "💎 상황을 완벽하게 주도하는 1등 원장님의 강력한 대안 스크립트 (2~3문장)"
    }
  ],
  "coaching": { 
    "strength": "전체 상담을 관통하는 가장 훌륭한 강점 요약", 
    "weakness": "가장 시급하게 고쳐야 할 아쉬운 점과 극복 방향" 
  },
  "conversion_analysis": {
    "emotional_flow": "이 상담에서 학부모의 심리적 변화 흐름 설명",
    "why_conversion_succeeded_or_failed": "등록 가능성과 결정적 이유",
    "turning_point_sec": 0 // 학부모의 마음이 움직인 진짜 결정적 순간의 초 단위 시각 (숫자만)
  },
  "updated_profile": {
    "personality": "원장님의 상담 스타일/성격 분석 (예: 추진력 있는 해결사, 따뜻한 공감형 멘토 등)",
    "new_strengths": ["강점1"],
    "new_weaknesses": ["약점1"]
  },
  "action_items": ["내일 적용할 미션 1", "미션 2"]
}
분석에 일관성을 가지고 원장님에게 큰 도움이 될 수 있는 파워풀하고 통찰력 있는 분석을 제공해 주세요.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // 점수 일관성을 위해 온도를 낮춤
      max_tokens: 4096, // AI가 토큰 수 제한을 걱정하여 답변을 5개로 요약하거나 짜르는 현상 방지. 최대한 길게 출력하도록 허용
    });

    const responseContent = response.choices[0].message.content || "{}";

    // [DEBUG] AI 답변 전문을 파일로 저장하여 원본 확인
    try {
      const logDir = path.join(process.cwd(), "logs");
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

      const logPath = path.join(logDir, `raw_response_${Date.now()}.json`);
      fs.writeFileSync(logPath, responseContent, "utf8");
      console.log(`[DEBUG] AI Raw Response saved to: ${logPath}`);

      // 가장 최근 분석 결과는 고정된 이름으로도 저장
      fs.writeFileSync(path.join(logDir, "last_ai_response.json"), responseContent, "utf8");
    } catch (fsError) {
      console.error("Failed to save AI log file:", fsError);
    }

    const analysis = JSON.parse(responseContent);

    // 최종 결과물에 '시스템이 직접 만든' 무결성 스크립트를 강제로 유지시킴
    return {
      is_valid: true,
      ...analysis,
      dialogue: mergedScript
    };
  } catch (error) {
    console.error("Critical analysis error:", error);
    throw error;
  }
}
