<script setup lang="ts">
import type { components } from "@/types/schema";
import Fields from "./Fields.vue";
import { ref } from "vue";

const props = defineProps<{ category: string }>();

let model = defineModel<components["schemas"]["NodeDto"][]>({ required: true });
const open = ref(false);

function close() {
    open.value = false;
}
</script>

<template>
    <UModal v-model:open="open" title="New Node" description="Create a node for this category.">
        <UTooltip text="Create Node">
            <UButton color="success" icon="lucide:circle-fading-plus" />
        </UTooltip>

        <template #content>
            <div class="modal-panel">
                <div class="modal-header">
                    <p class="modal-kicker">Node</p>
                    <p class="modal-title">Create a new node</p>
                    <p class="modal-description">Set a name and pick or create a topic.</p>
                </div>

                <div class="modal-form">
                    <Fields :category="props.category" v-model="model" @close="close" />
                </div>
            </div>
        </template>
    </UModal>
</template>
