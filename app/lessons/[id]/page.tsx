"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFactorColor, getMonitoringColor } from "@/lib/constants";

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
  author: string | null;
  follow_up_type: string | null;
  responsible: string | null;
  monitoring_result: string | null;
  monitoring_status: string | null;
  created_at: string;
};

export default function LessonDetail() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.id)
        .single();
      setLesson(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("lessons").delete().eq("id", params.id);
    router.push("/lessons");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">교훈을 찾을 수 없습니다</p>
        <Link href="/lessons">
          <Button variant="outline" className="mt-4">목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/lessons" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{lesson.level2}</span>
          {lesson.level3 && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{lesson.level3}</span>}
          {lesson.level3_sub && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{lesson.level3_sub}</span>}
          {lesson.level4 && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{lesson.level4}</span>}
          <Badge className={getFactorColor(lesson.factor_type)}>
            {lesson.factor_type}
          </Badge>
        </div>
        <h2 className="text-xl font-bold leading-tight md:text-2xl">{lesson.project_name}</h2>
        {lesson.evaluation_name && (
          <p className="mt-1 text-sm text-gray-500">{lesson.evaluation_name}</p>
        )}
      </div>

      <div className="rounded-xl border-l-4 border-l-primary border border-gray-200 bg-white/80 p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm md:p-8">
        <h3 className="mb-4 text-lg font-bold">교훈 및 시사점</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{lesson.content}</div>
        {lesson.author && (
          <p className="mt-4 border-t pt-3 text-xs text-gray-400">작성: {lesson.author}</p>
        )}
      </div>

      {(lesson.follow_up_type || lesson.responsible || lesson.monitoring_result) && (
        <div className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm md:p-8">
          <h3 className="mb-4 text-lg font-bold">이행 추적</h3>
          <div className="space-y-3">
            {lesson.follow_up_type && (
              <div>
                <span className="text-sm text-muted-foreground">환류과제 구분: </span>
                <span>{lesson.follow_up_type}</span>
              </div>
            )}
            {lesson.responsible && (
              <div>
                <span className="text-sm text-muted-foreground">이행주체: </span>
                <span>{lesson.responsible}</span>
              </div>
            )}
            {lesson.monitoring_status && (
              <div>
                <span className="text-sm text-muted-foreground">이행상태: </span>
                <Badge className={getMonitoringColor(lesson.monitoring_status)}>
                  {lesson.monitoring_status}
                </Badge>
              </div>
            )}
            {lesson.monitoring_result && (
              <div>
                <span className="text-sm text-muted-foreground">이행 모니터링 결과: </span>
                <p className="mt-1">{lesson.monitoring_result}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/lessons/${lesson.id}/edit`}>
          <Button variant="outline" className="rounded-lg px-8">수정</Button>
        </Link>
        <Dialog>
          <DialogTrigger>
            <Button variant="destructive">삭제</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>교훈을 삭제하시겠습니까?</DialogTitle>
              <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
