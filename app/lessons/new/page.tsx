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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEVELS, LEVEL3_CATEGORIES, getLevel3Subcategories, FACTOR_TYPES, MONITORING_STATUSES, getFactorColor } from "@/lib/constants";

type ExtractedLesson = {
  level1: string;
  level2: string;
  level3: string | null;
  level4: string | null;
  project_name: string;
  evaluation_name: string | null;
  factor_type: string;
  content: string;
  author: string | null;
};

export default function NewLessonPage() {
  const router = useRouter();
  const [tab, setTab] = useState("upload");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedLesson[]>([]);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  // Manual form state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    level1: "교육", level2: "", level3: "", level3_sub: "", level4: "",
    project_name: "", evaluation_name: "", factor_type: "", content: "",
    author: "", follow_up_type: "", responsible: "",
    monitoring_result: "", monitoring_status: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleExtract() {
    setExtracting(true);
    setExtractError(null);
    setExtracted([]);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (pasteText) formData.append("text", pasteText);

    try {
      const res = await fetch("/api/extract-lessons", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error);
      } else {
        setExtracted(data.lessons || []);
        setSelectedIdxs(new Set(data.lessons?.map((_: unknown, i: number) => i) || []));
      }
    } catch {
      setExtractError("서버 연결에 실패했습니다.");
    }

    setExtracting(false);
  }

  function toggleSelect(idx: number) {
    setSelectedIdxs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleSaveSelected() {
    setSaving(true);
    const toSave = extracted
      .filter((_, i) => selectedIdxs.has(i))
      .map((l) => ({
        level1: l.level1 || "교육",
        level2: l.level2,
        level3: l.level3 || null,
        level4: l.level4 || null,
        project_name: l.project_name,
        evaluation_name: l.evaluation_name || null,
        factor_type: l.factor_type,
        content: l.content,
        author: l.author || null,
      }));

    const { error: err } = await supabase.from("lessons").insert(toSave);
    if (err) {
      setExtractError(err.message);
    } else {
      setSaveResult(`${toSave.length}건의 교훈이 저장되었습니다!`);
      setTimeout(() => router.push("/lessons"), 2000);
    }
    setSaving(false);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.level2 || !form.project_name || !form.factor_type || !form.content) {
      setError("세부분야, 사업명, 구분, 교훈 내용은 필수입니다.");
      return;
    }

    setSubmitting(true);
    const { error: err } = await supabase.from("lessons").insert({
      level1: form.level1, level2: form.level2,
      level3: form.level3 || null, level3_sub: form.level3_sub || null, level4: form.level4 || null,
      project_name: form.project_name, evaluation_name: form.evaluation_name || null,
      factor_type: form.factor_type, content: form.content, author: form.author || null,
      follow_up_type: form.follow_up_type || null, responsible: form.responsible || null,
      monitoring_result: form.monitoring_result || null, monitoring_status: form.monitoring_status || null,
    });

    if (err) { setError(err.message); setSubmitting(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/lessons"), 1500);
  }

  if (success || saveResult) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-bold text-green-600">{saveResult || "저장되었습니다!"}</p>
        <p className="mt-2 text-sm text-muted-foreground">목록으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">새 교훈 입력</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">보고서에서 자동 추출</TabsTrigger>
          <TabsTrigger value="manual">직접 입력</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">평가 보고서 업로드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                PDF 파일을 업로드하거나 보고서 내용을 붙여넣으면, AI가 작동요인·비작동요인·개선사항을 자동으로 추출합니다.
              </p>

              <div>
                <Label>파일 업로드 (PDF)</Label>
                <Input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-muted-foreground">또는</span>
                </div>
              </div>

              <div>
                <Label>보고서 내용 붙여넣기</Label>
                <Textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={8}
                  placeholder="보고서의 교훈·시사점·제언 부분을 복사해서 붙여넣으세요"
                  className="mt-1"
                />
              </div>

              {extractError && (
                <p className="text-sm text-destructive">{extractError}</p>
              )}

              <Button
                onClick={handleExtract}
                disabled={extracting || (!file && !pasteText)}
                className="w-full"
                size="lg"
              >
                {extracting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    AI가 분석 중... (30초~1분 소요)
                  </span>
                ) : (
                  "AI로 교훈 추출하기"
                )}
              </Button>
            </CardContent>
          </Card>

          {extracted.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    추출된 교훈 ({extracted.length}건)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIdxs(new Set(extracted.map((_, i) => i)))}
                    >
                      전체 선택
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIdxs(new Set())}
                    >
                      전체 해제
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {extracted.map((lesson, i) => (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedIdxs.has(i)
                        ? "border-primary bg-primary/5"
                        : "border-border opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIdxs.has(i)}
                        onChange={() => toggleSelect(i)}
                        className="mt-1 h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">{lesson.level2}</Badge>
                          {lesson.level3 && <Badge variant="outline">{lesson.level3}</Badge>}
                          <Badge className={getFactorColor(lesson.factor_type)}>
                            {lesson.factor_type}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">{lesson.project_name}</p>
                        {lesson.evaluation_name && (
                          <p className="text-xs text-muted-foreground">{lesson.evaluation_name}</p>
                        )}
                        <p className="mt-1 text-sm leading-relaxed">{lesson.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSaveSelected}
                  disabled={saving || selectedIdxs.size === 0}
                  className="w-full"
                  size="lg"
                >
                  {saving
                    ? "저장 중..."
                    : `선택한 ${selectedIdxs.size}건 저장하기`}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <form onSubmit={handleManualSubmit} className="space-y-6">
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>분석영역 (L3)</Label>
                    <Select value={form.level3} onValueChange={(v) => { update("level3", v); update("level3_sub", ""); }}>
                      <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        {LEVEL3_CATEGORIES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>세부영역 (L3 소분류)</Label>
                    <Select value={form.level3_sub} onValueChange={(v) => update("level3_sub", v)} disabled={!form.level3}>
                      <SelectTrigger><SelectValue placeholder={form.level3 ? "선택" : "대분류 먼저"} /></SelectTrigger>
                      <SelectContent>
                        {form.level3 && getLevel3Subcategories(form.level3).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>사업요소 (L4)</Label>
                    <Select value={form.level4} onValueChange={(v) => update("level4", v)}>
                      <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
