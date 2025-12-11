/**
 * @file bookmark-card.tsx
 * @description 북마크 카드 컴포넌트
 *
 * 북마크 목록에서 사용하는 관광지 카드 컴포넌트입니다.
 * TourCard를 기반으로 삭제 버튼을 추가했습니다.
 *
 * 주요 기능:
 * - 관광지 정보 표시 (TourCard와 동일)
 * - 삭제 버튼 (카드 우측 상단)
 * - 삭제 확인 다이얼로그
 * - 삭제 성공/실패 토스트 메시지
 *
 * @see {@link /components/tour-card.tsx} - 기존 카드 컴포넌트
 * @see {@link /docs/DESIGN.md} - 카드 디자인 가이드
 */

"use client";

import Link from "next/link";
import { MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";
import { removeBookmark } from "@/lib/api/supabase-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Content Type ID를 한글 이름으로 변환
 */
function getContentTypeName(contentTypeId: string): string {
  switch (contentTypeId) {
    case CONTENT_TYPE.TOURIST_SPOT:
      return "관광지";
    case CONTENT_TYPE.CULTURAL_FACILITY:
      return "문화시설";
    case CONTENT_TYPE.FESTIVAL:
      return "축제/행사";
    case CONTENT_TYPE.TRAVEL_COURSE:
      return "여행코스";
    case CONTENT_TYPE.LEISURE_SPORTS:
      return "레포츠";
    case CONTENT_TYPE.ACCOMMODATION:
      return "숙박";
    case CONTENT_TYPE.SHOPPING:
      return "쇼핑";
    case CONTENT_TYPE.RESTAURANT:
      return "음식점";
    default:
      return "기타";
  }
}

interface BookmarkCardProps {
  tour: TourItem;
  onDelete?: (contentId: string) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * 북마크 카드 컴포넌트
 */
export default function BookmarkCard({
  tour,
  onDelete,
  isDeleting = false,
}: BookmarkCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);
  const imageUrl = tour.firstimage || tour.firstimage2;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
  const [imageError, setImageError] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeletingState(true);
    try {
      if (onDelete) {
        await onDelete(tour.contentid);
      } else {
        const result = await removeBookmark(tour.contentid);
        if (result.success) {
          toast.success("북마크가 삭제되었습니다.");
          router.refresh();
        } else {
          toast.error(result.error || "북마크 삭제에 실패했습니다.");
        }
      }
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("북마크 삭제 중 에러:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingState(false);
    }
  };

  const isLoading = isDeleting || isDeletingState;

  return (
    <>
      <div className="group relative bg-card rounded-xl shadow-md border overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-border">
        <Link
          href={`/places/${tour.contentid}`}
          className="block"
          aria-label={`${tour.title} 상세보기`}
        >
          {/* 이미지 영역 */}
          <div className="relative w-full aspect-video overflow-hidden bg-muted">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={tour.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={() => setImageError(true)}
                suppressHydrationWarning
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <MapPin className="w-12 h-12 opacity-50" />
              </div>
            )}
            {/* 삭제 버튼 (호버 시 표시) */}
            <button
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="absolute top-2 right-2 p-2 rounded-full bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`${tour.title} 북마크 삭제`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="p-4 space-y-3">
            {/* 관광지명 */}
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors overflow-hidden text-ellipsis line-clamp-2">
              {tour.title}
            </h3>

            {/* 주소 */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {address}
              </span>
            </div>

            {/* 관광 타입 뱃지 */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {contentTypeName}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제</DialogTitle>
            <DialogDescription>
              "{tour.title}" 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

