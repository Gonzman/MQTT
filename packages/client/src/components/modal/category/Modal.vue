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
            <div class="modal-panel">
                <div class="modal-header">
                    <p class="modal-kicker">Category</p>
                    <p class="modal-title">Create a new category</p>
                    <p class="modal-description">Give the category a name and save it.</p>
                </div>

                <div class="modal-form">
                    <Fields v-model="model" @close="close" />
                </div>
            </div>
        </template>
    </UModal>
</template>
