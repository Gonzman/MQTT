<template>
    <div class="node">
        <button @click="deleteNode">x</button>
        <p class="label">{{ node.name }}</p>
        <p class="value">21.6°C</p>
    </div>
</template>

<script setup lang="ts">
import client from '@/lib/client';
import type { components } from '@/types/schema';

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
</script>

<style scoped>
.node {
    display: flex;
    flex-direction: column;
    background-color: lightgray;
    padding: 0.5rem;
    border-radius: 1rem;
}

.label {}

.value {}
</style>
