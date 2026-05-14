<template>
    <main class="home-page">
        <header class="page-header">
            <div>
                <p class="eyebrow">MQTT Client</p>
                <h1 class="title">Categories</h1>
                <p class="meta">{{ categories.length }} categories · Status {{ health }}</p>
            </div>

            <NewCategoryModal v-model="categories" />
        </header>

        <section class="category-list">
            <Category v-for="category in categories" :key="category.id" :category="category" v-model="categories" />
        </section>
    </main>
</template>

<script setup lang="ts">
    import Category from "@/components/Category.vue";
    import NewCategoryModal from "@/components/modal/category/Modal.vue";
    import client from "@/lib/client";
    import type { components } from "@/types/schema";
    import { onMounted, ref, type Ref } from "vue";

    const categories: Ref<components["schemas"]["CategoryDto"][]> = ref([]);
    const health: Ref<string> = ref("Loading");

    onMounted(async () => {
        const data = await client.GET("/categories");
        if (data.data) {
            categories.value = data.data.categories;
        }

        const data2 = await client.GET("/health")
        if (data2) {
            health.value = data2.data?.status ?? "Bad"
        }
    });
</script>

<style scoped>
    .home-page {
        min-height: 100vh;
        width: min(1360px, calc(100% - 32px));
        margin: 0 auto;
        padding: 24px 0 40px;
    }

    .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
    }

    .eyebrow {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
    }

    .title {
        margin: 4px 0 0;
        font-size: 1.75rem;
        font-weight: 800;
        line-height: 1.1;
        color: #0f172a;
    }

    .meta {
        margin: 6px 0 0;
        font-size: 0.92rem;
        color: #475569;
    }

    .category-list {
        display: grid;
        gap: 16px;
    }

    @media (max-width: 640px) {
        .home-page {
            width: min(100%, calc(100% - 20px));
            padding-top: 16px;
        }

        .page-header {
            align-items: stretch;
            flex-direction: column;
        }
    }

    @media (prefers-color-scheme: dark) {
        .eyebrow {
            color: #94a3b8;
        }

        .title {
            color: #e2e8f0;
        }

        .meta {
            color: #cbd5e1;
        }
    }
</style>
