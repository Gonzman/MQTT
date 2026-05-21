<template>
    <div class="modal-panel graph-panel">
        <div class="modal-header">
            <p class="modal-kicker">Overview</p>
            <p class="modal-title">{{ node.name }}</p>
            <p class="modal-description">Recent numeric values for this node.</p>
        </div>

        <div class="graph-canvas-wrap">
            <canvas ref="canvasRef" v-show="hasPlottableValues" class="graph-canvas"></canvas>
        </div>

        <div v-if="!hasPlottableValues" class="graph-empty">No numeric values available yet.</div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onBeforeUnmount, onMounted, markRaw, ref, shallowRef, watch } from "vue";
    import { Chart, registerables } from "chart.js";
    import type { components } from "@/types/schema";
    import client from "@/lib/client";
    import {
        buildGraphChartData,
        buildGraphChartOptions,
        getGraphValueSymbol,
        toGraphPoint,
        type GraphPoint
    } from "@/lib/graph";

    const dataLimit = 100;

    Chart.register(...registerables);

    const props = defineProps<{
        node: components["schemas"]["NodeDto"];
        data: components["schemas"]["ValueDto"][];
    }>();

    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const chartRef = shallowRef<Chart<"line"> | null>(null);

    const plotPoints = ref<GraphPoint[]>([]);
    let hasHydratedInitialHistory = false;
    let seenValueIds = new Set<string>();

    function addValue(entry: components["schemas"]["ValueDto"]) {
        if (seenValueIds.has(entry.id)) {
            return null;
        }

        const point = toGraphPoint(entry);

        if (!point) {
            return null;
        }

        seenValueIds.add(entry.id);
        plotPoints.value.push(point);

        while (plotPoints.value.length > dataLimit) {
            plotPoints.value.shift();
        }

        return true;
    }

    async function loadInitialPoints() {
        if (!props.node.topicId) {
            return;
        }

        const response = await client.GET("/topics/{topicId}/values", {
            params: { path: { topicId: props.node.topicId }, query: { limit: dataLimit } }
        });

        if (response.data?.values) {
            for (const entry of response.data.values) {
                addValue(entry);
            }
        }
    }

    const hasPlottableValues = computed(() => plotPoints.value.length > 0);

    function syncChart() {
        const canvas = canvasRef.value;

        if (!canvas) {
            return;
        }

        const valueSymbol = getGraphValueSymbol(plotPoints.value);
        const chartData = buildGraphChartData(props.node.name, plotPoints.value);

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
                    options: buildGraphChartOptions(plotPoints.value, valueSymbol)
                })
            );
            return;
        }

        chartRef.value.data.labels = chartData.labels;
        chartRef.value.data.datasets = chartData.datasets;
        chartRef.value.options = buildGraphChartOptions(plotPoints.value, valueSymbol);
        chartRef.value.update("none");
    }

    function appendLivePoints() {
        let hasChanges = false;

        for (const entry of props.data) {
            hasChanges = addValue(entry) || hasChanges;
        }

        if (hasChanges) {
            syncChart();
        }
    }

    watch(
        () => props.data.map((entry) => `${entry.id}:${entry.value}:${entry.createdAt}`),
        () => {
            if (!hasHydratedInitialHistory) {
                return;
            }

            appendLivePoints();
        },
        { immediate: true, flush: "post" }
    );

    onMounted(async () => {
        await loadInitialPoints();
        hasHydratedInitialHistory = true;

        appendLivePoints();
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
