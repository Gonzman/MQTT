<template>
    <div class="graph-panel">
        <div class="graph-header">
            <div>
                <div class="graph-title">{{ props.node.name }}</div>
            </div>
        </div>

        <div class="graph-canvas-wrap">
            <canvas ref="canvasRef" v-show="hasPlottableValues" class="graph-canvas"></canvas>
        </div>

        <div v-if="!hasPlottableValues" class="graph-empty">No numeric values available yet.</div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onBeforeUnmount, onMounted, markRaw, ref, shallowRef, watch } from "vue";
    import { Chart, registerables, type ChartData, type ChartOptions } from "chart.js";
    import type { components } from "@/types/schema";

    Chart.register(...registerables);

    const props = defineProps<{
        node: components["schemas"]["NodeDto"];
        data: components["schemas"]["ValueDto"][];
    }>();

    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const chartRef = shallowRef<Chart<"line"> | null>(null);

    type PlotPoint = {
        label: string;
        value: number;
    };

    const PRE_DATA_PLOT_POINTS: PlotPoint[] = [];

    function extractValueSymbol(value: string) {
        const match = value.match(/^\s*[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?\s*(.*)$/);

        if (!match || !match[1]) {
            return "";
        }

        return match[1].trim();
    }

    const valueSymbol = computed(() => {
        for (const entry of props.data) {
            if (Number.isFinite(Number.parseFloat(entry.value))) {
                return extractValueSymbol(entry.value);
            }
        }

        return "";
    });

    function formatValue(value: number) {
        return value.toFixed(1);
    }

    function getPlotPoints(): PlotPoint[] {
        const points: PlotPoint[] = [];

        for (const entry of props.data) {
            const parsed = Number.parseFloat(entry.value);

            if (!Number.isFinite(parsed)) {
                continue;
            }

            points.push({
                label: `${formatLabel(entry.createdAt)}`,
                value: parsed
            });
        }

        return [...PRE_DATA_PLOT_POINTS, ...points.slice(-10)];
    }

    const hasPlottableValues = computed(() => getPlotPoints().length > 0);

    function formatLabel(value: string) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    function buildChartData(): ChartData<"line"> {
        const points = getPlotPoints();

        return {
            labels: points.map((point) => point.label),
            datasets: [
                {
                    label: props.node.name,
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

    const chartOptions: ChartOptions<"line"> = {
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
                    label(context) {
                        const parsed = context.parsed.y;

                        if (parsed === null) {
                            return "";
                        }

                        return `${formatValue(parsed)}${valueSymbol.value ? ` ${valueSymbol.value}` : ""}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: true
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.12)"
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    callback(value) {
                        return `${formatValue(Number(value))}${valueSymbol.value ? ` ${valueSymbol.value}` : ""}`;
                    }
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.12)"
                }
            }
        }
    };

    function syncChart() {
        const canvas = canvasRef.value;

        if (!canvas) {
            return;
        }

        const chartData = buildChartData();

        if (!chartData.labels?.length) {
            chartRef.value?.destroy();
            chartRef.value = null;
            return;
        }

        if (!chartRef.value || chartRef.value.canvas !== canvas) {
            chartRef.value?.destroy();
            chartRef.value = markRaw(
                new Chart(canvas, {
                    type: "line",
                    data: chartData,
                    options: chartOptions
                })
            );
            return;
        }

        chartRef.value.data.labels = chartData.labels;
        chartRef.value.data.datasets = chartData.datasets;
        chartRef.value.update("none");
    }

    watch(
        () => props.data.map((entry) => `${entry.id}:${entry.value}:${entry.createdAt}`),
        () => {
            syncChart();
        },
        { immediate: true, flush: "post" }
    );

    onMounted(() => {
        syncChart();
    });

    onBeforeUnmount(() => {
        chartRef.value?.destroy();
        chartRef.value = null;
    });
</script>

<style lang="css">
    @import "@asset/graph.css";
</style>
