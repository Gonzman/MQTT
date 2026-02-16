<template>

    <button @click="createCategroy"></button>

    <Category v-for="category in categories" :category="category"></Category>

    {{ categories.length }}
</template>

<script setup lang="ts">
import Category from '@/components/Category.vue';
import client from '@/lib/client';
import type { CategoryDto } from '@/models/category';
import type { components } from '@/types/schema';
import { onMounted, ref, type Ref } from 'vue';

const categories: Ref<components["schemas"]["CategoryDto"][]> = ref([])

onMounted(async () => {
    const data = await client.GET("/categories");
    if (data.data) {
        categories.value = data.data.categories;
    }
})

async function createCategroy() {
    const test = await client.POST("/categories")

    console.log(test);
}
</script>

<style scoped></style>
