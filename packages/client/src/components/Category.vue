<template>
    <UCard class="surface-card category-card" :class="{ 'is-dragging': isDragging }" draggable="true"
        @dragstart.self="startCategoryDrag($event, category.id, category.name)" @dragend="clearDragState"
        @dragover.stop.prevent="handleDragOver">
        <div class="category-header">
            <div class="title">
                <p class="label">{{ category.name }}</p>
                <div class="meta">{{ nodes.length }} node<span v-if="nodes.length !== 1">s</span></div>
            </div>

            <div class="actions" @dragstart.stop.prevent>
                <Modal :category="category.id" v-model="nodes"></Modal>
                <Rename :category="category" v-model="model" @mousedown.stop></Rename>
                <UTooltip text="Delete Category">
                    <UButton @mousedown.stop @click.stop="deleteCategory" aria-label="Delete category" color="error"
                        icon="lucide:trash-2" />
                </UTooltip>
            </div>
        </div>

        <div class="nodes">
            <Node v-for="node in nodes" :key="node.id" :node="node" v-model="nodes" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref } from "vue";
    import Node from "./Node.vue";
    import type { components } from "@/types/schema";
    import client from "@/lib/client";
    import Modal from "./modal/node/modal.vue";
    import {
        clearDragState,
        getDragState,
        getDropBefore,
        isDraggingCategory,
        moveCategory,
        moveNodeToCategory,
        registerNodeCollection,
        startCategoryDrag,
        unregisterNodeCollection
    } from "@/lib/dd";

    import Rename from "./modal/category/rename.vue";

    const props = defineProps<{
        category: components["schemas"]["CategoryDto"];
    }>();

    const model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true });

    const nodes = ref<components["schemas"]["NodeDto"][]>([]);
    const isDragging = computed(() => isDraggingCategory(props.category.id));

    onMounted(async () => {
        registerNodeCollection(props.category.id, nodes);

        const request = await client.GET("/categories/{categoryId}/nodes", {
            params: { path: { categoryId: props.category.id } }
        });
        nodes.value = request.data?.nodes ?? [];
    });

    onUnmounted(() => {
        unregisterNodeCollection(props.category.id, nodes);
    });

    function handleDragOver(event: DragEvent) {
        const drag = getDragState();
        const before = getDropBefore(event);

        if (!drag || before === null) {
            return;
        }

        if (drag.kind === "category") {
            if (drag.categoryId === props.category.id) {
                return;
            }

            moveCategory(model.value, drag.categoryId, props.category.id, before);
            return;
        }

        if (drag.categoryId === props.category.id) {
            return;
        }

        moveNodeToCategory({
            nodeId: drag.nodeId,
            sourceCategoryId: drag.categoryId,
            targetCategoryId: props.category.id
        });
    }

    async function deleteCategory() {
        const request = await client.DELETE("/categories/{categoryId}", {
            params: { path: { categoryId: props.category.id } }
        });
        if (!request.response.ok) {
            return;
        }

        model.value = model.value.filter((x) => x.id !== props.category.id);
    }
</script>

<style scoped>
    .category-card {
        padding: 12px;
        border-radius: 10px;
        cursor: grab;
        transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
        user-select: none;
    }

    .category-card:active {
        cursor: grabbing;
    }

    .category-card.is-dragging {
        opacity: 0.45;
        transform: scale(0.985);
    }

    .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
    }

    .title {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .label {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
    }

    .meta {
        font-size: 0.72rem;
        color: #6b7280;
    }

    .actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .nodes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
    }

    @media (prefers-color-scheme: dark) {
        .label {
            color: #e6edf3;
        }

        .meta {
            color: #9aa3ad;
        }
    }
</style>
