/**
 * @file detail-map.tsx
 * @description 관광지 위치 지도 섹션 컴포넌트
 *
 * 관광지의 위치를 네이버 지도에 단일 마커로 표시하고, 길찾기 기능을 제공합니다.
 *
 * 주요 기능:
 * - 해당 관광지 위치를 네이버 지도에 표시
 * - 마커 1개 표시
 * - 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * - 좌표 정보 표시 및 복사
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.4 지도 섹션
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { convertKATECToWGS84 } from "@/lib/utils/coordinate";
import type { TourDetail } from "@/lib/types/tour";
import { Loader2, MapPin, Navigation, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver: typeof naver;
  }
}

interface DetailMapProps {
  detail: TourDetail;
}

/**
 * 관광지 위치 지도 컴포넌트
 */
export default function DetailMap({ detail }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [coordinateCopied, setCoordinateCopied] = useState(false);

  // Naver Maps API 클라이언트 ID
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // 좌표 변환
  useEffect(() => {
    if (detail.mapx && detail.mapy) {
      const coord = convertKATECToWGS84(detail.mapx, detail.mapy);
      setCoordinates(coord);
    } else {
      setError("좌표 정보가 없습니다.");
      setIsLoading(false);
    }
  }, [detail.mapx, detail.mapy]);

  // 스크립트 로드 완료 핸들러
  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // 스크립트 로드 에러 핸들러
  const handleScriptError = () => {
    setError("네이버 지도 API를 로드할 수 없습니다. API 키를 확인해주세요.");
    setIsLoading(false);
  };

  // 지도 초기화 및 마커 생성
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || !clientId || !coordinates) {
      if (!clientId) {
        setError("네이버 지도 API 키가 설정되지 않았습니다.");
        setIsLoading(false);
      }
      return;
    }

    try {
      const centerLatLng = new naver.maps.LatLng(coordinates.lat, coordinates.lng);

      // 지도 생성
      const map = new naver.maps.Map(mapRef.current, {
        center: centerLatLng,
        zoom: 15, // 상세 위치를 위한 줌 레벨
        mapTypeControl: false,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // 마커 생성
      const marker = new naver.maps.Marker({
        position: centerLatLng,
        map,
        title: detail.title,
        icon: {
          content: getMarkerIcon(),
          anchor: new naver.maps.Point(12, 34),
        },
      });

      markerRef.current = marker;

      // 인포윈도우 생성
      const address = detail.addr2 ? `${detail.addr1} ${detail.addr2}` : detail.addr1;
      const infoWindow = new naver.maps.InfoWindow({
        content: getInfoWindowContent(detail.title, address),
      });

      infoWindowRef.current = infoWindow;

      // 마커 클릭 시 인포윈도우 열기
      naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(map, marker);
      });

      // 초기 인포윈도우 열기
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 300);

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("지도 초기화 실패:", err);
      setError("지도를 초기화할 수 없습니다.");
      setIsLoading(false);
    }
  }, [isScriptLoaded, clientId, coordinates, detail]);

  /**
   * 마커 아이콘 생성 (SVG)
   */
  const getMarkerIcon = () => {
    const color = "#ef4444"; // 빨간색 마커
    return `
      <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `;
  };

  /**
   * HTML 이스케이프 함수 (XSS 방지)
   */
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * 인포윈도우 콘텐츠 생성
   */
  const getInfoWindowContent = (title: string, address: string) => {
    const escapedTitle = escapeHtml(title);
    const escapedAddress = escapeHtml(address || "주소 정보 없음");
    return `
      <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
          ${escapedTitle}
        </h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          ${escapedAddress}
        </p>
      </div>
    `;
  };

  /**
   * 길찾기 버튼 클릭 핸들러
   */
  const handleDirections = () => {
    if (!coordinates) return;

    // 네이버 지도 길찾기 URL
    const url = `https://map.naver.com/v5/directions/${coordinates.lat},${coordinates.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /**
   * 좌표 복사 핸들러
   */
  const handleCopyCoordinates = async () => {
    if (!coordinates) return;

    const coordText = `${coordinates.lat}, ${coordinates.lng}`;

    try {
      if (typeof window !== "undefined" && window.isSecureContext) {
        await navigator.clipboard.writeText(coordText);
        setCoordinateCopied(true);
        toast.success("좌표가 복사되었습니다.");
        setTimeout(() => setCoordinateCopied(false), 2000);
      } else {
        // HTTPS가 아닌 경우 fallback
        const textArea = document.createElement("textarea");
        textArea.value = coordText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCoordinateCopied(true);
        toast.success("좌표가 복사되었습니다.");
        setTimeout(() => setCoordinateCopied(false), 2000);
      }
    } catch (err) {
      console.error("좌표 복사 실패:", err);
      toast.error("좌표 복사에 실패했습니다.");
    }
  };

  if (!clientId) {
    return (
      <section
        className="container max-w-7xl mx-auto px-4 py-8"
        aria-label="위치 정보"
      >
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">위치 정보</h2>
          <div className="flex items-center justify-center h-[400px] md:h-[500px] bg-muted rounded-lg border border-border">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                네이버 지도 API 키가 설정되지 않았습니다.
              </p>
              <p className="text-xs text-muted-foreground">
                NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 설정해주세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Naver Maps API 스크립트 로드 */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      <section
        className="container max-w-7xl mx-auto px-4 py-8"
        aria-label="위치 정보"
      >
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">위치 정보</h2>

          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg border border-border overflow-hidden bg-muted">
            {/* 지도 컨테이너 */}
            <div ref={mapRef} className="w-full h-full" aria-label="네이버 지도" />

            {/* 로딩 상태 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
                </div>
              </div>
            )}

            {/* 에러 상태 */}
            {error && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center space-y-2 px-4">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          {coordinates && !error && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={handleDirections}
                className="flex items-center gap-2"
                aria-label="길찾기"
              >
                <Navigation className="w-4 h-4" />
                길찾기
              </Button>

              {/* 좌표 정보 표시 및 복사 */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCoordinates}
                  className="h-8 px-2"
                  aria-label="좌표 복사"
                  aria-pressed={coordinateCopied}
                >
                  {coordinateCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}


