/**
 * @file feedback-form.tsx
 * @description 피드백 폼 컴포넌트
 *
 * 사용자 피드백을 수집하는 모달 폼입니다.
 * 일반 피드백, 기능 제안, 개선 사항을 제출할 수 있습니다.
 *
 * 주요 기능:
 * - 피드백 타입 선택 (일반, 기능 제안, 개선 사항)
 * - 피드백 내용 입력
 * - 평점 선택 (1-5, 선택 사항)
 * - 제출 및 에러 처리
 */

"use client";

import { useState } from "react";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitFeedback, type FeedbackType } from "@/lib/api/feedback-api";
import { toast } from "sonner";

interface FeedbackFormProps {
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
}

/**
 * 피드백 폼 컴포넌트
 */
export function FeedbackForm({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: FeedbackFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 제어/비제어 모드 처리
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("피드백 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        type,
        content: content.trim(),
        rating,
      });

      if (result.success) {
        toast.success("피드백이 제출되었습니다. 감사합니다!");
        // 폼 초기화
        setContent("");
        setRating(undefined);
        setType("general");
        setOpen(false);
      } else {
        toast.error(result.error || "피드백 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("[FeedbackForm] 피드백 제출 에러:", error);
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
        // 모달이 닫힐 때 폼 초기화
        setContent("");
        setRating(undefined);
        setType("general");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            피드백 제출
          </DialogTitle>
          <DialogDescription>
            서비스 개선을 위한 의견을 남겨주세요. 모든 피드백은 검토 후 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 피드백 타입 선택 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-type">피드백 타입</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as FeedbackType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="feedback-type" aria-label="피드백 타입 선택">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">일반 피드백</SelectItem>
                <SelectItem value="feature">기능 제안</SelectItem>
                <SelectItem value="improvement">개선 사항</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 피드백 내용 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-content">피드백 내용</Label>
            <Textarea
              id="feedback-content"
              placeholder="피드백 내용을 입력해주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={5}
              maxLength={5000}
              className="resize-none"
              aria-label="피드백 내용 입력"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} / 5000
            </p>
          </div>

          {/* 평점 선택 (선택 사항) */}
          <div className="space-y-2">
            <Label htmlFor="feedback-rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              평점 (선택 사항)
            </Label>
            <Select
              value={rating?.toString() || ""}
              onValueChange={(value) =>
                setRating(value ? parseInt(value, 10) : undefined)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="feedback-rating" aria-label="평점 선택">
                <SelectValue placeholder="평점을 선택하세요 (선택 사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">평점 없음</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ (5점)</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ (4점)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ (3점)</SelectItem>
                <SelectItem value="2">⭐⭐ (2점)</SelectItem>
                <SelectItem value="1">⭐ (1점)</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
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

