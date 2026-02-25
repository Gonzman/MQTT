<template>
    <UCard class="node-card">
        <template #header>
            <div class="header">
                <div class="info">
                    <div class="name">{{ node.name }}</div>
                    <div class="meta" v-if="node.topicId">{{ node.topicId.slice(0, 8) }}</div>
                </div>
                <UButton class="btn-delete" @click="deleteNode" aria-label="Delete node" color="error">×</UButton>
            </div>
        </template>
        <template #default>
            <div class="value" v-for="value in data">{{ value.id }}</div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import client from '@/lib/client';
import dataManager from '@/lib/dataManager';
import type { components } from '@/types/schema'
import { ref, onMounted } from 'vue';

let data = ref<components["schemas"]["ValueDto"][]>()

const props = defineProps<{
    node: components["schemas"]["NodeDto"]
}>();

const model = defineModel<components["schemas"]["NodeDto"][]>({ required: true })

async function deleteNode() {
    const request = await client.DELETE("/categories/{categoryId}/nodes/{nodeId}", { params: { path: { categoryId: props.node.categoryId, nodeId: props.node.id } } })

    if (!request.response.ok) {
        return;
    }

    model.value = model.value.filter((x) => x.id != props.node.id)

}

onMounted(async () => {
    const result = await dataManager.listenForData(props.node.topicId);
    if (result) {
        data = result;
    }
})
</script>

<style scoped>
.node-card {
    padding: 10px;
    border-radius: 10px;
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

.btn-delete {
    background: transparent;
    border: none;
    color: #9ca3af;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 4px 6px;
    border-radius: 6px;
    cursor: pointer;
}

.btn-delete:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.04);
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

    .name {
        color: #e6edf3;
    }

    .meta {
        color: #9aa3ad;
    }

    .btn-delete {
        color: #9aa3ad;
    }

    .btn-delete:hover {
        background: rgba(239, 68, 68, 0.12);
        color: #fecaca;
    }

    .value {
        color: #d1d5db;
    }
}
</style>
