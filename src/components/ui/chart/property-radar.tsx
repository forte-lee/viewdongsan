"use client"

import { RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/"
import { convertUnitFromWon } from "@/utils/convertUnitFromWon"

interface PropertyRadarProps {
    scores: {
        price: number
        size: number
        freshness: number
        condition: number
        other: number
    }
    averages: {
        price: number
        size: number
        freshness: number
        condition: number
        other: number
    }
    rawScores?: {
        price?: number
        size?: number
        freshness?: number
        condition?: number
        other?: number
    }
    rawAverages?: {
        price?: number
        size?: number
        freshness?: number
        condition?: number
        other?: number
    }
    ranges?: {
        price?: { min: number; max: number; count: number }
        size?: { min: number; max: number; count: number }
        freshness?: { min: number; max: number; count: number }
        condition?: { min: number; max: number; count: number }
        other?: { min: number; max: number; count: number }
    }
    selectedTradeType?: "매매" | "전세" | "월세" | null
    className?: string
}

export function PropertyRadar({ scores, averages, rawScores, rawAverages, ranges, selectedTradeType, className }: PropertyRadarProps) {
    // 모든 점수는 이미 0~10 범위로 정규화되어 있음
    // tooltip에서 원본 값을 표시하기 위해 rawScores와 rawAverages도 함께 저장
    const chartData = [
        { 
            label: "금액", 
            score: scores.price, 
            avg: averages.price,
            rawScore: rawScores?.price,
            rawAvg: rawAverages?.price,
            range: ranges?.price
        },
        { 
            label: "크기", 
            score: scores.size, 
            avg: averages.size,
            rawScore: rawScores?.size,
            rawAvg: rawAverages?.size,
            range: ranges?.size
        },
        { 
            label: "신선도", 
            score: scores.freshness, 
            avg: averages.freshness,
            rawScore: rawScores?.freshness,
            rawAvg: rawAverages?.freshness,
            range: ranges?.freshness
        },
        { 
            label: "컨디션", 
            score: scores.condition, 
            avg: averages.condition,
            rawScore: rawScores?.condition,
            rawAvg: rawAverages?.condition,
            range: ranges?.condition
        },
        { 
            label: "기타", 
            score: scores.other, 
            avg: averages.other,
            rawScore: rawScores?.other,
            rawAvg: rawAverages?.other,
            range: ranges?.other
        },
    ]

    // 모든 값은 0~10 범위이므로 domain을 0~10으로 설정
    const domainMin = 0;
    const domainMax = 10;

    return (
        <ChartContainer
            className={className || "mx-auto aspect-square h-[240px]"}
            config={{}}
        >
            <RadarChart data={chartData}>
                <ChartTooltip 
                    cursor={false} 
                    content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) {
                            return null;
                        }

                        // RadarChart에서 모든 payload 아이템은 같은 chartData 항목을 참조하므로
                        // 첫 번째 아이템의 payload에서 range를 가져올 수 있습니다
                        const [firstItem] = payload;
                        // const payloadData = firstItem?.payload; // TODO: payload 데이터 사용 시 사용
                        // chartData에서 label에 해당하는 range 찾기
                        const currentDataItem = chartData.find(item => item.label === label);
                        const range = currentDataItem?.range as { min: number; max: number; count: number } | undefined;

                        return (
                            <div className="grid min-w-[10rem] items-start gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-xs shadow-xl">
                                {/* 항목명 */}
                                <div className="font-medium text-foreground mb-1">
                                    {label}
                                </div>
                                
                                {/* 매물 점수와 평균 점수 */}
                                <div className="grid gap-1.5">
                                    {payload
                                        .filter((item) => item.type !== "none")
                                        .map((item) => {
                                            const payload = item?.payload;
                                            let displayValue: string;
                                            
                                            if (payload?.rawScore !== undefined || payload?.rawAvg !== undefined) {
                                                if (item.name === "매물 점수" && payload.rawScore !== undefined) {
                                                    // 금액 항목이고 매매/전세인 경우만 읽기 쉬운 형식으로 변환 (1억, 1천만 등)
                                                    if (label === "금액" && (selectedTradeType === "매매" || selectedTradeType === "전세") && typeof payload.rawScore === "number") {
                                                        displayValue = convertUnitFromWon(payload.rawScore);
                                                    } else {
                                                        displayValue = typeof payload.rawScore === "number" 
                                                            ? payload.rawScore.toLocaleString() 
                                                            : String(item.value);
                                                    }
                                                } else if (item.name === "평균 점수" && payload.rawAvg !== undefined) {
                                                    // 금액 항목이고 매매/전세인 경우만 읽기 쉬운 형식으로 변환
                                                    if (label === "금액" && (selectedTradeType === "매매" || selectedTradeType === "전세") && typeof payload.rawAvg === "number") {
                                                        displayValue = convertUnitFromWon(payload.rawAvg);
                                                    } else {
                                                        displayValue = typeof payload.rawAvg === "number" 
                                                            ? payload.rawAvg.toLocaleString() 
                                                            : String(item.value);
                                                    }
                                                } else {
                                                    displayValue = typeof item.value === "number" ? item.value.toFixed(1) : String(item.value);
                                                }
                                            } else {
                                                displayValue = typeof item.value === "number" ? item.value.toFixed(1) : String(item.value);
                                            }

                                            return (
                                                <div key={item.dataKey} className="flex items-center gap-2">
                                                    <div 
                                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                        style={{
                                                            backgroundColor: item.name === "매물 점수" ? "#2563eb" : "#60a5fa"
                                                        }}
                                                    />
                                                    <div className="flex flex-1 justify-between gap-4">
                                                        <span className="text-muted-foreground">
                                                            {item.name === "매물 점수" ? "매물" : "평균"}
                                                        </span>
                                                        <span className="font-mono font-medium tabular-nums text-foreground">
                                                            {displayValue}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* 최대/최소/매물수 정보 */}
                                {range && (
                                    <div className="grid gap-1 mt-2 pt-2 border-t border-border/50">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">매물최대</span>
                                            <span className="font-mono font-medium tabular-nums text-foreground">
                                                {label === "금액" && (selectedTradeType === "매매" || selectedTradeType === "전세")
                                                    ? convertUnitFromWon(range.max)
                                                    : range.max.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">매물최소</span>
                                            <span className="font-mono font-medium tabular-nums text-foreground">
                                                {label === "금액" && (selectedTradeType === "매매" || selectedTradeType === "전세")
                                                    ? convertUnitFromWon(range.min)
                                                    : range.min.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">매물수</span>
                                            <span className="font-mono font-medium tabular-nums text-foreground">
                                                {range.count.toLocaleString()}개
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
                <PolarAngleAxis dataKey="label" />
                <PolarGrid />
                <PolarRadiusAxis 
                    angle={90} 
                    domain={[domainMin, domainMax]}
                    tick={false}
                />

                {/* 🔵 메인 점수 (진한 파랑) */}
                <Radar
                    name="매물 점수"
                    dataKey="score"
                    stroke="#2563eb"       // blue-600
                    strokeWidth={2}
                    fill="#2563eb"
                    fillOpacity={0.45}
                    dot={{ r: 3 }}
                />

                {/* 🔹 평균 점수 (연한 파랑) */}
                <Radar
                    name="평균 점수"
                    dataKey="avg"
                    stroke="#60a5fa"        // blue-400
                    strokeWidth={2}
                    fill="#60a5fa"
                    fillOpacity={0.25}
                    dot={{ r: 3 }}
                />
            </RadarChart>
        </ChartContainer>
    )
}
