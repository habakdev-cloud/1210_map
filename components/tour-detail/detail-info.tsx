/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 * 이름, 이미지, 주소, 전화번호, 홈페이지, 개요 등을 표시합니다.
 *
 * 주요 기능:
 * - 관광지명 (대제목)
 * - 대표 이미지 표시
 * - 주소 복사 기능 (클립보드 API)
 * - 전화번호 클릭 시 전화 연결
 * - 홈페이지 외부 링크
 * - 개요 표시 (HTML 이스케이프 처리)
 * - 관광 타입 뱃지
 * - 정보 없는 항목 숨김 처리
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.1 기본 정보 섹션
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useState } from "react";
import { MapPin, Phone, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";

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

/**
 * HTML 이스케이프 처리 (XSS 방지)
 * 클라이언트 사이드에서만 실행되도록 체크
 */
function escapeHtml(text: string): string {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 간단한 이스케이프 처리
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // 클라이언트 사이드에서는 DOM API 사용
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

interface DetailInfoProps {
  detail: TourDetail;
}

/**
 * HTML에서 URL 추출 (홈페이지 필드가 HTML 태그로 오는 경우 처리)
 */
function extractUrlFromHtml(html: string): { url: string; displayText: string } {
  // 이미 URL인 경우 (HTML 태그가 없는 경우)
  if (!html.includes("<") && !html.includes(">")) {
    return { url: html.trim(), displayText: html.trim() };
  }

  // HTML 태그가 있는 경우 파싱
  try {
    // href 속성에서 URL 추출
    const hrefMatch = html.match(/href=["']([^"']+)["']/i);
    const url = hrefMatch ? hrefMatch[1] : "";

    // 텍스트 내용 추출 (태그 제거)
    const textMatch = html.match(/>([^<]+)</);
    const displayText = textMatch ? textMatch[1].trim() : url;

    return {
      url: url || html.replace(/<[^>]*>/g, "").trim(),
      displayText: displayText || url || html.replace(/<[^>]*>/g, "").trim(),
    };
  } catch {
    // 파싱 실패 시 HTML 태그만 제거
    const cleanText = html.replace(/<[^>]*>/g, "").trim();
    return { url: cleanText, displayText: cleanText };
  }
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export default function DetailInfo({ detail }: DetailInfoProps) {
  const [imageError, setImageError] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const imageUrl = detail.firstimage || detail.firstimage2;
  const contentTypeName = getContentTypeName(detail.contenttypeid);
  const address = detail.addr2 ? `${detail.addr1} ${detail.addr2}` : detail.addr1;
  
  // 홈페이지 URL 추출 (HTML 태그가 있을 수 있음)
  const homepageData = detail.homepage ? extractUrlFromHtml(detail.homepage) : null;

  /**
   * 주소 복사 기능
   */
  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      // HTTPS 환경 확인
      if (typeof window !== "undefined" && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        setAddressCopied(true);
        toast.success("주소가 복사되었습니다.");
        setTimeout(() => setAddressCopied(false), 2000);
      } else {
        // HTTPS가 아닌 경우 fallback
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setAddressCopied(true);
        toast.success("주소가 복사되었습니다.");
        setTimeout(() => setAddressCopied(false), 2000);
      }
    } catch (err) {
      console.error("주소 복사 실패:", err);
      toast.error("주소 복사에 실패했습니다.");
    }
  };

  /**
   * 개요 텍스트 처리 (HTML 이스케이프)
   */
  const renderOverview = () => {
    if (!detail.overview) return null;

    // HTML 이스케이프 처리
    const escapedText = escapeHtml(detail.overview);
    // 줄바꿈 처리 (개행 문자를 <br>로 변환)
    const formattedText = escapedText.replace(/\n/g, "<br />");

    return (
      <div
        className="prose prose-sm max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  return (
    <article className="container max-w-7xl mx-auto px-4 py-8 space-y-8" aria-label="관광지 상세 정보">
      {/* 대표 이미지 */}
      <figure className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${detail.title} 대표 이미지`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-label="이미지 없음">
            <MapPin className="w-24 h-24 text-muted-foreground opacity-50" aria-hidden="true" />
          </div>
        )}
      </figure>

      {/* 제목 및 뱃지 */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{detail.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 왼쪽 컬럼: 기본 정보 */}
        <div className="space-y-6">
          <section aria-label="기본 정보">
            <h2 className="text-xl font-semibold mb-4 text-foreground">기본 정보</h2>
            <div className="space-y-4">
              {/* 주소 */}
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">주소</p>
                    <p className="text-base text-foreground break-words">{address}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="mt-2 h-8"
                      aria-label={`${address} 주소 복사`}
                      aria-pressed={addressCopied}
                    >
                      {addressCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 전화번호 */}
              {detail.tel && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">전화번호</p>
                    <a
                      href={`tel:${detail.tel.replace(/[^0-9-]/g, "")}`}
                      className="text-base text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`${detail.tel}로 전화하기`}
                    >
                      {detail.tel}
                    </a>
                  </div>
                </div>
              )}

              {/* 홈페이지 */}
              {homepageData && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">홈페이지</p>
                    <a
                      href={homepageData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded break-all"
                      aria-label={`${homepageData.displayText} 홈페이지 새 창에서 열기`}
                    >
                      {homepageData.displayText}
                      <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 오른쪽 컬럼: 개요 */}
        <div className="space-y-6">
          {detail.overview && (
            <section aria-label="개요">
              <h2 className="text-xl font-semibold mb-4 text-foreground">개요</h2>
              <div className="bg-card rounded-lg border border-border p-6">
                {renderOverview()}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

