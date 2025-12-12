/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트 (Donut Chart)
 *
 * 통계 대시보드에서 타입별 관광지 개수를 Donut Chart로 시각화합니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수 표시 (Donut Chart)
 * 2. 타입별 비율 (백분율) 표시
 * 3. 타입별 개수 표시
 * 4. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 5. 호버 시 타입명, 개수, 비율 표시 (Tooltip)
 * 6. 다크/라이트 모드 지원
 * 7. 반응형 디자인
 * 8. 로딩 상태 (Skeleton UI)
 * 9. 에러 처리
 * 10. 접근성 (ARIA 라벨)
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6.2절)
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 가이드
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { TypeStats } from "@/lib/types/stats";

/**
 * 타입별 차트 데이터 타입
 */
interface TypeChartData extends TypeStats {
  percentage: number;
  fill?: string;
}

/**
 * 타입별 차트 컴포넌트 Props
 */
interface TypeChartProps {
  data: TypeStats[];
}

/**
 * CSS 변수에서 실제 색상 값을 가져오는 함수
 * recharts는 CSS 변수를 직접 사용할 수 없으므로 실제 색상 값으로 변환
 */
const getChartColor = (varName: string): string => {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 기본 색상 반환
    return "#8884d8";
  }

  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(varName).trim();
  
  if (!value) {
    return "#8884d8";
  }

  // oklch 형식을 그대로 반환 (최신 브라우저에서 지원)
  // recharts가 oklch를 지원하지 않을 수 있으므로, fallback 색상도 제공
  return value;
};

/**
 * 차트 색상 배열 가져오기 (클라이언트 사이드에서만 동작)
 */
const getChartColors = (): string[] => {
  const colors = [
    getChartColor("--chart-1"),
    getChartColor("--chart-2"),
    getChartColor("--chart-3"),
    getChartColor("--chart-4"),
    getChartColor("--chart-5"),
    getChartColor("--chart-1"),
    getChartColor("--chart-2"),
    getChartColor("--chart-3"),
  ];

  // oklch 형식이 recharts에서 작동하지 않을 수 있으므로 fallback 색상 제공
  // 다크 모드와 라이트 모드를 고려한 색상 배열
  const fallbackColors = [
    "#8884d8", // 보라색
    "#82ca9d", // 초록색
    "#ffc658", // 노란색
    "#ff7300", // 주황색
    "#00c49f", // 청록색
    "#8884d8", // 보라색
    "#82ca9d", // 초록색
    "#ffc658", // 노란색
  ];

  // oklch 형식이면 fallback 사용, 아니면 실제 값 사용
  return colors.map((color, index) => {
    if (color.startsWith("oklch(")) {
      return fallbackColors[index];
    }
    return color || fallbackColors[index];
  });
};

/**
 * 차트 설정
 */
const chartConfig = {
  count: {
    label: "관광지 개수",
    color: "hsl(var(--chart-1))",
  },
} as const;

/**
 * 타입별 분포 차트 컴포넌트
 *
 * @param props - 차트 Props
 * @param props.data - 타입별 통계 데이터
 */
export default function TypeChart({ data }: TypeChartProps) {
  const router = useRouter();
  const [chartColors, setChartColors] = useState<string[]>([
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00c49f",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ]);

  // 클라이언트 사이드에서만 색상 가져오기
  useEffect(() => {
    setChartColors(getChartColors());
  }, []);

  // 전체 개수 계산
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // 차트 데이터 준비 (비율 및 색상 추가)
  const chartData: TypeChartData[] = data.map((type, index) => ({
    ...type,
    percentage: total > 0 ? (type.count / total) * 100 : 0,
    fill: chartColors[index % chartColors.length],
  }));

  // 섹션 클릭 핸들러
  const handlePieClick = (data: TypeChartData) => {
    // 해당 타입의 관광지 목록 페이지로 이동
    router.push(`/?contentTypeId=${data.contentTypeId}`);
  };

  // 데이터가 없을 경우
  if (chartData.length === 0) {
    return (
      <div className="p-6 border border-border rounded-lg bg-card min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 border border-border rounded-lg bg-card min-h-[400px] md:min-h-[500px]"
      role="region"
      aria-label="타입별 관광지 분포 차트"
    >
      <ChartContainer config={chartConfig} className="h-[400px] md:h-[500px]">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            innerRadius={60}
            dataKey="count"
            onClick={(data) => {
              if (data) {
                handlePieClick(data as TypeChartData);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) {
                return null;
              }

              const data = payload[0].payload as TypeChartData;
              return (
                <ChartTooltipContent
                  label={data.name}
                  payload={[
                    {
                      name: "관광지 개수",
                      value: data.count,
                      color: data.fill || chartColors[0],
                    },
                    {
                      name: "비율",
                      value: `${data.percentage.toFixed(1)}%`,
                      color: data.fill || chartColors[0],
                    },
                  ]}
                  formatter={(value, name) => {
                    if (name === "비율") {
                      return [value, "비율"];
                    }
                    return [`${value?.toLocaleString("ko-KR")}개`, "관광지 개수"];
                  }}
                />
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const data = entry.payload as TypeChartData;
              return `${value} (${data.count.toLocaleString("ko-KR")}개)`;
            }}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

/**
 * 타입별 분포 차트 로딩 스켈레톤 컴포넌트
 */
export function TypeChartSkeleton() {
  return (
    <div className="p-6 border border-border rounded-lg bg-card min-h-[400px] md:min-h-[500px]">
      <Skeleton className="h-[400px] md:h-[500px] w-full rounded-full" />
    </div>
  );
}

