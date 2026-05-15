import type { ChartData, ChartOptions } from "chart.js";
import type { components } from "@/types/schema";

export type GraphPoint = {
    label: string;
    minuteKey: string;
    timestamp: string;
    rawValue: string;
    value: number;
};

export function formatGraphLabel(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

export function formatGraphTimestampWithSeconds(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(date);
}

export function formatGraphMinuteKey(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return String(Math.floor(date.getTime() / 60000));
}

export function getGraphYAxisBounds(points: GraphPoint[]) {
    const values = points.map((point) => point.value).filter((value) => Number.isFinite(value));

    if (!values.length) {
        return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;
    const padding = span > 0 ? span * 0.35 : Math.max(Math.abs(min), Math.abs(max), 1) * 0.35;

    return {
        min: Math.floor(min - padding),
        max: Math.ceil(max + padding)
    };
}

export function getGraphValueSymbol(points: GraphPoint[]) {
    const point = points.find((entry) => Number.isFinite(entry.value));

    if (!point) {
        return "";
    }

    const match = point.rawValue.match(/^\s*[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?\s*(.*)$/);

    return match?.[1]?.trim() ?? "";
}

export function buildGraphXAxisLabels(points: GraphPoint[]) {
    return points.map((point, index, entries) => {
        if (index === 0) {
            return point.label;
        }

        const previousPoint = entries[index - 1];

        if (!previousPoint) {
            return point.label;
        }

        return point.minuteKey !== previousPoint.minuteKey ? point.label : "";
    });
}

export function shouldShowGraphXAxisMark(points: GraphPoint[], index: number) {
    if (index === 0) {
        return true;
    }

    const currentPoint = points[index];
    const previousPoint = points[index - 1];

    if (!currentPoint || !previousPoint) {
        return true;
    }

    return currentPoint.minuteKey !== previousPoint.minuteKey;
}

export function buildGraphChartData(nodeName: string, points: GraphPoint[]): ChartData<"line"> {
    return {
        labels: buildGraphXAxisLabels(points),
        datasets: [
            {
                label: nodeName,
                data: points.map((point) => point.value),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.16)",
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#2563eb",
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true
            }
        ]
    };
}

export function buildGraphChartOptions(points: GraphPoint[], valueSymbol: string): ChartOptions<"line"> {
    const yAxisBounds = getGraphYAxisBounds(points);

    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title(context) {
                        const point = points[context[0]?.dataIndex ?? -1];

                        if (!point) {
                            return "";
                        }

                        return formatGraphTimestampWithSeconds(point.timestamp);
                    },
                    label(context) {
                        const parsed = context.parsed.y;

                        if (parsed === null) {
                            return "";
                        }

                        return `${parsed.toFixed(1)}${valueSymbol ? ` ${valueSymbol}` : ""}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: false
                },
                grid: {
                    color(context) {
                        return shouldShowGraphXAxisMark(points, context.index)
                            ? "rgba(148, 163, 184, 0.12)"
                            : "rgba(148, 163, 184, 0)";
                    }
                }
            },
            y: {
                min: yAxisBounds?.min,
                max: yAxisBounds?.max,
                ticks: {
                    callback(value) {
                        return `${Number(value).toFixed(1)}${valueSymbol ? ` ${valueSymbol}` : ""}`;
                    }
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.12)"
                }
            }
        }
    };
}

export function toGraphPoint(entry: components["schemas"]["ValueDto"]): GraphPoint | null {
    const parsed = Number.parseFloat(entry.value);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return {
        label: formatGraphLabel(entry.createdAt),
        minuteKey: formatGraphMinuteKey(entry.createdAt),
        timestamp: entry.createdAt,
        rawValue: entry.value,
        value: parsed
    };
}
