/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보를 표시하는 컴포넌트입니다.
 * 운영시간, 휴무일, 이용요금, 주차, 수용인원, 체험 프로그램, 유모차/반려동물 동반 가능 여부 등을 표시합니다.
 *
 * 주요 기능:
 * - 운영시간/개장시간 표시
 * - 휴무일 표시
 * - 이용요금 표시
 * - 주차 가능 여부 표시
 * - 수용인원 표시
 * - 체험 프로그램 표시
 * - 유모차/반려동물 동반 가능 여부 표시
 * - 정보 없는 항목 숨김 처리
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.2 운영 정보 섹션
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Users,
  Sparkles,
  Baby,
  Dog,
  Phone,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  intro: TourIntro | null;
}

/**
 * 정보 항목 컴포넌트
 */
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-base text-foreground break-words whitespace-pre-line">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 */
export default function DetailIntro({ intro }: DetailIntroProps) {
  // 운영 정보가 없으면 섹션 자체를 숨김
  if (!intro) {
    return null;
  }

  // 표시할 정보가 있는지 확인
  const hasInfo =
    intro.usetime ||
    intro.restdate ||
    intro.infocenter ||
    intro.infotext ||
    intro.parking ||
    intro.accomcount ||
    intro.expguide ||
    intro.chkbabycarriage ||
    intro.chkpet;

  if (!hasInfo) {
    return null;
  }

  return (
    <section
      className="container max-w-7xl mx-auto px-4 py-8"
      aria-label="운영 정보"
    >
      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">운영 정보</h2>

        <div className="space-y-4">
          {/* 운영시간 */}
          {intro.usetime && (
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="운영시간"
              value={intro.usetime}
            />
          )}

          {/* 휴무일 */}
          {intro.restdate && (
            <InfoItem
              icon={<Calendar className="w-5 h-5" />}
              label="휴무일"
              value={intro.restdate}
            />
          )}

          {/* 문의처 */}
          {intro.infocenter && (
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label="문의처"
              value={intro.infocenter}
            />
          )}

          {/* 이용요금 (타입별 필드가 다를 수 있음, infotext 또는 기타 필드 확인 필요) */}
          {intro.infotext && (
            <InfoItem
              icon={<DollarSign className="w-5 h-5" />}
              label="이용요금"
              value={intro.infotext}
            />
          )}

          {/* 주차 가능 여부 */}
          {intro.parking && (
            <InfoItem
              icon={<Car className="w-5 h-5" />}
              label="주차"
              value={intro.parking}
            />
          )}

          {/* 수용인원 */}
          {intro.accomcount && (
            <InfoItem
              icon={<Users className="w-5 h-5" />}
              label="수용인원"
              value={intro.accomcount}
            />
          )}

          {/* 체험 프로그램 */}
          {intro.expguide && (
            <InfoItem
              icon={<Sparkles className="w-5 h-5" />}
              label="체험 프로그램"
              value={intro.expguide}
            />
          )}

          {/* 유모차 동반 가능 여부 */}
          {intro.chkbabycarriage && (
            <InfoItem
              icon={<Baby className="w-5 h-5" />}
              label="유모차 동반"
              value={intro.chkbabycarriage}
            />
          )}

          {/* 반려동물 동반 가능 여부 */}
          {intro.chkpet && (
            <InfoItem
              icon={<Dog className="w-5 h-5" />}
              label="반려동물 동반"
              value={intro.chkpet}
            />
          )}
        </div>
      </div>
    </section>
  );
}

