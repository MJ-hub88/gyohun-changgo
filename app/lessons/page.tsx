"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVELS, FACTOR_TYPES, MONITORING_STATUSES, getFactorColor } from "@/lib/constants";

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
  monitoring_status: string | null;
  created_at: string;
};

export default function LessonsPage() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterL2, setFilterL2] = useState(searchParams.get("level2") || "all");
  const [filterFt, setFilterFt] = useState(searchParams.get("factor_type") || "all");
  const [filterMs, setFilterMs] = useState("all");

  useEffect(() => {
    async function load() {
      let q = supabase.from("lessons").select("*").order("created_at", { ascending: false });
      if (filterL2 !== "all") q = q.eq("level2", filterL2);
      if (filterFt !== "all") q = q.eq("factor_type", filterFt);
      if (filterMs !== "all") q = q.eq("monitoring_status", filterMs);

      const { data, error: err } = await q;
      if (err) { setError(err.message); setLoading(false); return; }

      let filtered = data || [];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.project_name.toLowerCase().includes(s) ||
            l.content.toLowerCase().includes(s)
        );
      }
      setLessons(filtered);
      setLoading(false);
    }
    load();
  }, [filterL2, filterFt, filterMs, search]);

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive">오류: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">교훈 목록</h1>
        <Link href="/lessons/new">
          <Button>새 교훈 입력</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filterL2} onValueChange={(v) => { setFilterL2(v ?? "all"); setLoading(true); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="세부분야" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 분야</SelectItem>
            {LEVELS.level2.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterFt} onValueChange={(v) => { setFilterFt(v ?? "all"); setLoading(true); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="구분" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 구분</SelectItem>
            {FACTOR_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterMs} onValueChange={(v) => { setFilterMs(v ?? "all"); setLoading(true); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="이행상태" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {MONITORING_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          placeholder="사업명 또는 키워드 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[250px]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          조건에 맞는 교훈이 없습니다
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">총 {lessons.length}건</p>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{lesson.level2}</Badge>
                      {lesson.level3 && <Badge variant="outline">{lesson.level3}</Badge>}
                      {lesson.level3_sub && <Badge variant="secondary">{lesson.level3_sub}</Badge>}
                      <Badge className={getFactorColor(lesson.factor_type)}>
                        {lesson.factor_type}
                      </Badge>
                    </div>
                    <p className="mt-2 font-medium">{lesson.project_name}</p>
                    {lesson.evaluation_name && (
                      <p className="text-xs text-muted-foreground">{lesson.evaluation_name}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {lesson.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
