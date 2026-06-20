import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local에 추가해주세요." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let text = pastedText || "";

    if (file && !text) {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith(".pdf")) {
        const pdfParse = (await import("pdf-parse")).default;
        const parsed = await pdfParse(buffer);
        text = parsed.text;
      } else if (file.name.endsWith(".txt")) {
        text = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "PDF 또는 TXT 파일만 지원합니다." },
          { status: 400 }
        );
      }

      if (!text || text.trim().length < 50) {
        return NextResponse.json(
          {
            error:
              "파일에서 텍스트를 추출할 수 없습니다. 한컴(HWP) 변환 PDF는 텍스트 추출이 안 될 수 있습니다. 보고서 내용을 직접 붙여넣기 해주세요.",
          },
          { status: 400 }
        );
      }
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "분석할 텍스트가 너무 짧습니다." },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `아래는 사업 평가 보고서의 내용입니다. 이 보고서에서 교훈, 시사점, 작동요인, 비작동요인, 개선사항을 추출해주세요.

각 교훈을 아래 JSON 배열 형식으로 반환해주세요. JSON만 반환하고 다른 텍스트는 넣지 마세요:

[
  {
    "level1": "교육",
    "level2": "초등교육 또는 중등교육 또는 고등교육 또는 유아교육 또는 직업훈련 또는 인재양성 또는 디지털교육 중 가장 적합한 것",
    "level3": "교육접근성 또는 학습성과 또는 정책·제도 개선 중 가장 적합한 것 (없으면 null)",
    "level4": "교육시설 또는 교사 연수 또는 교육 기자재 또는 교사학습공동체 또는 학교운영위원회 중 가장 적합한 것 (없으면 null)",
    "project_name": "사업명",
    "evaluation_name": "평가명 (중간평가, 종료평가 등)",
    "factor_type": "작동요인 또는 비작동요인 또는 개선사항",
    "content": "교훈 및 시사점 내용 (원문 기반으로 구체적으로)",
    "author": "작성자/작성일 (알 수 없으면 null)"
  }
]

가능한 많은 교훈을 빠짐없이 추출하되, 각 교훈은 독립적이고 구체적이어야 합니다.

보고서 내용:
${text.slice(0, 30000)}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let lessons;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      lessons = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return NextResponse.json(
        { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons, extractedTextLength: text.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
