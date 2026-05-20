<template>
    <UModal v-model:open="open" title="New Node" description="Create a node for this category.">
        <UTooltip text="Rename Category">
            <UButton aria-label="Rename category" variant="ghost" icon="lucide:wrench" @click.stop="open = true"
                @mousedown.stop style="z-index: 99999" />
        </UTooltip>

        <template #content>
            <div class="modal-panel">
                <div class="modal-header">
                    <p class="modal-kicker">Node</p>
                    <p class="modal-title">Rename the Node</p>
                    <p class="modal-description"></p>
                </div>

                <UInput v-model="name"></UInput>
                <UButton @click="update">Rename</UButton>
            </div>
        </template>
    </UModal>
</template>
<script setup lang="ts">
    import type { components } from "@/types/schema";
    import { onMounted, ref } from "vue";
    import client from "@/lib/client";

    const props = defineProps<{ node: components["schemas"]["NodeDto"] }>();
    const model = defineModel<components["schemas"]["NodeDto"][]>({ required: true });
    const open = ref(false);

    const name = ref("");

    onMounted(() => {
        name.value = props.node.name;
    });

    function update() {
        client
            .PATCH("/categories/{categoryId}/nodes/{nodeId}", {
                params: { path: { categoryId: props.node.categoryId, nodeId: props.node.id } },
                body: { name: name.value }
            })
            .then(() => {
                let update = model.value.find((x) => x.id == props.node.id);

                if (!update) return;

                update.name = name.value;
                close();
            });
    }

    function close() {
        open.value = false;
    }
</script>
