<template>
    <div>
        <NewCategoryModal v-model="categories" />
        <p>{{ categories.length }} Categories</p>
    </div>

    <Category v-for="category in categories" :category="category" v-model="categories"></Category>
</template>

<script setup lang="ts">
    import Category from "@/components/Category.vue";
    import NewCategoryModal from "@/components/modal/category/Modal.vue";
    import client from "@/lib/client";
    import type { components } from "@/types/schema";
    import { onMounted, ref, type Ref } from "vue";

    const categories: Ref<components["schemas"]["CategoryDto"][]> = ref([]);

    onMounted(async () => {
        const data = await client.GET("/categories");
        if (data.data) {
            categories.value = data.data.categories;
        }
    });
</script>

<style scoped></style>
