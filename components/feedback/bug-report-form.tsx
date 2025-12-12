/**
 * @file bug-report-form.tsx
 * @description 버그 리포트 폼 컴포넌트
 *
 * 사용자 버그 리포트를 수집하는 모달 폼입니다.
 * 버그 제목, 설명, 현재 페이지 URL, 사용자 에이전트, 에러 스택을 자동으로 수집합니다.
 *
 * 주요 기능:
 * - 버그 제목 및 설명 입력
 * - 현재 페이지 URL 자동 수집
 * - 사용자 에이전트 자동 수집
 * - 에러 스택 입력 (선택 사항)
 * - 제출 및 에러 처리
 */

"use client";

import { useState, useEffect } from "react";
import { Bug, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitBugReport } from "@/lib/api/bug-report-api";
import { toast } from "sonner";

interface BugReportFormProps {
  /**
   * 모달 열림 상태
   */
  open?: boolean;
  /**
   * 모달 열림 상태 변경 핸들러
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 트리거 버튼 (선택 사항)
   */
  trigger?: React.ReactNode;
  /**
   * 초기 에러 스택 (에러 바운더리에서 전달)
   */
  initialErrorStack?: string;
  /**
   * 초기 페이지 URL (에러 바운더리에서 전달)
   */
  initialPageUrl?: string;
}

/**
 * 버그 리포트 폼 컴포넌트
 */
export function BugReportForm({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  initialErrorStack,
  initialPageUrl,
}: BugReportFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorStack, setErrorStack] = useState(initialErrorStack || "");
  const [pageUrl, setPageUrl] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 제어/비제어 모드 처리
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  // 컴포넌트 마운트 시 현재 페이지 URL과 사용자 에이전트 수집
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(initialPageUrl || window.location.href);
      setUserAgent(navigator.userAgent);
    }
  }, [initialPageUrl]);

  // 모달이 열릴 때 초기 에러 스택 설정
  useEffect(() => {
    if (open && initialErrorStack) {
      setErrorStack(initialErrorStack);
    }
  }, [open, initialErrorStack]);

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("버그 제목을 입력해주세요.");
      return;
    }

    if (!description.trim()) {
      toast.error("버그 설명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBugReport({
        title: title.trim(),
        description: description.trim(),
        pageUrl: pageUrl || undefined,
        userAgent: userAgent || undefined,
        errorStack: errorStack.trim() || undefined,
      });

      if (result.success) {
        toast.success("버그 리포트가 제출되었습니다. 감사합니다!");
        // 폼 초기화
        setTitle("");
        setDescription("");
        setErrorStack("");
        setOpen(false);
      } else {
        toast.error(result.error || "버그 리포트 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BugReportForm] 버그 리포트 제출 에러:", error);
      toast.error("예기치 않은 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        // 모달이 닫힐 때 폼 초기화 (에러 스택은 유지)
        setTitle("");
        setDescription("");
        if (!initialErrorStack) {
          setErrorStack("");
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            버그 리포트
          </DialogTitle>
          <DialogDescription>
            발견하신 버그를 자세히 설명해주세요. 빠른 해결을 위해 가능한 한 많은 정보를 제공해주시면 도움이 됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 버그 제목 */}
          <div className="space-y-2">
            <Label htmlFor="bug-title">버그 제목 *</Label>
            <Input
              id="bug-title"
              placeholder="버그를 간단히 설명해주세요..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
              required
              aria-label="버그 제목 입력"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length} / 200
            </p>
          </div>

          {/* 버그 설명 */}
          <div className="space-y-2">
            <Label htmlFor="bug-description">버그 설명 *</Label>
            <Textarea
              id="bug-description"
              placeholder="버그가 발생한 상황, 재현 방법, 예상 동작 등을 자세히 설명해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              maxLength={10000}
              required
              className="resize-none"
              aria-label="버그 설명 입력"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length} / 10000
            </p>
          </div>

          {/* 에러 스택 (선택 사항) */}
          <div className="space-y-2">
            <Label htmlFor="bug-error-stack" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              에러 스택 (선택 사항)
            </Label>
            <Textarea
              id="bug-error-stack"
              placeholder="에러 스택 트레이스가 있다면 붙여넣어주세요..."
              value={errorStack}
              onChange={(e) => setErrorStack(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="resize-none font-mono text-xs"
              aria-label="에러 스택 입력"
            />
          </div>

          {/* 자동 수집 정보 (읽기 전용) */}
          <div className="space-y-2">
            <Label>자동 수집 정보</Label>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">페이지 URL: </span>
                <span className="font-mono text-xs break-all">{pageUrl || "수집 중..."}</span>
              </div>
              <div>
                <span className="text-muted-foreground">브라우저: </span>
                <span className="font-mono text-xs break-all">
                  {userAgent || "수집 중..."}
                </span>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !description.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  제출 중...
                </>
              ) : (
                "제출"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

