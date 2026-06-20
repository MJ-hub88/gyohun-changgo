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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{lesson.level1}</Badge>
            <Badge variant="outline">{lesson.level2}</Badge>
            {lesson.level3 && <Badge variant="outline">{lesson.level3}</Badge>}
            {lesson.level3_sub && <Badge variant="secondary">{lesson.level3_sub}</Badge>}
            {lesson.level4 && <Badge variant="outline">{lesson.level4}</Badge>}
            <Badge className={getFactorColor(lesson.factor_type)}>
              {lesson.factor_type}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-xl">{lesson.project_name}</CardTitle>
          {lesson.evaluation_name && (
            <p className="text-sm text-muted-foreground">{lesson.evaluation_name}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">교훈 및 시사점</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
          </div>

          {lesson.author && (
            <p className="text-sm text-muted-foreground">작성: {lesson.author}</p>
          )}
        </CardContent>
      </Card>

      {(lesson.follow_up_type || lesson.responsible || lesson.monitoring_result) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">이행 추적</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href={`/lessons/${lesson.id}/edit`}>
          <Button variant="outline">수정</Button>
        </Link>
        <Dialog>
          <DialogTrigger asChild>
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
