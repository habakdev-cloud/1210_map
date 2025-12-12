/**
 * @file web-vitals.ts
 * @description Web Vitals 측정 및 리포팅
 *
 * Core Web Vitals 및 기타 성능 지표를 측정하고 리포팅합니다.
 * 개발 환경에서는 콘솔에 로그를 출력하고, 프로덕션에서는 외부 서비스로 전송할 수 있습니다.
 *
 * 측정 지표:
 * - LCP (Largest Contentful Paint): 2.5초 이하 목표
 * - INP (Interaction to Next Paint): 200ms 이하 목표 (FID를 대체, 2024년부터 Core Web Vital)
 * - CLS (Cumulative Layout Shift): 0.1 이하 목표
 * - FCP (First Contentful Paint): 1.8초 이하 목표
 * - TTFB (Time to First Byte): 800ms 이하 목표
 *
 * @see {@link https://web.dev/vitals/} - Web Vitals 가이드
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";
import type { Metric } from "web-vitals";

/**
 * Web Vitals 지표 타입
 */
type WebVitalMetric = Metric;

/**
 * Web Vitals 지표를 콘솔에 로그로 출력
 */
function logMetric(metric: WebVitalMetric) {
  const { name, value, rating, id } = metric;

  // 등급에 따른 이모지
  const ratingEmoji = rating === "good" ? "✅" : rating === "needs-improvement" ? "⚠️" : "❌";
  
  // 등급에 따른 색상 (콘솔)
  const ratingColor = rating === "good" ? "green" : rating === "needs-improvement" ? "yellow" : "red";

  console.group(`%c${ratingEmoji} ${name}`, `color: ${ratingColor}; font-weight: bold;`);
  console.log(`값: ${value.toFixed(2)}${getUnit(name)}`);
  console.log(`등급: ${rating}`);
  console.log(`ID: ${id}`);
  console.groupEnd();

  // 프로덕션 환경에서 외부 서비스로 전송 (선택 사항)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && typeof window !== "undefined") {
    // TODO: Supabase 또는 다른 분석 서비스로 전송
    // sendToAnalytics(metric);
  }
}

/**
 * 지표 이름에 따른 단위 반환
 */
function getUnit(name: string): string {
  switch (name) {
    case "CLS":
      return "";
    case "FCP":
    case "LCP":
    case "INP":
    case "TTFB":
      return "ms";
    default:
      return "";
  }
}

/**
 * Web Vitals 측정 초기화
 * 
 * 클라이언트 사이드에서만 실행되어야 합니다.
 */
export function reportWebVitals() {
  if (typeof window === "undefined") {
    return;
  }

  // Core Web Vitals
  onCLS(logMetric);
  onLCP(logMetric);
  onINP(logMetric); // INP는 FID를 대체한 새로운 Core Web Vital (2024년부터)

  // 기타 성능 지표
  onFCP(logMetric);
  onTTFB(logMetric);
}

