<script setup lang="ts">
    import type { components } from "@/types/schema";
    import Fields from "./Fields.vue";
    import { ref } from "vue";

    let model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true });
    const open = ref(false);

    function close() {
        open.value = false;
    }
</script>

<template>
    <UModal v-model:open="open" title="New Category" description="Create a new category.">
        <UButton label="New Category" icon="lucide:book-plus" />

        <template #content>
            <div class="flex items-center justify-center h-48 m-4">
                <div class="text-center">
                    <Fields v-model="model" @close="close" />
                </div>
            </div>
        </template>
    </UModal>
</template>
