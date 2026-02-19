<script setup lang="ts">
import type { components } from '@/types/schema';
import Fields from './fields.vue';
import { ref } from 'vue';

const props = defineProps<{ category: string }>();

let model = defineModel<components["schemas"]["NodeDto"][]>({ required: true })
const open = ref(false)

function close() {
    open.value = false
}

</script>

<template>
    <UModal v-model:open="open">
        <UButton label="Open">+</UButton>

        <template #content>
            <div class="flex items-center justify-center h-48 m-4">
                <div class="text-center">
                    <h1>New Node</h1>
                    <Fields :category="props.category" v-model="model" @close="close" />
                </div>
            </div>
        </template>
    </UModal>
</template>