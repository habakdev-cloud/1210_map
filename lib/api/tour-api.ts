/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 한국관광공사 KorService2 API를 호출하는 함수들을 제공합니다.
 * 서버 사이드와 클라이언트 사이드 모두에서 사용 가능합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회
 * 2. 지역 기반 관광지 목록 조회
 * 3. 키워드 검색
 * 4. 관광지 상세 정보 조회
 * 5. 운영 정보 조회
 * 6. 이미지 목록 조회
 * 7. 반려동물 정보 조회
 *
 * @see {@link /docs/PRD.md} - API 명세 참고
 */

import type {
  AreaCode,
  AreaCodeResponse,
  AreaBasedListResponse,
  SearchKeywordResponse,
  DetailCommonResponse,
  DetailIntroResponse,
  DetailImageResponse,
  DetailPetTourResponse,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  TourItem,
  PaginationResponse,
  PaginationMetadata,
} from "@/lib/types/tour";

/**
 * Base URL for 한국관광공사 API
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/**
 * API 키 가져오기 (서버/클라이언트 구분)
 */
function getApiKey(): string {
  // 서버 사이드: TOUR_API_KEY 우선, 없으면 NEXT_PUBLIC_TOUR_API_KEY
  // 클라이언트 사이드: NEXT_PUBLIC_TOUR_API_KEY
  const serverKey = typeof window === "undefined" ? process.env.TOUR_API_KEY : undefined;
  const clientKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  const apiKey = serverKey || clientKey;

  if (!apiKey) {
    throw new Error(
      "Tour API key is missing. Please set TOUR_API_KEY (server) or NEXT_PUBLIC_TOUR_API_KEY (client) in your environment variables."
    );
  }

  return apiKey;
}

/**
 * API URL 생성 헬퍼 함수
 */
function buildApiUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
  const apiKey = getApiKey();
  const urlParams = new URLSearchParams({
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
    ),
  });

  return `${BASE_URL}${endpoint}?${urlParams.toString()}`;
}

/**
 * API 호출 헬퍼 함수 (재시도 로직 포함)
 */
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let lastStatusCode: number | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Next.js에서 캐싱 제어 (서버 사이드)
        ...(typeof window === "undefined" && {
          next: { revalidate: 86400 }, // 24시간 캐싱 (통계 데이터 최적화)
        }),
      });

      if (!response.ok) {
        lastStatusCode = response.status;
        // 429 (Too Many Requests) 에러는 특별 처리
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, attempt + 2);
          throw new Error(`HTTP 429 (Rate Limit): ${waitTime}ms 대기 필요`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: T = await response.json();

      // API 에러 응답 체크 (에러 응답은 response 속성이 없고 직접 resultCode를 가짐)
      if (data && typeof data === "object") {
        // 에러 응답 구조: { responseTime, resultCode, resultMsg }
        if ("resultCode" in data && "resultMsg" in data && !("response" in data)) {
          const errorResponse = data as { resultCode: string; resultMsg: string };
          if (errorResponse.resultCode !== "0000") {
            throw new Error(
              `API error: ${errorResponse.resultCode} - ${errorResponse.resultMsg}`
            );
          }
        }
        
        // 정상 응답 구조: { response: { header: { resultCode, resultMsg }, body: {...} } }
        if ("response" in data) {
          const apiResponse = data as { response?: { header?: { resultCode?: string; resultMsg?: string } } };
          if (apiResponse.response?.header?.resultCode && apiResponse.response.header.resultCode !== "0000") {
            throw new Error(
              `API error: ${apiResponse.response.header.resultCode} - ${apiResponse.response.header.resultMsg || "Unknown error"}`
            );
          }
        }
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        lastError = error;
      } else {
        const errorMessage = error ? String(error) : 'Unknown error';
        lastError = new Error(errorMessage);
      }

      // 마지막 시도가 아니면 재시도
      if (attempt < maxRetries) {
        // 429 에러인 경우 더 긴 대기 시간
        let waitTime: number;
        if (lastStatusCode === 429 || lastError?.message.includes("429")) {
          // 429 에러: Retry-After 헤더 값 추출 또는 기본 5초
          const retryAfterMatch = lastError?.message.match(/(\d+)ms/);
          waitTime = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 5000;
          console.warn(`⚠️ Rate Limit 감지, ${waitTime}ms 대기 후 재시도 (${attempt + 1}/${maxRetries})`);
        } else {
          // 일반 에러: 지수 백오프
          waitTime = delay * Math.pow(2, attempt);
          console.warn(`API 호출 실패, ${waitTime}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
        }
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error("Unknown error occurred");
}

/**
 * 응답 데이터 정규화 (단일 항목을 배열로 변환)
 */
function normalizeItems<T>(items: T | T[] | undefined): T[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

/**
 * 지역코드 조회
 *
 * @param areaCode - 상위 지역 코드 (옵션, 시/도 코드 입력 시 시/군/구 목록 반환)
 * @returns 지역코드 목록
 *
 * @example
 * ```ts
 * // 시/도 목록 조회
 * const areaCodes = await getAreaCode();
 *
 * // 특정 시/도의 시/군/구 목록 조회
 * const sigunguCodes = await getAreaCode("1"); // 서울
 * ```
 */
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  try {
    const url = buildApiUrl("/areaCode2", areaCode ? { areaCode } : {});
    const response = await fetchWithRetry<AreaCodeResponse>(url);
    return normalizeItems(response.response.body.items?.item);
  } catch (error) {
    console.error("지역코드 조회 실패:", error);
    throw error;
  }
}

/**
 * 지역 기반 관광지 목록 조회
 *
 * @param params - 조회 파라미터
 * @param params.areaCode - 지역 코드 (옵션)
 * @param params.contentTypeId - 콘텐츠 타입 ID (옵션, 12:관광지, 14:문화시설 등)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @param params.listYN - 목록 구분 (Y: 목록, N: 개수만, 기본값: Y)
 * @returns 관광지 목록
 *
 * @example
 * ```ts
 * // 서울 지역 관광지 목록 조회
 * const items = await getAreaBasedList({ areaCode: "1", contentTypeId: "12" });
 * ```
 */
export async function getAreaBasedList(params: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourItem[]> {
  try {
    const {
      areaCode,
      contentTypeId,
      numOfRows = 10,
      pageNo = 1,
    } = params;

    // listYN 파라미터 제거 (한국관광공사 API에서 지원하지 않음)
    const url = buildApiUrl("/areaBasedList2", {
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    const response = await fetchWithRetry<AreaBasedListResponse>(url);
    
    // 응답 구조 확인 및 안전하게 접근
    if (!response) {
      console.error("API 응답이 없습니다");
      throw new Error("API 응답이 없습니다");
    }
    
    // 정상 응답인지 확인
    if (!("response" in response)) {
      console.error("API 응답 구조가 올바르지 않습니다:", response);
      throw new Error("API 응답 구조가 올바르지 않습니다: response 속성 없음");
    }
    
    if (!response.response || !response.response.body) {
      console.error("API 응답에 body 속성이 없습니다:", response.response);
      throw new Error("API 응답 구조가 올바르지 않습니다: body 속성 없음");
    }
    
    const items = response.response.body.items?.item;
    if (!items) {
      console.warn("API 응답에 items가 없습니다:", response.response.body);
      return [];
    }
    
    return normalizeItems(items);
  } catch (error) {
    console.error("지역 기반 목록 조회 실패:", error);
    throw error;
  }
}

/**
 * 지역 기반 관광지 목록 조회 (페이지네이션 메타데이터 포함)
 *
 * @param params - 조회 파라미터
 * @param params.areaCode - 지역 코드 (옵션)
 * @param params.contentTypeId - 콘텐츠 타입 ID (옵션)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 페이지네이션 메타데이터를 포함한 관광지 목록
 *
 * @example
 * ```ts
 * const result = await getAreaBasedListWithPagination({ areaCode: "1" });
 * console.log(result.items); // TourItem[]
 * console.log(result.pagination.totalCount); // 전체 개수
 * ```
 */
export async function getAreaBasedListWithPagination(params: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<PaginationResponse<TourItem>> {
  try {
    const {
      areaCode,
      contentTypeId,
      numOfRows = 10,
      pageNo = 1,
    } = params;

    const url = buildApiUrl("/areaBasedList2", {
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    const response = await fetchWithRetry<AreaBasedListResponse>(url);
    
    if (!response || !("response" in response) || !response.response?.body) {
      throw new Error("API 응답 구조가 올바르지 않습니다");
    }

    const items = response.response.body.items?.item;
    if (!items) {
      return {
        items: [],
        pagination: {
          pageNo,
          numOfRows,
          totalCount: 0,
          totalPages: 0,
        },
      };
    }

    const normalizedItems = normalizeItems(items);
    
    // 페이지네이션 메타데이터 추출
    const body = response.response.body;
    const totalCount = body.totalCount || 0;
    const currentPageNo = body.pageNo || pageNo;
    const currentNumOfRows = body.numOfRows || numOfRows;
    const totalPages = currentNumOfRows > 0 ? Math.ceil(totalCount / currentNumOfRows) : 0;

    return {
      items: normalizedItems,
      pagination: {
        pageNo: currentPageNo,
        numOfRows: currentNumOfRows,
        totalCount,
        totalPages,
      },
    };
  } catch (error) {
    console.error("지역 기반 목록 조회 실패:", error);
    throw error;
  }
}

/**
 * 키워드 검색
 *
 * @param params - 검색 파라미터
 * @param params.keyword - 검색 키워드 (필수)
 * @param params.areaCode - 지역 코드 (옵션)
 * @param params.contentTypeId - 콘텐츠 타입 ID (옵션)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 검색 결과 목록
 *
 * @example
 * ```ts
 * // "해운대" 키워드 검색
 * const results = await searchKeyword({ keyword: "해운대" });
 * ```
 */
export async function searchKeyword(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourItem[]> {
  try {
    const { keyword, areaCode, contentTypeId, numOfRows = 10, pageNo = 1 } = params;

    if (!keyword || keyword.trim().length === 0) {
      throw new Error("검색 키워드는 필수입니다.");
    }

    const url = buildApiUrl("/searchKeyword2", {
      keyword: keyword.trim(),
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    const response = await fetchWithRetry<SearchKeywordResponse>(url);
    return normalizeItems(response.response.body.items?.item);
  } catch (error) {
    console.error("키워드 검색 실패:", error);
    throw error;
  }
}

/**
 * 키워드 검색 (페이지네이션 메타데이터 포함)
 *
 * @param params - 검색 파라미터
 * @param params.keyword - 검색 키워드 (필수)
 * @param params.areaCode - 지역 코드 (옵션)
 * @param params.contentTypeId - 콘텐츠 타입 ID (옵션)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 페이지네이션 메타데이터를 포함한 검색 결과
 */
export async function searchKeywordWithPagination(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<PaginationResponse<TourItem>> {
  try {
    const { keyword, areaCode, contentTypeId, numOfRows = 10, pageNo = 1 } = params;

    if (!keyword || keyword.trim().length === 0) {
      throw new Error("검색 키워드는 필수입니다.");
    }

    const url = buildApiUrl("/searchKeyword2", {
      keyword: keyword.trim(),
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    });

    const response = await fetchWithRetry<SearchKeywordResponse>(url);
    
    if (!response || !("response" in response) || !response.response?.body) {
      throw new Error("API 응답 구조가 올바르지 않습니다");
    }

    const items = response.response.body.items?.item;
    if (!items) {
      return {
        items: [],
        pagination: {
          pageNo,
          numOfRows,
          totalCount: 0,
          totalPages: 0,
        },
      };
    }

    const normalizedItems = normalizeItems(items);
    
    // 페이지네이션 메타데이터 추출
    const body = response.response.body;
    const totalCount = body.totalCount || 0;
    const currentPageNo = body.pageNo || pageNo;
    const currentNumOfRows = body.numOfRows || numOfRows;
    const totalPages = currentNumOfRows > 0 ? Math.ceil(totalCount / currentNumOfRows) : 0;

    return {
      items: normalizedItems,
      pagination: {
        pageNo: currentPageNo,
        numOfRows: currentNumOfRows,
        totalCount,
        totalPages,
      },
    };
  } catch (error) {
    console.error("키워드 검색 실패:", error);
    throw error;
  }
}

/**
 * 관광지 상세 정보 조회
 *
 * @param params - 조회 파라미터
 * @param params.contentId - 콘텐츠 ID (필수)
 * @param params.defaultYN - 기본 정보 포함 여부 (기본값: Y)
 * @param params.firstImageYN - 대표 이미지 포함 여부 (기본값: Y)
 * @param params.areacodeYN - 지역코드 포함 여부 (기본값: Y)
 * @param params.catcodeYN - 카테고리 코드 포함 여부 (기본값: Y)
 * @param params.addrinfoYN - 주소 정보 포함 여부 (기본값: Y)
 * @param params.mapinfoYN - 지도 정보 포함 여부 (기본값: Y)
 * @param params.overviewYN - 개요 포함 여부 (기본값: Y)
 * @returns 상세 정보
 *
 * @example
 * ```ts
 * const detail = await getDetailCommon({ contentId: "125266" });
 * ```
 */
export async function getDetailCommon(params: {
  contentId: string;
  defaultYN?: "Y" | "N";
  firstImageYN?: "Y" | "N";
  areacodeYN?: "Y" | "N";
  catcodeYN?: "Y" | "N";
  addrinfoYN?: "Y" | "N";
  mapinfoYN?: "Y" | "N";
  overviewYN?: "Y" | "N";
}): Promise<TourDetail | null> {
  try {
    const {
      contentId,
      defaultYN = "Y",
      firstImageYN = "Y",
      areacodeYN = "Y",
      catcodeYN = "Y",
      addrinfoYN = "Y",
      mapinfoYN = "Y",
      overviewYN = "Y",
    } = params;

    if (!contentId) {
      throw new Error("콘텐츠 ID는 필수입니다.");
    }

    // detailCommon2는 contentId만 필수, 나머지는 선택적 파라미터
    // API에서 지원하지 않는 파라미터는 제외
    // detailCommon2는 contentId만 필수 파라미터
    // 선택적 파라미터들은 API가 지원하지 않을 수 있으므로 제외
    const url = buildApiUrl("/detailCommon2", {
      contentId,
    });

    const response = await fetchWithRetry<DetailCommonResponse>(url);
    const items = normalizeItems(response.response.body.items?.item);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("상세 정보 조회 실패:", error);
    throw error;
  }
}

/**
 * 관광지 운영 정보 조회
 *
 * @param params - 조회 파라미터
 * @param params.contentId - 콘텐츠 ID (필수)
 * @param params.contentTypeId - 콘텐츠 타입 ID (필수)
 * @returns 운영 정보
 *
 * @example
 * ```ts
 * const intro = await getDetailIntro({ contentId: "125266", contentTypeId: "12" });
 * ```
 */
export async function getDetailIntro(params: {
  contentId: string;
  contentTypeId: string;
}): Promise<TourIntro | null> {
  try {
    const { contentId, contentTypeId } = params;

    if (!contentId || !contentTypeId) {
      throw new Error("콘텐츠 ID와 콘텐츠 타입 ID는 필수입니다.");
    }

    const url = buildApiUrl("/detailIntro2", {
      contentId,
      contentTypeId,
    });

    const response = await fetchWithRetry<DetailIntroResponse>(url);
    const items = normalizeItems(response.response.body.items?.item);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("운영 정보 조회 실패:", error);
    throw error;
  }
}

/**
 * 관광지 이미지 목록 조회
 *
 * @param params - 조회 파라미터
 * @param params.contentId - 콘텐츠 ID (필수)
 * @returns 이미지 목록
 *
 * @example
 * ```ts
 * const images = await getDetailImage({ contentId: "125266" });
 * ```
 */
export async function getDetailImage(params: {
  contentId: string;
}): Promise<TourImage[]> {
  try {
    const { contentId } = params;

    if (!contentId) {
      throw new Error("콘텐츠 ID는 필수입니다.");
    }

    // detailImage2는 contentId만 필수 파라미터
    // imageYN, subImageYN 파라미터는 API에서 지원하지 않거나 오류를 발생시킴
    const url = buildApiUrl("/detailImage2", {
      contentId,
    });

    const response = await fetchWithRetry<DetailImageResponse>(url);
    return normalizeItems(response.response.body.items?.item);
  } catch (error) {
    console.error("이미지 목록 조회 실패:", error);
    throw error;
  }
}

/**
 * 반려동물 동반 여행 정보 조회
 *
 * @param params - 조회 파라미터
 * @param params.contentId - 콘텐츠 ID (필수)
 * @returns 반려동물 정보
 *
 * @example
 * ```ts
 * const petInfo = await getDetailPetTour({ contentId: "125266" });
 * ```
 */
export async function getDetailPetTour(params: {
  contentId: string;
}): Promise<PetTourInfo | null> {
  try {
    const { contentId } = params;

    if (!contentId) {
      throw new Error("콘텐츠 ID는 필수입니다.");
    }

    const url = buildApiUrl("/detailPetTour2", {
      contentId,
    });

    const response = await fetchWithRetry<DetailPetTourResponse>(url);
    const items = normalizeItems(response.response.body.items?.item);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("반려동물 정보 조회 실패:", error);
    throw error;
  }
}

