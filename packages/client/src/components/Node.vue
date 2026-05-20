<template>
    <UModal :title="node.name" description="Live readings and graph history." :ui="{ content: 'max-w-7xl' }">
        <UCard class="surface-card node-card" :class="{ 'is-dragging': isDragging }" draggable="true" @dragstart.stop="
            startNodeDrag(
                $event,
                props.node.id,
                props.node.categoryId,
                props.node.name,
                props.node.topicId ? props.node.topicId.slice(0, 8) : undefined
            )
            " @dragend="clearDragState" @dragover.stop.prevent="handleDragOver">
            <template #header>
                <div class="header">
                    <div class="info">
                        <UTooltip :text="node.name">
                            <div class="name">{{ node.name }}</div>
                        </UTooltip>
                        <div class="meta" v-if="node.topicId">{{ node.topicId.slice(0, 8) }}</div>
                    </div>
                    <div class="actions" @dragstart.stop.prevent>
                        <Rename label="Node" title="Rename the Node" description="Change the node name."
                            tooltip="Rename Node" :name="node.name" :onUpdate="updateNode" />
                        <UTooltip text="Delete Node">
                            <UButton color="error" variant="ghost" @mousedown.stop @click.stop="deleteNode"
                                aria-label="Delete node" icon="lucide:trash-2" />
                        </UTooltip>
                    </div>
                </div>
            </template>
            <template #default>
                <div class="value">{{ data[data.length - 1]?.value ?? "No Data" }}</div>
            </template>
        </UCard>
        <template #content>
            <UCard class="surface-card graph-card">
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
    import {
        clearDragState,
        getDragState,
        getDropBefore,
        isDraggingNode,
        moveNodeToCategory,
        startNodeDrag
    } from "@/lib/dd";
    import type { components } from "@/types/schema";
    import { computed, ref, watch, onMounted, onUnmounted } from "vue";
    import NodeGraph from "./modal/node/Graph.vue";
    import Rename from "./modal/Rename.vue";

    const data = ref<components["schemas"]["ValueDto"][]>([]);
    let stopSync: (() => void) | null = null;

    const props = defineProps<{
        node: components["schemas"]["NodeDto"];
    }>();

    const model = defineModel<components["schemas"]["NodeDto"][]>({ required: true });
    const isDragging = computed(() => isDraggingNode(props.node.id));

    async function deleteNode() {
        const request = await client.DELETE("/categories/{categoryId}/nodes/{nodeId}", {
            params: { path: { categoryId: props.node.categoryId, nodeId: props.node.id } }
        });

        if (!request.response.ok) {
            return;
        }

        model.value = model.value.filter((x) => x.id !== props.node.id);
    }

    async function updateNode(name: string) {
        const request = await client.PATCH("/categories/{categoryId}/nodes/{nodeId}", {
            params: { path: { categoryId: props.node.categoryId, nodeId: props.node.id } },
            body: { name }
        });

        if (!request.response.ok) {
            return false;
        }

        const update = model.value.find((x) => x.id === props.node.id);

        if (update) {
            update.name = name;
        }

        return true;
    }

    function handleDragOver(event: DragEvent) {
        const drag = getDragState();
        const before = getDropBefore(event);

        if (!drag || drag.kind !== "node" || before === null) {
            return;
        }

        if (drag.nodeId === props.node.id && drag.categoryId === props.node.categoryId) {
            return;
        }

        moveNodeToCategory({
            nodeId: drag.nodeId,
            sourceCategoryId: drag.categoryId,
            targetCategoryId: props.node.categoryId,
            targetNodeId: props.node.id,
            before
        });
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
        padding: 5px;
        cursor: grab;
        transition:
            transform 140ms ease,
            box-shadow 140ms ease,
            opacity 140ms ease;
        user-select: none;
    }

    .node-card:active {
        cursor: grabbing;
    }

    .node-card.is-dragging {
        opacity: 0.45;
        transform: scale(0.985);
    }

    .graph-card {
        padding: 16px;
    }

    .header {
        display: flex;
        align-items: center;
    }

    .actions {
        display: flex;
        gap: 2px;
        align-items: end;
        margin-left: auto;
        flex-shrink: 0;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .name {
        font-size: 0.85rem;
        font-weight: 600;
        color: #0f172a;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .meta {
        font-size: 0.65rem;
        color: #6b7280;
    }

    .value {
        margin-top: 6px;
        font-size: 1rem;
        color: #374151;
        opacity: 0.95;
    }

    @media (prefers-color-scheme: dark) {
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
