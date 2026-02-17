<template>
    <div class="category">
        <p class="label">{{ category.name }}</p>
        <div class="nodes">
            <Node v-for="node in nodes" :node="node"></Node>
        </div>
    </div>
    <button @click="createNode">Create Node</button>

</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import Node from './Node.vue';
import type { components } from '@/types/schema';
import client from '@/lib/client';

let props = defineProps<{
    category: components["schemas"]["CategoryDto"]
}>();


const nodes: Ref<components["schemas"]["NodeDto"][]> = ref([]);

onMounted(async () => {
    const request = await client.GET("/categories/{categoryId}/nodes", { params: { path: { categoryId: props.category.id } } });
    if (request.data) {
        nodes.value = request.data.nodes;
    }
})


async function createNode() {

    const topicRequest = await client.POST("/topics", {
        body: { mqttTopic: "121", name: "122" },
    });

    if (!topicRequest.data) {
        return;
    }

    const request = await client.POST("/categories/{categoryId}/nodes", { params: { path: { categoryId: props.category.id } }, body: { name: "12", topicId: topicRequest.data.id } });

    if (request.data) {
        nodes.value.push(request.data);
    }
}

</script>

<style scoped>
.category {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: lightcoral;
}

.label {}

.nodes {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 15rem));
    padding: 0.5rem;
    gap: 0.5rem;
    background-color: lightblue;
}
</style>
