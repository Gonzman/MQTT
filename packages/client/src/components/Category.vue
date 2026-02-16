<template>
    <div class="category">
        <p class="label">{{ category.name }}</p>
        <div class="nodes">
            <Node v-for="node in nodes" :node="node"></Node>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CategoryDto } from '@/models/category';
import Node from './Node.vue';
import type { NodeDto } from '@/models/node';

let props = defineProps<{
    category: CategoryDto
}>();

let nodes: NodeDto[] = [
    {
        id: "test-node-1",
        category_id: props.category.id,
        name: "Test Node 1",
        mqtt_topic: "test/node/1"
    },
    {
        id: "test-node-2",
        category_id: props.category.id,
        name: "Test Node 2",
        mqtt_topic: "test/node/2"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
    {
        id: "test-node-3",
        category_id: props.category.id,
        name: "Test Node 3",
        mqtt_topic: "test/node/3"
    },
];
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
