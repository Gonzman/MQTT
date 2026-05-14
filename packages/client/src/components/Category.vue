<template>
    <UCard class="category-card">
        <div class="category-header">
            <div class="title">
                <p class="label">{{ category.name }}</p>
                <div class="meta">{{ nodes.length }} node<span v-if="nodes.length !== 1">s</span></div>
            </div>

            <div class="actions">
                <Modal :category="category.id" v-model="nodes"></Modal>
                <UTooltip text="Delete Category">
                    <UButton @click="deleteCategory" aria-label="Delete category" color="error" icon="lucide:trash-2" />
                </UTooltip>
            </div>
        </div>

        <div class="nodes">
            <Node v-for="node in nodes" :key="node.id" :node="node" v-model="nodes" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
    import { onMounted, ref, type Ref } from "vue";
    import Node from "./Node.vue";
    import type { components } from "@/types/schema";
    import client from "@/lib/client";
    import Modal from "./modal/node/Modal.vue";

    let props = defineProps<{
        category: components["schemas"]["CategoryDto"];
    }>();

    let model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true });

    const nodes: Ref<components["schemas"]["NodeDto"][]> = ref([]);

    onMounted(async () => {
        const request = await client.GET("/categories/{categoryId}/nodes", {
            params: { path: { categoryId: props.category.id } }
        });
        if (request.data) {
            nodes.value = request.data.nodes;
        }
    });

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
        border: 1px solid rgba(15, 23, 42, 0.06);
        background: transparent;
        box-shadow: none;
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
        .category-card {
            border-color: rgba(255, 255, 255, 0.04);
        }

        .label {
            color: #e6edf3;
        }

        .meta {
            color: #9aa3ad;
        }

        .nodes :deep(.node-card) {
            border-color: rgba(255, 255, 255, 0.02);
        }
    }
</style>
