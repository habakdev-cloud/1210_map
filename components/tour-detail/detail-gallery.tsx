/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 섹션 컴포넌트
 *
 * 관광지의 이미지 목록을 슬라이드 형태로 표시하고, 이미지 클릭 시 전체화면 모달을 제공합니다.
 *
 * 주요 기능:
 * - getDetailImage() API로 이미지 목록 조회
 * - Swiper를 사용한 이미지 슬라이드
 * - 이미지 클릭 시 전체화면 모달
 * - Next.js Image 컴포넌트로 이미지 최적화
 * - 이미지 없을 때 기본 이미지 표시
 *
 * @see {@link /docs/PRD.md} - MVP 2.4.3 이미지 갤러리
 * @see {@link /docs/DESIGN.md} - 상세페이지 레이아웃
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TourImage } from "@/lib/types/tour";

interface DetailGalleryProps {
  images: TourImage[];
  title?: string;
}

/**
 * 이미지 갤러리 컴포넌트
 */
export default function DetailGallery({
  images,
  title = "이미지 갤러리",
}: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [modalSwiperInstance, setModalSwiperInstance] =
    useState<SwiperType | null>(null);

  // 이미지가 없으면 기본 이미지 표시
  if (!images || images.length === 0) {
    return (
      <section
        className="container max-w-7xl mx-auto px-4 py-8"
        aria-label={title}
      >
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {title}
          </h2>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">
                이미지가 없습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * 이미지 클릭 핸들러
   */
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  /**
   * 모달 열기/닫기 핸들러
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedImageIndex(null);
    }
  };

  /**
   * 키보드 네비게이션 (좌우 화살표)
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!modalSwiperInstance || selectedImageIndex === null) return;

    if (e.key === "ArrowLeft") {
      modalSwiperInstance.slidePrev();
    } else if (e.key === "ArrowRight") {
      modalSwiperInstance.slideNext();
    }
  };

  return (
    <section
      className="container max-w-7xl mx-auto px-4 py-8"
      aria-label={title}
    >
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>

        {/* 메인 갤러리 슬라이드 */}
        <div
          className="relative"
          onKeyDown={(e) => {
            if (!swiperInstance) return;
            if (e.key === "ArrowLeft") {
              swiperInstance.slidePrev();
            } else if (e.key === "ArrowRight") {
              swiperInstance.slideNext();
            }
          }}
          tabIndex={0}
          role="region"
          aria-label="이미지 갤러리 (화살표 키로 네비게이션)"
        >
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            keyboard={{
              enabled: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
            onSwiper={setSwiperInstance}
            className="!pb-12"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.originimgurl || index}>
                <button
                  onClick={() => handleImageClick(index)}
                  className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`${
                    image.imgname || `이미지 ${index + 1}`
                  } 전체화면 보기`}
                >
                  <Image
                    src={image.originimgurl}
                    alt={image.imgname || `${title} 이미지 ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index === 0}
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지 표시
                      const target = e.currentTarget;
                      target.src = "/logo.png"; // 기본 이미지 경로
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 커스텀 네비게이션 버튼 */}
          <button
            className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="이전 이미지"
          >
            <ChevronLeft
              className="w-5 h-5 text-foreground"
              aria-hidden="true"
            />
          </button>
          <button
            className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="다음 이미지"
          >
            <ChevronRight
              className="w-5 h-5 text-foreground"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* 전체화면 모달 */}
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={handleOpenChange}
        >
          <DialogContent
            className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyDown}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* 모달 내부 Swiper */}
              <Swiper
                modules={[Navigation, Pagination, Keyboard]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  prevEl: ".modal-swiper-button-prev",
                  nextEl: ".modal-swiper-button-next",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                keyboard={{
                  enabled: true,
                }}
                initialSlide={selectedImageIndex ?? 0}
                onSwiper={(swiper) => {
                  setModalSwiperInstance(swiper);
                  // Swiper 초기화 후 선택된 이미지로 이동
                  if (selectedImageIndex !== null) {
                    setTimeout(() => {
                      swiper.slideTo(selectedImageIndex);
                    }, 100);
                  }
                }}
                className="!w-full !h-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={image.originimgurl || index}>
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <Image
                        src={image.originimgurl}
                        alt={image.imgname || `${title} 이미지 ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={index === selectedImageIndex}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = "/logo.png";
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 모달 네비게이션 버튼 */}
              <button
                className="modal-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="이전 이미지"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <button
                className="modal-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="다음 이미지"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>

              {/* 이미지 정보 및 카운터 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                {images[selectedImageIndex]?.imgname && (
                  <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
                    {images[selectedImageIndex].imgname}
                  </div>
                )}
                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
                  {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} /{" "}
                  {images.length}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
