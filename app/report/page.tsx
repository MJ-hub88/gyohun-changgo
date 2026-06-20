"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVELS, getFactorColor } from "@/lib/constants";

type Lesson = {
  id: string;
  level1: string;
  level2: string;
  level3: string | null;
  level4: string | null;
  project_name: string;
  factor_type: string;
  content: string;
};

export default function ReportPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterL2, setFilterL2] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from("lessons").select("*").order("factor_type");
      if (filterL2 !== "all") q = q.eq("level2", filterL2);
      const { data } = await q;
      setLessons(data || []);
      setLoading(false);
    }
    load();
  }, [filterL2]);

  const working = lessons.filter((l) => l.factor_type === "작동요인");
  const notWorking = lessons.filter((l) => l.factor_type === "비작동요인");
  const improvements = lessons.filter((l) => l.factor_type === "개선사항");

  const tags = Array.from(new Set(lessons.flatMap((l) => [l.level2, l.level3].filter(Boolean))));

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
        <p className="text-sm text-muted-foreground">작동요인·비작동요인·개선사항을 한눈에 정리</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">분석 대상:</span>
        <Select value={filterL2} onValueChange={setFilterL2}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="세부분야" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {LEVELS.level2.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          분석할 교훈이 없습니다
        </div>
      ) : (
        <div className="space-y-6">
          <Section
            title="작동 요인"
            subtitle="Success Factors"
            items={working}
            color="green"
          />
          <Section
            title="비작동 요인"
            subtitle="Failure Factors"
            items={notWorking}
            color="red"
          />
          <ImprovementSection items={improvements} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  items,
  color,
}: {
  title: string;
  subtitle: string;
  items: Lesson[];
  color: "green" | "red";
}) {
  const borderColor = color === "green" ? "border-l-green-500" : "border-l-red-500";

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">
        {title} <span className="text-sm font-normal text-muted-foreground">({subtitle})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">해당 항목 없음</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={`border-l-4 ${borderColor}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.project_name}</span>
                  <Badge className={getFactorColor(item.factor_type)} >
                    {item.factor_type}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ImprovementSection({ items }: { items: Lesson[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">
        핵심 개선사항 <span className="text-sm font-normal text-muted-foreground">(Key Improvements)</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">해당 항목 없음</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={item.id} className="border-l-4 border-l-amber-500">
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium">{item.project_name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
