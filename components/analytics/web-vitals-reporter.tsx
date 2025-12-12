/**
 * @file web-vitals-reporter.tsx
 * @description Web Vitals 측정 리포터 컴포넌트
 *
 * 클라이언트 사이드에서 Web Vitals를 측정하고 리포팅하는 컴포넌트입니다.
 * app/layout.tsx에 포함되어 모든 페이지에서 자동으로 측정됩니다.
 */

"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/analytics/web-vitals";

/**
 * Web Vitals 리포터 컴포넌트
 * 
 * 마운트 시 Web Vitals 측정을 시작합니다.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null;
}

