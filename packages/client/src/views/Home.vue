<template>
    <Category :category="category"></Category>
</template>

<script setup lang="ts">
import Category from '@/components/Category.vue';
import type { CategoryDto } from '@/models/category';

let category: CategoryDto = {
    id: "test-category-1",
    name: "Test Category",
};
</script>

<style scoped></style>
