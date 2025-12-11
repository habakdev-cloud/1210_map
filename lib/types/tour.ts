/**
 * @file tour.ts
 * @description 한국관광공사 API 응답 타입 정의
 *
 * 한국관광공사 공공 API(KorService2)의 응답 데이터 구조를 정의합니다.
 * PRD.md의 5장 데이터 구조를 기반으로 작성되었습니다.
 *
 * @see {@link /docs/PRD.md} - API 명세 및 데이터 구조 참고
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID (관광지 고유 ID) */
  contentid: string;
  /** 콘텐츠타입ID (12:관광지, 14:문화시설, 15:축제/행사, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형, 10000000으로 나누어 변환) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형, 10000000으로 나누어 변환) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * 타입별로 다른 필드를 가지므로 공통 필드만 포함
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 신용카드 가능 여부 */
  chkcreditcard?: string;
  /** 경유지 (여행코스용) */
  distance?: string;
  /** 소요시간 (여행코스용) */
  taketime?: string;
  /** 주변 정보 */
  infoname?: string;
  /** 기타 정보 */
  infotext?: string;
  /** 주변 관광지 */
  subfacility?: string;
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 썸네일 이미지 URL */
  smallimageurl?: string;
  /** 이미지명 */
  imgname?: string;
  /** 이미지 순번 */
  serialnum?: string;
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

/**
 * 지역코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 상위 지역코드 (시/도 > 시/군/구) */
  rnum?: string;
}

/**
 * API 응답 헤더
 */
export interface ApiResponseHeader {
  /** 결과 코드 */
  resultCode: string;
  /** 결과 메시지 */
  resultMsg: string;
}

/**
 * API 응답 본문 (items)
 */
export interface ApiResponseBody<T> {
  /** 응답 항목 (단일 또는 배열) */
  items: {
    item: T | T[];
  };
  /** 전체 개수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
  /** 전체 결과 수 */
  totalCount?: number;
}

/**
 * API 응답 구조
 */
export interface ApiResponse<T> {
  /** 응답 헤더 */
  response: {
    /** 헤더 정보 */
    header: ApiResponseHeader;
    /** 응답 본문 */
    body: ApiResponseBody<T>;
  };
}

/**
 * 지역코드 조회 응답
 */
export type AreaCodeResponse = ApiResponse<AreaCode>;

/**
 * 지역 기반 목록 조회 응답
 */
export type AreaBasedListResponse = ApiResponse<TourItem>;

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMetadata {
  /** 현재 페이지 번호 */
  pageNo: number;
  /** 페이지당 항목 수 */
  numOfRows: number;
  /** 전체 결과 수 */
  totalCount: number;
  /** 전체 페이지 수 */
  totalPages: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginationResponse<T> {
  /** 항목 목록 */
  items: T[];
  /** 페이지네이션 메타데이터 */
  pagination: PaginationMetadata;
}

/**
 * 키워드 검색 응답
 */
export type SearchKeywordResponse = ApiResponse<TourItem>;

/**
 * 상세 정보 조회 응답
 */
export type DetailCommonResponse = ApiResponse<TourDetail>;

/**
 * 운영 정보 조회 응답
 */
export type DetailIntroResponse = ApiResponse<TourIntro>;

/**
 * 이미지 목록 조회 응답
 */
export type DetailImageResponse = ApiResponse<TourImage>;

/**
 * 반려동물 정보 조회 응답
 */
export type DetailPetTourResponse = ApiResponse<PetTourInfo>;

/**
 * Content Type ID 상수
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제/행사
  TRAVEL_COURSE: "25", // 여행코스
  LEISURE_SPORTS: "28", // 레포츠
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

/**
 * Content Type ID 타입
 */
export type ContentTypeId =
  | typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];

