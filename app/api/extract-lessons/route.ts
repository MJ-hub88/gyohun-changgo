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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as { PDFParse: new (buf: Buffer) => { getAllText: () => Promise<string> } };
        const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const data = new Uint8Array(buffer);
        const doc = await getDocument({ data }).promise;
        let allText = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allText += content.items.map((item: any) => item.str || "").join(" ") + "\n";
        }
        text = allText;
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
          content: `아래는 사업 평가 보고서입니다. 교훈·시사점·작동요인·비작동요인·개선사항을 추출해주세요.

## 분류 체계 (반드시 이 중에서 선택)

**level2** (세부분야): 유아교육 / 초등교육 / 중등교육 / 고등교육 / 직업훈련 / 인재양성 / 디지털교육

**level3** (분석영역 대분류): 교육접근성 / 학습성과 / 교육 인프라 / 교원 역량 / 거버넌스·제도 / 지속가능성 / 사업 설계

**level3_sub** (분석영역 소분류):
- 교육접근성: 등록·출석률 향상 / 통학 환경·안전 / 교육비 지원·장학 / 취약계층 포용
- 학습성과: 교수법·수업 설계 / 학습 동기·참여 / 기초학력 보장 / 역량 평가·측정
- 교육 인프라: 교육시설 구축·관리 / 교육 기자재·장비 / ICT 인프라·디지털 환경
- 교원 역량: 교사 연수·훈련 / 수업 가이드·매뉴얼 / 교사학습공동체 / 교원 동기부여·지원
- 거버넌스·제도: 학교운영위원회 / 지방정부 연계·제도화 / 정책·규정 개선 / 모니터링 체계
- 지속가능성: 자원동원·모금 / 지역사회 참여 / 사업 종료 후 자생력 / 성과 확산·공유
- 사업 설계: 사업 구조·목표 설정 / 대상자 선정·맞춤화 / 성인지·포용적 설계 / 통합적 개입 전략

## 교훈 작성 규칙 — 실행 수준까지 깊이 있게

단순히 "~가 향상되었다", "~가 부족하다"에 그치지 말고 다음을 포함해야 합니다:
1. **메커니즘**: 왜 작동했는지/왜 작동하지 않았는지의 인과 구조
2. **실행 방법**: 구체적으로 어떻게 해야 하는지 (예: 교사가 수업에서 디지털 도구를 어떤 단계에서 어떻게 활용했는지, 구조화된 수업 설계의 구체적 구성)
3. **필요한 조치**: 개선사항이면 구체적 실행 단계 (a), (b), (c)로 나눠서

JSON 배열만 반환하세요:

[
  {
    "level1": "교육",
    "level2": "위 목록 중 선택",
    "level3": "분석영역 대분류 중 선택",
    "level3_sub": "해당 대분류의 소분류 중 선택",
    "level4": "교육시설/교사 연수/교육 기자재/교사학습공동체/학교운영위원회 중 선택 또는 null",
    "project_name": "사업명",
    "evaluation_name": "평가명",
    "factor_type": "작동요인/비작동요인/개선사항",
    "content": "【메커니즘·실행방법·필요조치를 포함한 깊이 있는 교훈 내용】",
    "author": "작성자/작성일 (null 가능)"
  }
]

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
