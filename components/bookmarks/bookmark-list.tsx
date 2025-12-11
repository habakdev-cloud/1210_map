/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 Client Component입니다.
 * 정렬, 일괄 삭제, 개별 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * - 북마크 목록 조회 및 표시
 * - 정렬 옵션 (최신순, 이름순, 지역별)
 * - 일괄 삭제 기능 (체크박스 선택)
 * - 개별 삭제 기능 (각 카드에 삭제 버튼)
 * - 빈 상태 처리
 * - 에러 처리
 *
 * @see {@link /docs/PRD.md} - Phase 5.3 북마크 목록 페이지
 * @see {@link /docs/DESIGN.md} - 북마크 페이지 디자인 가이드
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ArrowUpDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getUserBookmarks, removeBookmarks } from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import BookmarkCard from "@/components/bookmarks/bookmark-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TourItem } from "@/lib/types/tour";
import type { TourDetail } from "@/lib/types/tour";

/**
 * TourDetail을 TourItem으로 변환
 */
function convertDetailToItem(
  detail: TourDetail,
  bookmarkCreatedAt?: string
): TourItem & { bookmarkCreatedAt?: string } {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // TourDetail에는 areacode가 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: new Date().toISOString(),
    bookmarkCreatedAt, // 북마크 생성일시 추가
  };
}

/**
 * 정렬 타입
 */
type SortType = "latest" | "name" | "area";

/**
 * 정렬 함수
 */
function sortTours(
  tours: (TourItem & { bookmarkCreatedAt?: string })[],
  sortType: SortType
): (TourItem & { bookmarkCreatedAt?: string })[] {
  const sorted = [...tours];

  switch (sortType) {
    case "name":
      // 이름순 (가나다순)
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
      break;
    case "area":
      // 지역별 (areacode 기준 오름차순)
      sorted.sort((a, b) => {
        const areaA = a.areacode || "";
        const areaB = b.areacode || "";
        return areaA.localeCompare(areaB, "ko");
      });
      break;
    case "latest":
    default:
      // 최신순 (bookmarkCreatedAt 기준 내림차순)
      sorted.sort((a, b) => {
        const timeA = a.bookmarkCreatedAt
          ? new Date(a.bookmarkCreatedAt).getTime()
          : 0;
        const timeB = b.bookmarkCreatedAt
          ? new Date(b.bookmarkCreatedAt).getTime()
          : 0;
        return timeB - timeA;
      });
      break;
  }

  return sorted;
}

/**
 * 북마크 목록 컴포넌트
 */
export default function BookmarkList() {
  const router = useRouter();
  const [tours, setTours] = useState<
    (TourItem & { bookmarkCreatedAt?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 북마크 목록 로드
  useEffect(() => {
    async function loadBookmarks() {
      setIsLoading(true);
      try {
        // 북마크 목록 조회 (created_at 포함)
        const bookmarks = await getUserBookmarks();

        if (bookmarks.length === 0) {
          setTours([]);
          setIsLoading(false);
          return;
        }

        // 각 contentId에 대해 상세 정보 조회 (병렬 처리)
        const tourDetails = await Promise.allSettled(
          bookmarks.map((bookmark) =>
            getDetailCommon({ contentId: bookmark.content_id }).then(
              (detail) => ({
                detail,
                created_at: bookmark.created_at,
              })
            )
          )
        );

        // 성공한 결과만 필터링 및 변환
        const loadedTours: (TourItem & { bookmarkCreatedAt?: string })[] =
          tourDetails
            .filter(
              (
                result
              ): result is PromiseFulfilledResult<{
                detail: TourDetail | null;
                created_at: string;
              }> =>
                result.status === "fulfilled" &&
                result.value.detail !== null
            )
            .map((result) =>
              convertDetailToItem(
                result.value.detail!,
                result.value.created_at
              )
            );

        setTours(loadedTours);
      } catch (error) {
        console.error("북마크 목록 로드 실패:", error);
        toast.error("북마크 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBookmarks();
  }, []);

  // 정렬된 목록
  const sortedTours = useMemo(
    () => sortTours(tours, sortType),
    [tours, sortType]
  );

  // 개별 삭제 핸들러
  const handleDelete = async (contentId: string) => {
    try {
      const result = await removeBookmarks([contentId]);
      if (result.success) {
        toast.success("북마크가 삭제되었습니다.");
        // 목록에서 제거
        setTours((prev) => prev.filter((tour) => tour.contentid !== contentId));
        // 선택 상태에서도 제거
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(contentId);
          return next;
        });
        router.refresh();
      } else {
        toast.error(result.error || "북마크 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("북마크 삭제 중 에러:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다.");
    }
  };

  // 일괄 삭제 핸들러
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      const contentIds = Array.from(selectedIds);
      const result = await removeBookmarks(contentIds);
      if (result.success) {
        toast.success(
          `${result.deletedCount || contentIds.length}개의 북마크가 삭제되었습니다.`
        );
        // 목록에서 제거
        setTours((prev) =>
          prev.filter((tour) => !selectedIds.has(tour.contentid))
        );
        // 선택 상태 초기화
        setSelectedIds(new Set());
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "북마크 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("북마크 일괄 삭제 중 에러:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedTours.map((tour) => tour.contentid)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 개별 선택/해제
  const handleSelectItem = (contentId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(contentId);
      } else {
        next.delete(contentId);
      }
      return next;
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">북마크 목록을 불러오는 중...</p>
      </div>
    );
  }

  // 빈 상태 처리
  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed border-border p-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          아직 북마크한 관광지가 없습니다
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          관광지 상세 페이지에서 북마크를 추가해보세요.
        </p>
        <Button asChild variant="outline">
          <Link href="/">관광지 둘러보기 →</Link>
        </Button>
      </div>
    );
  }

  const isAllSelected =
    sortedTours.length > 0 &&
    selectedIds.size === sortedTours.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < sortedTours.length;

  return (
    <div className="space-y-6">
      {/* 컨트롤 영역 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          {/* 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <ArrowUpDown
              className="w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
              <SelectTrigger className="w-[140px]" aria-label="정렬 옵션 선택">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="area">지역별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 체크박스 및 일괄 삭제 */}
          {sortedTours.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="전체 선택"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  전체 선택
                </label>
              </div>

              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size}개 선택됨
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    일괄 삭제
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 북마크 개수 */}
        <p className="text-sm text-muted-foreground">
          총 {tours.length}개의 북마크된 관광지
        </p>
      </div>

      {/* 북마크 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTours.map((tour) => (
          <div key={tour.contentid} className="relative group">
            {/* 체크박스 (호버 시 또는 선택 시 표시) */}
            <div
              className={`absolute top-2 left-2 z-10 transition-opacity ${
                selectedIds.has(tour.contentid)
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <Checkbox
                id={`select-${tour.contentid}`}
                checked={selectedIds.has(tour.contentid)}
                onCheckedChange={(checked) =>
                  handleSelectItem(tour.contentid, checked === true)
                }
                aria-label={`${tour.title} 선택`}
                className="bg-background/90 backdrop-blur-sm shadow-md"
              />
            </div>
            <BookmarkCard
              tour={tour}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>
        ))}
      </div>

      {/* 일괄 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 일괄 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedIds.size}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
