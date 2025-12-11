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
 * 차트 색상 설정 (chart-1 ~ chart-5 CSS 변수 활용, 8개 타입에 맞게 반복)
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
 * 타입별 분포 차트 컴포넌트
 *
 * @param props - 차트 Props
 * @param props.data - 타입별 통계 데이터
 */
export default function TypeChart({ data }: TypeChartProps) {
  const router = useRouter();

  // 전체 개수 계산
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // 차트 데이터 준비 (비율 및 색상 추가)
  const chartData: TypeChartData[] = data.map((type, index) => ({
    ...type,
    percentage: total > 0 ? (type.count / total) * 100 : 0,
    fill: CHART_COLORS[index % CHART_COLORS.length],
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
            fill="#8884d8"
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
                fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
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
                      color: data.fill || CHART_COLORS[0],
                    },
                    {
                      name: "비율",
                      value: `${data.percentage.toFixed(1)}%`,
                      color: data.fill || CHART_COLORS[0],
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

