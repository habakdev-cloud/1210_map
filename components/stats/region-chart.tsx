/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트 (Bar Chart)
 *
 * 통계 대시보드에서 지역별 관광지 개수를 Bar Chart로 시각화합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 표시 (Bar Chart)
 * 2. 상위 10개 지역 표시
 * 3. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 4. 호버 시 정확한 개수 표시 (Tooltip)
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 * 7. 로딩 상태 (Skeleton UI)
 * 8. 에러 처리
 * 9. 접근성 (ARIA 라벨, 키보드 네비게이션)
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 요구사항 (2.6.1절)
 * @see {@link /docs/DESIGN.md} - 디자인 시스템 가이드
 */

"use client";

import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegionStats } from "@/lib/types/stats";

/**
 * 지역별 차트 데이터 타입
 */
interface RegionChartData extends RegionStats {
  fill?: string;
}

/**
 * 지역별 차트 컴포넌트 Props
 */
interface RegionChartProps {
  data: RegionStats[];
}

/**
 * 차트 색상 설정 (chart-1 ~ chart-5 CSS 변수 활용)
 */
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

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
 * 지역별 분포 차트 컴포넌트
 *
 * @param props - 차트 Props
 * @param props.data - 지역별 통계 데이터
 */
export default function RegionChart({ data }: RegionChartProps) {
  const router = useRouter();

  // 상위 10개 지역만 표시
  const topRegions = data.slice(0, 10);

  // 차트 데이터 준비 (색상 추가)
  const chartData: RegionChartData[] = topRegions.map((region, index) => ({
    ...region,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // 바 클릭 핸들러
  const handleBarClick = (data: RegionChartData) => {
    // 해당 지역의 관광지 목록 페이지로 이동
    router.push(`/?areaCode=${data.code}`);
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
      aria-label="지역별 관광지 분포 차트"
    >
      <ChartContainer config={chartConfig} className="h-[400px] md:h-[500px]">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString("ko-KR")}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) {
                return null;
              }

              const data = payload[0].payload as RegionChartData;
              return (
                <ChartTooltipContent
                  label={data.name}
                  payload={[
                    {
                      name: "관광지 개수",
                      value: data.count,
                      color: data.fill || CHART_COLORS[0],
                    },
                  ]}
                  formatter={(value) => [
                    `${value?.toLocaleString("ko-KR")}개`,
                    "관광지 개수",
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
            style={{ cursor: "pointer" }}
            onClick={(data) => {
              if (data?.payload) {
                handleBarClick(data.payload as RegionChartData);
              }
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

/**
 * 지역별 분포 차트 로딩 스켈레톤 컴포넌트
 */
export function RegionChartSkeleton() {
  return (
    <div className="p-6 border border-border rounded-lg bg-card min-h-[400px] md:min-h-[500px]">
      <Skeleton className="h-[400px] md:h-[500px] w-full" />
    </div>
  );
}

