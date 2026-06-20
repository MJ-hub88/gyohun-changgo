"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVELS, FACTOR_TYPES, getFactorColor } from "@/lib/constants";

type Lesson = {
  id: string;
  level1: string;
  level2: string;
  level3: string | null;
  level3_sub: string | null;
  level4: string | null;
  project_name: string;
  factor_type: string;
  content: string;
};

type GroupedByL2 = {
  level2: string;
  byL3: {
    level3: string;
    level3_sub: string | null;
    items: Lesson[];
  }[];
};

function groupLessons(lessons: Lesson[]): GroupedByL2[] {
  const l2Map = new Map<string, Map<string, Lesson[]>>();

  for (const l of lessons) {
    const l2 = l.level2;
    const l3Key = [l.level3, l.level3_sub].filter(Boolean).join(" > ") || "기타";

    if (!l2Map.has(l2)) l2Map.set(l2, new Map());
    const l3Map = l2Map.get(l2)!;
    if (!l3Map.has(l3Key)) l3Map.set(l3Key, []);
    l3Map.get(l3Key)!.push(l);
  }

  return Array.from(l2Map.entries()).map(([level2, l3Map]) => ({
    level2,
    byL3: Array.from(l3Map.entries()).map(([key, items]) => ({
      level3: key,
      level3_sub: items[0]?.level3_sub || null,
      items,
    })),
  }));
}

function parseBullets(content: string): { heading: string | null; bullets: string[] } {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  let heading: string | null = null;
  const bullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith("【") && line.endsWith("】")) {
      heading = line.slice(1, -1);
    } else if (line.startsWith("【")) {
      heading = line.replace(/【|】/g, "");
    } else if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(line) || /^\([a-z]\)/.test(line) || /^[0-9]+[.)]\s/.test(line)) {
      bullets.push(line);
    } else if (bullets.length > 0 && !line.startsWith("【")) {
      bullets[bullets.length - 1] += " " + line;
    } else {
      bullets.push(line);
    }
  }

  return { heading, bullets };
}

export default function ReportPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterL2, setFilterL2] = useState("all");
  const [filterFt, setFilterFt] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from("lessons").select("*").order("level2").order("level3");
      if (filterL2 !== "all") q = q.eq("level2", filterL2);
      if (filterFt !== "all") q = q.eq("factor_type", filterFt);
      const { data } = await q;
      setLessons(data || []);
      setLoading(false);
    }
    load();
  }, [filterL2, filterFt]);

  const grouped = groupLessons(lessons);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">교훈 분석 리포트</h1>
        <p className="text-sm text-muted-foreground">
          세부분야(L2) → 분석영역(L3) 계층으로 정리
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterL2} onValueChange={setFilterL2}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="세부분야" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 분야</SelectItem>
            {LEVELS.level2.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterFt} onValueChange={setFilterFt}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="구분" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 구분</SelectItem>
            {FACTOR_TYPES.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {FACTOR_TYPES.map((ft) => (
            <Badge key={ft} className={getFactorColor(ft)}>
              {ft} {totalByFt[ft]}건
            </Badge>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          분석할 교훈이 없습니다
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.level2}>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <h2 className="text-lg font-bold">{g.level2}</h2>
                <Badge variant="outline">
                  {g.byL3.reduce((s, l3) => s + l3.items.length, 0)}건
                </Badge>
              </div>

              <div className="space-y-5 pl-4">
                {g.byL3.map((l3Group) => (
                  <div key={l3Group.level3}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                      {l3Group.level3}
                    </h3>

                    <div className="space-y-3 pl-4">
                      {l3Group.items.map((item) => {
                        const { heading, bullets } = parseBullets(item.content);
                        const borderClass =
                          item.factor_type === "작동요인"
                            ? "border-l-green-500"
                            : item.factor_type === "비작동요인"
                              ? "border-l-red-500"
                              : "border-l-amber-500";

                        return (
                          <Card key={item.id} className={`border-l-4 ${borderClass}`}>
                            <CardContent className="p-4">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className={getFactorColor(item.factor_type)}>
                                  {item.factor_type}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {item.project_name}
                                </span>
                              </div>

                              {heading && (
                                <p className="mb-2 text-sm font-medium">{heading}</p>
                              )}

                              <ul className="space-y-1.5">
                                {bullets.map((bullet, i) => {
                                  const isSubItem = /^\([a-z]\)/.test(bullet);
                                  const cleaned = bullet
                                    .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
                                    .replace(/^\([a-z]\)\s*/, "")
                                    .replace(/^[0-9]+[.)]\s*/, "");

                                  if (bullet.startsWith("【")) {
                                    const sectionTitle = bullet.replace(/【|】/g, "").split("】")[0];
                                    const rest = bullet.includes("】")
                                      ? bullet.split("】").slice(1).join("】").trim()
                                      : "";
                                    return (
                                      <li key={i} className="mt-3">
                                        <p className="text-sm font-medium text-foreground">
                                          {sectionTitle}
                                        </p>
                                        {rest && (
                                          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                                            {rest}
                                          </p>
                                        )}
                                      </li>
                                    );
                                  }

                                  return (
                                    <li
                                      key={i}
                                      className={`flex gap-2 text-sm leading-relaxed ${
                                        isSubItem ? "pl-5 text-muted-foreground" : ""
                                      }`}
                                    >
                                      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                      <span>{cleaned || bullet}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
