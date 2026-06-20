"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { LEVELS, FACTOR_TYPES, MONITORING_STATUSES } from "@/lib/constants";

export default function NewLessonPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    level1: "교육",
    level2: "",
    level3: "",
    level4: "",
    project_name: "",
    evaluation_name: "",
    factor_type: "",
    content: "",
    author: "",
    follow_up_type: "",
    responsible: "",
    monitoring_result: "",
    monitoring_status: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.level2 || !form.project_name || !form.factor_type || !form.content) {
      setError("세부분야, 사업명, 구분, 교훈 내용은 필수입니다.");
      return;
    }

    setSubmitting(true);
    const { error: err } = await supabase.from("lessons").insert({
      level1: form.level1,
      level2: form.level2,
      level3: form.level3 || null,
      level4: form.level4 || null,
      project_name: form.project_name,
      evaluation_name: form.evaluation_name || null,
      factor_type: form.factor_type,
      content: form.content,
      author: form.author || null,
      follow_up_type: form.follow_up_type || null,
      responsible: form.responsible || null,
      monitoring_result: form.monitoring_result || null,
      monitoring_status: form.monitoring_status || null,
    });

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/lessons"), 1500);
  }

  if (success) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-bold text-green-600">저장되었습니다!</p>
        <p className="mt-2 text-sm text-muted-foreground">목록으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">새 교훈 입력</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">사업담당자 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>분야 (L1)</Label>
              <Select value={form.level1} onValueChange={(v) => update("level1", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.level1.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>세부분야 (L2) *</Label>
              <Select value={form.level2} onValueChange={(v) => update("level2", v)}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.level2.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>성과영역 (L3)</Label>
              <Select value={form.level3} onValueChange={(v) => update("level3", v)}>
                <SelectTrigger><SelectValue placeholder="선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.level3.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>사업요소 (L4)</Label>
              <Select value={form.level4} onValueChange={(v) => update("level4", v)}>
                <SelectTrigger><SelectValue placeholder="선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.level4.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>사업명 *</Label>
              <Input value={form.project_name} onChange={(e) => update("project_name", e.target.value)} placeholder="사업 전체 이름" />
            </div>
            <div>
              <Label>평가명</Label>
              <Input value={form.evaluation_name} onChange={(e) => update("evaluation_name", e.target.value)} placeholder="예: 중간평가, 종료평가" />
            </div>
          </div>

          <div>
            <Label>구분 *</Label>
            <RadioGroup value={form.factor_type} onValueChange={(v) => update("factor_type", v)} className="mt-2 flex gap-4">
              {FACTOR_TYPES.map((ft) => (
                <div key={ft} className="flex items-center gap-2">
                  <RadioGroupItem value={ft} id={ft} />
                  <Label htmlFor={ft} className="cursor-pointer">{ft}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>교훈 및 시사점 *</Label>
            <Textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={5} placeholder="교훈 내용을 입력하세요" />
          </div>

          <div>
            <Label>작성자/작성일</Label>
            <Input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="예: 홍길동/26.6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">성과관리 담당자 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>환류과제 구분</Label>
              <Input value={form.follow_up_type} onChange={(e) => update("follow_up_type", e.target.value)} placeholder="예: 환류과제" />
            </div>
            <div>
              <Label>이행주체</Label>
              <Select value={form.responsible} onValueChange={(v) => update("responsible", v)}>
                <SelectTrigger><SelectValue placeholder="선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  {["사업팀", "본부", "기관"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>이행 모니터링 결과</Label>
            <Textarea value={form.monitoring_result} onChange={(e) => update("monitoring_result", e.target.value)} rows={3} placeholder="이행 결과를 입력하세요" />
          </div>

          <div>
            <Label>이행상태</Label>
            <RadioGroup value={form.monitoring_status} onValueChange={(v) => update("monitoring_status", v)} className="mt-2 flex gap-4">
              {MONITORING_STATUSES.map((ms) => (
                <div key={ms} className="flex items-center gap-2">
                  <RadioGroupItem value={ms} id={`ms-${ms}`} />
                  <Label htmlFor={`ms-${ms}`} className="cursor-pointer">{ms}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
