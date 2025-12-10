/**
 * @file coordinate.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계를 WGS84 좌표계로 변환합니다.
 * KATEC 좌표는 정수형으로 저장되어 있으며, 10000000으로 나누어 변환합니다.
 *
 * @see {@link /docs/PRD.md} - 기술 요구사항: 좌표 데이터
 */

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns WGS84 좌표계 { lat: number, lng: number }
 *
 * @example
 * ```ts
 * const { lat, lng } = convertKATECToWGS84("1270455151", "377533531");
 * // lat: 37.7533531, lng: 127.0455151
 * ```
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string
): { lat: number; lng: number } {
  // 좌표가 없거나 빈 문자열인 경우 기본값 반환
  if (!mapx || !mapy || mapx.trim() === "" || mapy.trim() === "") {
    console.warn("좌표가 없습니다. 기본값(한국 중심)을 반환합니다.");
    return { lat: 36.5, lng: 127.5 }; // 한국 중심 좌표
  }

  try {
    // KATEC 좌표를 숫자로 변환
    const x = parseFloat(mapx);
    const y = parseFloat(mapy);

    // 유효하지 않은 숫자인 경우 기본값 반환
    if (isNaN(x) || isNaN(y)) {
      console.warn("유효하지 않은 좌표입니다. 기본값을 반환합니다.", { mapx, mapy });
      return { lat: 36.5, lng: 127.5 };
    }

    // 좌표 형식 판단: 소수점 형태(이미 WGS84)인지 정수 형태(KATEC)인지 확인
    // 한국 영역 좌표는 경도 124-132, 위도 33-43 범위
    // 소수점 형태면 이미 WGS84, 정수 형태면 KATEC로 판단
    let lng: number;
    let lat: number;

    if (Math.abs(x) < 200 && Math.abs(y) < 200) {
      // 소수점 형태 (이미 WGS84 좌표)
      lng = x;
      lat = y;
    } else {
      // 정수 형태 (KATEC 좌표) - 10000000으로 나누어 변환
      lng = x / 10000000;
      lat = y / 10000000;
    }

    // 좌표 범위 검증 (한국 영역: 위도 33-43, 경도 124-132)
    if (lat < 33 || lat > 43 || lng < 124 || lng > 132) {
      console.warn("한국 영역을 벗어난 좌표입니다.", { 
        원본: { mapx, mapy }, 
        변환: { lat, lng } 
      });
      // 경고만 출력하고 변환된 좌표는 반환 (데이터 오류일 수 있음)
    }

    return { lat, lng };
  } catch (error) {
    console.error("좌표 변환 중 오류 발생:", error, { mapx, mapy });
    return { lat: 36.5, lng: 127.5 }; // 에러 시 기본값 반환
  }
}

