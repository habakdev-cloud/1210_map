/**
 * @file map-utils.ts
 * @description 지도 관련 유틸리티 함수
 *
 * 관광지 목록의 중심 좌표를 계산하고, 지도 초기화에 필요한 좌표를 제공합니다.
 *
 * @see {@link /docs/PRD.md} - MVP 2.2 네이버 지도 연동
 */

import { convertKATECToWGS84 } from "./coordinate";
import type { TourItem } from "@/lib/types/tour";

/**
 * 관광지 목록의 중심 좌표를 계산
 *
 * 관광지 목록의 모든 좌표의 평균값을 계산하여 중심 좌표를 반환합니다.
 * 빈 목록이거나 유효한 좌표가 없는 경우 한국 중심 좌표를 반환합니다.
 *
 * @param tours - 관광지 목록
 * @returns 중심 좌표 { lat: number, lng: number }
 *
 * @example
 * ```ts
 * const center = calculateCenterFromTours(tours);
 * // { lat: 37.5, lng: 127.0 }
 * ```
 */
export function calculateCenterFromTours(
  tours: TourItem[]
): { lat: number; lng: number } {
  // 빈 목록인 경우 기본값 반환
  if (!tours || tours.length === 0) {
    return { lat: 36.5, lng: 127.5 }; // 한국 중심 좌표
  }

  // 유효한 좌표를 가진 관광지만 필터링
  const validCoords: { lat: number; lng: number }[] = [];

  for (const tour of tours) {
    if (tour.mapx && tour.mapy) {
      try {
        const coord = convertKATECToWGS84(tour.mapx, tour.mapy);
        // 한국 영역 내 좌표만 사용 (위도 33-43, 경도 124-132)
        if (coord.lat >= 33 && coord.lat <= 43 && coord.lng >= 124 && coord.lng <= 132) {
          validCoords.push(coord);
        }
      } catch (error) {
        // 좌표 변환 실패 시 해당 관광지 제외
        console.warn("좌표 변환 실패:", tour.contentid, error);
      }
    }
  }

  // 유효한 좌표가 없는 경우 기본값 반환
  if (validCoords.length === 0) {
    return { lat: 36.5, lng: 127.5 };
  }

  // 평균 좌표 계산
  const sumLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
  const sumLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0);

  return {
    lat: sumLat / validCoords.length,
    lng: sumLng / validCoords.length,
  };
}

/**
 * 관광지 목록의 경계 박스(Bounding Box) 계산
 *
 * 관광지 목록의 최소/최대 좌표를 계산하여 경계 박스를 반환합니다.
 * 지도 줌 레벨 설정에 활용할 수 있습니다.
 *
 * @param tours - 관광지 목록
 * @returns 경계 박스 { minLat, maxLat, minLng, maxLng } 또는 null
 */
export function calculateBoundsFromTours(tours: TourItem[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (!tours || tours.length === 0) {
    return null;
  }

  const validCoords: { lat: number; lng: number }[] = [];

  for (const tour of tours) {
    if (tour.mapx && tour.mapy) {
      try {
        const coord = convertKATECToWGS84(tour.mapx, tour.mapy);
        if (coord.lat >= 33 && coord.lat <= 43 && coord.lng >= 124 && coord.lng <= 132) {
          validCoords.push(coord);
        }
      } catch (error) {
        // 좌표 변환 실패 시 제외
      }
    }
  }

  if (validCoords.length === 0) {
    return null;
  }

  const lats = validCoords.map((coord) => coord.lat);
  const lngs = validCoords.map((coord) => coord.lng);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}





