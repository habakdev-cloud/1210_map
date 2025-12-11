/**
 * @file detail-pet-tour.tsx
 * @description 관광지 반려동물 동반 여행 정보 섹션 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 * 반려동물 동반 가능 여부, 크기 제한, 입장 가능 장소, 추가 요금, 전용 시설 등을 표시합니다.
 *
 * 주요 기능:
 * - 반려동물 동반 가능 여부 표시
 * - 반려동물 크기 제한 정보
 * - 반려동물 입장 가능 장소 (실내/실외)
 * - 반려동물 동반 추가 요금
 * - 반려동물 전용 시설 정보
 * - 주차장 정보 (반려동물 하차 공간)
 * - 아이콘 및 뱃지 디자인
 * - 주의사항 강조 표시
 * - 정보 없는 항목 숨김 처리
 *
 * @see {@link /docs/PRD.md} - MVP 2.5 반려동물 동반 여행
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { Dog, Ruler, MapPin, DollarSign, Info, Car, AlertTriangle } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  petInfo: PetTourInfo | null;
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
 * 반려동물 크기 뱃지 생성
 */
function getPetSizeBadge(size?: string): string | null {
  if (!size) return null;

  const sizeLower = size.toLowerCase();
  if (sizeLower.includes("소형") || sizeLower.includes("small")) {
    return "소형견 가능";
  }
  if (sizeLower.includes("중형") || sizeLower.includes("medium")) {
    return "중형견 가능";
  }
  if (sizeLower.includes("대형") || sizeLower.includes("large")) {
    return "대형견 가능";
  }
  return null;
}

/**
 * 관광지 반려동물 동반 여행 정보 섹션 컴포넌트
 */
export default function DetailPetTour({ petInfo }: DetailPetTourProps) {
  // 반려동물 정보가 없으면 섹션 자체를 숨김
  if (!petInfo) {
    return null;
  }

  // 표시할 정보가 있는지 확인
  const hasInfo =
    petInfo.chkpetleash ||
    petInfo.chkpetsize ||
    petInfo.chkpetplace ||
    petInfo.chkpetfee ||
    petInfo.petinfo ||
    petInfo.parking;

  if (!hasInfo) {
    return null;
  }

  const petSizeBadge = getPetSizeBadge(petInfo.chkpetsize);
  const isPetAllowed = petInfo.chkpetleash && petInfo.chkpetleash.toLowerCase().includes("가능");

  return (
    <section
      className="container max-w-7xl mx-auto px-4 py-8"
      aria-label="반려동물 동반 여행 정보"
    >
      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Dog className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-foreground">반려동물 동반 여행 정보</h2>
        </div>

        {/* 반려동물 동반 가능 여부 뱃지 */}
        {petInfo.chkpetleash && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {isPetAllowed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Dog className="w-3 h-3 mr-1" aria-hidden="true" />
                반려동물 동반 가능
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                반려동물 동반 제한
              </span>
            )}
            {petSizeBadge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-border bg-background">
                {petSizeBadge}
              </span>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* 반려동물 동반 가능 여부 상세 */}
          {petInfo.chkpetleash && (
            <InfoItem
              icon={<Dog className="w-5 h-5" />}
              label="반려동물 동반 여부"
              value={petInfo.chkpetleash}
            />
          )}

          {/* 반려동물 크기 제한 */}
          {petInfo.chkpetsize && (
            <InfoItem
              icon={<Ruler className="w-5 h-5" />}
              label="반려동물 크기 제한"
              value={petInfo.chkpetsize}
            />
          )}

          {/* 입장 가능 장소 (실내/실외) */}
          {petInfo.chkpetplace && (
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              label="입장 가능 장소"
              value={petInfo.chkpetplace}
            />
          )}

          {/* 반려동물 동반 추가 요금 */}
          {petInfo.chkpetfee && (
            <InfoItem
              icon={<DollarSign className="w-5 h-5" />}
              label="반려동물 동반 추가 요금"
              value={petInfo.chkpetfee}
            />
          )}

          {/* 주차장 정보 (반려동물 하차 공간) */}
          {petInfo.parking && (
            <InfoItem
              icon={<Car className="w-5 h-5" />}
              label="주차장 정보"
              value={petInfo.parking}
            />
          )}

          {/* 반려동물 전용 시설 정보 */}
          {petInfo.petinfo && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-2">반려동물 정보</p>
                  <p className="text-base text-foreground break-words whitespace-pre-line">
                    {petInfo.petinfo}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 주의사항 강조 */}
        {isPetAllowed && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                  주의사항
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  반려동물과 함께 방문하실 때는 목줄 착용, 배변 봉투 준비 등 반려동물 매너를 지켜주세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

