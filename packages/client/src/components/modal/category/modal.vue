<script setup lang="ts">
import type { components } from '@/types/schema';
import Fields from './fields.vue';
import { ref } from 'vue';

let model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true })
const open = ref(false)

function close() {
    open.value = false
}

</script>

<template>
    <UModal v-model:open="open">
        <UButton label="Open">New Category</UButton>

        <template #content>
            <div class="flex items-center justify-center h-48 m-4">
                <div class="text-center">
                    <h1>New Category</h1>
                    <Fields v-model="model" @close="close" />
                </div>
            </div>
        </template>
    </UModal>
</template>