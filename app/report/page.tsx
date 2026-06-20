"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEVELS, FACTOR_TYPES, getFactorColor } from "@/lib/constants";

type Lesson = {
  id: string;
  level1: string;
  level2: string;
  level3: string | null;
  level3_sub: string | null;
  level4: string | null;
  project_name: string;
  evaluation_name: string | null;
  factor_type: string;
  content: string;
};

type L2Section = {
  level2: string;
  total: number;
  working: Lesson[];
  notWorking: Lesson[];
  improvements: Lesson[];
};

function buildL2Sections(lessons: Lesson[]): L2Section[] {
  const map = new Map<string, Lesson[]>();
  for (const l of lessons) {
    if (!map.has(l.level2)) map.set(l.level2, []);
    map.get(l.level2)!.push(l);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([level2, items]) => ({
      level2,
      total: items.length,
      working: items.filter((l) => l.factor_type === "작동요인"),
      notWorking: items.filter((l) => l.factor_type === "비작동요인"),
      improvements: items.filter((l) => l.factor_type === "개선사항"),
    }));
}

type ParsedLesson = {
  keyword: string;
  mechanism: { title: string; bullets: string[] }[];
  coreLesson: string;
};

function parseLesson(content: string): ParsedLesson {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  let keyword = "";
  const mechanism: { title: string; bullets: string[] }[] = [];
  let coreLesson = "";
  let currentSection: { title: string; bullets: string[] } | null = null;
  let inCore = false;

  for (const line of lines) {
    if (line.startsWith("【") && (line.includes("핵심 교훈") || line.includes("핵심교훈"))) {
      if (currentSection) mechanism.push(currentSection);
      currentSection = null;
      inCore = true;
      const rest = line.includes("】") ? line.split("】").slice(1).join("】").trim() : "";
      if (rest) coreLesson = rest;
    } else if (line.startsWith("【")) {
      if (currentSection) mechanism.push(currentSection);
      const title = line.replace(/【|】/g, "").split("】")[0];
      currentSection = { title, bullets: [] };
      const rest = line.includes("】") ? line.split("】").slice(1).join("】").trim() : "";
      if (rest) currentSection.bullets.push(rest);
      inCore = false;
    } else if (inCore) {
      coreLesson += (coreLesson ? " " : "") + line;
    } else if (currentSection) {
      currentSection.bullets.push(line);
    } else {
      if (!keyword) keyword = line;
      else keyword += " " + line;
    }
  }
  if (currentSection) mechanism.push(currentSection);

  return { keyword, mechanism, coreLesson };
}

export default function ReportPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .order("level2")
        .order("factor_type");
      setLessons(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const sections = buildL2Sections(lessons);

  const totalByFt = FACTOR_TYPES.reduce(
    (acc, ft) => {
      acc[ft] = lessons.filter((l) => l.factor_type === ft).length;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">교훈 분석 리포트</h1>
        <p className="text-sm text-muted-foreground">
          세부분야(Level 2) 기준 분석 — 총 {lessons.length}건
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {FACTOR_TYPES.map((ft) => (
          <div key={ft} className="rounded-lg bg-white p-3 text-center shadow-sm">
            <Badge className={getFactorColor(ft)}>{ft}</Badge>
            <p className="mt-1 text-xl font-bold">{totalByFt[ft]}</p>
          </div>
        ))}
        {sections.map((s) => (
          <div key={s.level2} className="rounded-lg bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-muted-foreground">{s.level2}</p>
            <p className="text-xl font-bold">{s.total}</p>
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <section key={section.level2} className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{section.level2}</h2>
              <Badge variant="outline">{section.total}건</Badge>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                작동 {section.working.length}
              </span>
              <span className="rounded bg-red-100 px-2 py-1 text-red-800">
                비작동 {section.notWorking.length}
              </span>
              <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">
                개선 {section.improvements.length}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <FactorColumn
              title="작동요인"
              subtitle="Success Factors"
              items={section.working}
              borderColor="border-l-green-500"
              emptyColor="text-green-600"
            />
            <FactorColumn
              title="비작동요인"
              subtitle="Failure Factors"
              items={section.notWorking}
              borderColor="border-l-red-500"
              emptyColor="text-red-600"
            />
            <FactorColumn
              title="개선사항"
              subtitle="Improvements"
              items={section.improvements}
              borderColor="border-l-amber-500"
              emptyColor="text-amber-600"
            />
          </div>
        </section>
      ))}

      {lessons.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          분석할 교훈이 없습니다
        </div>
      )}
    </div>
  );
}

function FactorColumn({
  title,
  subtitle,
  items,
  borderColor,
  emptyColor,
}: {
  title: string;
  subtitle: string;
  items: Lesson[];
  borderColor: string;
  emptyColor: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold">
        {title}{" "}
        <span className="font-normal text-muted-foreground">({subtitle})</span>
      </h3>
      {items.length === 0 ? (
        <p className={`text-xs ${emptyColor}`}>해당 없음</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const parsed = parseLesson(item.content);
            return (
              <Link key={item.id} href={`/lessons/${item.id}`}>
                <Card className={`cursor-pointer border-l-4 ${borderColor} transition-shadow hover:shadow-md`}>
                  <CardContent className="p-3 space-y-2.5">
                    {/* 1) 키워드 */}
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-1">
                        {item.level3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.level3}
                          </Badge>
                        )}
                        {item.level3_sub && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {item.level3_sub}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[13px] font-bold leading-snug">{parsed.keyword}</p>
                    </div>

                    {/* 2) 메커니즘 */}
                    {parsed.mechanism.length > 0 && (
                      <div className="space-y-1.5">
                        {parsed.mechanism.map((sec, i) => (
                          <div key={i}>
                            {sec.title && (
                              <p className="mb-0.5 inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                                {sec.title}
                              </p>
                            )}
                            <ul className="space-y-0.5">
                              {sec.bullets.slice(0, 3).map((b, j) => {
                                const cleaned = b
                                  .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
                                  .replace(/^\([a-z]\)\s*/, "")
                                  .replace(/^[0-9]+[.)]\s*/, "");
                                return (
                                  <li key={j} className="flex gap-1.5 text-[11px] leading-[1.6] text-muted-foreground">
                                    <span className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
                                    <span className="line-clamp-2">{cleaned || b}</span>
                                  </li>
                                );
                              })}
                              {sec.bullets.length > 3 && (
                                <li className="pl-2.5 text-[11px] text-primary">
                                  +{sec.bullets.length - 3}개 더보기
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3) 핵심 교훈 */}
                    {parsed.coreLesson && (
                      <div className="rounded-md bg-blue-50 px-3 py-2">
                        <p className="mb-0.5 text-[10px] font-bold text-blue-600">핵심 교훈</p>
                        <p className="text-[11px] font-medium leading-[1.6] text-blue-900">
                          {parsed.coreLesson}
                        </p>
                      </div>
                    )}

                    <p className="border-t pt-1.5 text-[10px] text-muted-foreground/70">
                      {item.project_name}
                      {item.evaluation_name && ` · ${item.evaluation_name}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
