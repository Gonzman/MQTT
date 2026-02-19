<template>

    <Modal v-model="categories"></Modal>

    <Category v-for="category in categories" :category="category" v-model="categories"></Category>

    {{ categories.length }}
</template>

<script setup lang="ts">
import Category from '@/components/Category.vue';
import Modal from '@/components/modal/category/modal.vue';
import client from '@/lib/client';
import dataManager from '@/lib/dataManager';
import type { CategoryDto } from '@/models/category';
import type { components } from '@/types/schema';
import { onMounted, ref, type Ref } from 'vue';

const categories: Ref<components["schemas"]["CategoryDto"][]> = ref([])

const test = dataManager

onMounted(async () => {
    const data = await client.GET("/categories");
    if (data.data) {
        categories.value = data.data.categories;
    }
})

async function createCategroy() {
    const test = await client.POST("/categories", { body: { name: "test" } })

    console.log(test);
    if (test.data) {
        categories.value.push(test.data);
    }
}
</script>

<style scoped></style>
