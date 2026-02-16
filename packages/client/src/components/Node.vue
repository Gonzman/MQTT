<template>
    <div class="node">
        <p class="label">{{ node.name }}</p>
        <p class="value">21.6°C</p>
    </div>
</template>

<script setup lang="ts">
import type { components } from '@/types/schema';

const props = defineProps<{
    node: components["schemas"]["NodeDto"]
}>();
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
