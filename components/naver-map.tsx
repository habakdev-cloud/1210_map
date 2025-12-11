/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps API v3 (NCP)를 사용하여 관광지 목록을 지도에 마커로 표시합니다.
 * 리스트와 지도를 양방향으로 연동하여 선택된 관광지를 강조 표시합니다.
 *
 * 주요 기능:
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우 표시
 * - 선택된 관광지 마커 강조
 * - 지도 컨트롤 (줌 인/아웃, 지도 유형 선택)
 *
 * @see {@link /docs/PRD.md} - MVP 2.2 네이버 지도 연동
 * @see {@link /docs/DESIGN.md} - 레이아웃 및 디자인 시스템
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { convertKATECToWGS84 } from "@/lib/utils/coordinate";
import { calculateCenterFromTours } from "@/lib/utils/map-utils";
import type { TourItem } from "@/lib/types/tour";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map, Satellite } from "lucide-react";

// Naver Maps API 타입 정의
type NaverMap = any;
type NaverMarker = any;
type NaverInfoWindow = any;

declare global {
  interface Window {
    naver: {
      maps: {
        LatLng: new (lat: number, lng: number) => any;
        Map: new (element: HTMLElement, options: any) => NaverMap;
        Marker: new (options: any) => NaverMarker;
        InfoWindow: new (options: any) => NaverInfoWindow;
        Point: new (x: number, y: number) => any;
        Event: {
          addListener: (
            target: any,
            event: string,
            handler: () => void,
          ) => void;
          removeListener: (
            target: any,
            event: string,
            handler: () => void,
          ) => void;
        };
        MapTypeId: {
          NORMAL: string;
          SATELLITE: string;
        };
      };
    };
  }
}

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 마커 클릭 시 콜백 */
  onMarkerClick?: (tourId: string) => void;
  /** 지도 유형 (normal, satellite) */
  mapType?: "normal" | "satellite";
  /** 지도 유형 변경 콜백 */
  onMapTypeChange?: (mapType: "normal" | "satellite") => void;
}

/**
 * 네이버 지도 컴포넌트
 */
export default function NaverMap({
  tours,
  selectedTourId,
  onMarkerClick,
  mapType = "normal",
  onMapTypeChange,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const infoWindowsRef = useRef<NaverInfoWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Naver Maps API 클라이언트 ID
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // 스크립트 로드 완료 핸들러
  const handleScriptLoad = () => {
    // 스크립트가 로드되었지만 naver 객체가 있는지 확인
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      setIsScriptLoaded(true);
    } else {
      console.error(
        "네이버 지도 API 스크립트는 로드되었지만 naver 객체를 찾을 수 없습니다.",
      );
      setError(
        "네이버 지도 API를 초기화할 수 없습니다. API 키와 서비스 설정을 확인해주세요.",
      );
      setIsLoading(false);
    }
  };

  // 스크립트 로드 에러 핸들러
  const handleScriptError = (error?: Error | string) => {
    console.error("네이버 지도 API 스크립트 로드 실패:", error);
    setError(
      "네이버 지도 API를 로드할 수 없습니다. Vercel 환경변수에서 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 확인해주세요.",
    );
    setIsLoading(false);
  };

  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || !clientId) {
      if (!clientId) {
        setError(
          "네이버 지도 API 키가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.",
        );
        setIsLoading(false);
      }
      return;
    }

    // naver 객체 확인
    if (typeof window === "undefined" || !window.naver || !window.naver.maps) {
      console.error("naver.maps 객체를 찾을 수 없습니다.");
      setError(
        "네이버 지도 API가 로드되지 않았습니다. 페이지를 새로고침해주세요.",
      );
      setIsLoading(false);
      return;
    }

    try {
      // 중심 좌표 계산
      const center = calculateCenterFromTours(tours);
      const centerLatLng = new naver.maps.LatLng(center.lat, center.lng);

      // 지도 생성
      const map = new naver.maps.Map(mapRef.current, {
        center: centerLatLng,
        zoom: tours.length > 0 ? 10 : 7, // 관광지가 있으면 줌 10, 없으면 7
        mapTypeControl: false, // 기본 컨트롤 숨김 (커스텀 컨트롤 사용)
        zoomControl: false, // 기본 컨트롤 숨김 (커스텀 컨트롤 사용)
      });

      mapInstanceRef.current = map;
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("지도 초기화 실패:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`지도를 초기화할 수 없습니다: ${errorMessage}`);
      setIsLoading(false);
    }
  }, [isScriptLoaded, clientId, tours]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !isScriptLoaded) return;

    const map = mapInstanceRef.current;

    // 기존 마커 및 인포윈도우 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 관광지가 없는 경우 종료
    if (tours.length === 0) {
      console.log("관광지 목록이 비어있습니다.");
      return;
    }

    console.log(`마커 생성 시작: ${tours.length}개 관광지`);

    let successCount = 0;
    let failCount = 0;

    // 마커 생성
    tours.forEach((tour) => {
      if (!tour.mapx || !tour.mapy) {
        console.warn("좌표가 없는 관광지:", tour.contentid, tour.title);
        failCount++;
        return;
      }

      try {
        // 좌표 변환
        const coord = convertKATECToWGS84(tour.mapx, tour.mapy);
        console.log(`관광지 ${tour.title} 좌표 변환:`, {
          원본: { mapx: tour.mapx, mapy: tour.mapy },
          변환: coord,
        });

        const position = new naver.maps.LatLng(coord.lat, coord.lng);

        // 마커 생성
        const marker = new naver.maps.Marker({
          position,
          map,
          title: tour.title,
          icon: {
            content: getMarkerIcon(
              tour.contenttypeid,
              tour.contentid === selectedTourId,
            ),
            anchor: new naver.maps.Point(12, 34),
          },
        });

        // 인포윈도우 생성
        const infoWindow = new naver.maps.InfoWindow({
          content: getInfoWindowContent(tour),
        });

        // 마커 클릭 이벤트
        naver.maps.Event.addListener(marker, "click", () => {
          // 다른 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => {
            if (iw !== infoWindow) iw.close();
          });

          // 인포윈도우 열기
          infoWindow.open(map, marker);

          // 콜백 호출
          if (onMarkerClick) {
            onMarkerClick(tour.contentid);
          }
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
        successCount++;
      } catch (err) {
        console.error("마커 생성 실패:", tour.contentid, tour.title, err);
        failCount++;
      }
    });

    console.log(
      `마커 생성 완료: 성공 ${successCount}개, 실패 ${failCount}개, 총 ${markersRef.current.length}개 마커`,
    );
  }, [tours, selectedTourId, isScriptLoaded, onMarkerClick]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !isScriptLoaded || !selectedTourId) return;

    const map = mapInstanceRef.current;
    const selectedTour = tours.find(
      (tour) => tour.contentid === selectedTourId,
    );

    if (!selectedTour || !selectedTour.mapx || !selectedTour.mapy) return;

    try {
      // 좌표 변환
      const coord = convertKATECToWGS84(selectedTour.mapx, selectedTour.mapy);
      const position = new naver.maps.LatLng(coord.lat, coord.lng);

      // 지도 중심 이동 및 줌 조정
      map.setCenter(position);
      map.setZoom(15, true); // true: 애니메이션 사용

      // 해당 마커의 인포윈도우 열기
      const markerIndex = markersRef.current.findIndex(
        (marker) => marker.getTitle() === selectedTour.title,
      );

      if (markerIndex !== -1 && infoWindowsRef.current[markerIndex]) {
        // 다른 인포윈도우 닫기
        infoWindowsRef.current.forEach((iw, index) => {
          if (index !== markerIndex) iw.close();
        });

        // 약간의 지연을 두어 지도 이동 후 인포윈도우 열기
        setTimeout(() => {
          infoWindowsRef.current[markerIndex].open(
            map,
            markersRef.current[markerIndex],
          );
        }, 300);
      }
    } catch (err) {
      console.error("지도 이동 실패:", selectedTourId, err);
    }
  }, [selectedTourId, tours, isScriptLoaded]);

  // 지도 유형 변경
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const mapTypeId =
      mapType === "satellite"
        ? naver.maps.MapTypeId.SATELLITE
        : naver.maps.MapTypeId.NORMAL;
    map.setMapTypeId(mapTypeId);
  }, [mapType]);

  // 줌 인
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  // 줌 아웃
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  // 지도 유형 토글
  const handleMapTypeToggle = () => {
    if (onMapTypeChange) {
      onMapTypeChange(mapType === "normal" ? "satellite" : "normal");
    }
  };

  // 마커 아이콘 생성 (SVG)
  const getMarkerIcon = (contentTypeId: string, isSelected: boolean) => {
    const color = isSelected ? "#ef4444" : "#3b82f6"; // 선택: 빨강, 기본: 파랑
    return `
      <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `;
  };

  // HTML 이스케이프 함수 (XSS 방지)
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // 인포윈도우 콘텐츠 생성
  const getInfoWindowContent = (tour: TourItem) => {
    const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
    const escapedTitle = escapeHtml(tour.title);
    const escapedAddress = escapeHtml(address || "주소 정보 없음");
    const escapedContentId = escapeHtml(tour.contentid);
    return `
      <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
          ${escapedTitle}
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
          ${escapedAddress}
        </p>
        <a 
          href="/places/${escapedContentId}" 
          style="display: inline-block; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;"
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          상세보기
        </a>
      </div>
    `;
  };

  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-[400px] md:h-[600px] bg-muted rounded-lg border border-border">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            네이버 지도 API 키가 설정되지 않았습니다.
          </p>
          <p className="text-xs text-muted-foreground">
            NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 설정해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Naver Maps API 스크립트 로드 */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={(e) => handleScriptError(e)}
        onReady={() => {
          // 스크립트가 준비되었을 때 naver 객체 확인
          if (
            typeof window !== "undefined" &&
            window.naver &&
            window.naver.maps
          ) {
            console.log("네이버 지도 API 로드 완료");
          }
        }}
      />

      <div className="relative w-full h-[400px] md:h-[600px] rounded-lg border border-border overflow-hidden bg-muted">
        {/* 지도 컨테이너 */}
        <div ref={mapRef} className="w-full h-full" aria-label="네이버 지도" />

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                지도를 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center space-y-3 px-4 max-w-md">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              {!clientId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Vercel 대시보드 → Settings → Environment Variables에서
                  <br />
                  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정해주세요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 지도 컨트롤 */}
        {!isLoading && !error && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {/* 줌 컨트롤 */}
            <div className="flex flex-col bg-background border border-border rounded-lg shadow-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="rounded-none"
                aria-label="줌 인"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="border-t border-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="rounded-none"
                aria-label="줌 아웃"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {/* 지도 유형 선택 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMapTypeToggle}
              className="bg-background border border-border shadow-md"
              aria-label={
                mapType === "normal" ? "위성 지도로 전환" : "일반 지도로 전환"
              }
            >
              {mapType === "normal" ? (
                <Satellite className="w-4 h-4" />
              ) : (
                <Map className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
