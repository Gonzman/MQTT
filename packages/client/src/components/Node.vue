<template>
    <UModal :title="node.name" description="Live readings and graph history." :ui="{ content: 'max-w-7xl' }">
        <UCard class="node-card">
            <!-- Description -->
            <template #header @click="">
                <div class="header">
                    <div class="info">
                        <div class="name">{{ node.name }}</div>
                        <div class="meta" v-if="node.topicId">{{ node.topicId.slice(0, 8) }}</div>
                    </div>
                    <UTooltip text="Delete Node">
                        <UButton color="error" @click="deleteNode" aria-label="Delete node" icon="lucide:trash-2" />
                    </UTooltip>
                </div>
            </template>
            <!-- Value -->
            <template #default>
                <div class="value">{{ data[data.length - 1]?.value ?? "No Data" }}</div>
            </template>
        </UCard>
        <template #content>
            <UCard class="graph-card">
                <template #default>
                    <NodeGraph :node="node" :data="data" />
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
    import client from "@/lib/client";
    import dataManager from "@/lib/dataManager";
    import type { components } from "@/types/schema";
    import { ref, watch, onMounted, onUnmounted } from "vue";
    import NodeGraph from "./modal/node/Graph.vue";

    const data = ref<components["schemas"]["ValueDto"][]>([]);
    let stopSync: (() => void) | null = null;

    const props = defineProps<{
        node: components["schemas"]["NodeDto"];
    }>();

    const model = defineModel<components["schemas"]["NodeDto"][]>({ required: true });

    async function deleteNode() {
        const request = await client.DELETE("/categories/{categoryId}/nodes/{nodeId}", {
            params: { path: { categoryId: props.node.categoryId, nodeId: props.node.id } }
        });

        if (!request.response.ok) {
            return;
        }

        model.value = model.value.filter((x) => x.id != props.node.id);
    }

    onMounted(async () => {
        if (!props.node.topicId) {
            return;
        }

        const result = await dataManager.listenForData(props.node.topicId);
        if (result) {
            stopSync = watch(
                result,
                (next) => {
                    data.value = next;
                },
                { immediate: true, deep: true }
            );
        }
    });

    onUnmounted(() => {
        stopSync?.();
    });
</script>

<style scoped>
    .node-card {
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(15, 23, 42, 0.06);
        background: transparent;
        box-shadow: none;
    }

    .graph-card {
        padding: 20px;
        border-radius: 16px;
        border: 1px solid rgba(15, 23, 42, 0.06);
        background: transparent;
        box-shadow: none;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .name {
        font-size: 0.95rem;
        font-weight: 600;
        color: #0f172a;
        line-height: 1;
    }

    .meta {
        font-size: 0.72rem;
        color: #6b7280;
    }

    .value {
        margin-top: 8px;
        font-size: 1rem;
        color: #374151;
        opacity: 0.95;
    }

    @media (prefers-color-scheme: dark) {
        .node-card {
            border-color: rgba(255, 255, 255, 0.04);
        }

        .graph-card {
            border-color: rgba(255, 255, 255, 0.04);
        }

        .name {
            color: #e6edf3;
        }

        .meta {
            color: #9aa3ad;
        }

        .value {
            color: #d1d5db;
        }
    }
</style>
