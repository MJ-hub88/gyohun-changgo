"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFactorColor } from "@/lib/constants";

type Lesson = {
  id: string;
  level1: string;
  level2: string;
  project_name: string;
  factor_type: string;
  content: string;
  created_at: string;
};

type Stats = { label: string; count: number; query: string };

export default function Dashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [factorStats, setFactorStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const all = data || [];
      setLessons(all.slice(0, 5));

      const l2Map = new Map<string, number>();
      const ftMap = new Map<string, number>();
      for (const l of all) {
        l2Map.set(l.level2, (l2Map.get(l.level2) || 0) + 1);
        ftMap.set(l.factor_type, (ftMap.get(l.factor_type) || 0) + 1);
      }

      setStats([
        { label: "총 교훈 수", count: all.length, query: "" },
        ...Array.from(l2Map.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ label: k, count: v, query: `level2=${k}` })),
      ]);

      setFactorStats(
        ["작동요인", "비작동요인", "개선사항"].map((ft) => ({
          label: ft,
          count: ftMap.get(ft) || 0,
          query: `factor_type=${ft}`,
        }))
      );

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive">오류가 발생했습니다: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  if (stats.length > 0 && stats[0].count === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">아직 등록된 교훈이 없습니다</h2>
        <p className="mt-2 text-muted-foreground">첫 교훈을 입력해보세요!</p>
        <Link href="/lessons/new">
          <Button className="mt-4">새 교훈 입력</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">사업평가 교훈 관리</p>
        </div>
        <Link href="/lessons/new">
          <Button>새 교훈 입력</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.query ? `/lessons?${s.query}` : "/lessons"}
          >
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {factorStats.map((s) => (
          <Link key={s.label} href={`/lessons?${s.query}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <Badge className={getFactorColor(s.label)}>{s.label}</Badge>
                <p className="mt-2 text-2xl font-bold">{s.count}건</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">최근 등록된 교훈</h2>
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{lesson.level2}</Badge>
                    <Badge className={getFactorColor(lesson.factor_type)}>
                      {lesson.factor_type}
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium">{lesson.project_name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {lesson.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
